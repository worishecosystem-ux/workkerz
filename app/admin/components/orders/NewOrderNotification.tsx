"use client";

import { Bell, X } from "lucide-react";

type Props = {
  order: any;
  onClose: () => void;
  onView: () => void;
};

export default function NewOrderNotification({
  order,
  onClose,
  onView,
}: Props) {
  if (!order) return null;

  return (
    <div className="fixed right-6 top-6 z-[999] w-96 overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-2xl">
      {/* Top Glow */}
      <div className="h-1 bg-linear-to-r from-orange-500 via-amber-400 to-orange-500" />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            {/* Animated Bell */}
            <div className="relative flex h-14 w-14 items-center justify-center">
              {/* Ring Effect */}
              <span className="absolute h-14 w-14 animate-ping rounded-full bg-orange-300/40" />

              <span className="absolute h-12 w-12 rounded-full bg-orange-100" />

              <Bell className="relative h-7 w-7 animate-bounce text-orange-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                🔔 New Order Received
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {order.customer_name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {order.order_number}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <button
          onClick={onView}
          className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          View Order
        </button>
      </div>
    </div>
  );
}