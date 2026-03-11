"use client";

import { useState } from "react";

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
  onSelectionChange,
  renderDetail
}: ReportListWithDetailProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex !== null ? items[selectedIndex] ?? null : null;
  const selectedRefNumber =
    selectedIndex !== null ? getRefNumber(selectedIndex) : "";

  const onClose = () => {
    setSelectedIndex(null);
    onSelectionChange?.(null);
  };

  const handleSelectIndex = (idx: number) => {
    setSelectedIndex(idx);
    onSelectionChange?.(idx);
  };

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

  return (
    <div className="relative flex h-full w-full min-h-0 flex-col">
      <div className="min-w-0 flex-1 overflow-y-auto">{listItems}</div>
      {detailPopup}
    </div>
  );
}
