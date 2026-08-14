"use client";

import {
  Bell,
  Check,
  Globe2,
  UserRound,
  X,
  Trash2,
} from "lucide-react";

import type {
  Notification,
} from "./NotificationCard";

type Props = {
  notification: Notification | null;
  onClose: () => void;
  onDelete: () => void;
};

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

export default function NotificationDetailDrawer({
  notification,
  onClose,
  onDelete,
}: Props) {
  if (!notification) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex-1 bg-black/40"
      />

      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-950">
              Notification Details
            </h2>

            <p className="text-[10px] text-gray-400">
              Notification information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 text-2xl">
              {notification.image_url ? (
                <img
                  src={notification.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                notification.icon || "🔔"
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-950">
                {notification.title}
              </h3>

              <p className="mt-1 text-xs font-semibold text-green-600">
                {notification.type}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
              Message
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {notification.message}
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-gray-50 p-4">
            <Detail
              label="Target"
              value={
                notification.is_global
                  ? "All Users"
                  : "Specific User"
              }
              icon={
                notification.is_global ? (
                  <Globe2 size={14} />
                ) : (
                  <UserRound size={14} />
                )
              }
            />

            <Detail
              label="Status"
              value={
                notification.is_read
                  ? "Read"
                  : "Unread"
              }
              icon={<Check size={14} />}
            />

            <Detail
              label="Created"
              value={formatDate(
                notification.created_at
              )}
              icon={<Bell size={14} />}
            />
          </div>

          {notification.customer_email && (
            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Customer
              </p>

              <p className="mt-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
                {notification.customer_email}
              </p>
            </div>
          )}

          {notification.booking_id && (
            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Booking ID
              </p>

              <p className="mt-2 rounded-xl bg-gray-50 p-3 text-xs font-semibold text-gray-700">
                {notification.booking_id}
              </p>
            </div>
          )}

          {notification.action_url && (
            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Action URL
              </p>

              <p className="mt-2 break-all rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                {notification.action_url}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
          >
            <Trash2 size={16} />
            Delete Notification
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200/70 py-3 last:border-0">
      <span className="flex items-center gap-2 text-xs text-gray-500">
        {icon}
        {label}
      </span>

      <span className="text-right text-xs font-bold text-gray-800">
        {value}
      </span>
    </div>
  );
}