"use client";

import React, { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";

import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  WalletCards,
  Banknote,
  Info,
  X,
} from "lucide-react";

interface EAurixOrderTermsModalProps {
  onClose: () => void;
}

export default function EAurixOrderTermsModal({
  onClose,
}: EAurixOrderTermsModalProps) {
  /* =========================================================
     ANDROID PHYSICAL BACK
     ========================================================= */
  useEffect(() => {
    let listener: { remove: () => Promise<void> } | null = null;

    CapacitorApp.addListener("backButton", () => {
      onClose();
    }).then((handle) => {
      listener = handle;
    });

    return () => {
      listener?.remove();
    };
  }, [onClose]);

  /* =========================================================
     BODY SCROLL LOCK
     ========================================================= */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/45 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eaurix-terms-title"
    >
      {/* =====================================================
          MODAL
      ===================================================== */}
      <div className="relative flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-[#f7f8f6] shadow-2xl sm:h-[90vh] sm:max-w-2xl sm:rounded-[24px]">

        {/* ===================================================
            HEADER
        =================================================== */}
        <header className="relative z-20 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur">

          {/* Mobile drag indicator */}
          <div className="absolute left-1/2 top-1.5 h-1 w-9 -translate-x-1/2 rounded-full bg-slate-300 sm:hidden" />

          <div className="flex h-[60px] items-center gap-3 px-3.5">

            {/* BACK / CLOSE */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95 hover:bg-slate-50"
              aria-label="Close terms"
            >
              <ArrowLeft size={18} />
            </button>

            {/* TITLE */}
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                E-Aurix
              </p>

              <h1
                id="eaurix-terms-title"
                className="truncate text-[15px] font-black tracking-tight text-slate-900"
              >
                Order Terms & Conditions
              </h1>
            </div>

            {/* X */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition active:scale-95 hover:bg-slate-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>

          </div>
        </header>

        {/* ===================================================
            SCROLLABLE CONTENT
        =================================================== */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

          <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5 sm:py-6">

            {/* =================================================
                HERO
            ================================================= */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-4 py-4 text-white shadow-sm">

              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

              <div className="pointer-events-none absolute -bottom-10 left-10 h-20 w-20 rounded-full bg-cyan-300/10 blur-2xl" />

              <div className="relative flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <PackageCheck size={20} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-[17px] font-black leading-5 tracking-tight">
                    E-Aurix Order Terms
                  </h2>

                  <p className="mt-0.5 text-[10px] leading-4 text-emerald-50">
                    Order confirmation, advance payment & delivery
                  </p>
                </div>

              </div>
            </section>

            {/* =================================================
                QUICK SUMMARY
            ================================================= */}
            <section className="mt-3 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <SummaryItem
                icon={<CheckCircle2 size={15} />}
                title="Confirm"
                text="E-Aurix verifies"
              />

              <SummaryItem
                icon={<CreditCard size={15} />}
                title="50% Advance"
                text="After confirmation"
                border
              />

              <SummaryItem
                icon={<WalletCards size={15} />}
                title="50% Balance"
                text="After delivery"
              />

            </section>

            {/* =================================================
                ORDER FLOW
            ================================================= */}
            <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">

              <SectionHeading
                title="How Your Order Works"
                subtitle="Simple 6-step process"
              />

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">

                {[
                  ["01", "Place Order", "Submit your order"],
                  ["02", "Verification", "Team checks details"],
                  ["03", "Confirmation", "Order gets confirmed"],
                  ["04", "50% Advance", "Pay after confirmation"],
                  ["05", "Delivery", "Order is delivered"],
                  ["06", "Balance", "Pay remaining 50%"],
                ].map(([number, title, text]) => (
                  <div
                    key={number}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <div className="flex items-center gap-2">

                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[8px] font-black text-white">
                        {number}
                      </span>

                      <h3 className="text-[10px] font-extrabold text-slate-900">
                        {title}
                      </h3>

                    </div>

                    <p className="mt-2 text-[8px] leading-3.5 text-slate-400">
                      {text}
                    </p>
                  </div>
                ))}

              </div>
            </section>

            {/* =================================================
                PAYMENT TERMS
            ================================================= */}
            <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">

              <SectionHeading
                title="Payment Terms"
                subtitle="How your payment is handled"
              />

              <div className="mt-3 space-y-2">

                <RuleCard
                  icon={<CreditCard size={16} />}
                  title="50% Advance"
                  text="Pay 50% after E-Aurix confirms your order."
                />

                <RuleCard
                  icon={<WalletCards size={16} />}
                  title="Remaining 50%"
                  text="Pay the balance after successful delivery."
                />

                <RuleCard
                  icon={<ShieldCheck size={16} />}
                  title="Payment Details"
                  text="QR or merchant payment details will be provided by E-Aurix."
                />

              </div>
            </section>

            {/* =================================================
                COD
            ================================================= */}
            <section className="mt-3 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">

              <div className="flex items-center justify-between bg-amber-50 px-3.5 py-3">

                <div className="flex items-center gap-2.5">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Banknote size={16} />
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-amber-700">
                      Payment Option
                    </p>

                    <h3 className="text-[12px] font-black text-slate-900">
                      Cash on Delivery
                    </h3>
                  </div>

                </div>

                <div className="text-right">

                  <p className="text-[8px] text-slate-400">
                    Maximum
                  </p>

                  <p className="text-[17px] font-black text-amber-700">
                    ₹1,000
                  </p>

                </div>

              </div>

              <div className="px-3.5 py-3">

                <p className="text-[9px] leading-4 text-slate-500">
                  COD is available only for orders up to{" "}
                  <strong className="text-slate-800">
                    ₹1,000
                  </strong>
                  , subject to E-Aurix confirmation.
                </p>

                <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2">

                  <p className="text-[9px] font-semibold leading-4 text-amber-800">
                    Orders above ₹1,000 require 50% advance payment.
                  </p>

                </div>

              </div>
            </section>

            {/* =================================================
                ABOVE ₹1000
            ================================================= */}
            <section className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">

              <div className="flex gap-2.5">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Info size={16} />
                </div>

                <div className="min-w-0">

                  <h3 className="text-[10px] font-extrabold text-slate-900">
                    Orders Above ₹1,000
                  </h3>

                  <p className="mt-1 text-[8.5px] leading-4 text-slate-500">
                    50% advance payment is mandatory after confirmation.
                    The remaining amount is payable after delivery.
                  </p>

                </div>

              </div>
            </section>

            {/* =================================================
                BALANCE PAYMENT
            ================================================= */}
            <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">

              <SectionHeading
                title="Balance After Delivery"
                subtitle="Remaining amount can be paid either way"
              />

              <div className="mt-3 grid grid-cols-2 gap-2">

                <PaymentMethod
                  icon={<Banknote size={17} />}
                  title="Cash"
                  text="Pay at delivery"
                />

                <PaymentMethod
                  icon={<CreditCard size={17} />}
                  title="Online"
                  text="Pay digitally"
                />

              </div>
            </section>

            {/* =================================================
                IMPORTANT RULES
            ================================================= */}
            <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">

              <SectionHeading
                title="Important Rules"
                subtitle="Please read before placing your order"
              />

              <div className="mt-3 space-y-1.5">

                {[
                  "Order is confirmed only after E-Aurix verification.",
                  "50% advance is payable after confirmation.",
                  "Use only the QR or payment details provided by E-Aurix.",
                  "Orders above ₹1,000 require mandatory 50% advance.",
                  "COD is available only up to ₹1,000.",
                  "Remaining balance is payable after delivery.",
                  "Balance can be paid by cash or online.",
                  "Final price, availability and delivery details are confirmed by E-Aurix.",
                ].map((item, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2"
                  >

                    <CheckCircle2
                      size={13}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <p className="text-[8.5px] leading-3.5 text-slate-500">
                      {item}
                    </p>

                  </div>

                ))}

              </div>
            </section>

            {/* =================================================
                PAYMENT EXAMPLE
            ================================================= */}
            <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">

              <SectionHeading
                title="Payment Example"
                subtitle="Example for a ₹10,000 order"
              />

              <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">

                <AmountItem
                  label="Order"
                  amount="₹10,000"
                />

                <AmountItem
                  label="Advance"
                  amount="₹5,000"
                  border
                  green
                />

                <AmountItem
                  label="Balance"
                  amount="₹5,000"
                />

              </div>
            </section>

            {/* =================================================
                ACKNOWLEDGEMENT
            ================================================= */}
            <section className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5">

              <div className="flex gap-2.5">

                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>

                  <h3 className="text-[10px] font-extrabold text-emerald-900">
                    Order Terms Acknowledgement
                  </h3>

                  <p className="mt-1 text-[8.5px] leading-4 text-emerald-800/70">
                    By placing an order, you confirm that you have read
                    and understood the E-Aurix order, payment and COD terms.
                  </p>

                </div>

              </div>
            </section>

            <p className="pb-6 pt-4 text-center text-[8px] text-slate-400">
              E-Aurix • Order Terms & Conditions
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
  icon,
  title,
  text,
  border = false,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  border?: boolean;
}) {
  return (
    <div
      className={`px-2.5 py-3 ${
        border ? "border-x border-slate-100" : ""
      }`}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>

      <p className="mt-2 text-[10px] font-extrabold text-slate-900">
        {title}
      </p>

      <p className="mt-0.5 text-[8px] leading-3 text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-[13px] font-black tracking-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-0.5 text-[9px] leading-3.5 text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   RULE CARD
========================================================= */

function RuleCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">

        <h3 className="text-[10px] font-extrabold text-slate-900">
          {title}
        </h3>

        <p className="mt-0.5 text-[8.5px] leading-3.5 text-slate-400">
          {text}
        </p>

      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT METHOD
========================================================= */

function PaymentMethod({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
        {icon}
      </div>

      <h3 className="mt-2 text-[10px] font-extrabold text-slate-900">
        {title}
      </h3>

      <p className="mt-0.5 text-[8.5px] leading-3.5 text-slate-400">
        {text}
      </p>

    </div>
  );
}

/* =========================================================
   AMOUNT ITEM
========================================================= */

function AmountItem({
  label,
  amount,
  border = false,
  green = false,
}: {
  label: string;
  amount: string;
  border?: boolean;
  green?: boolean;
}) {
  return (
    <div
      className={`p-3 ${
        border ? "border-x border-slate-200" : ""
      }`}
    >
      <p className="text-[8px] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-[14px] font-black ${
          green ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {amount}
      </p>
    </div>
  );
}