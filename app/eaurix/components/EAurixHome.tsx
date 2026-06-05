"use client";

import Link from "next/link";

import {
  ShoppingCart,
  Shield,
  Tag,
  Star,
  Zap,
  ArrowRight,
  Hammer,
  PaintBucket,
  Wrench,
  Building2,
  Truck,
  Package,
  ChevronRight,
} from "lucide-react";

import {
  getProducts,
  type Product,
  productCategories,
} from "@/app/data/products";

import { usePlatform } from "@/app/components/context/PlatformContext";

import { useAdmin } from "@/app/components/context/AdminContext";

import ShopLive from "@/app/components/ShopLive";

import { useRouter } from "next/navigation";

import { useMemo, useState, useEffect } from "react";

/* ===================================================== */

function ProductCard({ product }: { product: Product }) {
  const { shops } = useAdmin();

  const shop = shops.find((s) => s.id === product.shop_id);

  const isOffline = shop?.status !== "online";

  const isOutOfStock = product.is_active === false;

  return (
    <Link
      href={isOffline || isOutOfStock ? "#" : `/eaurix/product/${product.id}`}
      className="block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="relative p-2">
        <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-100">
          <img
            src={product.image || "/placeholder.png"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {(isOffline || isOutOfStock) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-semibold">
              {isOffline ? "Offline" : "Out of Stock"}
            </span>
          </div>
        )}
      </div>

      <div className="px-3 pb-1">
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 h-6">
          {product.name}
        </h3>

        <button className="w-full h-9 rounded-lg bg-[#0F172A] text-white text-sm font-medium">
          View Store
        </button>
      </div>
    </Link>
  );
}

/* ===================================================== */

export function EAurixHome() {
  const { shops = [] } = useAdmin();

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [mobileOpen, setMobileOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const router = useRouter();

  /* =====================================================
     ONLINE SHOP IDS
  ===================================================== */

  const onlineShopIds = useMemo(() => {
    return shops
      .filter((shop) => shop.status === "online")
      .map((shop) => shop.id);
  }, [shops]);

  /* =====================================================
     VISIBLE PRODUCTS
  ===================================================== */

  const visibleProducts = useMemo(() => {
    return products.filter(
      (product) => !!product.shop_id && onlineShopIds.includes(product.shop_id),
    );
  }, [products, onlineShopIds]);

  /* =====================================================
     FEATURED PRODUCTS
  ===================================================== */

  const featured = visibleProducts.filter(
    (p) => p.badge === "popular" || p.badge === "pro",
  );

  /* ===================================================== */

  const spotlightProducts = useMemo(() => {
    const categoryMap = new Map();

    visibleProducts.forEach((product) => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, product);
      }
    });

    let result = Array.from(categoryMap.values());

    // Minimum 4 products
    if (result.length > 0) {
      while (result.length < 4) {
        result = [...result, ...result];
      }
    }

    return result.slice(0, 4);
  }, [visibleProducts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* ===================================================== */

  return (
    <div className="min-h-screen bg-[#F0F9FF]">
      {/* HERO */}

      <div className="bg-linear-to-br from-[#0C1A2E] via-[#0F2744] to-[#0C3B5E] pt-24 pb-16 relative overflow-hidden">
        <div className="mt-2 mb-5">
          <ShopLive />
        </div>

        {/* GRID */}

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute top-10 left-1/4 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* BADGE */}

          <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />

            <span className="text-sky-200 text-xs font-semibold">
              E-aurix under processing, coming soon!
            </span>

            <span className="text-sky-200 text-xs font-semibold">
              Workkerz-integrated marketplace
            </span>
          </div>

          {/* TITLE */}

          <h1
            className="text-white mb-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",

              fontWeight: 900,

              lineHeight: 1.1,
            }}
          >
            Everything your workers need,
            <span className="text-[#38BDF8]"> delivered.</span>
          </h1>

          <p className="text-sky-200 mb-8 max-w-xl mx-auto text-[1.05rem]">
            Order tools, materials and safety supplies.
          </p>
        </div>
      </div>

      {/* FEATURED */}

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12 mt-6">
        <div className="bg-linear-to-r from-slate-500 to-sky-50 rounded-4xl p-5 md:p-8 border border-slate-200">
          <h2 className="text-2xl md:text-4xl font-black text-[#111827] mb-5 md:mb-8">
            Mukul, still looking for these?
          </h2>

          <div className="overflow-hidden">
            <div className="flex gap-4 marquee-track">
              {[...visibleProducts, ...visibleProducts].map(
                (product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="w-42.5 sm:w-47.5 shrink-0"
                  >
                    <ProductCard product={product} />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            Brands in Spotlight
          </h2>

          <Link
            href="/eaurix/shop"
            className="text-sky-600 text-sm font-semibold"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {spotlightProducts.map((product) => (
            <Link
              key={product.id}
              href={`/eaurix/product/${product.id}`}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-50 md:h-70 object-cover"
                />

                <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full">
                  {product.brand}
                </span>

                <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 py-2">
                  <p className="text-center text-sm font-black text-black">
                    ₹{product.price}
                  </p>
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                  {product.brand}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {product.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* WHY */}

      <div className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
  <div className="max-w-6xl mx-auto px-4 py-8">

    <div className="text-center mb-6">
      <h2 className="text-xl md:text-2xl font-black text-slate-900">
        Why Choose E-Aurix?
      </h2>

      <p className="text-xs text-slate-500 mt-1">
        Trusted marketplace for workers
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      {[
        {
          icon: Truck,
          title: "Fast Delivery",
          desc: "Delivery across your city",
          color: "#0EA5E9",
          stat: "24h",
        },
        {
          icon: Shield,
          title: "Quality Assured",
          desc: "Verified products only",
          color: "#10B981",
          stat: "100%",
        },
        {
          icon: Tag,
          title: "Trade Pricing",
          desc: "Best market rates",
          color: "#F97316",
          stat: "₹₹",
        },
      ].map((f) => {
        const Icon = f.icon;

        return (
          <div
            key={f.title}
            className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-lg transition-all"
          >
            {/* Graphic Circle */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10"
              style={{
                backgroundColor: f.color,
              }}
            />

            <div className="flex items-start justify-between mb-3">

              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: `${f.color}15`,
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: f.color }}
                />
              </div>

              <span
                className="text-lg font-black"
                style={{ color: f.color }}
              >
                {f.stat}
              </span>

            </div>

            <h3 className="text-sm font-black text-slate-900">
              {f.title}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {f.desc}
            </p>

            {/* Progress Graphic */}
            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: "85%",
                  backgroundColor: f.color,
                }}
              />
            </div>

          </div>
        );
      })}
    </div>
  </div>
</div>
    </div>
  );
}
