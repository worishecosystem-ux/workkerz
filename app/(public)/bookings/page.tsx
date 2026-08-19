"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Orders from "@/app/components/Orders";

interface Booking {
  id: string;
  booking_id: string;
  booking_status: string;

  worker_id?: string | null;
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tab, setTab] = useState<"bookings" | "orders">("bookings");

  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("AUTH USER:", user);

      if (!user?.email) {
        console.log("NO USER FOUND");
        setBookings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false });

      console.log("USER EMAIL:", user.email);
      console.log("BOOKINGS FOUND:", data?.length ?? 0);
      console.log("BOOKINGS:", data);
      console.log("ERROR:", error);

      if (error) {
        console.error("LOAD BOOKINGS ERROR:", error);
        setBookings([]);
      } else {
        setBookings((data as Booking[]) || []);
      }
    } catch (error) {
      console.error("BOOKING LOAD FAILED:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        booking.booking_id?.toLowerCase().includes(query) ||
        booking.worker_name?.toLowerCase().includes(query) ||
        booking.service_type?.toLowerCase().includes(query) ||
        booking.booking_status?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || booking.booking_status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [bookings, search, filter]);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return bookings
      .filter((booking) => {
        return (
          booking.booking_id?.toLowerCase().includes(query) ||
          booking.worker_name?.toLowerCase().includes(query) ||
          booking.service_type?.toLowerCase().includes(query) ||
          booking.booking_status?.toLowerCase().includes(query)
        );
      })
      .slice(0, 5);
  }, [bookings, search]);

  /*
   * BOOK AGAIN
   *
   * 1. worker_id available hai -> worker page
   * 2. worker_id nahi hai -> service search
   * 3. service bhi nahi hai -> workers page
   */
  function handleBookAgain(booking: Booking) {
    if (booking.worker_id) {
      router.push(`/workers/${booking.worker_id}`);
      return;
    }

    if (booking.service_type) {
      router.push(
        `/workers?service=${encodeURIComponent(
          booking.service_type
        )}`
      );
      return;
    }

    router.push("/workers");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600 shadow-2xl">
          <div className="relative px-5 pt-14 pb-5">
            {/* TITLE */}
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

            {/* ===================================================== */}
            {/* SEARCH */}
            {/* ===================================================== */}

            <div className="relative z-100 mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                ref={searchRef}
                type="search"
                enterKeyHint="done"
                value={search}
                onFocus={() => {
                  if (search) {
                    setShowSuggestions(true);
                  }
                }}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search booking, worker..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/10 pl-10 pr-10 text-[13px] text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white/15"
              />

              {/* SEARCH SUGGESTIONS */}
              {showSuggestions &&
                search &&
                suggestions.length > 0 && (
                  <div className="absolute left-0 top-full z-9999 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl backdrop-blur-xl">
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSearch(item.booking_id);
                          setShowSuggestions(false);
                          searchRef.current?.blur();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10"
                      >
                        <Search className="h-4 w-4 shrink-0 text-slate-400" />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-white">
                              {item.worker_name}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {item.service_type}
                            </p>
                          </div>

                          <p className="mt-0.5 truncate text-[10px] text-slate-500">
                            #{item.booking_id}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-blue-500/20 px-2 py-1 text-[10px] text-blue-300">
                          {item.booking_status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              {/* CLEAR SEARCH */}
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setShowSuggestions(false);
                    searchRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ===================================================== */}
            {/* TABS */}
            {/* ===================================================== */}

            <div className="mt-3 rounded-xl bg-white/10 p-1 backdrop-blur">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("bookings");
                    router.replace("/bookings?tab=bookings");
                  }}
                  className={`h-9 rounded-lg text-[13px] font-medium transition-all ${
                    tab === "bookings"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Bookings
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab("orders");
                    router.replace("/bookings?tab=orders");
                  }}
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

      {/* ========================================================= */}
      {/* CONTENT */}
      {/* ========================================================= */}

      <div className="pt-58 h-full overflow-y-auto">
        {/* ======================================================= */}
        {/* ORDERS */}
        {/* ======================================================= */}

        {tab === "orders" ? (
          <Orders search={search} />
        ) : loading ? (
          /* ===================================================== */
          /* LOADING SKELETON */
          /* ===================================================== */

          <div className="flex flex-col gap-3 p-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-1 bg-slate-200" />

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-slate-200" />

                    <div className="flex-1">
                      <div className="h-4 w-36 rounded-md bg-slate-200" />
                      <div className="mt-2 h-3 w-24 rounded-md bg-slate-200" />
                    </div>

                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                  </div>

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

                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-3 w-28 rounded-md bg-slate-200" />
                    <div className="h-4 w-24 rounded-md bg-slate-200" />
                  </div>

                  {/* SKELETON BOOK AGAIN */}
                  <div className="mt-3 h-10 w-full rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {/* =================================================== */}
            {/* NO BOOKINGS */}
            {/* =================================================== */}

            {filteredBookings.length === 0 ? (
              <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>

                <h2 className="mt-4 text-base font-semibold text-slate-900">
                  No Booking Found
                </h2>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                  {search
                    ? "No booking matches your search."
                    : "You don't have any bookings yet."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setShowSuggestions(false);
                      searchRef.current?.blur();
                    }}
                    className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Clear Search
                  </button>
                )}

                {!search && (
                  <button
                    type="button"
                    onClick={() => router.push("/workers")}
                    className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Find a Worker
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              /* ================================================= */
              /* BOOKING LIST */
              /* ================================================= */

              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* TOP LINE */}
                  <div className="h-1 bg-linear-to-r from-emerald-500 via-green-500 to-lime-400" />

                  <div className="p-4">
                    {/* ========================================= */}
                    {/* HEADER */}
                    {/* ========================================= */}

                    <Link
                      href={`/my-bookings/${booking.booking_id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </div>

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
                    </Link>

                    {/* ========================================= */}
                    {/* WORKER */}
                    {/* ========================================= */}

                    <Link
                      href={`/my-bookings/${booking.booking_id}`}
                      className="block"
                    >
                      <div className="mt-2 rounded-xl border border-emerald-100 bg-linear-to-r from-white to-emerald-50 p-2">
                        <div className="flex items-center gap-2">
                          <div className="relative shrink-0">
                            <Image
                              src={
                                booking.worker_photo ||
                                "/worker-placeholder.png"
                              }
                              alt={booking.worker_name || "Worker"}
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
                    </Link>

                    {/* ========================================= */}
                    {/* BOTTOM */}
                    {/* ========================================= */}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Link
                        href={`/my-bookings/${booking.booking_id}`}
                        className="flex min-w-0 items-center gap-2"
                      >
                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />

                        <span className="truncate text-[11px] text-slate-500">
                          Workkerz Trust
                        </span>
                      </Link>

                      <Link
                        href={`/my-bookings/${booking.booking_id}`}
                        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-600"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>

                    {/* ========================================= */}
                    {/* BOOK AGAIN */}
                    {/* ========================================= */}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBookAgain(booking);
                      }}
                      className="group mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-[12px] font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
                    >
                      <span>Book Again</span>

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}