"use client";

import type { ReactNode } from "react";
import { AppLogo } from "@/shared/ui/app-logo";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";

interface AppHeaderProps {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  title?: string;
  logoSize?: number;
}

export function AppHeader({
  leftSlot,
  rightSlot,
  title,
  logoSize = 26,
}: AppHeaderProps) {
  const { language } = useLanguage();
  const text = getUiText(language);
  const heading = title ?? text.appName;

  return (
    <header className="z-40 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950 md:px-6">
      <div className="flex items-center gap-3">
        {leftSlot}
        <div className="flex items-center gap-2">
          <AppLogo size={logoSize} />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">
            {heading}
          </h1>
        </div>
      </div>
      {rightSlot}
    </header>
  );
}

