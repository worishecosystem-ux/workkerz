"use client";

import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";

type Props = {
  orders: any[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
};

export default function OrdersStats({
  orders,
  selectedStatus,
  onSelectStatus,
}: Props) {
  const totalOrders = orders.length;
  const pending = orders.filter((o) => o.status === "Pending").length;
  const delivery = orders.filter((o) => o.status === "Out For Delivery").length;
  const readyToDispatch = orders.filter(
    (o) => o.status === "Ready to Dispatch",
  ).length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;
  const cancelled = orders.filter((o) => o.status === "Cancelled").length;

  const revenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const cards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      status: "All",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      status: "Pending",
    },
    {
      title: "Out For Delivery",
      value: delivery,
      icon: Truck,
      color: "text-orange-600",
      bg: "bg-orange-50",
      status: "Out For Delivery",
    },
    {
      title: "Ready to Dispatch",
      value: readyToDispatch,
      icon: PackageCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      status: "Ready to Dispatch",
    },
    {
      title: "Delivered",
      value: delivered,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      status: "Delivered",
    },
    {
      title: "Cancelled",
      value: cancelled,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      status: "Cancelled",
    },
    {
      title: "Revenue",
      value: `₹${revenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      status: "",
    },
  ];

  return (
    <div className="grid w-full grid-cols-3 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((card) => {
        const Icon = card.icon;
        const active = card.status !== "" && selectedStatus === card.status;

        return (
          <button
            key={card.title}
            type="button"
            disabled={!card.status}
            onClick={() => card.status && onSelectStatus(card.status)}
            className={`flex min-w-0 items-center gap-1.5 rounded-lg border bg-white px-2 py-2 text-left transition ${
              active
                ? "border-orange-400 bg-orange-50"
                : "border-slate-100 hover:border-orange-200 hover:bg-slate-50"
            } ${!card.status ? "cursor-default" : "cursor-pointer"}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${card.bg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="whitespace-normal text-[8px] font-medium leading-tight text-slate-500 sm:text-[9px]">
                {card.title}
              </p>

              <p className="mt-0.5 whitespace-nowrap text-xs font-bold leading-tight text-slate-900 sm:text-sm">
                {card.value}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
