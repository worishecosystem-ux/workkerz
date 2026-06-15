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
            <span className="text-white text-3xl font-black">
              W
            </span>
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
      <div className="sticky top-0 bg-white border-b z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl border flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold">Favorite Workers</h1>

            <p className="text-sm text-slate-500">
              {workers.length} Saved Workers
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
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
                <div className="bg-white rounded-2xl border p-4 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={worker.photo || "/worker-placeholder.png"}
                        alt={worker.name}
                        width={60}
                        height={60}
                        className="w-14 h-14 rounded-xl object-cover"
                      />

                      <div>
                        <h3 className="font-semibold">{worker.name}</h3>

                        <p className="text-sm text-slate-500">
                          {worker.specialty}
                        </p>

                        <p className="text-xs text-slate-400">
                          ⭐ {worker.rating} • {worker.location}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(worker.id);
                      }}
                      className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center"
                    >
                      <Heart size={16} className="fill-red-500" />
                    </button>
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
