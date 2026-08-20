"use client";

import {
  Activity,
  RefreshCw,
  Search,
} from "lucide-react";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  notificationCount: number;
  refreshing: boolean;
  onRefresh: () => void;
  onNotificationClick: () => void;
};

export default function BookingHeader({
  search,
  onSearch,
  notificationCount,
  refreshing,
  onRefresh,
  onNotificationClick,
}: Props) {
  const hasNotifications = notificationCount > 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl">

      {/* =====================================================
          DESKTOP — lg and above
          ===================================================== */}

      <div className="hidden lg:block">
        <div
          className="
            mx-auto
            flex
            min-h-[72px]
            w-full
            max-w-[1600px]
            items-center
            gap-4
            px-8
            py-3
          "
        >
          {/* BRAND */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <h1 className="truncate text-[17px] font-black tracking-tight text-slate-900">
                Worker Bookings
              </h1>

              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black tracking-wide text-emerald-600">
                LIVE
              </span>
            </div>

            <p className="mt-1 truncate text-[10px] font-medium text-slate-400">
              Manage bookings, workers & assignments
            </p>
          </div>

          {/* SEARCH */}
          <div className="flex h-10 w-[300px] shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-slate-300 focus-within:bg-white xl:w-[360px]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                onSearch(event.target.value)
              }
              placeholder="Search bookings..."
              className="h-full w-full bg-transparent text-[11px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* LIVE */}
          <div className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-slate-50 px-3.5">
            <Activity className="h-4 w-4 text-emerald-500" />

            <span className="text-[10px] font-bold text-slate-500">
              Live
            </span>
          </div>

          {/* REFRESH */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh bookings"
            className="
              flex
              h-10
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3.5
              text-slate-600
              transition
              hover:border-slate-300
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            <span className="text-[10px] font-bold">
              Refresh
            </span>
          </button>

          {/* NOTIFICATION */}
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="Open notifications"
            className="
              relative
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              hover:border-slate-300
              hover:bg-slate-50
            "
          >
            <span className="text-[16px]">🔔</span>

            {hasNotifications && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[8px] font-black text-white">
                {notificationCount > 9
                  ? "9+"
                  : notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          TABLET — md to lg
          pt / pb independently controlled
          ===================================================== */}

      <div className="hidden md:block lg:hidden">
        <div
          className="
            mx-auto
            flex
            min-h-17
            w-full
            items-center
            gap-3
            px-4
            pt-12
            pb-3
            sm:px-5
            sm:pt-5
            sm:pb-4
          "
        >
          {/* BRAND */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>

              <h1 className="truncate text-[15px] font-black tracking-tight text-slate-900">
                Worker Bookings
              </h1>

              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black text-emerald-600">
                LIVE
              </span>
            </div>

            <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
              Manage bookings & assignments
            </p>
          </div>

          {/* TABLET SEARCH */}
          <div className="flex h-10 w-[230px] shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-slate-300 focus-within:bg-white sm:w-[280px]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                onSearch(event.target.value)
              }
              placeholder="Search bookings..."
              className="h-full w-full bg-transparent text-[10px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* LIVE */}
          <div className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-slate-50 px-3">
            <Activity className="h-4 w-4 text-emerald-500" />

            <span className="text-[9px] font-bold text-slate-500">
              Live
            </span>
          </div>

          {/* REFRESH */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh bookings"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              hover:bg-slate-50
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* NOTIFICATION */}
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="Open notifications"
            className="
              relative
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              hover:bg-slate-50
            "
          >
            <span className="text-[16px]">🔔</span>

            {hasNotifications && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[8px] font-black text-white">
                {notificationCount > 9
                  ? "9+"
                  : notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* TABLET SEARCH ROW */}
        <div
          className="
            px-4
            pt-1
            pb-4
            sm:px-5
            sm:pt-2
            sm:pb-5
          "
        >
          <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-slate-300 focus-within:bg-white">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                onSearch(event.target.value)
              }
              placeholder="Search bookings, workers..."
              className="h-full w-full bg-transparent text-[10px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE — below md
          pt / pb independently controlled
          ===================================================== */}

      <div className="block md:hidden">
        {/* MOBILE TOP BAR */}
        <div
          className="
            flex
            min-h-14.5
            items-center
            gap-2
            px-3
            pt-15
            pb-2
            sm:pt-4
            sm:pb-3
          "
        >
          {/* BRAND */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>

              <h1 className="truncate text-[14px] font-black tracking-tight text-slate-900">
                Worker Bookings
              </h1>

              <span className="inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[7px] font-black text-emerald-600">
                LIVE
              </span>
            </div>

            <p className="mt-0.5 truncate text-[8px] font-medium text-slate-400">
              Manage bookings & assignments
            </p>
          </div>

          {/* LIVE */}
          <div className="hidden h-9 items-center gap-1 rounded-lg bg-slate-50 px-2 sm:flex">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />

            <span className="text-[8px] font-bold text-slate-500">
              Live
            </span>
          </div>

          {/* REFRESH */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh bookings"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              active:scale-95
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* NOTIFICATION */}
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="Open notifications"
            className="
              relative
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              active:scale-95
            "
          >
            <span className="text-[14px]">🔔</span>

            {hasNotifications && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[7px] font-black text-white">
                {notificationCount > 9
                  ? "9+"
                  : notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* MOBILE SEARCH */}
        <div
          className="
            px-3
            pt-1
            pb-3
            sm:pt-2
            sm:pb-4
          "
        >
          <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 transition focus-within:border-slate-300 focus-within:bg-white">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                onSearch(event.target.value)
              }
              placeholder="Search bookings, workers..."
              className="h-full w-full bg-transparent text-[10px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
}