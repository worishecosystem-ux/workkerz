"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  MapPin,
  Truck,
  ArrowRight,
  Home,
  MessageCircle,
  Printer,
  Send,
  X,
  HardHat,
} from "lucide-react";
import confetti from "canvas-confetti";

export function EAurixOrderConfirmed() {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const fired = useRef(false);
  const autoSent = useRef(false);
  const [showOrderItems, setShowOrderItems] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [dbOrderId, setDbOrderId] = useState("");

  const whatsappNum = "918602190366";
  const [waSent, setWaSent] = useState(false);
  const fetchOrderItems = async () => {
    if (!dbOrderId) return;

    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", dbOrderId);

    if (error) {
      console.error(error);
      return;
    }

    setOrderItems(data || []);
  };

  useEffect(() => {
    if (dbOrderId) {
      fetchOrderItems();
    }
  }, [dbOrderId]);
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
      window.open(`https://wa.me/${adminNumber}?text=${msg}`, "_blank");

      setWaSent(true);

      setTimeout(() => {
        setWaSent(false);
      }, 4000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("eaurix-order");

    if (!savedOrder) return;

    const parsed = JSON.parse(savedOrder);

    setState(parsed);
    setOrderNumber(parsed.orderNumber);
    setDbOrderId(parsed.orderId);
  }, []);

  if (state === undefined) {
    return null;
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>
            No order found
          </h2>

          <Link href="/eaurix/shop" className="text-[#0EA5E9] text-sm">
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
┃ Qty: ${item.qty} × ₹${item.price}
┃ Total: ₹${(item.price * item.qty).toFixed(2)}`,
    );

    const lines = [
      `╔══════════════════════╗`,
      `      🛒 *E-AURIX RECEIPT*`,
      `╚══════════════════════╝`,
      ``,
      `✅ *Your order has been confirmed!*`,
      ``,
      `🆔 *Order ID*`,
      `┃ ${orderNumber}`,
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
            `┃ ${workerAddon.hours} hour(s) × ₹${workerAddon.workerRate}/hr`,
            `┃ Total: ₹${workerAddon.cost.toFixed(2)}`,
            ``,
          ]
        : [],

      `💳 *Payment Summary*`,
      `┃────────────────────`,
      `┃ Subtotal : ₹${cartTotal.toFixed(2)}`,
      `┃ Delivery : ${delivery === 0 ? "FREE" : `₹${delivery.toFixed(2)}`}`,
      `┃ Tax (8%) : ₹${tax.toFixed(2)}`,

      workerAddon ? `┃ Worker Add-On : ₹${workerAddon.cost.toFixed(2)}` : null,

      `┃────────────────────`,
      `┃ 💰 *Grand Total: ₹${grandTotal.toFixed(2)}*`,
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

    return lines.flat().filter(Boolean).join("\n");
  };

  const handleShareWhatsApp = () => {
    const message = `🛍️ *E-Aurix Order Confirmation*

Order ID: ${orderNumber}

Customer: ${form.name}
Phone: ${form.phone}

Total: ₹${grandTotal.toFixed(2)}

Track your order in the E-Aurix app.`;

    window.open(
      `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`,
      "_blank",
    );

    setWaSent(true);
  };

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

      <div className="min-h-screen bg-[#F0F9FF] pt-18 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* ── Receipt area ── */}
          <div id="order-receipt" className="pt-28">
            {/* Success Header */}
            <div className="fixed inset-x-0 top-0 z-100 border-b border-emerald-100 bg-white/95 backdrop-blur-xl shadow-sm">
              <div className="mx-auto max-w-2xl">
                {/* Order ID */}
                <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-4 py-3 pt-12">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Order ID
                    </p>

                    <p className="mt-0.5 text-sm font-bold tracking-wide text-slate-900">
                      #{orderNumber}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-600 px-4 py-1 text-[10px] font-semibold text-white">
                    Placed
                  </span>
                </div>

                {/* Success */}
                <div className="flex items-center gap-3 bg-white px-4 py-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="text-sm font-bold text-slate-900">
                      Order Confirmed
                    </h1>

                    <p className="mt-0.5 text-[11px] leading-4 text-slate-600">
                      Thank you,{" "}
                      <span className="font-semibold">
                        {form.name?.split(" ")[0]}
                      </span>
                      . Your order is being prepared.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                    <Truck className="h-5 w-5 text-sky-600" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isExpress ? "Express Delivery" : "Standard Delivery"}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Estimated delivery in {deliveryDays}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />

                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Delivery Address
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {form.address}, {form.city} {form.zip}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-xs font-semibold text-emerald-800">
                    What's next?
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-emerald-700">
                    Your order has been received successfully. The seller will
                    verify your payment and start preparing your materials.
                    You'll receive updates as your order progresses.
                  </p>
                </div>
              </div>
            </div>
            {/* Order Items */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-900">
                  Order Items ({orderItems.length})
                </p>
              </div>

              <div className="space-y-2">
                {orderItems.slice(0, 2).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-white p-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border bg-white">
                        <img
                          src={
                            item.product?.image ||
                            item.product_image ||
                            "/placeholder-product.png"
                          }
                          alt={item.product?.name || item.product_name}
                          className="h-8 w-8 object-contain"
                        />
                      </div>

                      <div>
                        <p className="line-clamp-1 text-xs font-semibold text-slate-900">
                          {item.product?.name || item.product_name}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-900">
                      ₹
                      {(
                        Number(item.price ?? 0) * Number(item.qty ?? 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {orderItems.length > 2 && (
                <button
                  onClick={() => setShowOrderItems(true)}
                  className="mt-3 w-full rounded-lg border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  View All ({orderItems.length} Items)
                </button>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm">
              {/* Bill Details */}
              <div className="border-t border-slate-200 bg-slate-50">
                <div className="px-4 py-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Bill Details
                  </h4>
                </div>

                <div className="space-y-3 px-4 pb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Items Total</span>
                    <span className="font-medium text-slate-900">
                      ₹{cartTotal.toFixed(2)}
                    </span>
                  </div>

                  {workerAddon && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Worker Add-On</span>

                      <span className="font-medium text-orange-600">
                        ₹{workerAddon.cost.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Delivery Charges</span>

                    {delivery === 0 ? (
                      <span className="font-semibold text-emerald-600">
                        FREE
                      </span>
                    ) : (
                      <span className="font-medium text-slate-900">
                        ₹{delivery.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Packaging Charges</span>

                    <span className="font-medium text-slate-900">₹0.00</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">GST (8%)</span>

                    <span className="font-medium text-slate-900">
                      ₹{tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Discount</span>

                    <span className="font-semibold text-emerald-600">
                      -₹0.00
                    </span>
                  </div>

                  <div className="border-t border-dashed border-slate-300 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">
                        Grand Total
                      </span>

                      <span className="text-xl font-extrabold text-emerald-600">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                          Payment Method
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          UPI Payment
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold text-emerald-700">
                      Order Summary
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-emerald-600">
                      {delivery === 0
                        ? "Congratulations! You received FREE delivery on this order."
                        : "Delivery charges have been included in your total amount."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Order Timeline
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Track what happens next
                </p>
              </div>

              <div className="px-4 py-2">
                {[
                  {
                    title: "Order Confirmed",
                    subtitle: `Confirmation sent to ${form.email}`,
                    done: true,
                  },
                  {
                    title: "Preparing Order",
                    subtitle: "Seller is packing your items",
                    done: false,
                  },
                  {
                    title: "Out for Delivery",
                    subtitle: `Expected in ${deliveryDays}`,
                    done: false,
                  },
                  {
                    title: "Delivered",
                    subtitle: "Rate your order after delivery",
                    done: false,
                  },
                ].map((item, index, arr) => (
                  <div
                    key={index}
                    className="relative flex gap-3 py-3 last:pb-1"
                  >
                    {/* Line */}
                    {index !== arr.length - 1 && (
                      <div className="absolute left-2.5 top-8 h-full w-px bg-slate-200" />
                    )}

                    {/* Icon */}
                    <div
                      className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        item.done
                          ? "bg-emerald-500"
                          : "border-2 border-slate-300 bg-white"
                      }`}
                    >
                      {item.done && (
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          item.done
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-700"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* ── End receipt area ── */}

          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm no-print">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Send Order to WhatsApp
                  </h3>

                  <p className="text-xs text-slate-500">8602190366</p>
                </div>
              </div>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1da851]"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl no-print">
            <div className="mx-auto max-w-5xl px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
              <div className="grid grid-cols-[72px_1fr] gap-2">
                {/* Home */}
                <Link
                  href="/"
                  className="flex h-12 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                >
                  <Home className="h-4 w-4" />
                  <span className="mt-0.5 text-[10px] font-medium">Home</span>
                </Link>

                {/* Book Worker */}
                <Link
                  href="/browse"
                  className="group flex h-12 items-center justify-between rounded-xl bg-linear-to-r from-emerald-600 via-emerald-500 to-green-500 px-3 shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-300 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                      <HardHat className="h-4.5 w-4.5 text-white" />
                    </div>

                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-white">
                        Book Worker
                      </p>

                      <p className="text-[10px] text-emerald-100">
                        Verified Professionals
                      </p>
                    </div>
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showOrderItems && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60"
          onClick={() => setShowOrderItems(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[75vh] rounded-t-3xl bg-white shadow-2xl p-4 pb-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-bold text-slate-900">
                Order Items ({orderItems.length})
              </h3>

              <button
                onClick={() => setShowOrderItems(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="max-h-[65vh] overflow-y-auto">
              {orderItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                >
                  {/* Image */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-white">
                    <img
                      src={item.product_image || "/placeholder-product.png"}
                      alt={item.product_name}
                      className="h-8 w-8 object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[13px] font-semibold text-slate-900">
                      {item.product_name}
                    </p>

                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Qty: {item.qty}</span>

                      {item.unit && (
                        <>
                          <span>•</span>
                          <span>{item.unit}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-emerald-600">
                      ₹
                      {(Number(item.price) * Number(item.qty)).toLocaleString()}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      ₹{Number(item.price).toLocaleString()}/unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
