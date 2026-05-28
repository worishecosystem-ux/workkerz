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
  productCategories,
  type Product,
} from "@/app/data/products";

import { usePlatform } from "@/app/components/context/PlatformContext";

import { useAdmin } from "@/app/components/context/AdminContext";

import ShopLive from "@/app/components/ShopLive";

import { useRouter } from "next/navigation";

import { useMemo, useState } from "react";

/* ===================================================== */

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } =
    usePlatform();

  const badgeMap: Record<
    string,
    {
      label: string;
      color: string;
    }
  > = {
    popular: {
      label: "Popular",
      color:
        "bg-orange-500",
    },

    sale: {
      label: "Sale",
      color:
        "bg-rose-500",
    },

    new: {
      label: "New",
      color:
        "bg-sky-500",
    },

    pro: {
      label: "Pro",
      color:
        "bg-violet-500",
    },
  };

  const badge =
    product.badge
      ? badgeMap[
          product.badge
        ]
      : null;

  const imageSrc =
    product.image &&
    product.image !==
      "undefined"
      ? product.image
      : "/placeholder.png";

      

  return (
    <Link
      href={`/eaurix/product/${product.id}`}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-sky-100 transition-all duration-200 group flex flex-col"
    >
      {/* IMAGE */}


      <div
        className="relative h-52 overflow-hidden bg-[#F8FAFC]"
        style={{
          background: `linear-gradient(135deg, ${product.color} 0%, ${product.color}90 100%)`,
        }}
      >
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          onError={(
            e,
          ) => {
            (
              e.target as HTMLImageElement
            ).src =
              "/placeholder.png";
          }}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />

        {/* BADGE */}

        {badge && (
          <div
            className={`absolute top-3 left-3 ${badge.color} text-white text-[10px] px-2 py-1 rounded-full`}
            style={{
              fontWeight: 700,
            }}
          >
            {badge.label}
          </div>
        )}

        {/* DISCOUNT */}

        {product.originalPrice && (
          <div
            className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] px-2 py-1 rounded-full"
            style={{
              fontWeight: 700,
            }}
          >
            -
            {Math.round(
              (1 -
                product.price /
                  product.originalPrice) *
                100,
            )}
            %
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-4 flex flex-col flex-1">
        {/* BRAND */}

        <div
          className="text-[10px] text-[#0EA5E9] uppercase mb-1"
          style={{
            fontWeight: 700,
            letterSpacing:
              "0.05em",
          }}
        >
          {product.brand}
        </div>

        {/* NAME */}

        <div
          className="text-[#0F172A] text-sm line-clamp-2 mb-2 flex-1"
          style={{
            fontWeight: 700,
          }}
        >
          {product.name}
        </div>

        {/* RATING */}

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />

          <span className="text-xs text-[#64748B]">
            {
              product.rating
            }{" "}
            (
            {
              product.reviewCount
            }
            )
          </span>
        </div>

        {/* PRICE */}

        <div className="flex items-center justify-between">
          <div>
            <div
              className="text-[#0F172A]"
              style={{
                fontWeight: 800,
                fontSize:
                  "1.05rem",
              }}
            >
              ₹
              {product.price}
            </div>

            <div className="text-[#94A3B8] text-xs">
              {product.unit}
            </div>

            {product.originalPrice && (
              <div className="text-xs text-[#94A3B8] line-through">
                ₹
                {
                  product.originalPrice
                }
              </div>
            )}
          </div>

          {/* CART */}

          <button
            onClick={(
              e,
            ) => {
              e.preventDefault();

              addToCart({
                productId:
                  product.id,

                name:
                  product.name,

                brand:
                  product.brand,

                price:
                  product.price,

                qty: 1,

                icon:
                  imageSrc,

                color:
                  product.color,

                unit:
                  product.unit,
              });
            }}
            className="w-10 h-10 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] flex items-center justify-center transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ===================================================== */

export function EAurixHome() {
  const {
    products = [],
    shops = [],
  } = useAdmin();

  const {
    platform,
    setPlatform,
  } = usePlatform();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const router =
    useRouter();

  /* =====================================================
     ONLINE SHOP IDS
  ===================================================== */

  const onlineShopIds =
    useMemo(() => {
      return shops
        .filter(
          (shop) =>
            shop.status ===
            "online",
        )
        .map(
          (shop) =>
            shop.id,
        );
    }, [shops]);

  /* =====================================================
     VISIBLE PRODUCTS
  ===================================================== */

  const visibleProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          !!product.shop_id &&
          onlineShopIds.includes(
            product.shop_id,
          ),
      );
    }, [
      products,
      onlineShopIds,
    ]);

  /* =====================================================
     FEATURED PRODUCTS
  ===================================================== */

  const featured =
    visibleProducts.filter(
      (p) =>
        p.badge ===
          "popular" ||
        p.badge ===
          "pro",
    );

  /* ===================================================== */

  const handleToggle = (
    p:
      | "workkerz"
      | "eaurix",
  ) => {
    setPlatform(p);

    if (
      p ===
      "eaurix"
    ) {
      router.push(
        "/eaurix",
      );
    } else {
      router.push("/");
    }

    setMobileOpen(
      false,
    );
  };

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
            backgroundSize:
              "40px 40px",
          }}
        />

        <div className="absolute top-10 left-1/4 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* BADGE */}

          <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />

            <span className="text-sky-200 text-xs font-semibold">
              E-aurix under
              processing,
              coming
              soon!
            </span>

            <span className="text-sky-200 text-xs font-semibold">
              Workkerz-integrated
              marketplace
            </span>
          </div>

          {/* TITLE */}

          <h1
            className="text-white mb-4"
            style={{
              fontSize:
                "clamp(2rem, 5vw, 3rem)",

              fontWeight: 900,

              lineHeight: 1.1,
            }}
          >
            Everything
            your workers
            need,
            <span className="text-[#38BDF8]">
              {" "}
              delivered.
            </span>
          </h1>

          <p className="text-sky-200 mb-8 max-w-xl mx-auto text-[1.05rem]">
            Order tools,
            materials and
            safety
            supplies.
          </p>
        </div>
      </div>

      {/* CATEGORY */}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#0F172A] text-[1.3rem] font-extrabold">
              Shop by
              Category
            </h2>

            <p className="text-[#64748B] text-sm">
              Everything
              organized by
              trade type
            </p>
          </div>

          <Link
            href="/eaurix/shop"
            className="flex items-center gap-1 text-[#0EA5E9] text-sm"
          >
            View all

            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* CATEGORY GRID */}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {productCategories.map(
            (cat) => (
              <Link
                key={cat.id}
                href={`/eaurix/shop?category=${cat.id}`}
                className="rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition-all"
              >
                <div
                  className="h-full p-5 flex flex-col justify-between min-h-42.5"
                  style={{
                    background:
                      cat.bgColor,
                  }}
                >
                  {/* ICON */}

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background:
                        cat.color,
                    }}
                  >
                    {(() => {
                      const icons =
                        {
                          cement:
                            Hammer,

                          sand:
                            Package,

                          tiles:
                            Building2,

                          plumbing:
                            Wrench,

                          paint:
                            PaintBucket,

                          tmt: Truck,
                        };

                      const Icon =
                        icons[
                          cat.id as keyof typeof icons
                        ] ||
                        Package;

                      return (
                        <Icon className="w-7 h-7 text-white" />
                      );
                    })()}
                  </div>

                  {/* CONTENT */}

                  <div>
                    <div className="text-[#0F172A] text-sm font-bold mb-1">
                      {
                        cat.label
                      }
                    </div>

                    <div className="text-xs text-[#64748B] mb-2">
                      {
                        cat.description
                      }
                    </div>

                    <div className="text-xs text-[#0EA5E9] font-semibold">
                      {
                        visibleProducts.filter(
                          (
                            p,
                          ) =>
                            p.category ===
                            cat.id,
                        )
                          .length
                      }{" "}
                      Products
                    </div>
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>

      {/* FEATURED */}

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#0F172A] text-[1.3rem] font-extrabold">
              Featured
              Products
            </h2>

            <p className="text-[#64748B] text-sm">
              Top picks
              across all
              categories
            </p>
          </div>

          <Link
            href="/eaurix/shop"
            className="flex items-center gap-1 text-[#0EA5E9] text-sm"
          >
            See all

            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured
            .slice(0, 8)
            .map((p) => (
              <ProductCard
                key={p.id}
                product={p}
              />
            ))}
        </div>
      </div>

      {/* WHY */}

      <div className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-center text-[#0F172A] text-[1.3rem] font-extrabold mb-8">
            Why Choose
            E-Aurix?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Truck,

                title:
                  "Next-Day Delivery",

                desc: "Fast delivery for every order.",

                color:
                  "#0EA5E9",
              },

              {
                icon: Shield,

                title:
                  "Trade-Grade Quality",

                desc: "Certified quality materials.",

                color:
                  "#10B981",
              },

              {
                icon: Tag,

                title:
                  "Trade Pricing",

                desc: "Best prices for workers.",

                color:
                  "#F97316",
              },
            ].map(
              (f) => {
                const Icon =
                  f.icon;

                return (
                  <div
                    key={
                      f.title
                    }
                    className="text-center p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        backgroundColor: `${f.color}15`,
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{
                          color:
                            f.color,
                        }}
                      />
                    </div>

                    <div className="text-[#0F172A] font-bold mb-2">
                      {
                        f.title
                      }
                    </div>

                    <p className="text-[#64748B] text-sm">
                      {
                        f.desc
                      }
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}