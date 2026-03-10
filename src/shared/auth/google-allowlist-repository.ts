import { readFile } from "node:fs/promises";
import path from "node:path";

export type GoogleAllowlist = {
  domains: string[];
  emails: string[];
};

type LocalAllowlistRecord = {
  companies?: Array<{
    name?: string;
    domains?: string[];
    enabled?: boolean;
  }>;
  users?: Array<{
    email?: string;
    enabled?: boolean;
  }>;
};

export interface GoogleAllowlistRepository {
  getAllowlist(): Promise<GoogleAllowlist>;
}

const DEFAULT_FILE_PATH = "data/google-allowlist.json";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeDomain(domain: string): string {
  return domain.trim().replace(/^@+/, "").toLowerCase();
}

function splitCsvEnv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function parseLocalAllowlist(raw: string): GoogleAllowlist {
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    console.error("Failed to parse local Google allowlist JSON:", error);
    return { domains: [], emails: [] };
  }

  const record = (parsed ?? {}) as LocalAllowlistRecord;

  const domains = unique(
    (record.companies ?? [])
      .filter((company) => company?.enabled !== false)
      .flatMap((company) => company.domains ?? [])
      .map(normalizeDomain)
      .filter(Boolean)
  );

  const emails = unique(
    (record.users ?? [])
      .filter((user) => user?.enabled !== false)
      .map((user) => user.email ?? "")
      .map(normalizeEmail)
      .filter(Boolean)
  );

  return { domains, emails };
}

class LocalFileGoogleAllowlistRepository implements GoogleAllowlistRepository {
  constructor(private readonly relativeFilePath: string = DEFAULT_FILE_PATH) {}

  async getAllowlist(): Promise<GoogleAllowlist> {
    const absolutePath = path.join(process.cwd(), this.relativeFilePath);
    try {
      const raw = await readFile(absolutePath, "utf-8");
      const localAllowlist = parseLocalAllowlist(raw);
      const envDomains = splitCsvEnv(process.env.GOOGLE_ALLOWED_DOMAINS).map(normalizeDomain);
      const envEmails = splitCsvEnv(process.env.GOOGLE_ALLOWED_EMAILS).map(normalizeEmail);

      return {
        domains: unique([...localAllowlist.domains, ...envDomains]),
        emails: unique([...localAllowlist.emails, ...envEmails])
      };
    } catch (error) {
      console.error("Failed to read local Google allowlist file:", error);
      const envDomains = splitCsvEnv(process.env.GOOGLE_ALLOWED_DOMAINS).map(normalizeDomain);
      const envEmails = splitCsvEnv(process.env.GOOGLE_ALLOWED_EMAILS).map(normalizeEmail);
      return {
        domains: unique(envDomains),
        emails: unique(envEmails)
      };
    }
  }
}

export function createGoogleAllowlistRepository(
  provider: "local-file" | "firebase" = "local-file"
): GoogleAllowlistRepository {
  if (provider === "firebase") {
    throw new Error("GOOGLE_ALLOWLIST_PROVIDER=firebase is not implemented yet.");
  }
  return new LocalFileGoogleAllowlistRepository(process.env.GOOGLE_ALLOWLIST_FILE ?? DEFAULT_FILE_PATH);
}

