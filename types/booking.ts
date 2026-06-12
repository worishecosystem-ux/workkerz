export interface Booking {
  id?: string;

  booking_id: string;

  booking_status?:
    | "pending"
    | "confirmed"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled";

  service_type: string;

  booking_date?: string;

  booking_time?: string;

  customer_name: string;

  customer_email: string;

  customer_phone?: string;

  customer_address?: string;

  worker_id?: string;

  worker_name: string;

  worker_photo?: string;

  worker_specialty?: string;

  worker_phone?: string;

  worker_rating?: number;

  worker_experience?: number;

  worker_city?: string;

  worker_state?: string;

  service_fee?: number;

  platform_fee?: number;

  gst?: number;

  discount?: number;

  grand_total: number;

  payment_status?:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

  payment_method?:
    | "cash"
    | "upi"
    | "card"
    | "netbanking";

  created_at?: string;

  updated_at?: string;
}