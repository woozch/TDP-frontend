export type TabKey = "chat" | "answer" | "literature" | "graph" | "pharma";
export type TabStatus = "idle" | "loading" | "complete" | "error";
export type ChatRole = "user" | "assistant";

export interface QueryRequest {
  query: string;
  sessionId: string;
  language?: "en" | "ko" | "ja" | "zh" | "es";
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export interface SessionSummary {
  id: string;
  userId: string;
  title: string;
  language: "en" | "ko" | "ja" | "zh" | "es";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  /** When true, the assistant is asking a follow-up question (e.g. query ambiguous). Reply in the input to refine the report. */
  isClarifyingQuestion?: boolean;
  /**
   * Per-report reference sets.
   * These are used to dynamically filter the Literature/Pharma tabs based on the active report.
   */
  literatureRefIds?: string[];
  /** 1-based indices into SessionDetail.pharma (can differ per report). */
  pharmaRefIndices?: number[];
  /** Node ids into SessionDetail.graphNodes (can differ per report). */
  graphRefNodeIds?: string[];
  /** 1-based indices into SessionDetail.graphEdges (can differ per report). */
  graphRefEdgeIndices?: number[];
  /**
   * Optional map to convert inline numeric citations like [1] into tab citations like [L5] or [P3-4].
   * Example: { "1": "L1", "2": "L5", "3": "P3-4" }.
   */
  citationMap?: Record<string, string>;
}

export interface LiteratureItem {
  id: string;
  title: string;
  source: string;
  year: number;
  url: string;
  summary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  kind: "gene" | "target" | "pathway" | "drug";
  score: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}

export interface PharmaReportItem {
  company: string;
  target: string;
  stage: "discovery" | "preclinical" | "phase1" | "phase2" | "phase3" | "approved";
  indication: string;
  note: string;
}

export interface ReferenceDetail {
  id: string;
  title: string;
  abstract: string;
  keyFindings: string[];
}

export interface SessionDetail extends SessionSummary {
  messages: ChatMessage[];
  literature: LiteratureItem[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  pharma: PharmaReportItem[];
}

export interface CreateSessionRequest {
  title?: string;
  language?: "en" | "ko" | "ja" | "zh" | "es";
}

export interface CreateSessionResponse {
  session: SessionDetail;
}

export type StreamEventType =
  | "answer.delta"
  | "literature.ready"
  | "graph.ready"
  | "pharma.ready"
  | "session.updated"
  | "done"
  | "error";

interface StreamEnvelope<TType extends StreamEventType, TPayload> {
  type: TType;
  seq: number;
  sessionId: string;
  timestamp: string;
  payload: TPayload;
}

export type StreamEvent =
  | StreamEnvelope<"answer.delta", { token: string }>
  | StreamEnvelope<"literature.ready", { references: LiteratureItem[] }>
  | StreamEnvelope<"graph.ready", { nodes: GraphNode[]; edges: GraphEdge[] }>
  | StreamEnvelope<"pharma.ready", { items: PharmaReportItem[] }>
  | StreamEnvelope<"session.updated", { title: string; updatedAt: string }>
  | StreamEnvelope<"done", { completedAt: string }>
  | StreamEnvelope<"error", { message: string; code?: string }>;
