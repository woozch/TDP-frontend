"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { UiButton } from "@/shared/ui/button";

export interface ReportListWithDetailProps<T> {
  items: T[];
  getRefNumber: (index: number) => string;
  getTitle: (item: T) => string;
  getSubtitle: (item: T) => string;
  getDescription: (item: T) => string;
  getItemKey: (item: T, index: number) => string;
  emptyMessage: string;
  closeDetailLabel: string;
  detailTitleId: string;
  /** Optional custom content rendered at the center of the bottom bar (e.g. pager). */
  footerCenter?: React.ReactNode;
  exportFileBaseName?: string;
  exportColumns?: { key: string; label: string }[];
  getExportRow?: (item: T, index: number) => Record<string, string | number | boolean | null | undefined>;
  exportButtonLabel?: string;
  exportCsvLabel?: string;
  exportExcelLabel?: string;
  exportJsonLabel?: string;
  /** Notify parent when selection changes (e.g. for loading detail by id). */
  onSelectionChange?: (index: number | null) => void;
  renderDetail: (
    item: T,
    index: number,
    refNumber: string,
    onClose: () => void,
    showCloseButton: boolean
  ) => React.ReactNode;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  const escaped = raw.replace(/"/g, "\"\"");
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

/**
 * Shared layout for Literature Report and Pharma Report tabs:
 * - List with ref number, title, subtitle, description per row (full width).
 * - All screen sizes: detail in popup modal on item click; popup is wider on large screens.
 */
export function ReportListWithDetail<T>({
  items,
  getRefNumber,
  getTitle,
  getSubtitle,
  getDescription,
  getItemKey,
  emptyMessage,
  closeDetailLabel,
  detailTitleId,
  footerCenter,
  exportFileBaseName,
  exportColumns,
  getExportRow,
  exportButtonLabel,
  exportCsvLabel,
  exportExcelLabel,
  exportJsonLabel,
  onSelectionChange,
  renderDetail
}: ReportListWithDetailProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex !== null ? items[selectedIndex] ?? null : null;
  const selectedRefNumber =
    selectedIndex !== null ? getRefNumber(selectedIndex) : "";

  const [exportOpen, setExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const onClose = () => {
    setSelectedIndex(null);
    onSelectionChange?.(null);
  };

  const handleSelectIndex = (idx: number) => {
    setSelectedIndex(idx);
    onSelectionChange?.(idx);
  };

  useEffect(() => {
    if (!exportOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (exportMenuRef.current?.contains(target)) return;
      setExportOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [exportOpen]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
    );
  }

  const listItems = (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div
          key={getItemKey(item, idx)}
          role="button"
          tabIndex={0}
          onClick={() => handleSelectIndex(idx)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleSelectIndex(idx);
            }
          }}
          className={`w-full rounded-lg border p-3 text-left transition ${
            selectedIndex === idx
              ? "border-brand bg-brand/10 dark:bg-brand/15"
              : "border-gray-200 bg-gray-50 hover:border-brand hover:bg-brand/5 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-brand dark:hover:bg-brand/10"
          } select-text cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              <span
                className="mr-2 font-mono text-xs font-medium text-gray-500 dark:text-gray-400"
                aria-hidden
              >
                {getRefNumber(idx)}
              </span>
              {getTitle(item)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {getSubtitle(item)}
            </p>
            <p className="mt-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-300 md:text-sm">
              {getDescription(item)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const detailPopup =
    selected !== null && selectedIndex !== null ? (
      <div
        className="absolute inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={detailTitleId}
      >
        <button
          type="button"
          aria-label={closeDetailLabel}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <div
          className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800 md:max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          {renderDetail(selected, selectedIndex, selectedRefNumber, onClose, true)}
        </div>
      </div>
    ) : null;

  const canExport =
    Boolean(exportFileBaseName) &&
    Boolean(exportColumns?.length) &&
    typeof getExportRow === "function";

  const handleExportCsv = () => {
    if (!canExport || !exportFileBaseName || !exportColumns || !getExportRow) return;
    const header = exportColumns.map((c) => toCsvValue(c.label)).join(",");
    const rows = items.map((item, idx) => {
      const row = getExportRow(item, idx);
      return exportColumns.map((c) => toCsvValue(row[c.key])).join(",");
    });
    const csv = [header, ...rows].join("\n");
    downloadBlob(`${exportFileBaseName}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8" }));
  };

  const handleExportExcel = () => {
    if (!canExport || !exportFileBaseName || !exportColumns || !getExportRow) return;
    const data = items.map((item, idx) => {
      const row = getExportRow(item, idx);
      const out: Record<string, string | number | boolean | null> = {};
      for (const col of exportColumns) {
        const v = row[col.key];
        out[col.label] = v === undefined ? null : (v as any);
      }
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const array = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    downloadBlob(
      `${exportFileBaseName}.xlsx`,
      new Blob([array], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    );
  };

  const handleExportJson = () => {
    if (!canExport || !exportFileBaseName || !exportColumns || !getExportRow) return;
    const data = items.map((item, idx) => {
      const row = getExportRow(item, idx);
      const out: Record<string, string | number | boolean | null> = {};
      for (const col of exportColumns) {
        const v = row[col.key];
        out[col.key] = v === undefined ? null : (v as any);
      }
      return out;
    });
    const json = JSON.stringify(data, null, 2);
    downloadBlob(`${exportFileBaseName}.json`, new Blob([json], { type: "application/json;charset=utf-8" }));
  };

  return (
    <div className="relative flex h-full w-full min-h-0 flex-col">
      <div className="min-w-0 flex-1 overflow-y-auto">{listItems}</div>
      {canExport || footerCenter ? (
        <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="relative flex items-center justify-center gap-3">
            {footerCenter ? <div className="min-w-0">{footerCenter}</div> : null}
            {canExport ? (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 shrink-0" ref={exportMenuRef}>
                {exportOpen ? (
                  <div className="absolute bottom-full right-0 mb-2 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10">
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-800 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      onClick={() => {
                        handleExportCsv();
                        setExportOpen(false);
                      }}
                    >
                      {exportCsvLabel ?? "Export CSV"}
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800" />
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-800 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      onClick={() => {
                        handleExportExcel();
                        setExportOpen(false);
                      }}
                    >
                      {exportExcelLabel ?? "Export Excel"}
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800" />
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-800 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      onClick={() => {
                        handleExportJson();
                        setExportOpen(false);
                      }}
                    >
                      {exportJsonLabel ?? "Export JSON"}
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setExportOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={exportOpen}
                  aria-label={exportButtonLabel ?? "Export"}
                  title={exportButtonLabel ?? "Export"}
                  className="inline-flex h-6 w-6 items-center justify-center rounded bg-transparent text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M12 15V3" />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {detailPopup}
    </div>
  );
}
