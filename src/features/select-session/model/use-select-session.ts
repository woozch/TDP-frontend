"use client";

import type { SessionDetail, SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { requestJson } from "@/shared/api/http/request";

export function useSelectSession() {
  const setSessions = useChatSessionStore((state) => state.setSessions);
  const setActiveSession = useChatSessionStore((state) => state.setActiveSession);
  const setActiveSessionLoading = useChatSessionStore((state) => state.setActiveSessionLoading);
  const upsertSessionSummary = useChatSessionStore((state) => state.upsertSessionSummary);

  const selectSession = async (summary: SessionSummary) => {
    setActiveSessionLoading(true);
    try {
      const data = await requestJson<{ session: SessionDetail }>(`/api/sessions/${summary.id}`);
      setActiveSession(data.session);
      upsertSessionSummary({
        id: data.session.id,
        userId: data.session.userId,
        title: data.session.title,
        language: data.session.language,
        createdAt: data.session.createdAt,
        updatedAt: data.session.updatedAt
      });
    } catch {
      // Keep previous behavior: on failure, do not break UX.
      try {
        const listData = await requestJson<{ sessions: SessionSummary[] }>("/api/sessions");
        const sessions = listData.sessions ?? [];
        setSessions(sessions);
        if (sessions[0]) {
          const detailData = await requestJson<{ session: SessionDetail }>(
            `/api/sessions/${sessions[0].id}`
          );
          setActiveSession(detailData.session);
          upsertSessionSummary(sessions[0]);
        }
      } catch {
        // ignore
      }
    } finally {
      setActiveSessionLoading(false);
    }
  };

  return { selectSession };
}
