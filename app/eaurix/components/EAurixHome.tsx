"use client";

import Link from "next/link";

import { Eye, ArrowUpDown, ShoppingCart, ChevronDown } from "lucide-react";
import FeaturedProducts from "./FeaturedProducts";
import { getProducts, type Product } from "@/app/data/products";
import CategoriesDrawer from "./shop/CategoriesDrawer";
import { useAdmin } from "@/app/components/context/AdminContext";

import ShopLive from "@/app/components/ShopLive";
import CategoriesHeader from "./shop/CategoriesHeader";

import { useMemo, useState, useEffect, useRef } from "react";

import { usePlatform } from "@/app/components/context/PlatformContext";
/* ===================================================== */

/* ===================================================== */
function ProductImage({
  image,
  name,
}: {
  image?: string;
  name: string;
}) {
  const [error, setError] = useState(false);

  if (!image || error) {
    return (
      <div className="flex h-32 w-full items-center justify-center bg-slate-100 px-3 text-center md:h-64">
        <span className="line-clamp-3 text-sm font-bold text-slate-700 md:text-lg">
          {name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      onError={() => setError(true)}
      className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-64"
    />
  );
}
export function EAurixHome() {
  const { shops = [] } = useAdmin();
  const categoryRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("latest");
  const { cart, addToCart } = usePlatform();
  const [products, setProducts] = useState<Product[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hideCart, setHideCart] = useState(false);
  const PRODUCTS_PER_PAGE = 2;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    setPage(1);
    setLoadingMore(false);
  }, [activeCategory, sort]);

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

  /* =====================================================
     ONLINE SHOP IDS
  ===================================================== */

  const onlineShopIds = useMemo(() => {
    return shops
      .filter((shop) => shop.status === "online")
      .map((shop) => shop.id);
  }, [shops]);

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });
  /* =====================================================
     VISIBLE PRODUCTS
  ===================================================== */
  const visibleProducts = useMemo(() => {
    let list = products.filter(
      (product) => !!product.shop_id && onlineShopIds.includes(product.shop_id),
    );

    // Category Filter
    if (activeCategory) {
      list = list.filter((product) => product.category === activeCategory);
    }

    // Sorting
    switch (sort) {
      case "low":
        list.sort((a, b) => a.price - b.price);
        break;

      case "high":
        list.sort((a, b) => b.price - a.price);
        break;

      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;

      default:
        // Latest
        break;
    }

    return list;
  }, [products, onlineShopIds, activeCategory, sort]);
  const [hideFeatured, setHideFeatured] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHideFeatured(window.scrollY > 80);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeader(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  /* =====================================================
     FEATURED PRODUCTS
  ===================================================== */

  const featured = visibleProducts.filter(
    (p) => p.badge === "popular" || p.badge === "pro",
  );
  const paginatedProducts = useMemo(() => {
    return visibleProducts.slice(0, page * PRODUCTS_PER_PAGE);
  }, [visibleProducts, page]);
  /* ===================================================== */

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !loadingMore &&
          paginatedProducts.length < visibleProducts.length
        ) {
          setLoadingMore(true);

          setTimeout(() => {
            setPage((p) => p + 1);
            setLoadingMore(false);
          }, 400);
        }
      },
      {
        rootMargin: "150px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [loadingMore, paginatedProducts.length, visibleProducts.length]);

  useEffect(() => {
    if (loadingMore) {
      const timer = setTimeout(() => {
        setLoadingMore(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [paginatedProducts.length, loadingMore]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  const sortLabels = {
    latest: "Latest",
    low: "Price : Low to High",
    high: "Price : High to Low",
    name: "Name A-Z",
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

  /* ===================================================== */

  return (
    <div className=" bg-[#F0F9FF]">
      {/* Floating Cart Button */}
      <div
        className={`overflow-hidden transition-all duration-300 ${hideFeatured
          ? "max-h-0 opacity-0 -translate-y-4 pointer-events-none mb-0 pt-0"
          : "max-h-75 opacity-100 translate-y-0 mb-1 pt-2"
          }`}
      >
        <ShopLive />
      </div>
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showHeader
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <CategoriesHeader
          loading={loading}
          sort={sort}
          setSort={setSort}
          products={products}
          search={search}
          setSearch={setSearch}
          sortLabels={sortLabels}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categoryRef={categoryRef}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>

      <CategoriesDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <div
        className={`overflow-hidden transition-all duration-300 ${hideFeatured
          ? "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
          : "max-h-250 opacity-100 translate-y-0"
          }`}
      >
        <FeaturedProducts products={visibleProducts}  />
      </div>
      <div className="px-4 md:px-8 pb-6 pt-30">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-black text-slate-900">
            All Products
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {paginatedProducts.map((product) => {
            const inCart = cart.some(
              (item) => item.productId === product.id
            );

            return (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Clickable Image */}
                <Link href={`/eaurix/product/${product.id}`}>
                  <div className="relative overflow-hidden">
                    <div className="h-32 w-full overflow-hidden md:h-64">
                      {product.image ? (
                        <ProductImage
                          image={product.image}
                          name={product.name}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 px-3 text-center">
                          <span className="line-clamp-3 text-sm font-bold text-slate-700 md:text-lg">
                            {product.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-medium text-white md:text-[10px]">
                      {product.brand}
                    </span>
                  </div>
                </Link>

                <div className="p-2 md:p-3">
                  {/* Clickable Name & Price */}
                  <Link href={`/eaurix/product/${product.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 flex-1 text-xs font-semibold text-slate-900 md:text-sm">
                        {product.name}
                      </h3>

                      <span className="shrink-0 text-sm font-bold text-emerald-600 md:text-lg">
                        ₹{product.price}
                      </span>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    {/* Add to Cart */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!inCart) {
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            brand: product.brand,
                            price: product.price,
                            qty: 1,
                            icon: product.image || "",
                            color: product.color ?? "#10b981",
                            unit: product.unit ?? "pcs",
                          });
                        }
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-95 ${inCart
                        ? "bg-black text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                        }`}
                    >
                      <ShoppingCart
                        size={16}
                        className={inCart ? "fill-white" : ""}
                      />
                    </button>

                    {/* View Button */}
                    <Link
                      href={`/eaurix/product/${product.id}`}
                      className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500 px-2 text-[11px] font-semibold text-white transition-all hover:bg-emerald-600 active:scale-95"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {paginatedProducts.length < visibleProducts.length && (
        <div
          ref={loadMoreRef}
          className="flex h-20 items-center justify-center"
        >
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
