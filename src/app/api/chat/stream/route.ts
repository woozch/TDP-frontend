import type { QueryRequest, StreamEvent } from "@contracts/types";
import { getOrCreateMockSession } from "@/auth";
import {
  applyEvidence,
  applyGraph,
  applyPharma,
  appendAnswerToken,
  beginStreamQuery,
  getOrCreateSessionById,
  getSession
} from "@/shared/mocks/session-repository";

const encoder = new TextEncoder();
const tokenDelayMs = 420;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function POST(request: Request) {
  const login = await getOrCreateMockSession();
  const userId = login.user.email;

  const body = (await request.json()) as QueryRequest;
  const query = body.query?.trim();

  if (!query || !body.sessionId) {
    return new Response("Missing query or sessionId", { status: 400 });
  }

  // Keep stream resilient even when session list/detail and stream requests race.
  getOrCreateSessionById(userId, body.sessionId);
  const failureMatch = query.match(/\[fail:(answer|evidence|graph|pharma)\]/i);
  const failStep = failureMatch?.[1]?.toLowerCase() as
    | "answer"
    | "evidence"
    | "graph"
    | "pharma"
    | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const sessionId = body.sessionId;
      let seq = 0;

      const push = (type: StreamEvent["type"], payload: StreamEvent["payload"]) => {
        seq += 1;
        const eventEnvelope = {
          type,
          seq,
          sessionId,
          timestamp: new Date().toISOString(),
          payload
        } as StreamEvent;
        controller.enqueue(encoder.encode(`event: ${type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventEnvelope)}\n\n`));
      };

      const emit = async () => {
        try {
          beginStreamQuery(userId, sessionId, query);
          const answerChunks = [
            "[Workflow] Analysis started.\n",
            `Primary query focus: ${query}.\n`,
            "[Step 1/4] Drafting final report context...\n"
          ];

          for (const token of answerChunks) {
            await wait(tokenDelayMs);
            appendAnswerToken(userId, sessionId, token);
            push("answer.delta", { token });
          }

          if (failStep === "answer") {
            await wait(300);
            push("error", {
              message: "Answer generation failed (mock). Click Retry next to the failed step.",
              code: "MOCK_FAIL_ANSWER"
            });
            return;
          }

          await wait(1200);
          appendAnswerToken(userId, sessionId, "[Step 2/4] Collecting evidence...\n");
          push("answer.delta", { token: "[Step 2/4] Collecting evidence...\n" });
          await wait(700);
          appendAnswerToken(userId, sessionId, "Scanning literature and extracting key references...\n");
          push("answer.delta", {
            token: "Scanning literature and extracting key references...\n"
          });
          if (failStep === "evidence") {
            await wait(300);
            push("error", {
              message: "Evidence collection failed (mock). Click Retry next to the failed step.",
              code: "MOCK_FAIL_EVIDENCE"
            });
            return;
          }
          applyEvidence(userId, sessionId);
          const latestEvidence = getSession(userId, sessionId)?.evidence ?? [];
          push("evidence.ready", { references: latestEvidence });
          await wait(1200);
          appendAnswerToken(userId, sessionId, "[Step 3/4] Building gene graph...\n");
          push("answer.delta", { token: "[Step 3/4] Building gene graph...\n" });
          await wait(700);
          appendAnswerToken(userId, sessionId, "Mapping entities and confidence-weighted relationships...\n");
          push("answer.delta", {
            token: "Mapping entities and confidence-weighted relationships...\n"
          });
          if (failStep === "graph") {
            await wait(300);
            push("error", {
              message: "Gene graph build failed (mock). Click Retry next to the failed step.",
              code: "MOCK_FAIL_GRAPH"
            });
            return;
          }
          applyGraph(userId, sessionId);
          const latestGraph = getSession(userId, sessionId);
          push("graph.ready", {
            nodes: latestGraph?.graphNodes ?? [],
            edges: latestGraph?.graphEdges ?? []
          });
          await wait(1200);
          appendAnswerToken(userId, sessionId, "[Step 4/4] Compiling pharma report...\n");
          push("answer.delta", { token: "[Step 4/4] Compiling pharma report...\n" });
          await wait(700);
          appendAnswerToken(userId, sessionId, "Summarizing pipeline stage and indication-level insights...\n");
          push("answer.delta", {
            token: "Summarizing pipeline stage and indication-level insights...\n"
          });
          if (failStep === "pharma") {
            await wait(300);
            push("error", {
              message: "Pharma report failed (mock). Click Retry next to the failed step.",
              code: "MOCK_FAIL_PHARMA"
            });
            return;
          }
          applyPharma(userId, sessionId);
          const latestPharma = getSession(userId, sessionId)?.pharma ?? [];
          push("pharma.ready", { items: latestPharma });

          appendAnswerToken(
            userId,
            sessionId,
            "Integrated final report is ready. Review Final Report, Evidence, Gene Graph, and Pharma Report tabs.\n"
          );
          push("answer.delta", {
            token:
              "Integrated final report is ready. Review Final Report, Evidence, Gene Graph, and Pharma Report tabs.\n"
          });
          const completedAt = new Date().toISOString();
          await wait(200);
          push("done", { completedAt });
        } catch {
          push("error", { message: "Failed to generate stream", code: "STREAM_INTERNAL_ERROR" });
        } finally {
          controller.close();
        }
      };

      void emit();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
