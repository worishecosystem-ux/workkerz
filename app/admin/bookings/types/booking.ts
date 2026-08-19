export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "rejected";

export type BookingNotificationType =
  | "new"
  | "confirmed"
  | "completed"
  | "rejected"
  | "update";

export interface WorkerBooking {
  id: string;

  booking_id: string;

  booking_status: BookingStatus;

  worker_id: string | null;
  worker_name: string | null;
  worker_photo: string | null;
  worker_specialty: string | null;
  worker_rating: number | null;

  service_type: string | null;
  description: string | null;

  booking_date: string | null;
  booking_time: string | null;

  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;

  notes: string | null;

  total_cost: number;
  service_fee: number;
  materials_cost: number;
  package_price: number;
  grand_total: number;

  booking_type: string | null;

  work_status: string | null;

  worker_available: boolean;

  address_id: string | null;

  created_at: string;
}

export interface BookingNotification {
  id: string;

  type: BookingNotificationType;

  title: string;

  message: string;

  bookingId: string;

  createdAt: string;

  read: boolean;
}