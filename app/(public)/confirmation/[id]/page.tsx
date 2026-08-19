"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  CheckCircle,
  ChevronRight,
  MapPin,
  MessageCircle,
  Home,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

export default function Confirmation() {
  const fired = useRef(false);
  const savedRef = useRef(false);
  const bookingId = useRef("");

  const [waSent, setWaSent] = useState(false);

  const [bookingStatus, setBookingStatus] = useState<
    "pending" | "confirmed" | "rejected" | "cancelled"
  >("pending");

  const [customerAddress, setCustomerAddress] = useState<any>(null);
  const [saving, setSaving] = useState(true);

  const [state, setState] = useState<{
    form: Record<string, any>;

    worker: {
      id: string;
      name: string;
      photo: string;
      specialty: string;
      rating: number;
      addressId?: string;
      pricingType: string;

      startingPrice: number;
      visitCharge: number;
      halfDayPrice: number;
      fullDayPrice: number;
      monthlyPrice: number;
    };

    addressId?: string;

    totalCost: number;

    // Kept for compatibility with existing booking-data.
    // It will NOT be added to total.
    serviceFee: number;

    materialsCost?: number;
    grandTotal: number;

    confirmedAt?: string;
    bookingId?: string;
  } | null>(null);

  // ============================================================
  // LOAD BOOKING DATA
  // ============================================================

  useEffect(() => {
    const saved = sessionStorage.getItem("booking-data");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      setState(parsed);

      bookingId.current =
        parsed.bookingId ||
        `WKZ-${Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase()}`;
    } catch (error) {
      console.error("BOOKING DATA PARSE ERROR:", error);
    }
  }, []);

  // ============================================================
  // CONFETTI
  // ============================================================

  useEffect(() => {
    if (fired.current) return;

    fired.current = true;

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#FF5C39", "#0F172A", "#FF9F7F", "#FED7CC"],
    });
  }, []);

  // ============================================================
  // LIVE STATUS CHECK
  // ============================================================

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
  }, [state]);

  // ============================================================
  // SAVE BOOKING
  // ============================================================

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
          addressId,
          totalCost,
          materialsCost = 0,
        } = state;

        // ======================================================
        // WORKER PACKAGE PRICE
        // ======================================================

        let packagePrice = 0;

        switch (form?.bookingType) {
          case "quick_service":
            packagePrice =
              Number(worker?.visitCharge) ||
              Number(worker?.startingPrice) ||
              0;
            break;

          case "half_day":
            packagePrice = Number(worker?.halfDayPrice) || 0;
            break;

          case "full_day":
            packagePrice = Number(worker?.fullDayPrice) || 0;
            break;

          case "monthly":
            packagePrice = Number(worker?.monthlyPrice) || 0;
            break;

          default:
            packagePrice = Number(totalCost) || 0;
        }

        // ======================================================
        // SERVICE CHARGE REMOVED
        // ======================================================

        const serviceFee = 0;

        // ======================================================
        // GRAND TOTAL
        //
        // Worker Fee + Materials
        // NO SERVICE FEE
        // ======================================================

        const finalTotal =
          Number(totalCost) + Number(materialsCost);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        // ======================================================
        // BOOKING DATA
        // ======================================================

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

          customer_name: form?.name || "",

          customer_phone: form?.phone || "",

          customer_email: user?.email || form?.email || "",

          address_id: addressId || null,

          notes: form?.notes || "",

          booking_type: form?.bookingType || "quick_service",

          package_price: packagePrice,

          selected_materials: form?.selectedMaterials || {},

          total_cost: Number(totalCost) || 0,

          // SERVICE FEE = 0
          service_fee: 0,

          materials_cost: Number(materialsCost) || 0,

          // GRAND TOTAL = WORKER + MATERIALS
          grand_total: finalTotal,
        };

        console.log("FINAL BOOKING DATA:", bookingData);
        console.log("SERVICE FEE:", 0);
        console.log("GRAND TOTAL:", finalTotal);

        // ======================================================
        // SAVE
        // ======================================================

        const { data, error } = await supabase
          .from("bookings")
          .insert([bookingData])
          .select()
          .single();

        if (error) {
          console.error("BOOKING SAVE ERROR:", error);

          alert("Booking save failed");

          return;
        }

        console.log("BOOKING SAVED:", data);

        // ======================================================
        // EMAIL
        // ======================================================

        try {
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

              // SERVICE FEE REMOVED
              serviceFee: 0,

              materialsCost,

              // FINAL TOTAL
              grandTotal: finalTotal,

              categoryMaterials: [],
            }),
          });

          console.log("EMAIL SENT");
        } catch (emailError) {
          console.error("EMAIL ERROR:", emailError);
        }
      } catch (error) {
        console.error("BOOKING SAVE FAILED:", error);
      } finally {
        setSaving(false);
      }
    };

    saveBooking();
  }, [state]);

  // ============================================================
  // LOAD CUSTOMER ADDRESS
  // ============================================================

  useEffect(() => {
    const loadAddress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) return;

      const { data, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_email", user.email)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("ADDRESS FETCH ERROR:", error);
        return;
      }

      setCustomerAddress(data);
    };

    loadAddress();
  }, []);

  // ============================================================
  // AUTO WHATSAPP
  // ============================================================

  useEffect(() => {
    if (!state) return;

    const timer = setTimeout(() => {
      const message = encodeURIComponent(buildWhatsAppMessage());

      window.open(
        `https://wa.me/918602190366?text=${message}`,
        "_blank"
      );

      setWaSent(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [state]);

  // ============================================================
  // LOADING
  // ============================================================

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#0F172A]">
            No Booking Found
          </h2>

          <Link
            href="/"
            className="mt-2 inline-block text-sm text-[#FF5C39]"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // STATE
  // ============================================================

  const {
    form,
    worker,
    totalCost = 0,
    materialsCost = 0,
  } = state;

  // ============================================================
  // FINAL GRAND TOTAL
  //
  // IMPORTANT:
  // SERVICE FEE IS NOT INCLUDED
  // ============================================================

  const grandTotal =
    Number(totalCost) + Number(materialsCost);

  // ============================================================
  // BOOKING TYPE
  // ============================================================

  const getBookingTypeLabel = () => {
    switch (form?.bookingType) {
      case "quick_service":
        return "⚡ Quick Service";

      case "half_day":
        return "🌤️ Half Day";

      case "full_day":
        return "☀️ Full Day";

      case "monthly":
        return "📅 Monthly";

      default:
        return "⚡ Quick Service";
    }
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";

    return new Date(
      dateStr + "T00:00:00"
    ).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================================================
  // WHATSAPP MESSAGE
  // ============================================================

  function buildWhatsAppMessage() {
    const materialLines =
      Array.isArray(form?.selectedMaterials)
        ? form.selectedMaterials.map(
            (item: any, index: number) =>
              `┃ ${index + 1}. ${item.name}
┃ Qty: ${item.qty || 1}
┃ Price: ₹${item.price || 0}
┃ Total: ₹${(
                (item.price || 0) *
                (item.qty || 1)
              ).toFixed(2)}`
          )
        : [];

    const lines = [
      `╔══════════════════════╗`,
      ` 🛠️ *WORKKERZ BOOKING*`,
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
      `┃ ${form.address || ""}`,
      `┃ ${form.city || ""}, ${form.state || ""}`,
      `┃ ${form.pincode || ""}`,
      ``,

      `📅 *Booking Schedule*`,
      `┃ Date: ${formatDate(form.date)}`,
      `┃ Time: ${form.time}`,
      `┃ Duration: ${form.duration} hour(s)`,
      ``,

      `🔧 *Service Type*`,
      `┃ ${form.serviceType}`,
      ``,

      form.description
        ? [
            `📝 *Description*`,
            `┃ ${form.description}`,
            ``,
          ]
        : [],

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

      // WORKER CHARGE
      `┃ Worker Charges : ₹${Number(
        totalCost
      ).toFixed(2)}`,

      // MATERIALS
      materialsCost > 0
        ? `┃ Materials Cost : ₹${Number(
            materialsCost
          ).toFixed(2)}`
        : null,

      // NO SERVICE CHARGE
      `┃ Service Charge : ₹0`,

      `┃────────────────────`,

      // FINAL TOTAL
      `┃ 💰 *Grand Total : ₹${Number(
        grandTotal
      ).toFixed(2)}*`,

      ``,

      `🛡️ *Booking Status*`,
      `┃ Pending Admin Approval`,
      ``,

      `🚀 Powered by Workkerz`,
      `👷 Trusted Workers • Fast Booking • Secure Platform`,
      ``,

      `══════════════════════`,
    ];

    return lines
      .flat()
      .filter(Boolean)
      .join("\n");
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28">
      <div className="space-y-2">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="sticky top-0 z-20 mt-12 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="h-1 bg-linear-to-r from-emerald-500 via-green-500 to-lime-400" />

          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-[15px] font-bold text-slate-900">
                    Booking
                  </h1>

                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    SUCCESSFULLY
                  </span>
                </div>

                <p className="mt-0.5 text-[12px] text-slate-500">
                  Your request has been submitted successfully.
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Booking ID
                </p>

                <p className="font-mono text-[13px] font-bold text-slate-900">
                  {bookingId.current}
                </p>
              </div>

              <div className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
                Saved
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="space-y-2">

          {/* WORKER */}

          <div className="rounded-2xl border border-emerald-100 bg-linear-to-r from-white to-emerald-50 p-3 shadow-sm">
            <div className="flex gap-3">
              <div className="relative">
                <img
                  src={worker.photo}
                  alt={worker.name}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-100"
                />

                <span className="absolute bottom-2 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-bold text-gray-900">
                      {worker.name}
                    </h2>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {worker.specialty}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded bg-green-600 px-2 py-0.5 text-[11px] font-medium text-white">
                    ⭐ {worker.rating}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
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

          {/* BOOKING DETAILS */}

          <div className="mt-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900">
                Booking Details
              </h3>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  bookingStatus === "confirmed"
                    ? "bg-emerald-100 text-emerald-700"
                    : bookingStatus === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : bookingStatus === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                }`}
              >
                {bookingStatus === "confirmed"
                  ? "CONFIRMED"
                  : bookingStatus === "pending"
                    ? "PENDING"
                    : bookingStatus === "rejected"
                      ? "REJECTED"
                      : "CANCELLED"}
              </span>
            </div>

            <div className="space-y-1.5">
              <MiniRow
                label="Service"
                value={form.serviceType}
              />

              <MiniRow
                label="Date"
                value={formatDate(form.date)}
              />

              <MiniRow
                label="Time"
                value={form.time}
              />

              <MiniRow
                label="Customer"
                value={form.name}
              />

              <MiniRow
                label="Phone"
                value={form.phone}
              />

              <MiniRow
                label="Description"
                value={form.description || "—"}
              />

              <MiniRow
                label="Notes"
                value={form.notes || "—"}
              />

              <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-2.5 py-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

                <p className="text-[11px] leading-4 text-slate-600">
                  {[
                    customerAddress?.house_no,
                    customerAddress?.address,
                    customerAddress?.landmark,
                    customerAddress?.city,
                    customerAddress?.district,
                    customerAddress?.state,
                    customerAddress?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Address not available"}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              PRICE
          ==================================================== */}

          <div className="mt-2 rounded-2xl bg-[#072566] p-3.5 text-white shadow-xl">
            <div>
              <PriceRow
                label="Worker Fee"
                value={`₹${Number(
                  totalCost
                ).toLocaleString("en-IN")}`}
              />

              {materialsCost > 0 && (
                <PriceRow
                  label="Materials"
                  value={`₹${Number(
                    materialsCost
                  ).toLocaleString("en-IN")}`}
                />
              )}
            </div>

            <div className="my-3 h-px bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-medium text-white/60">
                  Grand Total
                </span>

                <span className="text-[15px] font-bold text-white">
                  ₹
                  {Number(grandTotal).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="rounded-lg bg-white/10 px-2.5 py-1.5 backdrop-blur-sm">
                <p className="text-[11px] font-semibold leading-none text-white">
                  {getBookingTypeLabel()}
                </p>
              </div>
            </div>
          </div>

          {/* SECURITY */}

          <div className="mt-2 rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-white px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>

              <div className="leading-tight">
                <p className="text-[12px] font-semibold text-gray-900">
                  Workkerz Trust
                </p>

                <p className="text-[10px] text-gray-500">
                  Safe payments • Verified workers • Booking support
                </p>
              </div>
            </div>
          </div>

          {/* WHATSAPP */}

          {!waSent && (
            <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                </div>

                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    Booking Details sent to WhatsApp
                  </div>

                  <div className="mt-0.5 text-xs text-[#64748B]">
                    Booking receipt sent to Workkerz
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MOBILE BOTTOM BAR
      ======================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="border-t border-slate-200 bg-white/95 px-3 pt-4 pb-[calc(env(safe-area-inset-bottom)+10px)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition active:scale-95"
            >
              <Home className="h-5 w-5 text-slate-700" />
            </Link>

            <Link
              href="/browse"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition active:scale-[0.98]"
            >
              <span>Book Another Worker</span>

              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRICE ROW
// ============================================================

function PriceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] leading-none text-white/65">
        {label}
      </span>

      <span className="text-[13px] font-semibold leading-none text-white">
        {value}
      </span>
    </div>
  );
}

// ============================================================
// MINI ROW
// ============================================================

function MiniRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
      <span className="text-[11px] text-slate-500">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-[11px] font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}