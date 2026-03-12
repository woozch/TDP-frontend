"use client";

import type { SessionDetail } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { requestJson } from "@/shared/api/http/request";

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
      const data = await requestJson<{ session: SessionDetail }>("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ language })
      });
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
