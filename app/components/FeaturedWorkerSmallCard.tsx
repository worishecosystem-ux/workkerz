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
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Image */}
        <div className="relative bg-gray-50">
          <div className="flex h-36 items-center justify-center p-4">
            <img
              src={worker.photo || "/placeholder-worker.png"}
              alt={worker.name}
              loading="lazy"
              draggable={false}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            />
          </div>

          {worker.available && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-2 text-[10px] font-semibold text-white shadow"></span>
          )}

          <button
            onClick={handleFavourite}
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition
        ${saved ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
          >
            <Heart
              className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>

          <div className="absolute bottom-2 left-2 rounded-md bg-white px-2 py-1 shadow">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-xs font-bold">{worker.rating}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5 p-2.5">
          {/* Worker Name */}
          <h3 className="line-clamp-1 text-[13px] font-semibold leading-tight text-gray-900">
            {worker.name}
          </h3>

          {/* Category */}
          <p className="line-clamp-1 text-[10px] text-gray-500">
            {worker.subcategory}
          </p>

          {/* Experience */}
          <div className="flex items-center justify-between">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-600">
              {worker.yearsExperience}+ yrs
            </span>

            <span className="text-[9px] text-gray-500">Verified</span>
          </div>

          {/* Price */}
          <div className="pt-0.5">
            <div className="flex items-end gap-1">
              <span className="text-[18px] font-bold leading-none text-[#0F7A22]">
                ₹{worker.startingPrice}
              </span>

              <span className="pb-0.5 text-[9px] text-gray-500">onwards</span>
            </div>
          </div>

          {/* Button */}
          <button className="mt-1 w-full rounded-md border border-[#FCD200] bg-[#FFD814] py-1.5 text-[11px] font-semibold text-gray-900 transition hover:bg-[#F7CA00]">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
