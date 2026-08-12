"use client";

import { RefreshCw, Search } from "lucide-react";

type Props = {
  search: string;
  status: string;
  payment: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onPayment: (value: string) => void;
  onRefresh: () => void;
};

export default function OrdersSearch({
  search,
  status,
  payment,
  onSearch,
  onStatus,
  onPayment,
  onRefresh,
}: Props) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_160px_160px_auto]">
      {/* SEARCH */}
      <div className="relative min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search orders..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:text-sm"
        />
      </div>

      {/* STATUS */}
      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:text-sm"
      >
        <option value="All">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Packed">Packed</option>
        <option value="Ready to Dispatch">Ready to Dispatch</option>
        <option value="Out For Delivery">Out For Delivery</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      {/* PAYMENT */}
      <select
        value={payment}
        onChange={(e) => onPayment(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:text-sm"
      >
        <option value="All">All Payments</option>
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
        <option value="Failed">Failed</option>
        <option value="Refunded">Refunded</option>
      </select>

      {/* REFRESH */}
      <button
        type="button"
        onClick={onRefresh}
        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-4 text-xs font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98] sm:text-sm lg:w-auto"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh
      </button>
    </div>
  );
}
