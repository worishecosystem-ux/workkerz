import { Star, MapPin, Clock, User, Zap } from "lucide-react";
import Link from "next/link";
import type { Worker } from "../data/workers";


interface WorkerCardProps {
  worker: Worker;
}

const categoryColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Labour: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "Labour",
  },

  Driver: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Driver",
  },

  Mechanic: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Mechanic",
  },

  Washer: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Washer",
  },

  "Computer Operator": {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "Computer Operator",
  },

  "Office Worker": {
    bg: "bg-pink-100",
    text: "text-pink-700",
    label: "Office Worker",
  },

  "Home Services": {
    bg: "bg-lime-100",
    text: "text-lime-700",
    label: "Home Services",
  },

  Restaurant: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    label: "Restaurant",
  },

  "Home Contractor": {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    label: "Home Contractor",
  },

  Factory: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    label: "Factory",
  },

  Roads: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Roads",
  },
};

export function WorkerCard({ worker }: WorkerCardProps) {
  const cat = categoryColors[worker.category] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: worker.category,
  };
  return (
    <div className="w-full h-85 bg-white rounded-3xl border border-gray-200 p-5 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-[#FF5C39]/20">
      {/* Header */}
      <div className="flex items-start gap-4 min-h-18">
        {/* Image */}
        {/* Image */}
        <div className="w-18 h-22 relative shrink-0">
          {worker.photo && worker.photo.trim() !== "" ? (
            <img
              src={worker.photo}
              alt={worker.name}
              className="w-full h-full rounded-2xl object-cover bg-gray-100"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              className="
        w-full h-full
        rounded-2xl
        bg-gray-100
        flex items-center justify-center
        border border-gray-200
      "
            >
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {worker.available && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="truncate text-[18px] leading-tight font-bold text-[#0F172A]">
            {worker.name}
          </h3>

          {/* Specialty */}
          <p className="truncate text-sm text-[#64748B] mt-1">
            {worker.specialty}
          </p>

          {/* Category */}
          <div className="mt-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${cat.bg} ${cat.text}`}
            >
              {worker.subcategory || cat.label}
            </span>
          </div>
        </div>
      </div>

      {/* Rating + Location */}
      <div className="mt-5 flex items-center gap-4 text-sm min-h-6">
        {/* Rating */}
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />

          <span className="font-semibold text-[#0F172A]">{worker.rating}</span>

          <span className="text-[#94A3B8]">({worker.reviewCount})</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-[#64748B] min-w-0">
          <MapPin className="w-4 h-4 shrink-0" />

          <span className="truncate">{worker.location}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-5 h-15 overflow-hidden">
        <div className="flex flex-wrap gap-2">
          {worker.skills.slice(0, 3).map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-[#475569]"
            >
              {skill}
            </span>
          ))}

          {worker.skills.length > 3 && (
            <span className="px-2 py-1 text-xs text-[#94A3B8]">
              +{worker.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-100 pt-2">
        <div className="flex items-end justify-between gap-4">
          {/* Price */}
          <div>
            <div className="flex items-end gap-1">
              <span className="font-bold text-[#FF5C39] text-sm">
                From ₹{worker.startingPrice}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#FF5C39]" />

              <span className="text-xs text-[#64748B]">
                {worker.responseTime}
              </span>
            </div>
          </div>

          {/* Button */}
          <Link
            href={`/workers/${worker.id}`}
            className="h-10 min-w-31.25 rounded-2xl bg-[#FF5C39] px-5 flex items-center justify-center text-sm font-semibold text-white transition-all duration-200 hover:bg-[#e54e2e]"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
