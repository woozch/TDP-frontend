import { NextResponse } from "next/server";
import { getOrCreateMockSession } from "@/auth";
import {
  deleteSession,
  getOrCreateSessionById,
  updateSessionTitle
} from "@/shared/mocks/session-repository";

interface Params {
  params: Promise<{ id: string }>;
}

interface UpdateSessionRequest {
  title?: string;
}

export async function GET(_: Request, { params }: Params) {
  const login = await getOrCreateMockSession();
  const userId = login.user.email;

  const { id } = await params;
  const session = getOrCreateSessionById(userId, id);
  return NextResponse.json({ session });
}

export async function DELETE(_: Request, { params }: Params) {
  const login = await getOrCreateMockSession();
  const userId = login.user.email;

  const { id } = await params;
  getOrCreateSessionById(userId, id);
  const removed = deleteSession(userId, id);
  if (!removed) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}

export async function PATCH(request: Request, { params }: Params) {
  const login = await getOrCreateMockSession();
  const userId = login.user.email;
  const body = (await request.json().catch(() => ({}))) as UpdateSessionRequest;
  const nextTitle = body.title?.trim();

  if (!nextTitle) {
    return NextResponse.json({ message: "Missing title" }, { status: 400 });
  }

  const { id } = await params;
  getOrCreateSessionById(userId, id);
  const updated = updateSessionTitle(userId, id, nextTitle);
  if (!updated) {
    return NextResponse.json({ message: "Session not found" }, { status: 404 });
  }
  return NextResponse.json({ session: updated });
}
