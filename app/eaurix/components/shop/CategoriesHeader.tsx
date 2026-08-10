"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowUpDown,
  ChevronDown,
  Menu,
  LayoutGrid,
} from "lucide-react";

import ProductSearch from "./ProductSearch";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  price: number;
}

interface Category {
  id: string | null;
  name: string;
  image?: string;
  icon?: React.ElementType;
}

interface CategoriesHeaderProps {
  loading: boolean;

  sort: string;
  setSort: (value: string) => void;

  sortLabels: Record<string, string>;

  categories: Category[];

  activeCategory: string | null;
  setActiveCategory: (
    id: string | null,
  ) => void;

  categoryRef: React.RefObject<
    HTMLDivElement | null
  >;

  onOpenSidebar?: () => void;

  products: Product[];

  search: string;
  setSearch: React.Dispatch<
    React.SetStateAction<string>
  >;
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
  const [isScrolled, setIsScrolled] =
    useState(false);

  /* =====================================================
     SCROLL
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  /* =====================================================
     LOADING SKELETON
  ===================================================== */

  if (loading) {
    return (
      <div className="w-full bg-white">
        {/* Search Skeleton */}

        <div className="px-3 pt-3">
          <div
            className="
              h-10
              w-full
              animate-pulse
              rounded-xl
              bg-slate-200
            "
          />
        </div>

        {/* Categories Skeleton */}

        <div
          className="
            flex
            gap-4
            overflow-hidden
            px-3
            pt-3
            pb-3
          "
        >
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="
                flex
                min-w-17
                shrink-0
                flex-col
                items-center
                gap-2
              "
            >
              {/* Circle */}

              <div
                className="
                  h-14
                  w-14
                  animate-pulse
                  rounded-full
                  bg-slate-200
                "
              />

              {/* Name */}

              <div
                className="
                  h-3
                  w-12
                  animate-pulse
                  rounded
                  bg-slate-200
                "
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =====================================================
     NORMAL UI
  ===================================================== */

  return (
    <div
      className={`
        sticky
        top-0
        z-40
        border-b
        border-slate-200
        bg-linear-to-br
        from-sky-100
        via-sky-50
        to-cyan-100
        transition-all
        duration-300
        ${isScrolled ? "pt-12" : "pt-0"}
      `}
    >
      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="px-3 pt-2">
        <ProductSearch
          products={products}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* =================================================
          CATEGORIES
      ================================================= */}

      <div
        ref={categoryRef}
        className="
          flex
          gap-4
          overflow-x-auto
          px-3
          pt-2
          pb-2
          scrollbar-hide
        "
      >
        {categories.map((cat) => {
          const active =
            activeCategory === cat.id ||
            (!activeCategory &&
              cat.id === null);

          const Icon =
            cat.icon ||
            (cat.id === null
              ? LayoutGrid
              : null);

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() =>
                setActiveCategory(cat.id)
              }
              className="
                shrink-0
                outline-none
              "
            >
              <div className="flex flex-col items-center">
                {/* =========================================
                    CATEGORY VISUAL
                ========================================= */}

                {!isScrolled && (
                  <>
                    {cat.id === null ? (
                      /* ALL ICON */

                      <div
                        className={`
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-full
                          border
                          bg-white
                          shadow-sm
                          transition-all
                          duration-200
                          ${
                            active
                              ? `
                                scale-110
                                border-emerald-300
                                bg-emerald-50
                                shadow-md
                              `
                              : `
                                border-slate-200
                                opacity-90
                              `
                          }
                        `}
                      >
                        <LayoutGrid
                          size={23}
                          strokeWidth={
                            active ? 2.3 : 2
                          }
                          className={
                            active
                              ? "text-emerald-600"
                              : "text-slate-500"
                          }
                        />
                      </div>
                    ) : (
                      /* OTHER CATEGORY IMAGES */

                      <img
                        src={cat.image}
                        alt={cat.name}
                        className={`
                          h-14
                          w-14
                          object-contain
                          transition-all
                          duration-200
                          ${
                            active
                              ? "scale-110"
                              : "opacity-90 hover:scale-105"
                          }
                        `}
                      />
                    )}
                  </>
                )}

                {/* =========================================
                    NAME
                ========================================= */}

                <span
                  className={`
                    ${
                      isScrolled
                        ? "mt-0 text-xs"
                        : "mt-2 text-[11px]"
                    }
                    font-medium
                    whitespace-nowrap
                    ${
                      active
                        ? "font-bold text-slate-900"
                        : "text-slate-500"
                    }
                  `}
                >
                  {cat.name}
                </span>

                {/* =========================================
                    ACTIVE INDICATOR
                ========================================= */}

                {active && (
                  <div
                    className="
                      mt-1
                      h-0.5
                      w-10
                      rounded-full
                      bg-slate-900
                    "
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}