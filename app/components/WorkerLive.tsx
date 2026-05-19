"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
    const { data: workersData, error: workersError } =
      await supabase
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

    // BOOKINGS TABLE
    const { data: bookingsData, error: bookingsError } =
      await supabase
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

    return merged
      // ONLY SHOW WORKERS WITH MORE THAN 1 COMPLETED JOB
      .filter((worker) => worker.completed_jobs > 1)

      // MOST COMPLETED JOBS FIRST
      .sort((a, b) => b.completed_jobs - a.completed_jobs)

      // TOP 10
      .slice(0, 10);
  }, [workers, bookings]);

  // LOOP
  const cards = [...topWorkers, ...topWorkers];

  return (
    <section className="bg-[#1E293B] py-4 overflow-hidden border-y border-amber-200">
      {/* TOP BAR */}
      <div className="flex items-center mb-3 px-6">
        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
          🔴 LIVE TRACKING
        </span>

        <p className="ml-4 text-gray-300 text-sm">
          Top Workers • Most Completed Jobs
        </p>
      </div>

      {/* SLIDER */}
      <div className="overflow-hidden">
        <div className="flex marquee whitespace-nowrap">
          {cards.map((worker, i) => (
            <div
              key={i}
              className="mx-4 min-w-[370px] bg-white rounded-3xl shadow-lg p-4 flex items-center gap-4"
            >
              {/* IMAGE */}
              <img
                src={worker.photo}
                alt={worker.name}
                className="w-18 h-18 rounded-2xl object-cover border border-gray-100"
              />

              {/* CONTENT */}
              <div className="flex-1">
                {/* TOP */}
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-800 text-lg">
                    {worker.name}
                  </h3>

                  <span className="text-[10px] bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">
                    Trending
                  </span>
                </div>

                {/* CATEGORY */}
                <div className="mt-2 flex items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-[#FFF8E7] px-3 py-1 rounded-full border border-[#FFE7A3]">
                    <div className="w-2 h-2 rounded-full bg-[#EAB308]" />

                    <span className="text-[11px] font-bold text-[#CA8A04]">
                      {worker.category}
                    </span>
                  </div>

                  <span className="text-gray-400 font-bold">
                    •
                  </span>

                  <span className="text-[12px] text-[#475569] font-semibold">
                    {worker.subcategory}
                  </span>
                </div>

                {/* SPECIALTY */}
                <div className="text-sm text-gray-500 mt-2">
                  {worker.specialty}
                </div>

                {/* COMPLETED JOBS */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-green-600 font-bold text-sm">
                    📈 +{worker.completed_jobs} Works Completed
                  </span>

                  <span className="text-xs font-bold text-amber-500">
                    ⭐ {worker.rating}
                  </span>
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