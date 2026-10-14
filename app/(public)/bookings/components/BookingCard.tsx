
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import CancellationBadge from "./CancellationBadge";
import type { Booking, CancellationRequest } from "./types";

type BookingCardProps = {
  booking: Booking;
  cancellation?: CancellationRequest;
  onBookAgain: () => void;
};

export default function BookingCard({
  booking,
  cancellation,
  onBookAgain,
}: BookingCardProps) {
  const bookingStatus = String(
    booking.booking_status ?? "pending"
  )
    .toLowerCase()
    .trim();

  const cancellationStatus = String(
    cancellation?.status ?? ""
  )
    .toLowerCase()
    .trim();

  // Only show CANCELLED when the booking is cancelled
  // or its cancellation request has been approved.
  const isCancelled =
    ["cancelled", "canceled"].includes(bookingStatus) ||
    ["approved", "accepted", "cancelled", "canceled"].includes(
      cancellationStatus
    );

  const hasCancellationRequest =
    Boolean(cancellation?.id) || Boolean(cancellationStatus);

  const statusClass = isCancelled
    ? "bg-red-100 text-red-700"
    : bookingStatus === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : bookingStatus === "confirmed"
        ? "bg-blue-100 text-blue-700"
        : "bg-amber-100 text-amber-800";

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isCancelled ? "border-red-200" : "border-emerald-100"
      }`}
    >
      {/* Top border */}
      <div
        className={`h-1 ${
          isCancelled
            ? "bg-red-500"
            : "bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400"
        }`}
      />

      <div className="p-3 sm:p-4">
        {/* Booking heading */}
        <div className="flex items-start gap-2">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isCancelled
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <CalendarDays size={17} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900">
                {booking.service_type || "Worker booking"}
              </h2>

              {isCancelled && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">
                  CANCELLED
                </span>
              )}

              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusClass}`}
              >
                {String(booking.booking_status || "pending")
                  .replaceAll("_", " ")
                  .toUpperCase()}
              </span>
            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              Booking #{booking.booking_id}
            </p>
          </div>
        </div>

        {/* Worker information */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
          <Image
            src={booking.worker_photo || "/worker-placeholder.png"}
            alt={booking.worker_name || "Worker"}
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900">
              {booking.worker_name || "Worker details unavailable"}
            </p>

            <p className="truncate text-[10px] text-slate-500">
              {booking.worker_specialty ||
                booking.service_type ||
                "Service provider"}
            </p>

            <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
              <MapPin size={11} />
              {[booking.city, booking.state]
                .filter(Boolean)
                .join(", ") || "Location not available"}
            </p>
          </div>

          {booking.grand_total != null && (
            <p className="shrink-0 text-xs font-bold text-slate-900">
              ₹{Number(booking.grand_total).toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Scheduled work */}
        {(booking.booking_date || booking.booking_time) && (
          <p className="mt-2 text-[10px] text-slate-500">
            {booking.booking_date || "Date not set"}
            {booking.booking_time ? ` · ${booking.booking_time}` : ""}
          </p>
        )}

        {/* Cancellation and refund status */}
        <CancellationBadge request={cancellation} />

        {/* Existing cancellation request information */}
        {!isCancelled && hasCancellationRequest && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-800">
              Cancellation Request
            </p>

            <p className="mt-1 text-[11px] text-amber-700">
              Status: {cancellation?.status || "Under review"}
            </p>

            <p className="mt-1 text-[11px] text-amber-700">
              Your booking will be updated after the admin decision.
            </p>
          </div>
        )}

        {/* Booking actions — no Cancel Booking button */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <Link
            href={`/my-bookings/${booking.booking_id}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"
          >
            <ShieldCheck size={14} />
            View details
            <ChevronRight size={13} />
          </Link>

          <button
            type="button"
            onClick={onBookAgain}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-emerald-700"
          >
            <span>Book Again</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
