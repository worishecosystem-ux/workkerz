"use client";

import { Product } from "@/app/data/products";
import ProductCard from "./ProductCard";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useAdmin } from "@/app/components/context/AdminContext";

export default function FeaturedProducts({
  products,
}: {
  products: Product[];
}) {
  const [userName, setUserName] = useState("Guest");
  const { shops } = useAdmin();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplay = useRef(
    Autoplay({
      delay: 8000, // 30 sec
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
  const shopsMap = useMemo(() => {
    return Object.fromEntries(shops.map((shop) => [shop.id, shop]));
  }, [shops]);
  const featuredProducts = useMemo(() => {
    const categoryMap = new Map<string, Product[]>();

    for (const product of products) {
      const list = categoryMap.get(product.category) ?? [];

      if (list.length < 2) {
        list.push(product);
        categoryMap.set(product.category, list);
      }
    }

    return Array.from(categoryMap.values()).flat();
  }, [products]);
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.user_name ||
        user.identities?.[0]?.identity_data?.full_name ||
        user.identities?.[0]?.identity_data?.name ||
        user.email?.split("@")[0] ||
        "Guest";

      setUserName(name);
    }

    loadUser();
  }, []);

  if (!featuredProducts.length) return null;

  return (
    <div className="px-4">
      <div className=" pt-2">
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          Welcome to E-aurix,{" "}
          <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            {userName}
          </span>
        </h2>
      </div>

      <div className="overflow-hidden pt-1" ref={emblaRef}>
        <div className="flex">
         {featuredProducts.map((product) => (
            <div key={product.id} className="flex-[0_0_98%]  px-2 first:pl-0">
              <ProductCard product={product} shop={shopsMap[product.shop_id]} />
            </div>
          ))}
        </div>
      </div>
      <div className=" flex items-center justify-center gap-2 mb-2 mt-2">
        {Array.from({ length: 10 }).map((_, i) => {
          const active = i === selectedIndex % 7;

          return (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                active ? "w-8 bg-emerald-600" : "w-2 bg-slate-300"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
