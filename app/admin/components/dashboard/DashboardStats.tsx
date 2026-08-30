"use client";

import { Capacitor } from "@capacitor/core";
import {
  CalendarCheck,
  ShoppingBag,
  Store,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Daily = {
  day: string;
  value: number;
};

type StatData = {
  workers: number;
  availableWorkers: number;
  shops: number;
  bookings: number;
  orders: number;
  workerRequests: number;
  workersDaily: Daily[];
  shopsDaily: Daily[];
  bookingsDaily: Daily[];
  ordersDaily: Daily[];
  requestsDaily: Daily[];
};

type Platform = "android" | "tablet" | "browser";

const EMPTY: StatData = {
  workers: 0,
  availableWorkers: 0,
  shops: 0,
  bookings: 0,
  orders: 0,
  workerRequests: 0,
  workersDaily: [],
  shopsDaily: [],
  bookingsDaily: [],
  ordersDaily: [],
  requestsDaily: [],
};

export default function DashboardStats() {
  const [data, setData] = useState<StatData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<Platform>("browser");

  /* =====================================================
     PLATFORM DETECTION
  ===================================================== */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();
    const native = Capacitor.isNativePlatform();
    const capacitorPlatform = Capacitor.getPlatform();

    const isAndroid = native && capacitorPlatform === "android";

    const isTablet =
      /ipad|tablet|android(?!.*mobile)/i.test(ua) ||
      (navigator.maxTouchPoints > 1 &&
        /macintosh/i.test(ua) &&
        navigator.maxTouchPoints > 1);

    if (isAndroid) {
      setPlatform("android");
    } else if (isTablet) {
      setPlatform("tablet");
    } else {
      setPlatform("browser");
    }
  }, []);

  /* =====================================================
     GET LAST 7 DAYS
  ===================================================== */

  const getDays = useCallback(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(date.getDate() - (6 - i));

      return date;
    });
  }, []);

  /* =====================================================
     FETCH DAILY DATA
  ===================================================== */

  const fetchDaily = useCallback(
    async (table: string): Promise<Daily[]> => {
      const days = getDays();

      const from = days[0].toISOString();
      const to = new Date().toISOString();

      const { data: rows, error } = await supabase
        .from(table)
        .select("created_at")
        .gte("created_at", from)
        .lte("created_at", to);

      if (error) {
        console.error(`${table} daily stats error:`, error);

        return days.map((day) => ({
          day: day
            .toLocaleDateString("en-IN", {
              weekday: "short",
            })
            .slice(0, 1),
          value: 0,
        }));
      }

      return days.map((day) => {
        const nextDay = new Date(day);

        nextDay.setDate(nextDay.getDate() + 1);

        const value = (rows || []).filter((row) => {
          if (!row?.created_at) return false;

          const created = new Date(row.created_at);

          return created >= day && created < nextDay;
        }).length;

        return {
          day: day
            .toLocaleDateString("en-IN", {
              weekday: "short",
            })
            .slice(0, 1),
          value,
        };
      });
    },
    [getDays],
  );

  /* =====================================================
     FETCH STATS
  ===================================================== */

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);

      tomorrow.setDate(tomorrow.getDate() + 1);

      const from = today.toISOString();
      const to = tomorrow.toISOString();

      const [
        workers,
        availableWorkers,
        shops,
        bookings,
        orders,
        workerRequests,
        workersDaily,
        shopsDaily,
        bookingsDaily,
        ordersDaily,
        requestsDaily,
      ] = await Promise.all([
        supabase
          .from("workers")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("workers")
          .select("*", { count: "exact", head: true })
          .eq("available", true),

        supabase
          .from("shops")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", from)
          .lt("created_at", to),

        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", from)
          .lt("created_at", to),

        supabase
          .from("worker_requests")
          .select("*", { count: "exact", head: true })
          .gte("created_at", from)
          .lt("created_at", to),

        fetchDaily("workers"),
        fetchDaily("shops"),
        fetchDaily("bookings"),
        fetchDaily("orders"),
        fetchDaily("worker_requests"),
      ]);

      const errors = [
        workers.error,
        availableWorkers.error,
        shops.error,
        bookings.error,
        orders.error,
        workerRequests.error,
      ].filter(Boolean);

      if (errors.length) {
        console.error("Dashboard stats error:", errors);

        return;
      }

      setData({
        workers: workers.count ?? 0,
        availableWorkers: availableWorkers.count ?? 0,
        shops: shops.count ?? 0,
        bookings: bookings.count ?? 0,
        orders: orders.count ?? 0,
        workerRequests: workerRequests.count ?? 0,
        workersDaily: workersDaily || [],
        shopsDaily: shopsDaily || [],
        bookingsDaily: bookingsDaily || [],
        ordersDaily: ordersDaily || [],
        requestsDaily: requestsDaily || [],
      });
    } catch (error) {
      console.error("Dashboard stats fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchDaily]);

  /* =====================================================
     INITIAL FETCH + REALTIME
  ===================================================== */

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel("dashboard-stats-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workers",
        },
        fetchStats,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shops",
        },
        fetchStats,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        fetchStats,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        fetchStats,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "worker_requests",
        },
        fetchStats,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  /* =====================================================
     GROWTH
  ===================================================== */

  const getGrowth = (daily: Daily[] = []) => {
    if (!daily.length) return 0;

    const current = daily[daily.length - 1]?.value || 0;

    const previous = daily.slice(0, -1);

    if (!previous.length) {
      return current > 0 ? 100 : 0;
    }

    const total = previous.reduce(
      (sum, item) => sum + (item?.value || 0),
      0,
    );

    const average = total / previous.length;

    if (!average) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - average) / average) * 100);
  };

  /* =====================================================
     CARDS DATA
  ===================================================== */

  const cards = [
    {
      label: "Workers",
      value: data.workers,
      sub: `${data.availableWorkers} available`,
      daily: data.workersDaily || [],
      icon: Users,
      iconClass: "bg-orange-50 text-orange-500",
      barClass: "bg-orange-400",
    },
    {
      label: "Shops",
      value: data.shops,
      sub: "Registered shops",
      daily: data.shopsDaily || [],
      icon: Store,
      iconClass: "bg-violet-50 text-violet-500",
      barClass: "bg-violet-400",
    },
    {
      label: "New Bookings",
      value: data.bookings,
      sub: "Today",
      daily: data.bookingsDaily || [],
      icon: CalendarCheck,
      iconClass: "bg-emerald-50 text-emerald-500",
      barClass: "bg-emerald-400",
    },
    {
      label: "New Orders",
      value: data.orders,
      sub: "Today",
      daily: data.ordersDaily || [],
      icon: ShoppingBag,
      iconClass: "bg-blue-50 text-blue-500",
      barClass: "bg-blue-400",
    },
    {
      label: "Worker Requests",
      value: data.workerRequests,
      sub: "Today",
      daily: data.requestsDaily || [],
      icon: UserRoundPlus,
      iconClass: "bg-rose-50 text-rose-500",
      barClass: "bg-rose-400",
    },
  ];

  /* =====================================================
     MOBILE / TABLET / ANDROID CARD
  ===================================================== */

  const renderAppCards = () => {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const daily = card.daily || [];
        const max = Math.max(...daily.map((item) => item?.value || 0), 1);
        const growth = getGrowth(daily);
        const positive = growth >= 0;
        const isFifthCard = index === 4;

        return (
          <div
            key={card.label}
            className={`rounded-xl border border-[#E7EAF0] bg-white p-3 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition hover:shadow-md ${
              isFifthCard ? "col-span-2 sm:col-span-4" : "col-span-1"
            }`}
          >
            {/* LINE 1 */}
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <p className="min-w-0 truncate text-[10px] font-bold leading-none text-[#475569]">
                  {card.label}
                </p>
              </div>
            </div>

            {/* LINE 2 */}
            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[23px] font-black leading-none tracking-tight text-[#172033]">
                    {loading ? "—" : card.value.toLocaleString("en-IN")}
                  </span>

                  {!loading && (
                    <span
                      className={`text-[8px] font-bold ${
                        positive ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {growth}%
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[8px] font-medium text-[#94A3B8]">
                  {loading ? "Loading..." : card.sub}
                </p>
              </div>

              {/* GRAPH */}
              <div className="w-[70px] shrink-0">
                <div className="flex h-8 items-end gap-[3px]">
                  {daily.length ? (
                    daily.map((point, index) => (
                      <div
                        key={`${point.day}-${index}`}
                        className={`flex-1 rounded-t-sm ${card.barClass} opacity-65`}
                        style={{
                          height: `${Math.max(
                            5,
                            ((point?.value || 0) / max) * 100,
                          )}%`,
                        }}
                        title={`${point.day}: ${point.value}`}
                      />
                    ))
                  ) : (
                    <div className="h-1 w-full rounded-full bg-[#E5E7EB]" />
                  )}
                </div>

                <div className="mt-1 flex justify-between text-[6px] font-medium text-[#CBD5E1]">
                  {daily.map((point, index) => (
                    <span key={`${point.day}-${index}`}>{point.day}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

  /* =====================================================
     BROWSER CARD
  ===================================================== */

  const renderBrowserCards = () => {
    return (
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;

          const daily = card.daily || [];

          const max = Math.max(
            ...daily.map((item) => item?.value || 0),
            1,
          );

          const growth = getGrowth(daily);

          const positive = growth >= 0;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-[#E7EAF0] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition hover:shadow-md"
            >
              {/* HEADER */}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#475569]">
                      {card.label}
                    </p>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-black leading-none tracking-tight text-[#172033]">
                        {loading
                          ? "—"
                          : card.value.toLocaleString("en-IN")}
                      </span>

                      {!loading && (
                        <span
                          className={`text-[10px] font-bold ${
                            positive
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {growth}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SUBTEXT */}

              <p className="mt-3 text-[10px] font-medium text-[#94A3B8]">
                {loading ? "Loading..." : card.sub}
              </p>

              {/* GRAPH */}

              <div className="mt-3">
                <div className="flex h-10 items-end gap-1">
                  {daily.length ? (
                    daily.map((point, index) => (
                      <div
                        key={`${point.day}-${index}`}
                        className={`flex-1 rounded-t-sm ${card.barClass} opacity-65`}
                        style={{
                          height: `${Math.max(
                            5,
                            ((point?.value || 0) / max) * 100,
                          )}%`,
                        }}
                        title={`${point.day}: ${point.value}`}
                      />
                    ))
                  ) : (
                    <div className="h-1 w-full rounded-full bg-[#E5E7EB]" />
                  )}
                </div>

                <div className="mt-1 flex justify-between text-[7px] font-medium text-[#CBD5E1]">
                  {daily.map((point, index) => (
                    <span key={`${point.day}-${index}`}>
                      {point.day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {platform === "browser"
        ? renderBrowserCards()
        : renderAppCards()}
    </>
  );
}