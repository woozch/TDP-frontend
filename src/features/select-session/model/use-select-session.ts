"use client";

import type { SessionDetail, SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";

export function useSelectSession() {
  const setSessions = useChatSessionStore((state) => state.setSessions);
  const setActiveSession = useChatSessionStore((state) => state.setActiveSession);
  const setActiveSessionLoading = useChatSessionStore((state) => state.setActiveSessionLoading);
  const upsertSessionSummary = useChatSessionStore((state) => state.upsertSessionSummary);

  const selectSession = async (summary: SessionSummary) => {
    setActiveSessionLoading(true);
    try {
      const response = await fetch(`/api/sessions/${summary.id}`, {
        credentials: "include"
      });
      if (response.status === 404) {
        const listRes = await fetch("/api/sessions", { credentials: "include" });
        if (!listRes.ok) return;
        const listData = (await listRes.json()) as { sessions: SessionSummary[] };
        const sessions = listData.sessions ?? [];
        setSessions(sessions);
        if (sessions[0]) {
          const detailRes = await fetch(`/api/sessions/${sessions[0].id}`, {
            credentials: "include"
          });
          if (detailRes.ok) {
            const detailData = (await detailRes.json()) as { session: SessionDetail };
            setActiveSession(detailData.session);
            upsertSessionSummary(sessions[0]);
          }
        }
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as { session: SessionDetail };
      setActiveSession(data.session);
      upsertSessionSummary({
        id: data.session.id,
        userId: data.session.userId,
        title: data.session.title,
        language: data.session.language,
        createdAt: data.session.createdAt,
        updatedAt: data.session.updatedAt
      });
    } finally {
      setActiveSessionLoading(false);
    }
  };

  return { selectSession };
}
