import { http, HttpResponse } from "msw";
import { mockReferenceDetails } from "@/shared/mocks/data";

export const handlers = [
  // Session API and /api/chat/stream are NOT mocked so they hit Next.js API (single source of truth; delete persists after refresh).

  http.get("/api/references/:id", ({ params }) => {
    const id = params.id as string;
    const detail = mockReferenceDetails[id];
    if (!detail) {
      return HttpResponse.json({ message: "Reference not found" }, { status: 404 });
    }
    return HttpResponse.json(detail);
  })
];

