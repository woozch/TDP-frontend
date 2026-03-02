"use client";

import { useEffect } from "react";
import type { SessionDetail, SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";

export function useLoadSession(enabled: boolean) {
  const setSessions = useChatSessionStore((state) => state.setSessions);
  const setActiveSession = useChatSessionStore((state) => state.setActiveSession);
  const clearActiveSession = useChatSessionStore((state) => state.clearActiveSession);

  useEffect(() => {
    if (!enabled) {
      setSessions([]);
      clearActiveSession();
      return;
    }

    let cancelled = false;

    const load = async () => {
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        const mocks = await import("@/mocks/browser");
        await mocks.mswReady;
      }
      const response = await fetch("/api/sessions", { credentials: "include" });
      if (!response.ok) {
        if (!cancelled) {
          setSessions([]);
        }
        return;
      }
      const data = (await response.json()) as { sessions: SessionSummary[] };
      if (!cancelled) {
        const sessions = data.sessions ?? [];
        setSessions(sessions);
        if (sessions[0]) {
          const detailRes = await fetch(`/api/sessions/${sessions[0].id}`, {
            credentials: "include"
          });
          if (detailRes.ok) {
            const detailData = (await detailRes.json()) as { session: SessionDetail };
            if (!cancelled) {
              setActiveSession(detailData.session);
            }
          } else if (detailRes.status === 404 && !cancelled) {
            const retryRes = await fetch("/api/sessions", { credentials: "include" });
            if (retryRes.ok) {
              const retryData = (await retryRes.json()) as { sessions: SessionSummary[] };
              const fresh = retryData.sessions ?? [];
              setSessions(fresh);
              if (fresh[0]) {
                const retryDetail = await fetch(`/api/sessions/${fresh[0].id}`, {
                  credentials: "include"
                });
                if (retryDetail.ok && !cancelled) {
                  const retryDetailData = (await retryDetail.json()) as { session: SessionDetail };
                  setActiveSession(retryDetailData.session);
                }
              } else {
                clearActiveSession();
              }
            }
          } else {
            clearActiveSession();
          }
        } else {
          clearActiveSession();
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [clearActiveSession, enabled, setActiveSession, setSessions]);
}
