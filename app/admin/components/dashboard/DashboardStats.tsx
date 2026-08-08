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
    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            {/* TOP */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: stat.bg,
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: stat.color,
                  }}
                />
              </div>

              <span className="text-xs text-[#64748B]">
                Total
              </span>
            </div>

            {/* VALUE */}
            <div
              className="text-[#0F172A]"
              style={{
                fontWeight: 900,
                fontSize: "2rem",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>

            {/* LABEL */}
            <div
              className="text-[#0F172A] text-sm mt-2"
              style={{
                fontWeight: 600,
              }}
            >
              {stat.label}
            </div>

            {/* SUB */}
            <div className="text-[#94A3B8] text-xs mt-0.5">
              {stat.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}