"use client";

import { useCallback, useEffect, useState } from "react";
import type { EvidenceItem, ReferenceDetail } from "@contracts/types";
import { useLanguage } from "@/shared/language/language-context";
import { getUiText } from "@/shared/i18n/ui-messages";
import { ReportListWithDetail } from "@/shared/ui/report-list-with-detail";

interface Props {
  references: EvidenceItem[];
}

function EvidenceDetailPanel({
  selected,
  detail,
  isLoading,
  error,
  text,
  onClose,
  showCloseButton,
  titleId,
  refNumber
}: {
  selected: EvidenceItem;
  detail: ReferenceDetail | null;
  isLoading: boolean;
  error: string | null;
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
            {detail?.title ?? selected.title}
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
      {isLoading ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text.loadingAbstract}</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {!isLoading && !error ? (
        <>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {detail?.abstract ?? selected.summary}
          </p>
          {detail?.keyFindings?.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-gray-600 dark:text-gray-300">
              {detail.keyFindings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <a
            className="mt-3 inline-block text-xs font-medium text-brand underline hover:text-brand-hover dark:text-brand"
            href={selected.url}
            target="_blank"
            rel="noreferrer"
          >
            {text.openSource}
          </a>
        </>
      ) : null}
    </article>
  );
}

export function ReferenceList({ references }: Props) {
  const { language } = useLanguage();
  const text = getUiText(language);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReferenceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = references.find((r) => r.id === selectedId) ?? null;

  const onSelectionChange = useCallback(
    (index: number | null) => {
      setSelectedId(index !== null ? references[index]?.id ?? null : null);
    },
    [references]
  );

  useEffect(() => {
    if (!selected?.id) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const loadDetail = async () => {
      try {
        const response = await fetch(
          `/api/references/${selected.id}?language=${encodeURIComponent(language)}`
        );
        if (!response.ok) {
          throw new Error(text.loadReferenceFailed);
        }
        const payload = (await response.json()) as ReferenceDetail;
        if (!cancelled) {
          setDetail(payload);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Unknown reference error";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [language, selected?.id, text.loadReferenceFailed]);

  return (
    <ReportListWithDetail<EvidenceItem>
      items={references}
      getRefNumber={(i) => `[E${i + 1}]`}
      getTitle={(r) => r.title}
      getSubtitle={(r) => `${r.source} · ${r.year}`}
      getDescription={(r) => r.summary}
      getItemKey={(r) => r.id}
      emptyMessage={text.noEvidenceYet}
      closeDetailLabel={text.closeDetail}
      detailTitleId="evidence-detail-title"
      onSelectionChange={onSelectionChange}
      renderDetail={(item, _index, refNumber, onClose, showCloseButton) => (
        <EvidenceDetailPanel
          selected={item}
          detail={detail}
          isLoading={isLoading}
          error={error}
          text={text}
          onClose={onClose}
          showCloseButton={showCloseButton}
          titleId="evidence-detail-title"
          refNumber={refNumber}
        />
      )}
    />
  );
}
