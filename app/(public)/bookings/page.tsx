"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  booking_id: string;
  booking_status: string;

  worker_name: string;
  worker_photo: string;
  worker_specialty: string;
  worker_rating: number;

  service_type: string;
  booking_date: string;
  booking_time: string;

  city: string;
  state: string;

  grand_total: number;
  created_at: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [tab, setTab] = useState<"bookings" | "orders">("bookings");
  const searchRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user);

    if (!user) {
      console.log("NO USER FOUND");
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false });

    console.log("USER EMAIL:", user.email);
    console.log("BOOKINGS FOUND:", data?.length);
    console.log("BOOKINGS:", data);
    console.log("ERROR:", error);

    setBookings(data || []);
    setLoading(false);
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.booking_id?.toLowerCase().includes(search.toLowerCase()) ||
        booking.worker_name?.toLowerCase().includes(search.toLowerCase()) ||
        booking.service_type?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || booking.booking_status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [bookings, search, filter]);

  const suggestions =
    search.trim().length === 0
      ? []
      : bookings
          .filter((b) => {
            const q = search.toLowerCase();

            return (
              b.booking_id?.toLowerCase().includes(q) ||
              b.worker_name?.toLowerCase().includes(q) ||
              b.service_type?.toLowerCase().includes(q) ||
              b.booking_status?.toLowerCase().includes(q)
            );
          })
          .slice(0, 5);

  const statusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600 shadow-2xl">
          <div className="relative px-5 pt-14 pb-5">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/20">
                <CheckCircle className="h-4 w-4 text-blue-400" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[16px] font-bold text-white">
                  Track Status
                </h1>

                <p className="mt-0.5 truncate text-[10px] text-slate-300">
                  Track and manage your active bookings
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative z-100 mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                type="search"
                enterKeyHint="done"
                ref={searchRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search booking, worker..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/10 pl-10 pr-10 text-[13px] text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white/15"
              />
             {showSuggestions && search && suggestions.length > 0 && (
                <div className="absolute left-0 top-full z-9999 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl backdrop-blur-xl">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearch(item.booking_id);
                        setShowSuggestions(false);
                        searchRef.current?.blur();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10"
                    >
                      <Search className="h-4 w-4 text-slate-400" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-white">
                            {item.worker_name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {item.service_type}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-blue-500/20 px-2 py-1 text-[10px] text-blue-300">
                        {item.booking_status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    searchRef.current?.blur();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Toggle */}
            <div className="mt-3 rounded-xl bg-white/10 p-1 backdrop-blur">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => router.push("/my-bookings")}
                  className={`h-9 rounded-lg text-[13px] font-medium transition-all ${
                    tab === "bookings"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Bookings
                </button>

                <button
                  onClick={() => router.push("/my-orders")}
                  className={`h-9 rounded-lg text-[13px] font-medium transition-all ${
                    tab === "orders"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-58 h-full overflow-y-auto">
        {loading ? (
          <div className="p-4 flex flex-col gap-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Top Accent */}
                <div className="h-1 bg-slate-200" />

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-slate-200" />
                    <div className="flex-1">
                      <div className="h-4 w-36 rounded-md bg-slate-200" />
                      <div className="mt-2 h-3 w-24 rounded-md bg-slate-200" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                  </div>

                  {/* Worker */}
                  <div className="mt-4 rounded-2xl border border-slate-200 p-3">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-slate-200" />

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="h-4 w-32 rounded-md bg-slate-200" />
                            <div className="mt-2 h-3 w-24 rounded-md bg-slate-200" />
                          </div>

                          <div className="h-6 w-12 rounded-lg bg-slate-200" />
                        </div>

                        <div className="mt-4 flex justify-between">
                          <div className="h-6 w-24 rounded-full bg-slate-200" />
                          <div className="h-6 w-20 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-3 w-28 rounded-md bg-slate-200" />
                    <div className="h-4 w-24 rounded-md bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-2">
            {filteredBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/my-bookings/${booking.booking_id}`}
              >
                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  {/* Top Accent */}
                  <div className="h-1 bg-linear-to-r from-emerald-500 via-green-500 to-lime-400" />

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      {/* Icon */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[11px] text-slate-600">
                            {booking.service_type}
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                              booking.booking_status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : booking.booking_status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : booking.booking_status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {booking.booking_status.toUpperCase()}
                          </span>
                        </div>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          #{booking.booking_id}
                        </p>
                      </div>
                    </div>

                    {/* Worker */}
                    <div className="mt-2 rounded-xl border border-emerald-100 bg-linear-to-r from-white to-emerald-50 p-2">
                      <div className="flex items-center gap-2">
                        <div className="relative shrink-0">
                          <Image
                            src={
                              booking.worker_photo || "/worker-placeholder.png"
                            }
                            alt={booking.worker_name}
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-xl object-cover ring-1 ring-emerald-100"
                          />

                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white bg-green-500" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="truncate text-[12px] font-semibold text-slate-900">
                                {booking.worker_name}
                              </h4>

                              <p className="truncate text-[10px] text-slate-500">
                                {booking.worker_specialty}
                              </p>
                            </div>

                            <div className="rounded-md bg-green-600 px-1.5 py-0.5 text-[9px] font-medium text-white">
                              ⭐ {booking.worker_rating ?? "New"}
                            </div>
                          </div>

                          <div className="mt-1 flex items-center gap-1">
                            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-medium text-green-700">
                              Ready
                            </span>

                            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Bottom */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />

                        <span className="text-[11px] text-slate-500">
                          Workkerz Trust
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
