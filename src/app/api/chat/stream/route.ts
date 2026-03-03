import type { QueryRequest, StreamEvent } from "@contracts/types";
import { getOrCreateMockSession } from "@/auth";
import { normalizeLanguage } from "@/shared/language/language-config";
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
  const language = normalizeLanguage(body.language);

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
          beginStreamQuery(userId, sessionId, query, language);
          const answerChunks =
            language === "ko"
              ? [
                  "[워크플로우] 분석을 시작합니다.\n",
                  `주요 질의 초점: ${query}.\n`,
                  "[1/4 단계] 최종 보고서 컨텍스트를 작성 중입니다...\n"
                ]
              : [
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
              message:
                language === "ko"
                  ? "답변 생성에 실패했습니다(mock). 실패한 단계 옆 Retry를 눌러주세요."
                  : "Answer generation failed (mock). Click Retry next to the failed step.",
              code: "MOCK_FAIL_ANSWER"
            });
            return;
          }

          await wait(1200);
          const evidenceStepToken =
            language === "ko"
              ? "[2/4 단계] 근거 문헌을 수집 중입니다...\n"
              : "[Step 2/4] Collecting evidence...\n";
          appendAnswerToken(userId, sessionId, evidenceStepToken);
          push("answer.delta", { token: evidenceStepToken });
          await wait(700);
          const evidenceProgressToken =
            language === "ko"
              ? "문헌을 스캔하고 핵심 참고문헌을 추출하고 있습니다...\n"
              : "Scanning literature and extracting key references...\n";
          appendAnswerToken(userId, sessionId, evidenceProgressToken);
          push("answer.delta", {
            token: evidenceProgressToken
          });
          if (failStep === "evidence") {
            await wait(300);
            push("error", {
              message:
                language === "ko"
                  ? "근거 수집에 실패했습니다(mock). 실패한 단계 옆 Retry를 눌러주세요."
                  : "Evidence collection failed (mock). Click Retry next to the failed step.",
              code: "MOCK_FAIL_EVIDENCE"
            });
            return;
          }
          applyEvidence(userId, sessionId, language);
          const latestEvidence = getSession(userId, sessionId)?.evidence ?? [];
          push("evidence.ready", { references: latestEvidence });
          await wait(1200);
          const graphStepToken =
            language === "ko"
              ? "[3/4 단계] 유전자 그래프를 구성 중입니다...\n"
              : "[Step 3/4] Building gene graph...\n";
          appendAnswerToken(userId, sessionId, graphStepToken);
          push("answer.delta", { token: graphStepToken });
          await wait(700);
          const graphProgressToken =
            language === "ko"
              ? "엔티티와 신뢰도 가중 관계를 매핑하고 있습니다...\n"
              : "Mapping entities and confidence-weighted relationships...\n";
          appendAnswerToken(userId, sessionId, graphProgressToken);
          push("answer.delta", {
            token: graphProgressToken
          });
          if (failStep === "graph") {
            await wait(300);
            push("error", {
              message:
                language === "ko"
                  ? "유전자 그래프 생성에 실패했습니다(mock). 실패한 단계 옆 Retry를 눌러주세요."
                  : "Gene graph build failed (mock). Click Retry next to the failed step.",
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
          const pharmaStepToken =
            language === "ko"
              ? "[4/4 단계] 제약 리포트를 작성 중입니다...\n"
              : "[Step 4/4] Compiling pharma report...\n";
          appendAnswerToken(userId, sessionId, pharmaStepToken);
          push("answer.delta", { token: pharmaStepToken });
          await wait(700);
          const pharmaProgressToken =
            language === "ko"
              ? "파이프라인 단계 및 적응증 인사이트를 요약하고 있습니다...\n"
              : "Summarizing pipeline stage and indication-level insights...\n";
          appendAnswerToken(userId, sessionId, pharmaProgressToken);
          push("answer.delta", {
            token: pharmaProgressToken
          });
          if (failStep === "pharma") {
            await wait(300);
            push("error", {
              message:
                language === "ko"
                  ? "제약 리포트 생성에 실패했습니다(mock). 실패한 단계 옆 Retry를 눌러주세요."
                  : "Pharma report failed (mock). Click Retry next to the failed step.",
              code: "MOCK_FAIL_PHARMA"
            });
            return;
          }
          applyPharma(userId, sessionId, language);
          const latestPharma = getSession(userId, sessionId)?.pharma ?? [];
          push("pharma.ready", { items: latestPharma });

          const completionToken =
            language === "ko"
              ? "통합 최종 보고서가 준비되었습니다. Final Report, Evidence, Gene Graph, Pharma Report 탭을 확인하세요.\n"
              : "Integrated final report is ready. Review Final Report, Evidence, Gene Graph, and Pharma Report tabs.\n";
          appendAnswerToken(
            userId,
            sessionId,
            completionToken
          );
          push("answer.delta", {
            token: completionToken
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
