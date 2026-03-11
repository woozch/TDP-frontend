"use client";

import { useEffect, useRef, useState } from "react";
import {
  LANGUAGE_OPTIONS,
  useLanguage,
} from "@/shared/language/language-context";
import { type Language, isSupportedUiLanguage, DEFAULT_LANGUAGE } from "@/shared/language/language-config";
import { getUiText } from "@/shared/i18n/ui-messages";
import { Theme, useTheme } from "@/shared/theme/theme-context";
import { UiButton } from "@/shared/ui/button";

export function HeaderSettings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const text = getUiText(language);
  const [open, setOpen] = useState(false);
  const [draftTheme, setDraftTheme] = useState<Theme>(theme);
  const [draftLanguage, setDraftLanguage] = useState<Language>(language);
  const [languageListOpen, setLanguageListOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLanguage =
    LANGUAGE_OPTIONS.find((item) => item.code === draftLanguage) ??
    LANGUAGE_OPTIONS[0];

  const hasChanges = draftTheme !== theme || draftLanguage !== language;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() =>
          setOpen((wasOpen) => {
            const nextOpen = !wasOpen;
            if (nextOpen) {
              setDraftTheme(theme);
              setDraftLanguage(isSupportedUiLanguage(language) ? language : DEFAULT_LANGUAGE);
              setLanguageListOpen(false);
            }
            return nextOpen;
          })
        }
        className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        aria-label={text.openSettings}
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
            aria-label={text.closeSettings}
            className="fixed inset-0 z-50"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full z-60 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-950"
            role="menu"
          >
            <div className="px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {text.theme}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={draftTheme === "light"}
                  onClick={() => setDraftTheme("light")}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-sm transition ${
                    draftTheme === "light"
                      ? "border-brand bg-brand/15 text-brand-ink dark:border-brand dark:bg-brand/20 dark:text-brand"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={draftTheme === "dark"}
                  onClick={() => setDraftTheme("dark")}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-sm transition ${
                    draftTheme === "dark"
                      ? "border-brand bg-brand/15 text-brand-ink dark:border-brand dark:bg-brand/20 dark:text-brand"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {text.language}
              </p>
              <div className="relative mt-2">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={languageListOpen}
                  onClick={() => setLanguageListOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition hover:border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500"
                >
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden>{selectedLanguage.flag}</span>
                    <span>{selectedLanguage.label}</span>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ▼
                  </span>
                </button>
                {languageListOpen ? (
                  <ul
                    role="listbox"
                    aria-label="Language options"
                    className="absolute left-0 right-0 z-30 mt-1 max-h-44 overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-600 dark:bg-gray-900"
                  >
                    {LANGUAGE_OPTIONS.map((item) => {
                      const supported = isSupportedUiLanguage(item.code);
                      return (
                        <li key={item.code}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={draftLanguage === item.code}
                            aria-disabled={!supported}
                            disabled={!supported}
                            onClick={() => {
                              if (!supported) return;
                              setDraftLanguage(item.code);
                              setLanguageListOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                              supported
                                ? draftLanguage === item.code
                                  ? "bg-brand/15 text-brand-ink dark:bg-brand/20 dark:text-brand"
                                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                : "cursor-not-allowed opacity-50 text-gray-400 dark:text-gray-500"
                            }`}
                            title={supported ? undefined : "Coming soon"}
                          >
                            <span aria-hidden>{item.flag}</span>
                            <span>{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-3 py-2 dark:border-gray-700">
              <UiButton
                type="button"
                onClick={() => {
                  setDraftTheme(theme);
                  setDraftLanguage(language);
                  setLanguageListOpen(false);
                }}
                variant="outline"
                size="sm"
                className="px-3 py-1.5 text-sm"
              >
                {text.reset}
              </UiButton>
              <UiButton
                type="button"
                onClick={() => {
                  setTheme(draftTheme);
                  const langToApply = isSupportedUiLanguage(draftLanguage) ? draftLanguage : DEFAULT_LANGUAGE;
                  setLanguage(langToApply);
                  setLanguageListOpen(false);
                  setOpen(false);
                }}
                disabled={!hasChanges}
                variant="primary"
                size="sm"
                className="px-3 py-1.5 text-sm"
              >
                {text.apply}
              </UiButton>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
