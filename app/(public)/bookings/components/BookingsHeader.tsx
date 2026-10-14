
"use client";

import { useState } from "react";
import {
  RefreshCw,
  Search,
  CalendarCheck,
  Users,
  ShoppingBag,
} from "lucide-react";
import type { PageTab } from "./types";

const tabs: {
  id: PageTab;
  label: string;
  icon: typeof CalendarCheck;
}[] = [
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "requests", label: "Requests", icon: Users },
  { id: "orders", label: "Orders", icon: ShoppingBag },
];

type Props = {
  tab: PageTab;
  onTabChange: (tab: PageTab) => void;
  search: string;
  onSearch: (value: string) => void;
  counts: {
    bookings: number;
    cancelled: number;
    requests: number;
  };
  onRefresh: () => void;
};

export default function BookingsHeader({
  tab,
  onTabChange,
  search,
  onSearch,
  counts,
  onRefresh,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 700);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white shadow-sm">
      <div className="mx-auto max-w-3xl">
        {/* Compact Top Bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-950 to-emerald-800 px-4 pb-3 pt-11 text-white sm:pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <CalendarCheck size={19} />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight">
                Track Status
              </h1>
              <p className="mt-0.5 text-[10px] text-emerald-100/80">
                Manage bookings & requests
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh data"
            title="Refresh"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition hover:bg-white/20 active:scale-95 disabled:opacity-70"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 sm:px-4">
          <label className="flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10">
            <Search
              size={16}
              className="shrink-0 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search bookings, workers, orders..."
              aria-label="Search bookings, workers and orders"
              className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => onSearch("")}
                aria-label="Clear search"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <span className="text-base leading-none">×</span>
              </button>
            )}
          </label>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Booking sections"
          className="mt-3 flex gap-1 overflow-x-auto border-b border-slate-100 px-3 scrollbar-none sm:px-4"
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;

            const count =
              id === "bookings"
                ? counts.bookings
                : id === "requests"
                  ? counts.requests
                  : null;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-10 shrink-0 items-center justify-center gap-1.5 px-3 pb-2.5 pt-2 text-[11px] font-semibold transition sm:px-4 ${
                  active
                    ? "text-emerald-800"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon
                  size={15}
                  strokeWidth={active ? 2.4 : 1.8}
                />

                <span>{label}</span>

                {count !== null && (
                  <span
                    className={`min-w-[19px] rounded-full px-1.5 py-0.5 text-center text-[9px] font-bold tabular-nums ${
                      active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}

                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-emerald-600" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}