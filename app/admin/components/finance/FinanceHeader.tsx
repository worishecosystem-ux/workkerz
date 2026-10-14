
"use client";

import { RefreshCw, WalletCards } from "lucide-react";

interface FinanceHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
  lastUpdated?: string | null;
}

export default function FinanceHeader({
  onRefresh,
  loading = false,
  lastUpdated = null,
}: FinanceHeaderProps) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <WalletCards size={25} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Finance Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Payments, collections, earnings and refunds
          </p>

          {formattedTime && (
            <p className="mt-1 text-xs text-gray-400">
              Last updated: {formattedTime}
            </p>
          )}
        </div>
      </div>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      )}
    </div>
  );
}
