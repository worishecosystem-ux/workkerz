
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  RefreshCw,
  ReceiptText,
  ShieldCheck,
  X,
} from "lucide-react";

const BOOKING_CHARGE = 49;
const REFUND_WINDOW_MS = 5 * 60 * 60 * 1000;
const POLICY_VERSION = "workkerz-booking-refund-49-v1";

const SUBMIT_URL = "/api/bookings/cancellation-request";
const HISTORY_URL = "/api/bookings/cancellation-requests";

type RefundMethod = "upi" | "bank";

type Booking = {
  id: string;
  booking_id?: string | null;
  created_at: string;
  booking_status?: string | null;
  payment_status?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  worker_name?: string | null;
  service_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  email?: string | null;
  phone?: string | null;
};

type RefundRequest = {
  id: string;
  booking_id: string;
  booking_number?: string | null;
  status?: string | null;
  request_status?: string | null;
  refund_status?: string | null;
  refund_amount?: number | string | null;
  cancellation_reason?: string | null;
  reason?: string | null;
  created_at?: string | null;
  requested_at?: string | null;
  razorpay_refund_id?: string | null;
};

type Props = {
  bookings: Booking[];
  initialRequests?: RefundRequest[];
  onRefresh?: () => void | Promise<void>;
  customerEmail?: string | null;
  customerPhone?: string | null;
};

const REASONS = [
  "Booked by mistake",
  "Booking no longer required",
  "Incorrect booking details",
  "Payment-related issue",
  "Other",
];

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function getStatus(request: RefundRequest) {
  const status = String(
    request.refund_status ||
      request.request_status ||
      request.status ||
      "pending"
  ).toLowerCase();

  if (["processed", "completed", "refunded", "success"].includes(status)) {
    return {
      label: "Refund completed",
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (["rejected", "declined"].includes(status)) {
    return {
      label: "Request rejected",
      className: "bg-red-50 text-red-700",
    };
  }

  if (["failed", "refund_failed"].includes(status)) {
    return {
      label: "Refund failed",
      className: "bg-red-50 text-red-700",
    };
  }

  if (["processing", "initiated"].includes(status)) {
    return {
      label: "Refund processing",
      className: "bg-blue-50 text-blue-700",
    };
  }

  if (
    ["under_verification", "under review", "reviewing"].includes(status)
  ) {
    return {
      label: "Under verification",
      className: "bg-violet-50 text-violet-700",
    };
  }

  return {
    label: "Pending admin review",
    className: "bg-amber-50 text-amber-700",
  };
}

function getEligibility(createdAt: string, now: number) {
  const created = new Date(createdAt).getTime();

  if (!Number.isFinite(created) || created > now) {
    return { eligible: false, remaining: 0 };
  }

  const remaining = created + REFUND_WINDOW_MS - now;

  return {
    eligible: remaining > 0,
    remaining: Math.max(0, remaining),
  };
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

function isRequestOpen(request?: RefundRequest) {
  if (!request) return false;

  const status = String(
    request.refund_status ||
      request.request_status ||
      request.status ||
      "pending"
  ).toLowerCase();

  return ![
    "rejected",
    "declined",
    "failed",
    "refund_failed",
  ].includes(status);
}

function normalizeEmail(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function normalizePhone(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

export default function UserRefundSection({
  bookings,
  initialRequests = [],
  onRefresh,
  customerEmail,
  customerPhone,
}: Props) {
  const [requests, setRequests] =
    useState<RefundRequest[]>(initialRequests);

  const [selected, setSelected] = useState<Booking | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState("");

  const [refundMethod, setRefundMethod] =
    useState<RefundMethod>("upi");

  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resolvedEmail = useMemo(
    () =>
      normalizeEmail(
        customerEmail ||
          selected?.customer_email ||
          selected?.email ||
          bookings.find((b) => b.customer_email || b.email)
            ?.customer_email ||
          bookings.find((b) => b.customer_email || b.email)?.email
      ),
    [customerEmail, selected, bookings]
  );

  const resolvedPhone = useMemo(
    () =>
      normalizePhone(
        customerPhone ||
          selected?.customer_phone ||
          selected?.phone ||
          bookings.find((b) => b.customer_phone || b.phone)
            ?.customer_phone ||
          bookings.find((b) => b.customer_phone || b.phone)?.phone
      ),
    [customerPhone, selected, bookings]
  );

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const requestMap = useMemo(() => {
    const map = new Map<string, RefundRequest>();

    for (const request of requests) {
      map.set(request.booking_id, request);
    }

    return map;
  }, [requests]);

  const eligibleBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const paymentStatus = String(
        booking.payment_status ?? ""
      ).toLowerCase();

      const bookingStatus = String(
        booking.booking_status ?? ""
      ).toLowerCase();

      const paymentConfirmed = [
        "paid",
        "captured",
        "completed",
        "success",
      ].includes(paymentStatus);

      const alreadyCancelled = [
        "cancelled",
        "canceled",
      ].includes(bookingStatus);

      const alreadyRequested = isRequestOpen(
        requestMap.get(booking.id)
      );

      const eligibility = getEligibility(booking.created_at, now);

      return (
        paymentConfirmed &&
        !alreadyCancelled &&
        !alreadyRequested &&
        eligibility.eligible
      );
    });
  }, [bookings, requestMap, now]);

  const refreshHistory = useCallback(async () => {
    if (!resolvedEmail || !resolvedPhone) {
      setError(
        "Customer email and phone are missing. Please reload your profile and try again."
      );
      return;
    }

    setRefreshing(true);
    setError("");

    try {
      const params = new URLSearchParams({
        email: resolvedEmail,
        phone: resolvedPhone,
      });

      const response = await fetch(
        `${HISTORY_URL}?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to load refund history."
        );
      }

      setRequests(result.requests ?? []);
      await onRefresh?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load refund history."
      );
    } finally {
      setRefreshing(false);
    }
  }, [resolvedEmail, resolvedPhone, onRefresh]);

  function resetForm() {
    setSelected(null);
    setReason(REASONS[0]);
    setDescription("");
    setRefundMethod("upi");
    setUpiId("");
    setAccountHolder("");
    setAccountNumber("");
    setConfirmAccountNumber("");
    setIfsc("");
    setAcceptedPolicy(false);
    setError("");
  }

  function openRefundForm(booking: Booking) {
    setSelected(booking);
    setReason(REASONS[0]);
    setDescription("");
    setRefundMethod("upi");
    setUpiId("");
    setAccountHolder("");
    setAccountNumber("");
    setConfirmAccountNumber("");
    setIfsc("");
    setAcceptedPolicy(false);
    setError("");
    setSuccess("");
  }

  function validateRefundDetails() {
    if (refundMethod === "upi") {
      const validUpi =
        /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(
          upiId.trim()
        );

      if (!validUpi) {
        setError("Please enter a valid UPI ID.");
        return false;
      }
    } else {
      if (!accountHolder.trim()) {
        setError("Please enter the account holder name.");
        return false;
      }

      if (!/^\d{9,18}$/.test(accountNumber)) {
        setError("Please enter a valid bank account number.");
        return false;
      }

      if (accountNumber !== confirmAccountNumber) {
        setError("Bank account numbers do not match.");
        return false;
      }

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())) {
        setError("Please enter a valid IFSC code.");
        return false;
      }
    }

    return true;
  }

  async function submitRefund() {
    if (!selected || loading) return;

    // This request needs contact values that match the saved booking.
    if (!resolvedEmail && !resolvedPhone) {
      setError(
        "Your verified customer email or phone is missing. Reload your profile and try again."
      );
      return;
    }

    const eligibility = getEligibility(
      selected.created_at,
      Date.now()
    );

    if (!eligibility.eligible) {
      setError("The 5-hour refund request window has expired.");
      return;
    }

    if (!acceptedPolicy) {
      setError("Please accept the refund policy.");
      return;
    }

    if (reason === "Other" && !description.trim()) {
      setError("Please enter your reason.");
      return;
    }

    if (!validateRefundDetails()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(SUBMIT_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: selected.id,
          reason,
          description: description.trim(),
          customerEmail: resolvedEmail,
          customerPhone: resolvedPhone,
          refundType: "booking_charge",
          refundAmount: BOOKING_CHARGE,
          refundMethod,
          refundDetails:
            refundMethod === "upi"
              ? { upiId: upiId.trim() }
              : {
                  accountHolder: accountHolder.trim(),
                  accountNumber: accountNumber.trim(),
                  ifsc: ifsc.trim().toUpperCase(),
                },
          policyVersion: POLICY_VERSION,
          policyAccepted: acceptedPolicy,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            result.message ||
            "Unable to submit your refund request."
        );
      }

      resetForm();

      setSuccess(
        "Refund request submitted. You can track its verification status below."
      );

      await refreshHistory();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6 text-slate-800">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ReceiptText size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">
              Booking Cancellation & Refund
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Submit your ₹49 booking charge refund request within
              5 hours of booking creation.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <IndianRupee
              size={21}
              className="mb-2 text-emerald-600"
            />
            <p className="text-sm text-slate-500">Refund amount</p>
            <p className="mt-1 text-2xl font-bold">₹49</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <Clock3 size={21} className="mb-2 text-emerald-600" />
            <p className="text-sm text-slate-500">Request window</p>
            <p className="mt-1 text-2xl font-bold">5 hours</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-5 text-blue-800">
          <ShieldCheck size={19} className="mt-0.5 shrink-0" />
          Only the ₹49 booking charge is covered. Worker charges and
          other service payments are excluded.
        </div>
      </div>

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={20} className="shrink-0" />
          {success}
        </div>
      )}

      {error && !selected && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Your bookings</h3>
            <p className="mt-1 text-sm text-slate-500">
              Eligible paid bookings appear here.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshHistory}
            disabled={refreshing}
            aria-label="Refresh refund history"
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>

        {eligibleBookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <Clock3 size={30} className="mx-auto mb-3 text-slate-400" />
            <p className="font-semibold">No eligible bookings</p>
            <p className="mt-1 text-sm text-slate-500">
              Only paid bookings within 5 hours of creation are eligible.
            </p>
          </div>
        )}

        {eligibleBookings.map((booking) => {
          const eligibility = getEligibility(
            booking.created_at,
            now
          );

          return (
            <div
              key={booking.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold">
                    {booking.service_name ||
                      booking.worker_name ||
                      "Workkerz booking"}
                  </h4>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    Booking ID: {booking.booking_id || booking.id}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Created:{" "}
                    {new Date(booking.created_at).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    Refund amount: ₹49
                  </p>

                  <p className="mt-1 text-xs text-amber-700">
                    Time remaining:{" "}
                    {formatRemaining(eligibility.remaining)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openRefundForm(booking)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
                >
                  <X size={17} />
                  Cancel Booking
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Refund history</h3>
          <button
            type="button"
            onClick={refreshHistory}
            disabled={refreshing}
            className="text-sm font-semibold text-blue-700 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            No refund requests found.
          </div>
        ) : (
          requests.map((request) => {
            const status = getStatus(request);

            return (
              <div
                key={request.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      Booking: {request.booking_number || request.booking_id}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {request.cancellation_reason ||
                        request.reason ||
                        "Booking charge refund"}
                    </p>

                    {(request.created_at || request.requested_at) && (
                      <p className="mt-1 text-xs text-slate-400">
                        Requested:{" "}
                        {new Date(
                          request.created_at || request.requested_at!
                        ).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-500">
                    Booking charge refund
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {formatMoney(request.refund_amount ?? BOOKING_CHARGE)}
                  </p>

                  {request.razorpay_refund_id && (
                    <p className="mt-2 break-all text-xs text-slate-500">
                      Refund reference: {request.razorpay_refund_id}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-title"
            className="max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="refund-title" className="text-xl font-bold">
                  Cancel Booking
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Refund request for booking charge
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={resetForm}
                aria-label="Close refund form"
                className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {selected.service_name ||
                  selected.worker_name ||
                  "Workkerz booking"}
              </p>
              <p className="mt-1 break-all text-xs text-slate-500">
                Booking ID: {selected.booking_id || selected.id}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Booking charge refund
                </span>
                <span className="text-xl font-bold text-emerald-700">
                  ₹49
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Created:{" "}
                {new Date(selected.created_at).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="refund-reason"
                className="mb-2 block text-sm font-semibold"
              >
                Cancellation reason
              </label>
              <select
                id="refund-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                {REASONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label
                htmlFor="refund-description"
                className="mb-2 block text-sm font-semibold"
              >
                Additional details{" "}
                <span className="font-normal text-slate-400">
                  (optional, except for Other)
                </span>
              </label>
              <textarea
                id="refund-description"
                rows={3}
                maxLength={500}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain your reason..."
                className="w-full resize-none rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <h4 className="font-semibold">
                    Refund verification details
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Choose a destination for verification. Never share your
                    UPI PIN, OTP or banking password.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRefundMethod("upi")}
                  className={`rounded-xl border p-3 text-sm font-semibold ${
                    refundMethod === "upi"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  UPI ID
                </button>

                <button
                  type="button"
                  onClick={() => setRefundMethod("bank")}
                  className={`rounded-xl border p-3 text-sm font-semibold ${
                    refundMethod === "bank"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Bank account
                </button>
              </div>

              {refundMethod === "upi" ? (
                <div className="mt-4">
                  <label
                    htmlFor="refund-upi"
                    className="mb-2 block text-sm font-medium"
                  >
                    UPI ID
                  </label>
                  <input
                    id="refund-upi"
                    type="text"
                    autoComplete="off"
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="yourname@bank"
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Enter your UPI ID. Do not enter your UPI PIN.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="refund-holder"
                      className="mb-2 block text-sm font-medium"
                    >
                      Account holder name
                    </label>
                    <input
                      id="refund-holder"
                      value={accountHolder}
                      onChange={(event) => setAccountHolder(event.target.value)}
                      autoComplete="name"
                      maxLength={100}
                      placeholder="Name as per bank account"
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="refund-account"
                      className="mb-2 block text-sm font-medium"
                    >
                      Account number
                    </label>
                    <input
                      id="refund-account"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      value={accountNumber}
                      onChange={(event) =>
                        setAccountNumber(event.target.value.replace(/\D/g, ""))
                      }
                      maxLength={18}
                      placeholder="Enter account number"
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="refund-account-confirm"
                      className="mb-2 block text-sm font-medium"
                    >
                      Confirm account number
                    </label>
                    <input
                      id="refund-account-confirm"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      value={confirmAccountNumber}
                      onChange={(event) =>
                        setConfirmAccountNumber(
                          event.target.value.replace(/\D/g, "")
                        )
                      }
                      maxLength={18}
                      placeholder="Re-enter account number"
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="refund-ifsc"
                      className="mb-2 block text-sm font-medium"
                    >
                      IFSC code
                    </label>
                    <input
                      id="refund-ifsc"
                      value={ifsc}
                      onChange={(event) =>
                        setIfsc(event.target.value.toUpperCase())
                      }
                      autoComplete="off"
                      maxLength={11}
                      placeholder="e.g. SBIN0001234"
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm uppercase outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                Details are for verification. Submission does not guarantee
                approval or payment.
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-5">
              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(event) => setAcceptedPolicy(event.target.checked)}
                className="mt-1 h-4 w-4 accent-red-600"
              />
              <span>
                I understand that this request covers only the ₹49 booking
                charge and must be submitted within 5 hours of booking creation.
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                disabled={loading || !acceptedPolicy}
                onClick={submitRefund}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>

            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              Your request will be reviewed by Workkerz. Refund processing is
              subject to verification.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
