"use client";

import { useEffect, useRef, useState } from "react";
import {
  Store,
  ChevronRight,
  MapPin,
  Truck,
  BadgeCheck,
  Phone,
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

      <div className="mx-auto w-full overflow-hidden rounded-[18px] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
        <div className="h-40 animate-pulse bg-slate-200" />

        <div className="p-4">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-3 w-40 animate-pulse rounded bg-slate-100" />

          <div className="mt-4 flex gap-3">
            <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100" />
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
  if (!url || !url.trim()) return "";
  return url.trim();
}

/* =========================================================
   GET LOCAL AREA
========================================================= */

function getLocalArea(address?: string) {
  if (!address?.trim()) return "Nearby";

  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return parts[parts.length - 3];
  }

  if (parts.length === 2) {
    return parts[0];
  }

  return parts[0];
}

/* =========================================================
   SHOP CARD
========================================================= */

function ShopCard({
  shop,
  onShopNow,
  loadedImages,
  setLoadedImages,
}: {
  shop: Shop;
  onShopNow: () => void;
  loadedImages: Record<string, boolean>;
  setLoadedImages: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}) {
  const image = getImageUrl(shop.logo);
  const category = shop.category?.trim() || "Building Materials";
  const localArea = getLocalArea(shop.address);

  return (
    <div className="w-full overflow-hidden rounded-[22px] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.10)]">
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
                loadedImages[shop.id] ? "opacity-100" : "opacity-0"
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
                e.currentTarget.src = "/placeholder-shop.png";
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Store size={30} className="text-emerald-400" />
            </div>
          </div>
        )}

        {/* IMAGE OVERLAY */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />

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

        {/* BOTTOM WHITE CUT - SCREENSHOT STYLE CURVE */}
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
          <Truck size={9} strokeWidth={2.5} className="text-white" />
          <span className="text-[7px] font-extrabold text-white">DELIVERY</span>
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

        {/* ACTION BUTTONS */}
        <div className="mt-4 flex gap-3">
          {/* CALL NOW */}
          <a
            href={`tel:${shop.phone}`}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[13px] border-2 border-emerald-600 bg-white px-3 text-[15px] font-extrabold text-emerald-600 shadow-sm transition active:scale-[0.98]"
          >
            <Phone size={18} strokeWidth={2.3} />
            Call us now
          </a>

          {/* VIEW SHOP */}
          <button
            type="button"
            onClick={onShopNow}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[13px] bg-emerald-600 px-3 text-[15px] font-extrabold text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition active:scale-[0.98]"
          >
            View shop
            <ChevronRight size={17} strokeWidth={2.8} />
          </button>
        </div>
      </div>
    </div>
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
    if (loading || shops.length <= 1) return;

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
     LOOP SLIDE
  ======================================================= */

  const sliderShops = [...shops, shops[0]];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="bg-sky-100 px-4 py-2.5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-2 flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[14px] font-extrabold leading-4 tracking-[-0.2px] text-slate-900">
              Shops Near You
            </h2>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[7px] font-extrabold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              LIVE
            </span>
          </div>

          <p className="mt-0.5 text-[9px] font-medium leading-3 text-slate-500">
            Buy materials from local shops
          </p>
        </div>

        {/* VIEW ALL */}

        <button
          type="button"
          onClick={() => router.push("/eaurix/shops")}
          className="flex shrink-0 items-center gap-0.5 rounded-md px-1 py-1 text-[9px] font-extrabold text-emerald-600 active:opacity-60"
        >
          View all
          <ChevronRight size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* =====================================================
          SHOP SLIDER
      ===================================================== */}

      <div className="overflow-hidden">
        <div
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex w-full touch-pan-y will-change-transform"
        >
          {sliderShops.map((shop, index) => (
            <div
              key={`${shop.id}-${index}`}
              className="flex w-full min-w-full shrink-0 justify-center px-1"
            >
              <div className="w-full">
                <ShopCard
                  shop={shop}
                  loadedImages={loadedImages}
                  setLoadedImages={setLoadedImages}
                  onShopNow={() => router.push(`/eaurix/shop/${shop.id}`)}
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
        <div className="mt-2 flex justify-center gap-1">
          {shops.map((shop, index) => (
            <span
              key={shop.id}
              className={`h-1 rounded-full transition-all duration-300 ${
                currentIndex % shops.length === index
                  ? "w-3 bg-emerald-600"
                  : "w-1 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
