"use client";

import { useEffect, useState } from "react";
import { Store, Wifi } from "lucide-react";
import { getShops, type Shop } from "@/app/data/shops";

function ShopSkeleton() {
  return (
    <section className="bg-slate-900 border-y border-emerald-500/20 py-3 overflow-hidden">
      <div className="flex items-center gap-2 px-3 mb-3">
        <div className="h-6 w-14 rounded-full bg-slate-700 animate-pulse" />
        <div className="h-4 w-24 rounded bg-slate-700 animate-pulse" />
      </div>

      <div className="flex gap-3 px-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-w-62.5 rounded-2xl border border-slate-700 bg-slate-800 p-3 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-slate-700" />

              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-slate-700 mb-2" />
                <div className="h-3 w-20 rounded bg-slate-700" />
              </div>

              <div className="h-9 w-9 rounded-full bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function getImageUrl(url?: string) {
  if (!url || url.trim() === "") {
    return "";
  }

  return url.trim();
}

export default function ShopLive() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  useEffect(() => {
    async function loadShops() {
      try {
        const data = await getShops();

        const onlineShops = data.filter((shop) => shop.status === "online");

        setShops([...onlineShops, ...onlineShops]);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }

    loadShops();
  }, []);

  if (loading) return <ShopSkeleton />;

  if (!shops.length) return null;

  return (
    <section className="overflow-hidden border-y border-emerald-500/20 bg-linear-to-br from-emerald-100 via-green-50 to-white py-2">
      <div className="flex items-center mb-2 px-3 ">
        <span className="bg-red-500 text-white text-[9px] md:text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse">
          🔴 LIVE
        </span>

        <p className="ml-2 md:ml-4 text-[9px] md:text-sm text-gray-900 font-bold">
          Shops Currently Online
        </p>
      </div>

      <div className="marquee flex items-center">
        {shops.map((shop, i) => (
          <div
            key={`${shop.id}-${i}`}
            className="mx-2 flex min-w-65 items-center gap-3 rounded-2xl  bg-linear-to-br from-white/90 via-slate-100 to-slate-200 border border-white/70 backdrop-blur-xl px-3 py-3 shadow-xl"
          >
            <div className="relative shrink-0">
              <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-white shadow border border-white/40 flex items-center justify-center">
                {/* Skeleton */}
                {!loadedImages[shop.id] && (
                  <div className="absolute inset-0 animate-pulse bg-slate-200" />
                )}

                {shop.logo ? (
                  <img
                    src={getImageUrl(shop.logo)}
                    alt={shop.shop_name}
                    className={`h-full w-full object-cover transition-opacity duration-300 ${loadedImages[shop.id] ? "opacity-100" : "opacity-0"
                      }`}
                    referrerPolicy="no-referrer"
                    onLoad={() =>
                      setLoadedImages((prev) => ({
                        ...prev,
                        [shop.id]: true,
                      }))
                    }
                    onError={(e) => {
                      setLoadedImages((prev) => ({
                        ...prev,
                        [shop.id]: true,
                      }));

                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder-shop.png";
                    }}
                  />
                ) : (
                  <Store className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-bold text-black">
                {shop.shop_name}
              </h3>

              <div className="mt-1 flex items-center gap-1">
                <Store size={12} className="text-emerald-400" />

                <span className="truncate text-[11px] text-slate-900">
                  {shop.category || "General Store"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="rounded-full bg-emerald-500/15 p-2">
                <Wifi size={16} className="text-emerald-400 animate-pulse" />
              </div>

              <span className="text-[10px] font-semibold text-emerald-400">
                LIVE
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
