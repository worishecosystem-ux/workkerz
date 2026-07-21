"use client";

import {
  Search,
  RefreshCw,
  Download,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface Props {
  search: string;
  setSearch: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  priority: string;
  setPriority: (value: string) => void;

  onRefresh: () => void;
}

export default function ReportsFilters({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  onRefresh,
}: Props) {
  const activeFilters =
    (status !== "All" ? 1 : 0) + (priority !== "All" ? 1 : 0);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* Search */}

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, email, report..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <SlidersHorizontal size={18} className="text-slate-500" />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {activeFilters > 0 && (
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {activeFilters} Active
            </div>
          )}

          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium transition hover:bg-slate-100">
            <Download size={17} />
            Export
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
