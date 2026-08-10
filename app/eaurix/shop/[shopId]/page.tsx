"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Store,
  MapPin,
  Star,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";

import { getShops, type Shop } from "@/app/data/shops";

/* =========================================================
   SHOP SKELETON
========================================================= */

function ShopSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_1px_5px_rgba(15,23,42,0.04)]">
      <div className="aspect-[1.3/1] animate-pulse bg-slate-100" />

      <div className="p-2.5">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-100" />

        <div className="mt-1.5 h-2.5 w-2/3 animate-pulse rounded bg-slate-100" />

        <div className="mt-2 flex gap-1.5">
          <div className="h-5 w-12 animate-pulse rounded-md bg-slate-100" />
          <div className="h-5 w-16 animate-pulse rounded-md bg-slate-100" />
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-7 w-14 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SHOP CARD
========================================================= */

function ShopCard({ shop }: { shop: Shop }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const image = shop.logo || "";
  const rating = "4.5";

  return (
    <Link
      href={`/eaurix/shop/${shop.id}`}
      className="group block min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.055)] ring-1 ring-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_8px_24px_rgba(16,185,129,0.10)] active:scale-[0.985]"
    >
      {/* IMAGE */}
      <div className="relative aspect-[1.3/1] bg-slate-100 p-1.5">
        <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]">
          {!imageLoaded && !imageError && image && (
            <div className="absolute inset-0 animate-pulse bg-linear-to-br from-slate-100 via-slate-200 to-slate-100" />
          )}

          {image && !imageError ? (
            <img
              src={image}
              alt={shop.shop_name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.035] ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-100" />
          )}

          {imageLoaded && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
          )}

          {/* E-AURIX */}
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-white/80 bg-white/95 px-1.5 py-1 text-[8px] font-black tracking-wide text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            E-AURIX
          </div>

          {/* OPEN */}
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md border border-white/70 bg-white/95 px-1.5 py-1 text-[8px] font-extrabold text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            OPEN
          </div>

          {/* RATING */}
          {imageLoaded && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md border border-white/20 bg-emerald-600 px-1.5 py-1 text-[9px] font-extrabold text-white shadow-md">
              <Star size={9} fill="currentColor" strokeWidth={2.5} />
              {rating}
            </div>
          )}

          {/* LOGO */}
          <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white bg-white/95 shadow-md backdrop-blur">
            {shop.logo && !imageError ? (
              <img
                src={shop.logo}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <Store size={14} strokeWidth={2} className="text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-extrabold leading-4 text-slate-900">
              {shop.shop_name}
            </h2>

            <p className="mt-1 truncate text-[9px] font-medium text-slate-500">
              {shop.category || "General Store"}
            </p>
          </div>

          <span className="shrink-0 rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-1 text-[7px] font-black tracking-wide text-emerald-700">
            E-AURIX
          </span>
        </div>

        {/* TAGS */}
        <div className="mt-2 flex min-w-0 gap-1.5">
          <span className="shrink-0 rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-1 text-[8px] font-bold text-emerald-700">
            Materials
          </span>

          <span className="flex min-w-0 items-center gap-1 truncate rounded-md border border-slate-100 bg-slate-50 px-1.5 py-1 text-[8px] font-semibold text-slate-500">
            <MapPin size={8} />
            Nearby
          </span>
        </div>

        {/* FOOTER */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate text-[8px] font-semibold text-slate-400">
              Local shop
            </span>
          </div>

          <span className="flex h-7 shrink-0 items-center gap-0.5 rounded-lg border border-emerald-500 bg-emerald-600 px-2 text-[9px] font-extrabold text-white shadow-sm transition-colors group-hover:bg-emerald-700">
            View
            <ChevronRight size={11} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AllShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  /* =====================================================
     LOAD SHOPS
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadShops() {
      try {
        setLoading(true);

        const data = await getShops();

        if (mounted) {
          setShops(data || []);
        }
      } catch (error) {
        console.error("Failed to load shops:", error);

        if (mounted) {
          setShops([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadShops();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     CATEGORIES
  ===================================================== */

  const categories = useMemo(() => {
    const unique = new Set<string>();

    shops.forEach((shop) => {
      const category = shop.category?.trim();

      if (category) {
        unique.add(category);
      }
    });

    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [shops]);

  /* =====================================================
     FILTERED SHOPS
  ===================================================== */

  const filteredShops = useMemo(() => {
    const query = search.trim().toLowerCase();

    return shops.filter((shop) => {
      const name = shop.shop_name?.toLowerCase() || "";

      const category = shop.category?.toLowerCase() || "";

      const matchesSearch =
        !query || name.includes(query) || category.includes(query);

      const matchesCategory =
        activeCategory === "All" || shop.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [shops, search, activeCategory]);

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f7]">
        <header className="sticky top-0 z-50 border-b border-slate-100 bg-white">
          <div className="pt-[max(env(safe-area-inset-top),16px)]">
            {/* TOP */}

            <div className="flex h-11 items-center gap-2.5 px-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />

              <div className="flex-1">
                <div className="h-3.5 w-28 animate-pulse rounded bg-slate-100" />

                <div className="mt-1.5 h-2.5 w-20 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />
            </div>

            {/* SEARCH */}

            <div className="px-3 pb-2.5">
              <div className="h-10.5 animate-pulse rounded-xl bg-slate-100" />
            </div>

            {/* CATEGORIES */}

            <div className="flex gap-2 overflow-hidden px-3 pb-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="
                      h-8
                      w-20
                      shrink-0
                      animate-pulse
                      rounded-full
                      bg-slate-100
                    "
                />
              ))}
            </div>
          </div>
        </header>

        <section className="px-3 pb-8 pt-3">
          <div className="mb-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-1.5 h-2.5 w-40 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ShopSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      {/* =================================================
          STICKY HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="pt-[max(env(safe-area-inset-top),10px)]">
          {/* =================================================
              TOP BAR
          ================================================= */}

          <div className="flex h-11 items-center gap-2.5 px-3">
            <Link
              href="/eaurix"
              aria-label="Back"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-slate-50
                text-slate-700
                transition
                active:scale-90
              "
            >
              <ArrowLeft size={17} strokeWidth={2.4} />
            </Link>

            <div className="min-w-0 flex-1">
              <h1
                className="
                  truncate
                  text-[15px]
                  font-extrabold
                  leading-4
                  text-slate-900
                "
              >
                All Shops
              </h1>

              <div
                className="
                  mt-0.5
                  flex
                  items-center
                  gap-1
                  text-[9px]
                  font-medium
                  text-slate-500
                "
              >
                <MapPin size={9} />
                Shops near you
              </div>
            </div>

            <button
              type="button"
              aria-label="Filters"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-slate-50
                text-slate-600
                transition
                active:scale-90
              "
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="px-3 pb-2.5">
            <div className="relative">
              <Search
                size={16}
                strokeWidth={2}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops, materials..."
                className="
                  h-10.5
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-[#f7f7f7]
                  pl-9
                  pr-9
                  text-[12px]
                  font-medium
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-emerald-400
                  focus:bg-white
                  focus:ring-2
                  focus:ring-emerald-50
                "
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    right-2.5
                    top-1/2
                    flex
                    h-6
                    w-6
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-200
                    text-slate-500
                    active:scale-90
                  "
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              CATEGORY CHIPS
          ================================================= */}

          <div className="scrollbar-none flex gap-2 overflow-x-auto px-3 pb-2.5">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`
                    shrink-0
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    transition-all
                    active:scale-95
                    ${
                      active
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600"
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="px-3 pb-8 pt-3">
        {/* SECTION HEADER */}

        <div className="mb-3 flex items-end justify-between">
          <div className="min-w-0">
            <h2
              className="
                text-[15px]
                font-extrabold
                leading-5
                text-slate-900
              "
            >
              Shops near you
            </h2>

            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
              {filteredShops.length}{" "}
              {filteredShops.length === 1 ? "shop" : "shops"} available
            </p>
          </div>

          {(search || activeCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="
                shrink-0
                text-[10px]
                font-bold
                text-emerald-600
              "
            >
              Clear all
            </button>
          )}
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {!filteredShops.length ? (
          <div
            className="
              rounded-2xl
              border
              border-slate-100
              bg-white
              px-5
              py-12
              text-center
              shadow-[0_1px_5px_rgba(15,23,42,0.03)]
            "
          >
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-slate-50
              "
            >
              <Store size={23} strokeWidth={1.8} className="text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-800">
              {search ? "No shops found" : "No shops available"}
            </h3>

            <p className="mx-auto mt-1 max-w-[250px] text-[11px] leading-4 text-slate-500">
              {search
                ? "Try another shop name or category."
                : "There are no shops available right now."}
            </p>

            {(search || activeCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="
                  mt-4
                  rounded-xl
                  bg-emerald-600
                  px-4
                  py-2
                  text-[11px]
                  font-bold
                  text-white
                  shadow-sm
                  active:scale-95
                "
              >
                View all shops
              </button>
            )}
          </div>
        ) : (
          /* =================================================
             SHOP GRID
          ================================================= */

          <div className="grid grid-cols-2 gap-2.5">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
