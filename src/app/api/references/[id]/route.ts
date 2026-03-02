import { NextResponse } from "next/server";
import { mockReferenceDetails } from "@/shared/mocks/data";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const detail = mockReferenceDetails[id];
  if (!detail) {
    return NextResponse.json({ message: "Reference not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
