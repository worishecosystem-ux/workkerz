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
  const [stats, setStats] = useState(EMPTY);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
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
        bookings,
        bookingsToday,
      ] = await Promise.all([
        supabase.from("workers").select("*", { count: "exact", head: true }),
        supabase.from("workers").select("*", { count: "exact", head: true })
          .gte("created_at", from).lt("created_at", to),

        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true })
          .gte("created_at", from).lt("created_at", to),

        supabase.from("shops").select("*", { count: "exact", head: true }),
        supabase.from("shops").select("*", { count: "exact", head: true })
          .gte("created_at", from).lt("created_at", to),

        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true })
          .gte("created_at", from).lt("created_at", to),
      ]);

      const errors = [
        workers.error,
        workersToday.error,
        orderCount.error,
        ordersToday.error,
        shops.error,
        shopsToday.error,
        bookings.error,
        bookingsToday.error,
      ].filter(Boolean);

      if (errors.length) {
        console.error("Dashboard errors:", errors);
        throw new Error(errors[0]?.message || "Unable to load dashboard.");
      }

      setStats({
        workers: workers.count ?? 0,
        workersToday: workersToday.count ?? 0,
        orders: orderCount.count ?? 0,
        ordersToday: ordersToday.count ?? 0,
        shops: shops.count ?? 0,
        shopsToday: shopsToday.count ?? 0,
        bookings: bookings.count ?? 0,
        bookingsToday: bookingsToday.count ?? 0,
      });

      const recent = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (recent.error) {
        console.error("Recent orders:", recent.error);
        setOrders([]);
      } else {
        setOrders((recent.data || []) as RecentOrder[]);
      }
    } catch (err: any) {
      console.error("Dashboard:", err);
      setError(err?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const channel = supabase
      .channel("admin-dashboard")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "workers",
      }, () => fetchDashboard(true))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
      }, () => fetchDashboard(true))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "shops",
      }, () => fetchDashboard(true))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bookings",
      }, () => fetchDashboard(true))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboard]);

  const cards = [
    {
      title: "Workers",
      value: stats.workers,
      today: stats.workersToday,
      icon: Users,
    },
    {
      title: "Orders",
      value: stats.orders,
      today: stats.ordersToday,
      icon: ShoppingBag,
    },
    {
      title: "Shops",
      value: stats.shops,
      today: stats.shopsToday,
      icon: Store,
    },
    {
      title: "Bookings",
      value: stats.bookings,
      today: stats.bookingsToday,
      icon: CalendarCheck,
    },
  ];

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "—";

    return value.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const orderName = (order: RecentOrder) =>
    order.customer_name ||
    order.user_name ||
    order.name ||
    order.customer_id ||
    `Order #${order.id?.slice(0, 8)}`;

  const amount = (order: RecentOrder) => {
    const value = order.total_amount ?? order.total ?? order.amount;
    if (value == null || value === "") return null;

    const number = Number(value);
    return Number.isNaN(number)
      ? String(value)
      : `₹${number.toLocaleString("en-IN")}`;
  };

  const statusClass = (status?: string | null) => {
    const value = String(status || "").toLowerCase().trim();

    if (
      ["completed", "complete", "delivered", "accepted", "success"].includes(
        value,
      )
    )
      return "bg-emerald-50 text-emerald-700";

    if (
      ["cancelled", "canceled", "rejected", "failed"].includes(value)
    )
      return "bg-rose-50 text-rose-700";

    if (
      ["processing", "confirmed"].includes(value)
    )
      return "bg-blue-50 text-blue-700";

    return "bg-amber-50 text-amber-700";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <DashboardHeader
          refreshing={false}
          onRefresh={() => fetchDashboard(true)}
        />
        <div className="p-3 sm:p-5 md:p-6 lg:p-8">
          <DashboardSkeleton />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <DashboardHeader
          refreshing={refreshing}
          onRefresh={() => fetchDashboard(true)}
        />

        <div className="mx-auto w-full max-w-[1600px] p-3 sm:p-5 md:p-6 lg:p-8">
          <div className="rounded-2xl border border-rose-100 bg-white p-6 text-center sm:p-8">
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
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 text-sm font-bold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader
        refreshing={refreshing}
        onRefresh={() => fetchDashboard(true)}
      />

      <div className="mx-auto w-full max-w-[1600px] p-3 sm:p-5 md:p-6 lg:p-8">
        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
          {cards.map(card => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="min-w-0 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4 md:p-5"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-[#64748B] sm:text-xs md:text-sm">
                      Total {card.title}
                    </p>

                    <h2 className="mt-1.5 text-xl font-black text-[#0F172A] sm:mt-2 sm:text-2xl md:text-3xl">
                      {card.value.toLocaleString("en-IN")}
                    </h2>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 sm:h-10 sm:w-10 md:h-11 md:w-11">
                    <Icon className="h-4 w-4 text-[#FF5C39] sm:h-5 sm:w-5" />
                  </div>
                </div>

                <div className="mt-2 flex min-w-0 items-center gap-1.5 sm:mt-3">
                  <TrendingUp className="h-3 w-3 shrink-0 text-emerald-500" />
                  <span className="truncate text-[10px] text-[#64748B] sm:text-xs">
                    {card.today
                      ? `+${card.today} today`
                      : `No new ${card.title.toLowerCase()} today`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 md:gap-5 xl:grid-cols-3">
          {/* RECENT ORDERS */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5 md:px-6">
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
                className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#FF5C39] sm:text-xs"
              >
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center px-4 text-center sm:h-60">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
                  <ShoppingBag className="h-6 w-6 text-gray-300" />
                </div>

                <p className="mt-3 text-sm font-semibold text-[#64748B]">
                  No recent orders
                </p>

                <p className="mt-1 text-xs text-[#94A3B8]">
                  New orders will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.map(order => {
                  const price = amount(order);

                  return (
                    <div
                      key={order.id}
                      className="px-4 py-3 transition hover:bg-[#F8FAFC] sm:px-5 md:px-6 sm:py-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 sm:h-10 sm:w-10">
                          <Package className="h-4 w-4 text-[#FF5C39] sm:h-5 sm:w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#0F172A] sm:text-sm">
                            {orderName(order)}
                          </p>

                          <div className="mt-1 flex min-w-0 items-center gap-1.5">
                            <p className="truncate text-[10px] text-[#94A3B8] sm:text-[11px]">
                              #{order.id?.slice(0, 8)}
                            </p>

                            <span className="shrink-0 text-[#CBD5E1]">
                              •
                            </span>

                            <p className="truncate text-[10px] text-[#94A3B8] sm:text-[11px]">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {price && (
                            <p className="text-xs font-black text-[#0F172A] sm:text-sm">
                              {price}
                            </p>
                          )}

                          <span
                            className={`mt-1 inline-flex max-w-20 truncate rounded-full px-2 py-0.5 text-[8px] font-bold capitalize sm:max-w-none sm:text-[10px] ${statusClass(order.status)}`}
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
          </section>

          {/* QUICK ACTIONS */}
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
          </section>
        </div>

        {/* ACTIVITY */}
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

        {/* LIVE */}
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

function DashboardHeader({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-gray-100 bg-white px-3 py-3 sm:min-h-20 sm:px-5 md:px-6 lg:px-8 lg:py-0">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-black text-[#0F172A] sm:text-xl md:text-2xl">
          Dashboard
        </h1>

        <p className="mt-0.5 hidden text-xs text-[#64748B] sm:block sm:text-sm">
          Overview of your Workkerz platform.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 text-xs text-[#64748B] md:flex">
          <Clock3 className="h-4 w-4" />
          Today
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#64748B] transition hover:bg-[#F8FAFC] disabled:opacity-50 sm:h-10 sm:w-10"
          title="Refresh dashboard"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </header>
  );
}

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
      onClick={onClick}
      className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-gray-200 hover:bg-[#F8FAFC]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
        <Icon className="h-4 w-4 text-[#FF5C39]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-[#0F172A] sm:text-sm">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-[#64748B] sm:text-xs">
          {description}
        </p>
      </div>

      <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-[#FF5C39]" />
    </button>
  );
}

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
    <div className="min-w-0 rounded-xl border border-gray-100 bg-[#F8FAFC] p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-[10px] font-medium leading-4 text-[#64748B] sm:text-xs">
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

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5"
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

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="h-72 rounded-2xl border border-gray-100 bg-white sm:h-80 xl:col-span-2" />
        <div className="h-72 rounded-2xl border border-gray-100 bg-white sm:h-80" />
      </div>

      <div className="mt-5 h-44 rounded-2xl border border-gray-100 bg-white sm:h-48" />
    </div>
  );
}