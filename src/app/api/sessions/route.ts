import { NextResponse } from "next/server";
import type { CreateSessionRequest } from "@contracts/types";
import { getOrCreateMockSession } from "@/auth";
import { createSession, listSessions } from "@/shared/mocks/session-repository";

export async function GET() {
  const session = await getOrCreateMockSession();
  const userId = session.user.email;

  return NextResponse.json({ sessions: listSessions(userId) });
}

export async function POST(request: Request) {
  const session = await getOrCreateMockSession();
  const userId = session.user.email;

  const body = (await request.json().catch(() => ({}))) as CreateSessionRequest;
  const created = createSession(userId, body.title);
  return NextResponse.json({ session: created });
}
