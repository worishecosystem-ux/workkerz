export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  image_url: string | null;
  customer_email: string | null;
  is_global: boolean;
  is_read: boolean;
  created_at: string;
  user_id: string | null;
  body: string | null;
  icon: string | null;
  action_url: string | null;
  booking_id: string | null;
};

export type UserOption = {
  id: string;
  email: string | null;
  name: string | null;
};

export const notificationTypes = [
  { value: "booking", label: "Booking", icon: "📋" },
  { value: "work", label: "Work", icon: "👷" },
  { value: "payment", label: "Payment", icon: "💳" },
  { value: "offer", label: "Offer", icon: "🎁" },
  { value: "message", label: "Message", icon: "💬" },
  { value: "review", label: "Review", icon: "⭐" },
  { value: "system", label: "System", icon: "📢" },
];

export const typeStyles: Record<string, string> = {
  booking: "bg-blue-50 text-blue-700",
  work: "bg-orange-50 text-orange-700",
  payment: "bg-purple-50 text-purple-700",
  offer: "bg-pink-50 text-pink-700",
  message: "bg-cyan-50 text-cyan-700",
  review: "bg-yellow-50 text-yellow-700",
  system: "bg-green-50 text-green-700",
};

export function getTypeLabel(type: string) {
  return (
    notificationTypes.find(
      (item) => item.value === type
    )?.label || "Notification"
  );
}

export function getTypeIcon(type: string) {
  return (
    notificationTypes.find(
      (item) => item.value === type
    )?.icon || "🔔"
  );
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}