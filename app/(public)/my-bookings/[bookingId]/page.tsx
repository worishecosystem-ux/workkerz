"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import {
  CheckCircle,
  User,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  IndianRupee,
  Star,
  BadgeCheck,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function BookingDetailsPage() {
  const params = useParams();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";

    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (params.bookingId) {
      loadBooking();
    }
  }, [params.bookingId]);

  async function loadBooking() {
    setLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
      *,
      customer_addresses (
        house_no,
        address,
        landmark,
        city,
        district,
        state,
        pincode
      )
    `,
      )
      .eq("booking_id", params.bookingId)
      .single();

    if (!error) {
      setBooking(data);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  if (!booking) return <div className="p-5">Loading...</div>;

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b">
        <div className="sticky top-0 z-20 mt-15 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          {/* Top Accent */}
          <div className="h-1 bg-linear-to-r from-emerald-500 via-green-500 to-lime-400" />

          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-[16px] font-bold text-slate-900">
                    Booking ID :
                  </h1>

                  <span className="font-mono text-[14px] font-bold tracking-wide text-slate-900">
                    {booking.booking_id}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-[13px] font-semibold text-slate-500">
                    Booking Status
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {booking.booking_status === "confirmed" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}

                  {booking.booking_status === "pending" && (
                    <Clock3 className="h-4 w-4 text-amber-500" />
                  )}

                  {booking.booking_status === "completed" && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}

                  {booking.booking_status === "rejected" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}

                  <span
                    className={`text-[14px] font-bold capitalize ${
                      booking.booking_status === "confirmed"
                        ? "text-emerald-700"
                        : booking.booking_status === "completed"
                          ? "text-blue-700"
                          : booking.booking_status === "pending"
                            ? "text-amber-700"
                            : "text-red-700"
                    }`}
                  >
                    {booking.booking_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-5">
        <div className="rounded-2xl border border-emerald-100 bg-linear-to-r from-white to-emerald-50 p-3 shadow-sm">
          <div className="flex gap-3">
            <div className="relative">
              <img
                src={booking.worker_photo}
                className="h-16 w-16 rounded-2xl object-fill ring-2 ring-emerald-100"
              />

              <span className="absolute bottom-2 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-bold text-gray-900">
                    {booking.worker_name}
                  </h2>

                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {booking.worker_specialty}
                  </p>
                </div>

                <div className="bg-green-600 text-white px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                  {" "}
                  ⭐ {booking.worker_rating}{" "}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                  Ready to Work
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <div className="space-y-1.5">
            <MiniRow label="Service" value={booking.service_type} />

            <MiniRow label="Date" value={formatDate(booking.booking_date)} />

            <MiniRow label="Time" value={booking.booking_time} />

            <MiniRow label="Customer" value={booking.customer_name} />

            <MiniRow label="Phone" value={booking.customer_phone} />
            <MiniRow label="Description" value={booking.description || "—"} />
            <MiniRow label="Notes" value={booking.notes || "—"} />
            <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-2.5 py-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

              <p className="text-[11px] leading-4 text-slate-600">
                {[
                  booking?.customer_addresses?.house_no,
                  booking?.customer_addresses?.address,
                  booking?.customer_addresses?.landmark,
                  booking?.customer_addresses?.city,
                  booking?.customer_addresses?.district,
                  booking?.customer_addresses?.state,
                  booking?.customer_addresses?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Address not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 rounded-2xl bg-[#072566] p-3.5 text-white shadow-xl">
          <div>
            <PriceRow
              label="Worker Fee"
              value={`₹${Number(booking.total_cost || 0).toLocaleString("en-IN")}`}
            />

            <PriceRow
              label="Platform Fee"
              value={`₹${Number(booking.service_fee || 0).toLocaleString("en-IN")}`}
            />
          </div>

          <div className="my-3 h-px bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[15px] font-medium text-white/60">
                Grand Total
              </span>

              <span className="text-[15px] font-bold text-white">
                ₹{Number(booking.grand_total || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="rounded-lg bg-white/10 px-2.5 py-1.5 backdrop-blur-sm">
              <p className="mt-0.5 text-[11px] font-semibold leading-none text-white">
                {booking.booking_type?.replaceAll("_", " ") || "Quick Service"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// DETAIL ROW
function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2 border-b border-slate-100 last:border-b-0">
      <span className="shrink-0 text-[13px] font-medium text-slate-500">
        {label}
      </span>

      <span className="max-w-[90%] text-right text-[14px] font-semibold text-slate-900 wrap-break-word leading-5">
        {value || "—"}
      </span>
    </div>
  );
}

// PRICE ROW
function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] leading-none text-white/65">{label}</span>

      <span className="text-[13px] leading-none font-semibold text-white">
        {value}
      </span>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
      <span className="text-[11px] text-slate-500">{label}</span>

      <span className="max-w-[60%] truncate text-right text-[11px] font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}
