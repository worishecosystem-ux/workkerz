"use client";

import {
  Briefcase,
  CheckCircle,
  LayoutDashboard,
  Package,
  Users,
  XCircle,
} from "lucide-react";

type DashboardStatsProps = {
  totalWorkers: number;
  availableWorkers: number;
  totalShops: number;
  onlineShops: number;
  totalProducts: number;
  outOfStock: number;
  totalOrders: number;
};

export default function DashboardStats({
  totalWorkers,
  availableWorkers,
  totalShops,
  onlineShops,
  totalProducts,
  outOfStock,
  totalOrders,
}: DashboardStatsProps) {
  const statCards = [
    {
      label: "Total Workers",
      value: totalWorkers,
      sub: `${availableWorkers} available`,
      color: "#FF5C39",
      bg: "#FFF5F3",
      icon: Users,
    },
    {
      label: "Total Shops",
      value: totalShops,
      sub: `${onlineShops} online`,
      color: "#8B5CF6",
      bg: "#F5F3FF",
      icon: Briefcase,
    },
    {
      label: "Total Products",
      value: totalProducts,
      sub: `${outOfStock} out of stock`,
      color: "#0EA5E9",
      bg: "#F0F9FF",
      icon: Package,
    },
    {
      label: "Total Orders",
      value: totalOrders,
      sub: "Customer orders",
      color: "#10B981",
      bg: "#ECFDF5",
      icon: LayoutDashboard,
    },
    {
      label: "Available Workers",
      value: availableWorkers,
      sub: `${totalWorkers - availableWorkers} busy`,
      color: "#22C55E",
      bg: "#ECFDF5",
      icon: CheckCircle,
    },
    {
      label: "Out Of Stock",
      value: outOfStock,
      sub: "Products unavailable",
      color: "#EF4444",
      bg: "#FEF2F2",
      icon: XCircle,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 px-3 sm:gap-4 sm:px-4 md:grid-cols-3 md:px-8 lg:px-6 xl:grid-cols-3 2xl:grid-cols-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="min-w-0 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md sm:p-4 md:p-4"
          >
            {/* Top */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
                style={{
                  backgroundColor: stat.bg,
                }}
              >
                <Icon
                  className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                  style={{
                    color: stat.color,
                  }}
                />
              </div>

              <span className="truncate pt-1 text-[9px] font-medium text-[#94A3B8] sm:text-[10px]">
                Overview
              </span>
            </div>

            {/* Value */}
            <div className="text-[25px] font-black leading-none tracking-tight text-[#0F172A] sm:text-[30px]">
              {stat.value}
            </div>

            {/* Label */}
            <div className="mt-2 truncate text-[12px] font-bold text-[#0F172A] sm:text-sm">
              {stat.label}
            </div>

            {/* Sub */}
            <div className="mt-0.5 truncate text-[10px] text-[#94A3B8] sm:text-xs">
              {stat.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}