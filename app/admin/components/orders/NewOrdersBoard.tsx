"use client";

import { ShoppingBag, ChevronRight } from "lucide-react";
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
  const newOrders = orders.filter((order) => order.status === "Pending");

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* ICON */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <ShoppingBag className="h-[17px] w-[17px] text-red-500" />
          </div>

          {/* TITLE */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <h2 className="truncate text-[13px] font-bold text-slate-900 sm:text-sm">
                New Orders
              </h2>
            </div>

            <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
              {newOrders.length > 0
                ? `${newOrders.length} order${
                    newOrders.length > 1 ? "s" : ""
                  } waiting for confirmation`
                : "No pending orders"}
            </p>
          </div>
        </div>

        {/* COUNT */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
            {newOrders.length}
          </span>
        </div>
      </div>

      {/* =====================================================
          ORDERS AREA
      ===================================================== */}
      <div className="bg-slate-50/50 p-2.5 sm:p-3">
        {newOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 text-center">
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
          /* =================================================
             RESPONSIVE ORDER GRID
          ================================================= */
          <div
            className="
              grid w-full grid-cols-1 gap-3
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
            "
          >
            {newOrders.map((order) => (
              <div
                key={order.id}
                className="min-w-0 overflow-hidden rounded-xl bg-white"
              >
                <NewOrderCard
                  order={order}
                  onView={onView}
                  onConfirm={onConfirm}
                  onReject={onReject}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
