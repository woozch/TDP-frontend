"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TabKey, TabStatus, PharmaReportItem } from "@contracts/types";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { useActiveTab } from "@/features/select-tab/model/use-active-tab";
import { useRetryWorkflowStep } from "@/features/send-query/model/use-retry-workflow-step";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { ReferenceList } from "@/entities/reference/ui/reference-list";
import { GeneGraphView } from "@/entities/gene-graph/ui/gene-graph-view";
import { ReportListWithDetail } from "@/shared/ui/report-list-with-detail";

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

const RESULT_TAB_ORDER_KEY = "tdp-result-tab-order";
const DEFAULT_TAB_ORDER: TabKey[] = ["chat", "answer", "evidence", "graph", "pharma"];

function getStoredTabOrder(): TabKey[] {
  if (typeof window === "undefined") return [...DEFAULT_TAB_ORDER];
  try {
    const raw = window.localStorage.getItem(RESULT_TAB_ORDER_KEY);
    if (!raw) return [...DEFAULT_TAB_ORDER];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_TAB_ORDER];
    const set = new Set(DEFAULT_TAB_ORDER);
    const ordered = (parsed as string[]).filter((k): k is TabKey => set.has(k as TabKey));
    if (ordered.length !== set.size) return [...DEFAULT_TAB_ORDER];
    return ordered;
  } catch {
    return [...DEFAULT_TAB_ORDER];
  }
}

function saveTabOrder(order: TabKey[]) {
  try {
    window.localStorage.setItem(RESULT_TAB_ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

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

function FinalReportMarkdown({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm leading-7 text-gray-700 dark:text-gray-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">{children}</h3>
          ),
          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-brand/60 pl-3 italic text-gray-600 dark:text-gray-300">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-brand-ink underline decoration-brand/50 underline-offset-2 hover:text-brand dark:text-brand"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em] dark:bg-gray-700">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md bg-gray-100 p-2 text-xs dark:bg-gray-800">
              {children}
            </pre>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function FinalReportCarousel({
  messages,
  text,
}: {
  messages: { id: string; role: string; content: string; isClarifyingQuestion?: boolean }[];
  text: ReturnType<typeof getUiText>;
}) {
  const removeMessageFromActiveSession = useChatSessionStore(
    (state) => state.removeMessageFromActiveSession
  );
  const reportMessages = useMemo(
    () =>
      messages.filter(
        (m) => m.role === "assistant" && m.isClarifyingQuestion !== true
      ),
    [messages]
  );

  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, reportMessages.length - 1)
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reportMessages.length > 0) {
      setCurrentIndex((i) => Math.min(i, reportMessages.length - 1));
    }
  }, [reportMessages.length]);

  const clampedIndex = Math.min(
    Math.max(0, currentIndex),
    Math.max(0, reportMessages.length - 1)
  );
  const currentReport = reportMessages[clampedIndex];
  const total = reportMessages.length;
  const canPrev = clampedIndex > 0;
  const canNext = clampedIndex < total - 1;
  const content = currentReport?.content?.trim() ?? "";

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleExportMarkdown = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${clampedIndex + 1}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteReport = () => {
    if (!currentReport) return;
    if (!window.confirm(text.deleteReportTabConfirm)) return;
    removeMessageFromActiveSession(currentReport.id);
    setCurrentIndex((i) => Math.max(0, Math.min(i, reportMessages.length - 2)));
  };

  const iconButtonClass =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-700 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:opacity-40";

  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <FinalReportMarkdown
          content={content || text.waitingFinalReport}
        />
      </div>
      {total >= 1 ? (
        <nav
          className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-gray-200 bg-white py-3 dark:border-gray-600 dark:bg-gray-800"
          aria-label="Report navigation"
        >
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            aria-label={text.reportNavPrev}
            title={text.reportNavPrev}
            className={iconButtonClass}
          >
            <span aria-hidden>&lt;</span>
          </button>
          <span className="text-gray-400 dark:text-gray-500" aria-hidden>
            |
          </span>
          <span className="min-w-16 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
            {text.reportPageOf(clampedIndex + 1, total)}
          </span>
          <span className="text-gray-400 dark:text-gray-500" aria-hidden>
            |
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((i) => Math.min(total - 1, i + 1))
            }
            disabled={!canNext}
            aria-label={text.reportNavNext}
            title={text.reportNavNext}
            className={iconButtonClass}
          >
            <span aria-hidden>&gt;</span>
          </button>
          <span className="mx-1 text-gray-300 dark:text-gray-600">|</span>
          <button
            type="button"
            onClick={handleDeleteReport}
            title={text.deleteReportTab}
            aria-label={text.deleteReportTab}
            className={iconButtonClass}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!content}
            title={copied ? text.copyReportSuccess : text.copyReportContent}
            aria-label={text.copyReportContent}
            className={iconButtonClass}
          >
            {copied ? (
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={handleExportMarkdown}
            disabled={!content}
            title={text.exportMarkdown}
            aria-label={text.exportMarkdown}
            className={iconButtonClass}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              <path d="M8 7h8M8 11h8M8 15h4" />
            </svg>
          </button>
        </nav>
      ) : null}
    </article>
  );
}

function PharmaDetailPanel({
  item,
  text,
  onClose,
  showCloseButton,
  titleId,
  refNumber
}: {
  item: PharmaReportItem;
  text: ReturnType<typeof getUiText>;
  onClose: () => void;
  showCloseButton: boolean;
  titleId?: string;
  refNumber?: string;
}) {
  return (
    <article className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 id={titleId} className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {refNumber ? (
              <span className="mr-2 font-mono text-xs font-medium text-gray-500 dark:text-gray-400" aria-hidden>
                {refNumber}
              </span>
            ) : null}
            {item.company} · {item.target}
          </h4>
        </div>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 select-none rounded bg-transparent px-2 py-1 text-sm font-semibold leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100"
            aria-label={text.closeDetail}
          >
            <span aria-hidden>×</span>
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {item.stage} · {item.indication}
      </p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.note}</p>
    </article>
  );
}

function PharmaListWithDetail({ items, text }: { items: PharmaReportItem[]; text: ReturnType<typeof getUiText> }) {
  return (
    <ReportListWithDetail<PharmaReportItem>
      items={items}
      getRefNumber={(i) => `[P${i + 1}]`}
      getTitle={(p) => `${p.company} · ${p.target}`}
      getSubtitle={(p) => `${p.stage} · ${p.indication}`}
      getDescription={(p) => p.note}
      getItemKey={(p, idx) => `${p.company}-${p.target}-${idx}`}
      emptyMessage={text.noPharmaYet}
      closeDetailLabel={text.closeDetail}
      detailTitleId="pharma-detail-title"
      renderDetail={(item, _index, refNumber, onClose, showCloseButton) => (
        <PharmaDetailPanel
          item={item}
          text={text}
          onClose={onClose}
          showCloseButton={showCloseButton}
          titleId="pharma-detail-title"
          refNumber={refNumber}
        />
      )}
    />
  );
}

export function ResultTabs() {
  const { language } = useLanguage();
  const text = getUiText(language);
  const { activeTab, setActiveTab } = useActiveTab();
  const session = useChatSessionStore((state) => state.activeSession);
  const { retryStep } = useRetryWorkflowStep();

  const [tabOrder, setTabOrder] = useState<TabKey[]>(getStoredTabOrder);
  const [draggedTabKey, setDraggedTabKey] = useState<TabKey | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "chat", label: text.workflowProgress },
    { key: "answer", label: text.finalReport },
    { key: "evidence", label: text.evidence },
    { key: "graph", label: text.geneGraph },
    { key: "pharma", label: text.pharmaReport }
  ];

  const orderedTabs = useMemo(() => {
    const labelByKey: Record<TabKey, string> = {
      chat: text.workflowProgress,
      answer: text.finalReport,
      evidence: text.evidence,
      graph: text.geneGraph,
      pharma: text.pharmaReport
    };
    return tabOrder.map((key) => ({ key, label: labelByKey[key] }));
  }, [tabOrder, text.workflowProgress, text.finalReport, text.evidence, text.geneGraph, text.pharmaReport]);

  const workflowSteps = useMemo(() => {
    const stepByKey: Record<
      Exclude<TabKey, "chat">,
      { title: string; description: string; inProgressDetail: string }
    > = {
      answer: {
        title: text.stepDraftFinalReport,
        description: text.stepDraftFinalReportDesc,
        inProgressDetail: text.stepDraftFinalReportLoading
      },
      evidence: {
        title: text.stepCollectEvidence,
        description: text.stepCollectEvidenceDesc,
        inProgressDetail: text.stepCollectEvidenceLoading
      },
      graph: {
        title: text.stepBuildGeneGraph,
        description: text.stepBuildGeneGraphDesc,
        inProgressDetail: text.stepBuildGeneGraphLoading
      },
      pharma: {
        title: text.stepCompilePharma,
        description: text.stepCompilePharmaDesc,
        inProgressDetail: text.stepCompilePharmaLoading
      }
    };

    const orderedKeys = tabOrder.filter((key): key is Exclude<TabKey, "chat"> => key !== "chat");
    return orderedKeys.map((key) => ({ key, ...stepByKey[key] }));
  }, [
    tabOrder,
    text.stepDraftFinalReport,
    text.stepDraftFinalReportDesc,
    text.stepDraftFinalReportLoading,
    text.stepCollectEvidence,
    text.stepCollectEvidenceDesc,
    text.stepCollectEvidenceLoading,
    text.stepBuildGeneGraph,
    text.stepBuildGeneGraphDesc,
    text.stepBuildGeneGraphLoading,
    text.stepCompilePharma,
    text.stepCompilePharmaDesc,
    text.stepCompilePharmaLoading
  ]);

  if (!session) {
    return null;
  }

  const visibleTabs = session.workflowStarted
    ? orderedTabs
    : orderedTabs.filter((tab) => tab.key === "chat");
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

  const handleDragStart = useCallback((e: React.DragEvent, key: TabKey) => {
    setDraggedTabKey(key);
    e.dataTransfer.setData("text/plain", key);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTabKey(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropTargetKey: TabKey) => {
      e.preventDefault();
      const key = draggedTabKey;
      setDraggedTabKey(null);
      if (!key || key === dropTargetKey) return;
      const fromIdx = tabOrder.indexOf(key);
      const toIdx = tabOrder.indexOf(dropTargetKey);
      if (fromIdx === -1 || toIdx === -1) return;
      const next = tabOrder.slice();
      next.splice(fromIdx, 1);
      const newToIdx = next.indexOf(dropTargetKey);
      next.splice(newToIdx, 0, key);
      setTabOrder(next);
      saveTabOrder(next);
    },
    [draggedTabKey, tabOrder]
  );

  return (
    <section className="flex h-full flex-col overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="sticky top-0 z-10 isolate mb-0 flex flex-col border-b border-gray-200 bg-white px-4 pb-2 pt-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-wrap gap-2">
          {visibleTabs.map((tab) => {
            const status = session.tabStatus[tab.key];
            const isDragging = draggedTabKey === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                draggable={session.workflowStarted && visibleTabs.length > 1}
                onDragStart={(e) => handleDragStart(e, tab.key)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, tab.key)}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  isDragging ? "opacity-50" : ""
                } ${
                  activeTab === tab.key
                    ? "border-brand bg-brand/15 text-brand-ink dark:bg-brand/20 dark:text-brand"
                    : "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500"
                } ${session.workflowStarted && visibleTabs.length > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
                aria-label={session.workflowStarted && visibleTabs.length > 1 ? `${tab.label}, ${text.reorderTabHint}` : tab.label}
              >
                <span className="inline-flex items-center gap-1.5">
                  {session.workflowStarted && visibleTabs.length > 1 ? (
                    <span
                      className="shrink-0 text-gray-400 dark:text-gray-500"
                      aria-hidden
                      title={text.reorderTabHint}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <circle cx="9" cy="6" r="1.5" />
                        <circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" />
                        <circle cx="15" cy="18" r="1.5" />
                      </svg>
                    </span>
                  ) : null}
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

      <div className="relative z-0 flex min-h-0 flex-1 flex-col p-4 pt-0 text-gray-800 dark:text-gray-200">
        {activeTab === "chat" ? (
          <div className="space-y-4">
            {session.workflowStarted ? (
              <section className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-600 dark:bg-gray-900/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {text.workflowStatus}
                </p>
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        hasError ? "bg-red-500" : "bg-brand"
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
                                  ? "bg-brand"
                                : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-100">
                            {step.title}
                          </p>
                          {status === "loading" ? (
                            <p className="text-[11px] text-brand-ink dark:text-brand">
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
                              className={`inline-flex h-5 w-5 items-center justify-center rounded hover:bg-brand/10 ${
                                status === "error" ? "text-brand" : "text-emerald-500"
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
                  const isReport = !isUser && !isClarifying;
                  const isLastMessage = index === session.messages.length - 1;
                  const isStreamingReport =
                    isReport && isLastMessage && session.isStreaming;
                  const label = isUser
                    ? text.yourQuery
                    : isClarifying
                      ? text.assistantClarifying
                      : text.assistant;

                  const chatContent = isUser
                    ? message.content || "…"
                    : isClarifying
                      ? message.content || ""
                      : isStreamingReport
                        ? text.streaming
                        : text.reportReadyInTab;

                  return (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${message.id}-${index}`}
                      className={`rounded-lg p-3 text-sm ${
                        isUser
                          ? "ml-8 border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900/60"
                          : isClarifying
                            ? "mr-8 border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/15"
                            : "mr-8 border border-brand/40 bg-brand/10 dark:bg-brand/15"
                      }`}
                    >
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {label}
                      </p>
                      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                        {chatContent}
                      </p>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        ) : null}
        {activeTab === "answer" ? (
          <FinalReportCarousel messages={session.messages} text={text} />
        ) : null}
        {activeTab === "evidence" ? <ReferenceList references={session.evidence} /> : null}
        {activeTab === "graph" ? (
          <GeneGraphView nodes={session.graphNodes} edges={session.graphEdges} />
        ) : null}
        {activeTab === "pharma" ? (
          <PharmaListWithDetail items={session.pharma} text={text} />
        ) : null}
      </div>
    </section>
  );
}
