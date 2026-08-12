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
  const deliveryOrders = orders.filter((o) => o.status === "Out For Delivery");

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-3 py-3 sm:px-4">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Truck className="h-[17px] w-[17px] text-orange-600" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />

              <h2 className="truncate text-[13px] font-bold text-slate-900 sm:text-sm">
                Out For Delivery
              </h2>
            </div>

            <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
              {deliveryOrders.length} active delivery
              {deliveryOrders.length !== 1 ? "ies" : "y"}
            </p>
          </div>
        </div>

        {/* COUNT */}
        <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
          {deliveryOrders.length}
        </span>
      </div>

      {/* =====================================================
          BOARD
      ===================================================== */}
      <div className="bg-slate-50/50 p-2.5 sm:p-3">
        {deliveryOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-50">
              <Truck className="h-5 w-5 text-orange-300" />
            </div>

            <p className="text-xs font-semibold text-slate-600">
              No Active Deliveries
            </p>

            <p className="mt-1 max-w-[240px] text-[10px] leading-4 text-slate-400">
              Orders currently out for delivery will appear here.
            </p>
          </div>
        ) : (
          /* =================================================
             RESPONSIVE GRID
          ================================================= */
          <div
            className="
              grid w-full grid-cols-1 gap-2.5
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
            "
          >
            {deliveryOrders.map((order) => (
              <div
                key={order.id}
                className="
                  group min-w-0 rounded-xl border border-slate-200
                  bg-white p-3 shadow-sm
                  transition-all duration-200
                  hover:-translate-y-[1px]
                  hover:border-orange-200
                  hover:shadow-md
                "
              >
                {/* =================================================
                    TOP
                ================================================= */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[11px] font-bold text-slate-900">
                        #{order.order_number || "-"}
                      </p>

                      <span className="shrink-0 rounded-full bg-orange-50 px-1.5 py-0.5 text-[8px] font-bold text-orange-700">
                        Delivery
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[10px] font-medium text-slate-600">
                      {order.customer_name || "Customer"}
                    </p>
                  </div>

                  {/* AMOUNT */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ₹{Number(order.total || 0).toLocaleString("en-IN")}
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-400">Total</p>
                  </div>
                </div>

                {/* =================================================
                    CUSTOMER / PHONE
                ================================================= */}
                {order.customer_phone && (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <p className="truncate text-[9px] text-slate-500">
                      {order.customer_phone}
                    </p>

                    <a
                      href={`tel:${order.customer_phone}`}
                      title="Call Customer"
                      className="
                        flex h-6 w-6 shrink-0 items-center justify-center
                        rounded-md bg-white text-blue-600 shadow-sm
                        transition hover:bg-blue-600 hover:text-white
                      "
                    >
                      <Phone className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* =================================================
                    ADDRESS
                ================================================= */}
                <div className="mt-2.5 rounded-lg border border-orange-100 bg-orange-50/40 p-2.5">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />

                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold uppercase tracking-wide text-orange-600">
                        Delivery Address
                      </p>

                      <p className="mt-0.5 line-clamp-2 text-[9px] leading-4 text-slate-600">
                        {order.address || "Address Not Available"}
                        {order.city && `, ${order.city}`}
                        {order.pincode && ` • ${order.pincode}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}
                <div className="mt-2.5 grid grid-cols-[1fr_auto_auto] gap-1.5">
                  {/* DELIVER */}
                  <button
                    type="button"
                    onClick={() => onDelivered(order.id, "Delivered")}
                    className="
                      flex h-8 items-center justify-center
                      rounded-lg bg-green-600 px-2
                      text-[10px] font-bold text-white
                      transition-all
                      hover:bg-green-700
                      active:scale-[0.98]
                    "
                  >
                    Mark Delivered
                  </button>

                  {/* VIEW */}
                  <button
                    type="button"
                    onClick={() => onView(order)}
                    title="View Order"
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-lg border border-slate-200
                      bg-white text-slate-500
                      transition-all
                      hover:border-blue-200
                      hover:bg-blue-50
                      hover:text-blue-600
                      active:scale-95
                    "
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  {/* CALL */}
                  <a
                    href={
                      order.customer_phone
                        ? `tel:${order.customer_phone}`
                        : undefined
                    }
                    title="Call Customer"
                    className={`
                      flex h-8 w-8 items-center justify-center
                      rounded-lg bg-blue-600 text-white
                      transition-all
                      hover:bg-blue-700
                      active:scale-95
                      ${
                        !order.customer_phone
                          ? "pointer-events-none opacity-40"
                          : ""
                      }
                    `}
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
