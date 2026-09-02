"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarCheck2,
  Check,
  Clock3,
  FileText,
  Gift,
  HardHat,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";

import type React from "react";

interface BookingPaymentStepProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  paymentType: "fee" | "full";
  setPaymentType: React.Dispatch<React.SetStateAction<"fee" | "full">>;
  payableAmount: number;
  grandTotal: number;
  inp: string;
}

export default function BookingPaymentStep({
  form,
  setForm,
}: BookingPaymentStepProps) {
  const handleConfirm = () => {
    setForm((prev: any) => ({
      ...prev,
      bookingConfirmed: true,
      bookingRequestConfirmed: true,
    }));
  };

  const handlePrevious = () => {
    window.dispatchEvent(new CustomEvent("booking:previous-step"));
  };

  const handleContinue = () => {
    window.dispatchEvent(new CustomEvent("booking:continue"));
  };

  return (
    <div className="">
      {/* ====================================================
          CONTENT
      ====================================================== */}
      <div className="space-y-3.5 px-3.5 py-4">
        {/* ===================================================
            CONFIRM INTRO
        ==================================================== */}
        <section className="rounded-[20px] border border-[#edf0ee] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#f1edff] text-[#6d4aff]">
              <Clock3 className="h-4.75 w-4.75" />
            </div>

            <div className="min-w-0">
              <h1 className="text-[19px] font-extrabold leading-6 tracking-tight text-[#111827]">
                Confirm Your Worker Booking
                <span className="ml-1">🎉</span>
              </h1>

              <p className="mt-1 text-[12px] leading-4.5 text-[#667085]">
                Almost done! Just confirm your booking request.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            FREE BOOKING CARD
        ==================================================== */}
        <section className="overflow-hidden rounded-[20px] border border-[#d9eee0] bg-gradient-to-br from-[#f5fcf7] to-[#edf8f0] p-4">
          <div className="flex items-center gap-3.5">
            {/* FREE BADGE */}
            <div className="relative flex h-[94px] w-[94px] shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#0a9f4b] bg-white/60">
              <div className="text-center">
                <div className="text-[7px] font-bold tracking-[0.08em] text-[#087c3d]">
                  WORKER BOOKING
                </div>

                <div className="mt-0.5 text-[25px] font-black leading-none tracking-tight text-[#079744]">
                  FREE
                </div>
              </div>

              <div className="absolute -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#08a34f] text-white shadow-sm">
                <Gift className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* CONTENT */}
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-extrabold leading-5 text-[#078a42]">
                Worker Booking Bilkul FREE!
              </h2>

              <p className="mt-1 text-[11px] leading-4.25 text-[#344054]">
                Workkerz par worker booking ke liye aapse koi charge nahi liya
                jata.
              </p>

              <div className="mt-2 flex items-start gap-1.5 rounded-[10px] border border-[#d8ebdd] bg-white/70 px-2.5 py-1.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0a9f4b] text-white">
                  <Check className="h-2.5 w-2.5 stroke-3" />
                </span>

                <span className="text-[10px] font-medium leading-4 text-[#31543b]">
                  Aap sirf apne kaam ka payment worker ko karenge.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            BOOKING PROCESS
        ==================================================== */}
        <section className="rounded-[20px] border border-[#edf0ee] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f1edff] text-[#6d4aff]">
              <FileText className="h-4.5 w-4.5" />
            </div>

            <div>
              <h2 className="text-[16px] font-extrabold text-[#111827]">
                Booking Process
              </h2>

              <p className="text-[10px] text-[#98a2b3]">Simple & transparent</p>
            </div>
          </div>

          <div className="relative mt-4">
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-2.5 border-t border-dashed border-[#dce3df]" />

            <div className="relative grid grid-cols-4 gap-0.5">
              <ProcessStep
                number="1"
                icon={<Phone className="h-3.5 w-3.5" />}
                title="Request Send"
                description="Request bheji gayi."
              />

              <ProcessStep
                number="2"
                icon={<UserRound className="h-3.5 w-3.5" />}
                title="Worker Match"
                description="Best worker match."
              />

              <ProcessStep
                number="3"
                icon={<Phone className="h-3.5 w-3.5" />}
                title="Worker Confirm"
                description="Worker accept karega."
              />

              <ProcessStep
                number="4"
                icon={<HardHat className="h-3.5 w-3.5" />}
                title="Kaam Shuru"
                description="Kaam start hoga."
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            TRUST / BENEFITS
        ==================================================== */}
        <section className="rounded-[18px] border border-[#dceafe] bg-gradient-to-br from-[#f1f7ff] to-[#f7f9ff] p-3.5">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-extrabold text-[#1554a3]">
                Aap Khush, Hum Khush! 💜
              </h3>

              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                <Benefit text="Koi booking charge nahi" />
                <Benefit text="Trusted & Verified Workers" />
                <Benefit text="Best worker, best service" />
                <Benefit text="Safe, Fast & Reliable" />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            IMPORTANT NOTE
        ==================================================== */}
        <section className="rounded-[18px] border border-[#f4e6b8] bg-[#fffbeb] p-3.5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fef0c7] text-[#c58a00]">
              <Bell className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h3 className="text-[13px] font-extrabold text-[#1f2937]">
                Important Note
              </h3>

              <p className="mt-1 text-[11px] leading-[17px] text-[#667085]">
                Kaam complete hone ke baad aap directly worker ko payment
                karein.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =============================================================
   PROCESS STEP
============================================================= */

function ProcessStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative z-10 flex min-w-0 flex-col items-center text-center">
      {/* NUMBER */}
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#079d49] text-[8px] font-bold text-white">
        {number}
      </div>

      {/* ICON */}
      <div className="mt-1.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#dceee1] bg-[#f5fbf6] text-[#344054]">
        {icon}
      </div>

      {/* TITLE */}
      <h4 className="mt-1.5 line-clamp-2 px-0.5 text-[8.5px] font-extrabold leading-[11px] text-[#188342]">
        {title}
      </h4>

      {/* DESCRIPTION */}
      <p className="mt-0.5 line-clamp-2 max-w-[62px] text-[7px] leading-[10px] text-[#667085]">
        {description}
      </p>
    </div>
  );
}

/* =============================================================
   BENEFIT
============================================================= */

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white">
        <Check className="h-2 w-2 stroke-[3]" />
      </span>

      <span className="text-[9.5px] font-medium leading-[14px] text-[#1e3a6d]">
        {text}
      </span>
    </div>
  );
}
