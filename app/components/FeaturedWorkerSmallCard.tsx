import Link from "next/link";
import { Star, User } from "lucide-react";
import type { Worker } from "@/app/data/workers";

export function FeaturedWorkerSmallCard({ worker }: { worker: Worker }) {
  return (
    <Link href={`/workers/${worker.id}`} className="group block">
      <div className="bg-gray-200/60 backdrop-blur-xl border border-white/80 rounded-3xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
        {/* Photo */}
        <div className="relative">
          <img
            src={worker.photo || "/placeholder-worker.png"}
            alt={worker.name}
            className="w-full aspect-square rounded-2xl object-cover"
          />

          {worker.available && (
            <div className="absolute top-1 left-1 flex items-center justify-center w-4 h-4 rounded-full bg-white shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
          <span className="absolute bottom-1 right-1 bg-black/80 text-white px-2 py-1 rounded-full text-[10px] font-light">
            ⭐ {worker.rating}
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

            <span className="font-bold text-[#FF5C39] text-sm">
              From ₹{worker.startingPrice}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
