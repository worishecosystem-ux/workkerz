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
      className="group block h-25 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg active:scale-[0.99]"
    >
      <div className="flex h-full gap-3 p-3">
        {/* Left Image */}
        <div className="flex w-24 shrink-0 items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              draggable={false}
              className="h-14 w-14 object-contain transition duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.classList.add("hidden");
              }}
            />
          </div>
        </div>

        {/* Right Details */}
        <div className="flex flex-1 flex-col justify-between overflow-hidden">
          <div>
            <h3 className="line-clamp-4 min-h-10 text-[14px] font-semibold leading-5 text-slate-900">
              {product.name}
            </h3>

            <div className=" flex items-center gap-2">
              <Store size={13} className="text-emerald-600" />
              <span className="truncate text-xs text-slate-600">
                {shop?.shop_name ?? "Store"}
              </span>
            </div>

            {isOffline && (
              <span className="mt-2 inline-flex rounded bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">
                Store Offline
              </span>
            )}

            {isOutOfStock && (
              <span className="mt-2 inline-flex rounded bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                Out of Stock
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600">
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
