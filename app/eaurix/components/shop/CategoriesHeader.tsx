"use client";

import React from "react";
import { ArrowUpDown, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
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
    <div className="sticky top-0 z-40 border-b border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-50">Categories</h2>
            <p className="text-xs text-slate-200">
              {categories.length} Categories
            </p>
          </div>
        </div>

        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none"
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
      {/* Search */}
      <div className="px-4  pt-3">
        <ProductSearch
          products={products}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* Categories */}
      <div
        ref={categoryRef}
        className="flex gap-2 overflow-x-auto px-3 pb-3 pt-5 scrollbar-hide"
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
              <div
                className={`flex flex-col items-center transition-all duration-200 ${
                  active ? "scale-105" : ""
                }`}
              >
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-all ${
                    active
                      ? "bg-slate-900 border-slate-900 shadow-lg"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      active ? "bg-white" : "bg-white"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-6 w-6 object-contain"
                    />
                  </div>

                  {active && (
                    <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" />
                  )}
                </div>

                <span
                  className={`mt-2 max-w-16 truncate text-center text-[11px] font-semibold ${
                    active ? "text-slate-400" : "text-slate-50"
                  }`}
                >
                  {cat.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
