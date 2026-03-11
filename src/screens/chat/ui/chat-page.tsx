"use client";

import { useState, useEffect } from "react";
import { useActiveTab } from "@/features/select-tab/model/use-active-tab";
import { useLoadSession } from "@/features/load-session/model/use-load-session";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { LeftSidebar } from "@/widgets/left-sidebar";
import { ChatWorkspace } from "@/widgets/chat-workspace";
import { ResultTabs } from "@/widgets/result-tabs";
import { HeaderSettings } from "@/widgets/header-settings";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

export function ChatPage() {
  const { activeTab } = useActiveTab();
  const { language } = useLanguage();
  const text = getUiText(language);
  const { retry } = useLoadSession(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Default sidebar open on desktop (md+), closed on mobile
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mql.matches);
    setSidebarOpen(mql.matches);
    const handler = () => {
      setIsDesktop(mql.matches);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  const sessions = useChatSessionStore((state) => state.sessions);
  const activeSession = useChatSessionStore((state) => state.activeSession);
  const sessionsLoading = useChatSessionStore((state) => state.sessionsLoading);
  const activeSessionLoading = useChatSessionStore(
    (state) => state.activeSessionLoading,
  );

  const showMainLoading =
    (sessionsLoading && sessions.length === 0) ||
    (activeSessionLoading && !activeSession && sessions.length > 0);

  return (
    <main className="flex h-screen flex-col overflow-hidden">
        <AppHeader
        leftSlot={
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label={sidebarOpen ? text.closeMenu : text.openMenu}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        }
        rightSlot={<HeaderSettings />}
        logoSize={30}
      />

      <div className="flex min-h-0 flex-1">
        {/* Overlay when sidebar is open (mobile only); render only when open so no gray flash */}
        {sidebarOpen ? (
          <button
            type="button"
            aria-label={text.closeMenu}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        {/* Desktop (md+): in-flow sidebar with width toggle; Mobile: fixed overlay with slide */}
        <div
          className={`
            flex flex-col bg-white shadow-xl dark:bg-gray-950
            min-h-0
            fixed left-0 top-12 bottom-0 z-40 w-72
            transition-[transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform
            md:static md:top-0 md:left-0 md:z-auto md:shrink-0 md:overflow-hidden md:transition-[width] md:duration-200 md:ease-out md:will-change-auto
            ${sidebarOpen ? "translate-x-0 md:w-72" : "-translate-x-full md:translate-x-0 md:w-0"}
          `}
        >
          <div className="flex min-h-0 min-w-72 flex-1 flex-col">
            <LeftSidebar
              onClose={() => setSidebarOpen(false)}
              onSessionSelect={() => {
                if (!isDesktop) setSidebarOpen(false);
              }}
              onRetryLoad={retry}
            />
          </div>
        </div>

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-6">
          <div className="min-h-0 flex-1">
            {showMainLoading ? (
              <div
                className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 dark:border-gray-700 dark:bg-gray-950"
                aria-busy="true"
                aria-live="polite"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
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
          {activeTab === "chat" ? (
            <div className="sticky bottom-0 mt-4 shrink-0 border-t border-gray-200 bg-gray-50 pt-4 dark:border-gray-700 dark:bg-gray-950/0">
              <ChatWorkspace />
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
