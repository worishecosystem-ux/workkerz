"use client";

import { Bell, Plus, RefreshCw } from "lucide-react";

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
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl">
        {/* =====================================================
            MOBILE + TABLET
            < 1024px
        ===================================================== */}

        <div className="flex min-h-16 items-center justify-between gap-2 px-3 pt-15 pb-3 lg:hidden">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-100 bg-sky-50 text-sky-600 shadow-sm">
              {/* TOP RIGHT FOLD */}

              <div className="pointer-events-none absolute right-0 top-0 h-5 w-5 overflow-hidden">
                <div className="absolute -right-2 -top-2 h-7 w-7 rotate-45 bg-sky-200/80" />
                <div className="absolute right-0 top-0 h-3.5 w-3.5 rounded-bl-lg bg-sky-700/20" />
              </div>

              {/* BOTTOM LEFT FOLD */}

              <div className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 overflow-hidden">
                <div className="absolute -bottom-2 -left-2 h-7 w-7 rotate-45 bg-sky-200/70" />
                <div className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-tr-lg bg-sky-700/15" />
              </div>

              <Bell size={20} className="relative z-10" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />

                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sky-600">
                  Communication
                </p>
              </div>

              <h1 className="truncate text-base font-bold tracking-tight text-gray-950">
                Notifications
              </h1>

              {/* Tablet only */}

              <p className="hidden text-[11px] text-gray-500 md:block">
                Manage Workkerz user notifications
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-1.5">
            {/* REFRESH */}

            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh"
              className="
                relative
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border
                border-sky-100
                bg-sky-50
                text-sky-600
                shadow-sm
                transition
                hover:bg-sky-100
                active:scale-95
                disabled:opacity-50
              "
            >
              <span className="pointer-events-none absolute right-0 top-0 h-4 w-4 overflow-hidden">
                <span className="absolute -right-1 -top-1 h-5 w-5 rotate-45 bg-sky-200/80" />
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-bl-md bg-sky-700/20" />
              </span>

              <RefreshCw
                size={17}
                className={`relative z-10 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            {/* CREATE */}

            <button
              type="button"
              onClick={onCreate}
              className="
                relative
                flex
                h-10
                shrink-0
                items-center
                gap-1.5
                overflow-hidden
                rounded-xl
                border
                border-emerald-200
                bg-gradient-to-br
                from-emerald-50
                via-lime-50
                to-lime-100
                px-3
                text-xs
                font-bold
                text-emerald-700
                shadow-sm
                transition
                active:scale-95
                md:px-3.5
                md:text-sm
              "
            >
              {/* TOP RIGHT FOLD */}

              <span className="pointer-events-none absolute right-0 top-0 h-6 w-6 overflow-hidden">
                <span className="absolute -right-2 -top-2 h-8 w-8 rotate-45 bg-lime-300/80" />
                <span className="absolute right-0 top-0 h-4 w-4 rounded-bl-lg bg-emerald-800/20" />
              </span>

              {/* BOTTOM LEFT FOLD */}

              <span className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 overflow-hidden">
                <span className="absolute -bottom-2 -left-2 h-7 w-7 rotate-45 bg-lime-200/70" />
                <span className="absolute bottom-0 left-0 h-3 w-3 rounded-tr-md bg-emerald-800/15" />
              </span>

              <Plus size={16} className="relative z-10" />

              <span className="relative z-10">Create</span>
            </button>
          </div>
        </div>

        {/* =====================================================
            DESKTOP
            1024px+
        ===================================================== */}

        <div className="hidden min-h-[72px] items-center justify-between gap-6 px-8 py-3 lg:flex xl:px-10">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3.5">
            {/* ICON */}

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 text-sky-600 shadow-sm">
              {/* TOP RIGHT FOLD */}

              <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 overflow-hidden">
                <div className="absolute -right-2 -top-2 h-8 w-8 rotate-45 bg-sky-200/80" />
                <div className="absolute right-0 top-0 h-4 w-4 rounded-bl-lg bg-sky-700/20" />
              </div>

              {/* BOTTOM LEFT FOLD */}

              <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 overflow-hidden">
                <div className="absolute -bottom-2 -left-2 h-8 w-8 rotate-45 bg-sky-200/70" />
                <div className="absolute bottom-0 left-0 h-4 w-4 rounded-tr-lg bg-sky-700/15" />
              </div>

              <Bell size={22} className="relative z-10" />
            </div>

            {/* TITLE */}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">
                  Communication
                </p>
              </div>

              <h1 className="truncate text-xl font-bold tracking-tight text-gray-950">
                Notifications
              </h1>

              <p className="text-xs text-gray-500">
                Manage Workkerz user notifications
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-2.5">
            {/* REFRESH */}

            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh notifications"
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border
                border-sky-100
                bg-sky-50
                text-sky-600
                shadow-sm
                transition
                hover:border-sky-200
                hover:bg-sky-100
                active:scale-95
                disabled:opacity-50
              "
            >
              {/* FOLD */}

              <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 overflow-hidden">
                <span className="absolute -right-1 -top-1 h-6 w-6 rotate-45 bg-sky-200/80" />
                <span className="absolute right-0 top-0 h-3 w-3 rounded-bl-md bg-sky-700/20" />
              </span>

              <RefreshCw
                size={17}
                className={`relative z-10 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            {/* CREATE */}

            <button
              type="button"
              onClick={onCreate}
              className="
                relative
                flex
                h-10
                items-center
                gap-2
                overflow-hidden
                rounded-xl
                border
                border-emerald-200
                bg-gradient-to-br
                from-emerald-50
                via-lime-50
                to-lime-100
                px-4
                text-sm
                font-bold
                text-emerald-700
                shadow-sm
                shadow-emerald-100
                transition
                hover:border-emerald-300
                hover:from-emerald-100
                hover:to-lime-100
                active:scale-95
              "
            >
              {/* TOP RIGHT DARK FOLD */}

              <span className="pointer-events-none absolute right-0 top-0 h-7 w-7 overflow-hidden">
                <span className="absolute -right-2 -top-2 h-9 w-9 rotate-45 bg-lime-300/80" />
                <span className="absolute right-0 top-0 h-4.5 w-4.5 rounded-bl-lg bg-emerald-800/20" />
              </span>

              {/* BOTTOM LEFT DARK FOLD */}

              <span className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 overflow-hidden">
                <span className="absolute -bottom-2 -left-2 h-8 w-8 rotate-45 bg-lime-200/70" />
                <span className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-tr-md bg-emerald-800/15" />
              </span>

              <Plus size={17} className="relative z-10" />

              <span className="relative z-10">Create Notification</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
