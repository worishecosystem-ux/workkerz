"use client";

import {
  Users,
  ShoppingBag,
  Store,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Clock3,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type DashboardTabProps = {
  onNavigate?: (tab: string) => void;
};

type DashboardStats = {
  workers: number;
  orders: number;
  shops: number;
  bookings: number;

  workersToday: number;
  ordersToday: number;
  shopsToday: number;
  bookingsToday: number;
};

type RecentOrder = {
  id: string;
  created_at?: string | null;
  status?: string | null;
  total_amount?: number | string | null;
  total?: number | string | null;
  amount?: number | string | null;
  customer_name?: string | null;
  customer_id?: string | null;
  user_name?: string | null;
  name?: string | null;
};

const EMPTY_STATS: DashboardStats = {
  workers: 0,
  orders: 0,
  shops: 0,
  bookings: 0,
  workersToday: 0,
  ordersToday: 0,
  shopsToday: 0,
  bookingsToday: 0,
};

export default function DashboardTab({
  onNavigate,
}: DashboardTabProps) {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /*
         * =========================================================
         * TODAY RANGE
         * =========================================================
         */

        const now = new Date();

        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );

        const startOfTomorrow = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0,
          0,
          0,
          0
        );

        const todayStart = startOfToday.toISOString();
        const tomorrowStart = startOfTomorrow.toISOString();

        /*
         * =========================================================
         * COUNTS
         * =========================================================
         */

        const [
          workersResult,
          workersTodayResult,

          ordersResult,
          ordersTodayResult,

          shopsResult,
          shopsTodayResult,

          bookingsResult,
          bookingsTodayResult,
        ] = await Promise.all([
          // WORKERS
          supabase
            .from("workers")
            .select("*", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("workers")
            .select("*", {
              count: "exact",
              head: true,
            })
            .gte("created_at", todayStart)
            .lt("created_at", tomorrowStart),

          // ORDERS
          supabase
            .from("orders")
            .select("*", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("orders")
            .select("*", {
              count: "exact",
              head: true,
            })
            .gte("created_at", todayStart)
            .lt("created_at", tomorrowStart),

          // SHOPS
          supabase
            .from("shops")
            .select("*", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("shops")
            .select("*", {
              count: "exact",
              head: true,
            })
            .gte("created_at", todayStart)
            .lt("created_at", tomorrowStart),

          // BOOKINGS
          supabase
            .from("bookings")
            .select("*", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("bookings")
            .select("*", {
              count: "exact",
              head: true,
            })
            .gte("created_at", todayStart)
            .lt("created_at", tomorrowStart),
        ]);

        /*
         * =========================================================
         * HANDLE TABLE ERRORS
         * =========================================================
         */

        const tableErrors = [
          workersResult.error,
          workersTodayResult.error,
          ordersResult.error,
          ordersTodayResult.error,
          shopsResult.error,
          shopsTodayResult.error,
          bookingsResult.error,
          bookingsTodayResult.error,
        ].filter(Boolean);

        if (tableErrors.length > 0) {
          console.error(
            "Dashboard Supabase errors:",
            tableErrors
          );

          throw new Error(
            tableErrors[0]?.message ||
              "Unable to load dashboard data."
          );
        }

        /*
         * =========================================================
         * SET STATS
         * =========================================================
         */

        setStats({
          workers: workersResult.count ?? 0,
          workersToday: workersTodayResult.count ?? 0,

          orders: ordersResult.count ?? 0,
          ordersToday: ordersTodayResult.count ?? 0,

          shops: shopsResult.count ?? 0,
          shopsToday: shopsTodayResult.count ?? 0,

          bookings: bookingsResult.count ?? 0,
          bookingsToday: bookingsTodayResult.count ?? 0,
        });

        /*
         * =========================================================
         * RECENT ORDERS
         * =========================================================
         */

        const recentOrdersResult = await supabase
          .from("orders")
          .select("*")
          .order("created_at", {
            ascending: false,
          })
          .limit(6);

        if (recentOrdersResult.error) {
          console.error(
            "Recent orders error:",
            recentOrdersResult.error
          );

          setRecentOrders([]);
        } else {
          setRecentOrders(
            (recentOrdersResult.data || []) as RecentOrder[]
          );
        }
      } catch (err: any) {
        console.error("Dashboard error:", err);

        setError(
          err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    fetchDashboard();

    /*
     * =======================================================
     * SUPABASE REALTIME
     * =======================================================
     */

    const channel = supabase
      .channel("admin-dashboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workers",
        },
        () => {
          fetchDashboard(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchDashboard(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shops",
        },
        () => {
          fetchDashboard(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchDashboard(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboard]);

  /*
   * =========================================================
   * STATS CONFIG
   * =========================================================
   */

  const statsCards = [
    {
      title: "Total Workers",
      value: stats.workers,
      change:
        stats.workersToday > 0
          ? `+${stats.workersToday} today`
          : "No new workers today",
      icon: Users,
      color: "orange",
    },
    {
      title: "Total Orders",
      value: stats.orders,
      change:
        stats.ordersToday > 0
          ? `+${stats.ordersToday} today`
          : "No orders today",
      icon: ShoppingBag,
      color: "blue",
    },
    {
      title: "Total Shops",
      value: stats.shops,
      change:
        stats.shopsToday > 0
          ? `+${stats.shopsToday} today`
          : "No new shops today",
      icon: Store,
      color: "purple",
    },
    {
      title: "Total Bookings",
      value: stats.bookings,
      change:
        stats.bookingsToday > 0
          ? `+${stats.bookingsToday} today`
          : "No bookings today",
      icon: CalendarCheck,
      color: "green",
    },
  ];

  /*
   * =========================================================
   * DATE FORMATTER
   * =========================================================
   */

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * =========================================================
   * ORDER NAME
   * =========================================================
   */

  const getOrderName = (order: RecentOrder) => {
    return (
      order.customer_name ||
      order.user_name ||
      order.name ||
      order.customer_id ||
      `Order #${order.id?.slice(0, 8)}`
    );
  };

  /*
   * =========================================================
   * ORDER AMOUNT
   * =========================================================
   */

  const getOrderAmount = (order: RecentOrder) => {
    const amount =
      order.total_amount ??
      order.total ??
      order.amount;

    if (
      amount === null ||
      amount === undefined ||
      amount === ""
    ) {
      return null;
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return String(amount);
    }

    return `₹${numericAmount.toLocaleString("en-IN")}`;
  };

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  const getStatusClass = (status?: string | null) => {
    const normalized = String(status || "")
      .toLowerCase()
      .trim();

    if (
      normalized === "completed" ||
      normalized === "complete" ||
      normalized === "delivered" ||
      normalized === "accepted" ||
      normalized === "success"
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled" ||
      normalized === "rejected" ||
      normalized === "failed"
    ) {
      return "bg-rose-50 text-rose-700";
    }

    if (
      normalized === "processing" ||
      normalized === "confirmed" ||
      normalized === "accepted"
    ) {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <DashboardHeader
          refreshing={false}
          onRefresh={() => fetchDashboard(true)}
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <DashboardHeader
          refreshing={refreshing}
          onRefresh={() => fetchDashboard(true)}
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white border border-rose-100 rounded-2xl p-6 sm:p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>

            <h2 className="text-base font-black text-[#0F172A] mt-4">
              Dashboard data could not be loaded
            </h2>

            <p className="text-sm text-[#64748B] mt-2 max-w-lg mx-auto">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              className="
                mt-5
                inline-flex
                items-center
                justify-center
                gap-2
                h-10
                px-5
                rounded-xl
                bg-[#0F172A]
                text-white
                text-sm
                font-bold
                hover:bg-black
                transition
              "
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * MAIN DASHBOARD
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <DashboardHeader
        refreshing={refreshing}
        onRefresh={() => fetchDashboard(true)}
      />

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {statsCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="
                  bg-white
                  border
                  border-gray-100
                  rounded-2xl
                  p-4
                  sm:p-5
                  shadow-sm
                  hover:shadow-md
                  transition-shadow
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-[#64748B] truncate">
                      {stat.title}
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2">
                      {stat.value.toLocaleString("en-IN")}
                    </h2>
                  </div>

                  <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5C39]" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3 sm:mt-4 text-[11px] sm:text-xs text-[#64748B]">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />

                  <span className="truncate">
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 mt-5 sm:mt-6">
          {/* ================================================= */}
          {/* RECENT ORDERS */}
          {/* ================================================= */}

          <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#0F172A]">
                  Recent Orders
                </h2>

                <p className="text-[11px] sm:text-xs text-[#64748B] mt-1">
                  Latest marketplace orders
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate?.("orders")}
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-bold
                  text-[#FF5C39]
                  shrink-0
                  hover:text-[#e94f2f]
                "
              >
                View all
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-6">
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-300" />
                  </div>

                  <p className="text-sm font-semibold text-[#64748B] mt-3">
                    No recent orders
                  </p>

                  <p className="text-xs text-[#94A3B8] mt-1">
                    New orders will appear here automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const amount = getOrderAmount(order);

                  return (
                    <div
                      key={order.id}
                      className="
                        px-4
                        sm:px-6
                        py-3.5
                        hover:bg-[#F8FAFC]
                        transition
                      "
                    >
                      <div className="flex items-center gap-3">
                        {/* ICON */}
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5C39]" />
                        </div>

                        {/* INFO */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#0F172A] truncate">
                              {getOrderName(order)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[11px] text-[#94A3B8] truncate">
                              #{order.id?.slice(0, 8)}
                            </p>

                            <span className="text-[#CBD5E1]">
                              •
                            </span>

                            <p className="text-[11px] text-[#94A3B8]">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div className="text-right shrink-0">
                          {amount && (
                            <p className="text-xs sm:text-sm font-black text-[#0F172A]">
                              {amount}
                            </p>
                          )}

                          <span
                            className={`
                              inline-flex
                              mt-1
                              px-2
                              py-0.5
                              rounded-full
                              text-[9px]
                              sm:text-[10px]
                              font-bold
                              capitalize
                              ${getStatusClass(order.status)}
                            `}
                          >
                            {order.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
              <h2 className="text-sm sm:text-base font-black text-[#0F172A]">
                Quick Actions
              </h2>

              <p className="text-[11px] sm:text-xs text-[#64748B] mt-1">
                Common admin actions
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-2.5">
              <QuickAction
                icon={Users}
                title="Manage Workers"
                description="View worker accounts"
                onClick={() => onNavigate?.("workers")}
              />

              <QuickAction
                icon={ShoppingBag}
                title="Manage Orders"
                description="Review marketplace orders"
                onClick={() => onNavigate?.("orders")}
              />

              <QuickAction
                icon={CalendarCheck}
                title="Manage Bookings"
                description="Review worker bookings"
                onClick={() => onNavigate?.("bookings")}
              />

              <QuickAction
                icon={Store}
                title="Manage Shops"
                description="View registered shops"
                onClick={() => onNavigate?.("shops")}
              />
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* PLATFORM ACTIVITY */}
        {/* ================================================= */}

        <div className="mt-5 sm:mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
            <h2 className="text-sm sm:text-base font-black text-[#0F172A]">
              Platform Activity
            </h2>

            <p className="text-[11px] sm:text-xs text-[#64748B] mt-1">
              New activity today
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <ActivityItem
                label="Worker Registrations"
                value={stats.workersToday}
                icon={Users}
              />

              <ActivityItem
                label="New Orders"
                value={stats.ordersToday}
                icon={ShoppingBag}
              />

              <ActivityItem
                label="New Bookings"
                value={stats.bookingsToday}
                icon={CalendarCheck}
              />

              <ActivityItem
                label="New Shops"
                value={stats.shopsToday}
                icon={Store}
              />
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* LIVE STATUS */}
        {/* ================================================= */}

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#94A3B8]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>

          Dashboard updates automatically
        </div>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * HEADER
 * =========================================================
 */

function DashboardHeader({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <header
      className="
        min-h-16
        sm:h-20
        bg-white
        border-b
        border-gray-100
        px-4
        sm:px-6
        lg:px-8
        py-3
        sm:py-0
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A]">
          Dashboard
        </h1>

        <p className="hidden sm:block text-sm text-[#64748B] mt-1">
          Overview of your Workkerz platform.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-sm text-[#64748B]">
          <Clock3 className="w-4 h-4" />

          <span>Today</span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-xl
            border
            border-gray-200
            bg-white
            flex
            items-center
            justify-center
            text-[#64748B]
            hover:bg-[#F8FAFC]
            hover:text-[#0F172A]
            transition
            disabled:opacity-50
          "
          title="Refresh dashboard"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
    </header>
  );
}

/*
 * =========================================================
 * QUICK ACTION
 * =========================================================
 */

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        flex
        items-center
        gap-3
        p-3
        rounded-xl
        border
        border-gray-100
        hover:bg-[#F8FAFC]
        hover:border-gray-200
        transition
        text-left
        group
      "
    >
      <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#FF5C39]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0F172A] truncate">
          {title}
        </p>

        <p className="text-xs text-[#64748B] mt-0.5 truncate">
          {description}
        </p>
      </div>

      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#FF5C39] transition shrink-0" />
    </button>
  );
}

/*
 * =========================================================
 * ACTIVITY ITEM
 * =========================================================
 */

function ActivityItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: any;
}) {
  return (
    <div className="rounded-xl bg-[#F8FAFC] border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] sm:text-xs font-medium text-[#64748B] leading-4">
          {label}
        </p>

        <Icon className="w-4 h-4 text-[#FF5C39] shrink-0" />
      </div>

      <p className="text-xl sm:text-2xl font-black text-[#0F172A] mt-2">
        {value.toLocaleString("en-IN")}
      </p>

      <div className="flex items-center gap-1 mt-1.5">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />

        <span className="text-[10px] text-[#94A3B8]">
          Today
        </span>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * SKELETON
 * =========================================================
 */

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* STATS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-2xl p-5"
          >
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-8 w-16 bg-gray-100 rounded" />
              </div>

              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            </div>

            <div className="h-3 w-24 bg-gray-100 rounded mt-5" />
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
        <div className="xl:col-span-2 h-80 bg-white border border-gray-100 rounded-2xl" />

        <div className="h-80 bg-white border border-gray-100 rounded-2xl" />
      </div>

      {/* ACTIVITY */}
      <div className="mt-6 h-48 bg-white border border-gray-100 rounded-2xl" />
    </div>
  );
}