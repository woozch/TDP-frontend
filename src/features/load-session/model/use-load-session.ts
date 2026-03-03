"use client";

import { useEffect, useCallback, useState } from "react";
import type { SessionDetail, SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";

export function useLoadSession(enabled: boolean) {
  const { language } = useLanguage();
  const text = getUiText(language);
  const setSessions = useChatSessionStore((state) => state.setSessions);
  const setActiveSession = useChatSessionStore((state) => state.setActiveSession);
  const clearActiveSession = useChatSessionStore((state) => state.clearActiveSession);
  const setSessionsLoading = useChatSessionStore((state) => state.setSessionsLoading);
  const setSessionsError = useChatSessionStore((state) => state.setSessionsError);
  const setActiveSessionLoading = useChatSessionStore((state) => state.setActiveSessionLoading);

  const [retryTrigger, setRetryTrigger] = useState(0);
  const retry = useCallback(() => setRetryTrigger((c) => c + 1), []);

  const bootstrapSession = useCallback(
    async (cancelled: () => boolean) => {
      const createRes = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ language })
      });
      if (cancelled()) return;
      if (!createRes.ok) {
        clearActiveSession();
        setSessions([]);
        setSessionsError(`${text.newReport} failed.`);
        return;
      }
      const createData = (await createRes.json()) as { session: SessionDetail };
      if (cancelled()) return;
      const created = createData.session;
      setSessions([
        {
          id: created.id,
          userId: created.userId,
          title: created.title,
          language: created.language,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt
        }
      ]);
      setActiveSession(created);
    },
    [clearActiveSession, language, setActiveSession, setSessions, setSessionsError, text.newReport]
  );

  useEffect(() => {
    if (!enabled) {
      setSessions([]);
      setSessionsLoading(false);
      setSessionsError(null);
      setActiveSessionLoading(false);
      clearActiveSession();
      return;
    }

    let cancelled = false;

    const run = async () => {
      setSessionsLoading(true);
      setSessionsError(null);

      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        const mocks = await import("@/mocks/browser");
        await mocks.mswReady;
      }

      const response = await fetch("/api/sessions", { credentials: "include" });
      if (cancelled) return;
      if (!response.ok) {
        setSessionsLoading(false);
        setSessionsError(`${text.reportHistory} load failed.`);
        setSessions([]);
        return;
      }

      const data = (await response.json()) as { sessions: SessionSummary[] };
      if (cancelled) return;
      const sessions = data.sessions ?? [];
      setSessions(sessions);
      setSessionsLoading(false);

      if (sessions.length === 0) {
        await bootstrapSession(() => cancelled);
        return;
      }

      setActiveSessionLoading(true);
      const detailRes = await fetch(`/api/sessions/${sessions[0].id}`, {
        credentials: "include"
      });
      if (cancelled) return;

      if (detailRes.ok) {
        const detailData = (await detailRes.json()) as { session: SessionDetail };
        if (!cancelled) setActiveSession(detailData.session);
      } else if (detailRes.status === 404) {
        const retryRes = await fetch("/api/sessions", { credentials: "include" });
        if (cancelled) return;
        if (retryRes.ok) {
          const retryData = (await retryRes.json()) as { sessions: SessionSummary[] };
          const fresh = retryData.sessions ?? [];
          if (!cancelled) setSessions(fresh);
          if (!fresh[0]) {
            await bootstrapSession(() => cancelled);
          } else {
            const retryDetail = await fetch(`/api/sessions/${fresh[0].id}`, {
              credentials: "include"
            });
            if (!cancelled && retryDetail.ok) {
              const retryDetailData = (await retryDetail.json()) as { session: SessionDetail };
              setActiveSession(retryDetailData.session);
            } else if (!cancelled) {
              clearActiveSession();
            }
          }
        }
      } else if (!cancelled) {
        setSessionsError(`${text.finalReport} load failed.`);
        clearActiveSession();
      }
      if (!cancelled) setActiveSessionLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    retryTrigger,
    setSessions,
    setActiveSession,
    clearActiveSession,
    setSessionsLoading,
    setSessionsError,
    setActiveSessionLoading,
    bootstrapSession,
    text.finalReport,
    text.reportHistory
  ]);

  return { retry };
}
