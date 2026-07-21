"use client";

import Link from "next/link";
import { Store, ArrowRight, Package } from "lucide-react";
import { Product } from "@/app/data/products";
import { useAdmin } from "@/app/components/context/AdminContext";

export default function ProductCard({ product }: { product: Product }) {
  const { shops } = useAdmin();

  const shop = shops.find((s) => s.id === product.shop_id);

  const isOffline = shop?.status !== "online";
  const isOutOfStock = product.is_active === false;

  const image =
    product.image ||
    `https://placehold.co/600x600/F8FAFC/64748B?text=${encodeURIComponent(
      product.name,
    )}`;

  return (
    <Link
      href={isOffline || isOutOfStock ? "#" : `/eaurix/product/${product.id}`}
      className="group block overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <div className="relative h-full w-full overflow-hidden bg-slate-100">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.classList.add("hidden");
                e.currentTarget.parentElement
                  ?.querySelector(".fallback")
                  ?.classList.remove("hidden");
              }}
            />
          )}

          <div
            className={`fallback absolute inset-0 flex items-center justify-center p-6 text-center ${product.image ? "hidden" : ""
              }`}
          >
            <h3 className="line-clamp-3 text-lg font-bold text-slate-700">
              {product.name}
            </h3>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 via-black/10 to-transparent" />

        {product.brand && (
          <div className="absolute right-3 top-3 flex items-start justify-between">
            {/* Price */}
            <div className="rounded-full bg-linear-to-r from-emerald-600 to-teal-500 px-3 py-1 shadow-lg shadow-emerald-500/30">
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-medium uppercase tracking-wide text-white">
                  Starting
                </span>
                <span className="text-[12px] font-black text-white">
                  ₹{product.price}
                </span>
              </div>
            </div>
          </div>
        )}
        {(isOffline || isOutOfStock) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
            <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white">
              {isOffline ? "Shop Offline" : "Out of Stock"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-[15px] font-bold leading-5 text-slate-900">
            {product.name}
          </h3>

          <div className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1">
            <Store size={10} className="text-emerald-600" />
            <span className="max-w-20 truncate text-[10px] font-semibold text-emerald-700">
              {shop?.shop_name ?? "Store"}
            </span>
          </div>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition group-hover:bg-emerald-600">
          <Package size={16} />
          View Product
          <ArrowRight size={16} />
        </button>
      </div>
    </Link>
  );
}
