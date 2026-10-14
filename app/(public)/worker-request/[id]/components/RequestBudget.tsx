
"use client";

import { IndianRupee, Wallet } from "lucide-react";

import type { WorkerRequest } from "./types";

interface RequestBudgetProps {
  request: WorkerRequest;
}

function formatBudget(value?: number | null): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "Not specified";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function RequestBudget({
  request,
}: RequestBudgetProps) {
  const hasBudget =
    typeof request.budget === "number" &&
    Number.isFinite(request.budget);

  return (
    <section className="w-full overflow-hidden rounded-xl border border-green-100 bg-white shadow-sm">

      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-green-100 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <Wallet size={21} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold leading-5 text-gray-900">
            Work Budget
          </h2>
          <p className="mt-0.5 text-xs leading-4 text-gray-500">
            Budget for this work request
          </p>
        </div>
      </div>

      {/* Budget Details */}
      <div className="p-2">
  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
    <p className="text-[11px] font-semibold text-green-800">
      {hasBudget ? "Estimated Budget" : "Budget"}
    </p>

    <div className="mt-1.5 flex min-w-0 items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 ring-1 ring-green-100">
        <IndianRupee size={18} strokeWidth={2} />
      </div>

      <p className="break-words text-lg font-bold leading-6 tracking-tight text-gray-900">
        {formatBudget(request.budget)}
      </p>
    </div>

    <p className="mt-2 text-[11px] leading-4 text-gray-600">
      {hasBudget
        ? "Confirm the final amount before starting work."
        : "No budget specified by the requester."}
    </p>
  </div>
</div>
    </section>
  );
}