import type { StreamEvent } from "@contracts/types";
import type { Language } from "@/shared/language/language-config";
import { parseSseBlock } from "@/shared/api/streaming/parse-sse";

interface StreamOptions {
  query: string;
  sessionId: string;
  language: Language;
  onEvent: (event: StreamEvent) => void;
}

const decoder = new TextDecoder();

export async function streamChatResult({
  query,
  sessionId,
  language,
  onEvent
}: StreamOptions): Promise<void> {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, sessionId, language })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Failed to open stream (${response.status}${detail ? `: ${detail}` : ""})`
    );
  }

  if (!response.body) {
    throw new Error("Failed to open stream: empty response body");
  }

  const reader = response.body.getReader();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const block of events) {
      const parsed = parseSseBlock(block);
      if (parsed) {
        onEvent(parsed);
      }
    }
  }
}

