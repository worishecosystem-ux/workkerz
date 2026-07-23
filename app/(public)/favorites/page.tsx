"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getWorkerById } from "@/app/data/workers";

export default function FavoritesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
        return;
      }

      const favoriteWorkers = [];

      for (const item of data || []) {
        const worker = await getWorkerById(item.worker_id);

        if (worker) {
          favoriteWorkers.push({
            ...worker,
            favoriteWorkerId: item.worker_id,
          });
        }
      }

      setWorkers(favoriteWorkers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (workerId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("favorites")
      .delete()
      .eq("customer_id", user.id)
      .eq("worker_id", workerId);

    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Logo Loader */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />

            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FF5C39] border-r-[#FF5C39] animate-spin" />

            <div className="w-16 h-16 rounded-2xl bg-[#FF5C39] flex items-center justify-center shadow-xl shadow-orange-200 animate-pulse">
              <span className="text-white text-3xl font-black">W</span>
            </div>
          </div>

          {/* Text */}
          <div className="mt-7 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              Loading Favorites
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Fetching your saved workers...
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex gap-2 mt-5">
            <span className="w-2.5 h-2.5 bg-[#FF5C39] rounded-full animate-bounce" />

            <span
              className="w-2.5 h-2.5 bg-[#FF8A65] rounded-full animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />

            <span
              className="w-2.5 h-2.5 bg-[#FFB199] rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-30">
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-linear-to-r from-emerald-500 via-green-500 to-lime-700 shadow-lg">
            <div className="pt-safe pt-12 pb-4 px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                <div className="flex-1 min-w-0">
                  <h1 className="text-white font-bold text-xl">
                    Favorite Workers
                  </h1>

                  <p className="text-orange-100 text-xs">
                    {workers.length} Saved Workers
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-35 pb-24 px-4">
        {workers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center">
            <Heart className="w-12 h-12 mx-auto text-slate-300" />

            <h3 className="font-semibold text-lg mt-4">No Favorite Workers</h3>

            <p className="text-slate-500 mt-2">
              Save workers by clicking the heart icon.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {workers.map((worker) => (
              <Link
                key={worker.favoriteWorkerId}
                href={`/workers/${worker.favoriteWorkerId}`}
              >
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    {/* Worker Image */}
                    <div className="relative shrink-0">
                      <Image
                        src={worker.photo || "/worker-placeholder.png"}
                        alt={worker.name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-xl object-cover"
                      />

                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[15px] text-slate-900 truncate">
                            {worker.name}
                          </h3>

                          <p className="text-xs text-orange-600 truncate">
                            {worker.specialty}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFavorite(worker.id);
                          }}
                          className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>⭐ {worker.rating}</span>
                        <span>•</span>
                        <span className="truncate">{worker.location}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-[14px] text-orange-600">
                          ₹{worker.startingPrice}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                          Available
                        </span>
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
