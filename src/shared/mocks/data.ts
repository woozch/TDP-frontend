import type {
  EvidenceItem,
  GraphEdge,
  GraphNode,
  PharmaReportItem,
  ReferenceDetail,
  SessionSummary
} from "@contracts/types";
import type { Language } from "@/shared/language/language-config";

export const mockSessions: SessionSummary[] = [
  {
    id: "session-001",
    userId: "seed-user",
    title: "KRAS synthetic lethality exploration",
    language: "en",
    createdAt: "2026-02-26T08:30:00.000Z",
    updatedAt: "2026-02-26T09:10:00.000Z"
  },
  {
    id: "session-002",
    userId: "seed-user",
    title: "TP53 rescue strategy screen",
    language: "en",
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

const mockEvidenceKo: EvidenceItem[] = [
  {
    id: "ref-1",
    title: "범암종 synthetic lethal 상호작용 지도",
    source: "Nature",
    year: 2024,
    url: "https://example.org/nature-sl",
    summary:
      "대규모 CRISPR 스크리닝에서 KRAS와 DNA 손상 반응 경로 주변의 맥락 의존 취약점이 확인되었습니다."
  },
  {
    id: "ref-2",
    title: "종양학 타깃 우선순위화를 위한 Transformer 모델",
    source: "Cell Systems",
    year: 2025,
    url: "https://example.org/cell-systems-rank",
    summary:
      "시퀀스 맥락 Transformer 임베딩이 저신호 코호트에서도 실행 가능한 타깃 우선순위를 개선합니다."
  }
];

const mockPharmaReportKo: PharmaReportItem[] = [
  {
    company: "AstraZeneca",
    target: "KRAS",
    stage: "phase2",
    indication: "비소세포폐암",
    note: "내성 바이오마커 기반 환자 층화를 포함한 병용 전략이 활발히 검토되고 있습니다."
  },
  {
    company: "Novartis",
    target: "STK33",
    stage: "preclinical",
    indication: "고형암",
    note: "초기 중개연구 프로그램은 KRAS 변이 하위군 강화 전략에 집중하고 있습니다."
  }
];

const mockReferenceDetailsKo: Record<string, ReferenceDetail> = {
  "ref-1": {
    id: "ref-1",
    title: "범암종 synthetic lethal 상호작용 지도",
    abstract:
      "본 연구는 범암종 CRISPR 생존성 데이터와 유전체 공변량을 통합해 재현 가능한 synthetic lethal 쌍을 규명합니다.",
    keyFindings: [
      "여러 코호트에서 KRAS 맥락 의존 시그니처가 일관되게 관찰됩니다.",
      "세포주 계통 특성이 후보 쌍의 전이 가능성에 영향을 줍니다.",
      "복합 근거 가중 방식이 임상 전환 가능성 평가를 개선합니다."
    ]
  },
  "ref-2": {
    id: "ref-2",
    title: "종양학 타깃 우선순위화를 위한 Transformer 모델",
    abstract:
      "Transformer 모델이 유전자 섭동과 경로 맥락을 함께 인코딩해 치료 관련성 점수를 보정된 형태로 산출합니다.",
    keyFindings: [
      "상위 타깃은 후향적 검증 성공률이 더 높았습니다.",
      "신뢰도 보정으로 희소 데이터에서 잡음 후보를 줄였습니다.",
      "큐레이션된 지식 그래프 특징을 추가하면 모델 성능이 향상됩니다."
    ]
  }
};

export function getMockEvidence(language: Language): EvidenceItem[] {
  return language === "ko" ? mockEvidenceKo : mockEvidence;
}

export function getMockPharmaReport(language: Language): PharmaReportItem[] {
  return language === "ko" ? mockPharmaReportKo : mockPharmaReport;
}

export function getMockReferenceDetails(language: Language): Record<string, ReferenceDetail> {
  return language === "ko" ? mockReferenceDetailsKo : mockReferenceDetails;
}
