
"use client";

import {
  CalendarDays,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import type {
  FinanceFiltersType,
  FinanceStatus,
  PaymentMethod,
} from "./finance.types";

interface FinanceFiltersProps {
  filters: FinanceFiltersType;
  onChange: (filters: FinanceFiltersType) => void;
  onReset?: () => void;
}

const STATUS_OPTIONS: { label: string; value: FinanceStatus }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Payment Received", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Created", value: "created" },
  { label: "Processing", value: "processing" },
  { label: "Failed", value: "failed" },
  { label: "Refund Requested", value: "refund_requested" },
  { label: "Refunded", value: "refunded" },
  { label: "Partially Refunded", value: "partially_refunded" },
  { label: "Cancelled", value: "cancelled" },
];

const PAYMENT_METHOD_OPTIONS: {
  label: string;
  value: PaymentMethod;
}[] = [
  { label: "All Methods", value: "all" },
  { label: "UPI", value: "upi" },
  { label: "Card", value: "card" },
  { label: "Net Banking", value: "netbanking" },
  { label: "Wallet", value: "wallet" },
  { label: "EMI", value: "emi" },
  { label: "Other", value: "other" },
];

export default function FinanceFilters({
  filters,
  onChange,
  onReset,
}: FinanceFiltersProps) {
  const updateFilter = <K extends keyof FinanceFiltersType>(
    key: K,
    value: FinanceFiltersType[K],
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    const defaults: FinanceFiltersType = {
      search: "",
      status: "all",
      paymentMethod: "all",
      fromDate: "",
      toDate: "",
    };

    onChange(defaults);
    onReset?.();
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.fromDate !== "" ||
    filters.toDate !== "";

  const inputClass =
    "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-emerald-700" />

          <h2 className="text-sm font-semibold text-gray-900">
            Transactions & Filters
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="relative sm:col-span-2 xl:col-span-2">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
            placeholder="Search booking ID, customer, transaction..."
            aria-label="Search finance transactions"
            className={`${inputClass} pl-9`}
          />
        </div>

        <select
          value={filters.status}
          onChange={(event) =>
            updateFilter("status", event.target.value as FinanceStatus)
          }
          aria-label="Filter by payment status"
          className={inputClass}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.paymentMethod}
          onChange={(event) =>
            updateFilter(
              "paymentMethod",
              event.target.value as PaymentMethod,
            )
          }
          aria-label="Filter by payment method"
          className={inputClass}
        >
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="relative">
          <CalendarDays
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="date"
            value={filters.fromDate}
            max={filters.toDate || undefined}
            onChange={(event) =>
              updateFilter("fromDate", event.target.value)
            }
            aria-label="Start date"
            className={`${inputClass} pl-9`}
          />
        </div>

        <div className="relative">
          <CalendarDays
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="date"
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={(event) =>
              updateFilter("toDate", event.target.value)
            }
            aria-label="End date"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>
    </section>
  );
}
