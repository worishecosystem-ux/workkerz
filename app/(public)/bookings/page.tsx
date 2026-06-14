"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowLeft } from "lucide-react";
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
  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false });

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
      <div className="sticky top-0 bg-white border-b z-20">
  <div className="p-4">

    <div className="flex items-center gap-3">

      <button
        onClick={() => router.back()}
        className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
      >
        <ArrowLeft size={20} />
      </button>

      <div>
        <h1 className="text-xl font-bold text-slate-900">
          My Bookings
        </h1>

        <p className="text-sm text-slate-500">
          {filteredBookings.length} Bookings
        </p>
      </div>

    </div>

    <div className="mt-4 relative">
      <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />

      <input
        placeholder="Search booking..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-xl pl-12 pr-4 py-3"
      />
    </div>

    

  </div>
</div>

      {loading ? (
        <div className="p-6">Loading...</div>
      ) : (
        <div className="p-4 flex flex-col gap-2">
          {filteredBookings.map((booking) => (
            <Link key={booking.id} href={`/my-bookings/${booking.booking_id}`}>
              <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Image
                      src={booking.worker_photo || "/worker-placeholder.png"}
                      alt={booking.worker_name}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl object-cover border"
                    />

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-base truncate">
                        {booking.worker_name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm text-slate-600">
                          {booking.service_type}
                        </span>

                        <span className="w-1 h-1 bg-slate-300 rounded-full" />

                        <span className="text-sm text-slate-500">
                          {booking.worker_specialty}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1">
                        #{booking.booking_id}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.booking_status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : booking.booking_status === "completed"
                            ? "bg-green-100 text-green-700"
                            : booking.booking_status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.booking_status}
                    </span>

                    <span className="text-xs font-medium text-violet-600">
                      View →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
