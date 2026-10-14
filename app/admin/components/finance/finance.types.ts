
export type FinanceStatus =
  | "all"
  | "pending"
  | "created"
  | "processing"
  | "paid"
  | "failed"
  | "refund_requested"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

export type PaymentMethod =
  | "all"
  | "upi"
  | "card"
  | "netbanking"
  | "wallet"
  | "emi"
  | "other";

export type FinanceTransactionType =
  | "payment"
  | "refund"
  | "partial_refund"
  | "payout"
  | "adjustment"
  | "fee";

export interface FinanceFiltersType {
  search: string;
  status: FinanceStatus;
  paymentMethod: PaymentMethod;
  fromDate: string;
  toDate: string;
}

export interface FinanceSummary {
  totalCollection: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRefunds: number;
  platformEarnings: number;
  gatewayFees: number;
  netEarnings: number;
  totalTransactions: number;
  paidTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  refundedTransactions: number;
}

export interface FinanceChartItem {
  date: string;
  collection: number;
  earnings: number;
  refunds: number;
}

export interface FinanceTransaction {
  id: string;
  transaction_number: string | null;
  source_type: string | null;
  source_id: string | null;
  transaction_type: FinanceTransactionType | string;
  status: FinanceStatus;
  amount: number;
  currency: string;
  platform_fee: number;
  gateway_fee: number;
  gst_amount: number;
  net_amount: number;
  payment_method: string | null;

  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;

  worker_name: string | null;
  worker_email: string | null;
  worker_phone: string | null;

  booking_id: string | null;
  booking_number: string | null;
  booking_status: string | null;
  booking_payment_status: string | null;

  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_refund_id: string | null;

  refund_amount: number;
  refund_reason: string | null;
  refund_status: string | null;

  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface FinanceRefund {
  id: string;
  refund_number: string | null;
  financial_transaction_id: string | null;
  source_type: string | null;
  source_id: string | null;

  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;

  original_amount: number;
  refund_amount: number;
  reason: string | null;

  status:
    | "requested"
    | "processing"
    | "processed"
    | "failed"
    | "cancelled"
    | string;

  razorpay_payment_id: string | null;
  razorpay_refund_id: string | null;
  razorpay_status: string | null;

  cancellation_request_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  failure_reason: string | null;
  notes: string | null;

  requested_at: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface FinanceApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FinanceTransactionsResponse {
  transactions: FinanceTransaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FinanceDashboardResponse {
  summary: FinanceSummary;
  chart: FinanceChartItem[];
  paymentBreakdown: {
    method: string;
    count: number;
    amount: number;
  }[];
}

export interface FinanceTransactionDetailsProps {
  transaction: FinanceTransaction | null;
  open: boolean;
  onClose: () => void;
}

export interface FinanceTableProps {
  transactions: FinanceTransaction[];
  loading: boolean;
  onSelect?: (transaction: FinanceTransaction) => void;
}
