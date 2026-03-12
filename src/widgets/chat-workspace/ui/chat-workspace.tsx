"use client";

import { useEffect, useMemo, useRef } from "react";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { useSendQuery } from "@/features/send-query/model/use-send-query";

export function ChatWorkspace() {
  const { language } = useLanguage();
  const text = getUiText(language);
  const { query, setQuery, submit } = useSendQuery();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isMac = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/.test(navigator.platform),
    [],
  );

  const session = useChatSessionStore((state) => state.activeSession);
  const lastMessage = session?.messages[session.messages.length - 1];
  const lastIsClarifying =
    lastMessage?.role === "assistant" &&
    (lastMessage.isClarifyingQuestion === true ||
      (typeof lastMessage.content === "string" &&
        lastMessage.content.trim().endsWith("?")));

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // 이미지처럼 입력 길이에 맞춰 자연스럽게 커지되,
    // 너무 커지지 않도록 최대 높이를 제한한다.
    el.style.height = "auto";
    const computed = window.getComputedStyle(el);
    const lineHeight = parseFloat(computed.lineHeight || "20");
    const paddingY =
      parseFloat(computed.paddingTop || "0") +
      parseFloat(computed.paddingBottom || "0");
    const maxHeight = lineHeight * 8 + paddingY; // 최대 8줄까지

    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next || lineHeight + paddingY}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    el.style.overflowX = "hidden";
  }, [query]);

  const textareaProps = {
    ref: textareaRef,
    value: query,
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      setQuery(event.target.value),
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || (event.nativeEvent as any).isComposing) {
        return;
      }

      const isModifierNewline = isMac ? event.metaKey : event.altKey;
      if (isModifierNewline) {
        event.preventDefault();
        setQuery((prev) => `${prev}\n`);
        return;
      }

      event.preventDefault();
      void submit();
    },
    placeholder: text.queryPlaceholder,
    rows: 1,
    className:
      "w-full resize-none border-0 bg-transparent px-0 py-0 text-sm leading-relaxed text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500",
  } as const;

  return (
    <section>
      {!session ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {text.noSessionFound}
        </div>
      ) : (
        <form
          className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="min-w-0 px-4 pt-3 pb-2">
            <textarea {...textareaProps} />
            {lastIsClarifying ? (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                {text.clarificationHint}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between px-2 pb-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              aria-label="Add"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={session.isStreaming}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-sm ring-1 ring-brand transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand dark:text-white dark:ring-brand"
              aria-label={text.send}
            >
              {session.isStreaming ? (
                <span className="text-lg leading-none">…</span>
              ) : (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 19V5" />
                  <path d="M6 11l6-6 6 6" />
                </svg>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
