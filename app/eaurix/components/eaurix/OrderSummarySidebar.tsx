import { X, Trash2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  color: string;
  icon?: string;
}

interface WorkerAddon {
  worker: {
    name: string;
  };
  hours: number;
}

interface OrderSummarySidebarProps {
  cart: CartItem[];
  cartTotal: number;
  delivery: number;
  tax: number;
  grandTotal: number;
  step: number;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export default function OrderSummarySidebar({
  cart,
  cartTotal,
  delivery,
  tax,
  grandTotal,
  onClose,
  onRemove,
}: OrderSummarySidebarProps) {
  return (
    <>
      <div className="flex h-full flex-col pb-4">
        <div className="shrink-0 border-b border-slate-100 pb-2 mb-4">
          {/* Drag Handle */}
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>

                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                  {cart.reduce((s, c) => s + c.qty, 0)} Items
                </span>
              </div>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Review before checkout
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Inline Summary */}
          <div className="mt-3 flex items-center justify-between text-[12px]">
            <div>
              <span className="text-orange-400">Products</span>
              <span className="ml-2 font-semibold text-slate-900">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-red-500">Tax</span>
              <span className="ml-2 font-semibold text-slate-900">
                ₹{tax.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-slate-500">Delivery</span>
              <span className="ml-2 font-semibold text-emerald-600">
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-sm font-semibold text-slate-700">
              Grand Total
            </span>

            <span className="text-xl font-black text-slate-900">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Products */}
        {/* Products */}
        <div
          className={`pb-4 ${
            cart.length > 8 ? "max-h-105 overflow-y-auto" : ""
          }`}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {cart.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 px-3 py-2 ${
                  index !== cart.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                {/* Image */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                  }}
                >
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="h-7 w-7 object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-700">
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-900">
                    {item.name}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    {item.qty} × ₹{item.price}
                  </p>
                </div>

                {/* Price + Remove */}
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-900">
                    ₹{(item.price * item.qty).toFixed(0)}
                  </span>

                  <button
                    onClick={() => onRemove(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
