"use client";

import {
  Users,
  ShoppingBag,
  Store,
  CalendarCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Package,
  ChevronRight,
  UserRoundPlus,
  MapPin,
  IndianRupee,
  Clock3,
  ArrowUpRight,
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardStats from "./DashboardStats";

type Props = {
  onNavigate?: (tab: string) => void;
};

type Platform = "android" | "tablet" | "browser";

type Stats = {
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

type WorkerRequest = {
  id: string;
  created_at?: string | null;
  status?: string | null;
  project_name?: string | null;
  project_type?: string | null;
  category?: string | null;
  subcategory?: string | null;
  requester_name?: string | null;
  customer_name?: string | null;
  company_name?: string | null;
  location?: string | null;
  work_date?: string | null;
  start_time?: string | null;
  workers_required?: number | string | null;
  budget?: number | string | null;
  [key: string]: any;
};

const EMPTY: Stats = {
  workers: 0,
  orders: 0,
  shops: 0,
  bookings: 0,
  workersToday: 0,
  ordersToday: 0,
  shopsToday: 0,
  bookingsToday: 0,
};

export default function DashboardTab({ onNavigate }: Props) {
  const [platform, setPlatform] = useState<Platform>("browser");

  const [stats, setStats] = useState<Stats>(EMPTY);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [requests, setRequests] = useState<WorkerRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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
      return;
    }

    if (isTablet) {
      setPlatform("tablet");
      return;
    }

    setPlatform("browser");
  }, []);

  const isApp = platform === "android" || platform === "tablet";
  const isBrowser = platform === "browser";

  /* =====================================================
     FETCH DASHBOARD
  ===================================================== */

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
      ).toISOString();

      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      ).toISOString();

      const [
        workers,
        workersToday,
        orderCount,
        ordersToday,
        shops,
        shopsToday,
        bookingCount,
        bookingsToday,
      ] = await Promise.all([
        supabase
          .from("workers")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("workers")
          .select("*", { count: "exact", head: true })
          .gte("created_at", start)
          .lt("created_at", end),

        supabase
          .from("orders")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", start)
          .lt("created_at", end),

        supabase
          .from("shops")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("shops")
          .select("*", { count: "exact", head: true })
          .gte("created_at", start)
          .lt("created_at", end),

        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", start)
          .lt("created_at", end),
      ]);

      const statErrors = [
        workers,
        workersToday,
        orderCount,
        ordersToday,
        shops,
        shopsToday,
        bookingCount,
        bookingsToday,
      ].filter((x) => x.error);

      if (statErrors.length) {
        throw new Error(
          statErrors[0]?.error?.message ||
            "Unable to load dashboard.",
        );
      }

      setStats({
        workers: workers.count ?? 0,
        workersToday: workersToday.count ?? 0,
        orders: orderCount.count ?? 0,
        ordersToday: ordersToday.count ?? 0,
        shops: shops.count ?? 0,
        shopsToday: shopsToday.count ?? 0,
        bookings: bookingCount.count ?? 0,
        bookingsToday: bookingsToday.count ?? 0,
      });

      const [
        recentBookings,
        recentOrders,
        workerRequests,
      ] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6),

        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6),

        supabase
          .from("worker_requests")
          .select("*")
          .in("status", ["pending", "new"])
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      setBookings(
        (recentBookings.data || []) as RecentBooking[],
      );

      setOrders(
        (recentOrders.data || []) as RecentOrder[],
      );

      setRequests(
        (workerRequests.data || []) as WorkerRequest[],
      );
    } catch (err: any) {
      console.error("Dashboard:", err);

      setError(
        err?.message ||
          "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =====================================================
     REALTIME
  ===================================================== */

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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "worker_requests",
        },
        () => fetchDashboard(true),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboard]);

  /* =====================================================
     HELPERS
  ===================================================== */

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

  const orderName = (x: RecentOrder) =>
    x.customer_name ||
    x.user_name ||
    x.name ||
    x.customer_id ||
    `Order #${x.id?.slice(0, 8)}`;

  const bookingName = (x: RecentBooking) =>
    x.worker_name ||
    x.customer_name ||
    x.user_name ||
    x.worker_id ||
    x.customer_id ||
    `Booking #${x.id?.slice(0, 8)}`;

  const amount = (
    x: RecentOrder | RecentBooking,
  ) => {
    const value =
      x.total_amount ??
      x.total ??
      x.amount;

    if (value == null || value === "") {
      return null;
    }

    const number = Number(value);

    return Number.isNaN(number)
      ? String(value)
      : `₹${number.toLocaleString("en-IN")}`;
  };

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

  const statusLabel = (
    status?: string | null,
  ) =>
    status
      ? String(status)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) =>
            c.toUpperCase(),
          )
      : "Pending";

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div
        className={
          isBrowser
            ? "min-h-screen bg-[#F8FAFC]"
            : "min-h-screen bg-[#F8FAFC] pb-20"
        }
      >
        <DashboardHeader
          refreshing={false}
          onRefresh={() =>
            fetchDashboard(true)
          }
        />

        <DashboardSkeleton
          platform={platform}
        />
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div
        className={
          isBrowser
            ? "min-h-screen bg-[#F8FAFC]"
            : "min-h-screen bg-[#F8FAFC] px-3 pb-20"
        }
      >
        <DashboardHeader
          refreshing={refreshing}
          onRefresh={() =>
            fetchDashboard(true)
          }
        />

        <div
          className={
            isBrowser
              ? "mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"
              : "w-full px-0 pt-4"
          }
        >
          <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />

            <h2 className="mt-3 font-black text-[#0F172A]">
              Dashboard data could not be loaded
            </h2>

            <p className="mt-2 text-sm text-[#64748B]">
              {error}
            </p>

            <button
              onClick={() =>
                fetchDashboard(true)
              }
              className="mt-5 rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     APP / ANDROID / TABLET
  ===================================================== */

  if (isApp) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <DashboardHeader
          refreshing={refreshing}
          onRefresh={() =>
            fetchDashboard(true)
          }
        />

        <main className="w-full px-3 pt-4 pb-8 sm:px-4 sm:pt-5">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF5C39]">
                  Overview
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#64748B] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </div>
            </div>

            <DashboardStats />
          </section>

          <section className="mt-5">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF5C39]">
                  Live Activity
                </p>

                <h2 className="mt-0.5 text-base font-black text-[#0F172A]">
                  Recent Activity
                </h2>
              </div>

              <span className="text-[9px] font-bold text-[#94A3B8]">
                Live updates
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <RecentBookingsBoard
                bookings={bookings}
                bookingName={bookingName}
                amount={amount}
                formatDate={formatDate}
                statusClass={statusClass}
                statusLabel={statusLabel}
                onNavigate={onNavigate}
              />

              <RecentOrdersBoard
                orders={orders}
                orderName={orderName}
                amount={amount}
                formatDate={formatDate}
                statusClass={statusClass}
                statusLabel={statusLabel}
                onNavigate={onNavigate}
              />

              <NewWorkerRequestsBoard
                requests={requests}
                formatDate={formatDate}
                onNavigate={onNavigate}
              />
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <div>
                <h2 className="text-sm font-black text-[#0F172A]">
                  Platform Activity
                </h2>

                <p className="mt-0.5 text-[10px] text-[#64748B]">
                  New activity today
                </p>
              </div>

              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3">
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
        </main>
      </div>
    );
  }

  /* =====================================================
     BROWSER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader
        refreshing={refreshing}
        onRefresh={() =>
          fetchDashboard(true)
        }
      />

      <main className="mx-auto w-full max-w-[1600px] px-4 pt-6 pb-10 sm:px-6 sm:pt-7 lg:px-8 lg:pt-8">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF5C39]">
                Overview
              </p>

              <h2 className="mt-1 text-xl font-black text-[#0F172A]">
                Platform Overview
              </h2>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#64748B] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </div>
          </div>

          <DashboardStats />
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF5C39]">
                Live Activity
              </p>

              <h2 className="mt-1 text-lg font-black text-[#0F172A]">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Latest activity across Workkerz
              </p>
            </div>

            <span className="text-[10px] font-bold text-[#94A3B8]">
              Live updates
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <RecentBookingsBoard
              bookings={bookings}
              bookingName={bookingName}
              amount={amount}
              formatDate={formatDate}
              statusClass={statusClass}
              statusLabel={statusLabel}
              onNavigate={onNavigate}
            />

            <RecentOrdersBoard
              orders={orders}
              orderName={orderName}
              amount={amount}
              formatDate={formatDate}
              statusClass={statusClass}
              statusLabel={statusLabel}
              onNavigate={onNavigate}
            />
          </div>

          <div className="mt-5">
            <NewWorkerRequestsBoard
              requests={requests}
              formatDate={formatDate}
              onNavigate={onNavigate}
            />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-black text-[#0F172A]">
                Platform Activity
              </h2>

              <p className="mt-0.5 text-[10px] text-[#64748B]">
                New activity today
              </p>
            </div>

            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
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
      </main>
    </div>
  );
}

/* =====================================================
   HEADER
===================================================== */

function DashboardHeader({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
   <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-gray-100 bg-white/95 px-3 pt-14 py-2.5 backdrop-blur-md sm:px-5 sm:pt-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#FF5C39]" />

          <h1 className="truncate text-lg font-black text-[#0F172A] sm:text-xl">
            Dashboard
          </h1>
        </div>

        <p className="hidden text-xs text-[#64748B] sm:block">
          Overview of your Workkerz platform.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#64748B] shadow-sm active:scale-95 disabled:opacity-50"
        aria-label="Refresh dashboard"
      >
        <RefreshCw
          className={`h-4 w-4 ${
            refreshing ? "animate-spin" : ""
          }`}
        />
      </button>
    </header>
  );
}

/* =====================================================
   BOOKINGS
===================================================== */

function RecentBookingsBoard({
  bookings,
  bookingName,
  amount,
  formatDate,
  statusClass,
  statusLabel,
  onNavigate,
}: any) {
  return (
    <Board
      title="Recent Bookings"
      subtitle="Latest worker bookings"
      icon={CalendarCheck}
      color="emerald"
      onView={() =>
        onNavigate?.("bookings")
      }
    >
      {bookings.length ? (
        bookings.map(
          (x: RecentBooking) => (
            <ActivityRow
              key={x.id}
              icon={Users}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title={bookingName(x)}
              meta={`#${x.id.slice(
                0,
                8,
              )} • ${formatDate(
                x.created_at,
              )}`}
              price={amount(x)}
              status={statusLabel(
                x.status,
              )}
              statusClass={statusClass(
                x.status,
              )}
              onClick={() =>
                onNavigate?.("bookings")
              }
            />
          ),
        )
      ) : (
        <EmptyActivity
          title="No recent bookings"
          description="New worker bookings will appear here automatically."
        />
      )}
    </Board>
  );
}

/* =====================================================
   ORDERS
===================================================== */

function RecentOrdersBoard({
  orders,
  orderName,
  amount,
  formatDate,
  statusClass,
  statusLabel,
  onNavigate,
}: any) {
  return (
    <Board
      title="Recent Orders"
      subtitle="Latest marketplace orders"
      icon={ShoppingBag}
      color="blue"
      onView={() =>
        onNavigate?.("orders")
      }
    >
      {orders.length ? (
        orders.map(
          (x: RecentOrder) => (
            <ActivityRow
              key={x.id}
              icon={Package}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              title={orderName(x)}
              meta={`#${x.id.slice(
                0,
                8,
              )} • ${formatDate(
                x.created_at,
              )}`}
              price={amount(x)}
              status={statusLabel(
                x.status,
              )}
              statusClass={statusClass(
                x.status,
              )}
              onClick={() =>
                onNavigate?.("orders")
              }
            />
          ),
        )
      ) : (
        <EmptyActivity
          title="No recent orders"
          description="New marketplace orders will appear here automatically."
        />
      )}
    </Board>
  );
}

/* =====================================================
   BOARD
===================================================== */

function Board({
  title,
  subtitle,
  icon: Icon,
  color,
  onView,
  children,
}: any) {
  const styles =
    color === "blue"
      ? "bg-blue-50 text-blue-600"
      : "bg-emerald-50 text-emerald-600";

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-black text-[#0F172A]">
              {title}
            </h2>

            <p className="text-[10px] text-[#64748B]">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onView}
          className="flex items-center gap-1 text-[10px] font-bold text-[#FF5C39]"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {children}
      </div>
    </section>
  );
}

/* =====================================================
   ACTIVITY ROW
===================================================== */

function ActivityRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  meta,
  price,
  status,
  statusClass,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F8FAFC] active:bg-gray-100"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon
          className={`h-4 w-4 ${iconColor}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-[#0F172A]">
          {title}
        </p>

        <p className="mt-1 truncate text-[9px] text-[#94A3B8]">
          {meta}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {price && (
          <p className="text-xs font-black text-[#0F172A]">
            {price}
          </p>
        )}

        <span
          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[8px] font-bold ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <ChevronRight className="hidden h-4 w-4 text-gray-300 sm:block" />
    </button>
  );
}

/* =====================================================
   WORKER REQUESTS
===================================================== */

function NewWorkerRequestsBoard({
  requests,
  formatDate,
  onNavigate,
}: any) {
  return (
    <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
            <UserRoundPlus className="h-5 w-5 text-[#FF5C39]" />

            {requests.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5C39] px-1 text-[8px] font-black text-white">
                {requests.length}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-sm font-black text-[#0F172A]">
              New Worker Requests
            </h2>

            <p className="text-[10px] text-[#64748B]">
              Latest customer requests for workers
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            onNavigate?.(
              "worker-requests",
            )
          }
          className="text-[10px] font-bold text-[#FF5C39]"
        >
          View all
        </button>
      </div>

      {requests.length ? (
        <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-3">
          {requests.map(
            (x: WorkerRequest) => (
              <button
                key={x.id}
                onClick={() =>
                  onNavigate?.(
                    "worker-requests",
                  )
                }
                className="p-4 text-left transition hover:bg-orange-50/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <Users className="h-5 w-5 text-[#FF5C39]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-black text-[#0F172A]">
                      {x.project_name ||
                        x.category ||
                        x.subcategory ||
                        "Worker Request"}
                    </h3>

                    <p className="truncate text-[10px] text-[#64748B]">
                      {x.requester_name ||
                        x.customer_name ||
                        x.company_name ||
                        "Customer"}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-50 px-2 py-1 text-[8px] font-black text-[#FF5C39]">
                    New
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Info
                    icon={Users}
                    text={`${x.workers_required ?? "—"} workers`}
                  />

                  <Info
                    icon={Clock3}
                    text={formatDate(
                      x.created_at,
                    )}
                  />

                  <Info
                    icon={MapPin}
                    text={
                      x.location ||
                      "Location pending"
                    }
                  />

                  <Info
                    icon={IndianRupee}
                    text={
                      x.budget != null
                        ? `₹${Number(
                            x.budget,
                          ).toLocaleString(
                            "en-IN",
                          )}`
                        : "Budget —"
                    }
                  />
                </div>

                <div className="mt-4 flex justify-between border-t pt-3 text-[9px] font-black">
                  <span className="text-[#94A3B8]">
                    {x.project_type ||
                      x.category ||
                      "Worker Request"}
                  </span>

                  <span className="text-[#FF5C39]">
                    Review{" "}
                    <ChevronRight className="inline h-3 w-3" />
                  </span>
                </div>
              </button>
            ),
          )}
        </div>
      ) : (
        <EmptyActivity
          title="No new worker requests"
          description="New customer worker requests will appear here automatically."
        />
      )}
    </section>
  );
}

/* =====================================================
   INFO
===================================================== */

function Info({
  icon: Icon,
  text,
}: any) {
  return (
    <div className="min-w-0 rounded-lg bg-[#F8FAFC] px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 shrink-0 text-[#94A3B8]" />

        <span className="truncate text-[9px] font-bold text-[#64748B]">
          {text}
        </span>
      </div>
    </div>
  );
}

/* =====================================================
   ACTIVITY ITEM
===================================================== */

function ActivityItem({
  label,
  value,
  icon: Icon,
}: any) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-3">
      <div className="flex justify-between gap-2">
        <p className="line-clamp-2 text-[10px] font-semibold text-[#64748B]">
          {label}
        </p>

        <Icon className="h-3.5 w-3.5 shrink-0 text-[#FF5C39]" />
      </div>

      <p className="mt-2 text-lg font-black text-[#0F172A]">
        {value.toLocaleString("en-IN")}
      </p>

      <div className="mt-1 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />

        <span className="text-[9px] text-[#94A3B8]">
          Today
        </span>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY
===================================================== */

function EmptyActivity({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 py-8 text-center">
      <Package className="h-6 w-6 text-gray-300" />

      <p className="mt-3 text-xs font-black text-[#64748B]">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-[10px] text-[#94A3B8]">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   SKELETON
===================================================== */

function DashboardSkeleton({
  platform,
}: {
  platform: Platform;
}) {
  const isBrowser =
    platform === "browser";

  return (
    <div
      className={`animate-pulse ${
        isBrowser
          ? "mx-auto max-w-[1600px] px-4 pt-6 pb-10 sm:px-6 lg:px-8"
          : "w-full px-3 pt-4 pb-8 sm:px-4"
      }`}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({
          length: 5,
        }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-white"
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-white" />

        <div className="h-80 rounded-2xl bg-white" />
      </div>
    </div>
  );
}