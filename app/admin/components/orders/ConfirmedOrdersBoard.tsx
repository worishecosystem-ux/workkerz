"use client";

import { Eye, PackageCheck, Truck } from "lucide-react";

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
    <section className="w-full overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-blue-50/50 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <PackageCheck className="h-4 w-4 text-blue-600" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />

              <h2 className="truncate text-sm font-bold text-slate-900">
                Confirmed Orders
              </h2>
            </div>

            <p className="mt-0.5 text-[10px] text-slate-500">
              {confirmedOrders.length} ready for dispatch
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
          {confirmedOrders.length}
        </span>
      </div>

      {/* BOARD */}
      <div className="p-2.5 sm:p-3">
        {confirmedOrders.length === 0 ? (
          <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/20 px-4 text-center">
            <PackageCheck className="mb-2 h-7 w-7 text-blue-200" />

            <p className="text-xs font-semibold text-slate-600">
              No Confirmed Orders
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Confirmed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:gap-3">
            {confirmedOrders.map((order) => (
              <div
                key={order.id}
                className="w-[280px] min-w-[280px] shrink-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3 transition hover:border-blue-200 hover:bg-white sm:w-[300px] sm:min-w-[300px]"
              >
                {/* TOP */}
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-xs font-bold text-slate-900">
                    #{order.order_number || "-"}
                  </p>

                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                    Confirmed
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

                {/* AMOUNT */}
                <div className="mt-2.5">
                  <span className="text-sm font-bold text-green-600">
                    ₹{Number(order.total || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onDispatch(order.id, "Out For Delivery")
                    }
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-2 py-2 text-[10px] font-bold text-white transition hover:bg-orange-700"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Dispatch
                  </button>

                  <button
                    type="button"
                    onClick={() => onView(order)}
                    title="View Order"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
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