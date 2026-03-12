import { HttpError } from "@/shared/api/http/http-error";

type RequestDefaults = {
  credentials?: RequestCredentials;
  headers?: HeadersInit;
};

const defaultInit: RequestDefaults = {
  credentials: "include"
};

async function readDetail(response: Response): Promise<string> {
  try {
    return (await response.text()).trim();
  } catch {
    return "";
  }
}

function mergeHeaders(base: HeadersInit | undefined, extra: HeadersInit | undefined): HeadersInit {
  return { ...(base ?? {}), ...(extra ?? {}) };
}

function withDefaults(init?: RequestInit): RequestInit {
  return {
    ...defaultInit,
    ...(init ?? {}),
    headers: mergeHeaders(defaultInit.headers, init?.headers)
  };
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, withDefaults(init));
  if (!response.ok) {
    const detail = await readDetail(response);
    throw new HttpError({ status: response.status, url, detail });
  }
  return (await response.json()) as T;
}

export async function requestText(url: string, init?: RequestInit): Promise<string> {
  const response = await fetch(url, withDefaults(init));
  if (!response.ok) {
    const detail = await readDetail(response);
    throw new HttpError({ status: response.status, url, detail });
  }
  return await response.text();
}

