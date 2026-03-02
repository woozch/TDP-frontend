"use client";

import { useRef, useState } from "react";
import { useTheme } from "@/shared/theme/theme-context";

export function HeaderSettings() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        aria-label="Open settings"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close settings"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            role="menu"
          >
            <div className="px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Theme
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={theme === "light"}
                  onClick={() => {
                    setTheme("light");
                    setOpen(false);
                  }}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-sm transition ${
                    theme === "light"
                      ? "border-[#f69e25] bg-[#f69e25]/15 text-[#c47a1a] dark:border-[#f69e25] dark:bg-[#f69e25]/20 dark:text-[#f69e25]"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={theme === "dark"}
                  onClick={() => {
                    setTheme("dark");
                    setOpen(false);
                  }}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-sm transition ${
                    theme === "dark"
                      ? "border-[#f69e25] bg-[#f69e25]/15 text-[#c47a1a] dark:border-[#f69e25] dark:bg-[#f69e25]/20 dark:text-[#f69e25]"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
