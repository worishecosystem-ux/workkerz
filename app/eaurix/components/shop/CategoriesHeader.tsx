"use client";

import React from "react";
import { ArrowUpDown, ChevronDown, Menu } from "lucide-react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  if (loading) {
    return (
      <div className="relative z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="px-5 pt-2">
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
      className={`sticky top-0 z-40 border-b border-slate-500 bg-linear-to-br from-sky-100 via-sky-150 to-cyan-100 transition-all duration-300 ${
        isScrolled ? "pt-12" : "pt-0"
      }`}
    >
      {/* Search */}
      <div className="px-4 ">
        <ProductSearch
          products={products}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* Categories */}
      <div
        ref={categoryRef}
        className="flex gap-4 overflow-x-auto px-3 pt-2 pb-2 scrollbar-hide"
      >
        {categories.map((cat) => {
          const active =
            activeCategory === cat.id || (!activeCategory && cat.id === null);

          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0"
            >
              <div className="flex flex-col items-center">
                {!isScrolled && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={`h-14 w-14 object-contain transition-all duration-200 ${
                      active ? "scale-110" : "opacity-90 hover:scale-105"
                    }`}
                  />
                )}

                <span
                  className={`${
                    isScrolled ? "mt-0 text-xs" : "mt-2 text-[11px]"
                  } font-medium ${
                    active ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {cat.name}
                </span>

                {active && (
                  <div className="mt-1 h-0.5 w-10 rounded-full bg-slate-900" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
