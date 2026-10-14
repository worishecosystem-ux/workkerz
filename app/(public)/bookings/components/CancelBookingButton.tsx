
"use client";

import { useState } from "react";
import { AlertTriangle, X, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  booking: {
    id: string;
    booking_id?: string | null;
    booking_status?: string | null;
  };
  existingStatus?: string | null;
  onSubmitted: () => void;
};

export default function CancelBookingButton({
  booking,
  existingStatus,
  onSubmitted,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [holder, setHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestStatus = String(existingStatus ?? "").toLowerCase();
  const bookingStatus = String(booking.booking_status ?? "").toLowerCase();

  const requestAlreadyExists = [
    "requested",
    "pending",
    "approved",
    "accepted",
    "rejected",
    "cancelled",
    "canceled",
  ].includes(requestStatus);

  const bookingCannotBeCancelled =
    ["cancelled", "canceled", "completed", "complete", "work_completed", "rejected"]
      .includes(bookingStatus) || requestAlreadyExists;

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (reason.trim().length < 5) {
      setError("Please enter a cancellation reason (at least 5 characters).");
      return;
    }

    if (refundMethod === "upi" && !upiId.trim()) {
      setError("Please enter your UPI ID.");
      return;
    }

    if (
      refundMethod === "bank" &&
      (!holder.trim() ||
        !bankName.trim() ||
        accountNumber.trim().length < 6 ||
        !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc.trim()))
    ) {
      setError("Please enter valid bank account details and IFSC.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please sign in again to submit your request.");
      }

      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          reason: reason.trim(),
          customerEmail: user.email ?? "",
          customerPhone: phone.trim(),
          refundMethod,
          refundUpiId: refundMethod === "upi" ? upiId.trim() : "",
          refundAccountHolderName: refundMethod === "bank" ? holder.trim() : "",
          refundBankName: refundMethod === "bank" ? bankName.trim() : "",
          refundAccountNumber:
            refundMethod === "bank" ? accountNumber.trim() : "",
          refundIfscCode:
            refundMethod === "bank" ? ifsc.trim().toUpperCase() : "",
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ||
            result.error ||
            "Could not submit the cancellation request."
        );
      }

      setSuccess(
        "Cancellation request submitted. Your booking remains unchanged until admin review."
      );
      setReason("");
      onSubmitted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Request submission failed."
      );
    } finally {
      setLoading(false);
    }
  }

  if (bookingCannotBeCancelled) {
    return (
      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        {requestAlreadyExists
          ? `Cancellation request status: ${requestStatus}`
          : "This booking cannot be cancelled online."}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setSuccess("");
          setOpen(true);
        }}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
      >
        <AlertTriangle size={14} />
        Cancel Booking
      </button>

      {success && (
        <p role="status" className="mt-2 text-xs text-emerald-700">
          {success}
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cancel Booking
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Booking #{booking.booking_id || booking.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close cancellation form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Submitting this request does not cancel the booking immediately.
              Admin will review it first.
            </div>

            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Cancellation reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  required
                  minLength={5}
                  maxLength={1200}
                  rows={3}
                  placeholder="Why do you want to cancel?"
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Contact phone
                </label>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  maxLength={20}
                  placeholder="Phone number registered with booking"
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Enter the same phone number as the booking if it is not
                  already linked to your account.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Refund method *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundMethod("upi")}
                    className={`rounded-lg border p-2.5 text-sm font-medium ${
                      refundMethod === "upi"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundMethod("bank")}
                    className={`rounded-lg border p-2.5 text-sm font-medium ${
                      refundMethod === "bank"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Bank account
                  </button>
                </div>
              </div>

              {refundMethod === "upi" ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    UPI ID *
                  </label>
                  <input
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    required
                    maxLength={100}
                    placeholder="name@bank"
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    value={holder}
                    onChange={(event) => setHolder(event.target.value)}
                    required
                    maxLength={100}
                    placeholder="Account holder name"
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  />
                  <input
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    required
                    maxLength={100}
                    placeholder="Bank name"
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  />
                  <input
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    required
                    maxLength={34}
                    placeholder="Account number"
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  />
                  <input
                    value={ifsc}
                    onChange={(event) => setIfsc(event.target.value.toUpperCase())}
                    required
                    maxLength={11}
                    placeholder="IFSC code"
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm uppercase"
                  />
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                >
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  Go back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading && <LoaderCircle size={16} className="animate-spin" />}
                  {loading ? "Submitting..." : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
