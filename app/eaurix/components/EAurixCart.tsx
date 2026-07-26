"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Minus,
  Plus,
  ShoppingCart,
  Package,
  Tag,
  ShoppingBag,
  ChevronLeft,
  X,
  Receipt,
  Package2,
  Truck,
  Wallet,
  TicketPercent,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { usePlatform } from "@/app/components/context/PlatformContext";

export function EAurixCart() {
  const { cart, updateQty, removeFromCart } = usePlatform();

  const router = useRouter();

  /* =========================================
     CALCULATIONS
  ========================================= */

  const subtotal = Number(
    cart.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2),
  );

  const delivery = subtotal > 2000 ? 0 : 80;

  const grandTotal = Number((subtotal + delivery).toFixed(2));
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  /* ========================================= */

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  /* =========================================
     EMPTY CART
  ========================================= */

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] pt-24 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-sky-200" />
          </div>

          <h2
            className="text-[#0F172A] mb-2 text-2xl"
            style={{
              fontWeight: 700,
            }}
          >
            Your cart is empty
          </h2>

          <p className="text-[#64748B] text-sm mb-6">
            Browse products and add items to cart.
          </p>

          <Link
            href="/eaurix"
            className="inline-flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3 rounded-xl text-sm transition-colors"
            style={{
              fontWeight: 600,
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN
  ========================================= */

  return (
    <div className="min-h-screen bg-sky-50 pt-18 sm:pt-20 pb-16">
      {/* HEADER */}
      <div
        className={`fixed inset-x-0 top-0 z-50 overflow-hidden border-b border-white/10 bg-linear-to-br from-sky-50 via-sky-100 to-cyan-200 shadow-xl transition-all duration-300 ${
          isScrolled ? "py-1" : "pt-10 pb-6"
        }`}
      >
        <div className="relative flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <h1
              className={`font-bold text-black transition-all duration-300 ${
                isScrolled
                  ? "opacity-0 -translate-y-2 scale-95"
                  : "opacity-100 translate-y-0 scale-100 text-[20px]"
              }`}
            >
              Shopping Cart
            </h1>
          </div>

          {cart.length > 0 && (
            <div
              className={`flex items-center gap-1.5 rounded-full border border-white/15 bg-black/10 px-3 py-1.5 backdrop-blur transition-all duration-300 ${
                isScrolled
                  ? "opacity-0 translate-y-2 scale-95"
                  : "opacity-100 translate-y-0 scale-100"
              }`}
            >
              <ShoppingBag className="h-4 w-4 text-black" />
              <span className="text-sm font-semibold text-black">
                {cart.length} Item{cart.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-10" />

      {/* CONTENT */}

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
          {/* CART ITEMS */}

          <div className="lg:col-span-2 space-y-3">
            {/* SHIPPING */}
            {subtotal < 2000 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 shrink-0 text-amber-600" />

                  <p className="flex-1 text-[13px] leading-5 text-amber-700">
                    Add{" "}
                    <span className="font-bold">
                      ₹{(2000 - subtotal).toFixed(2)}
                    </span>{" "}
                    more to unlock{" "}
                    <span className="font-semibold">FREE Delivery</span>
                  </p>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-300"
                    style={{
                      width: `${Math.min((subtotal / 2000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <Truck className="h-4 w-4 shrink-0 text-emerald-600" />

                <span className="text-[13px] font-semibold leading-5 text-emerald-700">
                  🎉 Free Delivery Unlocked
                </span>
              </div>
            )}

            {/* PRODUCTS */}

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-sky-50 px-3 py-2"
              >
                {/* Image */}
                <div
                  className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}45)`,
                  }}
                >
                  {/* Glass shine */}
                  <div className="absolute inset-0 bg-linear-to-br from-white/30 via-white/10 to-transparent" />

                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="relative z-10 h-[82%] w-[82%] object-contain rounded-xl"
                    />
                  ) : (
                    <span className="relative z-10 text-base font-bold text-white">
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                        {item.name}
                      </h3>

                      {item.unit?.trim() && (
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          ₹{item.price}/{item.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Qty */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="min-w-5 text-center text-xs font-bold">
                        {item.qty}
                      </span>

                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500 text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="ml-4 shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-900">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-1 shrink-0 rounded-full p-1 hover:bg-rose-50"
                >
                  <X className="h-4 w-4 text-rose-500" />
                </button>
              </div>
            ))}
            {/* CONTINUE SHOPPING */}

            <Link
              href="/eaurix/shop"
              className="inline-flex items-center gap-2 text-sm text-[#0EA5E9] hover:underline"
              style={{
                fontWeight: 600,
              }}
            >
              <Package className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* ORDER SUMMARY */}

          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 mb-10 mt-4">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 bg-linear-to-r from-sky-500 to-cyan-500 px-4 py-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  <Receipt className="h-5 w-5 text-white" />
                </div>

                <div className="flex items-center justify-between flex-1">
                  <h3 className="text-base font-extrabold text-white">
                    Order Summary
                  </h3>

                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {cart.reduce((s, c) => s + c.qty, 0)} Items
                  </span>
                </div>
              </div>

              <div className="p-4 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-sky-100 p-2">
                        <Package2 className="h-4 w-4 text-sky-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Subtotal
                          <span className="ml-1 text-xs font-medium text-slate-500">
                            ({cart.reduce((s, c) => s + c.qty, 0)} Items)
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="font-bold text-slate-900">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-100 p-2">
                        <Truck className="h-4 w-4 text-emerald-600" />
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          Delivery
                        </p>

                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Standard
                        </span>
                      </div>
                    </div>

                    {delivery === 0 ? (
                      <span className=" px-3 py-1 text-xs font-bold text-emerald-700">
                        FREE
                      </span>
                    ) : (
                      <span className="font-bold text-slate-900">
                        ₹{delivery.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Total */}

                <div className="my-5 rounded-2xl bg-linear-to-r from-slate-400 to-slate-600 px-4 py-2 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-emerald-400" />

                      <span className="font-medium">Total Payable</span>
                    </div>

                    <span className="text-2xl font-black not-only:">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                {/* Checkout */}

                {/* Trust */}

                <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 py-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />

                  <span className="text-xs font-semibold text-emerald-700">
                    100% Secure Payments • Fast Delivery
                  </span>
                </div>
                {/* Bottom Checkout Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                  <button
                    onClick={() => router.push("/eaurix/checkout")}
                    className="h-14 w-full rounded-2xl bg-black text-[15px] font-semibold text-white shadow-xl active:scale-[0.98]"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
