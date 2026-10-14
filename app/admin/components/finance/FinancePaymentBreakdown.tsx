
"use client";

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  RefreshCw,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PaymentBreakdownItem {
  method: string;
  count: number;
  amount: number;
}

interface PaymentBreakdownResponse {
  success: boolean;
  data?: PaymentBreakdownItem[];
  error?: string;
  totals?: {
    fetchedPayments: number;
    capturedTransactions: number;
    capturedAmount: number;
  };
  limitReached?: boolean;
}

const METHOD_STYLES: Record<
  string,
  {
    label: string;
    icon: typeof CreditCard;
    iconBg: string;
    iconColor: string;
  }
> = {
  upi: {
    label: "UPI",
    icon: Smartphone,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  card: {
    label: "Cards",
    icon: CreditCard,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
  },
  netbanking: {
    label: "Net Banking",
    icon: IndianRupee,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
  },
  wallet: {
    label: "Wallet",
    icon: Wallet,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  emi: {
    label: "EMI",
    icon: CreditCard,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-700",
  },
  paylater: {
    label: "Pay Later",
    icon: Wallet,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-700",
  },
  other: {
    label: "Other",
    icon: Wallet,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
};

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function getMethod(method: string) {
  const key = method.toLowerCase().replace(/[\s_-]+/g, "");

  return (
    METHOD_STYLES[key] ?? {
      label: method || "Unknown",
      icon: Wallet,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
    }
  );
}

export default function FinancePaymentBreakdown() {
  const [data, setData] = useState<PaymentBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [totals, setTotals] = useState({
    fetchedPayments: 0,
    capturedTransactions: 0,
    capturedAmount: 0,
  });

  const fetchBreakdown = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Session expired. Please sign in again.");
      }

      const response = await fetch(
        "/api/admin/finance/payment-breakdown",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const result =
        (await response.json()) as PaymentBreakdownResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to load Razorpay payment data."
        );
      }

      setData(result.data ?? []);
      setTotals(
        result.totals ?? {
          fetchedPayments: 0,
          capturedTransactions: 0,
          capturedAmount: 0,
        }
      );
      setLimitReached(Boolean(result.limitReached));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchBreakdown();
  }, [fetchBreakdown]);

  const totalAmount = data.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalCount = data.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  const sortedData = [...data].sort(
    (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
  );

  return (
    <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Wallet size={19} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold tracking-tight text-gray-900">
              Payment Methods
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Razorpay collection overview
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void fetchBreakdown(true)}
          disabled={loading || refreshing}
          title="Refresh payment data"
          aria-label="Refresh payment data"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={
              loading || refreshing ? "animate-spin" : ""
            }
          />
        </button>
      </div>

      {/* Collection summary */}
      <div className="px-4 pt-4 sm:px-5">
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
          <div className="pointer-events-none absolute -right-5 -top-7 h-24 w-24 rounded-full bg-emerald-100/60" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-gray-600">
                Total Captured Collection
              </p>

              {loading ? (
                <div className="mt-3 h-7 w-36 animate-pulse rounded-md bg-emerald-100" />
              ) : error ? (
                <p className="mt-2 text-sm font-semibold text-gray-400">
                  Unavailable
                </p>
              ) : (
                <p className="mt-2 break-words text-2xl font-extrabold tracking-tight text-gray-950 sm:text-[28px]">
                  {currency(totalAmount)}
                </p>
              )}
            </div>

            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
              <IndianRupee size={20} />
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-emerald-100 pt-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-700" />
              <span className="text-xs font-semibold text-gray-700">
                {loading ? "—" : totalCount.toLocaleString("en-IN")}{" "}
                transactions
              </span>
            </div>

            <span className="hidden h-3 w-px bg-emerald-200 sm:block" />

            <span className="text-xs text-gray-500">
              INR · Captured payments
            </span>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="flex-1 px-4 pb-4 pt-4 sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Collection by method
          </h4>

          {!loading && !error && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
              {data.length} methods
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-3 rounded-xl border border-gray-100 p-3"
              >
                <div className="h-9 w-9 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-gray-100" />
                  <div className="h-2 w-full rounded bg-gray-100" />
                </div>
                <div className="h-4 w-16 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-600"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-800">
                  Payment data unavailable
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-red-700">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => void fetchBreakdown(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
                >
                  <RefreshCw size={12} />
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm ring-1 ring-gray-200">
              <Wallet size={22} />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-800">
              No captured INR payments
            </p>
            <p className="mt-1 max-w-[240px] text-xs leading-5 text-gray-500">
              Captured payment records will appear here when available.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedData.map((item) => {
              const method = getMethod(item.method);
              const Icon = method.icon;
              const amount = Number(item.amount || 0);
              const count = Number(item.count || 0);
              const percentage =
                totalAmount > 0
                  ? (amount / totalAmount) * 100
                  : 0;

              return (
                <div
                  key={item.method}
                  className="group rounded-xl border border-gray-100 bg-white p-3 transition duration-200 hover:border-emerald-200 hover:bg-emerald-50/20"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${method.iconBg} ${method.iconColor}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {method.label}
                        </p>

                        <span className="shrink-0 rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        {count.toLocaleString("en-IN")} transactions
                      </p>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums text-gray-900">
                        {currency(amount)}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        Captured
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* API record coverage */}
        {!loading && !error && (
          <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <ArrowUpRight size={12} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-600">
                {totals.fetchedPayments.toLocaleString("en-IN")} Razorpay records fetched
              </p>

              {limitReached ? (
                <p className="mt-1 text-[10px] leading-4 text-amber-700">
                  The 10,000-record limit was reached. This data may not
                  include your complete payment history.
                </p>
              ) : (
                <p className="mt-1 text-[10px] leading-4 text-gray-400">
                  Based on captured INR payments returned by Razorpay.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}