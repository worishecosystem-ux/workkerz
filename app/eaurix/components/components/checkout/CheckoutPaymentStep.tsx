"use client";
import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import EAurixOrderTermsModal from "./EAurixOrderTermsModal";
interface CheckoutPaymentStepProps {
  form: any;
  update: (field: string, value: string) => void;
  grandTotal: number;
}

export default function CheckoutPaymentStep({
  form,
  update,
  grandTotal,
}: CheckoutPaymentStepProps) {
  const termsAccepted = form.termsAccepted === "true";

  const advanceAmount = grandTotal * 0.5;
  const remainingAmount = grandTotal - advanceAmount;
  const [termsOpen, setTermsOpen] = useState(false);
  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  return (
    <div
      className="w-full space-y-3 pb-2"
      style={{
        paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {/* =====================================================
        HEADER
    ===================================================== */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
          <FileCheck2 className="h-4.5 w-4.5 text-emerald-600" />
        </div>

        <div className="min-w-0">
          <h2 className="text-[16px] font-extrabold leading-5 tracking-tight text-slate-900">
            Confirm Your Order
          </h2>

          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
            Review payment details before confirming
          </p>
        </div>
      </div>

      {/* =====================================================
        PAYMENT CARD
    ===================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
        {/* TOTAL */}
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-600 px-3.5 py-3 text-white">
          {/* Premium glow */}
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 left-8 h-20 w-20 rounded-full bg-cyan-300/10 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-100">
                Estimated Order Value
              </p>

              <p className="mt-1 text-[24px] font-black leading-6 tracking-tight">
                ₹{formatAmount(grandTotal)}
              </p>

              <p className="mt-0.5 text-[9px] leading-3 text-emerald-100/90">
                Final amount confirmed after verification
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-sm backdrop-blur-sm">
              <PackageCheck className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>

        {/* PAYMENT ROWS */}
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          {/* ADVANCE */}
          <div className="px-3.5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-extrabold leading-3.5 text-slate-900">
                  50% Advance
                </p>

                <p className="text-[9px] text-slate-400">Required</p>
              </div>
            </div>

            <p className="mt-2 text-[16px] font-black leading-4 text-emerald-600">
              ₹{formatAmount(advanceAmount)}
            </p>
          </div>

          {/* BALANCE */}
          <div className="px-3.5 py-3">
            <p className="text-[11px] font-extrabold leading-3.5 text-slate-700">
              Remaining 50%
            </p>

            <p className="mt-2 text-[16px] font-black leading-4 text-slate-800">
              ₹{formatAmount(remainingAmount)}
            </p>

            <p className="mt-1 text-[9px] text-slate-400">After advance</p>
          </div>
        </div>

        {/* PAYMENT NOTE */}
        <div className="flex items-center gap-2 border-t border-emerald-100 bg-emerald-50/70 px-3.5 py-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />

          <p className="text-[9px] font-semibold leading-3.5 text-emerald-800">
            50% advance payment is required after order confirmation.
          </p>
        </div>
      </section>

      {/* =====================================================
        HOW IT WORKS
    ===================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-3.5 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>

          <div>
            <h3 className="text-[12px] font-extrabold leading-4 text-slate-900">
              How It Works
            </h3>

            <p className="text-[9px] text-slate-400">Simple 3-step process</p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 px-1 py-2.5">
          <MiniProcess
            number="1"
            icon={<Headphones className="h-4 w-4" />}
            title="Review"
          />

          <MiniProcess
            number="2"
            icon={<CheckCircle2 className="h-4 w-4" />}
            title="Confirm"
          />

          <MiniProcess
            number="3"
            icon={<Truck className="h-4 w-4" />}
            title="Delivery"
          />
        </div>
      </section>

      {/* =====================================================
        CONTACT + IMPORTANT
    ===================================================== */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* CONTACT */}
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white bg-white shadow-sm">
            <Headphones className="h-4 w-4 text-emerald-600" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-extrabold text-emerald-900">
              E-Aurix Team
            </p>

            <p className="mt-0.5 text-[8px] leading-3 text-emerald-900/60">
              We'll call after submission
            </p>
          </div>
        </div>

        {/* IMPORTANT */}
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white bg-white shadow-sm">
            <Clock3 className="h-4 w-4 text-amber-600" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-extrabold text-amber-800">
              Important
            </p>

            <p className="mt-0.5 text-[8px] leading-3 text-amber-900/65">
              Final price confirmed before processing
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
        TERMS
    ===================================================== */}
      <section
        className={`rounded-2xl border px-3 py-3 shadow-sm transition-colors ${
          termsAccepted
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-slate-200 bg-white"
        }`}
      >
        <label className="flex cursor-pointer items-center gap-2.5">
          {/* CHECKBOX */}
          <div className="relative h-5 w-5 shrink-0">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) =>
                update("termsAccepted", e.target.checked ? "true" : "false")
              }
              className="peer absolute inset-0 z-10 h-5 w-5 cursor-pointer opacity-0"
            />

            <div
              className="
              flex h-5 w-5 items-center justify-center
              rounded-[6px]
              border-[2px] border-slate-300
              bg-white
              transition-all
              peer-checked:border-emerald-600
              peer-checked:bg-emerald-600
              peer-focus-visible:ring-2
              peer-focus-visible:ring-emerald-200
            "
            >
              {termsAccepted && (
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />
              )}
            </div>
          </div>

          <span className="text-[11px] leading-4.5 text-slate-600">
            I agree to the{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTermsOpen(true);
              }}
              className="font-bold text-[11px] text-emerald-700 underline underline-offset-2"
            >
              Terms & Conditions
            </button>{" "}
            and confirm my information is correct.
          </span>
        </label>

        {/* STATUS */}
        <div
          className={`mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${
            termsAccepted
              ? "bg-emerald-100/70 text-emerald-700"
              : "bg-slate-50 text-slate-500"
          }`}
        >
          {termsAccepted ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          )}

          <p className="text-[9px] font-semibold leading-3">
            {termsAccepted
              ? "Terms & Conditions accepted"
              : "Accept Terms & Conditions to continue"}
          </p>
        </div>
      </section>

      {/* =====================================================
        TRUST FEATURES
    ===================================================== */}
      <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <TrustItem
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Genuine"
          subtitle="Material"
        />

        <TrustItem
          icon={<Headphones className="h-4 w-4" />}
          title="Expert"
          subtitle="Support"
          border
        />

        <TrustItem
          icon={<Truck className="h-4 w-4" />}
          title="On-time"
          subtitle="Delivery"
        />
      </div>
      {/* =====================================================
    TERMS MODAL
===================================================== */}
      {termsOpen && (
        <EAurixOrderTermsModal onClose={() => setTermsOpen(false)} />
      )}
    </div>
  );
}

/* =========================================================
   MINI PROCESS
========================================================= */

function MiniProcess({
  number,
  icon,
  title,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white">
        {icon}

        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-black text-violet-700 shadow-sm">
          {number}
        </span>
      </div>

      <span className="text-[10px] font-extrabold text-slate-700">{title}</span>
    </div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  icon,
  title,
  subtitle,
  border = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  border?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 px-1.5 py-2.5 ${
        border ? "border-x border-slate-100" : ""
      }`}
    >
      <div className="text-violet-600">{icon}</div>

      <span className="text-[9px] font-bold leading-3 text-slate-600">
        {title}
        <br />
        {subtitle}
      </span>
    </div>
  );
}
