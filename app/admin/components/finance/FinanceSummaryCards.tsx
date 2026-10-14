
"use client";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  RotateCcw,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

import type { FinanceSummary } from "./finance.types";
import { formatCurrency } from "./finance.utils";

interface FinanceSummaryCardsProps {
  summary: FinanceSummary | null;
  loading?: boolean;
}

export default function FinanceSummaryCards({
  summary,
  loading = false,
}: FinanceSummaryCardsProps) {
  const cards = [
    {
      title: "Total Collection",
      value: summary?.totalCollection ?? 0,
      description: "Successful payments received",
      icon: IndianRupee,
      color: "blue",
    },
    {
      title: "Platform Earnings",
      value: summary?.platformEarnings ?? 0,
      description: "Recorded platform fees",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      title: "Successful Payments",
      value: summary?.successfulPayments ?? 0,
      description: `${summary?.paidTransactions ?? 0} transactions`,
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Failed Payments",
      value: summary?.failedPayments ?? 0,
      description: `${summary?.failedTransactions ?? 0} transactions`,
      icon: XCircle,
      color: "red",
    },
    {
      title: "Pending Payments",
      value: summary?.pendingPayments ?? 0,
      description: `${summary?.pendingTransactions ?? 0} transactions`,
      icon: Clock3,
      color: "amber",
    },
    {
      title: "Total Refunds",
      value: summary?.totalRefunds ?? 0,
      description: `${summary?.refundedTransactions ?? 0} refunded transactions`,
      icon: RotateCcw,
      color: "violet",
    },
    {
      title: "Gateway Fees",
      value: summary?.gatewayFees ?? 0,
      description: "Recorded gateway charges",
      icon: CreditCard,
      color: "slate",
    },
    {
      title: "Net Earnings",
      value: summary?.netEarnings ?? 0,
      description: "Based on recorded finance data",
      icon: Wallet,
      color: "teal",
    },
  ];

  const colors: Record<
    string,
    { icon: string; border: string; dot: string }
  > = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      border: "border-l-blue-500",
      dot: "bg-blue-500",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      border: "border-l-emerald-500",
      dot: "bg-emerald-500",
    },
    green: {
      icon: "bg-green-50 text-green-700",
      border: "border-l-green-500",
      dot: "bg-green-500",
    },
    red: {
      icon: "bg-red-50 text-red-700",
      border: "border-l-red-500",
      dot: "bg-red-500",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      border: "border-l-amber-500",
      dot: "bg-amber-500",
    },
    violet: {
      icon: "bg-violet-50 text-violet-700",
      border: "border-l-violet-500",
      dot: "bg-violet-500",
    },
    slate: {
      icon: "bg-slate-100 text-slate-700",
      border: "border-l-slate-500",
      dot: "bg-slate-500",
    },
    teal: {
      icon: "bg-teal-50 text-teal-700",
      border: "border-l-teal-500",
      dot: "bg-teal-500",
    },
  };

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const theme = colors[card.color];

        return (
          <article
            key={card.title}
            className={`min-w-0 rounded-xl border border-gray-200 border-l-[3px] ${theme.border} bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-3.5`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium leading-4 text-gray-500 sm:text-xs">
                  {card.title}
                </p>

                {loading ? (
                  <div className="mt-2 h-6 w-24 max-w-full animate-pulse rounded-md bg-gray-100" />
                ) : (
                  <p className="mt-1.5 break-words text-base font-bold leading-6 tracking-tight text-gray-900 sm:text-lg">
                    {formatCurrency(card.value)}
                  </p>
                )}
              </div>

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme.icon}`}
              >
                <Icon size={16} strokeWidth={2} />
              </div>
            </div>

            <div className="mt-2.5 flex min-w-0 items-center gap-1.5 border-t border-gray-100 pt-2">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`}
              />
              <p
                title={card.description}
                className="truncate text-[10px] leading-4 text-gray-500 sm:text-[11px]"
              >
                {card.description}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}