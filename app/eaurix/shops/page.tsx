"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Store,
  MapPin,
  ChevronRight,
  X,
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

          <div className="px-3 pb-3">
            <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </header>

      <section className="px-3 pb-8 pt-4">
        <div className="mb-4">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-1.5 h-2.5 w-40 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
            >
              <div className="aspect-[1.25/1] animate-pulse bg-slate-100" />

              <div className="p-2.5">
                <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-100" />

                <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />

                <div className="mt-3 flex justify-between">
                  <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-7 w-12 animate-pulse rounded-lg bg-slate-100" />
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
          (shop) => shop.status === "online"
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
        shop.category?.toLowerCase().includes(query);

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
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-slate-50
                text-slate-700
                active:scale-95
              "
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

            <div
              className="
                flex
                items-center
                gap-1
                rounded-full
                bg-emerald-50
                px-2
                py-1
              "
            >
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
                placeholder="Search shops..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-[#f7f7f7]
                  pl-9
                  pr-10
                  text-[12px]
                  font-medium
                  text-slate-800
                  outline-none
                  placeholder:text-slate-400
                  focus:border-emerald-400
                  focus:bg-white
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    h-7
                    w-7
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-200
                    text-slate-500
                  "
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY SCROLL */}

          {categories.length > 1 && (
            <div
              className="
                flex
                gap-2
                overflow-x-auto
                px-3
                pb-3
                scrollbar-hide
              "
            >
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      shrink-0
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      transition
                      ${
                        active
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-200 bg-white text-slate-600"
                      }
                    `}
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
              className="
                text-[10px]
                font-bold
                text-emerald-600
              "
            >
              Clear filters
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
              py-14
              text-center
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
              className="
                mt-4
                rounded-xl
                bg-emerald-600
                px-4
                py-2
                text-[11px]
                font-bold
                text-white
                active:scale-95
              "
            >
              View all shops
            </button>
          </div>
        ) : (
          /* =================================================
             SHOP GRID
          ================================================= */

          <div className="grid grid-cols-2 gap-2.5">
            {filteredShops.map((shop) => {
              const image = getImageUrl(shop.logo);

              return (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() =>
                    router.push(`/eaurix/shop/${shop.id}`)
                  }
                  className="
                    group
                    min-w-0
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-100
                    bg-white
                    text-left
                    shadow-[0_1px_4px_rgba(15,23,42,0.04)]
                    active:scale-[0.985]
                  "
                >
                  {/* =================================================
                      IMAGE
                  ================================================= */}

                  <div
                    className="
                      relative
                      aspect-1.25/1
                      overflow-hidden
                      bg-[#f7f7f7]
                    "
                  >
                    {!loadedImages[shop.id] && image && (
                      <div className="absolute inset-0 animate-pulse bg-slate-100" />
                    )}

                    {image ? (
                      <img
                        src={image}
                        alt={shop.shop_name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className={`
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-300
                          ${
                            loadedImages[shop.id]
                              ? "opacity-100"
                              : "opacity-0"
                          }
                        `}
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
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <Store
                            size={23}
                            strokeWidth={1.7}
                            className="text-slate-300"
                          />
                        </div>
                      </div>
                    )}

                    {/* OPEN */}

                    <div
                      className="
                        absolute
                        left-2
                        top-2
                        flex
                        items-center
                        gap-1
                        rounded-full
                        bg-white/95
                        px-2
                        py-1
                        shadow-sm
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <span className="text-[8px] font-extrabold text-emerald-600">
                        OPEN
                      </span>
                    </div>

                    {/* LOGO */}

                    <div
                      className="
                        absolute
                        bottom-2
                        left-2
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        border
                        border-white
                        bg-white
                        shadow-md
                      "
                    >
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Store
                          size={16}
                          className="text-slate-400"
                        />
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      DETAILS
                  ================================================= */}

                  <div className="p-2.5">
                    <div className="flex items-center gap-1.5">
                      <h3
                        className="
                          min-w-0
                          flex-1
                          truncate
                          text-[12px]
                          font-extrabold
                          leading-4
                          text-slate-900
                        "
                      >
                        {shop.shop_name}
                      </h3>

                      <ChevronRight
                        size={14}
                        strokeWidth={2.3}
                        className="shrink-0 text-slate-300"
                      />
                    </div>

                    <p
                      className="
                        mt-1
                        truncate
                        text-[9px]
                        font-medium
                        leading-3
                        text-slate-500
                      "
                    >
                      {shop.category || "General Store"}
                    </p>

                    <div
                      className="
                        mt-2.5
                        flex
                        items-center
                        justify-between
                        border-t
                        border-slate-100
                        pt-2
                      "
                    >
                      <div className="flex min-w-0 items-center gap-1">
                        <MapPin
                          size={10}
                          strokeWidth={2}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="truncate text-[9px] font-medium text-slate-500">
                          Nearby
                        </span>
                      </div>

                      <span
                        className="
                          shrink-0
                          rounded-lg
                          bg-emerald-50
                          px-2
                          py-1.5
                          text-[8px]
                          font-extrabold
                          text-emerald-700
                        "
                      >
                        SHOP NOW
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}