"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Star,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  productCategories,
  ProductCategory,
  type Product,
} from "../../data/products";

import { useAdmin } from "@/app/components/context/AdminContext";
import { usePlatform } from "@/app/components/context/PlatformContext";

type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "new";

const sortLabels: Record<SortOption, string> = {
  popular: "Popular",
  "price-asc": "Low → High",
  "price-desc": "High → Low",
  rating: "Top Rated",
  new: "Newest",
};

const categories = [
  {
    id: null,
    name: "All",
    image: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
  },

  {
    id: "sand",
    name: "Sand",
    image: "/sand.webp",
  },

  {
    id: "aggregate",
    name: "Aggregate",
    image: "/20-mm-aggregates.jpg",
  },

  {
    id: "brick",
    name: "Brick",
    image: "/red-brick.jpeg",
  },

  {
    id: "cement",
    name: "Cement",
    image: "/cements_.jpg",
  },

  {
    id: "tmt",
    name: "TMT",
    image: "/captain-tmt-bars-500x500.webp",
  },

  {
    id: "paint",
    name: "Paint",
    image: "/closeup-of-house-painting-renovation-4519567.webp",
  },

  {
    id: "plumbing",
    name: "Plumbing",
    image: "/pipes-18242-1676036604740.webp",
  },

  {
    id: "tiles",
    name: "Tiles",
    image: "/tiles.avif",
  },

  {
    id: "electrical",
    name: "Electrical",
    image: "/electrical.avif",
  },
];

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart } = usePlatform();

  const { shops } = useAdmin();

  const inCart = cart.some(
    (c) => c.productId === product.id,
  );

  const shop = shops.find(
    (s) => s.id === product.shop_id,
  );

  /* =========================================
     FIXED CONDITIONS
  ========================================= */

  const isOffline =
    shop?.status !== "online";

  const isOutOfStock =
    product.is_active === false;

  const discount =
    product.originalPrice
      ? Math.round(
          (1 -
            product.price /
              product.originalPrice) *
            100,
        )
      : 0;

  return (
    <Link
      href={
        isOffline || isOutOfStock
          ? "#"
          : `/eaurix/product/${product.id}`
      }
      onClick={(e) => {
        if (
          isOffline ||
          isOutOfStock
        ) {
          e.preventDefault();
        }
      }}
      className={`
        group bg-white rounded-3xl
        overflow-hidden border border-gray-100
        hover:shadow-xl transition-all duration-300
        relative
        ${
          isOffline ||
          isOutOfStock
            ? "opacity-75"
            : ""
        }
      `}
    >
      {/* STATUS DOT */}

      <div
        className={`
          absolute top-3 left-3 z-30
          w-4 h-4 rounded-full
          border-2 border-white
          shadow-lg
          ${
            isOffline ||
            isOutOfStock
              ? "bg-red-500"
              : "bg-green-500"
          }
        `}
      />

      {/* IMAGE */}

      <div
        className="
          relative h-40 sm:h-44 lg:h-56
          p-2 lg:p-3 overflow-hidden
        "
        style={{
          background: `linear-gradient(135deg, ${product.color}, #ffffff)`,
        }}
      >
        <div
          className="
            w-full h-full rounded-[18px] lg:rounded-[22px]
            overflow-hidden bg-white/50
            border border-white/70 shadow-inner relative
          "
        >
          {/* OVERLAY */}

          {(isOffline ||
            isOutOfStock) && (
            <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">
                {isOffline
                  ? "Shop Offline"
                  : "Out of Stock"}
              </div>
            </div>
          )}

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/600x600/png?text=No+Image";
              }}
              className="
                absolute inset-0
                w-full h-full object-cover
                rounded-[18px] lg:rounded-[22px]
                group-hover:scale-105
                transition-transform duration-500
              "
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-[#0F172A]">
              {product.name.charAt(0)}
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>

        {/* DISCOUNT */}

        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] lg:text-[10px] px-2 py-1 rounded-full shadow-lg font-extrabold">
            -{discount}%
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-3 lg:p-4">
        {/* BRAND */}

        <div className="text-[9px] lg:text-[10px] uppercase tracking-widest text-sky-500 mb-1 font-extrabold">
          {product.brand}
        </div>

        {/* NAME */}

        <h3 className="text-[#0F172A] text-[13px] lg:text-[15px] leading-[1.3] line-clamp-2 min-h-9 lg:min-h-10.5 font-extrabold">
          {product.name}
        </h3>

        {/* RATING */}

        <div className="flex items-center gap-1 mt-1.5 lg:mt-2">
          <Star className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-amber-400 fill-amber-400" />

          <span className="text-[10px] lg:text-[11px] text-[#475569]">
            {product.rating}
          </span>

          <span className="text-[10px] lg:text-[11px] text-[#94A3B8]">
            ({product.reviewCount})
          </span>
        </div>

        {/* PRICE */}

        <div className="flex items-end justify-between mt-3 lg:mt-4">
          <div>
            <div className="flex items-end gap-1">
              <span className="text-[#0F172A] text-[1.2rem] lg:text-[1.7rem] leading-none font-black">
                ₹{product.price}
              </span>

              <span className="text-[9px] lg:text-[10px] text-[#94A3B8] mb-1">
                {product.unit}
              </span>
            </div>

            {product.originalPrice && (
              <div className="text-[10px] lg:text-[11px] text-[#94A3B8] line-through mt-0.5">
                ₹{product.originalPrice}
              </div>
            )}
          </div>

          {/* CART */}

          <button
            disabled={
              isOffline ||
              isOutOfStock
            }
            onClick={(e) => {
              e.preventDefault();

              if (
                isOffline ||
                isOutOfStock
              )
                return;

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
                  product.image ||
                  "",
                color:
                  product.color,
                unit:
                  product.unit,
              });
            }}
            className={`
              w-9 h-9 lg:w-11 lg:h-11
              rounded-xl lg:rounded-2xl
              flex items-center justify-center
              shadow-lg transition-all duration-300
              ${
                isOffline ||
                isOutOfStock
                  ? "bg-gray-300 cursor-not-allowed"
                  : inCart
                    ? "bg-emerald-500"
                    : "bg-[#0EA5E9]"
              }
            `}
          >
            <ShoppingCart className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export function EAurixShop() {
  const { products } = useAdmin();
  const { cart } = usePlatform();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(
    null,
  );

  const [mounted, setMounted] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    categoryRef.current?.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const handleScrollRight = () => {
    categoryRef.current?.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);
  const [sort, setSort] = useState<SortOption>("popular");
  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory)
      list = list.filter((p) => p.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        list.sort(
          (a, b) => (b.badge === "new" ? 1 : 0) - (a.badge === "new" ? 1 : 0),
        );
        break;
      default:
        list.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return list;
  }, [products, activeCategory, search, sort]);

  return (
    <div className="min-h-screen bg-[#F3F6FB]">
      {/* TOP HERO */}
      <div className="bg-[#06152D] overflow-hidden mt-15">
        <div className="max-w-600 mx-auto px-4 lg:px-8 pt-2 lg:pt-14 pb-8 lg:pb-10 mt-2 lg:mt-10  relative ">
          <div className="max-w-2xl">
            {/* DESKTOP CONTENT */}
            <div className="hidden lg:block ">
              <p className="text-[#B6C2D2] text-sm md:text-base mt-2 max-w-xl">
                Construction products, hardware & industrial materials.
              </p>

              <div className="relative mt-6 max-w-5xl flex items-start ">
                {/* SEARCH BAR */}

                <div className="w-full">
                  <div
                    className="
        relative
        rounded-[26px]
        border border-white/10
        bg-white/10
        backdrop-blur-2xl
        overflow-hidden
        shadow-2xl
      "
                  >
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      placeholder="Search cement, pipes, electrical, tools..."
                      className="
          w-full h-15
          bg-transparent
          pl-14 pr-14
          text-white text-sm
          placeholder:text-[#A7B4C7]
          outline-none
        "
                    />

                    {/* CLEAR BUTTON */}

                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setShowSuggestions(false);
                        }}
                        className="
            absolute right-5 top-1/2 -translate-y-1/2
            text-[#94A3B8]
            hover:text-white
            transition-all
          "
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE FLOATING SUGGESTIONS */}

                {search.trim() && showSuggestions && (
                  <div
                    className="
        absolute
        top-0
        left-[calc(100%+28px)]
        w-155
        rounded-2xl
        bg-[#081225]
        border border-white/10
        shadow-2xl
        overflow-y-auto
        overflow-x-hidden
        max-h-60
        scrollbar-hide
        z-50
      "
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {products
                      .filter((p) => {
                        const q = search.toLowerCase();

                        return (
                          p.name.toLowerCase().includes(q) ||
                          p.brand.toLowerCase().includes(q) ||
                          p.category.toLowerCase().includes(q)
                        );
                      })
                      .slice(0, 20)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSearch(item.name);
                            setShowSuggestions(false);
                          }}
                          className="
              w-full
              flex items-center gap-2
              px-3 py-2
              border-b border-white/5
              hover:bg-white/5
              transition-all
              text-left
            "
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-white text-[12px] font-bold truncate">
                              {item.name}
                            </div>

                            <div className="text-[#94A3B8] text-[10px] truncate">
                              {item.brand}
                            </div>
                          </div>

                          <div className="text-[#0EA5E9] text-[11px] font-black">
                            ₹{item.price}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE ONLY */}

            <div
              className={`
    lg:hidden
    transition-all duration-300
    ${search.trim() && showSuggestions ? "pb-72" : "pb-0"}
  `}
            >
              <div className="relative">
                {/* SEARCH BAR */}

                <div
                  className="
    relative
    rounded-2xl
    border border-white/10
    bg-white/10
    backdrop-blur-2xl
    overflow-hidden
    shadow-xl
  "
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="Search products..."
                    className="
      w-full h-13
      bg-transparent
      pl-11 pr-11
      text-white text-sm
      placeholder:text-[#A7B4C7]
      outline-none
    "
                  />

                  {/* CLEAR */}

                  {search && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setShowSuggestions(false);
                      }}
                      className="
        absolute right-3 top-1/2 -translate-y-1/2
        text-[#94A3B8]
      "
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* MOBILE SUGGESTIONS */}

                {search.trim() && showSuggestions && (
                  <div
                    className="
          absolute top-full left-0 right-0 mt-2
          rounded-xl
          bg-[#0F172A]
          border border-white/10
          shadow-2xl
          overflow-hidden
          z-50
        "
                  >
                    {products
                      .filter((p) => {
                        const q = search.toLowerCase();

                        return (
                          p.name.toLowerCase().includes(q) ||
                          p.brand.toLowerCase().includes(q) ||
                          p.category.toLowerCase().includes(q)
                        );
                      })
                      .slice(0, 5)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSearch(item.name);
                            setShowSuggestions(false);
                          }}
                          className="
                w-full
                flex items-center gap-2
                px-3 py-2
                border-b border-white/5
                hover:bg-white/5
                transition-all
                text-left
              "
                        >
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-white shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-white text-[11px] font-bold truncate">
                              {item.name}
                            </div>

                            <div className="text-[#94A3B8] text-[9px] truncate">
                              {item.brand}
                            </div>
                          </div>

                          <div className="text-[#0EA5E9] text-[10px] font-black">
                            ₹{item.price}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* TOP CATEGORY BAR */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-sm">
          <div className="relative">
            {/* LEFT BUTTON */}

            <button
              onClick={handleScrollLeft}
              className="
        absolute left-2 top-1/2 -translate-y-1/2 z-20
        w-10 h-10 rounded-full
        bg-white border border-gray-200
        shadow-lg
        flex items-center justify-center
        hover:bg-[#081225]
        hover:text-white
        transition-all
      "
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* RIGHT BUTTON */}

            <button
              onClick={handleScrollRight}
              className="
        absolute right-2 top-1/2 -translate-y-1/2 z-20
        w-10 h-10 rounded-full
        bg-white border border-gray-200
        shadow-lg
        flex items-center justify-center
        hover:bg-[#081225]
        hover:text-white
        transition-all
      "
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* SCROLL AREA */}

            <div
              ref={categoryRef}
              className="
        flex items-center gap-4
        px-16 py-3
        overflow-x-auto
        scrollbar-hide
        scroll-smooth
      "
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* SORT */}

              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="
      h-12
      rounded-2xl
      border border-gray-200
      bg-white
      pl-4 pr-12
      text-[13px]
      font-bold
      text-[#0F172A]
      shadow-sm
      outline-none
      appearance-none
      cursor-pointer
    "
                >
                  {Object.entries(sortLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>

                {/* CUSTOM ARROW */}

                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  ▼
                </div>
              </div>

              {/* CATEGORIES */}

              {categories.map((cat) => {
                const active =
                  activeCategory === cat.id ||
                  (!activeCategory && cat.id === null);

                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setActiveCategory(cat.id as ProductCategory);
                    }}
                    className={`
              group
              relative
              flex items-center gap-3
              h-12
              px-4
              rounded-2xl
              border
              shrink-0
              transition-all duration-300
              shadow-sm
              ${
                active
                  ? "bg-[#081225] border-[#081225] text-white"
                  : "bg-white border-gray-200 hover:border-sky-200"
              }
            `}
                  >
                    <div
                      className={`
                w-8 h-8 rounded-xl
                flex items-center justify-center
                overflow-hidden
                ${active ? "bg-white/10" : "bg-[#F4F7FA]"}
              `}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-5 h-5 object-contain"
                      />
                    </div>

                    <div className="flex flex-col items-start leading-none">
                      <span
                        className={`
                  text-[12px]
                  font-extrabold
                  whitespace-nowrap
                  ${active ? "text-white" : "text-[#0F172A]"}
                `}
                      >
                        {cat.name}
                      </span>

                      <span className="text-[9px] text-[#94A3B8] mt-1">
                        Materials
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SECTION */}

      <div className="w-full max-w-450 mx-auto px-0 sm:px-4 lg:px-6 mt-2 relative z-20">
        <div className="flex gap-4 lg:gap-6 items-start">
          {/* MOBILE OVERLAY */}
          {mobileMenu && (
            <div
              onClick={() => setMobileMenu(false)}
              className="fixed inset-0 bg-black/50 z-55 lg:hidden backdrop-blur-sm"
            />
          )}

          {/* MAIN */}
          <main
            className="
        flex-1
        min-w-0
        h-[calc(100vh-40px)]
        overflow-y-auto
        overflow-x-hidden
        scrollbar-hide
      "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* PRODUCTS */}
            <div
              className="
          mt-4
          sm:mt-6
          pb-24
          px-3
          sm:px-5
          lg:px-8
          2xl:px-10
        "
            >
              {/* HEADER */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="min-w-0">
                  <h2
                    className="
                text-[22px]
                sm:text-[28px]
                lg:text-3xl
                font-black
                text-[#0F172A]
                leading-none
                truncate
              "
                  >
                    Products
                  </h2>

                  <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                    Explore premium materials & products
                  </p>
                </div>

                <div
                  className="
              shrink-0
              px-3
              py-1.5
              rounded-2xl
              bg-white
              border
              border-gray-200
              text-[#0F172A]
              text-xs
              sm:text-sm
              font-semibold
              shadow-sm
            "
                >
                  {filtered.length} items
                </div>
              </div>

              {/* PRODUCT GRID */}
              <div
                className="
            grid
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
            2xl:grid-cols-5
            gap-3
            sm:gap-5
            items-start
          "
              >
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      <Link
        href="/eaurix/cart"
        className="
    fixed bottom-5 right-5 z-90
    w-14 h-14 rounded-full
    bg-[#081225]
    shadow-2xl
    flex items-center justify-center
    text-white
    hover:scale-105
    transition-all duration-300
  "
      >
        <ShoppingCart className="w-5 h-5" />

        {mounted && cart.length > 0 && (
          <span
            className="
        absolute -top-1 -right-1
        min-w-5.5 h-5.5
        rounded-full
        bg-[#0EA5E9]
        text-white text-[10px]
        font-black
        flex items-center justify-center
        px-1
      "
          >
            {cart.length}
          </span>
        )}
      </Link>
    </div>
  );
}
