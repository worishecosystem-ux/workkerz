"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getWorkerById } from "@/app/data/workers";

import {
  Calendar,
  Heart,
  ArrowLeft,
  LogOut,
  Briefcase,
  User,
  Star,
  ArrowRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    favoriteWorkers: 0,
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [favoriteWorkers, setFavoriteWorkers] = useState<any[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      await loadFavorites(user.id);

      setUser(user);

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

      setRecentBookings(allBookings.slice(0, 5));

      setStats({
        totalBookings: allBookings.length,

        activeBookings: allBookings.filter(
          (b) =>
            b.booking_status === "pending" || b.booking_status === "confirmed",
        ).length,

        completedBookings: allBookings.filter(
          (b) => b.booking_status === "completed",
        ).length,

        favoriteWorkers: favoritesCount || 0,
      });
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

    setFavoriteWorkers(workers.slice(0, 5));

    setStats((prev) => ({
      ...prev,
      favoriteWorkers: workers.length,
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-orange-100"></div>

              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FF5C39] border-r-[#FF5C39] animate-spin"></div>

              <div className="absolute inset-3 rounded-3xl bg-[#FF5C39] flex items-center justify-center shadow-xl shadow-orange-200">
                <span className="text-white text-3xl font-black">W</span>
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Workkerz Dashboard
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Preparing your workspace...
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-200"></div>

                <div className="flex-1">
                  <div className="h-4 w-40 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function QuickAction({
    href,
    title,
    icon,
  }: {
    href: string;
    title: string;
    icon: string;
  }) {
    return (
      <Link
        href={href}
        className="
        group
        flex items-center gap-3
        rounded-2xl
        border border-slate-200
        px-4 py-3
        hover:border-[#FF5C39]
        hover:bg-orange-50
        transition-all
      "
      >
        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg group-hover:bg-white">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {title}
          </p>

          <p className="text-xs text-slate-500">Open</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#FF5C39] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        {/* HEADER */}

        <div className="bg-linear-to-r from-[#FF5C39] to-orange-500 rounded-3xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={user.user_metadata?.avatar_url}
                alt=""
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />

              <div>
                <h1 className="text-3xl font-bold">
                  Welcome, {user.user_metadata?.full_name}
                </h1>

                <p className="opacity-90 mt-1">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-white/20 backdrop-blur text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-white/30 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<Calendar />}
          />

          <StatCard
            title="Active workers"
            value={stats.activeBookings}
            icon={<Briefcase />}
          />

          <StatCard
            title="Completed"
            value={stats.completedBookings}
            icon={<Star />}
          />

          <StatCard
            title="Favorites"
            value={stats.favoriteWorkers}
            icon={<Heart />}
          />
        </div>

        {/* QUICK ACTIONS */}

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>

            <span className="text-xs text-slate-500">Fast Access</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickAction href="/browse" title="Book Worker" icon="👷" />

            <QuickAction href="/my-bookings" title="Bookings" icon="📋" />

            <QuickAction href="/favorites" title="Favorites" icon="❤️" />

            <QuickAction href="/profile" title="Profile" icon="👤" />
          </div>
        </div>

        {/* BOOKINGS + FAVORITES */}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* RECENT BOOKINGS */}

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-5">Recent Bookings</h2>

            <div className="space-y-4">
              <div className="flex flex-col space-y-3">
                {recentBookings.length === 0 ? (
                  <p className="text-slate-500 text-sm">No bookings found</p>
                ) : (
                  recentBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/my-bookings/${booking.booking_id}`}
                    >
                      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-slate-200 hover:border-[#FF5C39] hover:bg-orange-50/30 transition">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">
                              {booking.worker_name}
                            </h3>

                            <span className="text-slate-300">•</span>

                            <p className="text-xs text-slate-500 truncate">
                              {booking.service_type}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-400">
                              #{booking.booking_id}
                            </p>

                            <span className="w-1 h-1 rounded-full bg-slate-300" />

                            <p className="text-xs text-slate-400">
                              ₹{booking.grand_total}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold ${
                            booking.booking_status === "completed"
                              ? "bg-green-100 text-green-700"
                              : booking.booking_status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : booking.booking_status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.booking_status}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* FAVORITE WORKERS */}

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-5">Favorite Workers</h2>

            <div className="space-y-4">
              <div className="flex flex-col space-y-3">
                {favoriteWorkers.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No favorite workers found
                  </p>
                ) : (
                  favoriteWorkers.map((worker) => (
                    <Link
                      key={worker.favoriteWorkerId}
                      href={`/workers/${worker.favoriteWorkerId}`}
                    >
                      <div className="flex items-center justify-between p-3 border rounded-2xl hover:border-[#FF5C39] hover:bg-orange-50/30 transition">
                        <div className="flex items-center gap-3">
                          <img
                            src={worker.photo || "/worker-placeholder.png"}
                            alt={worker.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />

                          <div>
                            <p className="font-semibold text-sm">
                              {worker.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {worker.specialty}
                            </p>

                            <p className="text-xs text-amber-500">
                              ⭐ {worker.rating}
                            </p>
                          </div>
                        </div>

                        <button className="bg-[#FF5C39] text-white text-xs px-3 py-2 rounded-xl">
                          View
                        </button>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ACCOUNT */}

        <div className="bg-white rounded-3xl p-6 shadow-sm mt-8">
          <h2 className="text-xl font-bold mb-5">Account Settings</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <SettingCard title="Profile Settings" />
            <SettingCard title="Saved Addresses" />
            <SettingCard title="Support Center" />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex justify-between items-center">
        {icon}
        <span className="text-3xl font-bold">{value}</span>
      </div>

      <p className="mt-4 text-slate-500">{title}</p>
    </div>
  );
}

function ActionCard({ href, title }: any) {
  return (
    <Link
      href={href}
      className="border rounded-2xl p-5 hover:border-[#FF5C39] transition"
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold">{title}</span>

        <ArrowRight size={18} />
      </div>
    </Link>
  );
}

function SettingCard({ title }: any) {
  return (
    <button className="border rounded-2xl p-5 text-left hover:border-[#FF5C39]">
      <div className="flex items-center gap-3">
        <User size={18} />
        {title}
      </div>
    </button>
  );
}
