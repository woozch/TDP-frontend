"use client";

import { useState } from "react";
import { useLoadSession } from "@/features/load-session/model/use-load-session";
import { LeftSidebar } from "@/widgets/left-sidebar";
import { ChatWorkspace } from "@/widgets/chat-workspace";
import { ResultTabs } from "@/widgets/result-tabs";
import { HeaderSettings } from "@/widgets/header-settings";

const APP_NAME = "Target Discovery Platform";

export function ChatPage() {
  useLoadSession(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="z-40 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 md:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">{APP_NAME}</h1>
        </div>
        <HeaderSettings />
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Mobile overlay when sidebar is open */}
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        {/* Sidebar: drawer on mobile, always visible on md+ */}
        <div
          className={`
            fixed left-0 top-12 bottom-0 z-20 flex w-72 min-h-0 flex-col bg-white shadow-xl transition-transform duration-200 ease-out dark:bg-gray-900
            md:static md:top-auto md:min-h-0 md:overflow-hidden md:shadow-none md:transition-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <LeftSidebar
            onClose={() => setSidebarOpen(false)}
            onSessionSelect={() => setSidebarOpen(false)}
          />
        </div>

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-6">
          <div className="min-h-0 flex-1">
            <ResultTabs />
          </div>
          <div className="sticky bottom-0 mt-4 shrink-0 border-t border-gray-200 bg-[#fafafa] pt-4 dark:border-gray-700 dark:bg-[#0f172a]">
            <ChatWorkspace />
          </div>
        </section>
      </div>
    </main>
  );
}
