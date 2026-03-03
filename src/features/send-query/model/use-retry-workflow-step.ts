"use client";

import type { EvidenceItem, GraphEdge, GraphNode, PharmaReportItem, TabKey } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";

type RetryStep = Exclude<TabKey, "chat">;

type RetryResponse =
  | { step: "answer"; token: string }
  | { step: "evidence"; references: EvidenceItem[] }
  | { step: "graph"; nodes: GraphNode[]; edges: GraphEdge[] }
  | { step: "pharma"; items: PharmaReportItem[] };

export function useRetryWorkflowStep() {
  const activeSession = useChatSessionStore((state) => state.activeSession);
  const appendAnswerToken = useChatSessionStore((state) => state.appendAnswerToken);
  const setEvidence = useChatSessionStore((state) => state.setEvidence);
  const setGraph = useChatSessionStore((state) => state.setGraph);
  const setPharma = useChatSessionStore((state) => state.setPharma);
  const completeStream = useChatSessionStore((state) => state.completeStream);
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
      const response = await fetch("/api/chat/retry-step", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: activeSession.id,
          step
        })
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          `Retry failed (${response.status}${detail ? `: ${detail}` : ""})`
        );
      }

      const payload = (await response.json()) as RetryResponse;

      switch (payload.step) {
        case "answer":
          appendAnswerToken(payload.token);
          completeStream();
          break;
        case "evidence":
          setEvidence(payload.references);
          break;
        case "graph":
          setGraph(payload.nodes, payload.edges);
          break;
        case "pharma":
          setPharma(payload.items);
          break;
        default:
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown retry error";
      setTabStatus(step, "error");
      setError(message);
    }
  };

  return { retryStep };
}
