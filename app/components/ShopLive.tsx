"use client";

import { useEffect, useRef, useState } from "react";
import {
  Store,
  ChevronRight,
  MapPin,
  Clock3,
  Truck,
  BadgeCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getShops, type Shop } from "@/app/data/shops";

/* =========================================================
   SHOP SKELETON
========================================================= */

function ShopSkeleton() {
  return (
    <section className="bg-sky-100 px-4 py-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-2 w-32 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-2.5 w-12 animate-pulse rounded bg-slate-100" />
      </div>

      <div className="mx-auto w-[88%] overflow-hidden rounded-[15px] border border-slate-100 bg-white">
        <div className="h-29.5 animate-pulse bg-slate-200" />

        <div className="p-2.5">
          <div className="h-3.5 w-28 animate-pulse rounded bg-slate-100" />
          <div className="mt-1.5 h-2.5 w-20 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-px bg-slate-100" />

          <div className="mt-2 flex gap-2">
            <div className="h-5 w-20 animate-pulse rounded-md bg-slate-100" />
            <div className="h-5 w-20 animate-pulse rounded-md bg-slate-100" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(url?: string) {
  if (!url || url.trim() === "") return "";

  return url.trim();
}

/* =========================================================
   SHOP CARD
========================================================= */

/* =========================================================
   E-AURIX SHOP CARD
========================================================= */

function ShopCard({
  shop,
  onClick,
  loadedImages,
  setLoadedImages,
}: {
  shop: Shop;
  onClick: () => void;
  loadedImages: Record<string, boolean>;
  setLoadedImages: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}) {
  const image = getImageUrl(shop.logo);

  const category = shop.category?.trim() || "Building Materials";

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        block
        w-full
        text-left
        transition-transform
        duration-150
        active:scale-[0.98]
      "
    >
      <div
        className="
          overflow-hidden
          rounded-[18px]
          border
          border-slate-200
          bg-white
          shadow-[0_4px_18px_rgba(15,23,42,0.08)]
        "
      >
        {/* =================================================
            SHOP IMAGE
        ================================================= */}

        <div className="relative h-33 w-full bg-slate-100">
          {/* IMAGE SKELETON */}

          {!loadedImages[shop.id] && image && (
            <div className="absolute inset-0 animate-pulse bg-slate-200" />
          )}

          {/* IMAGE */}

          {image ? (
            <div
              className="
      absolute
      inset-1
      overflow-hidden
      rounded-[14px]
      border-2
      border-white
      bg-white
      shadow-sm
    "
            >
              <img
                src={image}
                alt={shop.shop_name}
                className={`
        h-full
        w-full
        object-cover
        transition-opacity
        duration-300
        ${loadedImages[shop.id] ? "opacity-100" : "opacity-0"}
      `}
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

                  e.currentTarget.src = "/placeholder-shop.png";
                }}
              />
            </div>
          ) : (
            <div
              className="
      absolute
      inset-1
      flex
      items-center
      justify-center
      overflow-hidden
      rounded-[14px]
      border-2
      border-white
      bg-linear-to-br
      from-emerald-50
      to-slate-100
    "
            >
              <div
                className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-2xl
        bg-white
        shadow-sm
      "
              >
                <Store size={24} className="text-emerald-400" />
              </div>
            </div>
          )}
          {/* IMAGE GRADIENT */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-20
              bg-linear-to-t
              from-black/65
              via-black/20
              to-transparent
            "
          />

          {/* =================================================
              E-AURIX BRAND TAG
          ================================================= */}

          <div
            className="
              absolute
              left-2.5
              top-2.5
              flex
              items-center
              gap-1
              rounded-full
              bg-emerald-600
              px-2
              py-1
              shadow-md
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />

            <span
              className="
                text-[7px]
                font-black
                tracking-[0.5px]
                text-white
              "
            >
              E-AURIX
            </span>
          </div>

          {/* =================================================
              VERIFIED TAG
          ================================================= */}

          <div
            className="
              absolute
              right-2.5
              top-2.5
              flex
              items-center
              gap-1
              rounded-full
              border
              border-white/70
              bg-white/95
              px-1.5
              py-1
              shadow-sm
              backdrop-blur-sm
            "
          >
            <BadgeCheck
              size={9}
              strokeWidth={2.5}
              className="text-emerald-600"
            />

            <span className="text-[7px] font-extrabold text-slate-700">
              VERIFIED
            </span>
          </div>

          {/* =================================================
              CATEGORY TAG
          ================================================= */}

          <div
            className="
              absolute
              bottom-2.5
              left-2.5
              rounded-md
              bg-white/95
              px-2
              py-1
              shadow-sm
              backdrop-blur-sm
            "
          >
            <span
              className="
                block
                max-w-37.5
                truncate
                text-[7px]
                font-extrabold
                uppercase
                tracking-wide
                text-slate-700
              "
            >
              {category}
            </span>
          </div>

          {/* =================================================
              DELIVERY TAG
          ================================================= */}

          <div
            className="
              absolute
              bottom-2.5
              right-2.5
              flex
              items-center
              gap-1
              rounded-md
              bg-sky-600
              px-1.5
              py-1
              shadow-sm
            "
          >
            <Truck size={8} strokeWidth={2.5} className="text-white" />

            <span className="text-[7px] font-extrabold text-white">
              DELIVERY
            </span>
          </div>
        </div>

        {/* =================================================
            SHOP DETAILS
        ================================================= */}

        <div className="px-3 pb-3 pt-2.5">
          {/* SHOP NAME */}

          <div className="flex items-center gap-1">
            <h3
              className="
                min-w-0
                flex-1
                truncate
                text-[13px]
                font-black
                leading-4
                tracking-[-0.2px]
                text-slate-900
              "
            >
              {shop.shop_name}
            </h3>

            <BadgeCheck
              size={14}
              strokeWidth={2.4}
              className="shrink-0 text-emerald-500"
            />

            <ChevronRight
              size={14}
              strokeWidth={2.5}
              className="shrink-0 text-slate-300"
            />
          </div>

          {/* CATEGORY + LOCATION */}

          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="
                truncate
                text-[9px]
                font-semibold
                text-slate-500
              "
            >
              {category}
            </span>

            <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

            <span className="flex shrink-0 items-center gap-0.5 text-[8px] font-semibold text-slate-400">
              <MapPin size={8} />
              Nearby
            </span>
          </div>

          {/* =================================================
              E-AURIX TAGS
          ================================================= */}

          <div className="mt-2 flex gap-1.5 overflow-hidden">
            <span
              className="
                shrink-0
                rounded-md
                bg-emerald-50
                px-1.5
                py-1
                text-[7px]
                font-extrabold
                text-emerald-700
              "
            >
              MATERIALS
            </span>

            <span
              className="
                shrink-0
                rounded-md
                bg-sky-50
                px-1.5
                py-1
                text-[7px]
                font-extrabold
                text-sky-700
              "
            >
              LOCAL SHOP
            </span>

            <span
              className="
                shrink-0
                rounded-md
                bg-amber-50
                px-1.5
                py-1
                text-[7px]
                font-extrabold
                text-amber-700
              "
            >
              TRUSTED
            </span>
          </div>
          {/* =================================================
              FOOTER CTA
          ================================================= */}

          <div
            className="
              mt-2.5
              flex
              items-center
              justify-between
              border-t
              border-slate-100
              pt-2.5
            "
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>

              <span className="truncate text-[8px] font-bold text-slate-500">
                Ready for orders
              </span>
            </div>

            <span
              className="
                flex
                shrink-0
                items-center
                gap-0.5
                rounded-lg
                bg-emerald-600
                px-2.5
                py-1.5
                text-[7px]
                font-black
                tracking-wide
                text-white
                shadow-sm
              "
            >
              SHOP NOW
              <ChevronRight size={9} strokeWidth={3} />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   SHOP LIVE
========================================================= */

export default function ShopLive() {
  const router = useRouter();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const [currentIndex, setCurrentIndex] = useState(0);

  const sliderRef = useRef<HTMLDivElement>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDraggingRef = useRef(false);

  const startXRef = useRef(0);

  /* =======================================================
     LOAD SHOPS
  ======================================================= */

  useEffect(() => {
    async function loadShops() {
      try {
        const data = await getShops();

        const onlineShops = data.filter((shop) => shop.status === "online");

        setShops(onlineShops);
      } catch (error) {
        console.error("Failed to load shops:", error);
      } finally {
        setLoading(false);
      }
    }

    loadShops();
  }, []);

  /* =======================================================
     GO TO SLIDE
  ======================================================= */

  const goToSlide = (index: number, animate = true) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const width = slider.parentElement?.clientWidth || 1;

    slider.style.transition = animate
      ? "transform 600ms cubic-bezier(0.22,1,0.36,1)"
      : "none";

    slider.style.transform = `translate3d(-${index * width}px,0,0)`;
  };

  /* =======================================================
     AUTO SLIDE
  ======================================================= */

  useEffect(() => {
    if (loading || shops.length <= 1) {
      return;
    }

    const startAutoSlide = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (!isDraggingRef.current) {
          setCurrentIndex((prev) => prev + 1);
        }

        startAutoSlide();
      }, 3200);
    };

    startAutoSlide();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [loading, shops.length]);

  /* =======================================================
     SLIDE EFFECT
  ======================================================= */

  useEffect(() => {
    if (!shops.length) return;

    goToSlide(currentIndex, true);

    if (currentIndex === shops.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex(0);
        goToSlide(0, false);
      }, 630);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, shops.length]);

  /* =======================================================
     RESIZE
  ======================================================= */

  useEffect(() => {
    const handleResize = () => {
      goToSlide(currentIndex, false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentIndex]);

  /* =======================================================
     TOUCH START
  ======================================================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;

    startXRef.current = e.touches[0].clientX;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const slider = sliderRef.current;

    if (slider) {
      slider.style.transition = "none";
    }
  };

  /* =======================================================
     TOUCH MOVE
  ======================================================= */

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    const slider = sliderRef.current;

    if (!slider) return;

    const currentX = e.touches[0].clientX;

    const diff = startXRef.current - currentX;

    const width = slider.parentElement?.clientWidth || 1;

    const base = currentIndex * width;

    slider.style.transform = `translate3d(-${base + diff}px,0,0)`;
  };

  /* =======================================================
     TOUCH END
  ======================================================= */

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    const endX = e.changedTouches[0].clientX;

    const diff = startXRef.current - endX;

    const threshold = 45;

    if (diff > threshold) {
      setCurrentIndex((prev) => prev + 1);
    } else if (diff < -threshold) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } else {
      goToSlide(currentIndex, true);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <ShopSkeleton />;
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!shops.length) {
    return null;
  }

  /* =======================================================
     DUPLICATE FIRST
  ======================================================= */

  const sliderShops = [...shops, shops[0]];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="bg-sky-100 px-4 py-2.5">
      {/* HEADER */}

      <div className="mb-2 flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2
              className="
                text-[14px]
                font-extrabold
                leading-4
                tracking-[-0.2px]
                text-slate-900
              "
            >
              Shops Near You
            </h2>

            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-emerald-50
                px-1.5
                py-0.5
                text-[7px]
                font-extrabold
                text-emerald-600
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              LIVE
            </span>
          </div>

          <p className="mt-0.5 text-[9px] font-medium leading-3 text-slate-500">
            Buy materials from local shops
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/eaurix/shops")}
          className="
            flex
            shrink-0
            items-center
            gap-0.5
            rounded-md
            px-1
            py-1
            text-[9px]
            font-extrabold
            text-emerald-600
            active:opacity-60
          "
        >
          View all
          <ChevronRight size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* =====================================================
          COMPACT ONE-SHOP SLIDER
      ===================================================== */}

      <div className="overflow-hidden">
        <div
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="
            flex
            w-full
            will-change-transform
            touch-pan-y
          "
        >
          {sliderShops.map((shop, index) => (
            <div
              key={`${shop.id}-${index}`}
              className="
                  flex
                  w-full
                  min-w-full
                  shrink-0
                  justify-center
                  px-1
                "
            >
              {/* 88% WIDTH CARD */}

              <div className="w-[100%]">
                <ShopCard
                  shop={shop}
                  loadedImages={loadedImages}
                  setLoadedImages={setLoadedImages}
                  onClick={() => router.push(`/eaurix/shop/${shop.id}`)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          DOTS
      ===================================================== */}

      {shops.length > 1 && (
        <div className="mt-1.5 flex justify-center gap-1">
          {shops.map((shop, index) => (
            <span
              key={shop.id}
              className={`
                  h-1
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    currentIndex % shops.length === index
                      ? "w-3 bg-emerald-500"
                      : "w-1 bg-slate-300"
                  }
                `}
            />
          ))}
        </div>
      )}
    </section>
  );
}
