import type { StreamEvent, StreamEventType } from "@contracts/types";

const streamEventTypes: StreamEventType[] = [
  "answer.delta",
  "literature.ready",
  "graph.ready",
  "pharma.ready",
  "session.updated",
  "done",
  "error"
];

export function parseSseBlock(raw: string): StreamEvent | null {
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

