"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { signIn, signOut, useSession } from "next-auth/react";
import type { SessionSummary } from "@contracts/types";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { useCreateSession } from "@/features/create-session/model/use-create-session";
import { useDeleteSession } from "@/features/delete-session/model/use-delete-session";
import { useSelectSession } from "@/features/select-session/model/use-select-session";

interface LeftSidebarProps {
  onClose?: () => void;
  onSessionSelect?: () => void;
  onRetryLoad?: () => void;
}

export function LeftSidebar({ onClose, onSessionSelect, onRetryLoad }: LeftSidebarProps) {
  const { data: authSession } = useSession();
  const sessions = useChatSessionStore((state) => state.sessions);
  const activeSession = useChatSessionStore((state) => state.activeSession);
  const sessionsLoading = useChatSessionStore((state) => state.sessionsLoading);
  const sessionsError = useChatSessionStore((state) => state.sessionsError);
  const { createSession } = useCreateSession();
  const { deleteSession } = useDeleteSession();
  const { selectSession } = useSelectSession();

  const [sessionToDelete, setSessionToDelete] = useState<SessionSummary | null>(null);

  const handleSelectSession = (session: (typeof sessions)[0]) => {
    void selectSession(session);
    onSessionSelect?.();
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      void deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  return (
    <aside className="flex h-full w-full max-w-xs flex-col border-r border-gray-200 bg-gray-50/80 p-4 dark:border-[#3a404a] dark:bg-[#171a1f]/80">
      {onClose ? (
        <div className="mb-3 flex items-center justify-end md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : null}

      <section className="flex-1 min-h-0 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Report History</p>
          <button
            type="button"
            onClick={() => void createSession()}
            disabled={sessionsLoading}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:border-[#f69e25] hover:text-[#f69e25] disabled:opacity-50 dark:border-[#4a515c] dark:bg-[#2a2f36] dark:text-gray-300 dark:hover:border-[#f69e25] dark:hover:text-[#f69e25]"
          >
            New report
          </button>
        </div>
        <p className="mb-2 text-[11px] text-gray-500 dark:text-gray-400">
          Final reports; use the input below to create or update via follow-up.
        </p>

        {sessionsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
            <p className="text-xs text-red-700 dark:text-red-300">{sessionsError}</p>
            {onRetryLoad ? (
              <button
                type="button"
                onClick={onRetryLoad}
                className="mt-2 rounded border border-red-300 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : sessionsLoading && sessions.length === 0 ? (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border border-gray-200 bg-gray-100 dark:border-[#3a404a] dark:bg-[#2a2f36]"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
          {sessions.map((session) => {
            const isActive = activeSession?.id === session.id;
            return (
              <div
                key={session.id}
                className={`flex items-center gap-2 rounded-lg border p-3 transition ${
                  isActive
                    ? "border-[#f69e25] bg-[#f69e25]/10 dark:bg-[#f69e25]/15"
                    : "border-gray-200 bg-white hover:border-[#f69e25] hover:bg-[#f69e25]/5 dark:border-[#3a404a] dark:bg-[#2a2f36] dark:hover:border-[#f69e25] dark:hover:bg-[#f69e25]/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectSession(session)}
                  className="min-w-0 flex-1 text-left text-sm"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">{session.title}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(session.updatedAt).toLocaleString()}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSessionToDelete(session);
                  }}
                  className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-rose-400"
                  title="Delete report"
                  aria-label="Delete report"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
        )}
      </section>

      <div className="mt-4 shrink-0 space-y-2 border-t border-gray-200 pt-4 dark:border-[#3a404a]">
        <section className="rounded-lg border border-gray-200 bg-white p-3 dark:border-[#3a404a] dark:bg-[#2a2f36]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">User</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{authSession?.user?.name ?? "Not signed in"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{authSession?.user?.email ?? "Google login required"}</p>
        </section>
        <button
          type="button"
          onClick={() => {
            if (authSession?.user) {
              void signOut({ callbackUrl: "/signin" });
              return;
            }
            void signIn("google", { callbackUrl: "/chat" });
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:border-[#f69e25] hover:text-[#f69e25] dark:border-[#4a515c] dark:bg-[#2a2f36] dark:text-gray-300 dark:hover:border-[#f69e25] dark:hover:text-[#f69e25]"
        >
          {authSession?.user ? "Sign out" : "Sign in with Google"}
        </button>
      </div>

      {/* Delete report confirmation modal (portal so it appears above overlay on mobile) */}
      {sessionToDelete && typeof document !== "undefined"
        ? createPortal(
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          <div
            className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-[#3a404a] dark:bg-[#2a2f36]"
            onKeyDown={(e) => {
              if (e.key === "Escape") setSessionToDelete(null);
            }}
          >
            <h2 id="delete-dialog-title" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Delete report?
            </h2>
            <p id="delete-dialog-desc" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              “{sessionToDelete.title}” will be permanently deleted. This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
        : null}
    </aside>
  );
}
