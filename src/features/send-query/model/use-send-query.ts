"use client";

import { useState } from "react";
import { streamChatResult } from "@/shared/api/streaming/client";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";

export function useSendQuery() {
  const [query, setQuery] = useState("");
  const { language } = useLanguage();
  const activeSession = useChatSessionStore((state) => state.activeSession);
  const startQuery = useChatSessionStore((state) => state.startQuery);
  const applyStreamEvent = useChatSessionStore((state) => state.applyStreamEvent);
  const setError = useChatSessionStore((state) => state.setError);
  const setSessionLanguage = useChatSessionStore((state) => state.setSessionLanguage);

  const submit = async () => {
    const trimmed = query.trim();
    if (!trimmed || !activeSession || activeSession.isStreaming) {
      return;
    }

    setSessionLanguage(activeSession.id, language);
    startQuery(trimmed);
    setQuery("");

    try {
      await streamChatResult({
        query: trimmed,
        sessionId: activeSession.id,
        language,
        onEvent: (event) => {
          applyStreamEvent(event);
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown stream error";
      setError(message);
    }
  };

  return {
    query,
    setQuery,
    submit
  };
}
