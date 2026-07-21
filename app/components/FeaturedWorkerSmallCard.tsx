import Link from "next/link";
import { Star, User, Heart } from "lucide-react";
import type { Worker } from "@/app/data/workers";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // apna actual path
import { useRouter } from "next/navigation";

export function FeaturedWorkerSmallCard({ worker }: { worker: Worker }) {
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleFavourite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/workers/${worker.id}`);
        return;
      }

      // Always check database first
      const { data: existing, error: checkError } = await supabase
        .from("favorites")
        .select("id")
        .eq("customer_id", user.id)
        .eq("worker_id", worker.id)
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        // Remove favourite
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", existing[0].id);

        if (error) throw error;

        setSaved(false);
      } else {
        // Add favourite
        const { error } = await supabase.from("favorites").upsert(
          {
            customer_id: user.id,
            worker_id: worker.id,
          },
          {
            onConflict: "customer_id,worker_id",
            ignoreDuplicates: true,
          },
        );

        if (error) throw error;

        setSaved(true);

        if (error) throw error;

        setSaved(true);
      }

      await checkFavourite();
    } catch (err) {
      console.error("Favourite Error:", err);
    }
  };
  useEffect(() => {
    checkFavourite();
  }, [worker.id]);

  const checkFavourite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("customer_id", user.id)
      .eq("worker_id", worker.id)
      .maybeSingle();

    setSaved(!!data);
  };
  return (
    <Link href={`/workers/${worker.id}`} className="group block">
      <div className="bg-gray-200/60 backdrop-blur-xl border border-white/80 rounded-3xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
        {/* Photo */}
        <div className="relative">
          <img
            src={worker.photo || "/placeholder-worker.png"}
            alt={worker.name}
            className="w-full aspect-square rounded-2xl object-contain-content"
          />

          {worker.available && (
            <div className="absolute top-1 left-1 flex items-center justify-center w-4 h-4 rounded-full bg-white shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
          {/* Like Button */}
          <button
            onClick={handleFavourite}
            className={`absolute top-1 right-2 z-10 w-8 h-8 rounded-full border flex items-center justify-center backdrop-blur-sm transition-colors ${
              saved
                ? "bg-red-50 border-red-200 text-red-400"
                : "bg-white/90 border-white text-gray-500"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${saved ? "fill-red-400 text-red-400" : ""}`}
            />
          </button>
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm">
            <span className="text-yellow-500">★</span>
            {worker.rating}
          </span>
        </div>

        {/* Details */}
        <div className="mt-3">
          <h3 className="font-bold text-sm text-slate-800 line-clamp-1">
            {worker.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1">
            {worker.subcategory}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {worker.yearsExperience}+ yrs
            </span>

            <span className="font-bold text-[#059962] text-sm">
              From ₹{worker.startingPrice}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
