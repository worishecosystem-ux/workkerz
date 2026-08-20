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
  AlertCircle,
  CheckCircle2,
  Package,
  ChevronRight,
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
  [key: string]: any;
};

type RecentBooking = {
  id: string;
  created_at?: string | null;
  status?: string | null;
  worker_name?: string | null;
  customer_name?: string | null;
  user_name?: string | null;
  worker_id?: string | null;
  customer_id?: string | null;
  amount?: number | string | null;
  total_amount?: number | string | null;
  total?: number | string | null;
  [key: string]: any;
};

const EMPTY: DashboardStats = {
  workers: 0,
  orders: 0,
  shops: 0,
  bookings: 0,
  workersToday: 0,
  ordersToday: 0,
  shopsToday: 0,
  bookingsToday: 0,
};

export default function DashboardTab({ onNavigate }: DashboardTabProps) {
  const [stats, setStats] = useState<DashboardStats>(EMPTY);

  const [orders, setOrders] = useState<RecentOrder[]>([]);

  const [bookings, setBookings] = useState<RecentBooking[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const now = new Date();

      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      const from = start.toISOString();

      const to = end.toISOString();

      const [
        workers,
        workersToday,
        orderCount,
        ordersToday,
        shops,
        shopsToday,
        bookingsCount,
        bookingsToday,
      ] = await Promise.all([
        supabase
          .from("workers")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("workers")
          .select("*", { count: "exact", head: true })
          .gte("created_at", from)
          .lt("created_at", to),

        supabase
          .from("orders")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", from)
          .lt("created_at", to),

        supabase
          .from("shops")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("shops")
          .select("*", { count: "exact", head: true })
          .gte("created_at", from)
          .lt("created_at", to),

        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", from)
          .lt("created_at", to),
      ]);

      const errors = [
        workers.error,
        workersToday.error,
        orderCount.error,
        ordersToday.error,
        shops.error,
        shopsToday.error,
        bookingsCount.error,
        bookingsToday.error,
      ].filter(Boolean);

      if (errors.length) {
        console.error("Dashboard errors:", errors);

        throw new Error(
          errors[0]?.message || "Unable to load dashboard.",
        );
      }

      setStats({
        workers: workers.count ?? 0,
        workersToday: workersToday.count ?? 0,

        orders: orderCount.count ?? 0,
        ordersToday: ordersToday.count ?? 0,

        shops: shops.count ?? 0,
        shopsToday: shopsToday.count ?? 0,

        bookings: bookingsCount.count ?? 0,
        bookingsToday: bookingsToday.count ?? 0,
      });

      /*
      =====================================================
      RECENT ORDERS + RECENT BOOKINGS
      =====================================================
      */

      const [recentOrders, recentBookings] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6),

        supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (recentOrders.error) {
        console.error("Recent orders:", recentOrders.error);

        setOrders([]);
      } else {
        setOrders((recentOrders.data || []) as RecentOrder[]);
      }

      if (recentBookings.error) {
        console.error("Recent bookings:", recentBookings.error);

        setBookings([]);
      } else {
        setBookings((recentBookings.data || []) as RecentBooking[]);
      }
    } catch (err: any) {
      console.error("Dashboard:", err);

      setError(
        err?.message || "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  /*
  =====================================================
  INITIAL LOAD + REALTIME
  =====================================================
  */

  useEffect(() => {
    fetchDashboard();

    const channel = supabase
      .channel("admin-dashboard")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workers",
        },
        () => fetchDashboard(true),
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => fetchDashboard(true),
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shops",
        },
        () => fetchDashboard(true),
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => fetchDashboard(true),
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboard]);

  /*
  =====================================================
  DASHBOARD CARDS
  =====================================================
  */

  const cards = [
    {
      title: "Workers",
      value: stats.workers,
      today: stats.workersToday,
      icon: Users,
      gradient: "from-orange-500 to-amber-400",
      light: "bg-orange-50",
    },

    {
      title: "Orders",
      value: stats.orders,
      today: stats.ordersToday,
      icon: ShoppingBag,
      gradient: "from-blue-600 to-cyan-500",
      light: "bg-blue-50",
    },

    {
      title: "Shops",
      value: stats.shops,
      today: stats.shopsToday,
      icon: Store,
      gradient: "from-violet-600 to-purple-500",
      light: "bg-violet-50",
    },

    {
      title: "Bookings",
      value: stats.bookings,
      today: stats.bookingsToday,
      icon: CalendarCheck,
      gradient: "from-emerald-600 to-teal-500",
      light: "bg-emerald-50",
    },
  ];

  /*
  =====================================================
  DATE
  =====================================================
  */

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "—";
    }

    return value.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
  =====================================================
  ORDER NAME
  =====================================================
  */

  const orderName = (order: RecentOrder) =>
    order.customer_name ||
    order.user_name ||
    order.name ||
    order.customer_id ||
    `Order #${order.id?.slice(0, 8)}`;

  /*
  =====================================================
  BOOKING NAME
  =====================================================
  */

  const bookingName = (booking: RecentBooking) =>
    booking.worker_name ||
    booking.customer_name ||
    booking.user_name ||
    booking.worker_id ||
    booking.customer_id ||
    `Booking #${booking.id?.slice(0, 8)}`;

  /*
  =====================================================
  ORDER AMOUNT
  =====================================================
  */

  const amount = (order: RecentOrder) => {
    const value =
      order.total_amount ??
      order.total ??
      order.amount;

    if (value == null || value === "") {
      return null;
    }

    const number = Number(value);

    return Number.isNaN(number)
      ? String(value)
      : `₹${number.toLocaleString("en-IN")}`;
  };

  /*
  =====================================================
  BOOKING AMOUNT
  =====================================================
  */

  const bookingAmount = (booking: RecentBooking) => {
    const value =
      booking.total_amount ??
      booking.total ??
      booking.amount;

    if (value == null || value === "") {
      return null;
    }

    const number = Number(value);

    return Number.isNaN(number)
      ? String(value)
      : `₹${number.toLocaleString("en-IN")}`;
  };

  /*
  =====================================================
  STATUS
  =====================================================
  */

  const statusClass = (status?: string | null) => {
    const value = String(status || "")
      .toLowerCase()
      .trim();

    if (
      [
        "completed",
        "complete",
        "delivered",
        "accepted",
        "success",
      ].includes(value)
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      [
        "cancelled",
        "canceled",
        "rejected",
        "failed",
      ].includes(value)
    ) {
      return "bg-rose-50 text-rose-700";
    }

    if (
      [
        "processing",
        "confirmed",
        "approved",
      ].includes(value)
    ) {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  /*
  =====================================================
  LOADING
  =====================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <DashboardHeader
          refreshing={false}
          onRefresh={() => fetchDashboard(true)}
        />

        <div className="mx-auto w-full max-w-[1600px] p-3 pt-4 sm:p-5 md:p-6 lg:p-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  /*
  =====================================================
  ERROR
  =====================================================
  */

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <DashboardHeader
          refreshing={refreshing}
          onRefresh={() => fetchDashboard(true)}
        />

        <div className="mx-auto w-full max-w-[1600px] p-3 pt-4 sm:p-5 md:p-6 lg:p-8">
          <div className="rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>

            <h2 className="mt-4 text-base font-black text-[#0F172A]">
              Dashboard data could not be loaded
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-[#64748B]">
              {error}
            </p>

            <button
              onClick={() => fetchDashboard(true)}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 text-sm font-bold text-white transition active:scale-[0.97]"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
  =====================================================
  MAIN
  =====================================================
  */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader
        refreshing={refreshing}
        onRefresh={() => fetchDashboard(true)}
      />

      <div className="mx-auto w-full max-w-[1600px] p-3 pt-4 sm:p-5 md:p-6 lg:p-8">

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 xl:gap-5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group relative min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4 md:p-5"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient}`}
                />

                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#64748B] sm:text-xs">
                      Total {card.title}
                    </p>

                    <h2 className="mt-1 text-xl font-black tracking-tight text-[#0F172A] sm:text-2xl md:text-3xl">
                      {card.value.toLocaleString("en-IN")}
                    </h2>
                  </div>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.light} sm:h-10 sm:w-10 md:h-11 md:w-11`}
                  >
                    <Icon className="h-4 w-4 text-[#FF5C39] sm:h-5 sm:w-5" />
                  </div>
                </div>

                <div className="mt-2 flex min-w-0 items-center gap-1.5 sm:mt-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  </div>

                  <span className="truncate text-[9px] font-medium text-[#64748B] sm:text-xs">
                    {card.today
                      ? `+${card.today} today`
                      : `No new ${card.title.toLowerCase()} today`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 md:gap-5 xl:grid-cols-3">

          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <div className="min-w-0 xl:col-span-2 grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* =================================================
                RECENT ORDERS
            ================================================= */}

            <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-[#0F172A] sm:text-base">
                    Recent Orders
                  </h2>

                  <p className="mt-0.5 text-[10px] text-[#64748B] sm:text-xs">
                    Latest marketplace orders
                  </p>
                </div>

                <button
                  onClick={() => onNavigate?.("orders")}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#FF5C39] transition hover:bg-orange-50 active:scale-[0.97] sm:text-xs"
                >
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50">
                    <ShoppingBag className="h-5 w-5 text-gray-300" />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-[#64748B]">
                    No recent orders
                  </p>

                  <p className="mt-1 text-[10px] text-[#94A3B8]">
                    New orders will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const price = amount(order);

                    return (
                      <button
                        key={order.id}
                        onClick={() => onNavigate?.("orders")}
                        className="w-full px-4 py-3 text-left transition hover:bg-[#F8FAFC] active:bg-gray-100 sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                            <Package className="h-4 w-4 text-[#FF5C39]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#0F172A]">
                              {orderName(order)}
                            </p>

                            <div className="mt-1 flex min-w-0 items-center gap-1.5">
                              <p className="truncate text-[10px] text-[#94A3B8]">
                                #{order.id?.slice(0, 8)}
                              </p>

                              <span className="shrink-0 text-[#CBD5E1]">
                                •
                              </span>

                              <p className="truncate text-[10px] text-[#94A3B8]">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {price && (
                              <p className="text-xs font-black text-[#0F172A]">
                                {price}
                              </p>
                            )}

                            <span
                              className={`mt-1 inline-flex max-w-[80px] truncate rounded-full px-2 py-0.5 text-[8px] font-bold capitalize ${statusClass(
                                order.status,
                              )}`}
                            >
                              {order.status || "Pending"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* =================================================
                RECENT BOOKINGS
            ================================================= */}

            <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-[#0F172A] sm:text-base">
                    Recent Bookings
                  </h2>

                  <p className="mt-0.5 text-[10px] text-[#64748B] sm:text-xs">
                    Latest worker bookings
                  </p>
                </div>

                <button
                  onClick={() => onNavigate?.("bookings")}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#FF5C39] transition hover:bg-orange-50 active:scale-[0.97] sm:text-xs"
                >
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                    <CalendarCheck className="h-5 w-5 text-emerald-500" />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-[#64748B]">
                    No recent bookings
                  </p>

                  <p className="mt-1 text-[10px] text-[#94A3B8]">
                    New bookings will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map((booking) => {
                    const price = bookingAmount(booking);

                    return (
                      <button
                        key={booking.id}
                        onClick={() => onNavigate?.("bookings")}
                        className="w-full px-4 py-3 text-left transition hover:bg-[#F8FAFC] active:bg-gray-100 sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                            <CalendarCheck className="h-4 w-4 text-emerald-600" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#0F172A]">
                              {bookingName(booking)}
                            </p>

                            <div className="mt-1 flex min-w-0 items-center gap-1.5">
                              <p className="truncate text-[10px] text-[#94A3B8]">
                                #{booking.id?.slice(0, 8)}
                              </p>

                              <span className="shrink-0 text-[#CBD5E1]">
                                •
                              </span>

                              <p className="truncate text-[10px] text-[#94A3B8]">
                                {formatDate(booking.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {price && (
                              <p className="text-xs font-black text-[#0F172A]">
                                {price}
                              </p>
                            )}

                            <span
                              className={`mt-1 inline-flex max-w-[80px] truncate rounded-full px-2 py-0.5 text-[8px] font-bold capitalize ${statusClass(
                                booking.status,
                              )}`}
                            >
                              {booking.status || "Pending"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-5 md:px-6">
              <h2 className="text-sm font-black text-[#0F172A] sm:text-base">
                Quick Actions
              </h2>

              <p className="mt-0.5 text-[10px] text-[#64748B] sm:text-xs">
                Common admin actions
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 p-3 sm:p-4 md:p-5">
              <QuickAction
                icon={Users}
                title="Manage Workers"
                description="View worker accounts"
                color="orange"
                onClick={() => onNavigate?.("workers")}
              />

              <QuickAction
                icon={ShoppingBag}
                title="Manage Orders"
                description="Review marketplace orders"
                color="blue"
                onClick={() => onNavigate?.("orders")}
              />

              <QuickAction
                icon={CalendarCheck}
                title="Manage Bookings"
                description="Review worker bookings"
                color="green"
                onClick={() => onNavigate?.("bookings")}
              />

              <QuickAction
                icon={Store}
                title="Manage Shops"
                description="View registered shops"
                color="purple"
                onClick={() => onNavigate?.("shops")}
              />
            </div>
          </section>
        </div>

        {/* =================================================
            PLATFORM ACTIVITY
        ================================================= */}

        <section className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:mt-5">
          <div className="border-b border-gray-100 px-4 py-4 sm:px-5 md:px-6">
            <h2 className="text-sm font-black text-[#0F172A] sm:text-base">
              Platform Activity
            </h2>

            <p className="mt-0.5 text-[10px] text-[#64748B] sm:text-xs">
              New activity today
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3 sm:gap-4 sm:p-4 md:grid-cols-4 md:p-5 lg:gap-5">
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
        </section>

        {/* =================================================
            LIVE
        ================================================= */}

        <div className="flex items-center justify-center gap-2 py-4 text-[10px] text-[#94A3B8] sm:text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          Dashboard updates automatically
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

function DashboardHeader({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-gray-100 bg-white/95 px-3 py-2.5 pt-15 backdrop-blur-md sm:min-h-18 sm:px-5 sm:py-0 sm:pt-0 md:min-h-19 md:px-6 lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-[#FF5C39]" />

          <h1 className="truncate text-lg font-black tracking-tight text-[#0F172A] sm:text-xl md:text-2xl">
            Dashboard
          </h1>
        </div>

        <p className="mt-0.5 hidden text-xs text-[#64748B] sm:block sm:text-sm">
          Overview of your Workkerz platform.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#64748B] md:flex">
          <Clock3 className="h-4 w-4" />

          Today
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#64748B] shadow-sm transition hover:border-gray-300 hover:bg-[#F8FAFC] active:scale-[0.94] disabled:opacity-50 sm:h-10 sm:w-10"
          title="Refresh dashboard"
          aria-label="Refresh dashboard"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  color: "orange" | "blue" | "green" | "purple";
  onClick: () => void;
}) {
  const styles = {
    orange: {
      icon: "bg-orange-50 text-orange-600",
      hover:
        "hover:border-orange-200 hover:bg-orange-50/50",
      active: "active:bg-orange-100",
    },

    blue: {
      icon: "bg-blue-50 text-blue-600",
      hover:
        "hover:border-blue-200 hover:bg-blue-50/50",
      active: "active:bg-blue-100",
    },

    green: {
      icon: "bg-emerald-50 text-emerald-600",
      hover:
        "hover:border-emerald-200 hover:bg-emerald-50/50",
      active: "active:bg-emerald-100",
    },

    purple: {
      icon: "bg-violet-50 text-violet-600",
      hover:
        "hover:border-violet-200 hover:bg-violet-50/50",
      active: "active:bg-violet-100",
    },
  };

  const style = styles[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[64px] w-full min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm transition duration-150 hover:shadow-md active:scale-[0.985] ${style.hover} ${style.active} sm:min-h-[68px] sm:p-3.5`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon} sm:h-10 sm:w-10`}
      >
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-[#0F172A] sm:text-sm">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-[#64748B] sm:text-xs">
          {description}
        </p>
      </div>

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 transition group-hover:bg-white">
        <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#FF5C39]" />
      </div>
    </button>
  );
}

/* =========================================================
   ACTIVITY
========================================================= */

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
    <div className="min-w-0 rounded-xl border border-gray-100 bg-[#F8FAFC] p-3 transition hover:bg-white hover:shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-[10px] font-semibold leading-4 text-[#64748B] sm:text-xs">
          {label}
        </p>

        <Icon className="h-3.5 w-3.5 shrink-0 text-[#FF5C39] sm:h-4 sm:w-4" />
      </div>

      <p className="mt-2 text-lg font-black text-[#0F172A] sm:text-xl md:text-2xl">
        {value.toLocaleString("en-IN")}
      </p>

      <div className="mt-1 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />

        <span className="text-[9px] text-[#94A3B8] sm:text-[10px]">
          Today
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* STATS */}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-5"
          >
            <div className="flex justify-between gap-3">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-gray-100 sm:w-24" />

                <div className="h-7 w-14 rounded bg-gray-100 sm:h-8 sm:w-20" />
              </div>

              <div className="h-9 w-9 shrink-0 rounded-xl bg-gray-100 sm:h-11 sm:w-11" />
            </div>

            <div className="mt-4 h-3 w-24 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* MAIN */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:col-span-2">
          <div className="h-72 rounded-2xl border border-gray-100 bg-white sm:h-80" />

          <div className="h-72 rounded-2xl border border-gray-100 bg-white sm:h-80" />
        </div>

        <div className="h-72 rounded-2xl border border-gray-100 bg-white sm:h-80" />
      </div>

      {/* ACTIVITY */}

      <div className="mt-5 h-44 rounded-2xl border border-gray-100 bg-white sm:h-48" />
    </div>
  );
}