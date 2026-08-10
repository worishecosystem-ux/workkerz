"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Product } from "@/app/data/products";
import ProductCard from "./ProductCard";

import { supabase } from "@/lib/supabase";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { useAdmin } from "@/app/components/context/AdminContext";

interface FeaturedProductsProps {
  products: Product[];
  loading?: boolean;
}

/* =====================================================
   SKELETON CARD
===================================================== */

function FeaturedProductSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-100
        bg-white
      "
    >
      {/* Image */}
      <div
        className="
          h-[220px]
          w-full
          animate-pulse
          bg-slate-200
          sm:h-[260px]
        "
      />

      {/* Content */}
      <div className="space-y-3 p-4">
        {/* Shop */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-full bg-slate-200" />

          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        </div>

        {/* Product name */}
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

        {/* Description */}
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />

        {/* Bottom */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />

          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SKELETON
===================================================== */

function FeaturedProductsSkeleton() {
  return (
    <section className="w-full">
      {/* Welcome */}
      <div className="mb-2 px-1">
        <div className="h-5 w-64 animate-pulse rounded bg-slate-200" />
      </div>

      {/* Carousel */}
      <div className="overflow-hidden pt-1">
        <div className="flex">
          {Array.from({ length: 1 }).map((_, index) => (
            <div
              key={index}
              className="
                min-w-0
                flex-[0_0_98%]
                pr-2
              "
            >
              <FeaturedProductSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div
        className="
          mt-2
          mb-2
          flex
          items-center
          justify-center
          gap-1.5
        "
      >
        <div className="h-1.5 w-6 animate-pulse rounded-full bg-slate-300" />

        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-300" />

        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-300" />

        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-300" />
      </div>
    </section>
  );
}

/* =====================================================
   COMPONENT
===================================================== */

export default function FeaturedProducts({
  products,
  loading = false,
}: FeaturedProductsProps) {
  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return <FeaturedProductsSkeleton />;
  }

  /* =====================================================
     USER
  ===================================================== */

  const [userName, setUserName] = useState("Guest");

  /* =====================================================
     ADMIN / SHOPS
  ===================================================== */

  const { shops = [] } = useAdmin();

  /* =====================================================
     EMBLA
  ===================================================== */

  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoplay = useRef(
    Autoplay({
      delay: 8000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      containScroll: "trimSnaps",
      skipSnaps: false,
    },
    [autoplay.current],
  );

  /* =====================================================
     SHOP MAP
  ===================================================== */

  const shopsMap = useMemo(() => {
    return Object.fromEntries(
      shops.map((shop) => [
        shop.id,
        shop,
      ]),
    );
  }, [shops]);

  /* =====================================================
     FEATURED PRODUCTS

     Maximum 2 products per category.
  ===================================================== */

  const featuredProducts = useMemo(() => {
    const categoryMap = new Map<
      string,
      Product[]
    >();

    for (const product of products) {
      if (!product?.id) {
        continue;
      }

      if (!product.shop_id) {
        continue;
      }

      const shop =
        shopsMap[product.shop_id];

      if (!shop) {
        continue;
      }

      if (shop.status !== "online") {
        continue;
      }

      const list =
        categoryMap.get(
          product.category,
        ) ?? [];

      if (list.length < 2) {
        list.push(product);

        categoryMap.set(
          product.category,
          list,
        );
      }
    }

    return Array.from(
      categoryMap.values(),
    ).flat();
  }, [
    products,
    shopsMap,
  ]);

  /* =====================================================
     EMBLA SELECT
  ===================================================== */

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(
      emblaApi.selectedScrollSnap(),
    );
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect();

    emblaApi.on(
      "select",
      onSelect,
    );

    emblaApi.on(
      "reInit",
      onSelect,
    );

    return () => {
      emblaApi.off(
        "select",
        onSelect,
      );

      emblaApi.off(
        "reInit",
        onSelect,
      );
    };
  }, [
    emblaApi,
    onSelect,
  ]);

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!mounted || !user) {
          return;
        }

        const name =
          user.user_metadata
            ?.full_name ||
          user.user_metadata
            ?.name ||
          user.user_metadata
            ?.user_name ||
          user.identities?.[0]
            ?.identity_data
            ?.full_name ||
          user.identities?.[0]
            ?.identity_data
            ?.name ||
          user.email?.split(
            "@",
          )[0] ||
          "Guest";

        setUserName(name);
      } catch (error) {
        console.error(
          "Failed to load user:",
          error,
        );
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     RESET EMBLA WHEN PRODUCTS CHANGE
  ===================================================== */

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.reInit();
    setSelectedIndex(0);
  }, [
    emblaApi,
    featuredProducts.length,
  ]);

  /* =====================================================
     EMPTY
  ===================================================== */

  if (featuredProducts.length === 0) {
    return null;
  }

  /* =====================================================
     DOT COUNT
  ===================================================== */

  const dotCount = Math.min(
    featuredProducts.length,
    7,
  );

  const activeDot =
    selectedIndex % dotCount;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="w-full">
      {/* =================================================
          WELCOME
      ================================================= */}

      <div className="mb-2 px-1">
        <h2
          className="
            text-base
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          Welcome to E-Aurix,{" "}
          <span className="text-emerald-600">
            {userName}
          </span>
        </h2>
      </div>

      {/* =================================================
          CAROUSEL
      ================================================= */}

      <div
        ref={emblaRef}
        className="
          overflow-hidden
          pt-1
        "
      >
        <div className="flex">
          {featuredProducts.map(
            (product) => {
              const shop =
                shopsMap[
                  product.shop_id
                ];

              if (!shop) {
                return null;
              }

              return (
                <div
                  key={product.id}
                  className="
                    min-w-0
                    flex-[0_0_98%]
                    pr-2
                    first:pl-0
                  "
                >
                  <ProductCard
                    product={product}
                    shop={shop}
                  />
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* =================================================
          DOTS
      ================================================= */}

      {dotCount > 1 && (
        <div
          className="
            mt-2
            mb-2
            flex
            items-center
            justify-center
            gap-1.5
          "
        >
          {Array.from({
            length: dotCount,
          }).map((_, index) => {
            const active =
              index === activeDot;

            return (
              <div
                key={index}
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    active
                      ? "w-6 bg-emerald-600"
                      : "w-1.5 bg-slate-300"
                  }
                `}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}