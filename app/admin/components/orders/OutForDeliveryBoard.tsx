"use client";

import { Truck, Phone, MapPin, Eye } from "lucide-react";

type Props = {
  orders: any[];
  onView: (order: any) => void;
  onDelivered: (id: string, status: string) => void;
};

export default function OutForDeliveryBoard({
  orders,
  onView,
  onDelivered,
}: Props) {
  const deliveryOrders = orders.filter(
    (o) => o.status === "Out For Delivery"
  );

  return (
    <div className="mb-8 rounded-3xl border border-orange-200 bg-orange-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            🚚 Out For Delivery
          </h2>

          <p className="text-sm text-slate-500">
            {deliveryOrders.length} Active Deliveries
          </p>
        </div>

        <div className="rounded-2xl bg-orange-100 p-4">
          <Truck className="h-8 w-8 text-orange-600" />
        </div>
      </div>

      {deliveryOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-300 bg-white py-14 text-center text-slate-500">
          No Orders Out For Delivery
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {deliveryOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">
                  {order.order_number}
                </h3>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                  Delivery
                </span>
              </div>

              <div className="mt-4">
                <p className="font-semibold">
                  {order.customer_name}
                </p>

                <p className="text-sm text-slate-500">
                  {order.customer_phone}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                {order.address || "Address Not Available"}
              </div>

              <div className="mt-5 text-2xl font-bold text-green-600">
                ₹{Number(order.total || 0).toLocaleString()}
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() =>
                    onDelivered(order.id, "Delivered")
                  }
                  className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Delivered
                </button>

                <button
                  onClick={() => onView(order)}
                  className="rounded-xl border border-slate-300 p-3 hover:bg-slate-100"
                >
                  <Eye className="h-5 w-5" />
                </button>

                <a
                  href={`tel:${order.customer_phone}`}
                  className="rounded-xl bg-blue-600 p-3 text-white hover:bg-blue-700"
                >
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}