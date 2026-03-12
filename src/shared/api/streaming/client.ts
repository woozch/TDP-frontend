import type { StreamEvent, StreamEventType } from "@contracts/types";
import type { Language } from "@/shared/language/language-config";
import { streamChatResult as streamChatResultInternal } from "@/shared/api/streaming/stream-chat-result";

interface StreamOptions {
  query: string;
  sessionId: string;
  language: Language;
  onEvent: (event: StreamEvent) => void;
}

export async function streamChatResult({
  query,
  sessionId,
  language,
  onEvent
}: StreamOptions): Promise<void> {
  return await streamChatResultInternal({ query, sessionId, language, onEvent });
}
