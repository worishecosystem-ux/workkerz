"use client";

import { Eye, MapPin, Phone, Truck } from "lucide-react";

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
    <section className="w-full overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-orange-100 bg-orange-50/50 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100">
            <Truck className="h-4 w-4 text-orange-600" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />

              <h2 className="truncate text-sm font-bold text-slate-900">
                Out For Delivery
              </h2>
            </div>

            <p className="mt-0.5 text-[10px] text-slate-500">
              {deliveryOrders.length} active deliveries
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
          {deliveryOrders.length}
        </span>
      </div>

      {/* BOARD */}
      <div className="p-2.5 sm:p-3">
        {deliveryOrders.length === 0 ? (
          <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-orange-200 bg-orange-50/20 px-4 text-center">
            <Truck className="mb-2 h-7 w-7 text-orange-200" />

            <p className="text-xs font-semibold text-slate-600">
              No Orders Out For Delivery
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Active deliveries will appear here.
            </p>
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:gap-3">
            {deliveryOrders.map((order) => (
              <div
                key={order.id}
                className="w-[280px] min-w-[280px] shrink-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3 transition hover:border-orange-200 hover:bg-white sm:w-[300px] sm:min-w-[300px]"
              >
                {/* TOP */}
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-xs font-bold text-slate-900">
                    #{order.order_number || "-"}
                  </p>

                  <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-700">
                    Delivery
                  </span>
                </div>

                {/* CUSTOMER */}
                <div className="mt-2">
                  <p className="truncate text-[11px] font-semibold text-slate-800">
                    {order.customer_name || "Customer"}
                  </p>

                  {order.customer_phone && (
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="mt-0.5 block w-fit text-[10px] text-slate-500 hover:text-blue-600"
                    >
                      {order.customer_phone}
                    </a>
                  )}
                </div>

                {/* ADDRESS */}
                <div className="mt-2 flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />

                  <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                    {order.address || "Address Not Available"}
                    {order.city && `, ${order.city}`}
                    {order.pincode && ` • ${order.pincode}`}
                  </p>
                </div>

                {/* AMOUNT */}
                <div className="mt-2.5">
                  <span className="text-sm font-bold text-green-600">
                    ₹{Number(order.total || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onDelivered(order.id, "Delivered")
                    }
                    className="rounded-lg bg-green-600 px-2 py-2 text-[10px] font-bold text-white transition hover:bg-green-700"
                  >
                    Mark Delivered
                  </button>

                  <button
                    type="button"
                    onClick={() => onView(order)}
                    title="View Order"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  <a
                    href={
                      order.customer_phone
                        ? `tel:${order.customer_phone}`
                        : undefined
                    }
                    title="Call Customer"
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 ${
                      !order.customer_phone
                        ? "pointer-events-none opacity-40"
                        : ""
                    }`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}