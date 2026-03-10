"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { AppLogo } from "@/shared/ui/app-logo";
import { HeaderSettings } from "@/widgets/header-settings";

export function SignInPage() {
  const { language } = useLanguage();
  const text = getUiText(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams?.get("error");
  const isGoogleAccessDenied = authError === "AccessDenied";
  const isGoogleOAuthCallbackError = authError === "OAuthCallback";
  const [googleSignInError, setGoogleSignInError] = useState<string | null>(null);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);

  const handleDevSignIn = async () => {
    const result = await signIn("credentials", {
      callbackUrl: "/chat",
      redirect: false
    });
    if (result?.ok) {
      await router.refresh();
      window.location.href = "/chat";
    } else if (result?.error) {
      console.error("Development sign in failed:", result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningInWithGoogle) {
      return;
    }
    setIsSigningInWithGoogle(true);
    setGoogleSignInError(null);
    try {
      const response = await fetch("/api/auth/providers", { method: "GET" });
      if (!response.ok) {
        setGoogleSignInError(text.googleSignInFailed);
        setIsSigningInWithGoogle(false);
        return;
      }
      const providers = (await response.json()) as Record<string, unknown>;
      if (!providers.google) {
        setGoogleSignInError(text.googleProviderNotConfigured);
        setIsSigningInWithGoogle(false);
        return;
      }
      await signIn("google", { callbackUrl: "/chat" });
    } catch {
      setGoogleSignInError(text.googleSignInFailed);
      setIsSigningInWithGoogle(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-100 dark:bg-[#171a1f]">
      <header className="flex h-12 shrink-0 items-center justify-end border-b border-gray-200 bg-white/95 px-4 dark:border-[#3a404a] dark:bg-[#171a1f]/95">
        <HeaderSettings />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-[#3a404a] dark:bg-[#2a2f36]">
          <div className="text-center">
            <h1 className="flex items-center justify-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <AppLogo size={36} />
              <span>{text.appName}</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {text.signinDescription}
            </p>
          </div>

          {isGoogleAccessDenied ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
              {text.googleAccessDenied}
            </div>
          ) : null}
          {isGoogleOAuthCallbackError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
              {text.googleOAuthCallbackError}
            </div>
          ) : null}
          {googleSignInError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
              {googleSignInError}
            </div>
          ) : null}

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => void handleDevSignIn()}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-[#f69e25] bg-[#f69e25]/10 px-4 py-3 text-sm font-medium text-[#c47a1a] transition hover:bg-[#f69e25]/20 dark:text-[#f69e25] dark:hover:bg-[#f69e25]/20"
            >
              {text.devSignIn}
            </button>

            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={isSigningInWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isSigningInWithGoogle ? `${text.signInWithGoogle}...` : text.signInWithGoogle}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
