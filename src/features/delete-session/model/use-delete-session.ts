"use client";

import type { SessionDetail, SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { useSelectSession } from "@/features/select-session/model/use-select-session";
import { requestJson } from "@/shared/api/http/request";

export function useDeleteSession() {
  const { language } = useLanguage();
  const removeSession = useChatSessionStore((state) => state.removeSession);
  const setSessions = useChatSessionStore((state) => state.setSessions);
  const activeSession = useChatSessionStore((state) => state.activeSession);
  const setActiveSession = useChatSessionStore((state) => state.setActiveSession);
  const upsertSessionSummary = useChatSessionStore((state) => state.upsertSessionSummary);
  const { selectSession } = useSelectSession();

  const deleteSession = async (summary: SessionSummary) => {
    const wasActive = activeSession?.id === summary.id;
    try {
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        const mocks = await import("@/mocks/browser");
        await mocks.mswReady;
      }

      const response = await fetch(`/api/sessions/${summary.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        return;
      }

      // Re-sync from server first so local store cannot drift on edge cases.
      try {
        const listData = await requestJson<{ sessions: SessionSummary[] }>("/api/sessions");
        setSessions(listData.sessions ?? []);
      } catch {
        removeSession(summary.id);
      }

      const nextSessions = useChatSessionStore.getState().sessions;

      if (nextSessions.length > 0) {
        if (wasActive || !useChatSessionStore.getState().activeSession) {
          await selectSession(nextSessions[0]);
        }
        return;
      }

      // Keep one session available to avoid empty-session runtime edge cases.
      const created = await requestJson<{ session: SessionDetail }>("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ language })
      });
      setActiveSession(created.session);
      upsertSessionSummary({
        id: created.session.id,
        userId: created.session.userId,
        title: created.session.title,
        language: created.session.language,
        createdAt: created.session.createdAt,
        updatedAt: created.session.updatedAt
      });
    } catch {
      // Keep UX stable; caller does not need to handle delete exceptions.
    }
  };

  return { deleteSession };
}
