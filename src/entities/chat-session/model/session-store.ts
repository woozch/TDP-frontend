"use client";

import { create } from "zustand";
import type {
  ChatMessage,
  GraphEdge,
  GraphNode,
  LiteratureItem,
  PharmaReportItem,
  SessionDetail,
  SessionSummary,
  TabKey,
  TabStatus
} from "@contracts/types";

export interface SessionState {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  tabStatus: Record<TabKey, TabStatus>;
  activeTab: TabKey;
  literature: LiteratureItem[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  pharma: PharmaReportItem[];
  isStreaming: boolean;
  workflowStarted: boolean;
  error?: string;
}

interface ChatSessionStore {
  sessions: SessionSummary[];
  activeSession: SessionState | null;
  sessionsLoading: boolean;
  sessionsError: string | null;
  activeSessionLoading: boolean;
  setSessions: (sessions: SessionSummary[]) => void;
  setSessionsLoading: (loading: boolean) => void;
  setSessionsError: (error: string | null) => void;
  setActiveSessionLoading: (loading: boolean) => void;
  upsertSessionSummary: (session: SessionSummary) => void;
  removeSession: (sessionId: string) => void;
  setActiveSession: (session: SessionDetail) => void;
  clearActiveSession: () => void;
  startQuery: (query: string) => void;
  appendAnswerToken: (token: string) => void;
  setLiterature: (references: SessionState["literature"]) => void;
  setGraph: (nodes: SessionState["graphNodes"], edges: SessionState["graphEdges"]) => void;
  setPharma: (items: SessionState["pharma"]) => void;
  completeStream: () => void;
  setTabStatus: (tab: Exclude<TabKey, "chat">, status: TabStatus) => void;
  setActiveTab: (tab: TabKey) => void;
  clearError: () => void;
  setError: (message: string) => void;
  setSessionTitle: (sessionId: string, title: string, updatedAt?: string) => void;
  setSessionLanguage: (sessionId: string, language: SessionSummary["language"], updatedAt?: string) => void;
  removeMessageFromActiveSession: (messageId: string) => void;
}

const defaultTabStatus = (): Record<TabKey, TabStatus> => ({
  chat: "complete",
  answer: "loading",
  literature: "loading",
  graph: "loading",
  pharma: "loading"
});

const markLoadingTabsAsError = (
  tabStatus: Record<TabKey, TabStatus>
): Record<TabKey, TabStatus> => ({
  chat: tabStatus.chat,
  answer: tabStatus.answer === "loading" ? "error" : tabStatus.answer,
  literature: tabStatus.literature === "loading" ? "error" : tabStatus.literature,
  graph: tabStatus.graph === "loading" ? "error" : tabStatus.graph,
  pharma: tabStatus.pharma === "loading" ? "error" : tabStatus.pharma
});

const hasWorkflowStarted = (session: SessionDetail): boolean =>
  session.messages.some((message) => message.role === "user") ||
  session.literature.length > 0 ||
  session.graphNodes.length > 0 ||
  session.graphEdges.length > 0 ||
  session.pharma.length > 0;

const buildSessionState = (session: SessionDetail): SessionState => {
  const tabStatus: Record<TabKey, TabStatus> = {
    chat: session.messages.length ? "complete" : "idle",
    answer: session.messages.length ? "complete" : "idle",
    literature: session.literature.length ? "complete" : "idle",
    graph: session.graphNodes.length || session.graphEdges.length ? "complete" : "idle",
    pharma: session.pharma.length ? "complete" : "idle"
  };

  return {
    id: session.id,
    userId: session.userId,
    title: session.title,
    messages: session.messages,
    tabStatus,
    literature: session.literature,
    graphNodes: session.graphNodes,
    graphEdges: session.graphEdges,
    pharma: session.pharma,
    isStreaming: false,
    workflowStarted: hasWorkflowStarted(session),
    activeTab: "chat"
  };
};

export const useChatSessionStore = create<ChatSessionStore>((set) => ({
  sessions: [],
  activeSession: null,
  sessionsLoading: true,
  sessionsError: null,
  activeSessionLoading: false,
  setSessions: (sessions) => set(() => ({ sessions })),
  setSessionsLoading: (sessionsLoading) => set(() => ({ sessionsLoading })),
  setSessionsError: (sessionsError) => set(() => ({ sessionsError })),
  setActiveSessionLoading: (activeSessionLoading) => set(() => ({ activeSessionLoading })),
  upsertSessionSummary: (session) =>
    set((state) => {
      const existing = state.sessions.find((item) => item.id === session.id);
      const sessions = existing
        ? state.sessions.map((item) => (item.id === session.id ? session : item))
        : [session, ...state.sessions];
      return { sessions };
    }),
  removeSession: (sessionId) =>
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== sessionId);
      const wasActive = state.activeSession?.id === sessionId;
      return {
        sessions,
        activeSession: wasActive ? null : state.activeSession
      };
    }),
  setActiveSession: (session) =>
    set(() => ({
      activeSession: buildSessionState(session)
    })),
  clearActiveSession: () =>
    set(() => ({
      activeSession: null
    })),
  startQuery: (query) =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: query,
        createdAt: new Date().toISOString()
      };
      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString()
      };

      return {
        activeSession: {
          ...state.activeSession,
          messages: [...state.activeSession.messages, userMessage, assistantMessage],
          tabStatus: defaultTabStatus(),
          activeTab: "chat",
          literature: [],
          graphNodes: [],
          graphEdges: [],
          pharma: [],
          isStreaming: true,
          workflowStarted: true,
          error: undefined
        }
      };
    }),
  appendAnswerToken: (token) =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }

      const messages = [...state.activeSession.messages];
      const idx = messages.length - 1;
      if (idx < 0 || messages[idx].role !== "assistant") {
        return state;
      }

      messages[idx] = {
        ...messages[idx],
        content: `${messages[idx].content}${token}`
      };

      return {
        activeSession: {
          ...state.activeSession,
          messages,
          workflowStarted: true,
          tabStatus: { ...state.activeSession.tabStatus, answer: "loading" }
        }
      };
    }),
  setLiterature: (references) =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          literature: references,
          tabStatus: { ...state.activeSession.tabStatus, literature: "complete" }
        }
      };
    }),
  setGraph: (nodes, edges) =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          graphNodes: nodes,
          graphEdges: edges,
          tabStatus: { ...state.activeSession.tabStatus, graph: "complete" }
        }
      };
    }),
  setPharma: (items) =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          pharma: items,
          tabStatus: { ...state.activeSession.tabStatus, pharma: "complete" }
        }
      };
    }),
  completeStream: () =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          isStreaming: false,
          tabStatus: {
            ...state.activeSession.tabStatus,
            answer: "complete"
          }
        }
      };
    }),
  setTabStatus: (tab, status) =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          tabStatus: {
            ...state.activeSession.tabStatus,
            [tab]: status
          }
        }
      };
    }),
  setActiveTab: (tab) =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          activeTab: tab
        }
      };
    }),
  clearError: () =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          error: undefined
        }
      };
    }),
  setError: (message) =>
    set((state) => {
      if (!state.activeSession) {
        return state;
      }
      return {
        activeSession: {
          ...state.activeSession,
          error: message,
          isStreaming: false,
          tabStatus: markLoadingTabsAsError(state.activeSession.tabStatus)
        }
      };
    }),
  setSessionTitle: (sessionId, title, updatedAt) =>
    set((state) => {
      const nextUpdatedAt = updatedAt ?? new Date().toISOString();
      const sessions = state.sessions.map((item) =>
        item.id === sessionId ? { ...item, title, updatedAt: nextUpdatedAt } : item
      );
      if (state.activeSession?.id !== sessionId) {
        return { sessions };
      }
      return {
        sessions,
        activeSession: {
          ...state.activeSession,
          title
        }
      };
    }),
  setSessionLanguage: (sessionId, language, updatedAt) =>
    set((state) => {
      const nextUpdatedAt = updatedAt ?? new Date().toISOString();
      const sessions = state.sessions.map((item) =>
        item.id === sessionId ? { ...item, language, updatedAt: nextUpdatedAt } : item
      );
      return { sessions };
    }),
  removeMessageFromActiveSession: (messageId) =>
    set((state) => {
      if (!state.activeSession) return state;
      const messages = state.activeSession.messages.filter((m) => m.id !== messageId);
      const hasReport = messages.some(
        (m) => m.role === "assistant" && m.isClarifyingQuestion !== true
      );
      const tabStatus = {
        ...state.activeSession.tabStatus,
        answer: hasReport ? state.activeSession.tabStatus.answer : "idle"
      };
      return {
        activeSession: {
          ...state.activeSession,
          messages,
          tabStatus
        }
      };
    })
}));

export const getActiveSessionId = () => getStore().activeSession?.id;

function getStore() {
  return useChatSessionStore.getState();
}
