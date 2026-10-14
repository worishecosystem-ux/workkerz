export type Booking = {
  id: string;
  booking_id?: string | null;
  booking_number?: string | null;
  booking_status?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  worker_id?: string | null;
  worker_name?: string | null;
  worker_phone?: string | null;
  worker?: Record<string, any> | null;
  service_name?: string | null;
  service?: string | null;
  category?: string | null;
  description?: string | null;
  address?: string | null;
  full_address?: string | null;
  house_no?: string | null;
  landmark?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  customer_address?: string | null;
  address_id?: string | null;
  total_amount?: number | string | null;
  grand_total?: number | string | null;
  payable_amount?: number | string | null;
  booking_fee?: number | string | null;
  visit_charge?: number | string | null;
  payment_status?: string | null;
  payment_type?: string | null;
  created_at?: string | null;
  [key: string]: any;
};

export type RefundRequest = {
  id: string;
  status: string;
  refund_status?: string | null;
  refund_amount?: number | string | null;
  refund_expected_from?: string | null;
  refund_expected_by?: string | null;
  cancellation_reason?: string | null;
  reason?: string | null;
  requested_at?: string | null;
  refund_type?: string | null;
};

export function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatLabel(value?: string | null) {
  if (!value) return "Pending";
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getAddress(booking: Booking) {
  const parts = [booking.house_no, booking.address, booking.full_address, booking.customer_address, booking.landmark, booking.city, booking.district, booking.state, booking.pincode]
    .filter((part): part is string => Boolean(part && String(part).trim()));
  return [...new Set(parts.map((part) => String(part).trim()))].join(", ");
}

export function getBookingCharge() {
  // This UI is intentionally limited to the ₹49 booking charge refund policy.
  return 49;
}

export function getRefundDeadline(booking: Booking) {
  if (!booking.created_at) return null;
  const createdAt = new Date(booking.created_at);
  if (Number.isNaN(createdAt.getTime())) return null;
  return new Date(createdAt.getTime() + 5 * 60 * 60 * 1000);
}

export function isWithinRefundWindow(booking: Booking, now = Date.now()) {
  const deadline = getRefundDeadline(booking);
  return Boolean(deadline && now <= deadline.getTime());
}
