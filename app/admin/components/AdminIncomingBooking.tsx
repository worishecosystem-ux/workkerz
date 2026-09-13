"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Check, Phone, MapPin, CalendarDays, Clock3, IndianRupee, UserRound, Zap } from "lucide-react";

type Booking = {
  id: string;
  booking_id: string;
  booking_status: string | null;
  worker_name: string | null;
  worker_photo: string | null;
  worker_specialty: string | null;
  service_type: string | null;
  description: string | null;
  booking_date: string | null;
  booking_time: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  total_cost: number | null;
  service_fee: number | null;
  materials_cost: number | null;
  grand_total: number | null;
  house_no: string | null;
  address: string | null;
  landmark: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
};

export default function AdminIncomingBooking() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const handlePush = async (event: Event) => {
      const customEvent = event as CustomEvent;

      const data = customEvent.detail;

      if (!data || data.type !== "booking" || !data.booking_id) return;

      const { data: bookingData, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_id", data.booking_id)
        .single();

      if (error) {
        console.error("BOOKING BUMP FETCH ERROR:", error);
        return;
      }

      if (bookingData?.booking_status === "pending") {
        setBooking(bookingData);
      }
    };

    window.addEventListener("workkerz:incoming-booking", handlePush);

    return () => {
      window.removeEventListener("workkerz:incoming-booking", handlePush);
    };
  }, []);

  const acceptBooking = async () => {
    if (!booking || loading) return;

    setLoading(true);

    const { error } = await supabase
      .from("bookings")
      .update({
        booking_status: "confirmed",
      })
      .eq("id", booking.id);

    if (error) {
      console.error("ACCEPT BOOKING ERROR:", error);
      setLoading(false);
      return;
    }

    setBooking(null);
    setLoading(false);
  };

  const rejectBooking = async () => {
    if (!booking || loading) return;

    setLoading(true);

    const { error } = await supabase
      .from("bookings")
      .update({
        booking_status: "rejected",
      })
      .eq("id", booking.id);

    if (error) {
      console.error("REJECT BOOKING ERROR:", error);
      setLoading(false);
      return;
    }

    setRejecting(false);
    setBooking(null);
    setLoading(false);
  };

  if (!booking) return null;

  const fullAddress = [
    booking.house_no,
    booking.address,
    booking.landmark,
    booking.city,
    booking.district,
    booking.state,
    booking.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px]" />

      <div className="fixed left-1/2 top-4 z-[9999] w-[calc(100%-24px)] max-w-md -translate-x-1/2 animate-in slide-in-from-top-8 duration-500">
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">

          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                  <Zap className="h-6 w-6 fill-white" />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                    New Work Request
                  </p>

                  <h2 className="text-lg font-extrabold">
                    {booking.service_type || booking.worker_specialty || "New Booking"}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setBooking(null)}
                className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto p-5">

            <div className="mb-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                {booking.worker_photo ? (
                  <img
                    src={booking.worker_photo}
                    alt=""
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200">
                    <UserRound className="h-6 w-6 text-slate-500" />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    Worker
                  </p>

                  <p className="truncate text-base font-bold text-slate-900">
                    {booking.worker_name || "Worker"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {booking.worker_specialty || "Service Professional"}
                  </p>
                </div>
              </div>
            </div>

            {booking.description && (
              <div className="mb-4">
                <p className="mb-1 text-xs font-semibold text-slate-500">
                  Work Details
                </p>

                <p className="text-sm leading-5 text-slate-800">
                  {booking.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <CalendarDays className="mb-2 h-4 w-4 text-orange-500" />

                <p className="text-[11px] text-slate-500">
                  Date
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {booking.booking_date || "Not specified"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <Clock3 className="mb-2 h-4 w-4 text-orange-500" />

                <p className="text-[11px] text-slate-500">
                  Time
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {booking.booking_time || "Not specified"}
                </p>
              </div>

            </div>

            <div className="mt-3 rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Customer Location
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">
                    {fullAddress || "Address not available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-700">
                Customer
              </p>

              <p className="mt-1 text-base font-bold text-slate-900">
                {booking.customer_name || "Customer"}
              </p>

              {booking.customer_phone && (
                <a
                  href={`tel:${booking.customer_phone}`}
                  className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700"
                >
                  <Phone className="h-4 w-4" />
                  {booking.customer_phone}
                </a>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-4 text-white">
              <div>
                <p className="text-xs text-slate-400">
                  Grand Total
                </p>

                <p className="mt-1 text-2xl font-extrabold">
                  ₹{Number(booking.grand_total || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <IndianRupee className="h-7 w-7 text-emerald-400" />
            </div>

          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() => setRejecting(true)}
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-sm font-extrabold text-red-600 transition active:scale-[0.98] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
                Reject
              </button>

              <button
                onClick={acceptBooking}
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 transition active:scale-[0.98] disabled:opacity-50"
              >
                <Check className="h-5 w-5" />
                {loading ? "Processing..." : "Accept"}
              </button>

            </div>
          </div>

        </div>
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">
              Reject this booking?
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              This booking will be marked as rejected.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setRejecting(false)}
                className="h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={rejectBooking}
                disabled={loading}
                className="h-11 rounded-xl bg-red-600 text-sm font-bold text-white disabled:opacity-50"
              >
                {loading ? "Rejecting..." : "Reject Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}