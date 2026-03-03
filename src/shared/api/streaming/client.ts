import type { StreamEvent, StreamEventType } from "@contracts/types";

interface StreamOptions {
  query: string;
  sessionId: string;
  onEvent: (event: StreamEvent) => void;
}

const decoder = new TextDecoder();
const streamEventTypes: StreamEventType[] = [
  "answer.delta",
  "evidence.ready",
  "graph.ready",
  "pharma.ready",
  "done",
  "error"
];

export async function streamChatResult({
  query,
  sessionId,
  onEvent
}: StreamOptions): Promise<void> {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, sessionId })
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

function parseSseBlock(raw: string): StreamEvent | null {
  const lines = raw.split("\n");
  const event = lines.find((line) => line.startsWith("event:"))?.replace("event:", "").trim();
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace("data:", "").trim())
    .join("");

  if (!event || !data) {
    return null;
  }

  if (!isKnownEventType(event)) {
    return null;
  }

  let parsed: Partial<StreamEvent>;
  try {
    parsed = JSON.parse(data) as Partial<StreamEvent>;
  } catch {
    return null;
  }
  if (
    parsed.type !== event ||
    typeof parsed.seq !== "number" ||
    typeof parsed.sessionId !== "string" ||
    typeof parsed.timestamp !== "string" ||
    typeof parsed.payload !== "object" ||
    parsed.payload === null
  ) {
    return null;
  }

  return parsed as StreamEvent;
}

function isKnownEventType(value: string): value is StreamEventType {
  return streamEventTypes.includes(value as StreamEventType);
}
