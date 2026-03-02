import { NextResponse } from "next/server";
import { getOrCreateMockSession } from "@/auth";
import {
  deleteSession,
  getOrCreateSessionById
} from "@/shared/mocks/session-repository";

interface Params {
  params: Promise<{ id: string }>;
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
