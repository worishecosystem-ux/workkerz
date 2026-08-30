"use client";

import {
  Bell,
  CheckCircle2,
  Clock3,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { useCallback, useState } from "react";

import type {
  StoredCustomerNotification,
} from "../../context/CustomerNotificationContext";

import {
  useCustomerNotificationContext,
} from "../../context/CustomerNotificationContext";

/* =========================================================
   NOTIFICATION ICON
========================================================= */

function NotificationIcon({
  type,
}: {
  type: StoredCustomerNotification["type"];
}) {
  if (type === "request_rejected") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
        <XCircle className="h-4 w-4" />
      </div>
    );
  }

  if (type === "request_completed") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <CheckCircle2 className="h-4 w-4" />
      </div>
    );
  }

  if (type === "request_accepted") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5C39]">
      <Clock3 className="h-4 w-4" />
    </div>
  );
}

/* =========================================================
   TIME
========================================================= */

function formatNotificationTime(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

/* =========================================================
   COMPONENT
========================================================= */

type Props = {
  onViewRequest?: (
    requestId: string,
  ) => void;
};

export default function CustomerNotificationCenter({
  onViewRequest,
}: Props) {
  const [open, setOpen] =
    useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } =
    useCustomerNotificationContext();

  /* =======================================================
     OPEN / CLOSE
  ======================================================= */

  const toggleOpen =
    useCallback(() => {
      setOpen(
        (previous) =>
          !previous,
      );
    }, []);

  const close =
    useCallback(() => {
      setOpen(false);
    }, []);

  /* =======================================================
     VIEW REQUEST
  ======================================================= */

  const handleViewRequest =
    useCallback(
      (
        item: StoredCustomerNotification,
      ) => {
        markAsRead(item.id);

        onViewRequest?.(
          item.requestId,
        );

        close();
      },
      [
        markAsRead,
        onViewRequest,
        close,
      ],
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* =================================================
          NOTIFICATION BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Notifications"
        className="
          relative
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-white
          text-[#172033]
          shadow-sm
          ring-1
          ring-gray-100
          transition
          hover:bg-gray-50
          active:scale-95
        "
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              min-h-[18px]
              min-w-[18px]
              items-center
              justify-center
              rounded-full
              bg-[#FF5C39]
              px-1
              text-[8px]
              font-black
              text-white
              ring-2
              ring-white
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* =================================================
          BACKDROP
      ================================================= */}

      {open && (
        <button
          type="button"
          aria-label="Close notifications"
          onClick={close}
          className="
            fixed
            inset-0
            z-[90]
            cursor-default
            bg-black/20
          "
        />
      )}

      {/* =================================================
          DRAWER
      ================================================= */}

      {open && (
        <aside
          className="
            fixed
            right-3
            top-14
            z-[100]
            w-[calc(100%-24px)]
            max-w-[390px]
            overflow-hidden
            rounded-2xl
            border
            border-gray-100
            bg-white
            shadow-[0_18px_50px_rgba(0,0,0,0.16)]
            sm:right-5
            sm:top-16
          "
        >
          {/* =============================================
              HEADER
          ============================================= */}

          <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-[#172033]">
                Notifications
              </h3>

              <p className="mt-0.5 text-[9px] text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={
                    markAllAsRead
                  }
                  className="
                    rounded-lg
                    px-2
                    py-1.5
                    text-[9px]
                    font-black
                    text-[#FF5C39]
                    hover:bg-orange-50
                  "
                >
                  Mark all read
                </button>
              )}

              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  bg-gray-100
                  text-gray-500
                "
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* =============================================
              LIST
          ============================================= */}

          <div className="max-h-[430px] overflow-y-auto">
            {notifications.length ===
            0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5C39]">
                  <Bell className="h-5 w-5" />
                </div>

                <p className="mt-3 text-xs font-black text-[#172033]">
                  No notifications
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  Your request updates
                  will appear here.
                </p>
              </div>
            ) : (
              notifications.map(
                (item) => (
                  <div
                    key={item.id}
                    className={`
                      group
                      border-b
                      border-gray-50
                      px-3
                      py-3
                      transition
                      ${
                        item.read
                          ? "bg-white"
                          : "bg-orange-50/40"
                      }
                    `}
                  >
                    <div className="flex gap-2.5">
                      <NotificationIcon
                        type={
                          item.type
                        }
                      />

                      {/* =================================
                          CONTENT
                      ================================= */}

                      <button
                        type="button"
                        onClick={() =>
                          handleViewRequest(
                            item,
                          )
                        }
                        className="
                          min-w-0
                          flex-1
                          text-left
                        "
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-black text-[#172033]">
                            {item.title}
                          </p>

                          {!item.read && (
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5C39]" />
                          )}
                        </div>

                        <p className="mt-1 text-[9px] leading-4 text-[#64748B]">
                          {item.message}
                        </p>

                        <p className="mt-1.5 text-[8px] font-medium text-gray-400">
                          {formatNotificationTime(
                            item.createdAt,
                          )}
                        </p>
                      </button>

                      {/* =================================
                          DELETE
                      ================================= */}

                      <button
                        type="button"
                        aria-label="Delete notification"
                        onClick={() =>
                          deleteNotification(
                            item.id,
                          )
                        }
                        className="
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          text-gray-300
                          opacity-0
                          transition
                          hover:bg-red-50
                          hover:text-red-500
                          group-hover:opacity-100
                        "
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          {/* =============================================
              FOOTER
          ============================================= */}

          {notifications.length >
            0 && (
            <footer className="border-t border-gray-100 bg-gray-50/70 px-3 py-2.5">
              <button
                type="button"
                onClick={clearAll}
                className="
                  w-full
                  rounded-xl
                  py-2
                  text-[9px]
                  font-black
                  text-gray-500
                  transition
                  hover:bg-white
                  hover:text-red-500
                "
              >
                Clear all notifications
              </button>
            </footer>
          )}
        </aside>
      )}
    </>
  );
}