import type {
  ChatMessage,
  SessionDetail,
  SessionSummary
} from "@contracts/types";
import {
  getMockEvidence,
  getMockPharmaReport,
  mockGraphEdges,
  mockGraphNodes,
} from "@/shared/mocks/data";
import type { Language } from "@/shared/language/language-config";
import { DEFAULT_LANGUAGE } from "@/shared/language/language-config";

type TdpGlobalStore = typeof globalThis & {
  __tdpUserSessions?: Map<string, SessionDetail[]>;
};

const globalStore = globalThis as TdpGlobalStore;
const userSessions =
  globalStore.__tdpUserSessions ?? (globalStore.__tdpUserSessions = new Map<string, SessionDetail[]>());

const nowIso = () => new Date().toISOString();

const ensureSessionLanguage = (session: SessionDetail): SessionDetail => {
  if (!session.language) {
    session.language = DEFAULT_LANGUAGE;
  }
  return session;
};

const buildMessage = (role: ChatMessage["role"], content: string): ChatMessage => ({
  id: `${role}-${crypto.randomUUID()}`,
  role,
  content,
  createdAt: nowIso()
});

const toSummary = (session: SessionDetail): SessionSummary => ({
  id: session.id,
  userId: session.userId,
  title: session.title,
  language: session.language ?? DEFAULT_LANGUAGE,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt
});

function ensureUserSessions(userId: string): SessionDetail[] {
  const existing = userSessions.get(userId);
  if (existing) {
    return existing;
  }

  const seeded: SessionDetail[] = [
    {
      id: `session-${crypto.randomUUID()}`,
      userId,
      title: "Welcome analysis session",
      language: DEFAULT_LANGUAGE,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      messages: [
        buildMessage(
          "assistant",
          "Sign in complete. Start a new target discovery query when ready.\n\nThis session includes sample literature, graph, and pharma data so you can explore the UI without running a query."
        )
      ],
      evidence: [...getMockEvidence("en")],
      graphNodes: [...mockGraphNodes],
      graphEdges: [...mockGraphEdges],
      pharma: [...getMockPharmaReport("en")]
    }
  ];

  userSessions.set(userId, seeded);
  return seeded;
}

export function listSessions(userId: string): SessionSummary[] {
  return ensureUserSessions(userId)
    .map(toSummary)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getSession(userId: string, sessionId: string): SessionDetail | undefined {
  const sessions = userSessions.get(userId);
  if (!sessions) return undefined;
  const session = sessions.find((item) => item.id === sessionId);
  return session ? ensureSessionLanguage(session) : undefined;
}

/**
 * Returns the session if it exists; otherwise ensures user has sessions and, if the requested
 * id matches the single seeded session (e.g. client got list from MSW but get went to server),
 * returns that session. If id still does not match any session, creates a minimal session with
 * that exact id so GET /api/sessions/:id can return 200 when list and get use different backends.
 */
export function getOrCreateSessionById(userId: string, sessionId: string): SessionDetail {
  const existing = getSession(userId, sessionId);
  if (existing) return existing;
  const sessions = ensureUserSessions(userId);
  const match = sessions.find((s) => s.id === sessionId);
  if (match) return ensureSessionLanguage(match);
  const now = nowIso();
  const created: SessionDetail = {
    id: sessionId,
    userId,
    title: "New discovery session",
    language: DEFAULT_LANGUAGE,
    createdAt: now,
    updatedAt: now,
    messages: [],
    evidence: [],
    graphNodes: [],
    graphEdges: [],
    pharma: []
  };
  sessions.unshift(created);
  return created;
}

export function createSession(userId: string, title?: string, language: Language = DEFAULT_LANGUAGE): SessionDetail {
  const sessions = ensureUserSessions(userId);
  const createdAt = nowIso();
  const created: SessionDetail = {
    id: `session-${crypto.randomUUID()}`,
    userId,
    title: title?.trim() ? title.trim() : "New discovery session",
    language,
    createdAt,
    updatedAt: createdAt,
    messages: [],
    evidence: [],
    graphNodes: [],
    graphEdges: [],
    pharma: []
  };
  sessions.unshift(created);
  return created;
}

export function deleteSession(userId: string, sessionId: string): boolean {
  const sessions = userSessions.get(userId);
  if (!sessions) {
    return false;
  }
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return false;
  }
  sessions.splice(index, 1);
  return true;
}

export function beginStreamQuery(
  userId: string,
  sessionId: string,
  query: string,
  language: Language
): SessionDetail {
  const session = getSession(userId, sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  session.messages.push(buildMessage("user", query));
  session.messages.push(buildMessage("assistant", ""));
  session.language = language;
  session.evidence = [];
  session.graphNodes = [];
  session.graphEdges = [];
  session.pharma = [];
  session.updatedAt = nowIso();
  return session;
}

export function appendAnswerToken(userId: string, sessionId: string, token: string): void {
  const session = getSession(userId, sessionId);
  if (!session) {
    return;
  }
  const assistant = [...session.messages].reverse().find((message) => message.role === "assistant");
  if (!assistant) {
    return;
  }
  assistant.content = `${assistant.content}${token}`;
  session.updatedAt = nowIso();
}

export function updateSessionTitle(userId: string, sessionId: string, title: string): SessionDetail | undefined {
  const session = getSession(userId, sessionId);
  if (!session) {
    return undefined;
  }
  const trimmed = title.trim();
  if (!trimmed) {
    return session;
  }
  session.title = trimmed;
  session.updatedAt = nowIso();
  return session;
}

export function buildRecommendedSessionTitle(query: string, language: Language): string {
  const compact = query.replace(/\s+/g, " ").trim();
  if (!compact) {
    return language === "ko" ? "새 분석 리포트" : "New analysis report";
  }
  const maxLength = 52;
  if (compact.length <= maxLength) {
    return compact;
  }
  const shortened = compact.slice(0, maxLength - 1).trimEnd();
  return `${shortened}\u2026`;
}

export function applyEvidence(userId: string, sessionId: string, language: Language = "en"): void {
  const session = getSession(userId, sessionId);
  if (!session) {
    return;
  }
  session.evidence = getMockEvidence(language);
  session.updatedAt = nowIso();
}

export function applyGraph(userId: string, sessionId: string): void {
  const session = getSession(userId, sessionId);
  if (!session) {
    return;
  }
  session.graphNodes = mockGraphNodes;
  session.graphEdges = mockGraphEdges;
  session.updatedAt = nowIso();
}

export function applyPharma(userId: string, sessionId: string, language: Language = "en"): void {
  const session = getSession(userId, sessionId);
  if (!session) {
    return;
  }
  session.pharma = getMockPharmaReport(language);
  session.updatedAt = nowIso();
}
