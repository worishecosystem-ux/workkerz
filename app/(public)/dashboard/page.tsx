"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const [stats] = useState({
    totalBookings: 12,
    activeBookings: 3,
    completedBookings: 8,
    favoriteWorkers: 5,
  });

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
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

                <p className="opacity-90 mt-1">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-white text-red-500 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold"
            >
              <LogOut size={18} />
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
            title="Active Jobs"
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

        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <ActionCard
              href="/browse"
              title="Book Worker"
            />

            <ActionCard
              href="/bookings"
              title="My Bookings"
            />

            <ActionCard
              href="/favorites"
              title="Favorites"
            />

            <ActionCard
              href="/notifications"
              title="Notifications"
            />

          </div>
        </div>

        {/* BOOKINGS + FAVORITES */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* RECENT BOOKINGS */}

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-5">
              Recent Bookings
            </h2>

            <div className="space-y-4">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="border rounded-2xl p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">
                        BK-2026-00{item}
                      </p>

                      <p className="text-sm text-slate-500">
                        Electrician Service
                      </p>
                    </div>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      Completed
                    </span>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* FAVORITE WORKERS */}

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-5">
              Favorite Workers
            </h2>

            <div className="space-y-4">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between border rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">

                    <img
                      src="https://i.pravatar.cc/150"
                      className="w-14 h-14 rounded-full"
                    />

                    <div>
                      <p className="font-semibold">
                        Worker {item}
                      </p>

                      <p className="text-sm text-slate-500">
                        Electrician
                      </p>
                    </div>

                  </div>

                  <button className="bg-[#FF5C39] text-white px-4 py-2 rounded-xl text-sm">
                    Book
                  </button>
                </div>
              ))}

            </div>
          </div>

        </div>

        {/* ACCOUNT */}

        <div className="bg-white rounded-3xl p-6 shadow-sm mt-8">
          <h2 className="text-xl font-bold mb-5">
            Account Settings
          </h2>

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

function StatCard({
  title,
  value,
  icon,
}: any) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex justify-between items-center">
        {icon}
        <span className="text-3xl font-bold">
          {value}
        </span>
      </div>

      <p className="mt-4 text-slate-500">
        {title}
      </p>
    </div>
  );
}

function ActionCard({
  href,
  title,
}: any) {
  return (
    <Link
      href={href}
      className="border rounded-2xl p-5 hover:border-[#FF5C39] transition"
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold">
          {title}
        </span>

        <ArrowRight size={18} />
      </div>
    </Link>
  );
}

function SettingCard({
  title,
}: any) {
  return (
    <button className="border rounded-2xl p-5 text-left hover:border-[#FF5C39]">
      <div className="flex items-center gap-3">
        <User size={18} />
        {title}
      </div>
    </button>
  );
}