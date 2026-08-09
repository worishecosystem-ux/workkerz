"use client";

import { Package } from "lucide-react";
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
    (o) => !["Delivered", "Cancelled", "Out For Delivery"].includes(o.status),
  );

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse">
          {/* HEADER */}
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
                      Orders will appear here when customers place them.
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
                  highlight={String(highlightOrderId) === String(order.id)}
                  selected={selectedOrders.includes(String(order.id))}
                  onSelect={onSelect}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE SCROLL HINT */}
      {orders.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-center text-[9px] text-slate-400 sm:hidden">
          Swipe horizontally to view all columns
        </div>
      )}
    </div>
  );
}
