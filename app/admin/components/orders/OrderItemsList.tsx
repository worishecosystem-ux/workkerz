import { useState } from "react";
type Props = {
  items: any[];
};

export default function OrderItemsList({ items }: Props) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        No products found.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <div className="col-span-6">Item</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Rate</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 items-center px-3 py-2"
          >
            {/* Product */}
            <div className="col-span-6 flex min-w-0 items-center gap-2">
              <img
                src={item.product_image || "/placeholder-product.png"}
                alt={item.product_name}
                onClick={() =>
                  setPreviewImage(
                    item.product_image || "/placeholder-product.png",
                  )
                }
                className="h-8 w-8 cursor-zoom-in rounded-md border border-slate-200 bg-slate-50 object-cover transition hover:scale-110"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.product_name}
                </p>

                <p className="truncate text-[10px] text-slate-500">
                  {item.unit}
                </p>
              </div>
            </div>

            {/* Qty */}
            <div className="col-span-2 text-center text-sm font-semibold text-slate-700">
              ×{item.qty}
            </div>

            {/* Rate */}
            <div className="col-span-2 text-right text-sm text-slate-600">
              ₹{Number(item.price).toLocaleString()}
            </div>

            {/* Total */}
            <div className="col-span-2 text-right text-sm font-bold text-slate-900">
              ₹{Number(item.price * item.qty).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[85vw] rounded-2xl bg-white object-contain shadow-2xl"
          />

          <button
            onClick={() => setPreviewImage(null)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold shadow-lg"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
