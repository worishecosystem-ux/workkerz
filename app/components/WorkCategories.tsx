"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { serviceCategories } from "@/app/data/workers";

export default function WorkCategories() {
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";

  const categories = [
    {
      id: "all",
      label: "All",
      image: "",
    },
    ...serviceCategories.filter(
      (category) => category.id.toLowerCase() !== "all",
    ),
  ].filter(
    (category, index, self) =>
      index === self.findIndex((item) => item.id === category.id),
  );

  return (
    <section className="w-full">
      <div className="max-w-7xl">
        {/* HEADER */}
        <div className="mt-2 flex items-center justify-between">
          <h2 className="mt-1 text-lg font-bold text-[#3a540c] md:text-xl">
            All Work Categories
          </h2>
        </div>

        {/* HORIZONTAL CATEGORY LIST */}
        <div className="flex w-full flex-nowrap gap-4 overflow-x-auto overflow-y-hidden pb-2 pt-2 scrollbar-hide scroll-smooth [-webkit-overflow-scrolling:touch]">
          {categories.map((category) => {
            const isAll = category.id === "all";

            const isActive = isAll
              ? activeCategory === "" || activeCategory === "all"
              : activeCategory === category.id;

            return (
              <Link
                key={category.id}
                href={
                  isAll
                    ? "/browse"
                    : `/browse?category=${encodeURIComponent(category.id)}`
                }
                className="shrink-0"
              >
                <div className="flex w-17 flex-col items-center">
                  {/* ICON */}
                  <div className="flex h-11 w-11 items-center justify-center">
                    {isAll ? (
                      <LayoutGrid
                        size={28}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        className={
                          isActive ? "text-emerald-600" : "text-slate-500"
                        }
                      />
                    ) : category.image ? (
                      <Image
                        src={category.image}
                        alt={category.label}
                        width={42}
                        height={42}
                        className={`h-10.5 w-10.5 object-contain transition-transform duration-200 ${
                          isActive ? "scale-110" : "scale-100"
                        }`}
                      />
                    ) : (
                      <LayoutGrid
                        size={28}
                        strokeWidth={1.8}
                        className="text-slate-400"
                      />
                    )}
                  </div>

                  {/* LABEL */}
                  <span
                    className={`mt-1 w-full overflow-hidden text-center text-[10px] font-medium leading-3.25 line-clamp-2 ${
                      isActive
                        ? "font-semibold text-emerald-600"
                        : "text-slate-700"
                    }`}
                  >
                    {category.label}
                  </span>

                  {/* ACTIVE LINE */}
                  <div className="mt-1 h-0.5 w-7">
                    {isActive && (
                      <div className="h-0.5 w-full rounded-full bg-emerald-600" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}