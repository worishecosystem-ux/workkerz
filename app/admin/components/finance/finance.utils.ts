
import type {
  FinanceStatus,
  FinanceTransaction,
} from "./finance.types";

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "INR",
): string {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(
  value: string | null | undefined,
  includeTime = true,
): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      : {}),
  }).format(date);
}

export function formatNumber(
  value: number | string | null | undefined,
): string {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(number) ? number : 0);
}

export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return "Unknown";

  const labels: Record<string, string> = {
    all: "All statuses",
    pending: "Pending",
    created: "Created",
    processing: "Processing",
    paid: "Payment received",
    failed: "Failed",
    refund_requested: "Refund requested",
    refunded: "Refunded",
    partially_refunded: "Partially refunded",
    cancelled: "Cancelled",
    requested: "Requested",
    processed: "Processed",
  };

  return (
    labels[status.toLowerCase()] ??
    status.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    )
  );
}

export function getStatusClass(status: string | null | undefined): string {
  const value = (status ?? "").toLowerCase();

  if (["paid", "processed"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }

  if (["failed", "cancelled"].includes(value)) {
    return "bg-red-50 text-red-700 ring-red-600/20";
  }

  if (["refunded", "partially_refunded"].includes(value)) {
    return "bg-violet-50 text-violet-700 ring-violet-600/20";
  }

  if (["processing", "refund_requested"].includes(value)) {
    return "bg-blue-50 text-blue-700 ring-blue-600/20";
  }

  return "bg-amber-50 text-amber-700 ring-amber-600/20";
}

export function normalizePaymentMethod(
  method: string | null | undefined,
): string {
  if (!method) return "Unknown";

  const value = method.toLowerCase();

  const labels: Record<string, string> = {
    upi: "UPI",
    card: "Card",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emi: "EMI",
    other: "Other",
  };

  return labels[value] ?? method.replace(/[_-]+/g, " ");
}

export function matchesFinanceSearch(
  transaction: FinanceTransaction,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  const searchableFields = [
    transaction.transaction_number,
    transaction.source_id,
    transaction.booking_id,
    transaction.booking_number,
    transaction.customer_name,
    transaction.customer_email,
    transaction.customer_phone,
    transaction.worker_name,
    transaction.worker_email,
    transaction.worker_phone,
    transaction.razorpay_order_id,
    transaction.razorpay_payment_id,
    transaction.razorpay_refund_id,
  ];

  return searchableFields.some((field) =>
    String(field ?? "").toLowerCase().includes(query),
  );
}

export function matchesFinanceStatus(
  transactionStatus: string,
  selectedStatus: FinanceStatus,
): boolean {
  if (selectedStatus === "all") return true;

  return transactionStatus.toLowerCase() === selectedStatus;
}

function escapeCsv(value: unknown): string {
  let text = String(value ?? "");

  // Prevent spreadsheet formula injection.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function exportTransactionsCsv(
  transactions: FinanceTransaction[],
  filename = "workkerz-finance-transactions.csv",
): void {
  const headers = [
    "Transaction Number",
    "Transaction Type",
    "Source Type",
    "Booking ID",
    "Booking Number",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Worker Name",
    "Worker Email",
    "Worker Phone",
    "Amount",
    "Platform Fee",
    "Gateway Fee",
    "GST",
    "Net Amount",
    "Currency",
    "Payment Method",
    "Status",
    "Razorpay Order ID",
    "Razorpay Payment ID",
    "Razorpay Refund ID",
    "Refund Amount",
    "Refund Status",
    "Created At",
    "Paid At",
    "Refunded At",
  ];

  const rows = transactions.map((transaction) => [
    transaction.transaction_number,
    transaction.transaction_type,
    transaction.source_type,
    transaction.booking_id,
    transaction.booking_number,
    transaction.customer_name,
    transaction.customer_email,
    transaction.customer_phone,
    transaction.worker_name,
    transaction.worker_email,
    transaction.worker_phone,
    transaction.amount,
    transaction.platform_fee,
    transaction.gateway_fee,
    transaction.gst_amount,
    transaction.net_amount,
    transaction.currency,
    normalizePaymentMethod(transaction.payment_method),
    transaction.status,
    transaction.razorpay_order_id,
    transaction.razorpay_payment_id,
    transaction.razorpay_refund_id,
    transaction.refund_amount,
    transaction.refund_status,
    transaction.created_at,
    transaction.paid_at,
    transaction.refunded_at,
  ]);

  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
