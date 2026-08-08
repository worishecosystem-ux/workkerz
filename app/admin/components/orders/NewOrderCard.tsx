"use client";

import {
  Eye,
  CheckCircle2,
  User,
  Clock3,
  IndianRupee,
  ShoppingBag,
  CreditCard,
  MapPin,
} from "lucide-react";

type Props = {
  order: any;
  onView: (order: any) => void;
  onConfirm: (id: string, status: string) => void;
};

export default function NewOrderCard({
  order,
  onView,
  onConfirm,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Left Accent */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-500 to-red-500" />

      <div className="p-4">

        {/* Header */}
        <div className="flex items-start justify-between">

          <div className="flex gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
              <User className="h-6 w-6 text-orange-600" />
            </div>

            <div>
              <h3 className="text-[15px] font-bold text-slate-900">
                {order.customer_name}
              </h3>

              <p className="text-xs text-slate-500">
                #{order.order_number}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {order.customer_phone}
              </p>
            </div>

          </div>

          <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            NEW
          </span>

        </div>

        {/* Amount */}
        <div className="mt-4 flex items-center justify-between">

          <div>
            <p className="text-[11px] text-slate-500">
              Order Value
            </p>

            <div className="flex items-center">
              <IndianRupee className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-extrabold text-green-600">
                {Number(order.total || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-orange-50 px-3 py-2 text-center">
            <div className="flex items-center gap-1 text-orange-600">
              <Clock3 className="h-4 w-4" />
              <span className="text-xs font-semibold">
                Just Now
              </span>
            </div>
          </div>

        </div>

        {/* Chips */}

        <div className="mt-4 flex flex-wrap gap-2">

          <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium">
            <ShoppingBag className="h-3 w-3" />
            {order.items?.length || 1} Items
          </div>

          <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700">
            <CreditCard className="h-3 w-3" />
            {order.payment_method || "Cash"}
          </div>

          <div className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
            <MapPin className="h-3 w-3" />
            2.4 km
          </div>

        </div>

        {/* Buttons */}

        <div className="mt-5 flex gap-3">

          <button
            onClick={() => onConfirm(order.id, "Confirmed")}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-bold text-white transition hover:bg-green-700 active:scale-95"
          >
            <CheckCircle2 className="h-5 w-5" />
            Accept Order
          </button>

          <button
            onClick={() => onView(order)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100"
          >
            <Eye className="h-5 w-5 text-slate-700" />
          </button>

        </div>

      </div>
    </div>
  );
}