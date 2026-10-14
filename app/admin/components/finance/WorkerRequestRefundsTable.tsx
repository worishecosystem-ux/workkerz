
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Eye,
  Copy,
  CreditCard,
  ReceiptText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "./finance.utils";

type WorkerRequestRefund = {
  id: string;
  worker_name: string | null;
  category: string | null;
  location: string | null;
  work_date: string | null;
  requester_name: string | null;
  requester_mobile: string | null;
  requester_email: string | null;
  company_name: string | null;
  project_name: string | null;
  cancellation_status: string | null;
  cancellation_reason: string | null;
  cancellation_details: string | null;
  cancellation_requested_at: string | null;
  refund_status: string | null;
  refund_amount: number | string | null;
  booking_charge_amount: number | string | null;
  payment_status: string | null;
  razorpay_payment_id: string | null;
  razorpay_refund_id: string | null;
  transaction_id: string | null;
  payment_method: string | null;
  refund_completed_at: string | null;
  created_at: string | null;
};

function getStatusClass(value: string | null | undefined) {
  const status = String(value ?? "pending").toLowerCase();

  if (
    ["approved", "completed", "processed", "refunded", "success", "paid"].includes(
      status
    )
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["rejected", "failed", "cancelled", "error"].includes(status)) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function StatusBadge({ value }: { value: string | null | undefined }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold capitalize ${getStatusClass(
        value
      )}`}
    >
      {String(value || "unknown").replaceAll("_", " ")}
    </span>
  );
}

function Detail({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string | number | null | undefined;
  copyable?: boolean;
}) {
  const displayValue =
    value !== null && value !== undefined && String(value).trim()
      ? String(value)
      : "—";

  return (
    <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <div className="mt-1 flex items-start justify-between gap-2">
        <p className="break-all text-xs font-semibold text-gray-800">
          {displayValue}
        </p>

        {copyable && displayValue !== "—" && (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(displayValue);
            }}
            className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-200"
            title={`Copy ${label}`}
          >
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkerRequestRefundsTable() {
  const [rows, setRows] = useState<WorkerRequestRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedRow, setSelectedRow] =
    useState<WorkerRequestRefund | null>(null);

  const loadRows = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Admin session missing. Please log in again.");
      }

      const response = await fetch(
        "/api/admin/finance/worker-request-refunds",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error || result.message || "Unable to load worker request refunds."
        );
      }

      const loadedRows: WorkerRequestRefund[] = Array.isArray(
        result.workerRequestCancellations
      )
        ? result.workerRequestCancellations
        : [];

      setRows(loadedRows);

      setSelectedRow((current) =>
        current
          ? loadedRows.find((row) => row.id === current.id) ?? null
          : null
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load refunds."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();

    const channel = supabase
      .channel("finance-worker-request-refunds-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "worker_requests",
        },
        () => {
          void loadRows(true);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadRows]);

  const processRefund = async (row: WorkerRequestRefund) => {
    if (busyId) return;

    const cancellationStatus = String(
      row.cancellation_status ?? ""
    ).toLowerCase();

    if (
      !["approved", "cancelled", "canceled"].includes(cancellationStatus)
    ) {
      setError("Approve the cancellation before processing its refund.");
      setNotice("");
      return;
    }

    const action = row.razorpay_refund_id
      ? "check the existing Razorpay refund"
      : "initiate a Razorpay refund";

    if (
      !window.confirm(
        `Are you sure you want to ${action}? Verify the correct payment before continuing.`
      )
    ) {
      return;
    }

    setBusyId(row.id);
    setError("");
    setNotice("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Admin session missing. Please log in again.");
      }

      const response = await fetch(
        "/api/admin/finance/worker-request-refunds/process",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ requestId: row.id }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || result.error || "Unable to process refund."
        );
      }

      if (result.refundProcessed || result.status === "refunded") {
        setNotice("Razorpay confirms that the refund has been processed.");
      } else {
        setNotice(
          `Refund ${result.refundId ? `(${result.refundId}) ` : ""}status: ${
            result.razorpayStatus || result.status || "processing"
          }.`
        );
      }

      await loadRows(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process refund."
      );
    } finally {
      setBusyId(null);
    }
  };

  const decide = async (
    row: WorkerRequestRefund,
    decision: "approve" | "reject"
  ) => {
    if (busyId) return;

    if (
      !window.confirm(
        `Are you sure you want to ${decision} this cancellation?`
      )
    ) {
      return;
    }

    setBusyId(row.id);
    setError("");
    setNotice("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Admin session missing. Please log in again.");
      }

      const response = await fetch("/api/admin/cancellations/decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          requestType: "worker_request",
          requestId: row.id,
          decision,
          reviewNote: "",
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error || result.message || "Unable to update cancellation."
        );
      }

      setNotice(
        decision === "approve"
          ? "Cancellation approved."
          : "Cancellation rejected."
      );

      await loadRows(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update cancellation."
      );
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = rows.filter(
    (row) =>
      String(row.cancellation_status ?? "").toLowerCase() ===
      "cancellation_requested"
  ).length;

  return (
    <section className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 bg-orange-50/70 px-3 py-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Worker Request Refunds & Cancellations
          </h3>
          <p className="mt-1 text-xs text-gray-600">
            Review requests, payments and refund status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-orange-100 px-2 py-1 text-[10px] font-semibold text-orange-800">
            {pendingCount} pending review
          </span>

          <button
            type="button"
            onClick={() => void loadRows(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="m-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="m-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] table-fixed text-left text-[10px]">
          <colgroup>
            <col className="w-[110px]" />
            <col className="w-[115px]" />
            <col className="w-[120px]" />
            <col className="w-[85px]" />
            <col className="w-[120px]" />
            <col className="w-[80px]" />
            <col className="w-[90px]" />
            <col className="w-[95px]" />
            <col className="w-[165px]" />
          </colgroup>

          <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-2 py-2">Worker Request</th>
              <th className="px-2 py-2">Requester</th>
              <th className="px-2 py-2">Reason</th>
              <th className="px-2 py-2">Charge</th>
              <th className="px-2 py-2">Transaction ID</th>
              <th className="px-2 py-2">Mode</th>
              <th className="px-2 py-2">Cancellation</th>
              <th className="px-2 py-2">Refund</th>
              <th className="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center">
                  Loading refunds...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center">
                  No cancellation records found.
                </td>
              </tr>
            )}

            {rows.map((row) => {
              const pending =
                String(row.cancellation_status ?? "").toLowerCase() ===
                "cancellation_requested";

              const refunded = ["refunded", "success", "successful"].includes(
                String(row.refund_status ?? "").toLowerCase()
              );

              const charge =
                row.booking_charge_amount ?? row.refund_amount;

              return (
                <tr key={row.id} className="align-top hover:bg-gray-50">
                  <td className="px-2 py-2">
                    <p className="truncate font-semibold" title={row.id}>
                      {row.id}
                    </p>
                    <p className="mt-1 truncate text-gray-500">
                      {row.project_name || "Worker request"}
                    </p>
                  </td>

                  <td className="px-2 py-2">
                    <p
                      className="truncate font-semibold"
                      title={row.requester_name || row.company_name || ""}
                    >
                      {row.requester_name || row.company_name || "—"}
                    </p>
                    <p
                      className="mt-1 truncate text-gray-500"
                      title={row.requester_email || ""}
                    >
                      {row.requester_email || "—"}
                    </p>
                  </td>

                  <td className="px-2 py-2">
                    <div
                      className="break-words rounded-md border border-red-100 bg-red-50 p-2 text-red-700"
                      title={row.cancellation_reason || row.cancellation_details || ""}
                    >
                      {row.cancellation_reason ||
                        row.cancellation_details ||
                        "Reason not provided"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-2 py-2 font-semibold">
                    {charge != null && Number.isFinite(Number(charge))
                      ? formatCurrency(Number(charge))
                      : "—"}
                    <p className="mt-1 font-normal text-gray-500">
                      {row.payment_status || "Unknown"}
                    </p>
                  </td>

                  <td className="px-2 py-2">
                    <p
                      className="truncate"
                      title={row.transaction_id || row.razorpay_payment_id || ""}
                    >
                      {row.transaction_id || row.razorpay_payment_id || "—"}
                    </p>
                    {row.razorpay_payment_id && (
                      <p className="mt-1 truncate text-gray-500">
                        {row.razorpay_payment_id}
                      </p>
                    )}
                  </td>

                  <td className="px-2 py-2">
                    <span className="inline-block max-w-full truncate rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-semibold uppercase text-blue-700">
                      {row.payment_method || "Unknown"}
                    </span>
                  </td>

                  <td className="px-2 py-2">
                    <StatusBadge value={row.cancellation_status} />
                  </td>

                  <td className="px-2 py-2">
                    <StatusBadge value={row.refund_status || "not_initiated"} />
                    {row.razorpay_refund_id && (
                      <p
                        className="mt-1 truncate text-gray-500"
                        title={row.razorpay_refund_id}
                      >
                        {row.razorpay_refund_id}
                      </p>
                    )}
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedRow(row)}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 font-semibold text-blue-700"
                      >
                        <Eye size={12} />
                        View
                      </button>

                      {pending && (
                        <>
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => void decide(row, "reject")}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 font-semibold text-red-700 disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => void decide(row, "approve")}
                            className="rounded-md bg-emerald-600 px-2 py-1.5 font-semibold text-white disabled:opacity-50"
                          >
                            {busyId === row.id ? "Saving..." : "Approve"}
                          </button>
                        </>
                      )}

                      {refunded ? (
                        <span className="rounded-md bg-emerald-50 px-2 py-1.5 font-semibold text-emerald-700">
                          Refunded
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          title={
                            row.razorpay_refund_id
                              ? "Check existing Razorpay refund"
                              : "Process refund through Razorpay"
                          }
                          onClick={() => void processRefund(row)}
                          className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-full bg-emerald-600 px-2.5 text-[10px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyId === row.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : row.razorpay_refund_id ? (
                            "Check Refund"
                          ) : (
                            "Process Refund"
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="border-t border-gray-100 px-3 py-2 text-[10px] text-gray-500">
        Refund status is updated from Razorpay. A refund is successful only when
        Razorpay reports it as processed.
      </footer>

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <section
            role="dialog"
            aria-modal="true"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <header className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
              <div>
                <h3 className="text-sm font-bold">
                  Worker Request Details
                </h3>
                <p className="mt-1 break-all text-[10px] text-gray-500">
                  {selectedRow.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-md border px-3 py-1.5 text-xs"
              >
                Close
              </button>
            </header>

            <div className="space-y-5 p-4">
              <section>
                <h4 className="mb-2 text-xs font-bold">Requester & Work</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Detail
                    label="Requester"
                    value={selectedRow.requester_name || selectedRow.company_name}
                  />
                  <Detail label="Email" value={selectedRow.requester_email} />
                  <Detail label="Mobile" value={selectedRow.requester_mobile} />
                  <Detail label="Project" value={selectedRow.project_name} />
                  <Detail
                    label="Category"
                    value={selectedRow.category || selectedRow.worker_name}
                  />
                  <Detail label="Location" value={selectedRow.location} />
                  <Detail
                    label="Work Date"
                    value={
                      selectedRow.work_date
                        ? formatDate(selectedRow.work_date)
                        : null
                    }
                  />
                </div>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 text-xs font-bold">
                  <CreditCard size={14} />
                  Payment Details
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Detail
                    label="Booking Charge"
                    value={
                      selectedRow.booking_charge_amount != null
                        ? formatCurrency(Number(selectedRow.booking_charge_amount))
                        : null
                    }
                  />
                  <Detail
                    label="Payment Status"
                    value={selectedRow.payment_status}
                  />
                  <Detail
                    label="Payment Mode"
                    value={selectedRow.payment_method}
                  />
                  <Detail
                    label="Transaction ID"
                    value={selectedRow.transaction_id}
                    copyable
                  />
                  <Detail
                    label="Razorpay Payment ID"
                    value={selectedRow.razorpay_payment_id}
                    copyable
                  />
                  <Detail
                    label="Razorpay Refund ID"
                    value={selectedRow.razorpay_refund_id}
                    copyable
                  />
                  <Detail
                    label="Refund Amount"
                    value={
                      selectedRow.refund_amount != null
                        ? formatCurrency(Number(selectedRow.refund_amount))
                        : null
                    }
                  />
                  <Detail
                    label="Refund Completed At"
                    value={
                      selectedRow.refund_completed_at
                        ? formatDate(selectedRow.refund_completed_at)
                        : null
                    }
                  />
                </div>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 text-xs font-bold">
                  <ReceiptText size={14} />
                  Cancellation & Refund
                </h4>

                <div className="mb-3 flex flex-wrap gap-2">
                  <StatusBadge value={selectedRow.cancellation_status} />
                  <StatusBadge
                    value={selectedRow.refund_status || "not_initiated"}
                  />
                </div>

                <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-red-600">
                    Cancellation Reason
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-xs text-red-800">
                    {selectedRow.cancellation_reason || "Reason not provided"}
                  </p>

                  {selectedRow.cancellation_details && (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-red-700">
                      {selectedRow.cancellation_details}
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <Detail
                    label="Cancellation Requested At"
                    value={
                      selectedRow.cancellation_requested_at
                        ? formatDate(selectedRow.cancellation_requested_at)
                        : null
                    }
                  />
                </div>
              </section>
            </div>

            <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t bg-white px-4 py-3">
              {String(selectedRow.cancellation_status ?? "").toLowerCase() ===
                "cancellation_requested" && (
                <>
                  <button
                    type="button"
                    disabled={busyId === selectedRow.id}
                    onClick={() => void decide(selectedRow, "reject")}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={busyId === selectedRow.id}
                    onClick={() => void decide(selectedRow, "approve")}
                    className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Approve
                  </button>
                </>
              )}

              {!["refunded", "success", "successful"].includes(
                String(selectedRow.refund_status ?? "").toLowerCase()
              ) && (
                <button
                  type="button"
                  disabled={busyId === selectedRow.id}
                  onClick={() => void processRefund(selectedRow)}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busyId === selectedRow.id ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : selectedRow.razorpay_refund_id ? (
                    "Check Refund Status"
                  ) : (
                    "Process Refund"
                  )}
                </button>
              )}
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
