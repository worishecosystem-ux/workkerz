"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Worker = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  specialty: string;
  photo: string;
  rating: number;
  completed_jobs: number;
};

type Booking = {
  worker_id: string;
  booking_status: string;
};

export default function LiveNewsStrip() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetchData();

    const workersChannel = supabase
      .channel("workers-live-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workers",
        },
        () => {
          fetchData();
        },
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel("bookings-live-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(workersChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const fetchData = async () => {
    const { data: workersData, error: workersError } = await supabase
      .from("workers")
      .select(`
        id,
        name,
        category,
        subcategory,
        specialty,
        photo,
        rating
      `);

    if (workersError) {
      console.log(workersError);
      return;
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        worker_id,
        booking_status
      `);

    if (bookingsError) {
      console.log(bookingsError);
      return;
    }

    setWorkers((workersData || []) as Worker[]);
    setBookings((bookingsData || []) as Booking[]);
  };

  // =========================
  // CATEGORY MIXED WORKERS
  // =========================
  const topWorkers = useMemo(() => {
    // Completed jobs count
    const completedMap: Record<string, number> = {};

    bookings
      .filter((b) => b.booking_status === "completed")
      .forEach((booking) => {
        if (!booking.worker_id) return;

        completedMap[booking.worker_id] =
          (completedMap[booking.worker_id] || 0) + 1;
      });

    // Merge completed jobs
    const merged = workers.map((worker) => ({
      ...worker,
      completed_jobs: completedMap[worker.id] || 0,
    }));

    /*
     * =====================================
     * GROUP BY CATEGORY
     * =====================================
     */
    const grouped: Record<string, Worker[]> = {};

    merged.forEach((worker) => {
      const category = worker.category?.trim() || "Other";

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push(worker);
    });

    /*
     * =====================================
     * SORT EACH CATEGORY
     * BEST WORKER FIRST
     * =====================================
     */
    Object.values(grouped).forEach((list) => {
      list.sort((a, b) => {
        // Completed jobs priority
        if (b.completed_jobs !== a.completed_jobs) {
          return b.completed_jobs - a.completed_jobs;
        }

        // Rating priority
        return (b.rating || 0) - (a.rating || 0);
      });
    });

    /*
     * =====================================
     * TAKE ONE FROM EVERY CATEGORY
     * =====================================
     */
    const categoryWorkers: Worker[] = [];

    Object.values(grouped).forEach((list) => {
      if (list.length > 0) {
        categoryWorkers.push(list[0]);
      }
    });

    /*
     * =====================================
     * RANDOMIZE CATEGORY ORDER
     * =====================================
     */
    categoryWorkers.sort(() => Math.random() - 0.5);

    /*
     * =====================================
     * FILL REMAINING WORKERS
     * =====================================
     */
    const selectedIds = new Set(
      categoryWorkers.map((worker) => worker.id),
    );

    const remainingWorkers = merged
      .filter((worker) => !selectedIds.has(worker.id))
      .sort((a, b) => {
        if (b.completed_jobs !== a.completed_jobs) {
          return b.completed_jobs - a.completed_jobs;
        }

        return (b.rating || 0) - (a.rating || 0);
      });

    /*
     * Maximum 12 workers
     */
    const finalWorkers = [
      ...categoryWorkers,
      ...remainingWorkers,
    ].slice(0, 12);

    return finalWorkers;
  }, [workers, bookings]);

  /*
   * =====================================
   * DUPLICATE FOR INFINITE MARQUEE
   * =====================================
   */
  const cards = [...topWorkers, ...topWorkers];

  return (
    <section className="overflow-hidden border-y border-emerald-200 bg-gradient-to-br from-emerald-100 via-green-50 to-white py-4 shadow-[inset_0_2px_0_rgba(255,255,255,0.8),0_10px_30px_rgba(16,185,129,0.18)]">

      {/* =========================
          TOP BAR
      ========================= */}
      <div className="mb-2 flex items-center px-3 md:px-6">
        <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-semibold text-white md:text-xs">
          🔴 LIVE
        </span>

        <p className="ml-2 text-[9px] font-bold text-gray-900 md:ml-4 md:text-sm">
          Workers Near You • Multiple Categories
        </p>
      </div>

      {/* =========================
          SLIDER
      ========================= */}
      <div className="overflow-hidden">
        <div className="marquee flex w-max whitespace-nowrap">

          {cards.map((worker, i) => (
            <div
              key={`${worker.id}-${i}`}
              onClick={() => router.push(`/workers/${worker.id}`)}
              className="mx-2 flex min-w-60 cursor-pointer items-center gap-2 rounded-xl border border-white/70 bg-gradient-to-br from-white/90 via-slate-100 to-slate-200 px-3 py-2 shadow-[inset_0_2px_0_rgba(255,255,255,1),0_10px_25px_rgba(15,23,42,0.15)] backdrop-blur-2xl"
            >
              {/* IMAGE */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-1">
                <img
                  src={worker.photo}
                  alt={worker.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* INFO */}
              <div className="min-w-0 flex-1">

                {/* NAME + RATING */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-xs font-bold text-slate-800">
                    {worker.name}
                  </h3>

                  <span className="shrink-0 text-[10px] font-bold text-amber-500">
                    ⭐ {worker.rating || 0}
                  </span>
                </div>

                {/* CATEGORY */}
                <p className="truncate text-[10px] font-semibold text-emerald-600">
                  {worker.category}
                </p>

                {/* SUBCATEGORY */}
                {worker.subcategory && (
                  <p className="truncate text-[9px] text-slate-500">
                    {worker.subcategory}
                  </p>
                )}

                {/* BOTTOM */}
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] font-semibold text-green-600">
                    {worker.completed_jobs}+ works
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/workers/${worker.id}`);
                    }}
                    className="shrink-0 rounded-full bg-[#FF5C39] px-2 py-0.5 text-[9px] font-bold text-white transition hover:bg-[#e94d2d]"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* =========================
          MARQUEE CSS
      ========================= */}
      <style jsx>{`
        .marquee {
          animation: scroll 35s linear infinite;
        }

        .marquee:hover {
          animation-play-state: paused;
        }

        @keyframes scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}