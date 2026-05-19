"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  CheckCircle,
  Clock,
  MapPin,
  Star,
  MessageCircle,
  Home,
  BadgeCheck,
  ShieldCheck,
  Send,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

import confetti from "canvas-confetti";

export default function Confirmation() {
  const fired = useRef(false);

  const savedRef = useRef(false);

  const bookingId = useRef("");

  const [waSent, setWaSent] = useState(false);

  const [whatsappNum, setWhatsappNum] = useState("91");

  const [bookingStatus, setBookingStatus] = useState<
    "pending" | "confirmed" | "rejected" | "cancelled"
  >("pending");

  const [saving, setSaving] = useState(true);

  const [state, setState] = useState<{
    form: Record<string, any>;
    worker: any;
    totalCost: number;
    serviceFee: number;
    materialsCost?: number;
    grandTotal: number;
    confirmedAt?: string;
    bookingId?: string;
  } | null>(null);

  // LOAD BOOKING
  useEffect(() => {
    const saved = sessionStorage.getItem("booking-data");

    if (saved) {
      const parsed = JSON.parse(saved);

      setState(parsed);

      bookingId.current =
        parsed.bookingId ||
        `WKZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }
  }, []);

  // CONFETTI
  useEffect(() => {
    if (!fired.current) {
      fired.current = true;

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#FF5C39", "#0F172A", "#FF9F7F", "#FED7CC"],
      });
    }
  }, []);

  // LIVE STATUS CHECK
  useEffect(() => {
    if (!bookingId.current) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_status")
        .eq("booking_id", bookingId.current)
        .single();

      if (!error && data?.booking_status) {
        setBookingStatus(data.booking_status);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // SAVE BOOKING IN SUPABASE
  useEffect(() => {
    if (!state) return;

    if (savedRef.current) return;

    const saveBooking = async () => {
      try {
        savedRef.current = true;

        setSaving(true);

        const {
          form,
          worker,
          totalCost,
          serviceFee,
          materialsCost = 0,
          grandTotal,
        } = state;

        const bookingData = {
          booking_id: bookingId.current,

          booking_status: "pending",

          worker_id: worker?.id || null,

          worker_name: worker?.name || "",

          worker_photo: worker?.photo || "",

          worker_specialty: worker?.specialty || "",

          worker_rating: worker?.rating || 0,

          service_type: form?.serviceType || "",

          description: form?.description || "",

          booking_date: form?.date || null,

          booking_time: form?.time || "",

          duration: Number(form?.duration) || 1,

          customer_name: form?.name || "",

          customer_phone: form?.phone || "",

          customer_email: form?.email || "",

          notes: form?.notes || "",

          address: form?.address || "",

          city: form?.city || "",

          district: form?.district || "",

          state: form?.state || "",

          pincode: form?.pincode || "",

          selected_materials: form?.selectedMaterials || {},

          total_cost: Number(totalCost) || 0,

          service_fee: Number(serviceFee) || 0,

          materials_cost: Number(materialsCost) || 0,

          grand_total: Number(grandTotal) || 0,
        };

        // SAVE BOOKING
        const { error } = await supabase.from("bookings").insert([bookingData]);

        if (error) {
          console.log(error);

          alert("Booking save failed");

          return;
        }

        console.log("BOOKING SAVED");

        // AUTO SEND EMAIL
        try {
          console.log("BOOKING SAVED");

          // AUTO EMAIL SEND
          await fetch("/api/send-booking-email", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              bookingId: bookingId.current,

              worker,

              form,

              totalCost,

              serviceFee,

              materialsCost,

              grandTotal,

              categoryMaterials: [],
            }),
          });

          console.log("EMAIL SENT");
        } catch (emailError) {
          console.log("EMAIL ERROR:", emailError);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setSaving(false);
      }
    };

    saveBooking();
  }, [state]);

  useEffect(() => {
    if (!state) return;

    const timer = setTimeout(() => {
      const message = encodeURIComponent(buildWhatsAppMessage());

      window.open(`https://wa.me/918602190366?text=${message}`, "_blank");

      setWaSent(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [state]);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#0F172A]">No Booking Found</h2>

          <Link href="/" className="text-[#FF5C39] text-sm mt-2 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const {
    form,
    worker,
    totalCost,
    serviceFee,
    materialsCost = 0,
    grandTotal,
    confirmedAt,
  } = state;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";

    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // WHATSAPP SHARE
  const buildWhatsAppMessage = () => {
    const materialLines =
      form?.selectedMaterials?.length > 0
        ? form.selectedMaterials.map(
            (item: any, index: number) =>
              `┃ ${index + 1}. ${item.name}
┃ Qty: ${item.qty || 1}
┃ Price: ₹${item.price || 0}
┃ Total: ₹${((item.price || 0) * (item.qty || 1)).toFixed(2)}`,
          )
        : [];

    const lines = [
      `╔══════════════════════╗`,
      `      🛠️ *WORKKERZ BOOKING*`,
      `╚══════════════════════╝`,
      ``,
      `✅ *Booking Submitted Successfully!*`,
      ``,
      `🆔 *Booking ID*`,
      `┃ ${bookingId.current}`,
      ``,
      `👷 *Worker Details*`,
      `┃ ${worker.name}`,
      `┃ ${worker.specialty}`,
      `┃ ⭐ ${worker.rating} Rating`,
      ``,
      `👤 *Customer Details*`,
      `┃ ${form.name}`,
      `┃ ${form.phone}`,
      `┃ ${form.email}`,
      ``,
      `📍 *Service Address*`,
      `┃ ${form.address}`,
      `┃ ${form.city}, ${form.state}`,
      `┃ ${form.pincode}`,
      ``,
      `📅 *Booking Schedule*`,
      `┃ Date: ${formatDate(form.date)}`,
      `┃ Time: ${form.time}`,
      `┃ Duration: ${form.duration} hour(s)`,
      ``,
      `🔧 *Service Type*`,
      `┃ ${form.serviceType}`,
      ``,

      form.description ? [`📝 *Description*`, `┃ ${form.description}`, ``] : [],

      materialLines.length > 0
        ? [
            `📦 *Selected Materials*`,
            `┃────────────────────`,
            ...materialLines,
            ``,
          ]
        : [],

      `💳 *Payment Summary*`,
      `┃────────────────────`,
      `┃ Worker Charges : ₹${Number(totalCost).toFixed(2)}`,
      `┃ Platform Fee : ₹${Number(serviceFee).toFixed(2)}`,

      materialsCost > 0
        ? `┃ Materials Cost : ₹${Number(materialsCost).toFixed(2)}`
        : null,

      `┃────────────────────`,
      `┃ 💰 *Grand Total : ₹${Number(grandTotal).toFixed(2)}*`,
      ``,
      `🛡️ *Booking Status*`,
      `┃ Pending Admin Approval`,
      ``,
      `🚀 Powered by Workkerz`,
      `👷 Trusted Workers • Fast Booking • Secure Platform`,
      ``,
      `══════════════════════`,
    ];

    return lines.flat().filter(Boolean).join("\n");
  };

  const shareWhatsApp = () => {
    if (!whatsappNum.trim()) return;

    const cleanNumber = whatsappNum.replace(/\D/g, "");

    const message = encodeURIComponent(buildWhatsAppMessage());

    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");

    setWaSent(true);

    setTimeout(() => {
      setWaSent(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          {/* HEADER */}
          <div className="relative overflow-hidden bg-linear-to-r from-[#0F172A] via-[#172033] to-[#1E293B] px-5 py-4">
            {/* BG EFFECT */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-16 -left-16 w-44 h-44 bg-[#FF5C39]/10 blur-3xl rounded-full" />

              <div className="absolute bottom-0 right-0 w-52 h-52 bg-[#0EA5E9]/10 blur-3xl rounded-full" />
            </div>

            {/* CONTENT */}
            <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
              {/* LEFT */}
              <div className="flex items-center gap-4">
                {/* ICON */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
                    bookingStatus === "pending"
                      ? "bg-yellow-100 border-yellow-200"
                      : bookingStatus === "confirmed"
                        ? "bg-emerald-100 border-emerald-200"
                        : bookingStatus === "rejected"
                          ? "bg-red-100 border-red-200"
                          : "bg-gray-200 border-gray-300"
                  }`}
                >
                  {bookingStatus === "pending" && (
                    <Clock className="w-6 h-6 text-yellow-600" />
                  )}

                  {bookingStatus === "confirmed" && (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  )}

                  {bookingStatus === "rejected" && (
                    <span className="text-xl">❌</span>
                  )}

                  {bookingStatus === "cancelled" && (
                    <span className="text-xl">🚫</span>
                  )}
                </div>

                {/* TEXT */}
                <div>
                  <h1 className="text-lg font-black text-white leading-none">
                    {bookingStatus === "pending" && "Booking Pending"}

                    {bookingStatus === "confirmed" && "Booking Confirmed"}

                    {bookingStatus === "rejected" && "Booking Rejected"}

                    {bookingStatus === "cancelled" && "Booking Cancelled"}
                  </h1>

                  <p className="text-[11px] text-white/60 mt-1">
                    {bookingStatus === "pending" &&
                      "Waiting for admin approval"}

                    {bookingStatus === "confirmed" &&
                      "Booking confirmed successfully"}

                    {bookingStatus === "rejected" && "Booking request rejected"}

                    {bookingStatus === "cancelled" && "Booking cancelled"}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* BOOKING ID */}
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-white/50">
                    Booking ID -
                  </span>

                  <span className="text-xs font-bold text-white">
                    {bookingId.current}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6">
            {/* WORKER */}
            <div className="border border-gray-100 rounded-3xl p-5">
              <div className="flex gap-4">
                <img
                  src={worker.photo}
                  alt={worker.name}
                  className="w-20 h-20 rounded-3xl object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-black text-xl text-[#0F172A]">
                        {worker.name}
                      </h2>

                      <p className="text-sm text-[#64748B] mt-1">
                        {worker.specialty}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />

                      <span className="font-bold">{worker.rating}</span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-emerald-600 font-semibold">
                    Worker Ready For Booking
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="mt-5 border border-gray-100 rounded-3xl p-5">
              <div className="text-xl font-black text-[#0F172A] mb-5">
                Booking Summary
              </div>

              <div className="space-y-4">
                <Detail label="Service" value={form.serviceType} />

                <Detail label="Description" value={form.description} />

                <Detail label="Date" value={formatDate(form.date)} />

                <Detail label="Time" value={form.time} />

                <Detail
                  label="Location"
                  value={[
                    form.address,
                    form.city,
                    form.district,
                    form.state,
                    form.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />

                <Detail label="Customer" value={form.name} />

                <Detail label="Phone" value={form.phone} />

                <Detail label="Email" value={form.email} />
              </div>
            </div>

            {/* PRICE */}
            <div className="mt-5 bg-[#0F172A] rounded-3xl p-6 text-white">
              <div className="space-y-3">
                <PriceRow label="Worker Charges" value={`₹${totalCost}`} />

                <PriceRow label="Platform Fee" value={`₹${serviceFee}`} />

                {materialsCost > 0 && (
                  <PriceRow label="Materials" value={`₹${materialsCost}`} />
                )}
              </div>

              <div className="h-px bg-white/10 my-5" />

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-white/70">Grand Total</div>

                  <div className="text-4xl font-black mt-1">₹{grandTotal}</div>
                </div>

                <div className="bg-[#FF5C39] px-4 py-2 rounded-2xl text-sm font-semibold">
                  {form.duration}
                  hr Work
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="mt-5 rounded-3xl bg-emerald-50 border border-emerald-100 p-5 flex gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />

              <div>
                <div className="font-bold text-emerald-700">
                  Secure Booking Protection
                </div>

                <div className="text-sm text-emerald-600 mt-1">
                  Payment protected by Workkerz.
                </div>
              </div>
            </div>

            {/* WHATSAPP */}
            <div className="mt-5 border border-gray-100 rounded-3xl p-5 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>

                  <div>
                    <div
                      className="font-bold text-[#0F172A] text-sm"
                      style={{ fontWeight: 800 }}
                    >
                      WhatsApp Auto Share
                    </div>

                    <div className="text-xs text-[#64748B] mt-0.5">
                      Booking receipt sent automatically
                    </div>
                  </div>
                </div>

                {waSent && (
                  <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-600 font-semibold whitespace-nowrap">
                    ✓ WhatsApp Opened
                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <Link
                href="/"
                className="h-12 rounded-2xl border border-gray-200 flex items-center justify-center gap-2 text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>

              <Link
                href="/browse"
                className="h-12 rounded-2xl bg-[#FF5C39] text-white flex items-center justify-center text-sm font-semibold"
              >
                Book Another
              </Link>
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
    <div className="flex justify-between gap-5 pb-4 border-b border-dashed border-gray-200">
      <span className="text-sm text-[#64748B]">{label}</span>

      <span className="text-sm font-bold text-right text-[#0F172A] max-w-[60%] wrap-break-word">
        {value || "—"}
      </span>
    </div>
  );
}

// PRICE ROW
function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/70">{label}</span>

      <span className="font-semibold">{value}</span>
    </div>
  );
}
