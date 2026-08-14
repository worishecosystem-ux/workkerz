"use client";

import {
  Bell,
  Plus,
  RefreshCw,
} from "lucide-react";

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
  onCreate: () => void;
};

export default function NotificationHeader({
  refreshing,
  onRefresh,
  onCreate,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:min-h-[68px] sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 sm:h-11 sm:w-11 sm:rounded-2xl">
            <Bell size={21} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-gray-950 sm:text-xl">
              Notifications
            </h1>

            <p className="hidden text-xs text-gray-500 sm:block">
              Manage Workkerz user notifications
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          <button
            type="button"
            onClick={onCreate}
            className="flex h-10 items-center gap-2 rounded-xl bg-green-600 px-3 text-sm font-bold text-white shadow-sm shadow-green-600/20 transition hover:bg-green-700 active:scale-95 sm:px-4"
          >
            <Plus size={17} />

            <span className="hidden sm:inline">
              Create Notification
            </span>

            <span className="sm:hidden">
              Create
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}