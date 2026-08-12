"use client";

import { Eye, PackageCheck, Truck, Phone, IndianRupee } from "lucide-react";

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
  const confirmedOrders = orders.filter((o) => o.status === "Confirmed");

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-3 py-3 sm:px-4">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <PackageCheck className="h-[17px] w-[17px] text-blue-600" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />

              <h2 className="truncate text-[13px] font-bold text-slate-900 sm:text-sm">
                Confirmed Orders
              </h2>
            </div>

            <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
              {confirmedOrders.length} order
              {confirmedOrders.length !== 1 ? "s" : ""} ready for dispatch
            </p>
          </div>
        </div>

        {/* COUNT */}
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
          {confirmedOrders.length}
        </span>
      </div>

      {/* =====================================================
          BOARD
      ===================================================== */}
      <div className="bg-slate-50/50 p-2.5 sm:p-3">
        {confirmedOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
              <PackageCheck className="h-5 w-5 text-blue-300" />
            </div>

            <p className="text-xs font-semibold text-slate-600">
              No Confirmed Orders
            </p>

            <p className="mt-1 max-w-[240px] text-[10px] leading-4 text-slate-400">
              Orders confirmed by you will appear here ready for dispatch.
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
            {confirmedOrders.map((order) => (
              <div
                key={order.id}
                className="
                  group min-w-0 rounded-xl border border-slate-200
                  bg-white p-3 shadow-sm
                  transition-all duration-200
                  hover:-translate-y-[1px]
                  hover:border-blue-200
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

                      <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-700">
                        Confirmed
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[10px] text-slate-500">
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
                    CUSTOMER INFO
                ================================================= */}
                <div className="mt-2.5 rounded-lg bg-slate-50 px-2.5 py-2">
                  <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                    Customer
                  </p>

                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                    <p className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-700">
                      {order.customer_name || "Customer"}
                    </p>

                    {order.customer_phone && (
                      <a
                        href={`tel:${order.customer_phone}`}
                        title={`Call ${order.customer_phone}`}
                        className="
                          flex h-6 w-6 shrink-0 items-center justify-center
                          rounded-md bg-white text-slate-500
                          shadow-sm transition
                          hover:bg-blue-600 hover:text-white
                        "
                      >
                        <Phone className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {order.customer_phone && (
                    <p className="mt-0.5 truncate text-[9px] text-slate-400">
                      {order.customer_phone}
                    </p>
                  )}
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}
                <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDispatch(order.id, "Out For Delivery")}
                    className="
                      flex h-8 items-center justify-center gap-1.5
                      rounded-lg bg-orange-500 px-2
                      text-[10px] font-bold text-white
                      transition-all
                      hover:bg-orange-600
                      active:scale-[0.98]
                    "
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Dispatch
                  </button>

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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
