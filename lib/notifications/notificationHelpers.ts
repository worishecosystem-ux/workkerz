import type { NotificationType } from "./notificationTypes";

export function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "booking":
      return "📋";

    case "work":
      return "👷";

    case "payment":
      return "💳";

    case "message":
      return "💬";

    case "review":
      return "⭐";

    case "offer":
      return "🎁";

    case "system":
      return "📢";

    default:
      return "🔔";
  }
}

export function getNotificationTime(date: string) {
  const created = new Date(date);
  const now = new Date();

  const diff = now.getTime() - created.getTime();

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  return `${days} days ago`;
}