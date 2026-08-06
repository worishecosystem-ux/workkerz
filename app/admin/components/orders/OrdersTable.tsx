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
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="w-16 px-5 py-4 text-center">
  {orders.some(
    (o) =>
      !["Delivered", "Cancelled", "Out For Delivery"].includes(o.status)
  ) && (
    <input
      type="checkbox"
      checked={!!allSelected}
      onChange={onSelectAll}
      className="h-4 w-4 cursor-pointer rounded border-slate-300"
    />
  )}
</th>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20">
                    <Package className="mb-4 h-14 w-14 text-slate-300" />

                    <h3 className="text-lg font-semibold text-slate-700">
                      No Orders Found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
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
                  highlight={highlightOrderId === order.id}
                  selected={selectedOrders.includes(order.id)}
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
