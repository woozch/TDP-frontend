import type { QueryRequest, StreamEvent } from "@contracts/types";
import { getOrCreateMockSession } from "@/auth";
import {
  applyEvidence,
  applyGraph,
  applyPharma,
  appendAnswerToken,
  beginStreamQuery,
  getSession
} from "@/shared/mocks/session-repository";

const encoder = new TextEncoder();
const tokenDelayMs = 220;

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

  const targetSession = getSession(userId, body.sessionId);
  if (!targetSession) {
    return new Response("Session not found", { status: 404 });
  }

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
            "Integrated target-discovery analysis initialized.\n",
            `Primary query focus: ${query}.\n`,
            "Evidence consensus suggests high-priority gene-target hypotheses.\n",
            "A combined score from literature support, KG topology, and model inference is now available.\n"
          ];

          for (const token of answerChunks) {
            await wait(tokenDelayMs);
            appendAnswerToken(userId, sessionId, token);
            push("answer.delta", { token });
          }

          await wait(420);
          applyEvidence(userId, sessionId);
          const latestEvidence = getSession(userId, sessionId)?.evidence ?? [];
          push("evidence.ready", { references: latestEvidence });
          await wait(420);
          applyGraph(userId, sessionId);
          const latestGraph = getSession(userId, sessionId);
          push("graph.ready", {
            nodes: latestGraph?.graphNodes ?? [],
            edges: latestGraph?.graphEdges ?? []
          });
          await wait(420);
          applyPharma(userId, sessionId);
          const latestPharma = getSession(userId, sessionId)?.pharma ?? [];
          push("pharma.ready", { items: latestPharma });

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
