"use client";

import { Package, ChevronRight } from "lucide-react";
import OrderRow from "./OrderRow";

type Props = {
  orders: any[];
  onView: (order: any) => void;
  highlightOrderId: string | null;
  selectedOrders: string[];
  onSelect: (id: string) => void;
  allSelected: boolean;
  onSelectAll: () => void;
};

export default function OrdersTable({
  orders,
  onView,
  highlightOrderId,
  selectedOrders,
  onSelect,
  allSelected,
  onSelectAll,
}: Props) {
  const selectableOrders = orders.some(
    (o) =>
      !["Delivered", "Cancelled", "Out For Delivery"].includes(
        o.status,
      ),
  );

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* =====================================================
          MOBILE
      ===================================================== */}
      <div className="block sm:hidden">
        {orders.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
              <Package className="h-5 w-5 text-slate-300" />
            </div>

            <h3 className="text-sm font-semibold text-slate-700">
              No Orders Found
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Orders will appear here when customers place them.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE SELECT ALL */}
            {selectableOrders && (
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  Select All
                </label>

                <span className="text-[10px] text-slate-400">
                  {orders.length} orders
                </span>
              </div>
            )}

            {/* MOBILE ORDER LIST */}
            <div className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isSelected = selectedOrders.includes(
                  String(order.id),
                );

                const isHighlighted =
                  String(highlightOrderId) ===
                  String(order.id);

                const amount =
                  order.total_amount ??
                  order.total ??
                  order.amount ??
                  0;

                const status = String(
                  order.status ?? "Pending",
                );

                const statusClass =
                  status === "Delivered"
                    ? "bg-green-50 text-green-700"
                    : status === "Cancelled"
                      ? "bg-red-50 text-red-700"
                      : status === "Confirmed"
                        ? "bg-blue-50 text-blue-700"
                        : status === "Ready to Dispatch"
                          ? "bg-orange-50 text-orange-700"
                          : status === "Out For Delivery"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-amber-50 text-amber-700";

                return (
                  <div
                    key={order.id}
                    className={`relative px-3 py-3 transition ${
                      isHighlighted
                        ? "bg-orange-50/70"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* SELECT */}
                      {![
                        "Delivered",
                        "Cancelled",
                        "Out For Delivery",
                      ].includes(status) && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            onSelect(String(order.id))
                          }
                          className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                      )}

                      {/* ORDER CONTENT */}
                      <button
                        type="button"
                        onClick={() => onView(order)}
                        className="min-w-0 flex-1 text-left"
                      >
                        {/* TOP ROW */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              #
                              {order.order_number ??
                                order.id}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                              {order.customer_name ||
                                "Customer"}
                            </p>
                          </div>

                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        </div>

                        {/* DETAILS */}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[10px] text-slate-400">
                              {order.customer_phone ||
                                "No phone"}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {order.created_at
                                ? new Date(
                                    order.created_at,
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "—"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">
                              ₹
                              {Number(
                                amount || 0,
                              ).toLocaleString("en-IN")}
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${statusClass}`}
                            >
                              {status}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          TABLET + DESKTOP
      ===================================================== */}
      <div className="hidden w-full overflow-x-auto sm:block">
        <table className="w-full min-w-[850px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="w-10 px-2 py-2.5 text-center">
                {selectableOrders && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                )}
              </th>

              <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Order
              </th>

              <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Phone
              </th>

              <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Date
              </th>

              <th className="px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                      <Package className="h-5 w-5 text-slate-300" />
                    </div>

                    <h3 className="text-sm font-semibold text-slate-700">
                      No Orders Found
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                      Orders will appear here when customers place
                      them.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onView={onView}
                  highlight={
                    String(highlightOrderId) ===
                    String(order.id)
                  }
                  selected={selectedOrders.includes(
                    String(order.id),
                  )}
                  onSelect={onSelect}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}