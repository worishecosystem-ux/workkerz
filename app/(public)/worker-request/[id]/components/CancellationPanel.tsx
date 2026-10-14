
"use client";

import { useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { WorkerRequest } from "./types";

interface CancellationPanelProps {
  request: WorkerRequest;
  onUpdated: (updatedRequest: Partial<WorkerRequest>) => void;
}

const CANCELLATION_REASONS = [
  "Work no longer required",
  "Created request by mistake",
  "Incorrect work details",
  "Budget or schedule changed",
  "Duplicate request",
  "Other",
];

const TERMINAL_STATUSES = [
  "completed",
  "complete",
  "cancelled",
  "canceled",
  "rejected",
];

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function getCancellationStatus(request: WorkerRequest) {
  return normalize(request.cancellation_status) || "none";
}

export default function CancellationPanel({
  request,
  onUpdated,
}: CancellationPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cancellationStatus = getCancellationStatus(request);
  const requestStatus = normalize(request.status);

  const isTerminal = TERMINAL_STATUSES.includes(requestStatus);

  const isPending =
    cancellationStatus === "cancellation_requested";

  const isApproved = [
    "approved",
    "cancelled",
    "canceled",
  ].includes(cancellationStatus);

  const isRejected = cancellationStatus === "rejected";

  const canCancel =
    !isTerminal &&
    !isPending &&
    !isApproved &&
    !isRejected &&
    cancellationStatus === "none";

  async function submitCancellation() {
    setError("");
    setSuccess("");

    if (!reason) {
      setError("Please select a cancellation reason.");
      return;
    }

    if (reason === "Other" && !details.trim()) {
      setError("Please provide details for the selected reason.");
      return;
    }

    if (details.trim().length > 1000) {
      setError("Details must not exceed 1000 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Please sign in before requesting cancellation."
        );
      }

      if (request.requester_user_id !== user.id) {
        throw new Error(
          "Only the person who created this request can cancel it."
        );
      }

      if (isTerminal) {
        throw new Error(
          "This request is already completed or closed."
        );
      }

      if (cancellationStatus !== "none") {
        throw new Error(
          "A cancellation request has already been submitted or reviewed."
        );
      }

      const { data, error: updateError } = await supabase
        .from("worker_requests")
        .update({
          cancellation_status: "cancellation_requested",
          cancellation_reason: reason,
          cancellation_details: details.trim() || null,
          cancellation_requested_at: new Date().toISOString(),
        })
        .eq("id", request.id)
        .eq("requester_user_id", user.id)
        .eq("is_deleted", false)
        .eq("cancellation_status", "none")
        .select("*")
        .maybeSingle();

      if (updateError) {
        if (updateError.code === "42703") {
          throw new Error(
            "Cancellation columns are missing. Run the cancellation SQL migration first."
          );
        }

        throw new Error(updateError.message);
      }

      if (!data) {
        throw new Error(
          "Request could not be updated. It may have already changed. Refresh and try again."
        );
      }

      onUpdated(data as Partial<WorkerRequest>);

      setSuccess("Cancellation request submitted successfully.");
      setFormOpen(false);
      setReason("");
      setDetails("");
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit cancellation request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating cancellation button */}
      {canCancel && (
        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setFormOpen(true);
          }}
          className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] right-4 z-50 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 active:scale-95 sm:bottom-6 sm:right-6"
          aria-label="Request work cancellation"
        >
          <XCircle className="h-5 w-5" />
          Cancel Request
        </button>
      )}

      {/* Status messages */}
      {!canCancel && (
        <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] right-3 z-40 max-w-[calc(100vw-24px)] sm:bottom-6 sm:right-6">
          {isPending && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-white p-3 shadow-lg">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Cancellation Pending
                </p>
                <p className="mt-1 text-[11px] text-gray-600">
                  Your request is awaiting review.
                </p>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-white p-3 shadow-lg">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="text-xs font-bold text-green-900">
                  Cancellation Approved
                </p>
                <p className="mt-1 text-[11px] text-gray-600">
                  This request has been cancelled.
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Cancellation Rejected
                </p>
                <p className="mt-1 text-[11px] text-gray-600">
                  Your cancellation request was not approved.
                </p>
              </div>
            </div>
          )}

          {isTerminal && !isApproved && !isRejected && (
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <p className="text-xs font-semibold text-gray-800">
                This request is {request.status} and cannot be cancelled.
              </p>
            </div>
          )}

          {!isPending &&
            !isApproved &&
            !isRejected &&
            !isTerminal &&
            cancellationStatus !== "none" && (
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-semibold text-gray-800">
                  Cancellation status: {request.cancellation_status}
                </p>
              </div>
            )}
        </div>
      )}

      {/* Success notification */}
      {success && (
        <div
          role="status"
          className="fixed right-3 top-4 z-[70] flex max-w-[calc(100vw-24px)] items-start gap-2 rounded-xl border border-green-200 bg-white p-3 text-sm text-green-800 shadow-lg sm:right-6"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <p>{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-1 rounded p-0.5 hover:bg-green-50"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Cancellation modal */}
      {formOpen && canCancel && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting
            ) {
              setFormOpen(false);
              setError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancellation-title"
            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-5"
          >
            {/* Modal header */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h2
                    id="cancellation-title"
                    className="text-base font-bold text-gray-900"
                  >
                    Cancel Work Request
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Submit your reason for review
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setError("");
                }}
                disabled={submitting}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                aria-label="Close cancellation form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Reason */}
            <div className="mb-3">
              <label
                htmlFor="cancellation-reason"
                className="mb-1.5 block text-xs font-semibold text-gray-800"
              >
                Cancellation Reason
              </label>

              <select
                id="cancellation-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="">Select a reason</option>

                {CANCELLATION_REASONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional details */}
            <div className="mb-4">
              <label
                htmlFor="cancellation-details"
                className="mb-1.5 block text-xs font-semibold text-gray-800"
              >
                Additional Details{" "}
                <span className="font-normal text-gray-500">
                  (optional)
                </span>
              </label>

              <textarea
                id="cancellation-details"
                value={details}
                onChange={(event) =>
                  setDetails(event.target.value.slice(0, 1000))
                }
                disabled={submitting}
                rows={3}
                maxLength={1000}
                placeholder="Explain why you need to cancel..."
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

              <div className="mt-1 flex items-center justify-between gap-2">
                {reason === "Other" ? (
                  <p className="text-[11px] text-red-600">
                    Details are required for Other.
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500">
                    Maximum 1000 characters
                  </p>
                )}

                <p className="shrink-0 text-[11px] text-gray-500">
                  {details.length}/1000
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setError("");
                }}
                disabled={submitting}
                className="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={submitCancellation}
                disabled={submitting}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}

                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}