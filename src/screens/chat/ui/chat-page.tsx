"use client";

import { useState } from "react";
import { useLoadSession } from "@/features/load-session/model/use-load-session";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { AppLogo } from "@/shared/ui/app-logo";
import { LeftSidebar } from "@/widgets/left-sidebar";
import { ChatWorkspace } from "@/widgets/chat-workspace";
import { ResultTabs } from "@/widgets/result-tabs";
import { HeaderSettings } from "@/widgets/header-settings";

export function ChatPage() {
  const { language } = useLanguage();
  const text = getUiText(language);
  const { retry } = useLoadSession(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sessions = useChatSessionStore((state) => state.sessions);
  const activeSession = useChatSessionStore((state) => state.activeSession);
  const sessionsLoading = useChatSessionStore((state) => state.sessionsLoading);
  const activeSessionLoading = useChatSessionStore((state) => state.activeSessionLoading);

  const showMainLoading =
    (sessionsLoading && sessions.length === 0) ||
    (activeSessionLoading && !activeSession && sessions.length > 0);

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="z-40 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm dark:border-[#3a404a] dark:bg-[#171a1f]/95 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 md:hidden"
            aria-label={text.openMenu}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <AppLogo size={30} />
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">
              {text.appName}
            </h1>
          </div>
        </div>
        <HeaderSettings />
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Mobile overlay when sidebar is open */}
        {sidebarOpen ? (
          <button
            type="button"
            aria-label={text.closeMenu}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        {/* Sidebar: drawer on mobile, always visible on md+ */}
        <div
          className={`
            fixed left-0 top-12 bottom-0 z-20 flex w-72 min-h-0 flex-col bg-white shadow-xl transition-transform duration-200 ease-out dark:bg-[#171a1f]
            md:static md:top-auto md:min-h-0 md:overflow-hidden md:shadow-none md:transition-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <LeftSidebar
            onClose={() => setSidebarOpen(false)}
            onSessionSelect={() => setSidebarOpen(false)}
            onRetryLoad={retry}
          />
        </div>

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-6">
          <div className="min-h-0 flex-1">
            {showMainLoading ? (
              <div
                className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 dark:border-[#3a404a] dark:bg-[#2a2f36]"
                aria-busy="true"
                aria-live="polite"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f69e25] border-t-transparent" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sessionsLoading && sessions.length === 0
                    ? text.loadingReportHistory
                    : text.loadingReport}
                </p>
              </div>
            ) : (
              <ResultTabs />
            )}
          </div>
          <div className="sticky bottom-0 mt-4 shrink-0 border-t border-gray-200 bg-[#fafafa] pt-4 dark:border-[#3a404a] dark:bg-[#171a1f]">
            <ChatWorkspace />
          </div>
        </section>
      </div>
    </main>
  );
}
