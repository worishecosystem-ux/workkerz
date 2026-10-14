export type PageTab = "bookings" | "cancelled" | "requests" | "orders";

export interface Booking {
  id: string;
  booking_id: string;
  booking_status: string;
  worker_id?: string | null;
  worker_name?: string | null;
  worker_photo?: string | null;
  worker_specialty?: string | null;
  worker_rating?: number | null;
  service_type?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  city?: string | null;
  state?: string | null;
  grand_total?: number | null;
  created_at?: string | null;
}

export interface CancellationRequest {
  id: string;
  booking_id: string;
  booking_number?: string | null;
  status?: string | null;
  refund_status?: string | null;
  requested_at?: string | null;
  cancellation_reason?: string | null;
  reason?: string | null;
  refund_amount?: number | null;
  refund_expected_by?: string | null;
  admin_review_note?: string | null;
}

export interface WorkerRequest {
  id: string;
  workers_required?: number | null;
  location?: string | null;
  category?: string | null;
  work_date?: string | null;
  start_time?: string | null;
  duration?: string | null;
  budget?: number | null;
  requirement?: string | null;
  status?: string | null;
  created_at?: string | null;
  requester_name?: string | null;
  project_name?: string | null;
  project_type?: string | null;
  total_workers?: number | null;
}
