import { NextResponse } from "next/server";
import { getOrCreateMockSession } from "@/auth";
import {
  applyEvidence,
  applyGraph,
  applyPharma,
  appendAnswerToken,
  getOrCreateSessionById,
  getSession
} from "@/shared/mocks/session-repository";

type RetryStep = "answer" | "evidence" | "graph" | "pharma";

interface RetryRequest {
  sessionId?: string;
  step?: RetryStep;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function POST(request: Request) {
  const login = await getOrCreateMockSession();
  const userId = login.user.email;

  const body = (await request.json().catch(() => ({}))) as RetryRequest;
  const sessionId = body.sessionId?.trim();
  const step = body.step;

  if (!sessionId || !step) {
    return NextResponse.json(
      { message: "Missing sessionId or step" },
      { status: 400 }
    );
  }

  getOrCreateSessionById(userId, sessionId);
  await wait(900);

  if (step === "answer") {
    const token = "[Retry] Final report step completed successfully.\n";
    appendAnswerToken(userId, sessionId, token);
    return NextResponse.json({ step, token });
  }

  if (step === "evidence") {
    applyEvidence(userId, sessionId);
    const references = getSession(userId, sessionId)?.evidence ?? [];
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

  applyPharma(userId, sessionId);
  const items = getSession(userId, sessionId)?.pharma ?? [];
  return NextResponse.json({ step: "pharma", items });
}
