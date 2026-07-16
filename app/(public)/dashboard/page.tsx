"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getWorkerById } from "@/app/data/workers";
import SupportSheet from "./components/SupportSheet";

import {
  Calendar,
  Heart,
  LogOut,
  Bell,
  BadgeCheck,
  Briefcase,
  User,
  Star,
  X,
  Home,
  MapPinned,
  Headphones,
  ChevronRight,
  ArrowRight,
  Menu,
  UserCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    favoriteWorkers: 0,
  });
  const [supportOpen, setSupportOpen] = useState(false);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [favoriteWorkers, setFavoriteWorkers] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadCount();
  }, []);

  async function loadCount() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .or(`is_global.eq.true,customer_email.eq.${user.email}`);

    setUnreadCount(count || 0);
  }
  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUser(user);

        await loadFavorites(user.id);

        const { data: bookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false });

        const allBookings = bookings || [];

        const { count: favoritesCount } = await supabase
          .from("favorites")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("customer_id", user.id);

        setRecentBookings(allBookings.slice(0, 3));

        setStats({
          totalBookings: allBookings.length,
          activeBookings: allBookings.filter(
            (b) =>
              b.booking_status === "pending" ||
              b.booking_status === "confirmed",
          ).length,
          completedBookings: allBookings.filter(
            (b) => b.booking_status === "completed",
          ).length,
          favoriteWorkers: favoritesCount || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const loadFavorites = async (userId: string) => {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    const workers = [];

    for (const item of data || []) {
      const worker = await getWorkerById(item.worker_id);

      if (worker) {
        workers.push({
          ...worker,
          favoriteWorkerId: item.worker_id,
        });
      }
    }

    setFavoriteWorkers(workers.slice(0, 3));

    setStats((prev) => ({
      ...prev,
      favoriteWorkers: workers.length,
    }));
  };

  if (loading) {
    return <DashboardSkeleton />;
  }
  return (
    <main className="pt-40">
      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600 px-5 pt-17 pb-5 text-white shadow-2xl">
        {/* Background */}
        <div className="absolute -top-10 -right-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="Profile"
                className="h-11 w-11 rounded-2xl border-2 border-white/90 object-cover"
              />

              {/* Online Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-emerald-900 bg-lime-400" />
            </div>

            <div>
              <div className="mt-1 flex items-center gap-1">
                <h1 className="max-w-37.5 truncate text-lg font-bold">
                  {user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    "Guest"}
                </h1>

                <BadgeCheck className="h-4 w-4 text-emerald-200" />
              </div>

              <p className="mt-1 text-xs text-emerald-100/80">
                Manage your Workkerz account
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md transition active:scale-95">
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </Link>

            <button
              onClick={async () => {
                const confirmLogout = window.confirm(
                  "Are you sure you want to logout?",
                );

                if (!confirmLogout) return;

                await supabase.auth.signOut();
                router.replace("/");
              }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md transition-all duration-200 hover:bg-red-500/20 active:scale-95"
            >
              <LogOut className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-3 mb-5 px-4">
        <StatCard
          title="Bookings"
          value={stats.totalBookings}
          icon={<Calendar className="h-4 w-4" />}
          gradient="from-blue-50 to-cyan-100"
          iconBg="bg-blue-500"
        />

        <StatCard
          title="Pending"
          value={stats.activeBookings}
          icon={<Briefcase className="h-4 w-4" />}
          gradient="from-emerald-50 to-green-100"
          iconBg="bg-emerald-500"
        />

        <StatCard
          title="Completed"
          value={stats.completedBookings}
          icon={<Star className="h-4 w-4" />}
          gradient="from-amber-50 to-yellow-100"
          iconBg="bg-amber-500"
        />

        <StatCard
          title="Favorites"
          value={stats.favoriteWorkers}
          icon={<Heart className="h-4 w-4" />}
          gradient="from-pink-50 to-rose-100"
          iconBg="bg-pink-500"
        />
      </div>

      {/* QUICK ACTIONS */}

      <div className="mb-4 px-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-slate-900">
            Quick Actions
          </h2>

          <span className="text-[10px] text-slate-400">Fast Access</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <QuickAction
            href="/browse"
            title="Book Worker"
            icon="👷"
            color="from-slate-950 via-blue-950 to-slate-900"
          />

          <QuickAction
            href="/profile"
            title="Buy Material"
            icon="🧱"
            color="from-emerald-950 via-emerald-900 to-green-950"
          />
        </div>
      </div>

      {/* BOOKINGS + FAVORITES */}

      <div className="grid lg:grid-cols-2 gap-6 p-4">
        {/* RECENT BOOKINGS */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent Bookings
              </h2>
              <p className="text-[11px] text-slate-500">
                {recentBookings.length} booking
                {recentBookings.length !== 1 && "s"}
              </p>
            </div>

            <Link
              href="/bookings"
              className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-[#FF5C39] transition hover:bg-orange-100"
            >
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-sm font-medium text-slate-600">
                No recent bookings
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Your latest bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/my-bookings/${booking.booking_id}`}
                  className="group block"
                >
                  <div className="flex items-center gap-3 px-4 py-3 transition active:scale-[0.99] hover:bg-slate-50">
                    {/* Left Accent */}
                    <div className="h-10 w-1 rounded-full bg-linear-to-b from-[#FF7A59] to-[#FF5C39]" />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="min-w-0">
                        <h3 className="truncate text-[13px] font-semibold text-slate-900">
                          {booking.worker_name}
                          <span className="ml-1 text-[11px] font-medium text-slate-500">
                            ({booking.service_type})
                          </span>
                        </h3>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className="font-medium text-slate-400">
                          #{booking.booking_id}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-slate-300" />

                        <span className="font-bold text-[#FF5C39]">
                          ₹{booking.grand_total}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        booking.booking_status === "completed"
                          ? "bg-green-100 text-green-700"
                          : booking.booking_status === "confirmed"
                            ? "bg-blue-100 text-blue-700"
                            : booking.booking_status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {booking.booking_status}
                    </span>
                    {/* Arrow */}
                    <svg
                      className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#FF5C39]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* FAVORITE WORKERS */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <div>
              <h2 className="text-[13px] font-bold text-slate-900">
                Favorite Workers
              </h2>
              <p className="text-[10px] text-slate-500">
                {favoriteWorkers.length} workers
              </p>
            </div>

            <Link
              href="/favorites"
              className="text-[11px] font-semibold text-[#FF5C39]"
            >
              View All
            </Link>
          </div>

          {favoriteWorkers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No favorite workers found
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {favoriteWorkers.map((worker) => (
                <Link
                  key={worker.favoriteWorkerId}
                  href={`/workers/${worker.favoriteWorkerId}`}
                  className="block"
                >
                  <div className="flex items-center gap-3 px-3 py-2 active:bg-slate-50">
                    {/* Photo */}
                    <img
                      src={worker.photo || "/worker-placeholder.png"}
                      alt={worker.name}
                      className="h-10 w-10 rounded-xl object-cover"
                    />

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[13px] font-semibold text-slate-900">
                        {worker.name}
                      </h3>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="truncate">{worker.specialty}</span>

                        <span className="text-slate-300">•</span>

                        <span className="font-medium text-amber-600">
                          ⭐ {worker.rating}
                        </span>
                      </div>
                    </div>

                    {/* Small Button */}
                    <div className="rounded-lg bg-[#FF5C39] px-2.5 py-1 text-[10px] font-semibold text-white">
                      View
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ACCOUNT */}
      <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Account</h2>

          <span className="text-xs text-slate-500">Settings</span>
        </div>

        <div className="space-y-2">
          <SettingCard
            title="Profile Settings"
            onClick={() => router.push("/profile")}
          />
          <SettingCard
            title="Saved Addresses"
            onClick={() => router.push("/address")}
          />
          <SettingCard title="Refund Policy" />
          <SettingCard
            title="Support Center"
            onClick={() => setSupportOpen(true)}
          />
        </div>
      </div>
    </main>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient?: string;
  iconBg?: string;
}

function StatCard({
  title,
  value,
  icon,
  gradient = "from-emerald-50 to-white",
  iconBg = "bg-emerald-500",
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl bg-linear-to-r ${gradient} border border-gray-100 px-3 py-3 shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} text-white shadow`}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-gray-500">{title}</p>
        </div>

        <div className="text-lg font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  href: string;
  title: string;
  icon: string;
  color?: string;
}

function QuickAction({
  href,
  title,
  icon,
  color = "from-rose-50 via-pink-100 to-red-100",
}: {
  href: string;
  title: string;
  icon: string;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-14 items-center gap-3 rounded-2xl border border-white/60 bg-linear-to-r ${color} px-3 shadow-md backdrop-blur-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98]`}
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Icon */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
          <span className="text-lg">{icon}</span>
        </div>

        <span className="text-[12px] font-semibold leading-none text-white">
          {title}
        </span>
      </div>

      {/* Title */}
    </Link>
  );
}

function SettingCard({
  title,
  onClick,
}: {
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
    >
      <span>{title}</span>
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <main className="animate-pulse pt-37">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600 px-5 pt-17 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/20" />

            <div>
              <div className="mb-2 h-5 w-32 rounded bg-white/20" />
              <div className="h-3 w-40 rounded bg-white/15" />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="h-10 w-10 rounded-2xl bg-white/20" />
            <div className="h-10 w-10 rounded-2xl bg-white/20" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 p-2 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-200" />

              <div className="flex-1">
                <div className="mb-2 h-3 w-20 rounded bg-slate-200" />
                <div className="h-5 w-10 rounded bg-slate-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-2 mb-5">
        <div className="mb-3 h-5 w-40 rounded bg-slate-200" />

        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="mb-3 flex items-center gap-5 rounded-2xl border border-slate-100 bg-white px-5 py-4"
          >
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="h-5 flex-1 rounded bg-slate-200" />
            <div className="h-6 w-6 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((section) => (
          <div
            key={section}
            className="rounded-2xl border border-slate-100 bg-white p-5"
          >
            <div className="mb-5 h-6 w-40 rounded bg-slate-200" />

            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-200" />

                  <div>
                    <div className="mb-2 h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="h-7 w-16 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Account */}
      <div className="mt-8 rounded-3xl bg-white p-6">
        <div className="mb-6 h-6 w-44 rounded bg-slate-200" />

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 p-5">
              <div className="h-5 w-36 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
