"use client";

import {
  Eye,
  CheckCircle2,
  User,
  Clock3,
  IndianRupee,
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
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-orange-300 hover:shadow-md">
    {/* Top */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
          <User className="h-4 w-4 text-orange-600" />
        </div>

        <div>
          <h3 className="text-sm font-semibold leading-none text-slate-900">
            {order.customer_name}
          </h3>

          <p className="mt-1 text-[11px] text-slate-500">
            #{order.order_number}
          </p>
        </div>
      </div>

      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
        NEW
      </span>
    </div>

    {/* Phone */}
    <p className="mt-2 truncate text-[11px] text-slate-500">
      {order.customer_phone}
    </p>

    {/* Amount + Time */}
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <IndianRupee className="h-3.5 w-3.5 text-green-600" />
        <span className="text-base font-bold text-green-600">
          {Number(order.total || 0).toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <Clock3 className="h-3 w-3" />
        Just now
      </div>
    </div>

    {/* Buttons */}
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => onConfirm(order.id, "Confirmed")}
        className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-green-600 text-xs font-semibold text-white transition hover:bg-green-700"
      >
        <CheckCircle2 className="h-4 w-4" />
        Accept
      </button>

      <button
        onClick={() => onView(order)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100"
      >
        <Eye className="h-4 w-4 text-slate-600" />
      </button>
    </div>
  </div>
);
}