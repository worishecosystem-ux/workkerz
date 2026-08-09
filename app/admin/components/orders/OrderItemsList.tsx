"use client";

import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";

type Props = {
  items: any[];
};

export default function OrderItemsList({ items }: Props) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!items?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
        <ImageIcon className="mx-auto mb-2 h-6 w-6 text-slate-300" />

        <p className="text-xs font-semibold text-slate-600">
          No Products Found
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          This order has no products.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* HEADER */}
      <div className="grid grid-cols-12 items-center border-b border-slate-100 bg-slate-50 px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:px-4">
        <div className="col-span-6">Item</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Rate</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* ITEMS */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const qty = Number(item.qty || 0);
          const price = Number(item.price || 0);
          const total = price * qty;

          const image =
            item.product_image || "/placeholder-product.png";

          return (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center px-3 py-2.5 transition hover:bg-slate-50/70 sm:px-4"
            >
              {/* PRODUCT */}
              <div className="col-span-6 flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewImage(image)}
                  className="group relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-10 sm:w-10"
                >
                  <img
                    src={image}
                    alt={item.product_name || "Product"}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-110"
                  />
                </button>

                <div className="min-w-0">
                  <p className="break-words text-[11px] font-semibold leading-tight text-slate-900 sm:text-xs">
                    {item.product_name || "Unnamed Product"}
                  </p>

                  {item.unit && (
                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {item.unit}
                    </p>
                  )}
                </div>
              </div>

              {/* QTY */}
              <div className="col-span-2 text-center">
                <span className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 sm:text-xs">
                  ×{qty}
                </span>
              </div>

              {/* RATE */}
              <div className="col-span-2 text-right text-[10px] text-slate-500 sm:text-xs">
                ₹{price.toLocaleString("en-IN")}
              </div>

              {/* TOTAL */}
              <div className="col-span-2 text-right text-[10px] font-bold text-slate-900 sm:text-xs">
                ₹{total.toLocaleString("en-IN")}
              </div>
            </div>
          );
        })}
      </div>

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[92vw]">
            <img
              src={previewImage}
              alt="Product preview"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[92vw] rounded-xl bg-white object-contain shadow-2xl"
            />

            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition hover:bg-red-50 hover:text-red-600"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}