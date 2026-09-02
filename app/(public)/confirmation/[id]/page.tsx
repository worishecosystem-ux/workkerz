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

/* ============================================================
   BOOKING STATUS
============================================================ */

type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled";

/* ============================================================
   CUSTOMER ADDRESS
============================================================ */

type CustomerAddress = {
  house_no?: string | null;
  address?: string | null;
  landmark?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  address_type?: string | null;
};

/* ============================================================
   BOOKING PRICING
   SERVICE FEE REMOVED
============================================================ */

type BookingPricing = {
  totalCost: number;
  materialsCost: number;
  grandTotal: number;
};

/* ============================================================
   CONFIRMATION STATE
============================================================ */

type ConfirmationState = {
  form: Record<string, any>;

  worker: {
    id: string;
    name: string;
    photo: string;
    specialty: string;
    rating: number;

    pricingType?: string;

    startingPrice?: number;
    visitCharge?: number;
    halfDayPrice?: number;
    fullDayPrice?: number;
    monthlyPrice?: number;
  };

  selectedAddress?: CustomerAddress | null;

  bookingId?: string;
  bookingReference?: string;

  totalCost?: number;
  materialsCost?: number;
  grandTotal?: number;

  confirmedAt?: string;
};

/* ============================================================
   CONFIRMATION PAGE
============================================================ */

export default function Confirmation() {
  /* ==========================================================
     CONFETTI PROTECTION
  ========================================================== */

  const fired = useRef(false);

  /* ==========================================================
     BOOKING ID
  ========================================================== */

  const bookingId = useRef("");

  /* ==========================================================
     WHATSAPP OPEN PROTECTION

     This is extremely important.

     WhatsApp must NEVER open again when
     bookingPricing/status changes every 3 seconds.
  ========================================================== */

  const whatsappOpened = useRef(false);

  /* ==========================================================
     WHATSAPP SENT UI
  ========================================================== */

  const [waSent, setWaSent] = useState(false);

  /* ==========================================================
     BOOKING STATUS
  ========================================================== */

  const [bookingStatus, setBookingStatus] =
    useState<BookingStatus>("pending");

  /* ==========================================================
     ADDRESS
  ========================================================== */

  const [customerAddress, setCustomerAddress] =
    useState<CustomerAddress | null>(null);

  /* ==========================================================
     BOOKING STATE
  ========================================================== */

  const [state, setState] =
    useState<ConfirmationState | null>(null);

  /* ==========================================================
     PRICING

     SERVICE FEE REMOVED
  ========================================================== */

  const [bookingPricing, setBookingPricing] =
    useState<BookingPricing>({
      totalCost: 0,
      materialsCost: 0,
      grandTotal: 0,
    });

  /* ============================================================
     LOAD BOOKING DATA FROM SESSION
  ============================================================ */

  useEffect(() => {
    const saved =
      sessionStorage.getItem("booking-data");

    if (!saved) return;

    try {
      const parsed =
        JSON.parse(saved) as ConfirmationState;

      setState(parsed);

      /* =========================================
         PUBLIC WORKKERZ BOOKING REFERENCE

         Example:
         WRK-020926-001
      ========================================= */

      bookingId.current =
        parsed.bookingReference ||
        parsed.bookingId ||
        "";

      /* =========================================
         ADDRESS SNAPSHOT
      ========================================= */

      if (parsed.selectedAddress) {
        setCustomerAddress(
          parsed.selectedAddress,
        );
      } else if (parsed.form) {
        setCustomerAddress({
          house_no:
            parsed.form.houseNo || null,

          address:
            parsed.form.address || null,

          landmark:
            parsed.form.landmark || null,

          city:
            parsed.form.city || null,

          district:
            parsed.form.district || null,

          state:
            parsed.form.state || null,

          country:
            parsed.form.country || "India",

          pincode:
            parsed.form.pincode || null,

          address_type:
            parsed.form.addressType ||
            "home",
        });
      }

      /* =========================================
         TEMPORARY SESSION PRICING

         SERVICE FEE INTENTIONALLY NOT USED
      ========================================= */

      const sessionTotalCost =
        Number(
          parsed.totalCost || 0,
        );

      const sessionMaterialsCost =
        Number(
          parsed.materialsCost || 0,
        );

      setBookingPricing({
        totalCost:
          sessionTotalCost,

        materialsCost:
          sessionMaterialsCost,

        grandTotal:
          sessionTotalCost +
          sessionMaterialsCost,
      });
    } catch (error) {
      console.error(
        "BOOKING DATA PARSE ERROR:",
        error,
      );
    }
  }, []);

  /* ============================================================
     CONFETTI
  ============================================================ */

  useEffect(() => {
    if (fired.current) return;

    fired.current = true;

    confetti({
      particleCount: 120,
      spread: 90,
      origin: {
        y: 0.5,
      },
      colors: [
        "#FF5C39",
        "#0F172A",
        "#FF9F7F",
        "#FED7CC",
      ],
    });
  }, []);

  /* ============================================================
     LIVE BOOKING + PRICING CHECK

     IMPORTANT:
     service_fee is NOT selected.
  ============================================================ */

  useEffect(() => {
    if (!state?.bookingReference) {
      return;
    }

    const checkBooking =
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from("bookings")
          .select(
            `
              booking_status,
              total_cost,
              materials_cost,
              grand_total
            `,
          )
          .eq(
            "booking_id",
            state.bookingReference,
          )
          .maybeSingle();

        if (error) {
          console.error(
            "BOOKING FETCH ERROR:",
            error,
          );

          return;
        }

        if (!data) {
          console.warn(
            "BOOKING NOT FOUND:",
            state.bookingReference,
          );

          return;
        }

        /* =====================================
           STATUS
        ===================================== */

        if (data.booking_status) {
          setBookingStatus(
            data.booking_status as BookingStatus,
          );
        }

        /* =====================================
           ACTUAL DATABASE PRICING

           SERVICE CHARGE IGNORED
        ===================================== */

        const dbTotalCost =
          Number(
            data.total_cost || 0,
          );

        const dbMaterialsCost =
          Number(
            data.materials_cost || 0,
          );

        const calculatedGrandTotal =
          dbTotalCost +
          dbMaterialsCost;

        setBookingPricing({
          totalCost:
            dbTotalCost,

          materialsCost:
            dbMaterialsCost,

          grandTotal:
            calculatedGrandTotal,
        });
      };

    /* =========================================
       FETCH IMMEDIATELY
    ========================================= */

    void checkBooking();

    /* =========================================
       KEEP STATUS / PRICING UPDATED

       This DOES NOT trigger WhatsApp.
    ========================================= */

    const interval =
      window.setInterval(() => {
        void checkBooking();
      }, 3000);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    state?.bookingReference,
  ]);

  /* ============================================================
     AUTO WHATSAPP — ONLY ONCE

     IMPORTANT:
     DO NOT depend on bookingPricing.
     Pricing updates every 3 seconds.

     This effect waits until state is loaded,
     then opens WhatsApp exactly once.
  ============================================================ */

  useEffect(() => {
    if (!state) return;

    if (!bookingId.current) {
      return;
    }

    if (whatsappOpened.current) {
      return;
    }

    whatsappOpened.current = true;

    const timer =
      window.setTimeout(() => {
        const message =
          encodeURIComponent(
            buildWhatsAppMessage(
              state,
              bookingPricing,
              bookingId.current,
              customerAddress,
              bookingStatus,
            ),
          );

        window.open(
          `https://wa.me/918602190366?text=${message}`,
          "_blank",
        );

        setWaSent(true);
      }, 2500);

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [state]);

  /* ============================================================
     LOADING
  ============================================================ */

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

  /* ============================================================
     STATE
  ============================================================ */

  const {
    form,
    worker,
  } = state;

  /* ============================================================
     ACTUAL PRICES

     SERVICE FEE REMOVED
  ============================================================ */

  const totalCost =
    Number(
      bookingPricing.totalCost || 0,
    );

  const materialsCost =
    Number(
      bookingPricing.materialsCost || 0,
    );

  const grandTotal =
    totalCost +
    materialsCost;

  /* ============================================================
     BOOKING TYPE
  ============================================================ */

  const getBookingTypeLabel =
    () => {
      switch (
        form?.bookingType
      ) {
        case "quick_service":
          return "⚡ Quick Service";

        case "half_day":
          return "🌤️ Half Day";

        case "full_day":
          return "☀️ Full Day";

        case "monthly":
          return "📅 Monthly";

        case "visit_charge":
          return "📍 Visit Charge";

        default:
          return "⚡ Quick Service";
      }
    };

  /* ============================================================
     DATE
  ============================================================ */

  const formatDate = (
    dateStr: string,
  ) => {
    if (!dateStr) {
      return "—";
    }

    return new Date(
      `${dateStr}T00:00:00`,
    ).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );
  };

  /* ============================================================
     ADDRESS
  ============================================================ */

  const addressText = [
    customerAddress?.house_no,
    customerAddress?.address,
    customerAddress?.landmark,
    customerAddress?.city,
    customerAddress?.district,
    customerAddress?.state,
    customerAddress?.country,
    customerAddress?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  /* ============================================================
     UI
  ============================================================ */

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
                  {bookingId.current ||
                    "—"}
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

          {/* ====================================================
              WORKER
          ==================================================== */}

          <div className="rounded-2xl border border-emerald-100 bg-linear-to-r from-white to-emerald-50 p-3 shadow-sm">
            <div className="flex gap-3">
              <div className="relative">
                <img
                  src={
                    worker.photo
                  }
                  alt={
                    worker.name
                  }
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-100"
                />

                <span className="absolute bottom-2 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-bold text-gray-900">
                      {
                        worker.name
                      }
                    </h2>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {
                        worker.specialty
                      }
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded bg-green-600 px-2 py-0.5 text-[11px] font-medium text-white">
                    ⭐{" "}
                    {
                      worker.rating
                    }
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

          {/* ====================================================
              BOOKING DETAILS
          ==================================================== */}

          <div className="mt-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900">
                Booking Details
              </h3>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  bookingStatus ===
                  "confirmed"
                    ? "bg-emerald-100 text-emerald-700"
                    : bookingStatus ===
                      "pending"
                      ? "bg-amber-100 text-amber-700"
                      : bookingStatus ===
                        "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                }`}
              >
                {bookingStatus ===
                "confirmed"
                  ? "CONFIRMED"
                  : bookingStatus ===
                    "pending"
                    ? "PENDING"
                    : bookingStatus ===
                      "rejected"
                      ? "REJECTED"
                      : "CANCELLED"}
              </span>
            </div>

            <div className="space-y-1.5">
              <MiniRow
                label="Service"
                value={
                  form.serviceType ||
                  "—"
                }
              />

              <MiniRow
                label="Date"
                value={formatDate(
                  form.date,
                )}
              />

              <MiniRow
                label="Time"
                value={
                  form.time ||
                  "—"
                }
              />

              <MiniRow
                label="Customer"
                value={
                  form.name ||
                  "—"
                }
              />

              <MiniRow
                label="Phone"
                value={
                  form.phone ||
                  "—"
                }
              />

              <MiniRow
                label="Description"
                value={
                  form.description ||
                  "—"
                }
              />

              <MiniRow
                label="Notes"
                value={
                  form.notes ||
                  "—"
                }
              />

              {/* ADDRESS */}

              <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-2.5 py-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

                <p className="text-[11px] leading-4 text-slate-600">
                  {addressText ||
                    "Address not available"}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              PRICE
          ==================================================== */}

          <div className="mt-2 rounded-2xl bg-[#072566] p-3.5 text-white shadow-xl">
            <div>

              {/* WORKER FEE */}

              <PriceRow
                label="Worker Fee"
                value={`₹${Number(
                  totalCost,
                ).toLocaleString(
                  "en-IN",
                )}`}
              />

              {/* MATERIALS */}

              {materialsCost >
                0 && (
                <PriceRow
                  label="Materials"
                  value={`₹${Number(
                    materialsCost,
                  ).toLocaleString(
                    "en-IN",
                  )}`}
                />
              )}
            </div>

            <div className="my-3 h-px bg-white/10" />

            {/* GRAND TOTAL */}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-medium text-white/60">
                  Grand Total
                </span>

                <span className="text-[15px] font-bold text-white">
                  ₹
                  {Number(
                    grandTotal,
                  ).toLocaleString(
                    "en-IN",
                  )}
                </span>
              </div>

              <div className="rounded-lg bg-white/10 px-2.5 py-1.5 backdrop-blur-sm">
                <p className="text-[11px] font-semibold leading-none text-white">
                  {
                    getBookingTypeLabel()
                  }
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              SECURITY
          ==================================================== */}

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

          {/* ====================================================
              WHATSAPP STATUS
          ==================================================== */}

          {!waSent && (
            <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                </div>

                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    Booking Details
                  </div>

                  <div className="mt-0.5 text-xs text-[#64748B]">
                    Opening WhatsApp receipt...
                  </div>
                </div>
              </div>
            </div>
          )}

          {waSent && (
            <div className="mt-5 rounded-3xl border border-green-100 bg-green-50 p-5 shadow-sm">
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
              <span>
                Book Another Worker
              </span>

              <ChevronRight className="h-4 w-4" />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   WHATSAPP MESSAGE
   SERVICE CHARGE REMOVED
============================================================ */

function buildWhatsAppMessage(
  state: ConfirmationState,
  bookingPricing: BookingPricing,
  bookingReference: string,
  customerAddress: CustomerAddress | null,
  bookingStatus: BookingStatus,
) {
  const {
    form,
    worker,
  } = state;

  const totalCost =
    Number(
      bookingPricing.totalCost || 0,
    );

  const materialsCost =
    Number(
      bookingPricing.materialsCost || 0,
    );

  const grandTotal =
    totalCost +
    materialsCost;

  const selectedMaterials =
    Array.isArray(
      form?.selectedMaterials,
    )
      ? form.selectedMaterials
      : [];

  const materialLines =
    selectedMaterials.map(
      (
        item: any,
        index: number,
      ) =>
        `┃ ${index + 1}. ${
          item.name ||
          "Material"
        }
┃ Qty: ${
          item.qty || 1
        }
┃ Price: ₹${Number(
          item.price || 0,
        ).toFixed(2)}
┃ Total: ₹${(
          Number(
            item.price || 0,
          ) *
          Number(
            item.qty || 1,
          )
        ).toFixed(2)}`,
    );

  const addressText = [
    customerAddress?.house_no,
    customerAddress?.address,
    customerAddress?.landmark,
    customerAddress?.city,
    customerAddress?.district,
    customerAddress?.state,
    customerAddress?.country,
    customerAddress?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const formatDate = (
    dateStr: string,
  ) => {
    if (!dateStr) {
      return "—";
    }

    return new Date(
      `${dateStr}T00:00:00`,
    ).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );
  };

  const statusText =
    bookingStatus ===
    "confirmed"
      ? "Confirmed"
      : bookingStatus ===
        "rejected"
        ? "Rejected"
        : bookingStatus ===
          "cancelled"
          ? "Cancelled"
          : "Pending Admin Approval";

  const lines: any[] = [
    `╔══════════════════════╗`,
    ` 🛠️ *WORKKERZ BOOKING*`,
    `╚══════════════════════╝`,
    ``,

    `✅ *Booking Submitted Successfully!*`,
    ``,

    `🆔 *Booking ID*`,
    `┃ ${bookingReference}`,
    ``,

    `👷 *Worker Details*`,
    `┃ ${worker?.name || "—"}`,
    `┃ ${worker?.specialty || "—"}`,
    `┃ ⭐ ${worker?.rating || 0} Rating`,
    ``,

    `👤 *Customer Details*`,
    `┃ ${form?.name || "—"}`,
    `┃ ${form?.phone || "—"}`,
    `┃ ${form?.email || "—"}`,
    ``,

    `📍 *Service Address*`,
    `┃ ${
      addressText ||
      "Address not available"
    }`,
    ``,

    `📅 *Booking Schedule*`,
    `┃ Date: ${formatDate(
      form?.date,
    )}`,
    `┃ Time: ${
      form?.time || "—"
    }`,
    `┃ Duration: ${
      form?.duration ||
      "—"
    } hour(s)`,
    ``,

    `🔧 *Service Type*`,
    `┃ ${
      form?.serviceType ||
      "—"
    }`,
    ``,
  ];

  /* ==========================================================
     DESCRIPTION
  ========================================================== */

  if (
    form?.description
  ) {
    lines.push(
      `📝 *Description*`,
      `┃ ${form.description}`,
      ``,
    );
  }

  /* ==========================================================
     MATERIALS
  ========================================================== */

  if (
    materialLines.length >
    0
  ) {
    lines.push(
      `📦 *Selected Materials*`,
      `┃────────────────────`,
      ...materialLines,
      ``,
    );
  }

  /* ==========================================================
     PAYMENT

     NO SERVICE CHARGE
  ========================================================== */

  lines.push(
    `💳 *Payment Summary*`,
    `┃────────────────────`,

    `┃ Worker Charges : ₹${totalCost.toFixed(
      2,
    )}`,

    materialsCost > 0
      ? `┃ Materials Cost : ₹${materialsCost.toFixed(
          2,
        )}`
      : null,

    `┃────────────────────`,

    `┃ 💰 *Grand Total : ₹${grandTotal.toFixed(
      2,
    )}*`,

    ``,

    `🛡️ *Booking Status*`,
    `┃ ${statusText}`,
    ``,

    `🚀 Powered by Workkerz`,
    `👷 Trusted Workers • Fast Booking • Secure Platform`,
    ``,

    `══════════════════════`,
  );

  return lines
    .flat()
    .filter(Boolean)
    .join("\n");
}

/* ============================================================
   PRICE ROW
============================================================ */

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

/* ============================================================
   MINI ROW
============================================================ */

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