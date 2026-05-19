"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  CheckCircle,
  Package,
  Truck,
  ArrowRight,
  Home,
  ShoppingBag,
  MessageCircle,
  Printer,
  Send,
  X,
  Briefcase,
} from "lucide-react";
import confetti from "canvas-confetti";

export function EAurixOrderConfirmed() {
  const fired = useRef(false);
  const autoSent = useRef(false);

  
  const orderId = useRef(
    `EAX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  );

  const [whatsappNum, setWhatsappNum] = useState("");
  const [waSent, setWaSent] = useState(false);

  const [state, setState] = useState<{
    form: Record<string, string>;
    cart: any[];
    cartTotal: number;
    delivery: number;
    tax: number;
    grandTotal: number;
    workerAddon?: {
      workerName: string;
      workerPhoto: string;
      workerSpecialty: string;
      workerRate: number;
      hours: number;
      cost: number;
    } | null;
  } | null>(null);

  useEffect(() => {
  if (!fired.current) {
    fired.current = true;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#0EA5E9", "#0284C7", "#38BDF8", "#BAE6FD", "#0F172A"],
    });
  }
}, []);

useEffect(() => {
  if (!state || autoSent.current) return;

  autoSent.current = true;

  const adminNumber = "918602190366";

  const msg = encodeURIComponent(buildWhatsAppMessage());

  // Small delay for smooth page load
  const timer = setTimeout(() => {
    window.open(
      `https://wa.me/${adminNumber}?text=${msg}`,
      "_blank"
    );

    setWaSent(true);

    setTimeout(() => {
      setWaSent(false);
    }, 4000);
  }, 1500);

  return () => clearTimeout(timer);
}, [state]);

useEffect(() => {
  const savedOrder = sessionStorage.getItem("eaurix-order");

  if (savedOrder) {
    setState(JSON.parse(savedOrder));
  }
}, []);

 if (state === undefined) {
  return null;
}

if (!state) {
  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-24 flex items-center justify-center">
      <div className="text-center">
        <h2
          className="text-[#0F172A] mb-2"
          style={{ fontWeight: 700 }}
        >
          No order found
        </h2>

        <Link
          href="/eaurix/shop"
          className="text-[#0EA5E9] text-sm"
        >
          Go Shopping
        </Link>
      </div>
    </div>
  );
}

  const { form, cart, cartTotal, delivery, tax, grandTotal, workerAddon } =
    state;
  const isExpress = form.deliveryOption === "express";
  const deliveryDays = isExpress ? "1 business day" : "3–5 business days";

  // ── WhatsApp ────────────────────────────────────────────────────────────────
  const buildWhatsAppMessage = () => {
  const itemLines = cart.map(
    (item: any, index: number) =>
      `┃ ${index + 1}. ${item.name}
┃ Qty: ${item.qty} × $${item.price}
┃ Total: $${(item.price * item.qty).toFixed(2)}`
  );

  const lines = [
    `╔══════════════════════╗`,
    `      🛒 *E-AURIX RECEIPT*`,
    `╚══════════════════════╝`,
    ``,
    `✅ *Your order has been confirmed!*`,
    ``,
    `🆔 *Order ID*`,
    `┃ ${orderId.current}`,
    ``,
    `👤 *Customer Details*`,
    `┃ ${form.name}`,
    `┃ ${form.phone}`,
    `┃ ${form.email}`,
    ``,
    `📍 *Delivery Address*`,
    `┃ ${form.address}`,
    `┃ ${form.city}, ${form.zip}`,
    ``,
    `🚚 *Delivery Type*`,
    `┃ ${isExpress ? "⚡ Express Delivery" : "📦 Standard Delivery"}`,
    `┃ ETA: ${deliveryDays}`,
    ``,
    `📦 *Ordered Items*`,
    `┃────────────────────`,
    ...itemLines,
    ``,

    workerAddon
      ? [
          `🔧 *Worker Add-On*`,
          `┃ ${workerAddon.workerName}`,
          `┃ ${workerAddon.workerSpecialty}`,
          `┃ ${workerAddon.hours} hour(s) × $${workerAddon.workerRate}/hr`,
          `┃ Total: $${workerAddon.cost.toFixed(2)}`,
          ``,
        ]
      : [],

    `💳 *Payment Summary*`,
    `┃────────────────────`,
    `┃ Subtotal : $${cartTotal.toFixed(2)}`,
    `┃ Delivery : ${
      delivery === 0 ? "FREE" : `$${delivery.toFixed(2)}`
    }`,
    `┃ Tax (8%) : $${tax.toFixed(2)}`,

    workerAddon
      ? `┃ Worker Add-On : $${workerAddon.cost.toFixed(2)}`
      : null,

    `┃────────────────────`,
    `┃ 💰 *Grand Total: $${grandTotal.toFixed(2)}*`,
    ``,
    `💳 Payment Method`,
    `┃ •••• •••• •••• ${
      form.cardNumber ? form.cardNumber.slice(-4) : "****"
    }`,
    ``,
    `✨ Thank you for shopping with`,
    `🚀 *E-Aurix by Workkerz*`,
    ``,
    `📲 Track your orders anytime`,
    `🛠️ Premium Materials • Fast Delivery • Trusted Workers`,
    ``,
    `══════════════════════`,
  ];

  return lines
    .flat()
    .filter(Boolean)
    .join("\n");
};

  const handleShareWhatsApp = () => {
  const adminNumber = "918602190366"; // India country code included

  const msg = encodeURIComponent(buildWhatsAppMessage());

  window.open(
    `https://wa.me/${adminNumber}?text=${msg}`,
    "_blank"
  );

  setWaSent(true);

  setTimeout(() => {
    setWaSent(false);
  }, 4000);
};




  const handlePrint = () => window.print();

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #order-receipt, #order-receipt * { visibility: visible !important; }
          #order-receipt { position: fixed; inset: 0; width: 100%; padding: 24px; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#F0F9FF] pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          {/* ── Receipt area ── */}
          <div id="order-receipt">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-sky-100">
                <CheckCircle className="w-10 h-10 text-[#0EA5E9]" />
              </div>
              <h1
                className="text-[#0F172A] mb-2"
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Order Confirmed! 🎉
              </h1>
              <p className="text-[#64748B]">
                Thank you, {form.name?.split(" ")[0]}! Your materials are on
                their way.
              </p>
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mt-4 shadow-sm">
                <span className="text-xs text-[#64748B]">Order ID:</span>
                <span
                  className="text-sm text-[#0F172A]"
                  style={{ fontWeight: 700 }}
                >
                  {orderId.current}
                </span>
              </div>
            </div>

            {/* Delivery Status Card */}
            <div className="bg-linear-to-r from-[#0F2744] to-[#0C3B5E] rounded-2xl p-6 mb-4 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#0EA5E9]/30 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#38BDF8]" />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {isExpress ? "⚡ Express Delivery" : "📦 Standard Delivery"}
                  </div>
                  <div className="text-sky-300 text-sm">
                    Estimated in {deliveryDays}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-white/10 rounded-xl text-sm">
                <Package className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                <div>
                  <div
                    className="text-white mb-0.5"
                    style={{ fontWeight: 600 }}
                  >
                    Delivering to
                  </div>
                  <div className="text-sky-200">
                    {form.address}, {form.city} {form.zip}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm">
              <h3 className="text-[#0F172A] mb-4" style={{ fontWeight: 700 }}>
                Order Items
              </h3>
              <div className="space-y-3 mb-5">
                {cart.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm text-[#0F172A] line-clamp-1"
                        style={{ fontWeight: 600 }}
                      >
                        {item.name}
                      </div>
                      <div className="text-xs text-[#94A3B8]">
                        {item.brand} · {item.qty} × ${item.price}
                      </div>
                    </div>
                    <div
                      className="text-sm text-[#0F172A]"
                      style={{ fontWeight: 700 }}
                    >
                      ${(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}

                {/* Worker Add-On row */}
                {workerAddon && (
                  <div className="flex items-center gap-3 py-2 border-t-2 border-dashed border-orange-200 mt-2 pt-4">
                    <img
                      src={workerAddon.workerPhoto}
                      alt={workerAddon.workerName}
                      className="w-10 h-10 rounded-xl object-cover border border-orange-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(workerAddon.workerName)}&background=f97316&color=fff`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm text-[#0F172A] line-clamp-1"
                        style={{ fontWeight: 600 }}
                      >
                        🔧 {workerAddon.workerName}
                        <span className="ml-2 text-xs text-[#FF5C39] bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">
                          Worker Add-On
                        </span>
                      </div>
                      <div className="text-xs text-[#94A3B8]">
                        {workerAddon.workerSpecialty} · {workerAddon.hours}h × $
                        {workerAddon.workerRate}/hr
                      </div>
                    </div>
                    <div
                      className="text-sm text-[#FF5C39]"
                      style={{ fontWeight: 700 }}
                    >
                      ${workerAddon.cost.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment breakdown */}
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Subtotal</span>
                  <span className="text-[#0F172A]">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Delivery</span>
                  {delivery === 0 ? (
                    <span
                      className="text-emerald-600"
                      style={{ fontWeight: 600 }}
                    >
                      FREE
                    </span>
                  ) : (
                    <span className="text-[#0F172A]">
                      ${delivery.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Tax (8%)</span>
                  <span className="text-[#0F172A]">${tax.toFixed(2)}</span>
                </div>
                {workerAddon && (
                  <div className="flex justify-between">
                    <span
                      className="text-[#FF5C39] flex items-center gap-1"
                      style={{ fontWeight: 600 }}
                    >
                      <Briefcase className="w-3 h-3" /> Worker Add-On (
                      {workerAddon.hours}h)
                    </span>
                    <span
                      className="text-[#FF5C39]"
                      style={{ fontWeight: 600 }}
                    >
                      ${workerAddon.cost.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-[#0F172A]" style={{ fontWeight: 700 }}>
                    Total Charged
                  </span>
                  <span
                    className="text-[#0EA5E9]"
                    style={{ fontWeight: 900, fontSize: "1.1rem" }}
                  >
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="text-xs text-[#94A3B8]">Payment Method</div>
                <div
                  className="text-sm text-[#0F172A] mt-0.5"
                  style={{ fontWeight: 500 }}
                >
                  •••• •••• ••••{" "}
                  {form.cardNumber ? form.cardNumber.slice(-4) : "****"}
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
              <h3 className="text-[#0F172A] mb-4" style={{ fontWeight: 700 }}>
                What Happens Next?
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    text: `A confirmation email has been sent to ${form.email}`,
                    done: true,
                  },
                  {
                    step: "2",
                    text: "E-Aurix warehouse picks and packs your order within 2 hours",
                    done: false,
                  },
                  {
                    step: "3",
                    text: `Your order ships and arrives in ${deliveryDays}`,
                    done: false,
                  },
                  {
                    step: "4",
                    text: "Rate your purchase and track future orders in My Orders",
                    done: false,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-[#0EA5E9]" : "bg-gray-100"}`}
                    >
                      {item.done ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span
                          className="text-xs text-gray-400"
                          style={{ fontWeight: 600 }}
                        >
                          {item.step}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#475569] pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* ── End receipt area ── */}

          {/* ── WhatsApp Share Panel ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <div
                    className="text-[#0F172A] text-sm"
                    style={{ fontWeight: 700 }}
                  >
                    Share on WhatsApp
                  </div>
                  <div className="text-[#64748B] text-xs">
                    Send order details to any number
                  </div>
                </div>
              </div>
              {waSent && (
                <span
                  className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
                  style={{ fontWeight: 600 }}
                >
                  ✓ Opened WhatsApp
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm select-none">
                  +
                </span>
                <input
                  type="tel"
                  value={whatsappNum}
                  onChange={(e) => setWhatsappNum(e.target.value)}
                  placeholder="1 234 567 8900  (with country code)"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl pl-7 pr-10 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#25D366] transition-colors"
                />
                {whatsappNum && (
                  <button
                    onClick={() => setWhatsappNum("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={handleShareWhatsApp}
                disabled={!whatsappNum.trim()}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0 ${
                  whatsappNum.trim()
                    ? "bg-[#25D366] hover:bg-[#1da851] text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                style={{ fontWeight: 600 }}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#475569] hover:bg-gray-50 py-3 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 500 }}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#475569] hover:bg-gray-50 py-3 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 500 }}
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <Link
              href="/browse"
              className="flex items-center justify-center gap-2 bg-[#FF5C39] hover:bg-[#e54e2e] text-white py-3 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              Book a Worker
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
