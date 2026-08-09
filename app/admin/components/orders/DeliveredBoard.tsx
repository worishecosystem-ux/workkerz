"use client";

import {
  CheckCircle2,
  Eye,
  IndianRupee,
  Printer,
} from "lucide-react";

type Props = {
  orders: any[];
  onView: (order: any) => void;
};

export default function DeliveredBoard({
  orders,
  onView,
}: Props) {
  const today = new Date();

  const todayDelivered = orders.filter((order) => {
    if (order.status !== "Delivered" || !order.created_at) {
      return false;
    }

    const date = new Date(order.created_at);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  });

  const revenue = todayDelivered.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const delivered = todayDelivered.slice(0, 5);

  return (
    <section className="w-full overflow-hidden rounded-xl border border-green-100 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-green-100 bg-green-50/50 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />

              <h2 className="truncate text-sm font-bold text-slate-900">
                Delivered Orders
              </h2>
            </div>

            <p className="mt-0.5 text-[10px] text-slate-500">
              {todayDelivered.length} delivered today
            </p>
          </div>
        </div>

        {/* REVENUE */}
        <div className="shrink-0 text-right">
          <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
            Revenue
          </p>

          <div className="mt-0.5 flex items-center justify-end gap-0.5 text-sm font-bold text-green-600">
            <IndianRupee className="h-3.5 w-3.5" />
            {revenue.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* BOARD */}
      <div className="p-2.5 sm:p-3">
        {delivered.length === 0 ? (
          <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-green-200 bg-green-50/20 px-4 text-center">
            <CheckCircle2 className="mb-2 h-7 w-7 text-green-200" />

            <p className="text-xs font-semibold text-slate-600">
              No Delivered Orders
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Delivered orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {delivered.map((order) => {
              const date = order.created_at
                ? new Date(order.created_at)
                : null;

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2 transition hover:border-green-200 hover:bg-white sm:flex-row sm:items-center sm:gap-3 sm:px-3"
                >
                  {/* ORDER */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-bold text-slate-900 sm:text-xs">
                        #{order.order_number || "-"}
                      </p>

                      <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[8px] font-bold text-green-700">
                        Delivered
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {order.customer_name || "Customer"}
                    </p>
                  </div>

                  {/* AMOUNT + DATE */}
                  <div className="flex items-center justify-between gap-3 sm:block sm:min-w-[125px] sm:text-right">
                    <p className="text-xs font-bold text-green-600 sm:text-sm">
                      ₹{Number(order.total || 0).toLocaleString("en-IN")}
                    </p>

                    {date && (
                      <p className="text-[9px] text-slate-400">
                        {date.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        •{" "}
                        {date.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onView(order)}
                      title="View Order"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      title="Print Invoice"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-700 hover:text-white"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}