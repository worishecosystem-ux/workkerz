
"use client";

import { useState } from "react";
import {
  CalendarClock,
  Check,
  Copy,
  CreditCard,
  FileText,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";

import type { FinanceRefund } from "./finance.types";
import {
  formatCurrency,
  formatDate,
  getStatusClass,
  getStatusLabel,
} from "./finance.utils";

interface FinanceRefundDetailsProps {
  refund: FinanceRefund | null;
  open: boolean;
  onClose: () => void;
}

export default function FinanceRefundDetails({
  refund,
  open,
  onClose,
}: FinanceRefundDetailsProps) {
  const [copied, setCopied] = useState("");

  if (!open || !refund) return null;

  async function copyValue(label: string, value: string | null) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  }

  function DetailRow({
    label,
    value,
    copyable = false,
  }: {
    label: string;
    value: string | null | undefined;
    copyable?: boolean;
  }) {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
        <span className="shrink-0 text-xs text-gray-500">{label}</span>

        <div className="flex min-w-0 items-start gap-2 text-right">
          <span className="break-all text-xs font-medium text-gray-800">
            {value || "—"}
          </span>

          {copyable && value && (
            <button
              type="button"
              onClick={() => void copyValue(label, value)}
              aria-label={`Copy ${label}`}
              className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100"
            >
              {copied === label ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-details-title"
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <RotateCcw size={21} />
            </div>

            <div>
              <h2
                id="refund-details-title"
                className="text-lg font-bold text-gray-900"
              >
                Refund Details
              </h2>

              <p className="mt-1 break-all text-xs text-gray-500">
                {refund.refund_number || refund.id}
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(refund.status)}`}
              >
                {getStatusLabel(refund.status)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close refund details"
            className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <div className="rounded-2xl bg-violet-50 p-5">
            <p className="text-sm text-violet-700">Refund Amount</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(refund.refund_amount)}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-violet-100 pt-4">
              <div>
                <p className="text-xs text-gray-500">Original Amount</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(refund.original_amount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Refund Status</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {getStatusLabel(refund.status)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center gap-2">
                <UserRound size={17} className="text-emerald-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Customer
                </h3>
              </div>

              <DetailRow label="Name" value={refund.customer_name} />
              <DetailRow label="Email" value={refund.customer_email} />
              <DetailRow label="Source Type" value={refund.source_type} />
              <DetailRow
                label="Source ID"
                value={refund.source_id}
                copyable
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CreditCard size={17} className="text-blue-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Payment Gateway
                </h3>
              </div>

              <DetailRow
                label="Payment ID"
                value={refund.razorpay_payment_id}
                copyable
              />
              <DetailRow
                label="Refund ID"
                value={refund.razorpay_refund_id}
                copyable
              />
              <DetailRow
                label="Gateway Status"
                value={refund.razorpay_status}
              />
              <DetailRow
                label="Transaction ID"
                value={refund.financial_transaction_id}
                copyable
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <CalendarClock size={17} className="text-amber-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Processing Timeline
                </h3>
              </div>

              <DetailRow
                label="Requested At"
                value={formatDate(refund.requested_at || refund.created_at)}
              />
              <DetailRow
                label="Approved At"
                value={formatDate(refund.approved_at)}
              />
              <DetailRow
                label="Processed At"
                value={formatDate(refund.processed_at)}
              />
              <DetailRow
                label="Last Updated"
                value={formatDate(refund.updated_at)}
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <FileText size={17} className="text-gray-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Reason & Notes
                </h3>
              </div>

              <DetailRow label="Reason" value={refund.reason} />
              <DetailRow label="Notes" value={refund.notes} />
              <DetailRow
                label="Failure Reason"
                value={refund.failure_reason}
              />
              <DetailRow
                label="Cancellation Request ID"
                value={refund.cancellation_request_id}
                copyable
              />
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-500">
            This view displays recorded refund information. It does not
            approve a request or initiate a payment gateway refund.
          </p>
        </div>

        <footer className="flex justify-end border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
