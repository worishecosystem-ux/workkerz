"use client";

import { ShoppingBag } from "lucide-react";
import NewOrderCard from "./NewOrderCard";

type Props = {
  orders: any[];
  onView: (order: any) => void;
  onConfirm: (id: string | number, status: string) => void;
  onReject: (order: any) => void;
};

export default function NewOrdersBoard({
  orders,
  onView,
  onConfirm,
  onReject,
}: Props) {
  const newOrders = orders.filter(
    (order) => order.status === "Pending"
  );

  return (
    <section className="w-full overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50/50 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <ShoppingBag className="h-4 w-4 text-red-600" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <h2 className="text-sm font-bold text-slate-900">
                New Orders
              </h2>
            </div>

            <p className="mt-0.5 text-[10px] text-slate-500">
              {newOrders.length} orders waiting for confirmation
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
          {newOrders.length}
        </span>
      </div>

      {/* BOARD */}
      <div className="p-2.5 sm:p-3">
        {newOrders.length === 0 ? (
          <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-red-200 bg-red-50/20 px-4 text-center">
            <ShoppingBag className="mb-2 h-7 w-7 text-red-200" />

            <p className="text-xs font-semibold text-slate-600">
              No New Orders
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:gap-3">
            {newOrders.map((order) => (
              <NewOrderCard
                key={order.id}
                order={order}
                onView={onView}
                onConfirm={onConfirm}
                onReject={onReject}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}