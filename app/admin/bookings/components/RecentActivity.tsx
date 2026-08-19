"use client";

import {
  Activity,
  CheckCircle2,
  ClipboardList,
  XCircle,
} from "lucide-react";

import type { WorkerBooking } from "../types/booking";

type Props = {
  bookings: WorkerBooking[];
};

function getIcon(status: string) {
  if (status === "pending") {
    return <ClipboardList className="h-3.5 w-3.5" />;
  }

  if (status === "completed") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "rejected") {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  return <Activity className="h-3.5 w-3.5" />;
}

function getText(booking: WorkerBooking) {
  if (booking.booking_status === "pending") {
    return `New booking #${booking.booking_id}`;
  }

  if (booking.booking_status === "confirmed") {
    return `Booking confirmed #${booking.booking_id}`;
  }

  if (booking.booking_status === "completed") {
    return `Work completed #${booking.booking_id}`;
  }

  return `Booking rejected #${booking.booking_id}`;
}

export default function RecentActivity({
  bookings,
}: Props) {
  const recent = bookings.slice(0, 7);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3.5">
        <h2 className="text-sm font-black text-slate-900">
          Recent Activity
        </h2>

        <p className="mt-0.5 text-[9px] text-slate-400">
          Latest booking events
        </p>
      </div>

      <div>
        {recent.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-slate-400">
            No recent activity
          </div>
        ) : (
          recent.map((booking) => (
            <div
              key={booking.id}
              className="flex gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                {getIcon(
                  booking.booking_status
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-800">
                  {getText(booking)}
                </p>

                <p className="mt-0.5 truncate text-[9px] text-slate-400">
                  {booking.worker_name || "Worker"}{" "}
                  •{" "}
                  {booking.customer_name || "Customer"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}