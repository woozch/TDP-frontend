export const DEFAULT_LANGUAGE = "en" as const;

/** Languages that have full UI translations; others are shown but not selectable. */
export const SUPPORTED_UI_LANGUAGES: readonly string[] = ["en", "ko"];

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" }
] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number]["code"];

export function isSupportedUiLanguage(code: string): boolean {
  return SUPPORTED_UI_LANGUAGES.includes(code);
}

const languageCodeSet = new Set<string>(LANGUAGE_OPTIONS.map((item) => item.code));

export function isLanguage(value: string): value is Language {
  return languageCodeSet.has(value);
}

export function normalizeLanguage(value: unknown): Language {
  if (typeof value !== "string") {
    return DEFAULT_LANGUAGE;
  }
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export function getLanguageOption(language: string) {
  return LANGUAGE_OPTIONS.find((item) => item.code === language) ?? LANGUAGE_OPTIONS[0];
}
