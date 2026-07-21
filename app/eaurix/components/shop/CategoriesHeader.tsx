"use client";

import React from "react";
import {
  ArrowUpDown,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import ProductSearch from "./ProductSearch";
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image?: string; // <-- optional
  price: number;
}
interface Category {
  id: string | null;
  name: string;
  image: string;
}
interface CategoriesHeaderProps {
  loading: boolean;
  sort: string;
  setSort: (value: string) => void;
  sortLabels: Record<string, string>;
  categories: Category[];
  activeCategory: string | null;
  setActiveCategory: (id: string | null) => void;
  categoryRef: React.RefObject<HTMLDivElement | null>;
  onOpenSidebar?: () => void;
  products: Product[];

  // Add these
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

export default function CategoriesHeader({
  loading,
  sort,
  setSort,
  sortLabels,
  categories,
  activeCategory,
  setActiveCategory,
  categoryRef,
  onOpenSidebar,
  products,
  search,
  setSearch,
}: CategoriesHeaderProps) {
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Top of page -> hide
      if (currentScrollY < 80) {
        setShowHeader(false);
      }
      // Scroll down -> hide
      else if (currentScrollY > lastScrollY) {
        setShowHeader(false);
      }
      // Scroll up -> show
      else {
        setShowHeader(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  if (loading) {
    return (
      <div
        className={`sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-all duration-300
    ${showHeader
            ? "translate-y-0"
            : "-translate-y-full"
          }`}
      >
        <div
          className="px-5 pt-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-44 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="h-11 w-40 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex w-20 shrink-0 flex-col items-center gap-2"
            >
              <div className="h-18 w-18 animate-pulse rounded-full bg-slate-200" />

              <div className="h-3 w-14 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`sticky top-16 z-40 border-b border-slate-200/70 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600 backdrop-blur-xl transition-all duration-300 $showHeader
  ? "translate-y-0"
  : "-translate-y-full"
        }`}
    >
      <div className="pt-13">
        <div className="px-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left */}
            <div className="flex flex-1 items-center gap-3">
              <button
                onClick={onOpenSidebar}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md transition active:scale-95 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex-1">
                <h1 className="truncate text-lg font-bold text-slate-100">
                  Categories
                </h1>
                <p className="truncate text-[11px] text-slate-200">
                  Construction materials
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="relative w-36 shrink-0">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl bg-slate-900 pl-9 pr-10 text-xs font-medium text-slate-100 outline-none transition focus:border-emerald-500"
              >
                {Object.entries(sortLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div
        ref={categoryRef}
        className="hidden md:flex w-full gap-2 overflow-x-auto px-4 pt-2 pb-2 scrollbar-hide"
      >
        {categories.map((cat) => {
          const active =
            activeCategory === cat.id ||
            (!activeCategory && cat.id === null);

          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0"
            >
              <div className="flex w-20 flex-col items-center gap-2 pt-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 ${active
                    ? "scale-105 border-emerald-500 bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-300/50"
                    : "border-slate-200 bg-white shadow-sm hover:border-emerald-300"
                    }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-8 w-8 object-contain"
                  />
                </div>

                <span
                  className={`text-center text-[11px] font-bold leading-tight ${active ? "text-emerald-700" : "text-slate-700"
                    }`}
                >
                  {cat.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="px-4 pt-3 pb-3 lg:hidden">
        <ProductSearch
          products={products}
          search={search}
          setSearch={setSearch}
        />
      </div>
    </div>
  );
}