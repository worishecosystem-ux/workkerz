"use client";

import { PackageCheck, Eye, Truck } from "lucide-react";

type Props = {
  orders: any[];
  onView: (order: any) => void;
  onDispatch: (id: string, status: string) => void;
};

export default function ConfirmedOrdersBoard({
  orders,
  onView,
  onDispatch,
}: Props) {
  const confirmedOrders = orders.filter(
    (o) => o.status === "Confirmed"
  );

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            📦 Confirmed Orders
          </h2>

          <p className="text-sm text-slate-500">
            {confirmedOrders.length} Ready For Dispatch
          </p>
        </div>

        <div className="rounded-2xl bg-blue-100 p-4">
          <PackageCheck className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {confirmedOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-14 text-center text-slate-500">
          No Confirmed Orders
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {confirmedOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">
                  {order.order_number}
                </h3>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                  Confirmed
                </span>
              </div>

              <p className="mt-3 font-medium">
                {order.customer_name}
              </p>

              <p className="text-sm text-slate-500">
                {order.customer_phone}
              </p>

              <p className="mt-4 text-2xl font-bold text-green-600">
                ₹{Number(order.total).toLocaleString()}
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() =>
                    onDispatch(order.id, "Out For Delivery")
                  }
                  className="flex-1 rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Truck className="h-5 w-5" />
                    Dispatch
                  </div>
                </button>

                <button
                  onClick={() => onView(order)}
                  className="rounded-xl border border-slate-300 px-4 hover:bg-slate-100"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}