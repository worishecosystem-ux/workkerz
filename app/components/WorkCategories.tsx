"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { serviceCategories } from "@/app/data/workers";

const categoryImages: Record<string, string> = {
  all: "/categories/all.png",
  Labour: "/categories/1L.png",
  Driver: "/categories/1d.png",
  Mechanic: "/categories/1m.webp",
  Washer: "/categories/1w.png",
  "Computer Operator": "/categories/1c.webp",
  "Office Worker": "/categories/1c.webp",
  "Home Services": "/categories/1h.png",
  "Salon & Beauty": "/categories/1sa.png",
  Restaurant: "/categories/1r.png",
  Contractor: "/categories/1c.png",
  Factory: "/categories/image copy.png",
  Security: "/categories/1sec.png",
  "Event Services": "/categories/1e.png",
};

export default function WorkCategories() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  return (
    <section>
      <div className="max-w-7xl">
        <div className="mt-2 flex items-center justify-between">
          <h2 className="mt-1 text-lg font-bold text-[#3a540c] md:text-xl">
            All Work Categories
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-1 pt-2 scrollbar-hide md:grid md:grid-cols-6 md:overflow-visible">
          {serviceCategories.map((category) => {
            const isActive = activeCategory === category.id;

            return (
              <Link
                key={category.id}
                href={`/browse?category=${category.id}`}
                className="shrink-0"
              >
                <div className="flex w-18 flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-600 shadow-md ring-2 ring-emerald-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <Image
                      src={categoryImages[category.id] ?? "/categories/all.png"}
                      alt={category.label}
                      width={35}
                      height={35}
                      className={`object-contain transition-all ${
                        isActive ? "scale-110 brightness-0 invert" : ""
                      }`}
                    />
                  </div>

                  <span
                    className={`mt-1 line-clamp-2 text-center text-[10px] font-bold leading-tight ${
                      isActive ? "text-emerald-700" : "text-slate-700"
                    }`}
                  >
                    {category.label}
                  </span>

                  {isActive && (
                    <div className="mt-1 h-1 w-6 rounded-full bg-emerald-600" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}