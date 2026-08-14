export type NotificationType =
  | "general"
  | "booking"
  | "work"
  | "payment"
  | "message"
  | "review"
  | "offer"
  | "system";

export type Notification = {
  id: string;
  user_id: string;

  title: string;
  body: string;

  type: NotificationType;

  icon?: string | null;
  image_url?: string | null;

  action_url?: string | null;
  booking_id?: string | null;

  is_read: boolean;

  created_at: string;
};