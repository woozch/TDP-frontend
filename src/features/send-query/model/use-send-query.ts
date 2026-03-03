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
  const appendAnswerToken = useChatSessionStore((state) => state.appendAnswerToken);
  const setEvidence = useChatSessionStore((state) => state.setEvidence);
  const setGraph = useChatSessionStore((state) => state.setGraph);
  const setPharma = useChatSessionStore((state) => state.setPharma);
  const completeStream = useChatSessionStore((state) => state.completeStream);
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
          switch (event.type) {
            case "answer.delta":
              appendAnswerToken(event.payload.token);
              break;
            case "evidence.ready":
              setEvidence(event.payload.references);
              break;
            case "graph.ready":
              setGraph(event.payload.nodes, event.payload.edges);
              break;
            case "pharma.ready":
              setPharma(event.payload.items);
              break;
            case "done":
              completeStream();
              break;
            case "error":
              setError(event.payload.message);
              break;
            default:
              break;
          }
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
