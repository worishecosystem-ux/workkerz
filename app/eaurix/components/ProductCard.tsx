"use client";

import { memo } from "react";
import Link from "next/link";
import { Store, ArrowRight, Package } from "lucide-react";
import { Product } from "@/app/data/products";

function ProductCard({
  product,
  shop,
}: {
  product: Product;
  shop?: {
    id: string;
    shop_name: string;
    status: string;
  };
}) {
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
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-linear-to-b from-white via-white to-slate-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg active:scale-[0.99]"
    >
      <div className="flex gap-3 p-3">
        {/* Left Image */}
        <div className="flex w-26.25 shrink-0 items-center justify-center">
          <div className="flex h-23.75 w-23.75 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 shadow-xs transition-colors duration-300 group-hover:bg-white">
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              draggable={false}
              className="h-16 w-20 object-contain transition duration-300 group-hover:scale-105 rounded-2xl"
              onError={(e) => {
                e.currentTarget.classList.add("hidden");
              }}
            />
          </div>
        </div>

        {/* Right Details */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="line-clamp-2 wrap-break-word text-[14px] font-semibold leading-5 text-slate-900">
              {product.name}
            </h3>

            <div className="mt-2 flex items-center gap-2">
              <Store size={13} className="text-emerald-600" />
              <span className="truncate text-xs text-slate-600">
                {shop?.shop_name ?? "Store"}
              </span>
            </div>

            {isOffline && (
              <span className="mt-2 inline-flex rounded bg-red-100 px-2 py-1 text-[10px] font-medium text-red-600">
                Store Offline
              </span>
            )}

            {isOutOfStock && (
              <span className="mt-2 inline-flex rounded bg-orange-100 px-2 py-1 text-[10px] font-medium text-orange-600">
                Out of Stock
              </span>
            )}
          </div>

          {/* Bottom */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] font-medium text-emerald-600">
              More Details
            </span>

            <div className="flex items-center gap-1 text-sm font-semibold text-slate-800 group-hover:text-emerald-600">
              View
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
export default memo(ProductCard);
