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
  const { cart, updateQty, removeFromCart, cartTotal } = usePlatform();
  const router = useRouter();

  const delivery = cartTotal > 100 ? 0 : 12.99;
  const tax = parseFloat((cartTotal * 0.08).toFixed(2));
  const grandTotal = parseFloat((cartTotal + delivery + tax).toFixed(2));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-sky-200" />
          </div>
          <h2
            className="text-[#0F172A] mb-2"
            style={{ fontWeight: 700, fontSize: "1.3rem" }}
          >
            Your cart is empty
          </h2>
          <p className="text-[#64748B] text-sm mb-6">
            Browse our products and add items to get started.
          </p>
          <Link
            href="/eaurix/shop"
            className="inline-flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3 rounded-xl text-sm transition-colors"
            style={{ fontWeight: 600 }}
          >
            <ShoppingCart className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-20 pb-16">
      {/* Header */}
      <div className="bg-linear-to-r from-[#0F2744] to-[#0C3B5E] py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-sky-300 mb-2">
            <Link href="/eaurix" className="hover:text-sky-100">
              E-Aurix
            </Link>
            <span>/</span>
            <span className="text-sky-100">Cart</span>
          </div>
          <h1
            className="text-white"
            style={{ fontWeight: 800, fontSize: "1.5rem" }}
          >
            Shopping Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Free shipping banner */}
            {cartTotal < 100 && (
              <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-sm">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-amber-700">
                  Add{" "}
                  <span style={{ fontWeight: 700 }}>
                    ${(100 - cartTotal).toFixed(2)}
                  </span>{" "}
                  more for free delivery!
                </span>
                <div className="ml-auto flex-1 max-w-24 bg-amber-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((cartTotal / 100) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {cartTotal >= 100 && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                <Truck className="w-4 h-4" />
                <span style={{ fontWeight: 600 }}>
                  You've unlocked free delivery! 🎉
                </span>
              </div>
            )}

            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4"
              >
                {/* PRODUCT IMAGE */}
                <div
                  className="
    relative
    w-24 h-24
    rounded-2xl
    overflow-hidden
    shrink-0
    p-2
  "
                  style={{
                    background: `linear-gradient(135deg, ${item.color}15, ${item.color}35)`,
                  }}
                >
                  <div
                    className="
      w-full h-full
      rounded-2xl
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
                        className="
          w-[92%]
          h-[92%]
          object-cover
          rounded-xl
        "
                      />
                    ) : (
                      <div className="text-white text-2xl font-bold">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10px] text-[#0EA5E9] mb-0.5"
                    style={{ fontWeight: 600, textTransform: "uppercase" }}
                  >
                    {item.brand}
                  </div>
                  <div
                    className="text-[#0F172A] text-sm line-clamp-2"
                    style={{ fontWeight: 600 }}
                  >
                    {item.name}
                  </div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">
                    {item.unit}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-[#64748B]" />
                  </button>
                  <span
                    className="w-8 text-center text-sm text-[#0F172A]"
                    style={{ fontWeight: 700 }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 rounded-lg bg-sky-50 hover:bg-sky-100 flex items-center justify-center border border-sky-200 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-[#0EA5E9]" />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <div className="text-[#0F172A]" style={{ fontWeight: 800 }}>
                    ₹{(item.price * item.qty).toFixed(2)}
                  </div>
                  <div className="text-[#94A3B8] text-xs">
                    ₹{item.price} each
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            ))}

            <Link
              href="/eaurix/shop"
              className="flex items-center gap-2 text-sm text-[#0EA5E9] hover:underline"
              style={{ fontWeight: 600 }}
            >
              <Package className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="text-[#0F172A] mb-4" style={{ fontWeight: 700 }}>
                Order Summary
              </h3>

              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">
                    Subtotal ({cart.reduce((s, c) => s + c.qty, 0)} items)
                  </span>
                  <span className="text-[#0F172A]" style={{ fontWeight: 600 }}>
                    ₹{cartTotal.toFixed(2)}
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
                    <span
                      className="text-[#0F172A]"
                      style={{ fontWeight: 600 }}
                    >
                      ₹{delivery.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Tax (8%)</span>
                  <span className="text-[#0F172A]" style={{ fontWeight: 600 }}>
                      ₹{delivery.toFixed(2)}
                    ₹{tax.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-b border-gray-100 mb-4">
                <span className="text-[#0F172A]" style={{ fontWeight: 700 }}>
                  Total
                </span>
                <span
                  className="text-[#0EA5E9]"
                  style={{ fontWeight: 900, fontSize: "1.3rem" }}
                >
                      ₹{delivery.toFixed(2)}
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Promo code */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 text-sm outline-none text-[#0F172A] placeholder-gray-400 bg-transparent"
                    />
                  </div>
                  <button
                    className="bg-gray-100 text-[#0F172A] px-3 rounded-xl text-sm hover:bg-gray-200 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <button
                onClick={() => router.push("/eaurix/checkout")}
                className="w-full flex items-center justify-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-sky-200"
                style={{ fontWeight: 700 }}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 mt-4">
                {["VISA", "MC", "AMEX", "PayPal"].map((m) => (
                  <span
                    key={m}
                    className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded"
                    style={{ fontWeight: 600 }}
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
