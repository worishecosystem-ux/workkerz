"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  IndianRupee,
  Star,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function BookingDetailsPage() {
  const params = useParams();

  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    loadBooking();
  }, []);

  async function loadBooking() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_id", params.bookingId)
      .single();

    setBooking(data);
  }

  if (!booking) return <div className="p-5">Loading...</div>;

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => history.back()}
            className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="font-bold text-lg">Booking Details</h1>

            <p className="text-xs text-slate-500">#{booking.booking_id}</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              booking.booking_status === "confirmed"
                ? "bg-blue-100 text-blue-700"
                : booking.booking_status === "completed"
                  ? "bg-green-100 text-green-700"
                  : booking.booking_status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {booking.booking_status}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-5">
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-bold">Booking Status</h2>

          <p className="mt-2 text-purple-700 font-medium">
            {booking.booking_status}
          </p>

          <p className="text-sm text-gray-500 mt-2">
            ID : {booking.booking_id}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border">
          <div className="flex gap-4 items-center">
            <Image
              src={booking.worker_photo || "/worker-placeholder.png"}
              alt=""
              width={90}
              height={90}
              className="h-20 w-20 rounded-2xl object-cover border"
            />

            <div className="flex-1">
              <h2 className="text-xl font-bold">{booking.worker_name}</h2>

              <p className="text-slate-500">{booking.worker_specialty}</p>

              <div className="flex items-center gap-1 mt-2">
                <Star
                  size={16}
                  fill="currentColor"
                  className="text-yellow-500"
                />
                <span className="font-medium">
                  {booking.worker_rating || 4.8}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Service</p>

            <p className="font-semibold">{booking.service_type}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Booking Type</p>

            <p className="font-semibold">{booking.booking_type}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Date</p>

            <p className="font-semibold">{booking.booking_date}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Time</p>

            <p className="font-semibold">{booking.booking_time}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-bold mb-4">Service Address</h2>

          <div className="flex gap-2">
            <MapPin />
            <div>
              <p>{booking.address}</p>
              <p>
                {booking.city}, {booking.district}
              </p>
              <p>
                {booking.state} - {booking.pincode}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-bold mb-4">Selected Materials</h2>

          {booking.selected_materials &&
            Object.entries(booking.selected_materials).map(
              ([name, qty]: any) => (
                <div key={name} className="flex justify-between border-b py-2">
                  <span>{name}</span>
                  <span>x {qty}</span>
                </div>
              ),
            )}
        </div>

        <div className="bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-3xl p-6">
          <p className="text-sm opacity-80">Grand Total</p>

          <h2 className="text-4xl font-bold mt-2">₹{booking.grand_total}</h2>

          <div className="border-t border-white/20 mt-5 pt-5 space-y-2">
            <div className="flex justify-between">
              <span>Package</span>
              <span>₹{booking.package_price}</span>
            </div>

            <div className="flex justify-between">
              <span>Materials</span>
              <span>₹{booking.materials_cost}</span>
            </div>

            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>₹{booking.service_fee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
