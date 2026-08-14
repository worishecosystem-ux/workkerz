"use client";

import {
  Check,
  Eye,
  Globe2,
  Trash2,
  UserRound,
} from "lucide-react";

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

type Props = {
  notification: Notification;
  onView: () => void;
  onDelete: () => void;
};

const typeStyles: Record<string, string> = {
  booking: "bg-blue-50 text-blue-700",
  work: "bg-orange-50 text-orange-700",
  payment: "bg-purple-50 text-purple-700",
  offer: "bg-pink-50 text-pink-700",
  message: "bg-cyan-50 text-cyan-700",
  review: "bg-yellow-50 text-yellow-700",

  // Version update
  update: "bg-emerald-50 text-emerald-700",

  system: "bg-green-50 text-green-700",
};

const typeLabels: Record<string, string> = {
  booking: "Booking",
  work: "Work",
  payment: "Payment",
  offer: "Offer",
  message: "Message",
  review: "Review",

  // Version update
  update: "Version Update",

  system: "System",
};

function getTypeLabel(type: string) {
  return typeLabels[type] || "Notification";
}

function getIcon(type: string) {
  const icons: Record<string, string> = {
    booking: "📋",
    work: "👷",
    payment: "💳",
    offer: "🎁",
    message: "💬",
    review: "⭐",

    // Version update
    update: "🚀",

    system: "📢",
  };

  return icons[type] || "🔔";
}

function formatDate(value: string) {
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

function NotificationIcon({
  notification,
}: {
  notification: Notification;
}) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 text-lg">
      {notification.image_url ? (
        <img
          src={notification.image_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        notification.icon ||
        getIcon(notification.type)
      )}
    </div>
  );
}

export default function NotificationCard({
  notification,
  onView,
  onDelete,
}: Props) {
  const isUpdate =
    notification.type === "update" ||
    notification.title
      ?.toLowerCase()
      .includes("app") &&
    notification.action_url;

  return (
    <tr className="border-b border-gray-100 transition hover:bg-gray-50/70">
      {/* Notification */}

      <td className="px-5 py-4">
        <div className="flex min-w-[280px] items-center gap-3">
          <NotificationIcon
            notification={notification}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold text-gray-900">
                {notification.title}
              </p>

              {isUpdate && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-emerald-700">
                  Update
                </span>
              )}
            </div>

            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
              {notification.message}
            </p>

            {notification.action_url && (
              <p className="mt-1 max-w-[420px] truncate text-[9px] font-medium text-gray-400">
                Opens: {notification.action_url}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Type */}

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
            typeStyles[notification.type] ||
            "bg-gray-100 text-gray-600"
          }`}
        >
          {getTypeLabel(
            notification.type
          )}
        </span>
      </td>

      {/* Target */}

      <td className="px-4 py-4">
        {notification.is_global ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
            <Globe2 size={11} />
            All Users
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
            <UserRound size={11} />
            User
          </span>
        )}
      </td>

      {/* Status */}

      <td className="px-4 py-4">
        {notification.is_read ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400">
            <Check size={13} />
            Read
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            Unread
          </span>
        )}
      </td>

      {/* Date */}

      <td className="whitespace-nowrap px-4 py-4 text-xs text-gray-500">
        {formatDate(
          notification.created_at
        )}
      </td>

      {/* Actions */}

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={onView}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
            aria-label="View notification"
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
            aria-label="Delete notification"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}