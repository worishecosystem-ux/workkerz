"use client";

import { CheckCircle2, IndianRupee, Eye, Printer } from "lucide-react";

type Props = {
  orders: any[];
  onView: (order: any) => void;
};

export default function DeliveredBoard({ orders, onView }: Props) {
  const today = new Date();

  const todayDelivered = orders.filter((order) => {
    if (order.status !== "Delivered") return false;

    const orderDate = new Date(order.created_at);

    return (
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getDate() === today.getDate()
    );
  });

  // Revenue of today's delivered orders
  const revenue = todayDelivered.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );

  // Show only latest 5 orders
  const delivered = todayDelivered.slice(0, 5);

  return (
    <div className="mb-8 rounded-3xl border border-green-200 bg-green-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            ✅ Delivered Orders
          </h2>

          <p className="text-sm text-slate-500">
            {todayDelivered.length} Delivered Today
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500">Revenue</p>

          <h2 className="text-3xl font-bold text-green-600">
            ₹{revenue.toLocaleString()}
          </h2>
        </div>
      </div>

      {delivered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green-300 bg-white py-16 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-300" />

          <p className="text-slate-500">No Delivered Orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {delivered.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
            >
              <div>
                <h3 className="font-bold">{order.order_number}</h3>

                <p className="text-sm text-slate-500">{order.customer_name}</p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  ₹{Number(order.total).toLocaleString()}
                </p>

                <p className="text-xs text-slate-500">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onView(order)}
                  className="rounded-xl bg-blue-50 p-3 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Eye className="h-5 w-5" />
                </button>

                <button className="rounded-xl bg-slate-100 p-3 text-slate-700 hover:bg-slate-800 hover:text-white">
                  <Printer className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
