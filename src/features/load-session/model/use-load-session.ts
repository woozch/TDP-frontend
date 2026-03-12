"use client";

import { useEffect, useCallback, useState } from "react";
import type { SessionDetail, SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { requestJson } from "@/shared/api/http/request";

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
      let createData: { session: SessionDetail };
      try {
        createData = await requestJson<{ session: SessionDetail }>("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language })
        });
      } catch {
        if (cancelled()) return;
        clearActiveSession();
        setSessions([]);
        setSessionsError(`${text.newReport} failed.`);
        return;
      }
      if (cancelled()) return;
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

      let data: { sessions: SessionSummary[] };
      try {
        data = await requestJson<{ sessions: SessionSummary[] }>("/api/sessions");
      } catch {
        if (cancelled) return;
        setSessionsLoading(false);
        setSessionsError(`${text.reportHistory} load failed.`);
        setSessions([]);
        return;
      }
      if (cancelled) return;
      const sessions = data.sessions ?? [];
      setSessions(sessions);
      setSessionsLoading(false);

      if (sessions.length === 0) {
        await bootstrapSession(() => cancelled);
        return;
      }

      setActiveSessionLoading(true);
      let detailData: { session: SessionDetail } | null = null;
      try {
        detailData = await requestJson<{ session: SessionDetail }>(`/api/sessions/${sessions[0].id}`);
      } catch {
        detailData = null;
      }
      if (cancelled) return;

      if (detailData) {
        if (!cancelled) setActiveSession(detailData.session);
      } else {
        // Keep previous behavior: special-case 404 by re-listing sessions.
        try {
          const retryData = await requestJson<{ sessions: SessionSummary[] }>("/api/sessions");
          const fresh = retryData.sessions ?? [];
          if (!cancelled) setSessions(fresh);
          if (!fresh[0]) {
            await bootstrapSession(() => cancelled);
          } else {
            try {
              const retryDetailData = await requestJson<{ session: SessionDetail }>(
                `/api/sessions/${fresh[0].id}`
              );
              if (!cancelled) setActiveSession(retryDetailData.session);
            } catch {
              if (!cancelled) clearActiveSession();
            }
          }
        } catch {
          if (!cancelled) {
            setSessionsError(`${text.finalReport} load failed.`);
            clearActiveSession();
          }
        }
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
