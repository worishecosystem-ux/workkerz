
"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface FinancePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function FinancePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  loading = false,
}: FinancePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);

  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  const pages: number[] = [];
  const firstPage = Math.max(1, safePage - 2);
  const lastPage = Math.min(safeTotalPages, safePage + 2);

  for (let number = firstPage; number <= lastPage; number++) {
    pages.push(number);
  }

  const buttonClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-4 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-800">{start}</span>
        {" – "}
        <span className="font-semibold text-gray-800">{end}</span>
        {" of "}
        <span className="font-semibold text-gray-800">
          {totalItems}
        </span>{" "}
        transactions
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          className={buttonClass}
          disabled={loading || safePage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
          title="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          className={buttonClass}
          disabled={loading || safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {firstPage > 1 && (
          <span className="px-1 text-sm text-gray-400">...</span>
        )}

        {pages.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onPageChange(number)}
            disabled={loading}
            aria-current={number === safePage ? "page" : undefined}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition disabled:opacity-50 ${
              number === safePage
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {number}
          </button>
        ))}

        {lastPage < safeTotalPages && (
          <span className="px-1 text-sm text-gray-400">...</span>
        )}

        <button
          type="button"
          className={buttonClass}
          disabled={loading || safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          className={buttonClass}
          disabled={loading || safePage >= safeTotalPages}
          onClick={() => onPageChange(safeTotalPages)}
          aria-label="Last page"
          title="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
