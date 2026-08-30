"use client";

import {
  CheckCircle2,
  Clock3,
  X,
  XCircle,
} from "lucide-react";

import type {
  CustomerRequestNotification,
} from "../../hooks/useCustomerRequestNotifications";

type Props = {
  notification:
    | CustomerRequestNotification
    | null;

  onClose: () => void;

  onViewRequest?: (
    requestId: string,
  ) => void;
};

export default function CustomerRequestNotificationToast({
  notification,
  onClose,
  onViewRequest,
}: Props) {
  if (!notification) {
    return null;
  }

  const isAccepted =
    notification.type ===
    "request_accepted";

  const isRejected =
    notification.type ===
    "request_rejected";

  const isCompleted =
    notification.type ===
    "request_completed";

  const Icon = isRejected
    ? XCircle
    : isAccepted || isCompleted
      ? CheckCircle2
      : Clock3;

  const iconClass = isRejected
    ? "bg-red-50 text-red-500"
    : isAccepted
      ? "bg-emerald-50 text-emerald-600"
      : isCompleted
        ? "bg-blue-50 text-blue-600"
        : "bg-orange-50 text-[#FF5C39]";

  return (
    <div
      className="
        fixed
        right-3
        top-3
        z-[9999]
        w-[calc(100%-24px)]
        max-w-[380px]
        animate-in
        slide-in-from-right-5
        fade-in
        duration-300
        sm:right-5
        sm:top-5
      "
    >
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-gray-100
          bg-white
          shadow-[0_12px_40px_rgba(0,0,0,0.14)]
        "
      >
        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="flex gap-3 p-3.5">
          {/* ICON */}

          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${iconClass}
            `}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* MESSAGE */}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-black text-[#172033]">
                {notification.title}
              </p>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close notification"
                className="
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-600
                "
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
              {notification.message}
            </p>

            {/* VIEW REQUEST */}

            {onViewRequest && (
              <button
                type="button"
                onClick={() => {
                  onViewRequest(
                    notification.requestId,
                  );

                  onClose();
                }}
                className="
                  mt-2
                  text-[10px]
                  font-black
                  text-[#FF5C39]
                  hover:underline
                "
              >
                View Request →
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="h-[3px] w-full bg-gray-100">
          <div
            className={`
              h-full
              w-full
              origin-left
              animate-[notification-progress_5s_linear_forwards]
              ${
                isRejected
                  ? "bg-red-500"
                  : isAccepted
                    ? "bg-emerald-500"
                    : isCompleted
                      ? "bg-blue-500"
                      : "bg-[#FF5C39]"
              }
            `}
          />
        </div>
      </div>
    </div>
  );
}