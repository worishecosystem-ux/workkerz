import { CalendarDays, Clock3, CreditCard, IndianRupee } from "lucide-react";
import type { Booking } from "../../../Downloads/workkerz-booking-components 2/lib/booking-details";
import { formatCurrency, formatDate, formatLabel } from "../../../Downloads/workkerz-booking-components 2/lib/booking-details";

export default function BookingOverview({ booking, bookingReference, serviceName, totalAmount }: {
  booking: Booking; bookingReference: string; serviceName: string; totalAmount: unknown;
}) {
  const metrics = [
    { label: "Work date", value: formatDate(booking.booking_date), icon: CalendarDays },
    { label: "Time", value: booking.booking_time || "Not available", icon: Clock3 },
    { label: "Total amount", value: formatCurrency(totalAmount), icon: IndianRupee },
    { label: "Payment", value: formatLabel(booking.payment_status), icon: CreditCard },
  ];
  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 bg-emerald-800 px-4 py-4 text-white sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">Workkerz booking details</p>
          <h1 className="mt-1 break-all text-base font-extrabold sm:text-lg">{bookingReference}</h1>
          <p className="mt-1 text-[11px] text-emerald-100">{serviceName}</p>
        </div>
        <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-bold">{formatLabel(booking.booking_status)}</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-emerald-100 sm:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white p-3">
            <div className="flex items-center gap-1.5 text-emerald-700"><Icon size={14} /><span className="text-[10px] font-semibold">{label}</span></div>
            <p className="mt-1 break-words text-xs font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
