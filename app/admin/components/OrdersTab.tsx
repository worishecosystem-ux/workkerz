"use client";

import { Package, Search } from "lucide-react";
import { useState } from "react";
import { useAdmin } from "@/app/components/context/AdminContext";

export default function OrdersTab() {
  const { orders = [] } = useAdmin();
  const [search, setSearch] = useState("");

  const filtered = orders.filter((order: any) => {
    const q = search.toLowerCase();

    return (
      order?.order_id?.toLowerCase?.().includes(q) ||
      order?.customer_name?.toLowerCase?.().includes(q) ||
      order?.phone?.toLowerCase?.().includes(q) ||
      order?.status?.toLowerCase?.().includes(q)
    );
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Orders Management
          </h1>

          <p className="text-slate-500 mt-1">
            Total Orders: {orders.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="w-full rounded-2xl border border-slate-200 pl-12 pr-4 py-3 outline-none focus:border-orange-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="py-16 text-center">
                    <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />

                    <h3 className="font-bold text-slate-700">
                      No Orders Found
                    </h3>

                    <p className="text-slate-500 text-sm mt-2">
                      Orders will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((order: any) => (
                <tr
                  key={order.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 font-semibold">
                    {order.order_id || "-"}
                  </td>

                  <td className="p-4">
                    {order.customer_name || "-"}
                  </td>

                  <td className="p-4">
                    {order.phone || "-"}
                  </td>

                  <td className="p-4">
                    ₹{order.total_amount ?? 0}
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      {order.status || "Pending"}
                    </span>
                  </td>

                  <td className="p-4">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}