"use client";

import {
  Users,
  ShoppingBag,
  Store,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

const stats = [
  {
    title: "Total Workers",
    value: "0",
    change: "Active workers",
    icon: Users,
  },
  {
    title: "Total Orders",
    value: "0",
    change: "Orders today",
    icon: ShoppingBag,
  },
  {
    title: "Total Shops",
    value: "0",
    change: "Registered shops",
    icon: Store,
  },
  {
    title: "Bookings",
    value: "0",
    change: "Bookings today",
    icon: CalendarCheck,
  },
];

export default function DashboardTab() {
  return (
    <div className="min-h-screen">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">
            Dashboard
          </h1>

          <p className="text-sm text-[#64748B] mt-1">
            Overview of your Workkerz platform.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#64748B]">

          <Clock3 className="w-4 h-4" />

          <span>
            Today
          </span>

        </div>

      </header>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="p-8">

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="grid grid-cols-4 gap-5">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-white border border-gray-100 rounded-2xl p-5"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-[#64748B]">
                      {stat.title}
                    </p>

                    <h2 className="text-3xl font-black text-[#0F172A] mt-2">
                      {stat.value}
                    </h2>

                  </div>

                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">

                    <Icon className="w-5 h-5 text-[#FF5C39]" />

                  </div>

                </div>

                <div className="flex items-center gap-1.5 mt-4 text-xs text-[#64748B]">

                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />

                  <span>
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

        <div className="grid grid-cols-3 gap-5 mt-6">

          {/* ================================================= */}
          {/* RECENT ORDERS */}
          {/* ================================================= */}

          <div className="col-span-2 bg-white border border-gray-100 rounded-2xl">

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h2 className="text-base font-black text-[#0F172A]">
                  Recent Orders
                </h2>

                <p className="text-xs text-[#64748B] mt-1">
                  Latest marketplace orders
                </p>

              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5C39]"
              >
                View all
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

            </div>

            <div className="p-6">

              <div className="h-48 flex flex-col items-center justify-center text-center">

                <ShoppingBag className="w-10 h-10 text-gray-200" />

                <p className="text-sm font-semibold text-[#64748B] mt-3">
                  No recent orders
                </p>

                <p className="text-xs text-[#94A3B8] mt-1">
                  New orders will appear here.
                </p>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}

          <div className="bg-white border border-gray-100 rounded-2xl">

            <div className="px-6 py-5 border-b border-gray-100">

              <h2 className="text-base font-black text-[#0F172A]">
                Quick Actions
              </h2>

              <p className="text-xs text-[#64748B] mt-1">
                Common admin actions
              </p>

            </div>

            <div className="p-5 space-y-3">

              <button
                type="button"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#F8FAFC] transition text-left"
              >

                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#FF5C39]" />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#0F172A]">
                    Manage Workers
                  </p>

                  <p className="text-xs text-[#64748B]">
                    View worker accounts
                  </p>

                </div>

              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#F8FAFC] transition text-left"
              >

                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-[#FF5C39]" />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#0F172A]">
                    Manage Orders
                  </p>

                  <p className="text-xs text-[#64748B]">
                    Review marketplace orders
                  </p>

                </div>

              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#F8FAFC] transition text-left"
              >

                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-[#FF5C39]" />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#0F172A]">
                    Manage Bookings
                  </p>

                  <p className="text-xs text-[#64748B]">
                    Review worker bookings
                  </p>

                </div>

              </button>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* PLATFORM ACTIVITY */}
        {/* ================================================= */}

        <div className="mt-6 bg-white border border-gray-100 rounded-2xl">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="text-base font-black text-[#0F172A]">
              Platform Activity
            </h2>

            <p className="text-xs text-[#64748B] mt-1">
              Recent activity across Workkerz
            </p>

          </div>

          <div className="p-6">

            <div className="grid grid-cols-4 gap-5">

              <ActivityItem
                label="Worker Registrations"
                value="0"
              />

              <ActivityItem
                label="New Orders"
                value="0"
              />

              <ActivityItem
                label="New Bookings"
                value="0"
              />

              <ActivityItem
                label="New Shops"
                value="0"
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function ActivityItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#F8FAFC] border border-gray-100 p-4">

      <p className="text-xs font-medium text-[#64748B]">
        {label}
      </p>

      <p className="text-2xl font-black text-[#0F172A] mt-2">
        {value}
      </p>

    </div>
  );
}