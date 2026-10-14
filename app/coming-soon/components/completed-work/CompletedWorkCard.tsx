
"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Images,
  UserRound,
  UserCheck,
  ChevronRight,
  ImageOff,
} from "lucide-react";

import type { GalleryWork } from "./types";
import { formatDate, getInitials } from "./utils";

interface CompletedWorkCardProps {
  work: GalleryWork;
  onClick: (work: GalleryWork) => void;
}

export default function CompletedWorkCard({
  work,
  onClick,
}: CompletedWorkCardProps) {
  const [imageError, setImageError] = useState(false);

  const coverImage = work.images?.[0]?.image_url;
  const workerName = work.worker_name || "Workkerz Professional";

  return (
    <button
      type="button"
      onClick={() => onClick(work)}
      aria-label={`View details of ${work.work_name}`}
      className="group w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {/* SMALL COVER IMAGE */}
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-slate-100">
        {coverImage && !imageError ? (
          <img
            key={coverImage}
            src={coverImage}
            alt={work.work_name || "Completed project"}
            loading="eager"
            decoding="async"
            onError={() => {
              console.error("Cover image failed:", coverImage);
              setImageError(true);
            }}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <ImageOff className="h-6 w-6 text-slate-300" />
          </div>
        )}

        {/* IMAGE GRADIENT */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 to-transparent" />

        {/* STATUS */}
        <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-1 text-[8px] font-bold text-emerald-700 shadow-sm sm:text-[9px]">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </span>

        {/* IMAGE COUNT */}
        {work.images?.length > 0 && (
          <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-1.5 py-1 text-[9px] font-semibold text-white">
            <Images className="h-3 w-3" />
            {work.images.length}
          </span>
        )}

        {/* TITLE AND DATE */}
        <div className="absolute inset-x-2 bottom-2">
          <p className="flex items-center gap-1 text-[8px] font-medium text-white/90 sm:text-[9px]">
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {formatDate(work.completed_date)}
            </span>
          </p>

          <h3 className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-4 text-white sm:text-xs">
            {work.work_name}
          </h3>
        </div>
      </div>

      {/* COMPACT DETAILS */}
      <div className="p-2 sm:p-2.5">
        {work.description && (
          <p className="mb-2 line-clamp-1 text-[9px] leading-3.5 text-slate-500 sm:text-[10px]">
            {work.description}
          </p>
        )}

        {/* PROFESSIONAL */}
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 sm:h-7 sm:w-7">
            {work.worker_photo ? (
              <img
                src={work.worker_photo}
                alt={workerName}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[9px] font-bold text-emerald-700">
                {getInitials(workerName) || (
                  <UserRound className="h-3.5 w-3.5" />
                )}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[8px] leading-3 text-slate-400">
              Professional
            </p>
            <p className="truncate text-[10px] font-semibold leading-4 text-slate-800 sm:text-[11px]">
              {workerName}
            </p>
          </div>
        </div>

        {/* CUSTOMER AND DETAILS */}
        <div className="mt-2 flex min-w-0 items-center justify-between gap-1 border-t border-slate-100 pt-2">
          <div className="flex min-w-0 items-center gap-1">
            <UserCheck className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate text-[9px] text-slate-500">
              {work.customer_name || "Customer"}
            </span>
          </div>

          <span className="inline-flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-emerald-700">
            View
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}
