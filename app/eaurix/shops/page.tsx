"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Store,
  MapPin,
  ChevronRight,
  X,
  BadgeCheck,
  Truck,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getShops, type Shop } from "@/app/data/shops";

function getImageUrl(url?: string) {
  if (!url || !url.trim()) return "";
  return url.trim();
}

/* =========================================================
   SKELETON
========================================================= */

function ShopsSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="pt-[max(env(safe-area-inset-top),18px)]">
          <div className="flex h-14 items-center gap-3 px-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="px-3 pb-2.5">
            <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
          </div>

          <div className="flex gap-2 overflow-hidden px-3 pb-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-16 shrink-0 animate-pulse rounded-full bg-slate-100"
              />
            ))}
          </div>
        </div>
      </header>

      <section className="px-3 pb-8 pt-4">
        <div className="mb-3.5">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-1.5 h-2.5 w-40 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-full overflow-hidden rounded-[22px] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.10)]"
            >
              <div className="h-40 animate-pulse bg-slate-100" />

              <div className="px-4 pb-4 pt-3.5">
                <div className="h-5 w-3/5 animate-pulse rounded bg-slate-100" />

                <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />

                <div className="mt-2.5 h-3 w-1/2 animate-pulse rounded bg-slate-100" />

                <div className="mt-3 h-3 w-2/5 animate-pulse rounded bg-slate-100" />

                <div className="mt-4 flex gap-3">
                  <div className="h-11 flex-1 animate-pulse rounded-[13px] bg-slate-100" />
                  <div className="h-11 flex-1 animate-pulse rounded-[13px] bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AllShopsPage() {
  const router = useRouter();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loadedImages, setLoadedImages] = useState<
    Record<string, boolean>
  >({});

  /* =======================================================
     LOAD SHOPS
  ======================================================= */

  useEffect(() => {
    async function loadShops() {
      try {
        const data = await getShops();

        const onlineShops = data.filter(
          (shop) => shop.status === "online",
        );

        setShops(onlineShops);
      } catch (error) {
        console.error("Failed to load shops:", error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    }

    loadShops();
  }, []);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const unique = new Set<string>();

    shops.forEach((shop) => {
      if (shop.category?.trim()) {
        unique.add(shop.category.trim());
      }
    });

    return ["All", ...Array.from(unique)];
  }, [shops]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredShops = useMemo(() => {
    const query = search.trim().toLowerCase();

    return shops.filter((shop) => {
      const matchesSearch =
        !query ||
        shop.shop_name?.toLowerCase().includes(query) ||
        shop.category?.toLowerCase().includes(query) ||
        shop.city?.toLowerCase().includes(query) ||
        shop.address?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        shop.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [shops, search, selectedCategory]);

  if (loading) {
    return <ShopsSkeleton />;
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="pt-[max(env(safe-area-inset-top),18px)]">
          {/* TOP BAR */}

          <div className="flex h-14 items-center gap-3 px-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-700 transition active:scale-95"
            >
              <ArrowLeft size={18} strokeWidth={2.3} />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] font-extrabold text-slate-900">
                All Shops
              </h1>

              <p className="text-[9px] font-medium text-slate-500">
                Local shops near you
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-[8px] font-extrabold text-emerald-600">
                LIVE
              </span>
            </div>
          </div>

          {/* SEARCH */}

          <div className="px-3 pb-2.5">
            <div className="relative">
              <Search
                size={17}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-[#f7f7f7] pl-9 pr-10 text-[12px] font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition active:scale-95"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY SCROLL */}

          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-3 pb-3 scrollbar-hide">
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold transition active:scale-95 ${
                      active
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="px-3 pb-8 pt-4">
        {/* SECTION HEADER */}

        <div className="mb-3.5 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-extrabold leading-5 text-slate-900">
              Shops Near You
            </h2>

            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
              {filteredShops.length} shops available
            </p>
          </div>

          {(search || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="text-[10px] font-bold text-emerald-600"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {!filteredShops.length ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              <Store
                size={25}
                strokeWidth={1.7}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-800">
              No shops found
            </h3>

            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              Try searching for another shop or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-[11px] font-bold text-white transition active:scale-95"
            >
              View all shops
            </button>
          </div>
        ) : (
          /* =================================================
             SHOP GRID - 1 COLUMN
          ================================================= */

          <div className="grid grid-cols-1 gap-3">
            {filteredShops.map((shop) => {
              const image = getImageUrl(shop.logo);
              const category =
                shop.category || "General Store";
              const localArea =
                shop.city || shop.address || "Nearby";

              return (
                <div
                  key={shop.id}
                  className="w-full overflow-hidden rounded-[22px] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.10)]"
                >
                  {/* =====================================================
                      SHOP IMAGE
                  ===================================================== */}

                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    {image ? (
                      <>
                        {!loadedImages[shop.id] && (
                          <div className="absolute inset-0 animate-pulse bg-slate-200" />
                        )}

                        <img
                          src={image}
                          alt={shop.shop_name}
                          className={`h-full w-full object-cover transition-opacity duration-300 ${
                            loadedImages[shop.id]
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onLoad={() => {
                            setLoadedImages((prev) => ({
                              ...prev,
                              [shop.id]: true,
                            }));
                          }}
                          onError={(e) => {
                            setLoadedImages((prev) => ({
                              ...prev,
                              [shop.id]: true,
                            }));

                            e.currentTarget.src =
                              "/placeholder-shop.png";
                          }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <Store
                            size={30}
                            className="text-emerald-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* IMAGE OVERLAY */}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

                    {/* E-AURIX */}

                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />

                      <span className="text-[7px] font-black tracking-[0.5px] text-white">
                        E-AURIX
                      </span>
                    </div>

                    {/* VERIFIED */}

                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/70 bg-white/95 px-2 py-1 shadow-sm backdrop-blur-sm">
                      <BadgeCheck
                        size={10}
                        strokeWidth={2.5}
                        className="text-emerald-600"
                      />

                      <span className="text-[7px] font-extrabold text-slate-700">
                        VERIFIED
                      </span>
                    </div>

                    {/* =====================================================
                        BOTTOM WHITE CURVE
                    ===================================================== */}

                    <div className="absolute bottom-0 left-0 z-10 h-10 w-[45%]">
                      <svg
                        viewBox="0 0 500 64"
                        preserveAspectRatio="none"
                        className="absolute inset-0 h-full w-full"
                      >
                        <path
                          d="M 0 0 H 260 C 305 0 325 10 350 30 C 375 50 400 64 445 64 H 500 V 64 H 0 Z"
                          fill="white"
                        />
                      </svg>

                      <div className="relative z-10 px-3 pt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[15px] font-black leading-none text-slate-700">
                            {shop.total_products ?? 0}+
                          </span>

                          <span className="text-[10px] font-semibold leading-none text-slate-500">
                            products
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DELIVERY */}

                    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-lg bg-sky-600 px-2 py-1 shadow-sm">
                      <Truck
                        size={9}
                        strokeWidth={2.5}
                        className="text-white"
                      />

                      <span className="text-[7px] font-extrabold text-white">
                        DELIVERY
                      </span>
                    </div>
                  </div>

                  {/* =====================================================
                      SHOP DETAILS
                  ===================================================== */}

                  <div className="px-4 pb-4 pt-3.5">
                    {/* SHOP NAME */}

                    <div className="flex min-w-0 items-center gap-1">
                      <h3 className="min-w-0 truncate text-[19px] font-black leading-[22px] tracking-[-0.4px] text-slate-950">
                        {shop.shop_name}
                      </h3>

                      <BadgeCheck
                        size={16}
                        strokeWidth={2.5}
                        className="shrink-0 text-emerald-500"
                      />
                    </div>

                    {/* CATEGORY */}

                    <div className="mt-1.5">
                      <span className="text-[12px] font-medium text-slate-500">
                        {category}
                      </span>
                    </div>

                    {/* LOCAL AREA */}

                    <div className="mt-2 flex items-center gap-1.5">
                      <MapPin
                        size={14}
                        strokeWidth={2.2}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="truncate text-[13px] font-medium text-slate-500">
                        {localArea}
                      </span>
                    </div>

                    {/* STATUS */}

                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>

                      <span className="text-[13px] font-semibold text-emerald-600">
                        Open
                      </span>

                      <span className="text-[13px] font-medium text-slate-400">
                        • Ready for orders
                      </span>
                    </div>

                    {/* =====================================================
                        ACTION BUTTONS
                    ===================================================== */}

                    <div className="mt-4 flex gap-3">
                      {/* CALL NOW */}

                      <a
                        href={`tel:${shop.phone}`}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[13px] border-2 border-emerald-600 bg-white px-3 text-[15px] font-extrabold text-emerald-600 shadow-sm transition active:scale-[0.98]"
                      >
                        <Phone
                          size={18}
                          strokeWidth={2.3}
                        />

                        Call us now
                      </a>

                      {/* VIEW SHOP */}

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/eaurix/shop/${shop.id}`,
                          )
                        }
                        className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[13px] bg-emerald-600 px-3 text-[15px] font-extrabold text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition active:scale-[0.98]"
                      >
                        View shop

                        <ChevronRight
                          size={17}
                          strokeWidth={2.8}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}