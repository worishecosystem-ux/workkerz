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
  // FETCH
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

  // FETCH DATA
  const fetchData = async () => {
    // WORKERS TABLE
    const { data: workersData, error: workersError } = await supabase.from(
      "workers",
    ).select(`
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

    // BOOKINGS TABLE
    const { data: bookingsData, error: bookingsError } = await supabase.from(
      "bookings",
    ).select(`
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

  // TOP WORKERS
  const topWorkers = useMemo(() => {
    // ONLY COMPLETED BOOKINGS
    const completedBookings = bookings.filter(
      (b) => b.booking_status === "completed",
    );

    // COUNT COMPLETED JOBS
    const completedMap: Record<string, number> = {};

    completedBookings.forEach((booking) => {
      if (!booking.worker_id) return;

      completedMap[booking.worker_id] =
        (completedMap[booking.worker_id] || 0) + 1;
    });

    // MERGE WORKERS + COMPLETED JOBS
    const merged = workers.map((worker) => ({
      ...worker,
      completed_jobs: completedMap[worker.id] || 0,
    }));

    return (
      merged
        // ONLY SHOW WORKERS WITH MORE THAN 1 COMPLETED JOB
        .filter((worker) => worker.completed_jobs > 1)

        // MOST COMPLETED JOBS FIRST
        .sort((a, b) => b.completed_jobs - a.completed_jobs)

        // TOP 10
        .slice(0, 10)
    );
  }, [workers, bookings]);

  // LOOP
  const cards = [...topWorkers, ...topWorkers];

  return (
    <section className="bg-[#1E293B] py-4 overflow-hidden border-y border-amber-200">
      {/* TOP BAR */}
      <div className="flex items-center mb-2 px-3 md:px-6">
        <span className="bg-red-500 text-white text-[9px] md:text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse">
          🔴 LIVE
        </span>

        <p className="ml-2 md:ml-4 text-[9px] md:text-sm text-gray-300">
          Top Workers • Most Completed Jobs
        </p>
      </div>

      {/* SLIDER */}
      <div className="overflow-hidden">
        <div className="flex marquee whitespace-nowrap">
          {cards.map((worker, i) => (
            <div
              key={i}
              className="mx-2 min-w-60 bg-white border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center">
                <img
                  src={worker.photo}
                  alt={worker.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 truncate">
                    {worker.name}
                  </h3>

                  <span className="text-[10px] font-bold text-amber-500">
                    ⭐ {worker.rating}
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 truncate">
                  {worker.category}
                </p>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-green-600 font-semibold">
                    {worker.completed_jobs}+ works completed
                  </span>

                  <button
                    onClick={() => router.push(`/workers/${worker.id}`)}
                    className="text-[9px] px-2 py-0.5 bg-[#FF5C39] text-white rounded-full font-bold"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .marquee {
          width: max-content;
          animation: scroll 30s linear infinite;
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
