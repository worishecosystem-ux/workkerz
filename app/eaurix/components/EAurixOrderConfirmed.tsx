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
  Send,
  X,
  HardHat,
  ShieldCheck,
  Clock3,
  PackageCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

interface OrderState {
  form: Record<string, string>;
  cart: any[];
  cartTotal: number;
  delivery: number;
  tax: number;
  grandTotal: number;
  orderId?: string | number;
  orderNumber?: string;

  termsAccepted?: boolean;
  termsAcceptedAt?: string | null;

  workerAddon?: {
    workerName: string;
    workerPhoto: string;
    workerSpecialty: string;
    workerRate: number;
    hours: number;
    cost: number;
  } | null;
}

export function EAurixOrderConfirmed() {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const fired = useRef(false);
  const autoSent = useRef(false);

  const [showOrderItems, setShowOrderItems] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [dbOrderId, setDbOrderId] = useState("");
  const [waSent, setWaSent] = useState(false);

  const [state, setState] = useState<OrderState | null>(null);
  const [loading, setLoading] = useState(true);

  const whatsappNum = "918602190366";

  /* =========================================================
     FETCH ORDER ITEMS
  ========================================================= */

  const fetchOrderItems = async () => {
    if (!dbOrderId) return;

    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", dbOrderId);

    if (error) {
      console.error("Order Items Error:", error);
      return;
    }

    setOrderItems(data || []);
  };

  useEffect(() => {
    if (dbOrderId) {
      fetchOrderItems();
    }
  }, [dbOrderId]);

  /* =========================================================
     LOAD SAVED ORDER
  ========================================================= */

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("eaurix-order");

    if (!savedOrder) {
      setLoading(false);
      return;
    }

    try {
      const parsed: OrderState = JSON.parse(savedOrder);

      setState(parsed);
      setOrderNumber(parsed.orderNumber || "");
      setDbOrderId(String(parsed.orderId || ""));
    } catch (error) {
      console.error("Order Session Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     VERIFY TERMS FROM DATABASE
  ========================================================= */

  useEffect(() => {
    const verifySavedOrder = async () => {
      if (!dbOrderId) return;

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, terms_accepted, terms_accepted_at, payment_status, total",
        )
        .eq("id", dbOrderId)
        .maybeSingle();

      if (error) {
        console.error("Order Verification Error:", error);
        return;
      }

      if (!data) return;

      setState((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          termsAccepted: data.terms_accepted === true,
          termsAcceptedAt:
            data.terms_accepted_at || null,
        };
      });
    };

    verifySavedOrder();
  }, [dbOrderId]);

  /* =========================================================
     CONFETTI
  ========================================================= */

  useEffect(() => {
    if (!fired.current) {
      fired.current = true;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
        colors: [
          "#0EA5E9",
          "#0284C7",
          "#38BDF8",
          "#BAE6FD",
          "#0F172A",
        ],
      });
    }
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatAmount = (amount: number) =>
    Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  /* =========================================================
     WHATSAPP MESSAGE
  ========================================================= */

  const buildWhatsAppMessage = () => {
    if (!state) return "";

    const {
      form,
      cart,
      cartTotal,
      delivery,
      tax,
      grandTotal,
      workerAddon,
    } = state;

    const advanceAmount = grandTotal * 0.5;
    const remainingAmount = grandTotal - advanceAmount;

    const isExpress =
      form.deliveryOption === "express";

    const deliveryDays = isExpress
      ? "1 business day"
      : "3–5 business days";

    const itemLines = cart.map(
      (item: any, index: number) =>
        `┃ ${index + 1}. ${item.name}
┃ Qty: ${item.qty} × ₹${item.price}
┃ Total: ₹${(
          Number(item.price) * Number(item.qty)
        ).toFixed(2)}`,
    );

    const lines = [
      "╔══════════════════════╗",
      "      🛒 *E-AURIX RECEIPT*",
      "╚══════════════════════╝",
      "",

      "✅ *Your order has been confirmed!*",
      "",

      "🆔 *Order ID*",
      `┃ ${orderNumber}`,
      "",

      "👤 *Customer Details*",
      `┃ ${form.name}`,
      `┃ ${form.phone}`,
      `┃ ${form.email}`,
      "",

      "📍 *Delivery Address*",
      `┃ ${form.address}`,
      `┃ ${form.city}, ${form.zip}`,
      "",

      "🚚 *Delivery Type*",
      `┃ ${
        isExpress
          ? "⚡ Express Delivery"
          : "📦 Standard Delivery"
      }`,
      `┃ ETA: ${deliveryDays}`,
      "",

      "📦 *Ordered Items*",
      "┃────────────────────",
      ...itemLines,
      "",
    ];

    if (workerAddon) {
      lines.push(
        "🔧 *Worker Add-On*",
        `┃ ${workerAddon.workerName}`,
        `┃ ${workerAddon.workerSpecialty}`,
        `┃ ${workerAddon.hours} hour(s) × ₹${workerAddon.workerRate}/hr`,
        `┃ Total: ₹${workerAddon.cost.toFixed(2)}`,
        "",
      );
    }

    lines.push(
      "💳 *Payment Summary*",
      "┃────────────────────",
      `┃ Subtotal : ₹${cartTotal.toFixed(2)}`,
      `┃ Delivery : ${
        delivery === 0
          ? "FREE"
          : `₹${delivery.toFixed(2)}`
      }`,
      `┃ Tax (8%) : ₹${tax.toFixed(2)}`,
      "",
      `┃ Total : ₹${grandTotal.toFixed(2)}`,
      `┃ 50% Advance : ₹${advanceAmount.toFixed(2)}`,
      `┃ Remaining 50% : ₹${remainingAmount.toFixed(2)}`,
      "",
      "💳 Payment Status",
      "┃ Pending",
      "",
      "🛡️ Terms & Conditions",
      `┃ ${
        state.termsAccepted
          ? "Accepted"
          : "Not Accepted"
      }`,
      "",
      "✨ Thank you for shopping with",
      "🚀 *E-Aurix by Workkerz*",
      "",
      "📲 Track your orders anytime",
      "🛠️ Premium Materials • Fast Delivery • Trusted Workers",
      "",
      "══════════════════════",
    );

    return lines.join("\n");
  };

  /* =========================================================
     AUTO WHATSAPP
  ========================================================= */

  useEffect(() => {
    if (!state || autoSent.current) return;

    autoSent.current = true;

    const msg = encodeURIComponent(
      buildWhatsAppMessage(),
    );

    const timer = setTimeout(() => {
      window.open(
        `https://wa.me/${whatsappNum}?text=${msg}`,
        "_blank",
      );

      setWaSent(true);

      setTimeout(() => {
        setWaSent(false);
      }, 4000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [state]);

  /* =========================================================
     MANUAL WHATSAPP
  ========================================================= */

  const handleShareWhatsApp = () => {
    if (!state) return;

    const message = buildWhatsAppMessage();

    window.open(
      `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
        message,
      )}`,
      "_blank",
    );

    setWaSent(true);

    setTimeout(() => {
      setWaSent(false);
    }, 4000);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F9FF]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  /* =========================================================
     NO ORDER
  ========================================================= */

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F9FF] px-4">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-[#0F172A]">
            No order found
          </h2>

          <Link
            href="/eaurix"
            className="text-sm text-[#0EA5E9]"
          >
            Go Shopping
          </Link>
        </div>
      </div>
    );
  }

  const {
    form,
    cart,
    cartTotal,
    delivery,
    tax,
    grandTotal,
    workerAddon,
  } = state;

  const advanceAmount = grandTotal * 0.5;
  const remainingAmount =
    grandTotal - advanceAmount;

  const isExpress =
    form.deliveryOption === "express";

  const deliveryDays = isExpress
    ? "1 business day"
    : "3–5 business days";

  const termsAccepted =
    state.termsAccepted === true;

  return (
    <>
      {/* =====================================================
          PRINT STYLES
      ===================================================== */}

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #order-receipt,
          #order-receipt * {
            visibility: visible !important;
          }

          #order-receipt {
            position: fixed;
            inset: 0;
            width: 100%;
            padding: 24px;
            background: white;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#F0F9FF] pb-20 pt-18">
        <div className="mx-auto max-w-2xl px-3 sm:px-4">

          {/* =================================================
              RECEIPT
          ================================================= */}

          <div
            id="order-receipt"
            className="pt-28"
          >
            {/* =================================================
                STICKY SUCCESS HEADER
            ================================================= */}

            <div className="fixed inset-x-0 top-0 z-40 border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur-xl">
              <div className="mx-auto max-w-2xl">

                {/* ORDER ID */}

                <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-4 pb-3 pt-12">
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
                      Order ID
                    </p>

                    <p className="mt-0.5 text-sm font-bold tracking-wide text-slate-900">
                      #{orderNumber}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-[9px] font-semibold text-white">
                    Placed
                  </span>
                </div>

                {/* SUCCESS */}

                <div className="flex items-center gap-3 bg-white px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="text-sm font-bold text-slate-900">
                      Order Confirmed
                    </h1>

                    <p className="mt-0.5 text-[10px] leading-4 text-slate-600">
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

            {/* =================================================
                DELIVERY
            ================================================= */}

            <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100">
                    <Truck className="h-4 w-4 text-sky-600" />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {isExpress
                        ? "Express Delivery"
                        : "Standard Delivery"}
                    </h3>

                    <p className="text-[10px] text-slate-500">
                      Estimated delivery in{" "}
                      {deliveryDays}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-3.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900">
                      Delivery Address
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-600">
                      {form.address}, {form.city}{" "}
                      {form.zip}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2.5">
                  <p className="text-[10px] font-semibold text-emerald-800">
                    What's next?
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-emerald-700">
                    Your order has been received. The
                    seller will verify the order and
                    prepare your materials.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ORDER ITEMS
            ================================================= */}

            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-900">
                  Order Items ({orderItems.length})
                </p>
              </div>

              <div className="space-y-2">
                {orderItems
                  .slice(0, 2)
                  .map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-white p-2"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                          <img
                            src={
                              item.product_image ||
                              "/placeholder-product.png"
                            }
                            alt={
                              item.product_name ||
                              "Product"
                            }
                            className="h-7 w-7 object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-1 text-[10px] font-semibold text-slate-900">
                            {item.product_name}
                          </p>

                          <p className="text-[9px] text-slate-500">
                            Qty: {item.qty}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 text-[10px] font-semibold text-slate-900">
                        ₹
                        {(
                          Number(item.price || 0) *
                          Number(item.qty || 0)
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
              </div>

              {orderItems.length > 2 && (
                <button
                  onClick={() =>
                    setShowOrderItems(true)
                  }
                  className="mt-2.5 w-full rounded-lg border border-slate-300 bg-white py-2 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  View All ({orderItems.length} Items)
                </button>
              )}
            </div>

            {/* =================================================
                PAYMENT SUMMARY
            ================================================= */}

            <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                    <PackageCheck className="h-3.5 w-3.5 text-violet-700" />
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900">
                      Payment Summary
                    </h4>

                    <p className="text-[8px] text-slate-500">
                      50% advance payment structure
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 p-3.5">

                {/* ITEMS */}

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    Items Total
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>

                {/* WORKER */}

                {workerAddon && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">
                      Worker Add-On
                    </span>

                    <span className="font-medium text-orange-600">
                      ₹
                      {workerAddon.cost.toFixed(
                        2,
                      )}
                    </span>
                  </div>
                )}

                {/* DELIVERY */}

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    Delivery Charges
                  </span>

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

                {/* GST */}

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    GST (8%)
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹{tax.toFixed(2)}
                  </span>
                </div>

                {/* DISCOUNT */}

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    Discount
                  </span>

                  <span className="font-semibold text-emerald-600">
                    -₹0.00
                  </span>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      Grand Total
                    </span>

                    <span className="text-lg font-extrabold text-emerald-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* =================================================
                    50 / 50 PAYMENT
                ================================================= */}

                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-violet-100">

                  {/* ADVANCE */}

                  <div className="bg-violet-50 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-violet-700" />

                      <span className="text-[9px] font-bold text-violet-900">
                        50% Advance
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-black text-violet-700">
                      ₹{formatAmount(advanceAmount)}
                    </p>

                    <p className="text-[8px] text-violet-700/60">
                      Required
                    </p>
                  </div>

                  {/* REMAINING */}

                  <div className="border-l border-violet-100 bg-white p-2.5">
                    <span className="text-[9px] font-bold text-slate-700">
                      Remaining 50%
                    </span>

                    <p className="mt-1 text-sm font-black text-slate-700">
                      ₹
                      {formatAmount(
                        remainingAmount,
                      )}
                    </p>

                    <p className="text-[8px] text-slate-400">
                      After advance
                    </p>
                  </div>
                </div>

                {/* PAYMENT STATUS */}

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5">
                  <div>
                    <p className="text-[8px] uppercase tracking-wide text-slate-500">
                      Payment Method
                    </p>

                    <p className="mt-0.5 text-[11px] font-semibold text-slate-900">
                      UPI Payment
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-semibold text-amber-700">
                    Pending
                  </span>
                </div>

                {/* TERMS */}

                <div
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${
                    termsAccepted
                      ? "bg-emerald-50"
                      : "bg-amber-50"
                  }`}
                >
                  {termsAccepted ? (
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  )}

                  <div className="min-w-0">
                    <p
                      className={`text-[9px] font-bold ${
                        termsAccepted
                          ? "text-emerald-800"
                          : "text-amber-800"
                      }`}
                    >
                      {termsAccepted
                        ? "Terms & Conditions Accepted"
                        : "Terms & Conditions"}
                    </p>

                    {state.termsAcceptedAt && (
                      <p className="text-[7px] text-emerald-700/60">
                        Accepted on{" "}
                        {new Date(
                          state.termsAcceptedAt,
                        ).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>

                {/* DELIVERY SAVING */}

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <p className="text-[10px] font-semibold text-emerald-700">
                    Order Summary
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-emerald-600">
                    {delivery === 0
                      ? "Congratulations! You received FREE delivery on this order."
                      : "Delivery charges have been included in your total amount."}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ORDER TIMELINE
            ================================================= */}

            <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <h3 className="text-[11px] font-bold text-slate-900">
                  Order Timeline
                </h3>

                <p className="mt-0.5 text-[8px] text-slate-500">
                  Track what happens next
                </p>
              </div>

              <div className="px-3.5 py-1">
                {[
                  {
                    title: "Order Confirmed",
                    subtitle: `Confirmation sent to ${form.email}`,
                    done: true,
                  },
                  {
                    title: "Preparing Order",
                    subtitle:
                      "Seller is packing your items",
                    done: false,
                  },
                  {
                    title: "Out for Delivery",
                    subtitle: `Expected in ${deliveryDays}`,
                    done: false,
                  },
                  {
                    title: "Delivered",
                    subtitle:
                      "Rate your order after delivery",
                    done: false,
                  },
                ].map((item, index, arr) => (
                  <div
                    key={index}
                    className="relative flex gap-2.5 py-2.5 last:pb-1"
                  >
                    {index !== arr.length - 1 && (
                      <div className="absolute left-[9px] top-7 h-full w-px bg-slate-200" />
                    )}

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

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[10px] ${
                          item.done
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-700"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-[8px] leading-3.5 text-slate-500">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================
              WHATSAPP
          ================================================= */}

          <div className="no-print mb-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-[11px] font-semibold text-slate-900">
                    Send Order to WhatsApp
                  </h3>

                  <p className="text-[9px] text-slate-500">
                    8602190366
                  </p>
                </div>
              </div>

              <button
                onClick={handleShareWhatsApp}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#1da851]"
              >
                <Send className="h-3.5 w-3.5" />

                {waSent ? "Sent" : "Send"}
              </button>
            </div>
          </div>

          {/* =================================================
              BOTTOM ACTION BAR
          ================================================= */}

          <div className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl">
            <div
              className="mx-auto max-w-5xl px-3 py-2"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom) + 8px)",
              }}
            >
              <div className="grid grid-cols-[72px_1fr] gap-2">
                {/* HOME */}

                <Link
                  href="/"
                  className="flex h-12 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                >
                  <Home className="h-4 w-4" />

                  <span className="mt-0.5 text-[9px] font-medium">
                    Home
                  </span>
                </Link>

                {/* BOOK WORKER */}

                <Link
                  href="/browse"
                  className="group flex h-12 items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 px-3 shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                      <HardHat className="h-4 w-4 text-white" />
                    </div>

                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-white">
                        Book Worker
                      </p>

                      <p className="text-[9px] text-emerald-100">
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

      {/* =====================================================
          ALL ORDER ITEMS MODAL
      ===================================================== */}

      {showOrderItems && (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-black/60"
          onClick={() => setShowOrderItems(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[75vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Order Items ({orderItems.length})
                </h3>

                <p className="text-[9px] text-slate-500">
                  Your ordered materials
                </p>
              </div>

              <button
                onClick={() =>
                  setShowOrderItems(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* LIST */}

            <div className="max-h-[65vh] overflow-y-auto">
              {orderItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                >
                  {/* IMAGE */}

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white">
                    <img
                      src={
                        item.product_image ||
                        "/placeholder-product.png"
                      }
                      alt={
                        item.product_name ||
                        "Product"
                      }
                      className="h-7 w-7 object-contain"
                    />
                  </div>

                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[11px] font-semibold text-slate-900">
                      {item.product_name}
                    </p>

                    <div className="mt-0.5 flex items-center gap-2 text-[9px] text-slate-500">
                      <span>Qty: {item.qty}</span>

                      {item.unit && (
                        <>
                          <span>•</span>
                          <span>{item.unit}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* PRICE */}

                  <div className="text-right">
                    <p className="text-[11px] font-bold text-emerald-600">
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.qty || 0)
                      ).toLocaleString("en-IN")}
                    </p>

                    <p className="text-[8px] text-slate-400">
                      ₹
                      {Number(
                        item.price || 0,
                      ).toLocaleString("en-IN")}
                      /unit
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CLOSE */}

            <div className="border-t p-3">
              <button
                onClick={() =>
                  setShowOrderItems(false)
                }
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}