"use client";

import type { GraphEdge, GraphNode, LiteratureItem, PharmaReportItem, StreamEvent, TabKey } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { requestJson } from "@/shared/api/http/request";

type RetryStep = Exclude<TabKey, "chat">;

type RetryResponse =
  | { step: "answer"; token: string }
  | { step: "literature"; references: LiteratureItem[] }
  | { step: "graph"; nodes: GraphNode[]; edges: GraphEdge[] }
  | { step: "pharma"; items: PharmaReportItem[] };

export function useRetryWorkflowStep() {
  const { language } = useLanguage();
  const activeSession = useChatSessionStore((state) => state.activeSession);
  const applyStreamEvent = useChatSessionStore((state) => state.applyStreamEvent);
  const setTabStatus = useChatSessionStore((state) => state.setTabStatus);
  const setError = useChatSessionStore((state) => state.setError);
  const clearError = useChatSessionStore((state) => state.clearError);

  const retryStep = async (step: RetryStep) => {
    if (!activeSession) {
      return;
    }

    setTabStatus(step, "loading");
    clearError();

    try {
      const payload = await requestJson<RetryResponse>("/api/chat/retry-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession.id, step, language })
      });

      const now = new Date().toISOString();
      const base = {
        seq: 0,
        sessionId: activeSession.id,
        timestamp: now
      } as const;

      const events: StreamEvent[] =
        payload.step === "answer"
          ? [
              { ...base, type: "answer.delta", payload: { token: payload.token } },
              { ...base, type: "done", payload: { completedAt: now } }
            ]
          : payload.step === "literature"
            ? [{ ...base, type: "literature.ready", payload: { references: payload.references } }]
            : payload.step === "graph"
              ? [{ ...base, type: "graph.ready", payload: { nodes: payload.nodes, edges: payload.edges } }]
              : [{ ...base, type: "pharma.ready", payload: { items: payload.items } }];

      for (const event of events) {
        applyStreamEvent(event);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown retry error";
      setTabStatus(step, "error");
      setError(message);
    }
  };

  return { retryStep };
}
