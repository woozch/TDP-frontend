"use client";

import type { TabKey, TabStatus } from "@contracts/types";
import { useActiveTab } from "@/features/select-tab/model/use-active-tab";
import { useChatSessionStore } from "@/entities/chat-session/model/session-store";
import { ReferenceList } from "@/entities/reference/ui/reference-list";
import { GeneGraphView } from "@/entities/gene-graph/ui/gene-graph-view";

const tabs: { key: TabKey; label: string }[] = [
  { key: "chat", label: "Workflow Progress" },
  { key: "answer", label: "Final Report" },
  { key: "evidence", label: "Evidence" },
  { key: "graph", label: "Gene Graph" },
  { key: "pharma", label: "Pharma Report" }
];

const workflowSteps: { key: Exclude<TabKey, "chat">; title: string; description: string }[] = [
  {
    key: "answer",
    title: "Draft final report",
    description: "Summarize key findings into a coherent narrative."
  },
  {
    key: "evidence",
    title: "Collect evidence",
    description: "Gather references and supporting literature."
  },
  {
    key: "graph",
    title: "Build gene graph",
    description: "Link genes, targets and pathways into a network view."
  },
  {
    key: "pharma",
    title: "Compile pharma view",
    description: "Summarize clinical and pipeline activity."
  }
];

const formatStatus = (status: TabStatus) => {
  if (status === "loading") {
    return "loading";
  }
  if (status === "complete") {
    return "done";
  }
  if (status === "error") {
    return "error";
  }
  return "idle";
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
  const { activeTab, setActiveTab } = useActiveTab();
  const session = useChatSessionStore((state) => state.activeSession);

  if (!session) {
    return null;
  }

  return (
    <section className="flex h-full flex-col overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="sticky top-0 z-10 isolate mb-0 flex flex-col border-b border-gray-200 bg-white px-4 pb-2 pt-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const status = session.tabStatus[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  activeTab === tab.key
                    ? "border-[#f69e25] bg-[#f69e25]/15 text-[#c47a1a] dark:bg-[#f69e25]/20 dark:text-[#f69e25]"
                    : "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{tab.label}</span>
                  <TabStatusIndicator status={status} />
                  <span className="sr-only">· {formatStatus(status)}</span>
                </span>
              </button>
            );
          })}
        </div>
        {session.error ? (
          <p className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            Stream error: {session.error}
          </p>
        ) : null}
      </div>

      <div className="relative z-0 min-h-52 flex-1 p-4 pt-0 text-gray-800 dark:text-gray-200">
        {activeTab === "chat" ? (
          <div className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-600 dark:bg-gray-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Workflow status
              </p>
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
                                : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-100">
                          {step.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {status === "loading"
                          ? "In progress"
                          : status === "complete"
                            ? "Done"
                            : status === "error"
                              ? "Error"
                              : "Pending"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="max-h-80 space-y-3 overflow-auto pr-2">
              {session.messages.length === 0 ? (
                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <p>Run an analysis to build a report. Progress and any follow-up questions from the assistant will appear here.</p>
                  <p className="text-xs">If your query is ambiguous, the assistant may ask for clarification; reply in the input below to refine the final report.</p>
                </div>
              ) : (
                session.messages.map((message, index) => {
                  const isUser = message.role === "user";
                  const isClarifying =
                    !isUser &&
                    (message.isClarifyingQuestion === true ||
                      (typeof message.content === "string" && message.content.trim().endsWith("?")));
                  const label = isUser
                    ? "Your query"
                    : isClarifying
                      ? "Assistant (asking for clarification)"
                      : "Assistant";

                  return (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${message.id}-${index}`}
                      className={`rounded-lg p-3 text-sm ${
                        isUser
                          ? "ml-8 border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900/60"
                          : isClarifying
                            ? "mr-8 border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/15"
                            : "mr-8 border border-[#f69e25]/40 bg-[#f69e25]/10 dark:bg-[#f69e25]/15"
                      }`}
                    >
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {label}
                      </p>
                      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                        {message.content || (isUser ? "…" : "Streaming…")}
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
            {session.messages[session.messages.length - 1]?.content || "Waiting for final report…"}
          </article>
        ) : null}
        {activeTab === "evidence" ? <ReferenceList references={session.evidence} /> : null}
        {activeTab === "graph" ? (
          <GeneGraphView nodes={session.graphNodes} edges={session.graphEdges} />
        ) : null}
        {activeTab === "pharma" ? (
          <div className="space-y-2">
            {session.pharma.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No pharma report loaded yet.</p>
            ) : (
              session.pharma.map((item, idx) => (
                <div key={`${item.company}-${idx}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
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
