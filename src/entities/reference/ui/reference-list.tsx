"use client";

import { useEffect, useMemo, useState } from "react";
import type { EvidenceItem, ReferenceDetail } from "@contracts/types";

interface Props {
  references: EvidenceItem[];
}

export function ReferenceList({ references }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReferenceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = useMemo(
    () => references.find((item) => item.id === selectedId) ?? references[0],
    [references, selectedId]
  );

  useEffect(() => {
    const currentId = selected?.id;
    if (!currentId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const loadDetail = async () => {
      try {
        const response = await fetch(`/api/references/${currentId}`);
        if (!response.ok) {
          throw new Error("Failed to load reference detail");
        }
        const payload = (await response.json()) as ReferenceDetail;
        if (!cancelled) {
          setDetail(payload);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unknown reference error";
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
  }, [selected?.id]);

  if (references.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No evidence loaded yet.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        {references.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-[#f69e25] hover:bg-[#f69e25]/5 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-[#f69e25] dark:hover:bg-[#f69e25]/10"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.source} · {item.year}
            </p>
          </button>
        ))}
      </div>
      {selected ? (
        <article className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{detail?.title ?? selected.title}</h4>
          {isLoading ? <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading abstract...</p> : null}
          {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          {!isLoading && !error ? (
            <>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{detail?.abstract ?? selected.summary}</p>
              {detail?.keyFindings?.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-gray-600 dark:text-gray-300">
                  {detail.keyFindings.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
          <a
            className="mt-3 inline-block text-xs font-medium text-[#f69e25] underline hover:text-[#e58e1a] dark:text-[#f69e25]"
            href={selected.url}
            target="_blank"
            rel="noreferrer"
          >
            Open source
          </a>
        </article>
      ) : null}
    </div>
  );
}
