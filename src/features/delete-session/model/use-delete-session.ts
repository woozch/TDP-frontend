"use client";

import type { SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useSelectSession } from "@/features/select-session/model/use-select-session";

export function useDeleteSession() {
  const removeSession = useChatSessionStore((state) => state.removeSession);
  const activeSession = useChatSessionStore((state) => state.activeSession);
  const { selectSession } = useSelectSession();

  const deleteSession = async (summary: SessionSummary) => {
    const wasActive = activeSession?.id === summary.id;
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      const mocks = await import("@/mocks/browser");
      await mocks.mswReady;
    }
    const response = await fetch(`/api/sessions/${summary.id}`, { method: "DELETE" });
    if (!response.ok) {
      return;
    }
    removeSession(summary.id);
    if (wasActive) {
      const nextSessions = useChatSessionStore.getState().sessions;
      if (nextSessions.length > 0) {
        await selectSession(nextSessions[0]);
      }
    }
  };

  return { deleteSession };
}
