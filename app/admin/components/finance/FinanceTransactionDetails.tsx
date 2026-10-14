
"use client";

import {
  CalendarDays,
  Check,
  Copy,
  CreditCard,
  IndianRupee,
  LoaderCircle,
  RefreshCw,
  ReceiptText,
  UserRound,
  Wallet,
  X,
  Landmark,
  Smartphone,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type {
  FinanceTransactionDetailsProps,
} from "./finance.types";

import {
  formatCurrency,
  formatDate,
  getStatusClass,
  getStatusLabel,
  normalizePaymentMethod,
} from "./finance.utils";

import { supabase } from "@/lib/supabase";

type RazorpayPaymentDetails = {
  id?: string | null;
  method?: string | null;
  status?: string | null;
  currency?: string | null;
  amount?: number | null;
  captured?: boolean | null;
  bank?: string | null;
  wallet?: string | null;
  vpa?: string | null;
  card?: {
    last4?: string | null;
    network?: string | null;
    type?: string | null;
    issuer?: string | null;
    name?: string | null;
    international?: boolean | null;
  } | null;
};

type PaymentDetailsResponse = {
  success: boolean;
  error?: string;
  payment_method?: string | null;
  source?: string;
  payment?: RazorpayPaymentDetails | null;
};

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function formatPaymentAmount(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (typeof amount !== "number") {
    return "Not available";
  }

  // Razorpay payment amounts are returned in the currency's
  // smallest unit, e.g. paise for INR.
  return formatCurrency(amount / 100, currency || "INR");
}

export default function FinanceTransactionDetails({
  transaction,
  open,
  onClose,
}: FinanceTransactionDetailsProps) {
  const [copiedField, setCopiedField] = useState("");
  const [paymentDetails, setPaymentDetails] =
    useState<RazorpayPaymentDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const transactionId = transaction?.id ?? "";
  const razorpayPaymentId = transaction?.razorpay_payment_id ?? "";

  const fetchPaymentDetails = useCallback(async () => {
    if (!transactionId || !razorpayPaymentId) {
      setPaymentDetails(null);
      setPaymentMethod(transaction?.payment_method ?? "");
      setPaymentError(
        razorpayPaymentId
          ? ""
          : "Razorpay Payment ID is not available for this transaction.",
      );
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");
    setPaymentDetails(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Session expired. Please sign in again.");
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
            transactionId,
            razorpayPaymentId,
          }),
        },
      );

      const result =
        (await response.json()) as PaymentDetailsResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to fetch Razorpay payment details.",
        );
      }

      setPaymentMethod(
        result.payment_method || transaction?.payment_method || "",
      );
      setPaymentDetails(result.payment ?? null);

      if (!result.payment) {
        setPaymentError(
          "Payment method is available, but detailed card or UPI information was not returned.",
        );
      }
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to fetch payment details.",
      );
      setPaymentMethod(transaction?.payment_method ?? "");
      setPaymentDetails(null);
    } finally {
      setPaymentLoading(false);
    }
  }, [
    transactionId,
    razorpayPaymentId,
    transaction?.payment_method,
  ]);

  useEffect(() => {
    if (!open || !transaction) {
      return;
    }

    void fetchPaymentDetails();
  }, [open, transactionId, razorpayPaymentId, retryCount, fetchPaymentDetails, transaction]);

  const copyValue = async (label: string, value: string | null) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      window.setTimeout(() => setCopiedField(""), 1800);
    } catch {
      setCopiedField("");
    }
  };

  const DetailRow = ({
    label,
    value,
    copyable = false,
  }: {
    label: string;
    value: string | number | boolean | null | undefined;
    copyable?: boolean;
  }) => {
    const resolvedValue =
      value === null || value === undefined || value === ""
        ? "—"
        : typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : String(value);

    return (
      <div className="flex min-w-0 items-start justify-between gap-3 border-b border-gray-100 py-3 last:border-b-0">
        <span className="shrink-0 text-xs text-gray-500">
          {label}
        </span>

        <div className="flex min-w-0 items-start gap-2 text-right">
          <span className="break-all text-xs font-medium text-gray-800">
            {resolvedValue}
          </span>

          {copyable && resolvedValue !== "—" && (
            <button
              type="button"
              onClick={() => void copyValue(label, resolvedValue)}
              title={`Copy ${label}`}
              aria-label={`Copy ${label}`}
              className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              {copiedField === label ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!open || !transaction) return null;

  const isRefund =
    transaction.transaction_type === "refund" ||
    transaction.transaction_type === "partial_refund";

  const method = (
    paymentDetails?.method ||
    paymentMethod ||
    transaction.payment_method ||
    ""
  ).toLowerCase();

  const isCard = method === "card";
  const isUpi = method === "upi";
  const isNetbanking = method === "netbanking";
  const isWallet = method === "wallet";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-transaction-title"
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ReceiptText size={22} />
            </div>

            <div>
              <h2
                id="finance-transaction-title"
                className="text-lg font-bold text-gray-900"
              >
                Transaction Details
              </h2>

              <p className="mt-1 break-all text-xs text-gray-500">
                {transaction.transaction_number || transaction.id}
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(transaction.status)}`}
              >
                {getStatusLabel(transaction.status)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close transaction details"
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          {/* Transaction amount */}
          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
              {isRefund ? "Refund Amount" : "Transaction Amount"}
            </p>

            <p
              className={`mt-2 break-words text-3xl font-bold ${
                isRefund ? "text-red-600" : "text-gray-900"
              }`}
            >
              {formatCurrency(
                isRefund
                  ? transaction.refund_amount || transaction.amount
                  : transaction.amount,
                transaction.currency || "INR",
              )}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Platform Fee</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatCurrency(transaction.platform_fee)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Gateway Fee</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatCurrency(transaction.gateway_fee)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">GST Amount</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatCurrency(transaction.gst_amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* Customer */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center gap-2">
                <UserRound size={17} className="text-emerald-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Customer Details
                </h3>
              </div>

              <DetailRow label="Name" value={transaction.customer_name} />
              <DetailRow label="Email" value={transaction.customer_email} />
              <DetailRow label="Phone" value={transaction.customer_phone} />
            </div>

            {/* Worker */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Wallet size={17} className="text-blue-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Worker Details
                </h3>
              </div>

              <DetailRow label="Name" value={transaction.worker_name} />
              <DetailRow label="Email" value={transaction.worker_email} />
              <DetailRow label="Phone" value={transaction.worker_phone} />
            </div>

            {/* Booking */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center gap-2">
                <IndianRupee size={17} className="text-emerald-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Booking & Payment
                </h3>
              </div>

              <DetailRow
                label="Booking ID"
                value={transaction.booking_id}
                copyable
              />
              <DetailRow
                label="Booking Number"
                value={transaction.booking_number}
                copyable
              />
              <DetailRow
                label="Booking Status"
                value={transaction.booking_status}
              />
              <DetailRow
                label="Booking Payment Status"
                value={transaction.booking_payment_status}
              />
              <DetailRow
                label="Payment Method"
                value={normalizePaymentMethod(
                  paymentMethod || transaction.payment_method,
                )}
              />
              <DetailRow
                label="Source Type"
                value={transaction.source_type}
              />
            </div>

            {/* Razorpay IDs */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CreditCard size={17} className="text-violet-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Razorpay Details
                </h3>
              </div>

              <DetailRow
                label="Order ID"
                value={transaction.razorpay_order_id}
                copyable
              />
              <DetailRow
                label="Payment ID"
                value={transaction.razorpay_payment_id}
                copyable
              />
              <DetailRow
                label="Refund ID"
                value={transaction.razorpay_refund_id}
                copyable
              />
            </div>

            {/* Live payment details */}
            <div className="rounded-xl border border-emerald-200 bg-white p-4 md:col-span-2">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isUpi ? (
                    <Smartphone size={18} className="text-emerald-700" />
                  ) : isNetbanking ? (
                    <Landmark size={18} className="text-emerald-700" />
                  ) : (
                    <CreditCard size={18} className="text-emerald-700" />
                  )}

                  <h3 className="text-sm font-bold text-gray-900">
                    Card & UPI Payment Details
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                  disabled={paymentLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Refresh Details
                </button>
              </div>

              {paymentLoading && (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-emerald-700"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Fetching payment details
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Connecting securely to the finance API.
                    </p>
                  </div>
                </div>
              )}

              {!paymentLoading && paymentError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <CircleAlert
                      size={17}
                      className="mt-0.5 shrink-0 text-amber-700"
                    />
                    <div>
                      <p className="text-xs font-semibold text-amber-900">
                        Payment details unavailable
                      </p>
                      <p className="mt-1 break-words text-xs leading-5 text-amber-800">
                        {paymentError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!paymentLoading && (
                <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
                  <DetailRow
                    label="Payment Method"
                    value={normalizePaymentMethod(
                      paymentDetails?.method ||
                        paymentMethod ||
                        transaction.payment_method,
                    )}
                  />
                  <DetailRow
                    label="Razorpay Status"
                    value={paymentDetails?.status}
                  />
                  <DetailRow
                    label="Razorpay Amount"
                    value={
                      paymentDetails?.amount != null
                        ? formatPaymentAmount(
                            paymentDetails.amount,
                            paymentDetails.currency,
                          )
                        : null
                    }
                  />
                  <DetailRow
                    label="Captured"
                    value={paymentDetails?.captured}
                  />

                  {/* UPI */}
                  {isUpi && (
                    <>
                      <DetailRow
                        label="UPI VPA"
                        value={paymentDetails?.vpa}
                        copyable
                      />
                      <DetailRow
                        label="Bank"
                        value={paymentDetails?.bank}
                      />
                    </>
                  )}

                  {/* Card */}
                  {isCard && (
                    <>
                      <DetailRow
                        label="Card Network"
                        value={paymentDetails?.card?.network}
                      />
                      <DetailRow
                        label="Card Type"
                        value={paymentDetails?.card?.type}
                      />
                      <DetailRow
                        label="Card Last 4 Digits"
                        value={
                          paymentDetails?.card?.last4
                            ? `•••• ${paymentDetails.card.last4}`
                            : null
                        }
                      />
                      <DetailRow
                        label="Card Issuer"
                        value={paymentDetails?.card?.issuer}
                      />
                      <DetailRow
                        label="Cardholder Name"
                        value={paymentDetails?.card?.name}
                      />
                      <DetailRow
                        label="International Card"
                        value={paymentDetails?.card?.international}
                      />
                    </>
                  )}

                  {/* Netbanking */}
                  {isNetbanking && (
                    <DetailRow
                      label="Bank"
                      value={paymentDetails?.bank}
                    />
                  )}

                  {/* Wallet */}
                  {isWallet && (
                    <DetailRow
                      label="Wallet Provider"
                      value={paymentDetails?.wallet}
                    />
                  )}

                  <DetailRow
                    label="Verified Payment ID"
                    value={paymentDetails?.id}
                    copyable
                  />
                </div>
              )}

              <div className="mt-3 flex items-start gap-2 border-t border-gray-100 pt-3">
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />
                <p className="text-[11px] leading-5 text-gray-500">
                  Details are shown only when returned by Razorpay.
                  Full card numbers and CVV are not displayed.
                </p>
              </div>
            </div>

            {/* Timeline and refund */}
            <div className="rounded-xl border border-gray-200 p-4 md:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays size={17} className="text-amber-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Transaction Timeline & Refund
                </h3>
              </div>

              <div className="grid gap-x-8 sm:grid-cols-2">
                <DetailRow
                  label="Created At"
                  value={formatDate(transaction.created_at)}
                />
                <DetailRow
                  label="Payment Received At"
                  value={formatDate(transaction.paid_at)}
                />
                <DetailRow
                  label="Refunded At"
                  value={formatDate(transaction.refunded_at)}
                />
                <DetailRow
                  label="Refund Amount"
                  value={formatCurrency(transaction.refund_amount)}
                />
                <DetailRow
                  label="Refund Status"
                  value={getStatusLabel(transaction.refund_status)}
                />
                <DetailRow
                  label="Refund Reason"
                  value={transaction.refund_reason}
                />
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-400">
            Transaction details are based on database information and
            the payment details returned by Razorpay. Missing values
            are displayed as unavailable.
          </p>
        </div>

        <footer className="flex justify-end border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
