"use client";

import Link from "next/link";
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
  const activeCategory = searchParams.get("category") ?? "";


  return (
    <section>
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mt-2">
          <h2 className="text-lg md:text-xl font-bold text-[#3a540c] mt-1">
            All Work Categories
          </h2>
        </div>
        <div className="flex md:grid md:grid-cols-6 gap-4 overflow-x-auto md:overflow-visible scrollbar-hide pb-1 pt-2">
          {serviceCategories.map((category) => {
            const isActive = activeCategory === category.id;

            return (
              <Link
                key={category.id}
                href={`/browse?category=${category.id}`}
                className="shrink-0 flex flex-col items-center w-14"
              >
                <div
                  className={`w-11 h-11 flex items-center justify-center overflow-hidden transition-all duration-200 ${
                    isActive
                      ? "rounded-xl bg-slate-200 border border-black shadow-sm"
                      : ""
                  }`}
                >
                  <img
                    src={categoryImages[category.id]}
                    alt={category.label}
                    className="w-10 h-10 object-contain"
                  />
                </div>

                <span
                  className={`mt-1 w-full text-[9px] font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis ${
                    isActive ? "text-green-600" : "text-slate-700"
                  }`}
                >
                  {category.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
