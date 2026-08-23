"use client";

import { ShoppingBag } from "lucide-react";
import NewOrderCard from "./NewOrderCard";

type DeviceType = "mobile" | "tablet" | "desktop";

type Props = {
  orders: any[];
  device: DeviceType;
  onView: (order: any) => void;
  onConfirm: (id: string | number, status: string) => void;
  onReject: (order: any) => void;
};

export default function NewOrdersBoard({ orders, device, onView, onConfirm, onReject }: Props) {
  const newOrders = orders.filter((order) => order.status === "Pending");

  const isMobile = device === "mobile";
  const isTablet = device === "tablet";
  const isDesktop = device === "desktop";

  return (
    <section className={`${isMobile ? "rounded-xl" : "rounded-2xl"} w-full min-w-0 overflow-hidden border border-slate-200 bg-white shadow-sm`}>
      {/* HEADER */}
      <div className={`${isMobile ? "px-3 py-3" : isTablet ? "px-4 py-3.5" : "px-5 py-4"} flex min-w-0 items-center justify-between border-b border-slate-100 bg-white`}>
        <div className={`${isMobile ? "gap-2" : isTablet ? "gap-2.5" : "gap-3"} flex min-w-0 items-center`}>
          <div className={`${isMobile ? "h-8 w-8 rounded-lg" : isTablet ? "h-9 w-9 rounded-xl" : "h-10 w-10 rounded-xl"} flex shrink-0 items-center justify-center bg-red-50`}>
            <ShoppingBag className={`${isMobile ? "h-4 w-4" : isTablet ? "h-[17px] w-[17px]" : "h-[18px] w-[18px]"} text-red-500`} />
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className={`${isMobile ? "h-1.5 w-1.5" : "h-2 w-2"} shrink-0 rounded-full bg-red-500`} />

              <h2 className={`${isMobile ? "text-[12px]" : isTablet ? "text-[13px]" : "text-sm"} truncate font-bold text-slate-900`}>
                New Orders
              </h2>
            </div>

            <p className={`${isMobile ? "text-[9px]" : isTablet ? "text-[10px]" : "text-[11px]"} mt-0.5 truncate text-slate-400`}>
              {newOrders.length > 0
                ? `${newOrders.length} order${newOrders.length > 1 ? "s" : ""} waiting for confirmation`
                : "No pending orders"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <span className={`${isMobile ? "px-2 py-1 text-[9px]" : isTablet ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[10px]"} rounded-full bg-red-50 font-bold text-red-600`}>
            {newOrders.length}
          </span>
        </div>
      </div>

      {/* ORDERS AREA */}
      <div className={`${isMobile ? "p-2" : isTablet ? "p-3" : "p-4"} w-full min-w-0 bg-slate-50/50`}>
        {newOrders.length === 0 ? (
          <div className={`${isMobile ? "min-h-[160px]" : isTablet ? "min-h-[180px]" : "min-h-[210px]"} flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 text-center`}>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">
              <ShoppingBag className="h-5 w-5 text-slate-300" />
            </div>

            <p className="text-xs font-semibold text-slate-600">
              No New Orders
            </p>

            <p className="mt-1 max-w-[240px] text-[10px] leading-4 text-slate-400">
              New customer orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className={`${isMobile ? "grid grid-cols-1 gap-2.5" : isTablet ? "grid grid-cols-2 gap-3" : "grid grid-cols-3 gap-4"} w-full min-w-0`}>
            {newOrders.map((order) => (
              <div key={order.id} className="w-full min-w-0">
                <NewOrderCard device={device} order={order} onView={onView} onConfirm={onConfirm} onReject={onReject} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}