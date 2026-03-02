"use client";

import type { SessionDetail } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";

export function useCreateSession() {
  const setActiveSession = useChatSessionStore((state) => state.setActiveSession);
  const upsertSessionSummary = useChatSessionStore((state) => state.upsertSessionSummary);

  const createSession = async () => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      const mocks = await import("@/mocks/browser");
      await mocks.mswReady;
    }
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { session: SessionDetail };
    setActiveSession(data.session);
    upsertSessionSummary({
      id: data.session.id,
      userId: data.session.userId,
      title: data.session.title,
      createdAt: data.session.createdAt,
      updatedAt: data.session.updatedAt
    });
  };

  return { createSession };
}
