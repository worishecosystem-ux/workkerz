
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Users,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { WorkerRequest } from "./types";

type WorkerRequestWithCancellation = WorkerRequest & {
  cancellation_status?: string | null;
  cancellation_reason?: string | null;
  cancellation_details?: string | null;
  refund_status?: string | null;
  refund_amount?: number | string | null;
  refund_completed_at?: string | null;
};

const normalize = (value: unknown, fallback = "") =>
  String(value ?? fallback).trim().toLowerCase();

const formatMoney = (value: number | string | null | undefined) => {
  if (value == null || value === "") return null;

  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : null;
};

export default function WorkerRequestCard({
  request,
}: {
  request: WorkerRequest;
}) {
  const item = request as WorkerRequestWithCancellation;

  const [liveStatus, setLiveStatus] = useState(
    normalize(item.status, "pending")
  );

  const [cancellationStatus, setCancellationStatus] = useState(
    normalize(item.cancellation_status, "none")
  );

  const [cancellationReason, setCancellationReason] = useState(
    item.cancellation_reason ?? ""
  );

  const [cancellationDetails, setCancellationDetails] = useState(
    item.cancellation_details ?? ""
  );

  const [refundStatus, setRefundStatus] = useState(
    normalize(item.refund_status)
  );

  const [refundAmount, setRefundAmount] = useState<
    number | string | null | undefined
  >(item.refund_amount);

  const [refundCompletedAt, setRefundCompletedAt] = useState<string | null>(
    item.refund_completed_at ?? null
  );

  useEffect(() => {
    setLiveStatus(normalize(item.status, "pending"));
    setCancellationStatus(normalize(item.cancellation_status, "none"));
    setCancellationReason(item.cancellation_reason ?? "");
    setCancellationDetails(item.cancellation_details ?? "");
    setRefundStatus(normalize(item.refund_status));
    setRefundAmount(item.refund_amount);
    setRefundCompletedAt(item.refund_completed_at ?? null);
  }, [
    item.id,
    item.status,
    item.cancellation_status,
    item.cancellation_reason,
    item.cancellation_details,
    item.refund_status,
    item.refund_amount,
    item.refund_completed_at,
  ]);

  useEffect(() => {
    if (!item.id) return;

    const channel = supabase
      .channel(`worker-request-live-${item.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "worker_requests",
          filter: `id=eq.${item.id}`,
        },
        (payload) => {
          const updated = payload.new as Partial<WorkerRequestWithCancellation>;

          if (updated.status !== undefined) {
            setLiveStatus(normalize(updated.status, "pending"));
          }

          if (updated.cancellation_status !== undefined) {
            setCancellationStatus(
              normalize(updated.cancellation_status, "none")
            );
          }

          if (updated.cancellation_reason !== undefined) {
            setCancellationReason(updated.cancellation_reason ?? "");
          }

          if (updated.cancellation_details !== undefined) {
            setCancellationDetails(updated.cancellation_details ?? "");
          }

          if (updated.refund_status !== undefined) {
            setRefundStatus(normalize(updated.refund_status));
          }

          if (updated.refund_amount !== undefined) {
            setRefundAmount(updated.refund_amount);
          }

          if (updated.refund_completed_at !== undefined) {
            setRefundCompletedAt(updated.refund_completed_at ?? null);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [item.id]);

  const isCancellationRequested =
    cancellationStatus === "cancellation_requested";

  const isCancellationApproved = [
    "approved",
    "cancelled",
    "canceled",
  ].includes(cancellationStatus);

  const isCancellationRejected = cancellationStatus === "rejected";

  const isCancelled =
    isCancellationApproved ||
    ["cancelled", "canceled"].includes(liveStatus);

  // Refund badge is restricted to cancellation-related requests.
  const showRefundBadge =
    isCancellationRequested ||
    isCancellationApproved ||
    isCancellationRejected ||
    isCancelled;

  const isRefundSuccessful = [
    "processed",
    "refunded",
    "success",
    "successful",
  ].includes(refundStatus);

  const isRefundProcessing = [
    "pending",
    "initiated",
    "processing",
  ].includes(refundStatus);

  const isRefundFailed = [
    "failed",
    "rejected",
    "error",
  ].includes(refundStatus);

  const cancellationLabel = isCancellationRequested
    ? "CANCELLATION PENDING"
    : isCancellationApproved
      ? "REQUEST CANCELLED"
      : isCancellationRejected
        ? "CANCELLATION REJECTED"
        : isCancelled
          ? "REQUEST CANCELLED"
          : null;

  const statusClass = [
    "completed",
    "accepted",
    "confirmed",
  ].includes(liveStatus)
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : ["rejected", "cancelled", "canceled"].includes(liveStatus)
      ? "bg-red-50 text-red-700 ring-red-200"
      : ["in_progress", "in-progress"].includes(liveStatus)
        ? "bg-blue-50 text-blue-700 ring-blue-200"
        : "bg-amber-50 text-amber-800 ring-amber-200";

  const formattedAmount = formatMoney(refundAmount);

  const completedDate = refundCompletedAt
    ? new Date(refundCompletedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isCancelled || isCancellationRequested
          ? "border-red-200"
          : "border-slate-200"
      }`}
    >
      <div
        className={`h-1 ${
          isCancelled || isCancellationRequested
            ? "bg-red-500"
            : "bg-gradient-to-r from-violet-600 to-fuchsia-500"
        }`}
      />

      <div className="space-y-3 p-3">
        {/* Request header */}
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              isCancelled || isCancellationRequested
                ? "bg-red-50 text-red-600"
                : "bg-violet-50 text-violet-600"
            }`}
          >
            <Users size={16} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <h2 className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900">
                {item.project_name || item.category || "Worker request"}
              </h2>

              <span
                className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-bold ring-1 ring-inset ${statusClass}`}
              >
                {liveStatus.replace(/[_-]+/g, " ").toUpperCase()}
              </span>
            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              {item.category || "General work"} ·{" "}
              {item.workers_required ?? 1} worker(s)
            </p>
          </div>
        </div>

        {/* Cancellation details */}
        {cancellationLabel && (
          <section className="rounded-lg border border-red-200 bg-red-50/80 p-2.5">
            <div className="flex items-center gap-1.5">
              <XCircle size={14} className="shrink-0 text-red-600" />
              <p className="text-[10px] font-bold text-red-700">
                {cancellationLabel}
              </p>
            </div>

            {cancellationReason.trim() && (
              <div className="mt-2 rounded-md bg-white/70 p-2">
                <p className="text-[9px] font-bold uppercase tracking-wide text-red-600">
                  Cancellation reason
                </p>
                <p className="mt-1 break-words text-[11px] leading-4 text-red-900">
                  {cancellationReason}
                </p>
              </div>
            )}

            {cancellationDetails.trim() && (
              <div className="mt-2 border-t border-red-200 pt-2">
                <p className="text-[9px] font-bold uppercase tracking-wide text-red-600">
                  Additional details
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-4 text-red-900">
                  {cancellationDetails}
                </p>
              </div>
            )}

            {!cancellationReason.trim() && isCancelled && (
              <p className="mt-1.5 text-[10px] text-red-700">
                Cancellation reason was not recorded.
              </p>
            )}

            {isCancellationRequested && (
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-red-700">
                <AlertTriangle size={11} />
                Awaiting cancellation review.
              </p>
            )}
          </section>
        )}

        {/* Refund badge: cancellation requests only */}
        {showRefundBadge && refundStatus && (
          <section
            className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 ${
              isRefundSuccessful
                ? "border-emerald-200 bg-emerald-50"
                : isRefundFailed
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex min-w-0 items-center gap-1.5">
              {isRefundSuccessful ? (
                <CheckCircle2
                  size={14}
                  className="shrink-0 text-emerald-600"
                />
              ) : isRefundFailed ? (
                <XCircle size={14} className="shrink-0 text-red-600" />
              ) : (
                <Clock3 size={14} className="shrink-0 text-amber-600" />
              )}

              <span
                className={`text-[10px] font-bold ${
                  isRefundSuccessful
                    ? "text-emerald-800"
                    : isRefundFailed
                      ? "text-red-800"
                      : "text-amber-800"
                }`}
              >
                {isRefundSuccessful
                  ? "Refund Successful"
                  : isRefundFailed
                    ? "Refund Failed"
                    : isRefundProcessing
                      ? "Refund Processing"
                      : `Refund: ${refundStatus.replace(/[_-]+/g, " ")}`}
              </span>
            </div>

            {formattedAmount !== null && (
              <span className="shrink-0 text-[10px] font-bold text-slate-800">
                ₹{formattedAmount}
              </span>
            )}

            {isRefundSuccessful && completedDate && (
              <span className="hidden text-[9px] text-emerald-700 sm:inline">
                {completedDate}
              </span>
            )}
          </section>
        )}

        {/* Work date and location */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2">
            <CalendarDays size={12} className="shrink-0 text-slate-500" />
            <span className="truncate text-[10px] text-slate-600">
              {item.work_date || "Date flexible"}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2">
            <MapPin size={12} className="shrink-0 text-slate-500" />
            <span className="truncate text-[10px] text-slate-600">
              {item.location || "Location not set"}
            </span>
          </div>
        </div>

        {/* Requirement */}
        {item.requirement && (
          <p className="line-clamp-2 break-words text-[10px] leading-4 text-slate-600">
            {item.requirement}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500">Budget</p>
            <p className="truncate text-xs font-bold text-slate-900">
              {item.budget != null
                ? `₹${Number(item.budget).toLocaleString("en-IN")}`
                : "Not specified"}
            </p>
          </div>

          <Link
            href={`/worker-request/${item.id}`}
            className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-[10px] font-bold transition ${
              isCancelled || isCancellationRequested
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            View Details
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
