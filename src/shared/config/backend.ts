const raw =
  (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL)?.replace(/\/+$/, "");

export const BACKEND_URL: string | undefined = raw || undefined;

export function isBackendConfigured(): boolean {
  return !!BACKEND_URL;
}
