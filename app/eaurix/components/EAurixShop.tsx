"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingCart, Search, SlidersHorizontal, Star, X } from "lucide-react";
import {
  productCategories,
  ProductCategory,
  type Product,
} from "../../data/products";
import { usePlatform } from "@/app/components/context/PlatformContext";
import { useAdmin } from "@/app/components/context/AdminContext";

type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "new";

const sortLabels: Record<SortOption, string> = {
  popular: "Most Popular",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  rating: "Highest Rated",
  new: "Newest",
};

function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart } = usePlatform();

  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    setInCart(cart.some((c) => c.productId === product.id));
  }, [cart, product.id]);
  const badgeMap: Record<string, { label: string; cls: string }> = {
    popular: { label: "Popular", cls: "bg-orange-500" },
    sale: { label: "Sale", cls: "bg-rose-500" },
    new: { label: "New", cls: "bg-sky-500" },
    pro: { label: "Pro", cls: "bg-violet-500" },
  };
  const badge = product.badge ? badgeMap[product.badge] : null;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="
    overflow-x-auto
    scroll-smooth
    scrollbar-thin
    scrollbar-thumb-sky-200
    scrollbar-track-transparent
    pb-3
  "
      style={{
        scrollbarWidth: "thin",
      }}
    >
      <div className="w-full">
        <Link
          href={`/eaurix/product/${product.id}`}
          className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
        >
          {/* Image */}
          <div
            className="relative h-36 sm:h-44 flex items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${product.color}, ${product.color}80)`,
            }}
          >
            <div className="absolute inset-0 bg-black/5" />

            <span className="relative text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="relative w-24 h-24 sm:w-32 sm:h-32 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white/30 flex items-center justify-center text-white text-3xl font-bold">
                  {product.name.charAt(0)}
                </div>
              )}
            </span>

            {/* Badge */}
            {badge && (
              <span
                className={`absolute top-3 left-3 text-white text-[10px] px-2.5 py-1 rounded-full shadow-md ${badge.cls}`}
                style={{ fontWeight: 700 }}
              >
                {badge.label}
              </span>
            )}

            {/* Discount */}
            {discount > 0 && (
              <span
                className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] px-2.5 py-1 rounded-full shadow-md"
                style={{ fontWeight: 700 }}
              >
                -{discount}%
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 flex flex-col flex-1">
            {/* Brand */}
            <div
              className="text-[10px] sm:text-[11px] text-sky-500 uppercase tracking-wider mb-1"
              style={{ fontWeight: 700 }}
            >
              {product.brand}
            </div>

            {/* Name */}
            <div
              className="text-[#0F172A] text-xs sm:text-sm leading-[1.45] line-clamp-2 min-h-9.5 sm:min-h-11"
              style={{ fontWeight: 700 }}
            >
              {product.name}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2 mb-3">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />

              <span className="text-[11px] sm:text-xs text-[#475569]">
                {product.rating}
              </span>

              <span className="text-[11px] sm:text-xs text-[#94A3B8]">
                ({product.reviewCount})
              </span>
            </div>

            {/* Bottom */}
            <div className="flex items-end justify-between mt-auto gap-2">
              {/* Price */}
              <div>
                <div className="flex items-end gap-1">
                  <span
                    className="text-[#0F172A] text-base sm:text-lg"
                    style={{ fontWeight: 900 }}
                  >
                    ${product.price}
                  </span>

                  <span className="text-[#94A3B8] text-[10px] sm:text-xs mb-0.5">
                    {product.unit}
                  </span>
                </div>

                {product.originalPrice && (
                  <div className="text-[#94A3B8] text-[10px] sm:text-xs line-through mt-0.5">
                    ${product.originalPrice}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={(e) => {
                  e.preventDefault();

                  addToCart({
                    productId: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    qty: 1,
                    icon: product.image || "",
                    color: product.color,
                    unit: product.unit,
                  });
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 ${
                  inCart
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-[#0EA5E9] hover:bg-[#0284C7]"
                }`}
              >
                <ShoppingCart className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function EAurixShop() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [showFilters, setShowFilters] = useState(false);
  const { products } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCategory = searchParams.get("category") as ProductCategory | null;

  const setCategory = (cat: ProductCategory | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }

    router.push(`/eaurix/shop?${params.toString()}`);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory)
      list = list.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.categoryLabel.toLowerCase().includes(q),
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
      case "popular":
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }
    return list;
  }, [activeCategory, search, sort]);

  const activeCatData = activeCategory
    ? productCategories.find((c) => c.id === activeCategory)
    : null;

  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-20">
      {/* Page Header */}
      <div className="bg-linear-to-r from-[#0F2744] to-[#0C3B5E] py-8">
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4 text-sm text-sky-300">
            <Link href="/eaurix" className="hover:text-sky-100">
              E-Aurix
            </Link>
            <span>/</span>
            <span className="text-sky-100">
              {activeCatData ? activeCatData.label : "All Products"}
            </span>
          </div>
          <h1
            className="text-white mb-1"
            style={{ fontWeight: 800, fontSize: "1.6rem" }}
          >
            {activeCatData ? activeCatData.label : "All Products"}
          </h1>
          <p className="text-sky-300 text-sm">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
      </div>

      <div className="max-w-425 mx-auto px-4 sm:px-6 py-6">
        {/* Top Category Navbar */}
        <div className="sticky top-18 z-40 mb-2">
          {/* Mobile Toggle */}
          <div className="xl:hidden mb-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-full h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-between px-4 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {mobileOpen ? "Close Filters" : "ShowS Filters"}
                </span>
              </div>

              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Main Filter Box */}
          <div
            className={`bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_10px_40px_rgba(15,23,42,0.08)] rounded-4xl overflow-hidden transition-all duration-300 ${
              mobileOpen
                ? "max-h-350 opacity-100"
                : "max-h-0 opacity-0 xl:max-h-350 xl:opacity-100"
            }`}
          >
            {/* Top Header */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 px-4 sm:px-6 py-5 border-b border-gray-100">
              {/* Left */}
              <div className="flex items-center justify-between gap-4 w-full xl:w-auto">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-linear-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-100 shrink-0">
                    <span className="text-white text-xl sm:text-2xl">🛒</span>
                  </div>

                  <div className="min-w-0">
                    <h2
                      className="text-[#0F172A] truncate text-lg sm:text-xl xl:text-2xl"
                      style={{ fontWeight: 900, letterSpacing: "-0.03em" }}
                    >
                      Shop Categories
                    </h2>

                    <p className="text-[#64748B] text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2">
                      Browse premium construction materials & tools
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                {/* Search */}
                <div className="relative flex-1 xl:min-w-[320px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-11 sm:h-12 rounded-2xl border border-gray-200 bg-[#F8FAFC] pl-11 pr-4 text-sm text-[#0F172A] outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all"
                  />
                </div>

                {/* Sort */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="appearance-none w-full sm:min-w-55 h-11 sm:h-12 rounded-2xl border border-gray-200 bg-white pl-5 pr-12 text-sm text-[#0F172A] outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all"
                    style={{ fontWeight: 700 }}
                  >
                    {Object.entries(sortLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-[#64748B]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Scroll */}
            <div className="relative px-4 py-4">
              {/* Left Arrow */}
              {/* Left Arrow */}
              <button
                onClick={() => {
                  document
                    .getElementById("category-scroll")
                    ?.scrollBy({ left: -300, behavior: "smooth" });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-lg flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 hover:shadow-orange-200 transition-all duration-300 group"
              >
                <svg
                  className="w-4 h-4 text-[#0F172A] group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 18-6-6 6-6"
                  />
                </svg>
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => {
                  document
                    .getElementById("category-scroll")
                    ?.scrollBy({ left: 300, behavior: "smooth" });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-lg flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 hover:shadow-orange-200 transition-all duration-300 group"
              >
                <svg
                  className="w-4 h-4 text-[#0F172A] group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 6 6 6-6 6"
                  />
                </svg>
              </button>

              {/* Scroll Area */}
              <div
                id="category-scroll"
                className="flex items-center gap-3 overflow-x-auto scroll-smooth px-12 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {/* All Products */}
                <button
                  onClick={() => setCategory(null)}
                  className={`shrink-0 group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    !activeCategory
                      ? "bg-[#0F172A] text-white shadow-xl"
                      : "bg-white border border-gray-200 hover:border-sky-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-3 min-w-45">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
                        !activeCategory ? "bg-white/10" : "bg-[#F8FAFC]"
                      }`}
                    >
                      🛍️
                    </div>

                    <div className="flex-1 text-left">
                      <div
                        className={`text-sm ${
                          !activeCategory ? "text-white" : "text-[#0F172A]"
                        }`}
                        style={{ fontWeight: 800 }}
                      >
                        All Products
                      </div>

                      <div
                        className={`text-[11px] mt-0.5 ${
                          !activeCategory ? "text-gray-300" : "text-[#94A3B8]"
                        }`}
                      >
                        {products.length} items
                      </div>
                    </div>
                  </div>
                </button>

                {/* Categories */}
                {productCategories.map((cat) => {
                  const count = products.filter(
                    (p) => p.category === cat.id,
                  ).length;
                  const active = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id as ProductCategory)}
                      className={`shrink-0 group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                        active
                          ? "bg-linear-to-br from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-100"
                          : "bg-white border border-gray-200 hover:border-sky-200 hover:shadow-md"
                      }`}
                    >
                      {active && (
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 blur-3xl rounded-full" />
                      )}

                      <div className="relative flex items-center gap-3 px-4 py-3 min-w-45">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            active ? "bg-white/15" : "bg-[#F8FAFC]"
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        </div>

                        <div className="flex-1 text-left">
                          <div
                            className={`text-sm ${
                              active ? "text-white" : "text-[#0F172A]"
                            }`}
                            style={{ fontWeight: 800 }}
                          >
                            {cat.label}
                          </div>

                          <div
                            className={`text-[11px] mt-0.5 ${
                              active ? "text-sky-100" : "text-[#94A3B8]"
                            }`}
                          >
                            {count} items
                          </div>
                        </div>

                        <div
                          className={`min-w-8 h-8 px-2 rounded-full flex items-center justify-center text-[11px] ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-[#F1F5F9] text-[#475569]"
                          }`}
                          style={{ fontWeight: 800 }}
                        >
                          {count}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-4xl border border-gray-100">
            <div className="text-6xl mb-5">🔍</div>

            <h3
              className="text-[#0F172A]"
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
              }}
            >
              No Products Found
            </h3>

            <p className="text-[#64748B] text-sm mt-2">
              Try adjusting your search or category filters
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory(null);
              }}
              className="
          mt-6
          bg-[#0EA5E9]
          hover:bg-[#0284C7]
          text-white
          px-6 py-3
          rounded-2xl
          text-sm
          transition-colors
        "
              style={{ fontWeight: 700 }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
