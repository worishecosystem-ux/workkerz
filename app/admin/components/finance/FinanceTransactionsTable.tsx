
"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Eye,
  IndianRupee,
  RefreshCw,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import type { FinanceTableProps } from "./finance.types";
import {
  formatCurrency,
  formatDate,
  getStatusClass,
  getStatusLabel,
  normalizePaymentMethod,
} from "./finance.utils";
import FinancePagination from "./FinancePagination";

type DateFilter =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

interface ExtendedFinanceTransactionsTableProps
  extends FinanceTableProps {
  page?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

interface PaymentMethodTransaction {
  id: string;
  payment_method?: string | null;
  razorpay_payment_id?: string | null;
}

interface PaymentMethodResponse {
  success?: boolean;
  payment_method?: string;
  method?: string;
  error?: string;
}

const DATE_FILTERS: {
  label: string;
  value: DateFilter;
}[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

function getDateRange(filter: DateFilter, now = new Date()) {
  const start = new Date(now);
  const end = new Date(now);

  switch (filter) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "weekly": {
      const daysFromMonday = (now.getDay() + 6) % 7;

      start.setDate(now.getDate() - daysFromMonday);
      start.setHours(0, 0, 0, 0);

      end.setTime(start.getTime());
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "monthly":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "quarterly": {
      const quarterStartMonth =
        Math.floor(now.getMonth() / 3) * 3;

      start.setMonth(quarterStartMonth, 1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(quarterStartMonth + 3, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "yearly":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

function displayMethod(method?: string | null) {
  const value = (method ?? "").trim();

  if (!value) return "Not available";

  const key = value.toLowerCase().replace(/[\s-]+/g, "_");

  const labels: Record<string, string> = {
    upi: "UPI",
    card: "Card",
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    netbanking: "Net Banking",
    net_banking: "Net Banking",
    wallet: "Wallet",
    emi: "EMI",
    paylater: "Pay Later",
    pay_later: "Pay Later",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
  };

  return labels[key] ?? normalizePaymentMethod(value);
}

function PaymentMethodIcon({
  method,
}: {
  method?: string | null;
}) {
  const value = (method ?? "").toLowerCase();

  if (value.includes("upi")) {
    return <Smartphone size={13} />;
  }

  if (value.includes("wallet") || value.includes("paylater")) {
    return <Wallet size={13} />;
  }

  if (
    value.includes("netbanking") ||
    value.includes("net banking") ||
    value.includes("bank")
  ) {
    return <IndianRupee size={13} />;
  }

  return <CreditCard size={13} />;
}

export default function FinanceTransactionsTable({
  transactions,
  loading,
  onSelect,
  page = 1,
  pageSize = 20,
  onPageChange,
}: ExtendedFinanceTransactionsTableProps) {
  const [dateFilter, setDateFilter] =
    useState<DateFilter>("monthly");

  const [resolvedMethods, setResolvedMethods] =
    useState<Record<string, string>>({});

  const [fetchingMethods, setFetchingMethods] =
    useState<Record<string, boolean>>({});

  // These refs prevent duplicate requests across renders.
  const resolvedMethodsRef = useRef<Set<string>>(new Set());
  const pendingMethodsRef = useRef<Set<string>>(new Set());
  const attemptedMethodsRef = useRef<Set<string>>(new Set());

  const dateRange = useMemo(
    () => getDateRange(dateFilter),
    [dateFilter]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const dateValue =
        transaction.paid_at || transaction.created_at;

      if (!dateValue) return false;

      const transactionDate = new Date(dateValue);

      if (Number.isNaN(transactionDate.getTime())) {
        return false;
      }

      return (
        transactionDate >= dateRange.start &&
        transactionDate <= dateRange.end
      );
    });
  }, [transactions, dateRange]);

  const filteredTotalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
  );

  const currentPage = Math.min(
    Math.max(1, page),
    filteredTotalPages
  );

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredTransactions.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [filteredTransactions, currentPage, pageSize]);

  // A stable primitive dependency avoids effect reruns when the
  // parent supplies a newly allocated transactions array.
  const transactionIdsKey = useMemo(
    () =>
      paginatedTransactions
        .map((transaction) => {
          const row = transaction as typeof transaction &
            PaymentMethodTransaction;

          return [
            row.id,
            row.payment_method ?? "",
            row.razorpay_payment_id ?? "",
          ].join(":");
        })
        .join("|"),
    [paginatedTransactions]
  );

  const rangeLabel = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const changeFilter = (filter: DateFilter) => {
    setDateFilter(filter);
    onPageChange?.(1);
  };

  const fetchPaymentMethod = useCallback(
    async (transaction: PaymentMethodTransaction) => {
      const id = transaction.id;
      const paymentId = transaction.razorpay_payment_id;

      if (
        !id ||
        !paymentId ||
        transaction.payment_method ||
        resolvedMethodsRef.current.has(id) ||
        pendingMethodsRef.current.has(id) ||
        attemptedMethodsRef.current.has(id)
      ) {
        return;
      }

      pendingMethodsRef.current.add(id);
      attemptedMethodsRef.current.add(id);

      setFetchingMethods((current) => {
        if (current[id]) return current;

        return { ...current, [id]: true };
      });

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          throw new Error(
            "Session expired. Please sign in again."
          );
        }

        const response = await fetch(
          "/api/admin/finance/payment-method",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
            body: JSON.stringify({
              transactionId: id,
              razorpayPaymentId: paymentId,
            }),
          }
        );

        const result =
          (await response.json()) as PaymentMethodResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              `Payment lookup failed (${response.status}).`
          );
        }

        const method =
          result.payment_method ?? result.method;

        if (method) {
          resolvedMethodsRef.current.add(id);

          setResolvedMethods((current) => {
            if (current[id] === method) return current;

            return { ...current, [id]: method };
          });
        }
      } catch (error) {
        // Prevent an automatic retry loop. A later manual refresh
        // or page reload can retry failed lookups.
        console.error(
          `Payment method lookup failed for ${id}:`,
          error
        );
      } finally {
        pendingMethodsRef.current.delete(id);

        setFetchingMethods((current) => {
          if (!current[id]) return current;

          const next = { ...current };
          delete next[id];
          return next;
        });
      }
    },
    []
  );

  useEffect(() => {
    for (const transaction of paginatedTransactions) {
      const row = transaction as typeof transaction &
        PaymentMethodTransaction;

      if (!row.payment_method && row.razorpay_payment_id) {
        void fetchPaymentMethod(row);
      }
    }

    // transactionIdsKey changes only when relevant row identifiers
    // or payment fields change, not merely when an array is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionIdsKey, fetchPaymentMethod]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-gray-900">
            All Transactions
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Payment attempts, collections and refunds
          </p>
        </div>

        <span className="w-fit rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
          {loading
            ? "Loading..."
            : `${filteredTransactions.length} records`}
        </span>
      </div>

      <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <CalendarDays
            size={15}
            className="text-emerald-700"
          />
          <span className="text-xs font-semibold text-gray-700">
            Filter by period
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          {DATE_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={dateFilter === option.value}
              onClick={() => changeFilter(option.value)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                dateFilter === option.value
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="mt-2 text-[11px] text-gray-500">
          {rangeLabel(dateRange.start)} –{" "}
          {rangeLabel(dateRange.end)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-xs">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
            <tr>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Transaction
              </th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Booking
              </th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Customer / Worker
              </th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Amount
              </th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Payment Method
              </th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Status
              </th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Date
              </th>
              <th className="px-3 py-3 text-right font-semibold">
                Details
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 8 }).map(
                    (__, cell) => (
                      <td
                        key={cell}
                        className="px-3 py-4"
                      >
                        <div className="h-3 animate-pulse rounded bg-gray-100" />
                      </td>
                    )
                  )}
                </tr>
              ))
            ) : paginatedTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-12 text-center"
                >
                  <RefreshCw
                    size={23}
                    className="mx-auto text-gray-300"
                  />
                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    No transactions found
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    No transactions are available for this period.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction) => {
                const row = transaction as typeof transaction &
                  PaymentMethodTransaction;

                const isRefund =
                  transaction.transaction_type === "refund" ||
                  transaction.transaction_type ===
                    "partial_refund";

                const method =
                  row.payment_method ||
                  resolvedMethods[row.id] ||
                  "";

                const methodIsLoading =
                  !method &&
                  Boolean(row.razorpay_payment_id) &&
                  Boolean(fetchingMethods[row.id]);

                return (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-emerald-50/30"
                  >
                    <td className="px-3 py-3">
                      <p className="max-w-[150px] truncate font-semibold text-gray-900">
                        {transaction.transaction_number || "—"}
                      </p>
                      <p className="mt-1 text-[10px] capitalize text-gray-500">
                        {(
                          transaction.transaction_type ||
                          "payment"
                        ).replace(/_/g, " ")}
                      </p>
                    </td>

                    <td className="px-3 py-3">
                      <p className="max-w-[130px] truncate font-medium text-gray-800">
                        {transaction.booking_number ||
                          transaction.booking_id ||
                          "—"}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        {transaction.source_type || "other"}
                      </p>
                    </td>

                    <td className="px-3 py-3">
                      <p className="max-w-[170px] truncate font-medium text-gray-800">
                        {transaction.customer_name ||
                          "Customer unavailable"}
                      </p>
                      <p className="mt-1 max-w-[170px] truncate text-[10px] text-gray-500">
                        {transaction.customer_email || "—"}
                      </p>
                      <p className="mt-1 max-w-[170px] truncate text-[10px] text-gray-600">
                        Worker: {transaction.worker_name || "—"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex items-center gap-1 font-bold text-gray-900">
                        {isRefund ? (
                          <ArrowDownRight
                            size={14}
                            className="shrink-0 text-red-600"
                          />
                        ) : (
                          <ArrowUpRight
                            size={14}
                            className="shrink-0 text-emerald-600"
                          />
                        )}

                        {formatCurrency(
                          isRefund
                            ? transaction.refund_amount ||
                                transaction.amount
                            : transaction.amount,
                          transaction.currency || "INR"
                        )}
                      </div>

                      <p className="mt-1 text-[10px] text-gray-500">
                        Fee:{" "}
                        {formatCurrency(
                          transaction.platform_fee
                        )}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                          method
                            ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                            : "border-gray-200 bg-gray-50 text-gray-500"
                        }`}
                      >
                        {methodIsLoading ? (
                          <RefreshCw
                            size={12}
                            className="animate-spin"
                          />
                        ) : (
                          <PaymentMethodIcon method={method} />
                        )}

                        {methodIsLoading
                          ? "Fetching..."
                          : displayMethod(method)}
                      </span>

                      {row.razorpay_payment_id && (
                        <p
                          className="mt-1 max-w-[150px] truncate text-[9px] text-gray-400"
                          title={row.razorpay_payment_id}
                        >
                          {row.razorpay_payment_id}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${getStatusClass(
                          transaction.status
                        )}`}
                      >
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-[11px] text-gray-600">
                      {formatDate(
                        transaction.paid_at ||
                          transaction.created_at
                      )}
                    </td>

                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelect?.(transaction)}
                        disabled={!onSelect}
                        title="View transaction details"
                        aria-label="View transaction details"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-default disabled:opacity-50"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading &&
        onPageChange &&
        filteredTransactions.length > 0 && (
          <FinancePagination
            page={currentPage}
            totalPages={filteredTotalPages}
            totalItems={filteredTransactions.length}
            pageSize={pageSize}
            onPageChange={onPageChange}
            loading={loading}
          />
        )}
    </section>
  );
}