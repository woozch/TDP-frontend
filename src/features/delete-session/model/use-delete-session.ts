"use client";

import type { SessionDetail, SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useSelectSession } from "@/features/select-session/model/use-select-session";

export function useDeleteSession() {
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
      const listRes = await fetch("/api/sessions", { credentials: "include" });
      if (listRes.ok) {
        const listData = (await listRes.json()) as { sessions: SessionSummary[] };
        setSessions(listData.sessions ?? []);
      } else {
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
      const createRes = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      if (!createRes.ok) {
        return;
      }

      const created = (await createRes.json()) as { session: SessionDetail };
      setActiveSession(created.session);
      upsertSessionSummary({
        id: created.session.id,
        userId: created.session.userId,
        title: created.session.title,
        createdAt: created.session.createdAt,
        updatedAt: created.session.updatedAt
      });
    } catch {
      // Keep UX stable; caller does not need to handle delete exceptions.
    }
  };

  return { deleteSession };
}
