"use client";

import Image from "next/image";
import { useMemo } from "react";
import { ChevronRight, Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Worker } from "@/app/data/workers";

type SearchDropdownProps = {
  workers: Worker[];
  search: string;
  selectedLocation?: string;
  onClose: () => void;
};

export default function SearchDropdown({
  workers,
  search,
  selectedLocation,
  onClose,
}: SearchDropdownProps) {
  const router = useRouter();

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return workers
      .filter((worker) => {
        const name = worker.name || "";
        const category = worker.category || "";
        const specialty = worker.specialty || "";
        const location = worker.location || "";

        const matchesSearch =
          name.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query) ||
          specialty.toLowerCase().includes(query) ||
          location.toLowerCase().includes(query);

        const matchesLocation =
          !selectedLocation ||
          location.toLowerCase() === selectedLocation.toLowerCase();

        return matchesSearch && matchesLocation;
      })
      .slice(0, 8);
  }, [workers, search, selectedLocation]);

  const handleWorkerClick = (worker: Worker) => {
    console.log("CLICKED WORKER:", worker);
    console.log("WORKER ID:", worker.id);

    if (!worker.id) {
      console.error("Worker ID missing:", worker);
      return;
    }

    onClose();

    router.push(`/workers/${worker.id}`);
  };

  if (!search.trim()) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      {filteredWorkers.length > 0 ? (
        <div className="max-h-[360px] overflow-y-auto p-1.5">
          {filteredWorkers.map((worker) => {
            const image = worker.photo?.trim() || "";

            return (
              <button
                key={worker.id}
                type="button"
                onClick={() => handleWorkerClick(worker)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-50 active:bg-emerald-100"
              >
                {/* WORKER IMAGE */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
                  {image ? (
                    <Image
                      src={image}
                      alt={worker.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <UserRound className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>

                {/* WORKER DETAILS */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-gray-900 sm:text-sm">
                    {worker.name}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-xs">
                    {worker.category}
                    {worker.specialty
                      ? ` • ${worker.specialty}`
                      : ""}
                  </p>
                </div>

                {/* ARROW */}
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <Search className="h-5 w-5" />
          </div>

          <p className="mt-2 text-xs font-bold text-gray-700">
            No worker found
          </p>

          <p className="mt-1 text-[10px] text-gray-400">
            Try another worker name or category.
          </p>
        </div>
      )}
    </div>
  );
}