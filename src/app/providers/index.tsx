"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/shared/theme/theme-context";
import { LanguageProvider } from "@/shared/language/language-context";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    // Avoid starting the worker twice in React strict mode.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyWindow = window as any;
    if (anyWindow.__tdp_msw_started) {
      return;
    }
    anyWindow.__tdp_msw_started = true;

    void import("@/mocks/browser")
      .then(({ worker, resolveMswReady }) =>
        worker
          .start({
            onUnhandledRequest: "bypass"
          })
          .then(resolveMswReady)
          .catch((err) => {
            console.error("Failed to start MSW worker", err);
            resolveMswReady();
          })
      )
      .catch((error) => {
        console.error("Failed to load MSW", error);
      });
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

