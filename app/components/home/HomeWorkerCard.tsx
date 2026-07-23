"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, BadgeCheck } from "lucide-react";
import { Worker } from "@/app/data/workers";

interface Props {
  worker: Worker;
}

export default function HomeWorkerCard({ worker }: Props) {
  return (
    <Link
  href={`/workers/${worker.id}`}
  className="group w-44 shrink-0 rounded-2xl border border-slate-200 bg-gray-200/60 p-3 shadow-sm transition-all hover:shadow-md"
>
  <div className="flex items-start gap-3">
    {/* Image */}
    <div className="relative shrink-0">
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-white ring-2 ring-slate-200">
        <Image
          src={worker.photo || "/worker-placeholder.png"}
          alt={worker.name}
          fill
          className="object-cover"
        />
      </div>

      {worker.available && (
        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>

    {/* Details */}
    <div className="min-w-0 flex-1">
      <h3 className="truncate text-[13px] font-bold text-slate-900">
        {worker.name}
      </h3>

      <p className="truncate text-[11px] text-slate-500">
        {worker.specialty || worker.subcategory}
      </p>

      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
        <Star
          size={10}
          className="fill-amber-400 text-amber-400"
        />
        <span className="text-[10px] font-semibold">
          {worker.rating}
        </span>
      </div>
    </div>
  </div>

  {/* Divider */}
  <div className="my-3 h-px bg-slate-100" />

  {/* Bottom */}
 <div className="flex items-center justify-between gap-2">
  <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">
    ₹{worker.startingPrice}
  </p>

  <div className="min-w-0 flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1">
    <MapPin size={10} className="shrink-0 text-slate-400" />
    <span className="truncate text-[10px] text-slate-600">
      {worker.location}
    </span>
  </div>
</div>
</Link>
  );
}
