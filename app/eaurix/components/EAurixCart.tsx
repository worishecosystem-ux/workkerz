"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Package,
  Truck,
  Tag,
} from "lucide-react";

import { usePlatform } from "@/app/components/context/PlatformContext";

export function EAurixCart() {
  const {
    cart,
    updateQty,
    removeFromCart,
  } = usePlatform();

  const router = useRouter();

  /* =========================================
     CALCULATIONS
  ========================================= */

  const subtotal = Number(
    cart
      .reduce(
        (total, item) =>
          total +
          item.price * item.qty,
        0,
      )
      .toFixed(2),
  );

  const delivery =
    subtotal > 100
      ? 0
      : 40;

  const grandTotal = Number(
    (
      subtotal +
      delivery
    ).toFixed(2),
  );

  /* ========================================= */

  const [mounted, setMounted] =
    useState(false);

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
            href="/eaurix/shop"
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
    <div className="min-h-screen bg-[#F0F9FF] pt-18 sm:pt-20 pb-16">
      {/* HEADER */}

      <div className="bg-linear-to-r from-[#0F2744] to-[#0C3B5E] py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-300 mb-2">
            <Link
              href="/eaurix"
              className="hover:text-sky-100"
            >
              E-Aurix
            </Link>

            <span>/</span>

            <span className="text-sky-100">
              Cart
            </span>
          </div>

          <h1
            className="text-white text-3xl sm:text-4xl"
            style={{
              fontWeight: 800,
            }}
          >
            Shopping Cart (
            {cart.length} item
            {cart.length !== 1
              ? "s"
              : ""}
            )
          </h1>
        </div>
      </div>

      {/* CONTENT */}

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
          {/* CART ITEMS */}

          <div className="lg:col-span-2 space-y-3">
            {/* SHIPPING */}

            {subtotal < 100 ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0" />

                  <span className="text-amber-700">
                    Add{" "}
                    <span className="font-bold">
                      ₹
                      {(
                        100 -
                        subtotal
                      ).toFixed(2)}
                    </span>{" "}
                    more for free
                    delivery
                  </span>
                </div>

                <div className="sm:ml-auto flex-1 w-full sm:max-w-24 bg-amber-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (subtotal /
                          100) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                <Truck className="w-4 h-4" />

                <span
                  style={{
                    fontWeight: 600,
                  }}
                >
                  You've unlocked
                  free delivery 🎉
                </span>
              </div>
            )}

            {/* PRODUCTS */}

            {cart.map((item) => (
              <div
                key={item.id}
                className="
                  bg-white
                  border border-gray-100
                  rounded-2xl
                  p-3
                  flex gap-3
                  items-center
                  shadow-sm
                "
              >
                {/* IMAGE */}

                <div
                  className="
                    w-20 h-20
                    rounded-2xl
                    overflow-hidden
                    shrink-0
                    p-1.5
                  "
                  style={{
                    background: `linear-gradient(135deg, ${item.color}15, ${item.color}35)`,
                  }}
                >
                  <div
                    className="
                      w-full h-full
                      rounded-xl
                      overflow-hidden
                      flex items-center justify-center
                    "
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, ${item.color}90)`,
                    }}
                  >
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="w-[92%] h-[92%] object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-white text-lg font-bold">
                        {item.name.charAt(
                          0,
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTENT */}

                <div className="flex-1 min-w-0">
                  {/* BRAND */}

                  <div
                    className="
                      text-[9px]
                      uppercase
                      text-[#0EA5E9]
                      truncate
                      mb-0.5
                    "
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {item.brand}
                  </div>

                  {/* NAME */}

                  <div
                    className="
                      text-[#0F172A]
                      text-sm
                      line-clamp-1
                    "
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {item.name}
                  </div>

                  {/* UNIT */}

                  <div className="text-[#94A3B8] text-[11px] mt-0.5">
                    {item.unit}
                  </div>

                  {/* BOTTOM */}

                  <div className="flex items-center justify-between mt-3 gap-2">
                    {/* QTY */}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateQty(
                            item.id,
                            item.qty -
                              1,
                          )
                        }
                        className="
                          w-7 h-7
                          rounded-lg
                          bg-gray-50
                          border border-gray-200
                          flex items-center justify-center
                        "
                      >
                        <Minus className="w-3 h-3 text-[#64748B]" />
                      </button>

                      <span className="w-6 text-center text-sm font-bold">
                        {item.qty}
                      </span>

                      <button
                        onClick={() =>
                          updateQty(
                            item.id,
                            item.qty +
                              1,
                          )
                        }
                        className="
                          w-7 h-7
                          rounded-lg
                          bg-sky-50
                          border border-sky-200
                          flex items-center justify-center
                        "
                      >
                        <Plus className="w-3 h-3 text-[#0EA5E9]" />
                      </button>
                    </div>

                    {/* PRICE */}

                    <div className="text-right">
                      <div className="text-[#0F172A] text-base font-black">
                        ₹
                        {(
                          item.price *
                          item.qty
                        ).toFixed(
                          2,
                        )}
                      </div>

                      <div className="text-[#94A3B8] text-[10px]">
                        ₹
                        {item.price} each
                      </div>
                    </div>
                  </div>
                </div>

                {/* REMOVE */}

                <button
                  onClick={() =>
                    removeFromCart(
                      item.id,
                    )
                  }
                  className="
                    w-8 h-8
                    rounded-lg
                    hover:bg-rose-50
                    flex items-center justify-center
                    shrink-0
                  "
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
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
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 lg:sticky lg:top-24">
              <h3
                className="text-[#0F172A] mb-5 text-xl"
                style={{
                  fontWeight: 800,
                }}
              >
                Order Summary
              </h3>

              {/* SUMMARY */}

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between gap-3">
                  <span className="text-[#64748B]">
                    Subtotal (
                    {cart.reduce(
                      (
                        s,
                        c,
                      ) =>
                        s +
                        c.qty,
                      0,
                    )}{" "}
                    items)
                  </span>

                  <span className="font-semibold text-[#0F172A]">
                    ₹
                    {subtotal.toFixed(
                      2,
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#64748B]">
                    Delivery
                  </span>

                  {delivery ===
                  0 ? (
                    <span className="font-semibold text-emerald-600">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-[#0F172A]">
                      ₹
                      {delivery.toFixed(
                        2,
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* TOTAL */}

              <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 mb-5">
                <span className="text-[#0F172A] text-lg font-bold">
                  Total
                </span>

                <span className="text-[#0EA5E9] text-2xl sm:text-3xl font-black">
                  ₹
                  {grandTotal.toFixed(
                    2,
                  )}
                </span>
              </div>

              {/* PROMO */}

              <div className="mb-5">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                    <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />

                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 text-sm outline-none bg-transparent"
                    />
                  </div>

                  <button className="bg-gray-100 text-[#0F172A] px-4 rounded-xl text-sm hover:bg-gray-200 transition-colors font-semibold">
                    Apply
                  </button>
                </div>
              </div>

              {/* CHECKOUT */}

              <button
                onClick={() =>
                  router.push(
                    "/eaurix/checkout",
                  )
                }
                className="w-full flex items-center justify-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-sky-200"
                style={{
                  fontWeight: 700,
                }}
              >
                Proceed to Checkout

                <ArrowRight className="w-4 h-4" />
              </button>

              {/* PAYMENTS */}

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-5">
                {[
                  "VISA",
                  "MC",
                  "AMEX",
                  "PayPal",
                ].map((m) => (
                  <span
                    key={m}
                    className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}