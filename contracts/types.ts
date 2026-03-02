export type TabKey = "chat" | "answer" | "evidence" | "graph" | "pharma";
export type TabStatus = "idle" | "loading" | "complete" | "error";
export type ChatRole = "user" | "assistant";

export interface QueryRequest {
  query: string;
  sessionId: string;
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
}

export interface EvidenceItem {
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
  kind: "gene" | "target" | "pathway";
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
  evidence: EvidenceItem[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  pharma: PharmaReportItem[];
}

export interface CreateSessionRequest {
  title?: string;
}

export interface CreateSessionResponse {
  session: SessionDetail;
}

export type StreamEventType =
  | "answer.delta"
  | "evidence.ready"
  | "graph.ready"
  | "pharma.ready"
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
  | StreamEnvelope<"evidence.ready", { references: EvidenceItem[] }>
  | StreamEnvelope<"graph.ready", { nodes: GraphNode[]; edges: GraphEdge[] }>
  | StreamEnvelope<"pharma.ready", { items: PharmaReportItem[] }>
  | StreamEnvelope<"done", { completedAt: string }>
  | StreamEnvelope<"error", { message: string; code?: string }>;
