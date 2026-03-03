import type {
  EvidenceItem,
  GraphEdge,
  GraphNode,
  PharmaReportItem,
  ReferenceDetail,
  SessionSummary
} from "@contracts/types";

export const mockSessions: SessionSummary[] = [
  {
    id: "session-001",
    userId: "seed-user",
    title: "KRAS synthetic lethality exploration",
    createdAt: "2026-02-26T08:30:00.000Z",
    updatedAt: "2026-02-26T09:10:00.000Z"
  },
  {
    id: "session-002",
    userId: "seed-user",
    title: "TP53 rescue strategy screen",
    createdAt: "2026-02-25T15:00:00.000Z",
    updatedAt: "2026-02-25T16:42:00.000Z"
  }
];

export const mockEvidence: EvidenceItem[] = [
  {
    id: "ref-1",
    title: "Pan-cancer mapping of synthetic lethal interactions",
    source: "Nature",
    year: 2024,
    url: "https://example.org/nature-sl",
    summary:
      "Large-scale CRISPR screens indicate context-specific vulnerabilities around KRAS and DNA damage pathways."
  },
  {
    id: "ref-2",
    title: "Transformer-guided target ranking for oncology",
    source: "Cell Systems",
    year: 2025,
    url: "https://example.org/cell-systems-rank",
    summary:
      "Sequence-context transformer embeddings improve prioritization of actionable targets in low-signal cohorts."
  }
];

export const mockGraphNodes: GraphNode[] = [
  { id: "KRAS", label: "KRAS", kind: "gene", score: 0.95 },
  { id: "STK33", label: "STK33", kind: "target", score: 0.88 },
  { id: "DDR", label: "DNA Damage Response", kind: "pathway", score: 0.81 },
  { id: "DrugX", label: "DrugX", kind: "drug", score: 0.77 },
  { id: "PIK3CA", label: "PIK3CA", kind: "gene", score: 0.86 },
  { id: "MET", label: "MET", kind: "target", score: 0.79 },
  { id: "MAPK", label: "MAPK Signaling", kind: "pathway", score: 0.83 },
  { id: "DrugY", label: "DrugY", kind: "drug", score: 0.73 },
  { id: "TP53", label: "TP53", kind: "gene", score: 0.9 },
  { id: "MDM2", label: "MDM2", kind: "target", score: 0.82 }
];

export const mockGraphEdges: GraphEdge[] = [
  { source: "KRAS", target: "STK33", relation: "synthetic_lethal_candidate", confidence: 0.84 },
  { source: "KRAS", target: "DDR", relation: "pathway_dependency", confidence: 0.79 },
  { source: "DrugX", target: "STK33", relation: "inhibits", confidence: 0.74 },
  { source: "PIK3CA", target: "MAPK", relation: "pathway_dependency", confidence: 0.76 },
  { source: "KRAS", target: "MAPK", relation: "activates", confidence: 0.81 },
  { source: "MET", target: "MAPK", relation: "cross_talk", confidence: 0.72 },
  { source: "DrugY", target: "MET", relation: "inhibits", confidence: 0.78 },
  { source: "TP53", target: "MDM2", relation: "regulates", confidence: 0.8 },
  { source: "TP53", target: "DDR", relation: "pathway_dependency", confidence: 0.77 },
  { source: "DrugX", target: "PIK3CA", relation: "off_target_signal", confidence: 0.61 }
];

export const mockPharmaReport: PharmaReportItem[] = [
  {
    company: "AstraZeneca",
    target: "KRAS",
    stage: "phase2",
    indication: "NSCLC",
    note: "Combination strategy with resistance biomarker stratification is under active evaluation."
  },
  {
    company: "Novartis",
    target: "STK33",
    stage: "preclinical",
    indication: "Solid tumors",
    note: "Early translational program focuses on KRAS mutant subset enrichment."
  }
];

export const mockReferenceDetails: Record<string, ReferenceDetail> = {
  "ref-1": {
    id: "ref-1",
    title: "Pan-cancer mapping of synthetic lethal interactions",
    abstract:
      "This study integrates pan-cancer CRISPR viability datasets and genomic covariates to identify reproducible synthetic lethal pairs.",
    keyFindings: [
      "Robust KRAS-context dependency signatures emerge across multiple cohorts.",
      "Cell-line lineage effects modulate transferability of candidate pairs.",
      "Combined evidence weighting improves clinical translation confidence."
    ]
  },
  "ref-2": {
    id: "ref-2",
    title: "Transformer-guided target ranking for oncology",
    abstract:
      "A transformer model jointly encodes gene perturbation and pathway context to produce calibrated therapeutic relevance scores.",
    keyFindings: [
      "Top-ranked targets show stronger retrospective validation rates.",
      "Confidence calibration reduces noisy candidates in sparse datasets.",
      "Model outputs are improved by curated knowledge-graph features."
    ]
  }
};
