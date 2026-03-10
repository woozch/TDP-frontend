import { NextResponse } from "next/server";
import { BACKEND_URL, isBackendConfigured } from "@/shared/config/backend";

export async function GET() {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { status: "not_configured", message: "NEXT_PUBLIC_BACKEND_URL is not set" },
      { status: 503 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json(
      { status: "unhealthy", message: `Backend responded with ${response.status}` },
      { status: 502 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "unreachable", message },
      { status: 502 }
    );
  }
}
