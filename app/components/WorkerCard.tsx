"use client";

import { Star, MapPin, User, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  const [imageError, setImageError] = useState(false);

  const cat = categoryColors[worker.category] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: worker.category,
  };

  const workerImage =
    worker.photo && worker.photo.trim() !== ""
      ? worker.photo
      : "/worker-placeholder.png";

  return (
    <div className="flex h-85 w-full flex-col rounded-3xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-[#FF5C39]/20 hover:shadow-xl">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex min-h-18 items-start gap-4">
        {/* IMAGE */}

        <div className="relative h-22 w-18 shrink-0">
          {!imageError ? (
            <img
              src={workerImage}
              alt={worker.name || "Worker"}
              className="h-full w-full rounded-2xl bg-gray-100 object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                setImageError(true);
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          )}

          {/* AVAILABLE */}

          {worker.available && (
            <span
              className="
                absolute
                -bottom-1
                -right-1
                h-4
                w-4
                rounded-full
                border-2
                border-white
                bg-emerald-400
                shadow-sm
              "
            />
          )}
        </div>

        {/* INFO */}

        <div className="min-w-0 flex-1">
          {/* NAME */}

          <h3 className="truncate text-[18px] font-bold leading-tight text-[#0F172A]">
            {worker.name}
          </h3>

          {/* SPECIALTY */}

          <p className="mt-1 truncate text-sm text-[#64748B]">
            {worker.specialty}
          </p>

          {/* CATEGORY */}

          <div className="mt-3">
            <span
              className={`
                inline-flex
                items-center
                rounded-full
                px-3
                py-1
                text-xs
                font-medium
                ${cat.bg}
                ${cat.text}
              `}
            >
              {worker.subcategory || cat.label}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          RATING + LOCATION
      ===================================================== */}

      <div className="mt-5 flex min-h-6 items-center gap-4 text-sm">
        {/* RATING */}

        <div className="flex shrink-0 items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

          <span className="font-semibold text-[#0F172A]">
            {worker.rating}
          </span>

          <span className="text-[#94A3B8]">
            ({worker.reviewCount})
          </span>
        </div>

        {/* LOCATION */}

        <div className="flex min-w-0 items-center gap-1 text-[#64748B]">
          <MapPin className="h-4 w-4 shrink-0" />

          <span className="truncate">
            {worker.location}
          </span>
        </div>
      </div>

      {/* =====================================================
          SKILLS
      ===================================================== */}

      <div className="mt-5 h-15 overflow-hidden">
        <div className="flex flex-wrap gap-2">
          {worker.skills.slice(0, 3).map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="
                rounded-full
                border
                border-gray-200
                bg-gray-50
                px-3
                py-1
                text-xs
                text-[#475569]
              "
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

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="mt-auto border-t border-gray-100 pt-2">
        <div className="flex items-end justify-between gap-4">
          {/* PRICE */}

          <div className="min-w-0">
            <div className="flex items-end gap-1">
              <span className="text-sm font-bold text-[#FF5C39]">
                From ₹{worker.startingPrice}
              </span>
            </div>

            {/* RESPONSE */}

            <div className="mt-2 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-[#FF5C39]" />

              <span className="truncate text-xs text-[#64748B]">
                {worker.responseTime}
              </span>
            </div>
          </div>

          {/* BUTTON */}

          <Link
            href={`/workers/${worker.id}`}
            className="
              flex
              h-10
              min-w-[125px]
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[#FF5C39]
              px-5
              text-sm
              font-semibold
              text-white
              transition-all
              duration-200
              hover:bg-[#e54e2e]
              active:scale-[0.98]
            "
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}