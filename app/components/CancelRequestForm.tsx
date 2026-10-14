
"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  booking_id: string;
  booking_status?: string | null;
  work_status?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
};

type Props = {
  booking: Booking;
  existingRequest?: {
    id?: string;
    status?: string | null;
  } | null;
  onSubmitted?: () => void;
};

const REASONS = [
  "Service no longer required",
  "Booked by mistake",
  "Change of plans",
  "Worker delay",
  "Other",
];

export default function CancelRequestForm({
  booking,
  existingRequest = null,
  onSubmitted,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Service no longer required");
  const [details, setDetails] = useState("");
  const [refundMethod, setRefundMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const status = String(booking.booking_status || "").toLowerCase();
  const workStatus = String(booking.work_status || "").toLowerCase();
  const requestStatus = String(existingRequest?.status || "").toLowerCase();

  const hasRequest = Boolean(existingRequest?.id) ||
    ["requested", "pending", "approved", "rejected"].includes(requestStatus);

  const isClosed =
    ["cancelled", "canceled", "completed", "rejected"].includes(status) ||
    ["cancelled", "completed"].includes(workStatus);

  async function submitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (hasRequest) {
      setError("A cancellation request already exists for this booking.");
      return;
    }

    if (isClosed) {
      setError("This booking cannot be cancelled.");
      return;
    }

    if (!reason.trim()) {
      setError("Please select a cancellation reason.");
      return;
    }

    if (refundMethod === "upi" && !upiId.trim()) {
      setError("Please enter your UPI ID.");
      return;
    }

    if (
      refundMethod === "bank" &&
      (!accountHolder.trim() ||
        !accountNumber.trim() ||
        !ifsc.trim())
    ) {
      setError("Please complete all bank account details.");
      return;
    }

    if (!accepted) {
      setError("Please accept the cancellation and refund policy.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Please sign in again to submit your request.");
      }

      const refundDetails =
        refundMethod === "upi"
          ? { upiId: upiId.trim() }
          : {
              accountHolder: accountHolder.trim(),
              accountNumber: accountNumber.trim(),
              ifsc: ifsc.trim().toUpperCase(),
            };

      const response = await fetch(
        "/api/bookings/cancellation-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            bookingId: booking.id,
            reason: reason.trim(),
            description: details.trim(),
            refundType: "booking_charge",
            refundAmount: 49,
            refundMethod,
            refundDetails,
            policyVersion: "workkerz-booking-refund-49-v1",
            policyAccepted: true,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to submit cancellation request."
        );
      }

      setSuccess(
        result.message ||
          "Cancellation request submitted successfully for admin review."
      );

      onSubmitted?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (hasRequest) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="font-semibold text-amber-900">
          Cancellation request: {requestStatus || "submitted"}
        </p>
        <p className="mt-1 text-sm text-amber-800">
          Your request has already been recorded. Check its status in My
          Bookings.
        </p>
      </div>
    );
  }

  if (isClosed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setSuccess("");
          setOpen(true);
        }}
        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
      >
        Cancel Request
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-request-title"
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
              <div>
                <h2
                  id="cancel-request-title"
                  className="text-lg font-bold text-gray-900"
                >
                  Cancel Booking Request
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Booking: {booking.booking_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                aria-label="Close cancellation form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitRequest} className="space-y-4 p-4 sm:p-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-900">
                  Booking charge refund: ₹49
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  This request covers the booking charge only, subject to the
                  existing refund policy and admin verification. It does not
                  guarantee a refund of the full booking amount.
                </p>
              </div>

              <div>
                <label
                  htmlFor="cancel-reason"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Cancellation reason *
                </label>
                <select
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-red-500"
                >
                  {REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cancel-details"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Additional details (optional)
                </label>
                <textarea
                  id="cancel-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={1200}
                  placeholder="Enter additional details, if any..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-800">
                  Refund method *
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundMethod("upi")}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
                      refundMethod === "upi"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    UPI
                  </button>

                  <button
                    type="button"
                    onClick={() => setRefundMethod("bank")}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
                      refundMethod === "bank"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Bank Account
                  </button>
                </div>
              </div>

              {refundMethod === "upi" ? (
                <div>
                  <label
                    htmlFor="refund-upi"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    UPI ID *
                  </label>
                  <input
                    id="refund-upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="example@upi"
                    autoComplete="off"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-red-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="refund-holder"
                      className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                      Account holder name *
                    </label>
                    <input
                      id="refund-holder"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      autoComplete="name"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="refund-account"
                      className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                      Account number *
                    </label>
                    <input
                      id="refund-account"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      inputMode="numeric"
                      autoComplete="off"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="refund-ifsc"
                      className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                      IFSC code *
                    </label>
                    <input
                      id="refund-ifsc"
                      value={ifsc}
                      onChange={(e) =>
                        setIfsc(e.target.value.toUpperCase())
                      }
                      maxLength={11}
                      autoComplete="off"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm uppercase"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1"
                  required
                />
                <span>
                  I have read and accept the Workkerz booking-charge
                  cancellation and refund policy.
                </span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={loading || Boolean(success)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
