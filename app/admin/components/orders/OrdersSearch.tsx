import { Search, RefreshCw } from "lucide-react";

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
    <div className="mb-6 flex flex-wrap items-center gap-4">

      {/* Search */}

      <div className="relative min-w-[280px] flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search orders..."
          className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-orange-500"
        />
      </div>

      {/* Status */}

      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        className="rounded-xl border border-slate-200 px-4 py-3"
      >
        <option value="All">All Status</option>
        <option>Pending</option>
        <option>Confirmed</option>
        <option>Packed</option>
        <option>Out For Delivery</option>
        <option>Delivered</option>
        <option>Cancelled</option>
      </select>

      {/* Payment */}

      <select
        value={payment}
        onChange={(e) => onPayment(e.target.value)}
        className="rounded-xl border border-slate-200 px-4 py-3"
      >
        <option value="All">All Payments</option>
        <option>Pending</option>
        <option>Paid</option>
        <option>Failed</option>
        <option>Refunded</option>
      </select>

      {/* Refresh */}

      <button
        onClick={onRefresh}
        className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-white hover:bg-orange-600"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </button>

    </div>
  );
}