"use client";

import {
  ShoppingBag,
  Clock3,
  Truck,
  CheckCircle2,
  IndianRupee,
  Activity,
} from "lucide-react";

type Props = {
  orders: any[];
};

export default function OperationsDashboard({ orders }: Props) {
  const pending = orders.filter(
    (o) => o.status === "Pending"
  ).length;

  const confirmed = orders.filter(
    (o) => o.status === "Confirmed"
  ).length;

  const delivery = orders.filter(
    (o) => o.status === "Out For Delivery"
  ).length;

  const delivered = orders.filter(
    (o) => o.status === "Delivered"
  ).length;

  const revenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const cards = [
    {
      title: "New Orders",
      value: pending,
      icon: ShoppingBag,
      bg: "bg-red-50",
      color: "text-red-600",
    },
    {
      title: "Confirmed",
      value: confirmed,
      icon: Clock3,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "On Delivery",
      value: delivery,
      icon: Truck,
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
    {
      title: "Delivered",
      value: delivered,
      icon: CheckCircle2,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      title: "Revenue",
      value: `₹${revenue.toLocaleString()}`,
      icon: IndianRupee,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
  ];

 return (
  <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    {/* Header */}
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Operations
        </h2>

        <p className="text-[10px] text-slate-500">
          Live Order Overview
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1">
        <Activity className="h-3 w-3 animate-pulse text-green-600" />
        <span className="text-[10px] font-semibold text-green-700">
          LIVE
        </span>
      </div>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2 transition hover:border-slate-200"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${card.bg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[9px] font-medium leading-none text-slate-500">
                {card.title}
              </p>

              <p className="mt-1 text-sm font-bold leading-none text-slate-900">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
}