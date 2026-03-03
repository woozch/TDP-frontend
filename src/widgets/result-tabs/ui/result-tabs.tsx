"use client";

import { useEffect } from "react";
import type { TabKey, TabStatus } from "@contracts/types";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { useActiveTab } from "@/features/select-tab/model/use-active-tab";
import { useRetryWorkflowStep } from "@/features/send-query/model/use-retry-workflow-step";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { ReferenceList } from "@/entities/reference/ui/reference-list";
import { GeneGraphView } from "@/entities/gene-graph/ui/gene-graph-view";

const formatStatus = (status: TabStatus, text: ReturnType<typeof getUiText>) => {
  if (status === "loading") {
    return text.loading;
  }
  if (status === "complete") {
    return text.done;
  }
  if (status === "error") {
    return text.error;
  }
  return text.idle;
};

const TAB_INDICATOR_SIZE = 14;

function TabStatusIndicator({ status }: { status: TabStatus }) {
  const size = TAB_INDICATOR_SIZE;
  const r = (size - 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 1.5;

  if (status === "complete") {
    return (
      <span className="inline-flex shrink-0 text-emerald-500" aria-hidden>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="currentColor" />
        </svg>
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex shrink-0 text-red-500" aria-hidden>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="currentColor" />
        </svg>
      </span>
    );
  }

  if (status === "loading") {
    const circumference = 2 * Math.PI * r;
    const gap = circumference * 0.25;
    return (
      <span className="inline-flex shrink-0 text-yellow-500" aria-hidden>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="animate-spin">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference - gap} ${gap}`}
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 text-gray-300 dark:text-gray-500" aria-hidden>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      </svg>
    </span>
  );
}

export function ResultTabs() {
  const { language } = useLanguage();
  const text = getUiText(language);
  const { activeTab, setActiveTab } = useActiveTab();
  const session = useChatSessionStore((state) => state.activeSession);
  const { retryStep } = useRetryWorkflowStep();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "chat", label: text.workflowProgress },
    { key: "answer", label: text.finalReport },
    { key: "evidence", label: text.evidence },
    { key: "graph", label: text.geneGraph },
    { key: "pharma", label: text.pharmaReport }
  ];

  const workflowSteps: {
    key: Exclude<TabKey, "chat">;
    title: string;
    description: string;
    inProgressDetail: string;
  }[] = [
    {
      key: "answer",
      title: text.stepDraftFinalReport,
      description: text.stepDraftFinalReportDesc,
      inProgressDetail: text.stepDraftFinalReportLoading
    },
    {
      key: "evidence",
      title: text.stepCollectEvidence,
      description: text.stepCollectEvidenceDesc,
      inProgressDetail: text.stepCollectEvidenceLoading
    },
    {
      key: "graph",
      title: text.stepBuildGeneGraph,
      description: text.stepBuildGeneGraphDesc,
      inProgressDetail: text.stepBuildGeneGraphLoading
    },
    {
      key: "pharma",
      title: text.stepCompilePharma,
      description: text.stepCompilePharmaDesc,
      inProgressDetail: text.stepCompilePharmaLoading
    }
  ];

  if (!session) {
    return null;
  }

  const visibleTabs = session.workflowStarted
    ? tabs
    : tabs.filter((tab) => tab.key === "chat");
  const totalWorkflowSteps = workflowSteps.length;
  const completedCount = workflowSteps.filter(
    (step) => session.tabStatus[step.key] === "complete"
  ).length;
  const loadingIndex = workflowSteps.findIndex(
    (step) => session.tabStatus[step.key] === "loading"
  );
  const hasError = workflowSteps.some((step) => session.tabStatus[step.key] === "error");
  const progressUnits =
    completedCount +
    (loadingIndex >= 0 && completedCount < totalWorkflowSteps ? 0.5 : 0);
  const progressPercent = Math.min(100, Math.round((progressUnits / totalWorkflowSteps) * 100));

  useEffect(() => {
    if (!session.workflowStarted && activeTab !== "chat") {
      setActiveTab("chat");
    }
  }, [activeTab, session.workflowStarted, setActiveTab]);

  return (
    <section className="flex h-full flex-col overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#3a404a] dark:bg-[#2a2f36]">
      <div className="sticky top-0 z-10 isolate mb-0 flex flex-col border-b border-gray-200 bg-white px-4 pb-2 pt-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:border-[#3a404a] dark:bg-[#2a2f36] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-wrap gap-2">
          {visibleTabs.map((tab) => {
            const status = session.tabStatus[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  activeTab === tab.key
                    ? "border-[#f69e25] bg-[#f69e25]/15 text-[#c47a1a] dark:bg-[#f69e25]/20 dark:text-[#f69e25]"
                    : "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{tab.label}</span>
                  <TabStatusIndicator status={status} />
                  <span className="sr-only">· {formatStatus(status, text)}</span>
                </span>
              </button>
            );
          })}
        </div>
        {session.error ? (
          <p className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            {text.streamError}: {session.error}
          </p>
        ) : null}
      </div>

      <div className="relative z-0 min-h-52 flex-1 p-4 pt-0 text-gray-800 dark:text-gray-200">
        {activeTab === "chat" ? (
          <div className="space-y-4">
            {session.workflowStarted ? (
              <section className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-[#4a515c] dark:bg-[#171a1f]/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {text.workflowStatus}
                </p>
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-[#343a43]">
                    <div
                      className={`h-full transition-all duration-500 ${
                        hasError ? "bg-red-500" : "bg-[#f69e25]"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    {hasError
                      ? text.workflowPausedByError
                      : text.workflowProgressSummary(progressPercent, completedCount, totalWorkflowSteps)}
                  </p>
                </div>
                <ul className="mt-2 space-y-2">
                  {workflowSteps.map((step) => {
                    const status = session.tabStatus[step.key];
                    const isLoading = status === "loading";
                    const isComplete = status === "complete";
                    const isError = status === "error";

                    return (
                      <li
                        key={step.key}
                        className="flex items-start gap-2 rounded-md px-2 py-1.5"
                      >
                        <span
                          className={`mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full ${
                            isError
                              ? "bg-red-500"
                              : isComplete
                                ? "bg-emerald-500"
                                : isLoading
                                  ? "bg-[#f69e25]"
                                : "bg-gray-300 dark:bg-[#4a515c]"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-100">
                            {step.title}
                          </p>
                          {status === "loading" ? (
                            <p className="text-[11px] text-[#c47a1a] dark:text-[#f69e25]">
                              {step.inProgressDetail}
                            </p>
                          ) : status === "complete" ? (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              {text.stepCompleted}
                            </p>
                          ) : status === "error" ? (
                            <p className="text-[11px] text-red-600 dark:text-red-400">
                              {text.stepFailedRetry}
                            </p>
                          ) : (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {step.description}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {status === "loading"
                            ? text.inProgress
                            : status === "complete"
                              ? text.done
                              : status === "error"
                                ? text.fail
                                : text.pending}
                          {status === "error" || status === "complete" ? (
                            <button
                              type="button"
                              onClick={() => void retryStep(step.key)}
                              className={`inline-flex h-5 w-5 items-center justify-center rounded hover:bg-[#f69e25]/10 ${
                                status === "error" ? "text-[#f69e25]" : "text-emerald-500"
                              }`}
                              title={
                                status === "complete"
                                  ? text.runStepAgain(step.title)
                                  : text.retryStep(step.title)
                              }
                              aria-label={
                                status === "complete"
                                  ? text.runStepAgain(step.title)
                                  : text.retryStep(step.title)
                              }
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <path d="M3 12a9 9 0 0 1 15.55-6.36L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-15.55 6.36L3 16" />
                                <path d="M8 16H3v5" />
                              </svg>
                            </button>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <section className="max-h-80 space-y-3 overflow-auto pr-2">
              {session.messages.length === 0 ? (
                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <p>{text.emptyWorkflowMessage}</p>
                  <p className="text-xs">{text.emptyWorkflowHint}</p>
                </div>
              ) : (
                session.messages.map((message, index) => {
                  const isUser = message.role === "user";
                  const isClarifying =
                    !isUser &&
                    (message.isClarifyingQuestion === true ||
                      (typeof message.content === "string" && message.content.trim().endsWith("?")));
                  const label = isUser
                    ? text.yourQuery
                    : isClarifying
                      ? text.assistantClarifying
                      : text.assistant;

                  return (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${message.id}-${index}`}
                      className={`rounded-lg p-3 text-sm ${
                        isUser
                          ? "ml-8 border border-gray-200 bg-white dark:border-[#4a515c] dark:bg-[#171a1f]/60"
                          : isClarifying
                            ? "mr-8 border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/15"
                            : "mr-8 border border-[#f69e25]/40 bg-[#f69e25]/10 dark:bg-[#f69e25]/15"
                      }`}
                    >
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {label}
                      </p>
                      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                        {message.content || (isUser ? "…" : text.streaming)}
                      </p>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        ) : null}
        {activeTab === "answer" ? (
          <article className="whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
            {session.messages[session.messages.length - 1]?.content || text.waitingFinalReport}
          </article>
        ) : null}
        {activeTab === "evidence" ? <ReferenceList references={session.evidence} /> : null}
        {activeTab === "graph" ? (
          <GeneGraphView nodes={session.graphNodes} edges={session.graphEdges} />
        ) : null}
        {activeTab === "pharma" ? (
          <div className="space-y-2">
            {session.pharma.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">{text.noPharmaYet}</p>
            ) : (
              session.pharma.map((item, idx) => (
                <div key={`${item.company}-${idx}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-[#4a515c] dark:bg-[#343a43]">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.company} · {item.target}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.stage} · {item.indication}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.note}</p>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
