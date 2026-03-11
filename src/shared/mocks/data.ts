import type {
  GraphEdge,
  GraphNode,
  LiteratureItem,
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

export const mockLiterature: LiteratureItem[] = [
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
  },
  {
    id: "ref-3",
    title: "Network perturbation signatures predict drug synergy",
    source: "Nature Biotechnology",
    year: 2023,
    url: "https://example.org/nbt-synergy",
    summary:
      "Integrating pathway activity with perturbation profiles improves prospective prediction of combination responses."
  },
  {
    id: "ref-4",
    title: "Single-cell atlas of tumor immune evasion programs",
    source: "Science",
    year: 2024,
    url: "https://example.org/science-immune-atlas",
    summary:
      "Single-cell state transitions reveal convergent immune escape modules linked to interferon signaling and antigen presentation."
  },
  {
    id: "ref-5",
    title: "Meta-analysis of KRAS resistance mechanisms across solid tumors",
    source: "Cancer Cell",
    year: 2022,
    url: "https://example.org/cancercell-kras-resistance",
    summary:
      "Cross-study synthesis highlights recurring bypass signaling routes and suggests tractable co-targeting strategies."
  },
  {
    id: "ref-6",
    title: "CRISPRi screens identify context-specific essential regulators",
    source: "Cell",
    year: 2023,
    url: "https://example.org/cell-crispri-essential",
    summary:
      "CRISPRi profiling refines essentiality estimates and reveals lineage-specific transcriptional dependencies."
  },
  {
    id: "ref-7",
    title: "Knowledge graph embeddings for target-disease prioritization",
    source: "PNAS",
    year: 2021,
    url: "https://example.org/pnas-kg-embeddings",
    summary:
      "Graph representation learning improves target ranking by combining genetics, pathways, and literature co-mentions."
  },
  {
    id: "ref-8",
    title: "Proteogenomic stratification of lung adenocarcinoma",
    source: "Nature Medicine",
    year: 2022,
    url: "https://example.org/nm-proteogenomics-luad",
    summary:
      "Multi-omic proteogenomics delineates actionable subtypes and reveals signaling rewiring beyond transcript levels."
  },
  {
    id: "ref-9",
    title: "Quantifying off-target liabilities in kinase programs",
    source: "Cell Chemical Biology",
    year: 2020,
    url: "https://example.org/ccb-kinase-offtarget",
    summary:
      "Comprehensive kinome profiling suggests early off-target triage can reduce downstream safety attrition."
  },
  {
    id: "ref-10",
    title: "Longitudinal ctDNA monitoring to detect early resistance",
    source: "NEJM",
    year: 2023,
    url: "https://example.org/nejm-ctdna-resistance",
    summary:
      "Serial ctDNA trajectories anticipate clinical progression and enable earlier adaptation of targeted therapy."
  },
  {
    id: "ref-11",
    title: "Benchmarking LLM-assisted biomedical evidence synthesis",
    source: "Nature",
    year: 2025,
    url: "https://example.org/nature-llm-evidence",
    summary:
      "Evaluation across curated tasks shows LLMs accelerate screening but require guardrails for citation fidelity."
  },
  {
    id: "ref-12",
    title: "Spatial transcriptomics reveals niche-specific signaling",
    source: "Cell",
    year: 2024,
    url: "https://example.org/cell-spatial-niches",
    summary:
      "Spatially resolved programs link tumor-stroma interactions with therapy response heterogeneity."
  },
  {
    id: "ref-13",
    title: "Causal inference for perturbation-based target validation",
    source: "Genome Biology",
    year: 2021,
    url: "https://example.org/gb-causal-perturb",
    summary:
      "Causal models reduce confounding in perturbation readouts and improve hit selection in noisy screens."
  },
  {
    id: "ref-14",
    title: "Pan-cancer pathway activity scoring from bulk RNA-seq",
    source: "Bioinformatics",
    year: 2020,
    url: "https://example.org/bioinf-pathway-score",
    summary:
      "Robust pathway scoring enables cross-cohort comparison of oncogenic signaling and downstream phenotypes."
  },
  {
    id: "ref-15",
    title: "Drug-target residence time predicts in vivo efficacy",
    source: "Nature Reviews Drug Discovery",
    year: 2019,
    url: "https://example.org/nrdd-residence-time",
    summary:
      "Kinetic selectivity and residence time can outperform affinity as predictors of durable pathway suppression."
  },
  {
    id: "ref-16",
    title: "Synthetic lethal interaction landscapes for DNA repair genes",
    source: "Molecular Cell",
    year: 2022,
    url: "https://example.org/molcell-dna-repair-sl",
    summary:
      "DNA repair vulnerabilities cluster by pathway topology, supporting biomarker-driven patient selection."
  },
  {
    id: "ref-17",
    title: "Targeted protein degradation in oncology: lessons from first waves",
    source: "Cancer Discovery",
    year: 2024,
    url: "https://example.org/cd-tpd-lessons",
    summary:
      "Early clinical degraders illustrate key design constraints and opportunities for previously 'undruggable' targets."
  },
  {
    id: "ref-18",
    title: "Clinical trial endpoints for biomarker-enriched cohorts",
    source: "Lancet Oncology",
    year: 2021,
    url: "https://example.org/lo-endpoints-biomarker",
    summary:
      "Endpoint selection and enrichment strategies materially impact statistical power in precision oncology trials."
  },
  {
    id: "ref-19",
    title: "Estimating target tractability from structural and chemogenomic features",
    source: "eLife",
    year: 2020,
    url: "https://example.org/elife-tractability",
    summary:
      "Combined structural pockets and chemogenomic priors correlate with historical success rates across target classes."
  },
  {
    id: "ref-20",
    title: "Multi-modal fusion models for target discovery",
    source: "Cell Systems",
    year: 2025,
    url: "https://example.org/cellsystems-multimodal-fusion",
    summary:
      "Fusion of omics, knowledge graphs, and literature signals improves calibration and ranking stability."
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
  { id: "MDM2", label: "MDM2", kind: "target", score: 0.82 },
  // Workflow 2 (immune evasion) examples
  { id: "B2M", label: "B2M", kind: "gene", score: 0.84 },
  { id: "HLA_A", label: "HLA-A", kind: "gene", score: 0.8 },
  { id: "IFNG", label: "IFNG", kind: "gene", score: 0.79 },
  { id: "JAK1", label: "JAK1", kind: "target", score: 0.77 },
  { id: "AP", label: "Antigen presentation", kind: "pathway", score: 0.83 },
  { id: "IFN", label: "IFN signaling", kind: "pathway", score: 0.81 },
  { id: "TIGIT", label: "TIGIT", kind: "target", score: 0.74 },
  { id: "DrugZ", label: "DrugZ", kind: "drug", score: 0.7 }
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
  { source: "DrugX", target: "PIK3CA", relation: "off_target_signal", confidence: 0.61 },
  // Workflow 2 (immune evasion) edges
  { source: "B2M", target: "AP", relation: "supports", confidence: 0.78 },
  { source: "HLA_A", target: "AP", relation: "supports", confidence: 0.76 },
  { source: "IFNG", target: "IFN", relation: "activates", confidence: 0.8 },
  { source: "JAK1", target: "IFN", relation: "mediates", confidence: 0.74 },
  { source: "IFN", target: "AP", relation: "upregulates", confidence: 0.72 },
  { source: "DrugZ", target: "TIGIT", relation: "inhibits", confidence: 0.71 }
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
  },
  {
    company: "Amgen",
    target: "KRAS G12C",
    stage: "approved",
    indication: "NSCLC",
    note: "Post-approval studies explore optimal sequencing with immunotherapy and next-line combinations."
  },
  {
    company: "Pfizer",
    target: "KRAS G12C",
    stage: "phase3",
    indication: "NSCLC",
    note: "Late-stage program emphasizes durability and resistance mitigation via rational combinations."
  },
  {
    company: "Roche",
    target: "MET",
    stage: "phase2",
    indication: "Solid tumors",
    note: "Biomarker-driven cohorts focus on amplification and exon14 skipping subsets."
  },
  {
    company: "Bristol Myers Squibb",
    target: "MDM2",
    stage: "phase1",
    indication: "Sarcoma",
    note: "Dose optimization continues to balance p53 activation with hematologic tolerability."
  },
  {
    company: "Merck",
    target: "PD-1",
    stage: "approved",
    indication: "Multiple",
    note: "Broad label coverage; ongoing studies investigate novel combinations in resistant populations."
  },
  {
    company: "Gilead",
    target: "TIGIT",
    stage: "phase2",
    indication: "NSCLC",
    note: "Program refines patient stratification to improve response rates in checkpoint combinations."
  },
  {
    company: "Regeneron",
    target: "LAG-3",
    stage: "phase2",
    indication: "Melanoma",
    note: "Second-generation checkpoint combinations aim to extend benefit beyond PD-1 responders."
  },
  {
    company: "Sanofi",
    target: "CD47",
    stage: "phase1",
    indication: "Hematologic malignancies",
    note: "Safety-driven dosing strategies target anemia risk while preserving macrophage activation."
  },
  {
    company: "Takeda",
    target: "DDR1",
    stage: "preclinical",
    indication: "Solid tumors",
    note: "Preclinical package explores fibrosis-linked tumor microenvironment modulation."
  },
  {
    company: "Eli Lilly",
    target: "PI3Kα",
    stage: "approved",
    indication: "Breast cancer",
    note: "Label expansion efforts examine combination with endocrine therapy and CDK inhibitors."
  },
  {
    company: "Bayer",
    target: "ATR",
    stage: "phase2",
    indication: "Ovarian cancer",
    note: "DDR pathway targeting paired with PARP inhibitor strategies in biomarker-defined cohorts."
  },
  {
    company: "Johnson & Johnson",
    target: "EGFR",
    stage: "approved",
    indication: "NSCLC",
    note: "Next-gen inhibitor studies track emergent resistance mutations and CNS penetration."
  },
  {
    company: "AbbVie",
    target: "BCL-2",
    stage: "approved",
    indication: "CLL",
    note: "Combination regimens focus on fixed-duration therapy and MRD-guided stopping rules."
  },
  {
    company: "Seagen",
    target: "HER2",
    stage: "phase3",
    indication: "Breast cancer",
    note: "ADC program evaluates efficacy in low-expression populations and earlier-line settings."
  },
  {
    company: "Moderna",
    target: "Personalized neoantigen vaccine",
    stage: "phase2",
    indication: "Melanoma",
    note: "mRNA vaccine combinations with checkpoint inhibitors aim to deepen and prolong responses."
  },
  {
    company: "BioNTech",
    target: "mRNA immunotherapy",
    stage: "phase1",
    indication: "Solid tumors",
    note: "Early-stage trials test multi-antigen constructs and combination immunomodulators."
  },
  {
    company: "Vertex",
    target: "Cystic fibrosis",
    stage: "approved",
    indication: "CF",
    note: "Market-leading CFTR modulators; R&D explores next-gen correctors and gene editing."
  },
  {
    company: "BeiGene",
    target: "BTK",
    stage: "phase3",
    indication: "Lymphoma",
    note: "Late-stage trials benchmark safety profiles versus first-generation BTK inhibitors."
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
  },
  "ref-3": {
    id: "ref-3",
    title: "Network perturbation signatures predict drug synergy",
    abstract:
      "Perturbation-informed network signatures are evaluated for their ability to forecast combination efficacy across models and contexts.",
    keyFindings: [
      "Synergy signals are more stable at pathway level than at single-gene level.",
      "Network priors improve generalization across cell lines.",
      "Validated combinations show stronger transcriptional convergence."
    ]
  },
  "ref-4": {
    id: "ref-4",
    title: "Single-cell atlas of tumor immune evasion programs",
    abstract:
      "Single-cell profiling across tumors reveals shared immune evasion programs and their association with therapy response.",
    keyFindings: [
      "IFN-related states correlate with antigen presentation loss.",
      "Evasion programs recur across lineages with context-specific regulators.",
      "Spatial neighborhoods influence immune suppression intensity."
    ]
  },
  "ref-5": {
    id: "ref-5",
    title: "Meta-analysis of KRAS resistance mechanisms across solid tumors",
    abstract:
      "A cross-study meta-analysis catalogs resistance mechanisms to KRAS pathway targeting and highlights bypass routes.",
    keyFindings: [
      "MAPK pathway reactivation is a common resistance route.",
      "RTK upregulation supports adaptive bypass signaling.",
      "Combination hypotheses are supported by multi-cohort recurrence."
    ]
  },
  "ref-6": {
    id: "ref-6",
    title: "CRISPRi screens identify context-specific essential regulators",
    abstract:
      "CRISPR interference screens uncover regulatory dependencies and refine essentiality calls in diverse cancer models.",
    keyFindings: [
      "Regulator dependencies vary strongly by lineage and genotype.",
      "CRISPRi reduces cutting toxicity confounders.",
      "Hits replicate better when aggregated into modules."
    ]
  },
  "ref-7": {
    id: "ref-7",
    title: "Knowledge graph embeddings for target-disease prioritization",
    abstract:
      "Embedding models over biomedical knowledge graphs are benchmarked for target-disease scoring and prioritization.",
    keyFindings: [
      "Graph embeddings integrate heterogeneous evidence at scale.",
      "Negative sampling strategy affects ranking calibration.",
      "Genetic edges improve precision for causal targets."
    ]
  },
  "ref-8": {
    id: "ref-8",
    title: "Proteogenomic stratification of lung adenocarcinoma",
    abstract:
      "Proteogenomic profiling stratifies LUAD into actionable subtypes and identifies signaling rewiring not captured by RNA alone.",
    keyFindings: [
      "Protein-level pathway activity better tracks response phenotypes.",
      "Subtype markers show multi-omic concordance in subsets.",
      "Therapy hypotheses emerge from phosphoproteomic networks."
    ]
  },
  "ref-9": {
    id: "ref-9",
    title: "Quantifying off-target liabilities in kinase programs",
    abstract:
      "Systematic profiling quantifies off-target liabilities and proposes triage metrics for kinase inhibitor programs.",
    keyFindings: [
      "Broad kinome activity correlates with safety signals.",
      "Selectivity windows vary by scaffold family.",
      "Early profiling reduces late-stage attrition risk."
    ]
  },
  "ref-10": {
    id: "ref-10",
    title: "Longitudinal ctDNA monitoring to detect early resistance",
    abstract:
      "Longitudinal ctDNA analyses provide early detection of resistance and inform adaptive trial strategies.",
    keyFindings: [
      "ctDNA changes precede radiographic progression.",
      "Emergent variants suggest mechanism-specific escapes.",
      "Monitoring enables earlier therapy modification."
    ]
  },
  "ref-11": {
    id: "ref-11",
    title: "Benchmarking LLM-assisted biomedical evidence synthesis",
    abstract:
      "Benchmarking evaluates LLM assistance for biomedical evidence synthesis across citation-heavy tasks.",
    keyFindings: [
      "LLMs accelerate screening but require citation validation.",
      "Prompt constraints reduce unsupported claims.",
      "Human-in-the-loop workflows improve reliability."
    ]
  },
  "ref-12": {
    id: "ref-12",
    title: "Spatial transcriptomics reveals niche-specific signaling",
    abstract:
      "Spatial transcriptomics identifies niche-specific signaling programs that shape response heterogeneity.",
    keyFindings: [
      "Stromal niches modulate tumor pathway activity.",
      "Spatial proximity predicts expression coupling.",
      "Niche programs associate with treatment outcomes."
    ]
  },
  "ref-13": {
    id: "ref-13",
    title: "Causal inference for perturbation-based target validation",
    abstract:
      "Causal inference methods are applied to perturbation data to reduce confounding and improve hit confidence.",
    keyFindings: [
      "Adjustment improves cross-batch comparability.",
      "Causal scores align with independent validations.",
      "Sensitivity analyses surface fragile hits."
    ]
  },
  "ref-14": {
    id: "ref-14",
    title: "Pan-cancer pathway activity scoring from bulk RNA-seq",
    abstract:
      "Pathway activity scoring methods are compared across pan-cancer RNA-seq cohorts for robustness and transferability.",
    keyFindings: [
      "Scores are robust to cohort composition shifts.",
      "Pathway-level readouts reduce noise from single genes.",
      "Validated scores correlate with clinical endpoints."
    ]
  },
  "ref-15": {
    id: "ref-15",
    title: "Drug-target residence time predicts in vivo efficacy",
    abstract:
      "A review of residence time highlights kinetic parameters that influence durable target engagement and efficacy.",
    keyFindings: [
      "Residence time can be more predictive than affinity.",
      "Kinetic selectivity improves functional specificity.",
      "Assay context affects measured kinetics."
    ]
  },
  "ref-16": {
    id: "ref-16",
    title: "Synthetic lethal interaction landscapes for DNA repair genes",
    abstract:
      "Systematic mapping of synthetic lethal interactions across DNA repair genes reveals biomarker-linked vulnerability clusters.",
    keyFindings: [
      "Vulnerability clusters reflect pathway topology.",
      "Biomarkers stratify responders in model systems.",
      "Combinations support PARP-adjacent strategies."
    ]
  },
  "ref-17": {
    id: "ref-17",
    title: "Targeted protein degradation in oncology: lessons from first waves",
    abstract:
      "An overview of early targeted protein degradation programs and constraints shaping clinical translation.",
    keyFindings: [
      "E3 ligase expression affects degrader performance.",
      "Degradation can overcome some resistance mechanisms.",
      "Safety and distribution remain key bottlenecks."
    ]
  },
  "ref-18": {
    id: "ref-18",
    title: "Clinical trial endpoints for biomarker-enriched cohorts",
    abstract:
      "Endpoint and enrichment design choices are analyzed for precision oncology trials with biomarker-defined cohorts.",
    keyFindings: [
      "Enrichment increases power but risks selection bias.",
      "Endpoints must reflect mechanism and line of therapy.",
      "Adaptive designs can reduce time-to-signal."
    ]
  },
  "ref-19": {
    id: "ref-19",
    title: "Estimating target tractability from structural and chemogenomic features",
    abstract:
      "Tractability models combine structural and chemogenomic features to estimate development feasibility across target classes.",
    keyFindings: [
      "Pocket features correlate with hit discovery rates.",
      "Chemogenomic priors improve class-specific estimates.",
      "Uncertainty helps prioritize experimental follow-up."
    ]
  },
  "ref-20": {
    id: "ref-20",
    title: "Multi-modal fusion models for target discovery",
    abstract:
      "Multi-modal fusion models combine omics, knowledge graphs, and literature to improve ranking stability and calibration.",
    keyFindings: [
      "Fusion reduces modality-specific blind spots.",
      "Calibration improves triage thresholds for follow-up.",
      "Performance gains are strongest in low-signal settings."
    ]
  }
};

const mockLiteratureKo: LiteratureItem[] = [
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
  },
  {
    id: "ref-3",
    title: "네트워크 섭동 시그니처 기반 약물 병용 시너지 예측",
    source: "Nature Biotechnology",
    year: 2023,
    url: "https://example.org/nbt-synergy",
    summary:
      "경로 수준 섭동 시그니처를 통합하면 병용 반응 예측의 재현성과 일반화 성능이 향상됩니다."
  },
  {
    id: "ref-4",
    title: "종양 면역 회피 프로그램의 단일세포 아틀라스",
    source: "Science",
    year: 2024,
    url: "https://example.org/science-immune-atlas",
    summary:
      "단일세포 상태 전이가 IFN 신호 및 항원제시 저하와 연결된 공통 면역 회피 모듈을 드러냅니다."
  },
  {
    id: "ref-5",
    title: "고형암에서 KRAS 내성 기전 메타분석",
    source: "Cancer Cell",
    year: 2022,
    url: "https://example.org/cancercell-kras-resistance",
    summary:
      "다수 연구를 통합해 반복되는 우회 신호 경로를 정리하고 병용 타깃 가설을 제시합니다."
  },
  {
    id: "ref-6",
    title: "CRISPRi 스크리닝을 통한 맥락 의존 필수 조절자 규명",
    source: "Cell",
    year: 2023,
    url: "https://example.org/cell-crispri-essential",
    summary:
      "CRISPRi 프로파일링은 계통 특이적 전사 조절 의존성을 드러내고 essentiality 추정을 정교화합니다."
  },
  {
    id: "ref-7",
    title: "지식 그래프 임베딩 기반 타깃-질환 우선순위화",
    source: "PNAS",
    year: 2021,
    url: "https://example.org/pnas-kg-embeddings",
    summary:
      "유전학·경로·문헌 신호를 통합한 그래프 표현 학습이 타깃 랭킹 정확도를 개선합니다."
  },
  {
    id: "ref-8",
    title: "폐선암 프로테오유전체 기반 층화",
    source: "Nature Medicine",
    year: 2022,
    url: "https://example.org/nm-proteogenomics-luad",
    summary:
      "다중오믹스 층화로 실행 가능한 아형을 도출하고 전사체만으로는 보이지 않는 신호 재배선을 제시합니다."
  },
  {
    id: "ref-9",
    title: "키나아제 프로그램에서 오프타깃 위험도 정량화",
    source: "Cell Chemical Biology",
    year: 2020,
    url: "https://example.org/ccb-kinase-offtarget",
    summary:
      "광범위 kinome 프로파일링으로 오프타깃 리스크를 조기 평가해 안전성 실패를 줄이는 전략을 제안합니다."
  },
  {
    id: "ref-10",
    title: "종단 ctDNA 모니터링을 통한 조기 내성 탐지",
    source: "NEJM",
    year: 2023,
    url: "https://example.org/nejm-ctdna-resistance",
    summary:
      "ctDNA 추적은 영상학적 진행보다 앞서 내성을 포착해 치료 전략 전환 시점을 앞당깁니다."
  },
  {
    id: "ref-11",
    title: "LLM 기반 바이오메디컬 근거 합성 벤치마킹",
    source: "Nature",
    year: 2025,
    url: "https://example.org/nature-llm-evidence",
    summary:
      "LLM은 스크리닝을 가속하지만, 인용 정확도 보장을 위한 검증 워크플로우가 필요함을 보여줍니다."
  },
  {
    id: "ref-12",
    title: "공간 전사체로 드러나는 니치 특이 신호",
    source: "Cell",
    year: 2024,
    url: "https://example.org/cell-spatial-niches",
    summary:
      "공간 해상도의 프로그램이 종양-기질 상호작용과 반응 이질성을 연결합니다."
  },
  {
    id: "ref-13",
    title: "섭동 기반 타깃 검증을 위한 인과추론",
    source: "Genome Biology",
    year: 2021,
    url: "https://example.org/gb-causal-perturb",
    summary:
      "인과 모델링은 스크리닝 데이터의 교란을 줄여 후보 선택의 신뢰도를 높입니다."
  },
  {
    id: "ref-14",
    title: "벌크 RNA-seq 기반 범암종 경로 활성 점수화",
    source: "Bioinformatics",
    year: 2020,
    url: "https://example.org/bioinf-pathway-score",
    summary:
      "경로 점수화는 코호트 간 비교를 가능하게 하고 단일 유전자 노이즈를 완화합니다."
  },
  {
    id: "ref-15",
    title: "표적 결합 residence time과 in vivo 효능의 관계",
    source: "Nature Reviews Drug Discovery",
    year: 2019,
    url: "https://example.org/nrdd-residence-time",
    summary:
      "친화도보다 결합 지속시간이 지속적 경로 억제와 임상 효능에 더 직접적으로 연관될 수 있습니다."
  },
  {
    id: "ref-16",
    title: "DNA 복구 유전자의 synthetic lethal 지형",
    source: "Molecular Cell",
    year: 2022,
    url: "https://example.org/molcell-dna-repair-sl",
    summary:
      "DNA 복구 취약점은 경로 토폴로지에 따라 군집을 이루며 바이오마커 기반 환자 선택을 뒷받침합니다."
  },
  {
    id: "ref-17",
    title: "종양학에서의 표적 단백질 분해: 초기 파동의 교훈",
    source: "Cancer Discovery",
    year: 2024,
    url: "https://example.org/cd-tpd-lessons",
    summary:
      "초기 임상 degraders는 설계 제약과 기회 영역을 드러내며 기존 난공략 타깃에 대한 접근을 확장합니다."
  },
  {
    id: "ref-18",
    title: "바이오마커 강화 코호트에서의 임상시험 endpoint",
    source: "Lancet Oncology",
    year: 2021,
    url: "https://example.org/lo-endpoints-biomarker",
    summary:
      "엔드포인트 및 강화 전략 선택은 precision oncology 시험의 검정력과 해석 가능성에 큰 영향을 줍니다."
  },
  {
    id: "ref-19",
    title: "구조/케모제노믹 특징 기반 타깃 tractability 추정",
    source: "eLife",
    year: 2020,
    url: "https://example.org/elife-tractability",
    summary:
      "구조적 포켓과 케모제노믹 사전분포를 결합해 타깃 클래스별 개발 가능성을 추정합니다."
  },
  {
    id: "ref-20",
    title: "타깃 디스커버리를 위한 멀티모달 융합 모델",
    source: "Cell Systems",
    year: 2025,
    url: "https://example.org/cellsystems-multimodal-fusion",
    summary:
      "오믹스·지식그래프·문헌 신호를 융합해 랭킹 안정성과 보정(calibration)을 개선합니다."
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
  },
  {
    company: "Amgen",
    target: "KRAS G12C",
    stage: "approved",
    indication: "비소세포폐암",
    note: "승인 이후 연구에서 면역항암제 및 후속 병용 전략의 최적 순서를 탐색 중입니다."
  },
  {
    company: "Pfizer",
    target: "KRAS G12C",
    stage: "phase3",
    indication: "비소세포폐암",
    note: "내성 완화 및 반응 지속성 개선을 목표로 병용 디자인을 강화하고 있습니다."
  },
  {
    company: "Roche",
    target: "MET",
    stage: "phase2",
    indication: "고형암",
    note: "증폭 및 exon14 skipping 하위군을 중심으로 바이오마커 기반 코호트를 운영합니다."
  },
  {
    company: "Bristol Myers Squibb",
    target: "MDM2",
    stage: "phase1",
    indication: "육종",
    note: "p53 활성화 효능과 혈액학적 독성의 균형을 맞추기 위한 용량 최적화가 진행 중입니다."
  },
  {
    company: "Merck",
    target: "PD-1",
    stage: "approved",
    indication: "다수 적응증",
    note: "광범위 라벨을 바탕으로 내성 환자군에서의 신규 병용을 지속적으로 평가합니다."
  },
  {
    company: "Gilead",
    target: "TIGIT",
    stage: "phase2",
    indication: "비소세포폐암",
    note: "체크포인트 병용에서 반응률 개선을 위해 환자 층화 전략을 정교화하고 있습니다."
  },
  {
    company: "Regeneron",
    target: "LAG-3",
    stage: "phase2",
    indication: "흑색종",
    note: "PD-1 반응자 이후에도 혜택을 확장하기 위한 차세대 체크포인트 병용을 모색합니다."
  },
  {
    company: "Sanofi",
    target: "CD47",
    stage: "phase1",
    indication: "혈액암",
    note: "빈혈 리스크를 낮추면서 대식세포 활성화를 유지하는 안전성 중심 용량 전략을 적용합니다."
  },
  {
    company: "Takeda",
    target: "DDR1",
    stage: "preclinical",
    indication: "고형암",
    note: "섬유화 연관 미세환경 조절을 포함한 전임상 패키지를 구축 중입니다."
  },
  {
    company: "Eli Lilly",
    target: "PI3Kα",
    stage: "approved",
    indication: "유방암",
    note: "내분비치료 및 CDK 억제제와의 병용을 포함한 라벨 확장 연구를 진행합니다."
  },
  {
    company: "Bayer",
    target: "ATR",
    stage: "phase2",
    indication: "난소암",
    note: "DDR 표적 접근을 PARP 억제제 병용과 결합해 바이오마커 코호트에서 평가합니다."
  },
  {
    company: "Johnson & Johnson",
    target: "EGFR",
    stage: "approved",
    indication: "비소세포폐암",
    note: "차세대 억제제에서 CNS 침투 및 내성 변이 출현을 중점적으로 추적합니다."
  },
  {
    company: "AbbVie",
    target: "BCL-2",
    stage: "approved",
    indication: "만성 림프구성 백혈병",
    note: "고정 기간 치료 및 MRD 기반 중단 규칙을 중심으로 병용 레짐을 최적화합니다."
  },
  {
    company: "Seagen",
    target: "HER2",
    stage: "phase3",
    indication: "유방암",
    note: "ADC 프로그램이 저발현군 및 조기 라인으로 확장 가능성을 평가합니다."
  },
  {
    company: "Moderna",
    target: "개인맞춤 네오항원 백신",
    stage: "phase2",
    indication: "흑색종",
    note: "mRNA 백신과 체크포인트 병용으로 반응의 깊이와 지속성을 높이는 전략을 시험합니다."
  },
  {
    company: "BioNTech",
    target: "mRNA 면역치료",
    stage: "phase1",
    indication: "고형암",
    note: "다중 항원 구성 및 면역조절 병용을 포함한 초기 탐색 임상을 수행합니다."
  },
  {
    company: "Vertex",
    target: "낭포성 섬유증",
    stage: "approved",
    indication: "CF",
    note: "CFTR 모듈레이터 기반 시장 주도; 차세대 corrector 및 유전자 편집을 탐색합니다."
  },
  {
    company: "BeiGene",
    target: "BTK",
    stage: "phase3",
    indication: "림프종",
    note: "1세대 BTK 대비 안전성 프로파일을 벤치마크하는 후기 임상을 수행 중입니다."
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
  },
  "ref-3": {
    id: "ref-3",
    title: "네트워크 섭동 시그니처 기반 약물 병용 시너지 예측",
    abstract:
      "네트워크 및 경로 수준의 섭동 시그니처를 활용해 병용 요법의 시너지를 예측하는 접근을 평가합니다.",
    keyFindings: [
      "경로 수준 시그니처가 단일 유전자보다 안정적입니다.",
      "네트워크 prior가 외삽 일반화를 개선합니다.",
      "검증된 병용은 전사체 수렴 패턴이 강합니다."
    ]
  },
  "ref-4": {
    id: "ref-4",
    title: "종양 면역 회피 프로그램의 단일세포 아틀라스",
    abstract:
      "다양한 종양에서 단일세포 수준으로 면역 회피 프로그램을 규명하고 치료 반응과의 연관성을 분석합니다.",
    keyFindings: [
      "IFN 관련 상태가 항원제시 저하와 연관됩니다.",
      "계통을 넘어 반복되는 회피 모듈이 관찰됩니다.",
      "공간적 니치가 면역 억제 강도에 영향을 줍니다."
    ]
  },
  "ref-5": {
    id: "ref-5",
    title: "고형암에서 KRAS 내성 기전 메타분석",
    abstract:
      "KRAS 경로 표적 치료에 대한 내성 기전을 연구 간 통합 분석해 반복되는 우회 경로를 정리합니다.",
    keyFindings: [
      "MAPK 재활성화가 흔한 내성 경로입니다.",
      "RTK 상향 조절이 적응적 우회를 지원합니다.",
      "병용 가설이 다수 코호트에서 반복됩니다."
    ]
  },
  "ref-6": {
    id: "ref-6",
    title: "CRISPRi 스크리닝을 통한 맥락 의존 필수 조절자 규명",
    abstract:
      "CRISPRi 스크리닝으로 계통 및 유전형 맥락에 따른 조절자 의존성을 규명하고 후보를 정교화합니다.",
    keyFindings: [
      "조절자 의존성은 계통/유전형에 따라 크게 달라집니다.",
      "cutting toxicity 교란이 감소합니다.",
      "모듈 단위 집계로 재현성이 향상됩니다."
    ]
  },
  "ref-7": {
    id: "ref-7",
    title: "지식 그래프 임베딩 기반 타깃-질환 우선순위화",
    abstract:
      "바이오메디컬 지식 그래프 임베딩을 이용해 타깃-질환 점수화를 수행하고 성능을 비교합니다.",
    keyFindings: [
      "이질적 근거를 스케일로 통합할 수 있습니다.",
      "샘플링 전략이 보정(calibration)에 영향을 줍니다.",
      "유전학 엣지가 인과 타깃 정밀도를 높입니다."
    ]
  },
  "ref-8": {
    id: "ref-8",
    title: "폐선암 프로테오유전체 기반 층화",
    abstract:
      "LUAD에서 프로테오유전체 기반 층화로 실행 가능한 아형과 신호 재배선을 규명합니다.",
    keyFindings: [
      "단백질 수준 경로 활성도가 반응과 더 잘 연관됩니다.",
      "일부 아형에서 다중오믹스 일치가 관찰됩니다.",
      "인산화 네트워크로 치료 가설을 도출합니다."
    ]
  },
  "ref-9": {
    id: "ref-9",
    title: "키나아제 프로그램에서 오프타깃 위험도 정량화",
    abstract:
      "키나아제 억제제의 오프타깃 위험도를 정량화하고 조기 triage를 위한 지표를 제안합니다.",
    keyFindings: [
      "광범위 활성은 안전성 시그널과 연관됩니다.",
      "스캐폴드 계열별 선택성 창이 다릅니다.",
      "조기 프로파일링이 후기 실패 리스크를 낮춥니다."
    ]
  },
  "ref-10": {
    id: "ref-10",
    title: "종단 ctDNA 모니터링을 통한 조기 내성 탐지",
    abstract:
      "ctDNA 종단 분석으로 내성 발생을 조기 탐지하고 적응적 임상 전략을 지원합니다.",
    keyFindings: [
      "ctDNA 변화가 영상학적 진행보다 빠릅니다.",
      "출현 변이가 기전별 회피를 시사합니다.",
      "모니터링으로 치료 전환을 앞당길 수 있습니다."
    ]
  },
  "ref-11": {
    id: "ref-11",
    title: "LLM 기반 바이오메디컬 근거 합성 벤치마킹",
    abstract:
      "인용 중심 작업에서 LLM 보조 근거 합성을 평가하고 신뢰성 확보 조건을 분석합니다.",
    keyFindings: [
      "스크리닝 속도는 개선되나 인용 검증이 필요합니다.",
      "제약된 프롬프트가 허위 주장 가능성을 낮춥니다.",
      "human-in-the-loop이 품질을 끌어올립니다."
    ]
  },
  "ref-12": {
    id: "ref-12",
    title: "공간 전사체로 드러나는 니치 특이 신호",
    abstract:
      "공간 전사체 데이터로 니치 특이 신호가 반응 이질성에 미치는 영향을 분석합니다.",
    keyFindings: [
      "기질 니치가 종양 경로 활성도를 조절합니다.",
      "공간 근접성이 발현 결합을 예측합니다.",
      "니치 프로그램이 치료 결과와 연관됩니다."
    ]
  },
  "ref-13": {
    id: "ref-13",
    title: "섭동 기반 타깃 검증을 위한 인과추론",
    abstract:
      "섭동 데이터에 인과추론을 적용해 교란을 줄이고 후보 신뢰도를 개선합니다.",
    keyFindings: [
      "보정으로 배치 간 비교가 개선됩니다.",
      "인과 점수가 독립 검증과 더 잘 맞습니다.",
      "민감도 분석으로 취약 후보를 드러냅니다."
    ]
  },
  "ref-14": {
    id: "ref-14",
    title: "벌크 RNA-seq 기반 범암종 경로 활성 점수화",
    abstract:
      "범암종 RNA-seq에서 경로 점수화 기법의 강건성과 전이성을 비교합니다.",
    keyFindings: [
      "코호트 구성 변화에도 비교적 강건합니다.",
      "경로 수준 지표가 단일 유전자 노이즈를 줄입니다.",
      "임상 지표와의 상관이 관찰됩니다."
    ]
  },
  "ref-15": {
    id: "ref-15",
    title: "표적 결합 residence time과 in vivo 효능의 관계",
    abstract:
      "결합 지속시간이 약효 지속성과 기능적 선택성에 미치는 영향을 정리합니다.",
    keyFindings: [
      "친화도보다 예측력이 높을 수 있습니다.",
      "kinetic selectivity가 기능적 특이성을 개선합니다.",
      "측정 조건에 따라 값이 달라질 수 있습니다."
    ]
  },
  "ref-16": {
    id: "ref-16",
    title: "DNA 복구 유전자의 synthetic lethal 지형",
    abstract:
      "DNA 복구 유전자 간 synthetic lethal 상호작용을 체계적으로 매핑해 바이오마커를 제시합니다.",
    keyFindings: [
      "취약점 군집이 경로 토폴로지를 반영합니다.",
      "바이오마커로 반응자 층화가 가능합니다.",
      "PARP 인접 병용 전략을 지지합니다."
    ]
  },
  "ref-17": {
    id: "ref-17",
    title: "종양학에서의 표적 단백질 분해: 초기 파동의 교훈",
    abstract:
      "TPD 프로그램의 초기 임상 경험을 바탕으로 번역상의 제약과 기회를 정리합니다.",
    keyFindings: [
      "E3 ligase 발현이 성능에 영향을 줍니다.",
      "일부 내성 기전을 우회할 수 있습니다.",
      "안전성과 분포가 핵심 병목입니다."
    ]
  },
  "ref-18": {
    id: "ref-18",
    title: "바이오마커 강화 코호트에서의 임상시험 endpoint",
    abstract:
      "바이오마커 강화 설계에서 endpoint 선택과 통계적 검정력의 트레이드오프를 분석합니다.",
    keyFindings: [
      "강화는 검정력을 높이지만 편향 위험이 있습니다.",
      "endpoint는 기전과 치료 라인에 맞춰야 합니다.",
      "적응 설계가 신호 확인 시간을 단축할 수 있습니다."
    ]
  },
  "ref-19": {
    id: "ref-19",
    title: "구조/케모제노믹 특징 기반 타깃 tractability 추정",
    abstract:
      "구조 및 케모제노믹 특징을 결합해 타깃 개발 가능성을 추정하는 모델을 제시합니다.",
    keyFindings: [
      "포켓 특징이 hit 발견률과 연관됩니다.",
      "사전분포가 클래스별 추정을 개선합니다.",
      "불확실성이 후속 실험 우선순위를 돕습니다."
    ]
  },
  "ref-20": {
    id: "ref-20",
    title: "타깃 디스커버리를 위한 멀티모달 융합 모델",
    abstract:
      "오믹스·지식그래프·문헌 신호를 융합해 랭킹 안정성과 보정을 개선하는 모델을 평가합니다.",
    keyFindings: [
      "모달리티별 맹점을 상호 보완합니다.",
      "보정이 triage 임계값 설정에 유리합니다.",
      "저신호 환경에서 개선 폭이 큽니다."
    ]
  }
};

export function getMockLiterature(language: Language): LiteratureItem[] {
  return language === "ko" ? mockLiteratureKo : mockLiterature;
}

export function getMockPharmaReport(language: Language): PharmaReportItem[] {
  return language === "ko" ? mockPharmaReportKo : mockPharmaReport;
}

export function getMockReferenceDetails(language: Language): Record<string, ReferenceDetail> {
  return language === "ko" ? mockReferenceDetailsKo : mockReferenceDetails;
}
