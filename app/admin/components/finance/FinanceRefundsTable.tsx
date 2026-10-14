"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {

  CheckCircle2,

  Eye,

  LoaderCircle,

  RefreshCw,

  RotateCcw,

  ShieldCheck,

  X,

  XCircle,

} from "lucide-react";

import { supabase } from "@/lib/supabase";

import type { FinanceRefund } from "./finance.types";

import {

  formatCurrency,

  formatDate,

  getStatusClass,

  getStatusLabel,

} from "./finance.utils";

interface Props {

  refunds: FinanceRefund[];

  loading?: boolean;

  onRefresh?: () => void;

  onSelect?: (refund: FinanceRefund) => void;

}

type RefundDetails = {

  request_id: string;

  booking_id: string;

  refund_method: string | null;

  refund_bank_name: string | null;

  refund_account_holder_name: string | null;

  refund_account_number: string | null;

  refund_ifsc_code: string | null;

  refund_upi_id: string | null;

};

type WorkerInfo = {
  id: string;
  name: string | null;
  phone: string | null;
  code: string | null;
  category: string | null;
  location: string | null;
};

type CancellationRequest = {

  id: string;

  booking_id: string;

  booking_number: string | null;

  customer_name: string | null;

  customer_email: string | null;

  customer_phone: string | null;

  cancellation_reason: string | null;

  reason: string | null;

  status: string;

  refund_status: string | null;

  refund_amount: number | string | null;

  refund_method: string | null;

  refund_expected_from: string | null;

  refund_expected_by: string | null;

  razorpay_refund_id: string | null;

  refund_failure_reason: string | null;

  requested_at: string;

  updated_at: string;

  refund_details: RefundDetails | null;
  worker_id?: string | null;
  worker_name?: string | null;
  worker_phone?: string | null;
  worker_code?: string | null;
  worker_category?: string | null;
  worker_location?: string | null;

};

type ModalState =

  | { type: "details"; request: CancellationRequest }

  | {

      type: "confirm";

      request: CancellationRequest;

      decision: "approve" | "reject";

    }

  | null;

function StatusBadge({ status }: { status: string | null | undefined }) {

  const value = (status || "pending").toLowerCase();

  const color = ["rejected", "failed", "cancelled"].includes(value)

    ? "bg-red-50 text-red-700 ring-red-200"

    : ["approved", "processed", "refunded", "completed"].includes(value)

      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"

      : ["processing", "initiated", "under_review"].includes(value)

        ? "bg-amber-50 text-amber-700 ring-amber-200"

        : "bg-gray-100 text-gray-700 ring-gray-200";

  return (

    <span

      className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${color}`}

    >

      {value.replaceAll("_", " ")}

    </span>

  );

}

function maskAccount(value: string | null | undefined) {

  if (!value) return "Not provided";

  if (value.length <= 4) return "••••";

  return `${"•".repeat(Math.min(value.length - 4, 8))}${value.slice(-4)}`;

}

function Detail({

  label,

  value,

}: {

  label: string;

  value: string | number | null | undefined;

}) {

  return (

    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">

      <p className="text-[11px] text-gray-500">{label}</p>

      <p className="mt-1 break-all text-sm font-semibold text-gray-800">

        {value === null || value === undefined || value === ""

          ? "Not provided"

          : value}

      </p>

    </div>

  );

}

function ModalShell({

  title,

  subtitle,

  onClose,

  children,

}: {

  title: string;

  subtitle?: string;

  onClose: () => void;

  children: React.ReactNode;

}) {

  useEffect(() => {

    const handler = (event: KeyboardEvent) => {

      if (event.key === "Escape") onClose();

    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);

  }, [onClose]);

  return (

    <div

      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/50 p-3 backdrop-blur-[2px]"

      onMouseDown={(event) => {

        if (event.target === event.currentTarget) onClose();

      }}

    >

      <section

        role="dialog"

        aria-modal="true"

        aria-label={title}

        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"

      >

        <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">

          <div>

            <h2 className="text-sm font-bold text-gray-900">{title}</h2>

            {subtitle && (

              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>

            )}

          </div>

          <button

            type="button"

            onClick={onClose}

            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"

            aria-label="Close"

          >

            <X size={17} />

          </button>

        </header>

        <div className="overflow-y-auto p-4">{children}</div>

      </section>

    </div>

  );

}

export default function FinanceRefundsTable({

  refunds,

  loading = false,

  onRefresh,

  onSelect,

}: Props) {

  const [requests, setRequests] = useState<CancellationRequest[]>([]);

  const [requestsLoading, setRequestsLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState("all");

  const loadRequests = useCallback(async (manual = false) => {

    if (manual) setRefreshing(true);

    else setRequestsLoading(true);

    setError("");

    try {

      const {

        data: { session },

        error: sessionError,

      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {

        throw new Error("Admin session missing. Please log in again.");

      }

      const response = await fetch("/api/admin/cancellations/requests", {

        method: "GET",

        cache: "no-store",

        credentials: "same-origin",

        headers: {

          Accept: "application/json",

          Authorization: `Bearer ${session.access_token}`,

        },

      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {

        throw new Error(result.message || result.error || "Unable to load cancellation requests.");

      }

      const cancellationRows: CancellationRequest[] = Array.isArray(result.data)
        ? result.data
        : [];
      const bookingIds = [
        ...new Set(cancellationRows.map((item) => item.booking_id).filter(Boolean)),
      ];
      const workerByBooking = new Map<string, WorkerInfo>();

      if (bookingIds.length > 0) {
        const { data: bookingRows, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .in("id", bookingIds);

        if (bookingError) {
          console.error("LIVE WORKER BOOKING LOOKUP ERROR:", bookingError);
        } else {
          const bookingRecords = (bookingRows ?? []) as unknown as Record<string, unknown>[];
          const bookingWorkerPairs = bookingRecords
            .map((booking) => ({
              bookingId: String(booking.id ?? ""),
              workerId: String(
                booking.worker_id ?? booking.assigned_worker_id ?? booking.workerId ?? "",
              ),
            }))
            .filter((item) => item.bookingId && item.workerId);
          const workerIds = [...new Set(bookingWorkerPairs.map((item) => item.workerId))];

          if (workerIds.length > 0) {
            const { data: workerRows, error: workerError } = await supabase
              .from("workers")
              .select("*")
              .in("id", workerIds);

            if (workerError) {
              console.error("LIVE WORKER PROFILE FETCH ERROR:", workerError);
            } else {
              const workersById = new Map<string, WorkerInfo>();
              const workerRecords = (workerRows ?? []) as unknown as Record<string, unknown>[];

              for (const rawWorker of workerRecords) {
                const id = String(rawWorker.id ?? "");
                const firstName = String(rawWorker.first_name ?? "").trim();
                const lastName = String(rawWorker.last_name ?? "").trim();
                const combinedName = `${firstName} ${lastName}`.trim();
                const nameValue = rawWorker.name ?? rawWorker.full_name ??
                  rawWorker.worker_name ?? rawWorker.fullName ?? combinedName;
                const phoneValue = rawWorker.phone ?? rawWorker.mobile ??
                  rawWorker.phone_number ?? rawWorker.mobile_number ?? rawWorker.contact_number;
                const codeValue = rawWorker.worker_code ?? rawWorker.code ??
                  rawWorker.worker_number ?? rawWorker.registration_number;
                const categoryValue = rawWorker.category ?? rawWorker.skill_category;
                const locationValue = rawWorker.location ?? rawWorker.city ??
                  rawWorker.district ?? rawWorker.address;

                if (!id) continue;
                workersById.set(id, {
                  id,
                  name: nameValue == null ? null : String(nameValue),
                  phone: phoneValue == null ? null : String(phoneValue),
                  code: codeValue == null ? null : String(codeValue),
                  category: categoryValue == null ? null : String(categoryValue),
                  location: locationValue == null ? null : String(locationValue),
                });
              }

              for (const pair of bookingWorkerPairs) {
                const worker = workersById.get(pair.workerId);
                if (worker) workerByBooking.set(pair.bookingId, worker);
              }
            }
          }
        }
      }

      setRequests(
        cancellationRows.map((item) => {
          const worker = workerByBooking.get(String(item.booking_id));
          return {
            ...item,
            worker_id: worker?.id ?? null,
            worker_name: worker?.name ?? null,
            worker_phone: worker?.phone ?? null,
            worker_code: worker?.code ?? null,
            worker_category: worker?.category ?? null,
            worker_location: worker?.location ?? null,
          };
        }),
      );

    } catch (err) {

      setError(

        err instanceof Error

          ? err.message

          : "Unable to load cancellation requests.",

      );

    } finally {

      setRequestsLoading(false);

      setRefreshing(false);

    }

  }, []);

  useEffect(() => {

    void loadRequests();

    const channel = supabase

      .channel("finance-refunds-cancellation-live")

      .on(

        "postgres_changes",

        {

          event: "*",

          schema: "public",

          table: "booking_cancellation_requests",

        },

        () => void loadRequests(),

      )

      .on(

        "postgres_changes",

        {

          event: "*",

          schema: "public",

          table: "booking_cancellation_refund_details",

        },

        () => void loadRequests(),

      )

      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => void loadRequests(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workers" },
        () => void loadRequests(),
      )
      .subscribe();

    return () => {

      void supabase.removeChannel(channel);

    };

  }, [loadRequests]);

  useEffect(() => {
    if (!modal) return;
    const current = requests.find((item) => item.id === modal.request.id);
    if (current && current !== modal.request) {
      setModal({ ...modal, request: current });
    }
  }, [requests, modal]);

  const refreshAll = useCallback(async () => {

    await Promise.all([

      loadRequests(true),

      Promise.resolve(onRefresh?.()),

    ]);

  }, [loadRequests, onRefresh]);

  const isPendingRequest = (status: string | null | undefined) =>
    ["requested", "pending"].includes((status || "").toLowerCase());

  const pendingCount = useMemo(
    () => requests.filter((item) => isPendingRequest(item.status)).length,
    [requests],
  );

  const filteredRequests = useMemo(() => {

    if (filter === "pending") {
      return requests.filter((item) => isPendingRequest(item.status));

    }

    if (filter === "approved") {

      return requests.filter((item) =>

        ["approved", "processing", "processed", "refunded"].includes(

          item.status?.toLowerCase(),

        ),

      );

    }

    if (filter === "rejected") {

      return requests.filter(

        (item) => item.status?.toLowerCase() === "rejected",

      );

    }

    return requests;

  }, [requests, filter]);

  const handleDecision = async () => {

    if (!modal || modal.type !== "confirm" || processingId) return;

    const { request, decision } = modal;

    if (!isPendingRequest(request.status)) {
      setError("Only pending cancellation requests can be processed.");

      setModal(null);

      return;

    }

    setProcessingId(request.id);

    setError("");

    setSuccess("");

    try {

      const {

        data: { session },

        error: sessionError,

      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {

        throw new Error("Admin session missing. Please log in again.");

      }

      const response = await fetch("/api/admin/cancellations/decision", {

        method: "POST",

        cache: "no-store",

        credentials: "same-origin",

        headers: {

          "Content-Type": "application/json",

          Accept: "application/json",

          Authorization: `Bearer ${session.access_token}`,

        },

body: JSON.stringify({

  cancellationRequestId: request.id,

  decision,

  reviewNote: "",

}),

      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {

        throw new Error(

          result.message || result.error || "Unable to process cancellation request.",

        );

      }

      setSuccess(

        decision === "approve"

          ? `Cancellation approved. Refund has not been initiated yet.`

          : "Cancellation request rejected.",

      );

      setModal(null);

      await refreshAll();

    } catch (err) {

      setError(

        err instanceof Error

          ? err.message

          : "Unable to process cancellation request.",

      );

    } finally {

      setProcessingId(null);

    }

  };

  const isBusy = loading || requestsLoading;

  return (

    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-3 sm:px-4">

        <div className="flex min-w-0 items-center gap-2">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">

            <RotateCcw size={16} />

          </div>

          <div className="min-w-0">

            <h2 className="text-sm font-bold text-gray-900">

              Refund Management

            </h2>

            <p className="text-[11px] text-gray-500">

              Cancellation requests and refunds

            </p>

          </div>

          <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700">

            {pendingCount} pending

          </span>

        </div>

        <button

          type="button"

          onClick={() => void refreshAll()}

          disabled={refreshing || isBusy}

          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"

        >

          <RefreshCw

            size={13}

            className={refreshing ? "animate-spin" : ""}

          />

          Refresh

        </button>

      </header>

      {(error || success) && (

        <div className="space-y-2 px-3 pt-3 sm:px-4">

          {error && (

            <div

              role="alert"

              className="flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"

            >

              <span>{error}</span>

              <button

                type="button"

                onClick={() => setError("")}

                aria-label="Dismiss error"

              >

                <X size={14} />

              </button>

            </div>

          )}

          {success && (

            <div

              role="status"

              className="flex items-start justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"

            >

              <span>{success}</span>

              <button

                type="button"

                onClick={() => setSuccess("")}

                aria-label="Dismiss message"

              >

                <X size={14} />

              </button>

            </div>

          )}

        </div>

      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 sm:px-4">

        <p className="text-[11px] text-gray-500">

          {requests.length} cancellation requests · {refunds.length} refunds

        </p>

        <select

          value={filter}

          onChange={(event) => setFilter(event.target.value)}

          aria-label="Filter cancellation requests"

          className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-gray-400"

        >

          <option value="all">All requests</option>

          <option value="pending">Pending</option>

          <option value="approved">Approved / processing</option>

          <option value="rejected">Rejected</option>

        </select>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[1160px] text-left text-[11px]">

          <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">

            <tr>

              <th className="px-2.5 py-2 font-semibold">Booking / Refund</th>

              <th className="px-2.5 py-2 font-semibold">Customer</th>

              <th className="px-2.5 py-2 font-semibold">Worker</th>

              <th className="px-2.5 py-2 font-semibold">Reason</th>

              <th className="px-2.5 py-2 font-semibold">Original</th>

              <th className="px-2.5 py-2 font-semibold">Refund</th>

              <th className="px-2.5 py-2 font-semibold">Status</th>

              <th className="px-2.5 py-2 font-semibold">Razorpay ID</th>

              <th className="px-2.5 py-2 font-semibold">Requested</th>

              <th className="px-2.5 py-2 text-right font-semibold">Actions</th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {isBusy &&

              Array.from({ length: 3 }).map((_, i) => (

                <tr key={`loading-${i}`}>

                  {Array.from({ length: 10 }).map((__, j) => (

                    <td key={j} className="px-3 py-3">

                      <div className="h-3 animate-pulse rounded bg-gray-100" />

                    </td>

                  ))}

                </tr>

              ))}

            {!isBusy &&

              filteredRequests.map((item) => {

                const amount =

                  item.refund_amount != null

                    ? Number(item.refund_amount)

                    : NaN;

                const validAmount = Number.isFinite(amount) && amount > 0;

                const reason =

                  item.cancellation_reason || item.reason || "Reason not provided";

                return (

                  <tr

                    key={`cancellation-${item.id}`}

                    className="align-top transition-colors hover:bg-gray-50/70"

                  >

                    <td className="px-2.5 py-2">

                      <p className="mt-1.5 whitespace-nowrap font-semibold text-gray-900">

                        {item.booking_number || item.booking_id}

                      </p>

                      <p className="mt-1 max-w-32 truncate text-[10px] text-gray-500">

                        {item.booking_id}

                      </p>

                    </td>

                    <td className="px-2.5 py-2">

                      <p className="max-w-36 truncate font-medium text-gray-800">

                        {item.customer_name || "Customer unavailable"}

                      </p>

                      <p className="mt-1 max-w-36 truncate text-[10px] text-gray-500">

                        {item.customer_email || "—"}

                      </p>

                      <p className="mt-1 text-[10px] text-gray-500">

                        {item.customer_phone || "—"}

                      </p>

                    </td>

                    <td className="px-2.5 py-2">
                      <p className="max-w-36 truncate font-semibold text-gray-900">
                        {item.worker_name || "Worker not assigned"}
                      </p>
                      <p className="mt-1 max-w-36 truncate text-[10px] text-gray-500">
                        {item.worker_code || item.worker_id || "No worker ID"}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-600">
                        {item.worker_phone || "Phone unavailable"}
                      </p>
                      {item.worker_category && (
                        <p className="mt-1 text-[10px] text-gray-500">{item.worker_category}</p>
                      )}
                    </td>


                    <td className="px-2 py-1.5">

                      <div className="max-w-40 rounded-md border border-red-100 bg-red-50 px-1.5 py-1">

                        <p

                          title={reason}

                          className="mt-0.5 whitespace-normal break-words text-[10px] font-medium leading-3.5 text-red-700"

                        >

                          {reason}

                        </p>

                      </div>

                    </td>

                    <td className="px-2.5 py-2 text-gray-500">—</td>

                    <td className="whitespace-nowrap px-2.5 py-2 font-semibold text-gray-900">

                      {validAmount ? (

                        formatCurrency(amount)

                      ) : (

                        <span className="text-red-600">Unverified</span>

                      )}

                      <p className="mt-1 text-[10px] font-normal text-gray-500">

                        {item.refund_method || "Method unknown"}

                      </p>

                    </td>

                    <td className="px-2.5 py-2">

                      <StatusBadge status={item.status} />

                      <p className="mt-1.5">

                        <StatusBadge status={item.refund_status} />

                      </p>

                    </td>

                    <td className="max-w-32 break-all px-2.5 py-2 text-[10px] text-gray-600">

                      {item.razorpay_refund_id || "Not assigned"}

                      {item.refund_failure_reason && (

                        <p className="mt-1 text-red-600">

                          {item.refund_failure_reason}

                        </p>

                      )}

                    </td>

                    <td className="whitespace-nowrap px-2.5 py-2 text-[10px] text-gray-500">

                      {formatDate(item.requested_at)}

                    </td>

                    <td className="px-2.5 py-2">

                      <div className="flex justify-end">

                        <button

                          type="button"

                          onClick={() =>

                            setModal({ type: "details", request: item })

                          }

                          className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-700 transition hover:bg-gray-50"

                        >

                          <Eye size={11} />

                          View

                        </button>

                      </div>

                    </td>

                  </tr>

                );

              })}

            {!isBusy &&

              refunds.map((refund) => (

                <tr

                  key={`refund-${refund.id}`}

                  className="align-top transition-colors hover:bg-gray-50/70"

                >

                  <td className="px-2.5 py-2">

                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gray-600">

                      Refund

                    </span>

                    <p className="mt-1.5 font-semibold text-gray-900">

                      {refund.refund_number || refund.id}

                    </p>

                    <p className="mt-1 max-w-32 truncate text-[10px] text-gray-500">

                      {refund.source_type || "other"} · {refund.source_id || "—"}

                    </p>

                  </td>

                  <td className="px-2.5 py-2">

                    <p className="max-w-36 truncate font-medium text-gray-800">

                      {refund.customer_name || "Customer unavailable"}

                    </p>

                    <p className="mt-1 max-w-36 truncate text-[10px] text-gray-500">

                      {refund.customer_email || "—"}

                    </p>

                  </td>

                  <td className="px-2.5 py-2 text-gray-400">—</td>

                  <td className="px-2 py-1.5">

                    <span className="text-gray-400">—</span>

                  </td>

                  <td className="whitespace-nowrap px-2.5 py-2 text-gray-700">

                    {formatCurrency(refund.original_amount)}

                  </td>

                  <td className="whitespace-nowrap px-2.5 py-2 font-semibold text-gray-900">

                    {formatCurrency(refund.refund_amount)}

                  </td>

                  <td className="px-2.5 py-2">

                    <span

                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${getStatusClass(refund.status)}`}

                    >

                      {getStatusLabel(refund.status)}

                    </span>

                    {refund.failure_reason && (

                      <p className="mt-1 max-w-32 text-[10px] text-red-600">

                        {refund.failure_reason}

                      </p>

                    )}

                  </td>

                  <td className="max-w-32 break-all px-2.5 py-2 text-[10px] text-gray-600">

                    {refund.razorpay_refund_id || "Not assigned"}

                    {refund.razorpay_status && (

                      <p className="mt-1 text-gray-500">

                        {refund.razorpay_status}

                      </p>

                    )}

                  </td>

                  <td className="whitespace-nowrap px-2.5 py-2 text-[10px] text-gray-500">

                    {formatDate(refund.requested_at || refund.created_at)}

                  </td>

                  <td className="px-2.5 py-2 text-right">

                    <button

                      type="button"

                      onClick={() => onSelect?.(refund)}

                      disabled={!onSelect}

                      className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"

                    >

                      <Eye size={12} />

                      View

                    </button>

                  </td>

                </tr>

              ))}

            {!isBusy &&

              filteredRequests.length === 0 &&

              refunds.length === 0 && (

                <tr>

                  <td colSpan={10} className="px-3 py-12 text-center">

                    <RotateCcw

                      size={24}

                      className="mx-auto text-gray-300"

                    />

                    <p className="mt-2 text-sm font-semibold text-gray-700">

                      No refund records found

                    </p>

                    <p className="mt-1 text-xs text-gray-500">

                      New cancellation requests will appear in this table.

                    </p>

                  </td>

                </tr>

              )}

          </tbody>

        </table>

      </div>

      {modal?.type === "details" && (

        <ModalShell

          title="Cancellation Details"

          subtitle={modal.request.booking_number || modal.request.booking_id}

          onClose={() => setModal(null)}

        >

          {(() => {

            const item = modal.request;

            const details = item.refund_details;

            const amount =

              item.refund_amount != null ? Number(item.refund_amount) : NaN;

            return (

              <div className="space-y-4">

                <div className="rounded-lg border border-red-100 bg-red-50 p-3">

                  <p className="text-[10px] font-bold uppercase tracking-wide text-red-600">

                    Cancellation reason

                  </p>

                  <p className="mt-1 text-sm font-medium leading-5 text-red-800">

                    {item.cancellation_reason || item.reason || "Not provided"}

                  </p>

                </div>

                <div className="grid gap-2 sm:grid-cols-2">

                  <Detail label="Customer" value={item.customer_name} />

                  <Detail label="Email" value={item.customer_email} />

                  <Detail label="Phone" value={item.customer_phone} />
                  <Detail label="Worker Name" value={item.worker_name} />
                  <Detail label="Worker Phone" value={item.worker_phone} />
                  <Detail label="Worker Code" value={item.worker_code} />
                  <Detail label="Worker Category" value={item.worker_category} />
                  <Detail label="Worker Location" value={item.worker_location} />
                  <Detail label="Worker ID" value={item.worker_id} />

                  <Detail label="Booking ID" value={item.booking_id} />

                  <Detail label="Cancellation status" value={item.status} />

                  <Detail label="Refund status" value={item.refund_status} />

                  <Detail

                    label="Refund amount"

                    value={

                      Number.isFinite(amount) && amount > 0

                        ? formatCurrency(amount)

                        : "Unverified"

                    }

                  />

                  <Detail

                    label="Refund method"

                    value={item.refund_method || details?.refund_method}

                  />

                  <Detail

                    label="Requested at"

                    value={formatDate(item.requested_at)}

                  />

                  <Detail

                    label="Expected refund from"

                    value={item.refund_expected_from}

                  />

                  <Detail

                    label="Expected refund by"

                    value={item.refund_expected_by}

                  />

                  <Detail

                    label="Razorpay refund ID"

                    value={item.razorpay_refund_id}

                  />

                </div>

                <div>

                  <h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-900">

                    <ShieldCheck size={15} className="text-gray-600" />

                    Bank / UPI verification

                  </h3>

                  {!details ? (

                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">

                      No verification details are linked to this request.

                    </p>

                  ) : (

                    <div className="grid gap-2 sm:grid-cols-2">

                      <Detail label="UPI ID" value={details.refund_upi_id} />

                      <Detail

                        label="Account holder"

                        value={details.refund_account_holder_name}

                      />

                      <Detail

                        label="Bank name"

                        value={details.refund_bank_name}

                      />

                      <Detail

                        label="Account number"

                        value={maskAccount(details.refund_account_number)}

                      />

                      <Detail label="IFSC" value={details.refund_ifsc_code} />

                    </div>

                  )}

                </div>

                {item.refund_failure_reason && (

                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">

                    Refund error: {item.refund_failure_reason}

                  </div>

                )}

                <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">

                  <button

                    type="button"

                    onClick={() => setModal(null)}

                    className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"

                  >

                    Close

                  </button>

                  {isPendingRequest(item.status) && (

                    <>

                      <button

                        type="button"

                        onClick={() =>

                          setModal({

                            type: "confirm",

                            request: item,

                            decision: "reject",

                          })

                        }

                        className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"

                      >

                        Reject

                      </button>

                      <button

                        type="button"

                        disabled={processingId === item.id}

                        onClick={() =>

                          setModal({

                            type: "confirm",

                            request: item,

                            decision: "approve",

                          })

                        }

                        className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"

                      >

                        Approve Cancellation

                      </button>

                    </>

                  )}

                </div>

              </div>

            );

          })()}

        </ModalShell>

      )}

      {modal?.type === "confirm" && (

        <ModalShell

          title={

            modal.decision === "approve"

              ? "Confirm refund approval"

              : "Confirm cancellation rejection"

          }

          subtitle={modal.request.booking_number || modal.request.booking_id}

          onClose={() => {

            if (!processingId) setModal(null);

          }}

        >

          <div className="space-y-4">

            <div

              className={`rounded-lg border p-3 ${

                modal.decision === "approve"

                  ? "border-emerald-200 bg-emerald-50"

                  : "border-red-200 bg-red-50"

              }`}

            >

              <p className="text-sm font-semibold text-gray-900">

                {modal.decision === "approve"

                  ? "Approve cancellation and request refund?"

                  : "Reject this cancellation request?"}

              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">

                {modal.decision === "approve"

                  ? "The server must verify the original captured payment before creating a Razorpay refund."

                  : "The rejection decision will be sent to the admin API."}

              </p>

            </div>

            <div className="grid gap-2 sm:grid-cols-2">

              <Detail label="Customer" value={modal.request.customer_name} />

              <Detail label="Booking" value={modal.request.booking_number} />
              <Detail label="Worker" value={modal.request.worker_name} />
              <Detail label="Worker Phone" value={modal.request.worker_phone} />

              <Detail

                label="Reason"

                value={

                  modal.request.cancellation_reason || modal.request.reason

                }

              />

              <Detail

                label="Refund amount"

                value={

                  modal.request.refund_amount != null &&

                  Number.isFinite(Number(modal.request.refund_amount)) &&

                  Number(modal.request.refund_amount) > 0

                    ? formatCurrency(Number(modal.request.refund_amount))

                    : "Unverified"

                }

              />

            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">

              <button

                type="button"

                disabled={processingId !== null}

                onClick={() => setModal(null)}

                className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"

              >

                Cancel

              </button>

              <button

                type="button"

                disabled={processingId !== null}

                onClick={() => void handleDecision()}

                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 ${

                  modal.decision === "approve"

                    ? "bg-emerald-600 hover:bg-emerald-700"

                    : "bg-red-600 hover:bg-red-700"

                }`}

              >

                {processingId === modal.request.id ? (

                  <LoaderCircle size={14} className="animate-spin" />

                ) : modal.decision === "approve" ? (

                  <CheckCircle2 size={14} />

                ) : (

                  <XCircle size={14} />

                )}

                {processingId === modal.request.id

                  ? "Processing..."

                  : modal.decision === "approve"

                    ? "Confirm Approval"

                    : "Confirm Reject"}

              </button>

            </div>

          </div>

        </ModalShell>

      )}

    </section>

  );

}
