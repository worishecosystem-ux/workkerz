"use client";

import React from "react";
import {
  CheckCircle2,
  Gift,
  MapPin,
  CalendarDays,
  Clock3,
  ShieldCheck,
  ReceiptText,
  Tag,
} from "lucide-react";

interface BookingPaymentStepProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  paymentType?: "full" | "fee";
  setPaymentType?: React.Dispatch<React.SetStateAction<"full" | "fee">>;
  payableAmount?: number;
  grandTotal?: number;
  inp?: string;
  paymentActionRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  onPaymentSuccess?: (data: {
    bookingId: string;
    transactionId?: string;
    paymentId: string;
    status: "paid";
    verification: any;
  }) => void;
}

export default function BookingPaymentStep({ form }: BookingPaymentStepProps) {
  const serviceName =
    form?.serviceType ||
    form?.serviceName ||
    form?.service_type ||
    "Workkerz Service";

  const bookingId = String(
    form?.bookingId || form?.booking_id || form?.id || "Generated after confirmation",
  );

  const address = [
    form?.houseNo || form?.house_no,
    form?.address,
    form?.landmark,
    form?.city,
    form?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const bookingDate = form?.date || form?.booking_date || "";
  const bookingTime = form?.time || form?.booking_time || "";

  const formatDate = (value: string) => {
    if (!value) return "As selected";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-[#F6F8FB] pb-6 text-slate-900 sm:border sm:border-slate-100 sm:bg-white sm:p-5">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white px-4 py-4 sm:rounded-2xl sm:px-0 sm:py-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
          <Gift className="h-5 w-5 text-emerald-700" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-extrabold tracking-tight">
            Special Booking Offer
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Confirm your Workkerz booking with zero booking charge
          </p>
        </div>

        <span className="rounded-full bg-emerald-100 px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-700">
          FREE OFFER
        </span>
      </header>

      {/* Free offer banner */}
      <section className="relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-600 p-5 text-white shadow-[0_14px_32px_rgba(5,100,65,0.18)]">
        <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full border-[24px] border-white/[0.07]" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-white/[0.06]" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-200" />
              <span className="text-[10px] font-extrabold tracking-wide text-emerald-50">
                LIMITED TIME OFFER
              </span>
            </div>
            <span className="rounded-full bg-yellow-300 px-2.5 py-1 text-[10px] font-black text-emerald-950">
              100% OFF
            </span>
          </div>

          <p className="mt-5 text-xs font-semibold text-white/75">
            Booking confirmation charge
          </p>

          <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-2xl font-bold text-white/65 line-through decoration-red-300 decoration-[3px]">
              ₹19
            </span>
            <span className="text-[52px] font-black leading-none tracking-tight">
              ₹0
            </span>
            <span className="pb-1 text-sm font-extrabold text-yellow-200">
              FREE
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-200" />
            <div>
              <p className="text-xs font-extrabold">Booking charge waived</p>
              <p className="mt-0.5 text-[10px] leading-4 text-white/75">
                Pay ₹0 to submit your booking. No payment is required here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking details */}
      <section className="mt-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold">Booking details</h3>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            No payment required
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
            <ReceiptText className="h-5 w-5 text-slate-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Selected service
            </p>
            <p className="mt-1 break-words text-sm font-bold">{serviceName}</p>
            <p className="mt-1 break-all text-xs text-slate-400">
              Booking ID: {bookingId}
            </p>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-200" />

        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
            <MapPin className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Service location
            </p>
            <p className="mt-1 break-words text-xs font-medium leading-5 text-slate-700">
              {address || "Address selected during booking"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400">Date</p>
              <p className="mt-0.5 truncate text-xs font-bold">
                {formatDate(bookingDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3">
            <Clock3 className="h-4 w-4 shrink-0 text-slate-500" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400">Time</p>
              <p className="mt-0.5 truncate text-xs font-bold">
                {bookingTime || "As selected"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offer summary */}
      <section className="mt-3 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-extrabold">Offer summary</h3>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">Booking confirmation charge</span>
          <span className="text-sm font-semibold text-slate-400 line-through">
            ₹19.00
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700">
            Special offer discount
          </span>
          <span className="text-sm font-extrabold text-emerald-700">
            −₹19.00
          </span>
        </div>

        <div className="my-4 border-t border-dashed border-slate-200" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold">Booking charge payable</p>
            <p className="mt-1 text-[10px] text-slate-400">
              100% waived under this offer
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black tracking-tight text-emerald-700">
              ₹0
            </p>
            <p className="text-[10px] font-extrabold text-emerald-700">FREE</p>
          </div>
        </div>
      </section>

      {/* Note */}
      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <p className="text-[11px] leading-5 text-emerald-900">
          No booking or confirmation fee will be collected. Worker service
          charges, if applicable, remain separate and are based on the selected
          work and pricing.
        </p>
      </div>
    </div>
  );
}
