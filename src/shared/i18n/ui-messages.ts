import type { Language } from "@/shared/language/language-config";

type UiText = {
  appName: string;
  loadingReportHistory: string;
  loadingReport: string;
  noSessionFound: string;
  queryPlaceholder: string;
  clarificationHint: string;
  send: string;
  reportHistory: string;
  newReport: string;
  historyDescription: string;
  retry: string;
  deleteReport: string;
  user: string;
  notSignedIn: string;
  googleLoginRequired: string;
  signOut: string;
  signInWithGoogle: string;
  deleteReportQuestion: string;
  deleteReportWarning: (title: string) => string;
  cancel: string;
  delete: string;
  workflowProgress: string;
  finalReport: string;
  evidence: string;
  geneGraph: string;
  pharmaReport: string;
  loading: string;
  done: string;
  error: string;
  idle: string;
  streamError: string;
  workflowStatus: string;
  workflowPausedByError: string;
  workflowProgressSummary: (percent: number, done: number, total: number) => string;
  stepDraftFinalReport: string;
  stepDraftFinalReportDesc: string;
  stepDraftFinalReportLoading: string;
  stepCollectEvidence: string;
  stepCollectEvidenceDesc: string;
  stepCollectEvidenceLoading: string;
  stepBuildGeneGraph: string;
  stepBuildGeneGraphDesc: string;
  stepBuildGeneGraphLoading: string;
  stepCompilePharma: string;
  stepCompilePharmaDesc: string;
  stepCompilePharmaLoading: string;
  stepCompleted: string;
  stepFailedRetry: string;
  inProgress: string;
  fail: string;
  pending: string;
  runStepAgain: (step: string) => string;
  retryStep: (step: string) => string;
  emptyWorkflowMessage: string;
  emptyWorkflowHint: string;
  yourQuery: string;
  assistant: string;
  assistantClarifying: string;
  streaming: string;
  waitingFinalReport: string;
  noPharmaYet: string;
  noEvidenceYet: string;
  loadingAbstract: string;
  loadReferenceFailed: string;
  openSource: string;
  signinDescription: string;
  googleAccessDenied: string;
  googleOAuthCallbackError: string;
  googleProviderNotConfigured: string;
  googleSignInFailed: string;
  devSignIn: string;
  closeMenu: string;
  openMenu: string;
  closeSettings: string;
  openSettings: string;
  theme: string;
  language: string;
  reset: string;
  apply: string;
  editTitle: string;
  save: string;
  reportNavPrev: string;
  reportNavNext: string;
  reportPageOf: (current: number, total: number) => string;
  reportReadyInTab: string;
};

const en: UiText = {
  appName: "Target Discovery Platform",
  loadingReportHistory: "Loading report history…",
  loadingReport: "Loading report…",
  noSessionFound: "No session found.",
  queryPlaceholder: "Enter your query or follow-up to create or update the report...",
  clarificationHint: "The assistant asked for clarification. Reply above to refine the report.",
  send: "Send",
  reportHistory: "Report History",
  newReport: "New report",
  historyDescription: "Final reports; use the input below to create or update via follow-up.",
  retry: "Retry",
  deleteReport: "Delete report",
  user: "User",
  notSignedIn: "Not signed in",
  googleLoginRequired: "Google login required",
  signOut: "Sign out",
  signInWithGoogle: "Sign in with Google",
  deleteReportQuestion: "Delete report?",
  deleteReportWarning: (title) => `“${title}” will be permanently deleted. This cannot be undone.`,
  cancel: "Cancel",
  delete: "Delete",
  workflowProgress: "Workflow Progress",
  finalReport: "Final Report",
  evidence: "Evidence",
  geneGraph: "Gene Graph",
  pharmaReport: "Pharma Report",
  loading: "loading",
  done: "done",
  error: "error",
  idle: "idle",
  streamError: "Stream error",
  workflowStatus: "Workflow status",
  workflowPausedByError: "Workflow paused due to an error.",
  workflowProgressSummary: (percent, done, total) => `${percent}% complete (${done}/${total} steps done)`,
  stepDraftFinalReport: "Draft final report",
  stepDraftFinalReportDesc: "Summarize key findings into a coherent narrative.",
  stepDraftFinalReportLoading: "Generating report narrative from streamed insights.",
  stepCollectEvidence: "Collect evidence",
  stepCollectEvidenceDesc: "Gather references and supporting literature.",
  stepCollectEvidenceLoading: "Loading references and ranking supporting studies.",
  stepBuildGeneGraph: "Build gene graph",
  stepBuildGeneGraphDesc: "Link genes, targets and pathways into a network view.",
  stepBuildGeneGraphLoading: "Constructing network nodes and edges.",
  stepCompilePharma: "Compile pharma view",
  stepCompilePharmaDesc: "Summarize clinical and pipeline activity.",
  stepCompilePharmaLoading: "Aggregating pharma pipeline and stage insights.",
  stepCompleted: "Completed",
  stepFailedRetry: "Failed. Please retry.",
  inProgress: "In progress",
  fail: "Fail",
  pending: "Pending",
  runStepAgain: (step) => `Run ${step} again`,
  retryStep: (step) => `Retry ${step}`,
  emptyWorkflowMessage:
    "Run an analysis to build a report. Progress and any follow-up questions from the assistant will appear here.",
  emptyWorkflowHint:
    "If your query is ambiguous, the assistant may ask for clarification; reply in the input below to refine the final report.",
  yourQuery: "Your query",
  assistant: "Assistant",
  assistantClarifying: "Assistant (asking for clarification)",
  streaming: "Streaming…",
  waitingFinalReport: "Waiting for final report…",
  noPharmaYet: "No pharma report loaded yet.",
  noEvidenceYet: "No evidence loaded yet.",
  loadingAbstract: "Loading abstract...",
  loadReferenceFailed: "Failed to load reference detail",
  openSource: "Open source",
  signinDescription: "Use Development sign in for local development, or Google when configured.",
  googleAccessDenied:
    "This Google account is not authorized. Ask admin to register your company domain or personal email.",
  googleOAuthCallbackError:
    "Google OAuth callback failed. Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and redirect URI in Google Cloud.",
  googleProviderNotConfigured:
    "Google sign-in is not configured on this server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  googleSignInFailed: "Google sign-in failed. Please try again.",
  devSignIn: "Development sign in",
  closeMenu: "Close menu",
  openMenu: "Open menu",
  closeSettings: "Close settings",
  openSettings: "Open settings",
  theme: "Theme",
  language: "Language",
  reset: "Reset",
  apply: "Apply",
  editTitle: "Edit title",
  save: "Save",
  reportNavPrev: "Previous report",
  reportNavNext: "Next report",
  reportPageOf: (current, total) => `${current} of ${total}`,
  reportReadyInTab: "Report ready. View in Final Report tab.",
};

const ko: UiText = {
  appName: "타겟 디스커버리 플랫폼",
  loadingReportHistory: "리포트 히스토리를 불러오는 중…",
  loadingReport: "리포트를 불러오는 중…",
  noSessionFound: "세션을 찾을 수 없습니다.",
  queryPlaceholder: "리포트 생성/수정을 위한 질의 또는 후속 질문을 입력하세요...",
  clarificationHint: "어시스턴트가 추가 확인을 요청했습니다. 위 입력창에 답변해 리포트를 보정하세요.",
  send: "전송",
  reportHistory: "리포트 히스토리",
  newReport: "새 리포트",
  historyDescription: "최종 리포트 목록입니다. 아래 입력창 후속 질의로 생성/업데이트할 수 있습니다.",
  retry: "재시도",
  deleteReport: "리포트 삭제",
  user: "사용자",
  notSignedIn: "로그인되지 않음",
  googleLoginRequired: "Google 로그인이 필요합니다",
  signOut: "로그아웃",
  signInWithGoogle: "Google로 로그인",
  deleteReportQuestion: "리포트를 삭제할까요?",
  deleteReportWarning: (title) => `“${title}” 리포트가 영구 삭제됩니다. 되돌릴 수 없습니다.`,
  cancel: "취소",
  delete: "삭제",
  workflowProgress: "워크플로우 진행",
  finalReport: "최종 리포트",
  evidence: "근거 문헌",
  geneGraph: "유전자 그래프",
  pharmaReport: "제약 리포트",
  loading: "로딩",
  done: "완료",
  error: "오류",
  idle: "대기",
  streamError: "스트림 오류",
  workflowStatus: "워크플로우 상태",
  workflowPausedByError: "오류로 인해 워크플로우가 중단되었습니다.",
  workflowProgressSummary: (percent, done, total) => `${percent}% 완료 (${done}/${total} 단계 완료)`,
  stepDraftFinalReport: "최종 리포트 초안 작성",
  stepDraftFinalReportDesc: "핵심 결과를 일관된 내러티브로 요약합니다.",
  stepDraftFinalReportLoading: "스트리밍 인사이트를 바탕으로 리포트 내러티브를 생성 중입니다.",
  stepCollectEvidence: "근거 수집",
  stepCollectEvidenceDesc: "참고문헌과 근거 문헌을 수집합니다.",
  stepCollectEvidenceLoading: "참고문헌을 불러오고 지원 근거를 순위화하는 중입니다.",
  stepBuildGeneGraph: "유전자 그래프 구축",
  stepBuildGeneGraphDesc: "유전자, 타깃, 경로를 네트워크 형태로 연결합니다.",
  stepBuildGeneGraphLoading: "네트워크 노드와 엣지를 구성하는 중입니다.",
  stepCompilePharma: "제약 뷰 작성",
  stepCompilePharmaDesc: "임상 및 파이프라인 동향을 요약합니다.",
  stepCompilePharmaLoading: "제약 파이프라인과 단계 인사이트를 집계 중입니다.",
  stepCompleted: "완료됨",
  stepFailedRetry: "실패했습니다. 다시 시도해 주세요.",
  inProgress: "진행 중",
  fail: "실패",
  pending: "대기",
  runStepAgain: (step) => `${step} 다시 실행`,
  retryStep: (step) => `${step} 재시도`,
  emptyWorkflowMessage: "분석을 실행하면 리포트가 생성됩니다. 진행 상태와 후속 질문이 이곳에 표시됩니다.",
  emptyWorkflowHint:
    "질의가 모호하면 어시스턴트가 추가 확인 질문을 할 수 있습니다. 아래 입력창에 답변해 최종 리포트를 보정하세요.",
  yourQuery: "내 질의",
  assistant: "어시스턴트",
  assistantClarifying: "어시스턴트 (추가 확인 질문)",
  streaming: "스트리밍 중…",
  waitingFinalReport: "최종 리포트를 기다리는 중…",
  noPharmaYet: "아직 제약 리포트가 없습니다.",
  noEvidenceYet: "아직 근거 문헌이 없습니다.",
  loadingAbstract: "초록을 불러오는 중...",
  loadReferenceFailed: "참고문헌 상세를 불러오지 못했습니다",
  openSource: "원문 열기",
  signinDescription: "로컬 개발에서는 Development 로그인, 설정된 경우 Google 로그인을 사용하세요.",
  googleAccessDenied:
    "이 Google 계정은 접근 권한이 없습니다. 관리자에게 회사 도메인 또는 개인 이메일 등록을 요청하세요.",
  googleOAuthCallbackError:
    "Google OAuth 콜백에 실패했습니다. Google Cloud의 redirect URI와 GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET를 확인하세요.",
  googleProviderNotConfigured:
    "이 서버에 Google 로그인이 설정되지 않았습니다. GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 설정하세요.",
  googleSignInFailed: "Google 로그인에 실패했습니다. 다시 시도해 주세요.",
  devSignIn: "Development 로그인",
  closeMenu: "메뉴 닫기",
  openMenu: "메뉴 열기",
  closeSettings: "설정 닫기",
  openSettings: "설정 열기",
  theme: "테마",
  language: "언어",
  reset: "초기화",
  apply: "적용",
  editTitle: "제목 수정",
  save: "저장",
  reportNavPrev: "이전 리포트",
  reportNavNext: "다음 리포트",
  reportPageOf: (current, total) => `${current} / ${total}`,
  reportReadyInTab: "리포트가 준비되었습니다. 최종 리포트 탭에서 확인하세요.",
};

export function getUiText(language: Language): UiText {
  return language === "ko" ? ko : en;
}
