
"use client";

import { LayoutGrid } from "lucide-react";

import type { GalleryWork } from "./types";
import CompletedWorkCard from "./CompletedWorkCard";

interface CompletedWorkGridProps {
  works: GalleryWork[];
  onSelect: (work: GalleryWork) => void;
}

export default function CompletedWorkGrid({
  works,
  onSelect,
}: CompletedWorkGridProps) {
  if (works.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <LayoutGrid className="h-6 w-6 text-emerald-600" />
        </div>

        <h3 className="mt-4 text-base font-bold text-slate-800">
          No completed work yet
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
          Completed projects with photos will appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-[repeat(auto-fill,minmax(min(100%,135px),1fr))]
        gap-2
        sm:grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))]
        sm:gap-3
        lg:grid-cols-[repeat(auto-fill,minmax(min(100%,210px),1fr))]
        lg:gap-4
      "
    >
      {works.map((work) => (
        <CompletedWorkCard
          key={work.id}
          work={work}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
