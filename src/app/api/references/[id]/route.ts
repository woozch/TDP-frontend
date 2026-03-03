import { NextResponse } from "next/server";
import { getMockReferenceDetails } from "@/shared/mocks/data";
import { normalizeLanguage } from "@/shared/language/language-config";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const language = normalizeLanguage(searchParams.get("language"));
  const detail = getMockReferenceDetails(language)[id];
  if (!detail) {
    return NextResponse.json({ message: "Reference not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
