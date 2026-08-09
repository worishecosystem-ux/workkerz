"use client";

import NewOrderCard from "./NewOrderCard";
import { ShoppingBag } from "lucide-react";

type Props = {
  orders: any[];
  onView: (order: any) => void;
  onConfirm: (id: string, status: string) => void;
  onReject: (order: any) => void;
};

export default function NewOrdersBoard({
  orders,
  onView,
  onConfirm,
}: Props) {
  const newOrders = orders.filter(
    (o) => o.status === "Pending"
  );

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            🔴 New Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {newOrders.length} Orders Waiting For Confirmation
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
          <ShoppingBag className="h-7 w-7 text-orange-600" />
        </div>
      </div>

      {newOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-300" />

          <h3 className="text-lg font-semibold text-slate-700">
            No New Orders
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            New customer orders will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {newOrders.map((order) => (
            <NewOrderCard
              key={order.id}
              order={order}
              onView={onView}
              onConfirm={onConfirm}
            />
          ))}
        </div>
      )}
    </div>
  );
}