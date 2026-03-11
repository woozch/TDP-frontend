import { NextResponse } from "next/server";
import { getOrCreateDevSession } from "@/auth";
import { normalizeLanguage } from "@/shared/language/language-config";
import {
  applyLiterature,
  applyGraph,
  applyPharma,
  appendAnswerToken,
  getOrCreateSessionById,
  getSession
} from "@/shared/mocks/session-repository";

type RetryStep = "answer" | "literature" | "graph" | "pharma";

interface RetryRequest {
  sessionId?: string;
  step?: RetryStep;
  language?: string;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function POST(request: Request) {
  const login = await getOrCreateDevSession();
  const userId = login.user.email;

  const body = (await request.json().catch(() => ({}))) as RetryRequest;
  const sessionId = body.sessionId?.trim();
  const step = body.step;
  const language = normalizeLanguage(body.language);

  if (!sessionId || !step) {
    return NextResponse.json(
      { message: "Missing sessionId or step" },
      { status: 400 }
    );
  }

  getOrCreateSessionById(userId, sessionId);
  await wait(900);

  if (step === "answer") {
    const token =
      language === "ko"
        ? "[재시도] 최종 보고서 단계가 성공적으로 완료되었습니다.\n"
        : "[Retry] Final report step completed successfully.\n";
    appendAnswerToken(userId, sessionId, token);
    return NextResponse.json({ step, token });
  }

  if (step === "literature") {
    applyLiterature(userId, sessionId, language);
    const references = getSession(userId, sessionId)?.literature ?? [];
    return NextResponse.json({ step, references });
  }

  if (step === "graph") {
    applyGraph(userId, sessionId);
    const current = getSession(userId, sessionId);
    return NextResponse.json({
      step,
      nodes: current?.graphNodes ?? [],
      edges: current?.graphEdges ?? []
    });
  }

  applyPharma(userId, sessionId, language);
  const items = getSession(userId, sessionId)?.pharma ?? [];
  return NextResponse.json({ step: "pharma", items });
}
