"use client";

import {
  Check,
  Clock3,
  Eye,
  Globe2,
  Trash2,
  UserRound,
} from "lucide-react";

import type {
  Notification,
} from "./NotificationCard";

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
  system: "bg-green-50 text-green-700",
};

const typeLabels: Record<string, string> = {
  booking: "Booking",
  work: "Work",
  payment: "Payment",
  offer: "Offer",
  message: "Message",
  review: "Review",
  system: "System",
};

const typeIcons: Record<string, string> = {
  booking: "📋",
  work: "👷",
  payment: "💳",
  offer: "🎁",
  message: "💬",
  review: "⭐",
  system: "📢",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationMobileCard({
  notification,
  onView,
  onDelete,
}: Props) {
  const type =
    typeLabels[notification.type] ||
    "Notification";

  const icon =
    notification.icon ||
    typeIcons[notification.type] ||
    "🔔";

  return (
    <div
      className={`border-b border-gray-100 bg-white p-4 transition active:bg-gray-50 ${
        !notification.is_read
          ? "border-l-[3px] border-l-green-600 bg-green-50/30"
          : ""
      }`}
    >
      <div className="flex gap-3">
        {/* IMAGE / ICON */}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 text-xl">
          {notification.image_url ? (
            <img
              src={notification.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            icon
          )}
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-gray-900">
                {notification.title}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    typeStyles[
                      notification.type
                    ] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {type}
                </span>

                {notification.is_global ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-purple-700">
                    <Globe2 size={9} />
                    All Users
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                    <UserRound size={9} />
                    User
                  </span>
                )}
              </div>
            </div>

            {!notification.is_read && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-600" />
            )}
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
            {notification.message}
          </p>

          {/* FOOTER */}

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex items-center gap-1 whitespace-nowrap text-[10px] text-gray-400">
                <Clock3 size={10} />

                {formatDate(
                  notification.created_at
                )}
              </span>

              {notification.is_read && (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Check size={10} />
                  Read
                </span>
              )}
            </div>

            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={onView}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 active:scale-95"
                aria-label="View"
              >
                <Eye size={15} />
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 active:scale-95"
                aria-label="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}