"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Wallet,
} from "lucide-react";
import WorkerRequestRefundsTable from "./WorkerRequestRefundsTable";
import { supabase } from "@/lib/supabase";

import FinanceHeader from "./FinanceHeader";
import FinanceFilters from "./FinanceFilters";
import FinanceSummaryCards from "./FinanceSummaryCards";
import FinanceEarningsChart from "./FinanceEarningsChart";
import FinancePaymentBreakdown from "./FinancePaymentBreakdown";
import FinanceTransactionsTable from "./FinanceTransactionsTable";
import FinanceRefundsTable from "./FinanceRefundsTable";
import FinanceTransactionDetails from "./FinanceTransactionDetails";
import FinanceRefundDetails from "./FinanceRefundDetails";
import FinanceExportButton from "./FinanceExportButton";

import type {
  FinanceApiResponse,
  FinanceDashboardResponse,
  FinanceFiltersType,
  FinanceRefund,
  FinanceSummary,
  FinanceTransaction,
  FinanceTransactionsResponse,
} from "./finance.types";

const PAGE_SIZE = 20;

const DEFAULT_FILTERS: FinanceFiltersType = {
  search: "",
  status: "all",
  paymentMethod: "all",
  fromDate: "",
  toDate: "",
};

const EMPTY_SUMMARY: FinanceSummary = {
  totalCollection: 0,
  successfulPayments: 0,
  failedPayments: 0,
  pendingPayments: 0,
  totalRefunds: 0,
  platformEarnings: 0,
  gatewayFees: 0,
  netEarnings: 0,
  totalTransactions: 0,
  paidTransactions: 0,
  failedTransactions: 0,
  pendingTransactions: 0,
  refundedTransactions: 0,
};

async function fetchJson<T>(url: string): Promise<T> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("Unable to verify your admin session.");
  }

  if (!session?.access_token) {
    throw new Error("Admin session missing. Please log in again.");
  }

  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const result = (await response.json()) as FinanceApiResponse<T>;

  if (response.status === 401) {
    throw new Error("Authentication expired. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error("You do not have permission to access Finance.");
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.error || "Finance request failed.");
  }

  if (result.data === undefined) {
    throw new Error("Invalid finance API response.");
  }

  return result.data;
}

export default function FinanceDashboard() {
  const [summary, setSummary] = useState<FinanceSummary>(EMPTY_SUMMARY);

  const [chart, setChart] = useState<FinanceDashboardResponse["chart"]>([]);

  const [paymentBreakdown, setPaymentBreakdown] = useState<
    FinanceDashboardResponse["paymentBreakdown"]
  >([]);

  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);

  const [refunds, setRefunds] = useState<FinanceRefund[]>([]);

  const [filters, setFilters] = useState<FinanceFiltersType>(DEFAULT_FILTERS);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingRefunds, setLoadingRefunds] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<FinanceTransaction | null>(null);

  const [selectedRefund, setSelectedRefund] = useState<FinanceRefund | null>(
    null,
  );

  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  // Build transaction query.
  const buildQuery = useCallback(
    (includePage = true) => {
      const params = new URLSearchParams();

      if (filters.search.trim()) {
        params.set("search", filters.search.trim());
      }

      if (filters.status !== "all") {
        params.set("status", filters.status);
      }

      if (filters.paymentMethod !== "all") {
        params.set("method", filters.paymentMethod);
      }

      if (filters.fromDate) {
        params.set("startDate", filters.fromDate);
      }

      if (filters.toDate) {
        params.set("endDate", filters.toDate);
      }

      if (includePage) {
        params.set("page", String(page));
        params.set("pageSize", String(PAGE_SIZE));
      }

      return params.toString();
    },
    [filters, page],
  );

  // Load summary, chart and payment methods.
  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);

    try {
      const params = new URLSearchParams();

      if (filters.fromDate) {
        params.set("startDate", filters.fromDate);
      }

      if (filters.toDate) {
        params.set("endDate", filters.toDate);
      }

      const query = params.toString();

      const result = await fetchJson<{
        summary: {
          totalCollected?: number;
          companyEarnings?: number;
          workerEarnings?: number;
          gatewayFees?: number;
          pendingAmount?: number;
          failedAmount?: number;
          refundedAmount?: number;
          totalTransactions?: number;
          successfulTransactions?: number;
          pendingTransactions?: number;
          failedTransactions?: number;
          refundedTransactions?: number;
        };
        chart: FinanceDashboardResponse["chart"];
        paymentBreakdown: FinanceDashboardResponse["paymentBreakdown"];
      }>(`/api/admin/finance/summary${query ? `?${query}` : ""}`);

      const apiSummary = result.summary;

      setSummary({
        ...EMPTY_SUMMARY,
        totalCollection: Number(apiSummary.totalCollected ?? 0),
        platformEarnings: Number(apiSummary.companyEarnings ?? 0),
        successfulPayments: Number(apiSummary.totalCollected ?? 0),
        failedPayments: Number(apiSummary.failedAmount ?? 0),
        pendingPayments: Number(apiSummary.pendingAmount ?? 0),
        totalRefunds: Number(apiSummary.refundedAmount ?? 0),
        gatewayFees: Number(apiSummary.gatewayFees ?? 0),
        netEarnings: Number(apiSummary.workerEarnings ?? 0),
        totalTransactions: Number(apiSummary.totalTransactions ?? 0),
        paidTransactions: Number(apiSummary.successfulTransactions ?? 0),
        failedTransactions: Number(apiSummary.failedTransactions ?? 0),
        pendingTransactions: Number(apiSummary.pendingTransactions ?? 0),
        refundedTransactions: Number(apiSummary.refundedTransactions ?? 0),
      });

      setChart(result.chart ?? []);
      setPaymentBreakdown(result.paymentBreakdown ?? []);
    } finally {
      setLoadingSummary(false);
    }
  }, [filters.fromDate, filters.toDate]);

  // Load paginated transactions.
  const loadTransactions = useCallback(async () => {
    setLoadingTransactions(true);

    try {
      const query = buildQuery(true);

      const result = await fetchJson<FinanceTransactionsResponse>(
        `/api/admin/finance/transactions?${query}`,
      );

      setTransactions(result.transactions ?? []);
      setTotalTransactions(result.total ?? 0);
      setTotalPages(Math.max(1, result.totalPages ?? 1));
    } finally {
      setLoadingTransactions(false);
    }
  }, [buildQuery]);

  // Load refund records.
  const loadRefunds = useCallback(async () => {
    setLoadingRefunds(true);

    try {
      const result = await fetchJson<
        FinanceRefund[] | { refunds?: FinanceRefund[] }
      >("/api/admin/finance/refunds");

      const refundList = Array.isArray(result)
        ? result
        : Array.isArray(result?.refunds)
          ? result.refunds
          : [];

      setRefunds(refundList);
    } finally {
      setLoadingRefunds(false);
    }
  }, []);

  // Refresh all finance sections.
  const loadFinance = useCallback(async () => {
    setRefreshing(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        loadSummary(),
        loadTransactions(),
        loadRefunds(),
      ]);

      const failed = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );

      if (failed) {
        setError(
          failed.reason instanceof Error
            ? failed.reason.message
            : "Finance data could not be loaded.",
        );
      } else {
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Finance data could not be loaded.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [loadSummary, loadTransactions, loadRefunds]);

  useEffect(() => {
    void loadFinance();
  }, [loadFinance]);

  useEffect(() => {
    setPage(1);
  }, [
    filters.search,
    filters.status,
    filters.paymentMethod,
    filters.fromDate,
    filters.toDate,
  ]);

  const handleFilterChange = (next: FinanceFiltersType) => {
    setFilters(next);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const openTransaction = (transaction: FinanceTransaction) => {
    setSelectedTransaction(transaction);
    setTransactionModalOpen(true);
  };

  const openRefund = (refund: FinanceRefund) => {
    setSelectedRefund(refund);
    setRefundModalOpen(true);
  };

  return (
    <div className="min-w-0 space-y-6 bg-gray-50/70 p-4 pb-8 sm:p-6 xl:p-8">
      {/* Header */}
      <FinanceHeader
        onRefresh={() => void loadFinance()}
        loading={refreshing}
        lastUpdated={lastUpdated}
      />

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <div className="flex min-w-0 items-start gap-3">
            <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Finance data unavailable
              </p>

              <p className="mt-1 wrap-break-word text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadFinance()}
            disabled={refreshing}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            {refreshing ? "Loading..." : "Retry"}
          </button>
        </div>
      )}

      {/* Filters */}
      <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <FinanceFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </section>

      {/* Financial summary */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-emerald-700" />

          <h2 className="text-base font-bold text-gray-900">
            Financial Summary
          </h2>
        </div>

        <FinanceSummaryCards summary={summary} loading={loadingSummary} />
      </section>

      {/* Financial analytics */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-700" />

            <h2 className="text-base font-bold tracking-tight text-gray-900">
              Financial Analytics
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Successful payment collection, company booking fees and payment
            methods.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
          {/* Earnings chart */}
          <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="min-w-0 flex-1">
              <FinanceEarningsChart data={chart} loading={loadingSummary} />
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="min-w-0 flex-1">
              <FinancePaymentBreakdown />
            </div>
          </div>
        </div>
      </section>

      {/* Refund Management — single section only */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-emerald-700" />

              <h2 className="text-base font-bold text-gray-900">
                Refund Management
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Review refund records, manage cancellation approvals, and inspect
              refund details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadRefunds()}
            disabled={loadingRefunds}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loadingRefunds ? "animate-spin" : ""}
            />

            {loadingRefunds ? "Refreshing..." : "Refresh refunds"}
          </button>
        </div>

        {/* Refund records and cancellation requests are rendered here */}
        {/* Existing Booking Refunds & Cancellations */}
        <FinanceRefundsTable
          refunds={refunds}
          loading={loadingRefunds}
          onRefresh={() => void loadRefunds()}
          onSelect={openRefund}
        />

        {/* New Worker Request Refunds table */}
        <WorkerRequestRefundsTable />
      </section>

      {/* Transaction Ledger */}
      <section className="w-full space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="shrink-0 text-emerald-700" />

              <h2 className="text-sm font-bold text-gray-900">
                Transaction Ledger
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Payment records, statuses and transaction details
            </p>
          </div>

          <div className="flex items-center">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600">
              <Clock3 size={13} />
              {totalTransactions} records
            </span>
          </div>
        </div>

        {/* Export panel */}
        <div className="w-full">
          <FinanceExportButton
            transactions={transactions}
            loading={loadingTransactions}
          />
        </div>

        {/* Transaction table */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <FinanceTransactionsTable
            transactions={transactions}
            loading={loadingTransactions}
            onSelect={openTransaction}
            page={page}
            totalPages={totalPages}
            totalItems={totalTransactions}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </section>

      {/* Transaction details modal */}
      <FinanceTransactionDetails
        transaction={selectedTransaction}
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
      />

      {/* Refund details modal */}
      <FinanceRefundDetails
        refund={selectedRefund}
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
      />
    </div>
  );
}
