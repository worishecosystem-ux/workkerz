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
      <div
        className="
          mx-auto
          flex
          min-h-[60px]
          w-full
          max-w-[1600px]
          items-center
          gap-2
          px-3
          sm:px-4
          md:min-h-[64px]
          md:gap-3
          lg:px-6
          xl:px-7
        "
      >
        {/* BRAND */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-emerald-400
                  opacity-60
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500
                "
              />
            </span>

            <h1
              className="
                truncate
                text-[14px]
                font-black
                tracking-tight
                text-slate-900
                sm:text-[15px]
                md:text-base
                lg:text-[17px]
              "
            >
              Worker Bookings
            </h1>

            <span
              className="
                hidden
                rounded-full
                bg-emerald-50
                px-2
                py-0.5
                text-[8px]
                font-black
                text-emerald-600
                sm:inline-flex
              "
            >
              LIVE
            </span>
          </div>

          <p
            className="
              mt-0.5
              hidden
              truncate
              text-[9px]
              font-medium
              text-slate-400
              sm:block
              md:text-[10px]
            "
          >
            Manage bookings, workers & assignments
          </p>
        </div>

        {/* DESKTOP SEARCH */}
        <div
          className="
            hidden
            h-9
            w-[220px]
            items-center
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            px-3
            transition
            focus-within:border-slate-300
            focus-within:bg-white
            md:flex
            lg:w-[280px]
            xl:w-[320px]
          "
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search bookings..."
            className="
              h-full
              w-full
              bg-transparent
              text-[10px]
              font-semibold
              text-slate-800
              outline-none
              placeholder:text-slate-400
            "
          />
        </div>

        {/* LIVE */}
        <div
          className="
            hidden
            items-center
            gap-1.5
            rounded-lg
            bg-slate-50
            px-2.5
            py-2
            lg:flex
          "
        >
          <Activity className="h-3.5 w-3.5 text-emerald-500" />

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
            hover:border-slate-300
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
            sm:gap-1.5
            sm:px-2.5
          "
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          <span className="hidden text-[9px] font-bold sm:inline">
            Refresh
          </span>
        </button>
      </div>

      {/* MOBILE SEARCH */}
      <div className="px-3 pb-2.5 sm:px-4 md:hidden">
        <div
          className="
            flex
            h-9
            items-center
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            px-2.5
            transition
            focus-within:border-slate-300
            focus-within:bg-white
          "
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search bookings, workers..."
            className="
              h-full
              w-full
              bg-transparent
              text-[10px]
              font-semibold
              text-slate-800
              outline-none
              placeholder:text-slate-400
            "
          />
        </div>
      </div>
    </header>
  );
}