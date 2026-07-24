"use client";

import { Product } from "@/app/data/products";
import ProductCard from "./ProductCard";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useAdmin } from "@/app/components/context/AdminContext";
import { useMemo } from "react";
export default function FeaturedProducts({
  products,
}: {
  products: Product[];
}) {
  const [userName, setUserName] = useState("Guest");
  const { shops } = useAdmin();

  const shopsMap = useMemo(() => {
    return Object.fromEntries(shops.map((shop) => [shop.id, shop]));
  }, [shops]);
  const autoplay = useRef(
    Autoplay({
      delay: 5000, // 30 sec
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
    },
    [autoplay.current],
  );

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

  if (!products.length) return null;

  return (
    <div className="px-4">
      <div className="mb-5 pt-5">
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          Welcome to E-aurix,{" "}
          <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            {userName}
          </span>
        </h2>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => (
            <div key={product.id} className="flex-[0_0_96%]  px-4 first:pl-0">
              <ProductCard product={product} shop={shopsMap[product.shop_id]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
