"use client";

import type { SessionDetail } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";

export function useCreateSession() {
  const { language } = useLanguage();
  const text = getUiText(language);
  const setActiveSession = useChatSessionStore((state) => state.setActiveSession);
  const setActiveSessionLoading = useChatSessionStore((state) => state.setActiveSessionLoading);
  const setSessionsError = useChatSessionStore((state) => state.setSessionsError);
  const upsertSessionSummary = useChatSessionStore((state) => state.upsertSessionSummary);

  const createSession = async () => {
    setActiveSessionLoading(true);
    setSessionsError(null);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ language })
      });
      if (!response.ok) {
        throw new Error(`${text.newReport} failed (${response.status})`);
      }

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
    } catch (error) {
      const message = error instanceof Error ? error.message : `${text.newReport} failed`;
      setSessionsError(message);
    } finally {
      setActiveSessionLoading(false);
    }
  };

  return { createSession };
}
