"use client";

import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useSendQuery } from "@/features/send-query/model/use-send-query";

export function ChatWorkspace() {
  const session = useChatSessionStore((state) => state.activeSession);
  const { query, setQuery, submit } = useSendQuery();

  if (!session) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No session found.
      </div>
    );
  }

  const lastMessage = session.messages[session.messages.length - 1];
  const lastIsClarifying =
    lastMessage?.role === "assistant" &&
    (lastMessage.isClarifyingQuestion === true ||
      (typeof lastMessage.content === "string" && lastMessage.content.trim().endsWith("?")));

  return (
    <section>
      <form
        className="flex items-end gap-2 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="min-w-0 flex-1">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter your query or follow-up to create or update the report..."
            rows={2}
            className="w-full resize-none rounded-xl border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          {lastIsClarifying ? (
            <p className="px-3 pb-2 text-xs text-amber-700 dark:text-amber-400">
              The assistant asked for clarification. Reply above to refine the report.
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={session.isStreaming}
          className="mb-2 mr-2 shrink-0 self-end rounded-lg bg-[#f69e25] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#e58e1a] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200 dark:disabled:bg-gray-600 dark:disabled:text-gray-500"
        >
          {session.isStreaming ? "…" : "Send"}
        </button>
      </form>
    </section>
  );
}
