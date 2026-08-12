"use client";

import {
  Activity,
  CheckCircle2,
  Clock3,
  IndianRupee,
  ShoppingBag,
  Truck,
} from "lucide-react";

type Props = {
  orders: any[];
};

export default function OperationsDashboard({ orders }: Props) {
  const pending = orders.filter((o) => o.status === "Pending").length;
  const confirmed = orders.filter((o) => o.status === "Confirmed").length;
  const delivery = orders.filter((o) => o.status === "Out For Delivery").length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;

  const revenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const cards = [
    ["New Orders", pending, ShoppingBag, "bg-red-50", "text-red-600"],
    ["Confirmed", confirmed, Clock3, "bg-blue-50", "text-blue-600"],
    ["On Delivery", delivery, Truck, "bg-orange-50", "text-orange-600"],
    ["Delivered", delivered, CheckCircle2, "bg-green-50", "text-green-600"],
    [
      "Revenue",
      `₹${revenue.toLocaleString("en-IN")}`,
      IndianRupee,
      "bg-emerald-50",
      "text-emerald-600",
    ],
  ] as const;

  return (
    <section className="mb-4 w-full rounded-lg border border-slate-100 bg-white p-2 shadow-sm sm:p-2.5">
      {/* HEADER */}
      <div className="mb-2 flex items-center justify-between px-0.5">
        <div>
          <p className="text-[10px] font-bold text-slate-800 sm:text-xs">
            Operations Dashboard
          </p>

          <p className="text-[8px] text-slate-400 sm:text-[9px]">
            Live Order Overview
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-1.5 py-0.5 text-[8px] font-bold text-green-600">
          <Activity className="h-2.5 w-2.5 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(([title, value, Icon, bg, color]) => (
          <div
            key={title}
            className="flex min-w-0 items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50/60 px-1.5 py-1.5"
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${bg}`}
            >
              <Icon className={`h-3 w-3 ${color}`} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="whitespace-nowrap text-[8px] font-medium leading-tight text-slate-500 sm:text-[9px]">
                {title}
              </p>

              <p className="mt-0.5 whitespace-nowrap text-[10px] font-bold leading-tight text-slate-800 sm:text-xs">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
