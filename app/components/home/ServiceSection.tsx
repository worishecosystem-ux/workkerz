"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Worker } from "@/app/data/workers";
import HomeWorkerCard from "./HomeWorkerCard";

interface ServiceSectionProps {
  title: string;
  category: string;
  workers: Worker[];
}

export default function ServiceSection({
  title,
  category,
  workers,
}: ServiceSectionProps) {
  if (workers.length === 0) return null;

  return (
    <section className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>

        <Link
          href={`/workers?category=${encodeURIComponent(category)}`}
          className="flex items-center gap-1 text-sm font-semibold text-green-600"
        >
          See All
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Horizontal Scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4">
          {workers.slice(0, 10).map((worker) => (
            <HomeWorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </div>
    </section>
  );
}
