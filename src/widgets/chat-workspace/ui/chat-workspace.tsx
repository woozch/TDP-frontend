"use client";

import { useMemo } from "react";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { useSendQuery } from "@/features/send-query/model/use-send-query";

export function ChatWorkspace() {
  const { language } = useLanguage();
  const text = getUiText(language);
  const session = useChatSessionStore((state) => state.activeSession);
  const { query, setQuery, submit } = useSendQuery();
  const isMac = useMemo(
    () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform),
    []
  );

  if (!session) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        {text.noSessionFound}
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
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing) {
                return;
              }

              const shouldSend = isMac ? event.metaKey : event.shiftKey;
              if (shouldSend) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder={text.queryPlaceholder}
            rows={2}
            className="w-full resize-none rounded-xl border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          {lastIsClarifying ? (
            <p className="px-3 pb-2 text-xs text-amber-700 dark:text-amber-400">
              {text.clarificationHint}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={session.isStreaming}
          className="mb-2 mr-2 shrink-0 self-end rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200 dark:disabled:bg-gray-600 dark:disabled:text-gray-500"
        >
          {session.isStreaming ? "…" : text.send}
        </button>
      </form>
    </section>
  );
}
