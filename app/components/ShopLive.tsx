"use client";

import { useEffect, useState } from "react";
import { getShops, type Shop } from "@/app/data/shops";

export default function ShopLive() {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    async function loadShops() {
      const data = await getShops();

      const onlineShops = data.filter((shop) => shop.status === "online");

      setShops([...onlineShops, ...onlineShops]);
    }

    loadShops();
  }, []);

  if (!shops.length) return null;

  return (
    <section className="bg-[#1E293B] py-2 overflow-hidden border-y border-sky-500/20">
      <div className="flex items-center mb-2 px-3">
        <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-semibold animate-pulse">
          🔴 LIVE
        </span>

        <p className="ml-2 text-slate-300 text-xs">Active Shops</p>
      </div>

      <div className="marquee flex items-center">
        {shops.map((shop, i) => (
          <div
            key={`${shop.id}-${i}`}
            className="mx-2 min-w-[320px] h-22 bg-white/95 backdrop-blur rounded-[18px] px-4 flex items-center gap-4 shadow-lg"
          >
            <img
              src={shop.logo || "/placeholder-shop.png"}
              alt={shop.shop_name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-slate-800 truncate">
                {shop.shop_name}
              </h3>

              <p className="text-slate-500 truncate">
                {shop.category || "General Store"}
              </p>
            </div>

            <div className="flex flex-col items-center shrink-0">
              <span className="text-green-600 font-semibold">Online</span>

              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
