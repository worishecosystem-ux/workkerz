"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  UserRound,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";

import type { WorkerBooking } from "../types/booking";

type Props = {
  booking: WorkerBooking;

  mode:
    | "pending"
    | "confirmed"
    | "outOfWork"
    | "completed"
    | "rejected";

  actionLoading?: string | null;

  onView: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
  onStartWork?: () => void;
  onComplete?: () => void;
};

function safe(value: string | null | undefined) {
  return value || "—";
}

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(value: string | null) {
  if (!value) return "Date not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

/*
|--------------------------------------------------------------------------
| TIME
|--------------------------------------------------------------------------
*/

function formatTime(value: string | null | undefined) {
  if (!value) return "Time not set";

  /*
   * Handles:
   * 10:00
   * 10:00:00
   * 10:00 AM
   * 2026-08-19T10:00:00
   */

  const raw = value.trim();

  const match = raw.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );

  if (!match) {
    return raw;
  }

  let hour = Number(match[1]);
  const minute = match[2];
  const meridiem = match[4];

  if (meridiem) {
    return `${hour}:${minute} ${meridiem.toUpperCase()}`;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${suffix}`;
}

/*
|--------------------------------------------------------------------------
| BOOKING DATE + TIME
|--------------------------------------------------------------------------
| Shows:
| NOW
| 01:00 PM
| 19 Aug
|--------------------------------------------------------------------------
*/

function getBookingTiming(
  dateValue: string | null,
  timeValue: string | null | undefined
) {
  if (!dateValue && !timeValue) {
    return {
      live: false,
      time: "—",
      date: "Date not set",
    };
  }

  const time = formatTime(timeValue);

  /*
   * If booking date is today,
   * show TODAY / NOW style.
   */

  if (dateValue) {
    const bookingDate = new Date(dateValue);

    if (!Number.isNaN(bookingDate.getTime())) {
      const now = new Date();

      const sameDay =
        bookingDate.getFullYear() === now.getFullYear() &&
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getDate() === now.getDate();

      if (sameDay) {
        return {
          live: true,
          time,
          date: "Today",
        };
      }
    }
  }

  return {
    live: false,
    time,
    date: formatDate(dateValue),
  };
}

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

const statusConfig = {
  pending: {
    label: "NEW",
    className: "bg-red-50 text-red-600",
  },

  confirmed: {
    label: "CONFIRMED",
    className: "bg-blue-50 text-blue-600",
  },

  outOfWork: {
    label: "IN WORK",
    className: "bg-orange-50 text-orange-600",
  },

  completed: {
    label: "DONE",
    className: "bg-emerald-50 text-emerald-600",
  },

  rejected: {
    label: "CANCELLED",
    className: "bg-rose-50 text-rose-600",
  },
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function BookingCard({
  booking,
  mode,
  actionLoading,
  onView,
  onConfirm,
  onReject,
  onStartWork,
  onComplete,
}: Props) {
  const workerName = safe(booking.worker_name);
  const customerName = safe(booking.customer_name);

  const status = statusConfig[mode];

  const timing = getBookingTiming(
    booking.booking_date,
    booking.booking_time
  );

  const amount = Number(
    booking.grand_total || 0
  ).toLocaleString("en-IN");

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
        transition
        hover:border-slate-300
        hover:shadow-md
      "
    >
      {/* =========================================================
          TOP BAR
      ========================================================= */}

      <div className="flex h-8 items-center justify-between border-b border-slate-100 px-2.5">
        {/* BOOKING TIME */}

        <div className="flex min-w-0 items-center gap-1.5">
          {timing.live ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          ) : (
            <Clock3 className="h-3 w-3 text-slate-400" />
          )}

          <span
            className={`text-[9px] font-extrabold ${
              timing.live
                ? "text-emerald-600"
                : "text-slate-500"
            }`}
          >
            {timing.time}
          </span>

          {timing.live && (
            <span className="text-[8px] font-semibold text-slate-400">
              TODAY
            </span>
          )}
        </div>

        {/* BOOKING ID + STATUS */}

        <div className="flex items-center gap-1.5">
          <span className="max-w-[70px] truncate text-[8px] font-medium text-slate-400">
            #{safe(booking.booking_id)}
          </span>

          <span
            className={`
              rounded-full
              px-1.5
              py-0.5
              text-[7px]
              font-black
              ${status.className}
            `}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* =========================================================
          WORKER
      ========================================================= */}

      <div className="flex items-center gap-2.5 px-2.5 py-2">
        {/* PHOTO */}

        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
          {booking.worker_photo ? (
            <img
              src={booking.worker_photo}
              alt={workerName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserRound className="h-4 w-4 text-slate-400" />
            </div>
          )}
        </div>

        {/* NAME */}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[11px] font-extrabold text-slate-900">
            {workerName}
          </h3>

          <p className="truncate text-[8px] text-slate-400">
            {safe(booking.worker_specialty)}
          </p>
        </div>

        {/* SERVICE ICON */}

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
          <Wrench className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* =========================================================
          SERVICE
      ========================================================= */}

      <div className="mx-2.5 rounded-lg bg-slate-50 px-2 py-1.5">
        <p className="truncate text-[10px] font-bold text-slate-800">
          {safe(booking.service_type)}
        </p>

        {booking.description && (
          <p className="mt-0.5 truncate text-[8px] text-slate-400">
            {booking.description}
          </p>
        )}
      </div>

      {/* =========================================================
          DATE / TIME
      ========================================================= */}

      <div className="grid grid-cols-2 gap-1.5 px-2.5 pt-1.5">
        {/* DATE */}

        <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2 py-1.5">
          <CalendarDays className="h-3 w-3 shrink-0 text-slate-400" />

          <div className="min-w-0">
            <p className="text-[7px] font-semibold uppercase leading-none text-slate-400">
              Date
            </p>

            <p className="mt-0.5 truncate text-[9px] font-bold text-slate-700">
              {timing.date}
            </p>
          </div>
        </div>

        {/* TIME */}

        <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2 py-1.5">
          <Clock3
            className={`h-3 w-3 shrink-0 ${
              timing.live
                ? "text-emerald-500"
                : "text-slate-400"
            }`}
          />

          <div className="min-w-0">
            <p className="text-[7px] font-semibold uppercase leading-none text-slate-400">
              Time
            </p>

            <p
              className={`mt-0.5 truncate text-[9px] font-bold ${
                timing.live
                  ? "text-emerald-600"
                  : "text-slate-700"
              }`}
            >
              {timing.time}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          CUSTOMER + AMOUNT
      ========================================================= */}

      <div className="flex items-center justify-between px-2.5 py-2">
        <div className="min-w-0">
          <p className="text-[7px] font-semibold uppercase text-slate-400">
            Customer
          </p>

          <p className="max-w-[135px] truncate text-[10px] font-bold text-slate-800">
            {customerName}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[7px] font-semibold uppercase text-slate-400">
            Total
          </p>

          <p className="text-[13px] font-black leading-tight text-slate-900">
            ₹{amount}
          </p>
        </div>
      </div>

      {/* =========================================================
          ACTIONS
      ========================================================= */}

      <div className="grid grid-cols-3 gap-1 border-t border-slate-100 bg-slate-50 p-1.5">
        {/* VIEW */}

        <button
          type="button"
          onClick={onView}
          className="
            flex
            h-7
            items-center
            justify-center
            gap-1
            rounded-md
            border
            border-slate-200
            bg-white
            text-[8px]
            font-bold
            text-slate-600
            transition
            hover:bg-slate-100
          "
        >
          <Eye className="h-3 w-3" />
          View
        </button>

        {/* =====================================================
            PENDING
        ===================================================== */}

        {mode === "pending" && (
          <>
            <button
              type="button"
              disabled={!!actionLoading}
              onClick={onConfirm}
              className="
                flex
                h-7
                items-center
                justify-center
                gap-1
                rounded-md
                bg-emerald-500
                text-[8px]
                font-extrabold
                text-white
                transition
                hover:bg-emerald-600
                disabled:opacity-50
              "
            >
              {actionLoading === "confirmed" ? (
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}

              Accept
            </button>

            <button
              type="button"
              disabled={!!actionLoading}
              onClick={onReject}
              className="
                flex
                h-7
                items-center
                justify-center
                gap-1
                rounded-md
                bg-rose-50
                text-[8px]
                font-extrabold
                text-rose-600
                transition
                hover:bg-rose-100
                disabled:opacity-50
              "
            >
              <XCircle className="h-3 w-3" />
              Reject
            </button>
          </>
        )}

        {/* =====================================================
            CONFIRMED
        ===================================================== */}

        {mode === "confirmed" && (
          <button
            type="button"
            disabled={!!actionLoading}
            onClick={onStartWork}
            className="
              col-span-2
              flex
              h-7
              items-center
              justify-center
              gap-1
              rounded-md
              bg-orange-500
              text-[8px]
              font-extrabold
              text-white
              transition
              hover:bg-orange-600
              disabled:opacity-50
            "
          >
            <Zap className="h-3 w-3" />
            Start Work
          </button>
        )}

        {/* =====================================================
            OUT OF WORK
        ===================================================== */}

        {mode === "outOfWork" && (
          <button
            type="button"
            disabled={!!actionLoading}
            onClick={onComplete}
            className="
              col-span-2
              flex
              h-7
              items-center
              justify-center
              gap-1
              rounded-md
              bg-emerald-500
              text-[8px]
              font-extrabold
              text-white
              transition
              hover:bg-emerald-600
              disabled:opacity-50
            "
          >
            <CheckCircle2 className="h-3 w-3" />
            Complete
          </button>
        )}

        {/* =====================================================
            COMPLETED
        ===================================================== */}

        {mode === "completed" && (
          <div
            className="
              col-span-2
              flex
              h-7
              items-center
              justify-center
              gap-1
              rounded-md
              bg-emerald-50
              text-[8px]
              font-extrabold
              text-emerald-600
            "
          >
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </div>
        )}

        {/* =====================================================
            REJECTED
        ===================================================== */}

        {mode === "rejected" && (
          <div
            className="
              col-span-2
              flex
              h-7
              items-center
              justify-center
              gap-1
              rounded-md
              bg-rose-50
              text-[8px]
              font-extrabold
              text-rose-600
            "
          >
            <XCircle className="h-3 w-3" />
            Cancelled
          </div>
        )}
      </div>
    </article>
  );
}