"use client";

import { useAdmin } from "@/app/components/context/AdminContext";
import ProductsGrid from "./shop/ProductsGrid";
import ShopLive from "@/app/components/ShopLive";
import CategoriesHeader from "./shop/CategoriesHeader";
import { LayoutGrid } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";

import {
  getProducts,
  productCategories,
  type Product,
} from "@/app/data/products";

import { usePlatform } from "@/app/components/context/PlatformContext";

/* =====================================================
   SKELETON COMPONENTS
===================================================== */

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`
        animate-pulse
        rounded-xl
        bg-gray-200
        ${className}
      `}
    />
  );
}

/* =====================================================
   CATEGORIES SKELETON
===================================================== */

function CategoriesSkeleton() {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-3 overflow-hidden px-1 py-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="
              flex
              min-w-[72px]
              flex-col
              items-center
              gap-2
              shrink-0
            "
          >
            <SkeletonBox className="h-14 w-14 rounded-full" />

            <SkeletonBox className="h-3 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   FEATURED SKELETON
===================================================== */

function FeaturedProductsSkeleton() {
  return (
    <section className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <SkeletonBox className="h-5 w-32" />
        <SkeletonBox className="h-4 w-16" />
      </div>

      <div
        className="
          flex
          gap-3
          overflow-hidden
        "
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="
              min-w-[170px]
              overflow-hidden
              rounded-2xl
              border
              border-gray-100
              bg-white
            "
          >
            <SkeletonBox className="h-36 w-full rounded-none" />

            <div className="space-y-2 p-3">
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="h-3 w-20" />

              <div className="flex items-center justify-between">
                <SkeletonBox className="h-4 w-16" />
                <SkeletonBox className="h-7 w-7 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =====================================================
   SHOP LIVE SKELETON
===================================================== */

function ShopLiveSkeleton() {
  return (
    <section className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <SkeletonBox className="h-5 w-28" />
        <SkeletonBox className="h-4 w-16" />
      </div>

      <div
        className="
          flex
          gap-3
          overflow-hidden
        "
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="
              min-w-[145px]
              rounded-2xl
              border
              border-gray-100
              bg-white
              p-3
            "
          >
            <SkeletonBox className="h-20 w-full rounded-xl" />

            <div className="mt-3 space-y-2">
              <SkeletonBox className="h-3 w-24" />
              <SkeletonBox className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =====================================================
   PRODUCT CARD SKELETON
===================================================== */

function ProductSkeletonCard() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
      "
    >
      <SkeletonBox className="h-40 w-full rounded-none" />

      <div className="space-y-2 p-3">
        <SkeletonBox className="h-4 w-28" />

        <SkeletonBox className="h-3 w-20" />

        <div className="flex items-center justify-between pt-1">
          <SkeletonBox className="h-5 w-16" />

          <SkeletonBox className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   PRODUCTS GRID SKELETON
===================================================== */

function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="
        grid
        grid-cols-2
        gap-3
        sm:grid-cols-3
        lg:grid-cols-4
      "
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeletonCard key={index} />
      ))}
    </div>
  );
}

/* =====================================================
   FULL PAGE SKELETON
===================================================== */

function EAurixPageSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-sky-100 via-sky-150 to-cyan-100">
      {/* =========================================
          MOBILE PAGE CONTAINER
      ========================================= */}

      <div className="w-full space-y-4 pb-20">
        {/* =========================================
            HEADER / CATEGORIES
        ========================================= */}

        <section className="bg-sky-100">
          <div className="px-3 pt-3">
            {/* Header skeleton */}

            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <SkeletonBox className="h-4 w-28" />
                <SkeletonBox className="h-2.5 w-40" />
              </div>

              <SkeletonBox className="h-7 w-7 rounded-full" />
            </div>

            {/* Categories */}

            <div className="mt-3">
              <CategoriesSkeleton />
            </div>
          </div>
        </section>

        {/* =========================================
            FEATURED PRODUCTS
        ========================================= */}

        <section className="bg-sky-100 py-3">
          <FeaturedProductsSkeleton />
        </section>

        {/* =========================================
            LIVE SHOPS
        ========================================= */}

        <section className="bg-sky-100 py-3">
          <ShopLiveSkeleton />
        </section>

        {/* =========================================
            PRODUCTS HEADER
        ========================================= */}

        <section className="bg-sky-100 px-3 py-3">
          <div className="flex items-center justify-between">
            <div>
              <SkeletonBox className="h-4 w-32" />

              <div className="mt-1.5">
                <SkeletonBox className="h-2.5 w-24" />
              </div>
            </div>

            <SkeletonBox className="h-8 w-20 rounded-lg" />
          </div>
        </section>

        {/* =========================================
            PRODUCTS
        ========================================= */}

        <section className="bg-white px-3 py-3">
          <ProductsGridSkeleton count={8} />
        </section>
      </div>
    </div>
  );
}

/* =====================================================
   MAIN
===================================================== */

export function EAurixHome() {
  const { shops = [] } = useAdmin();

  const categoryRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [sort, setSort] = useState("latest");

  const { cart, addToCart } = usePlatform();

  const [products, setProducts] = useState<Product[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const PRODUCTS_PER_PAGE = 8;

  const [page, setPage] = useState(1);

  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState("");

  const hasHiddenFeatured = useRef(false);

  const [hideFeatured, setHideFeatured] = useState(false);

  /* =====================================================
     HIDE FEATURED ON SCROLL
  ===================================================== */

  useEffect(() => {
    const onScroll = () => {
      if (!hasHiddenFeatured.current && window.scrollY > 250) {
        hasHiddenFeatured.current = true;
        setHideFeatured(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* =====================================================
     RESET PAGINATION
  ===================================================== */

  useEffect(() => {
    setPage(1);
    setLoadingMore(false);
  }, [activeCategory, sort]);

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);

        const data = await getProducts();

        if (mounted) {
          setProducts(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

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
    let list = products.filter(
      (product) => !!product.shop_id && onlineShopIds.includes(product.shop_id),
    );

    /* Category */
    if (activeCategory) {
      list = list.filter((product) => product.category === activeCategory);
    }

    /* Search */
    if (search.trim()) {
      const query = search.trim().toLowerCase();

      list = list.filter((product) =>
        product.name.toLowerCase().includes(query),
      );
    }

    /* Sorting */
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
        break;
    }

    return list;
  }, [products, onlineShopIds, activeCategory, sort, search]);

  /* =====================================================
     FEATURED PRODUCTS
  ===================================================== */

  const featuredProducts = useMemo(() => {
    let list = products.filter(
      (product) => !!product.shop_id && onlineShopIds.includes(product.shop_id),
    );

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
        break;
    }

    return list;
  }, [products, onlineShopIds, sort]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const paginatedProducts = useMemo(() => {
    return visibleProducts.slice(0, page * PRODUCTS_PER_PAGE);
  }, [visibleProducts, page]);

  /* =====================================================
     LOAD MORE
  ===================================================== */

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
          }, 500);
        }
      },
      {
        rootMargin: "150px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [loadingMore, paginatedProducts.length, visibleProducts.length]);

  /* =====================================================
     CATEGORIES
  ===================================================== */

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
      icon: LayoutGrid,
    },

    ...productCategories.map((category) => ({
      id: category.id,
      name: category.label,
      image: category.image,
    })),
  ];

  /* =====================================================
     INITIAL LOADING
  ===================================================== */

  if (loading) {
    return <EAurixPageSkeleton />;
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="w-full space-y-5">
      {/* =================================================
          CATEGORIES
      ================================================= */}

      <CategoriesHeader
        loading={loading}
        sort={sort}
        setSort={setSort}
        sortLabels={sortLabels}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categoryRef={categoryRef}
        onOpenSidebar={() => setSidebarOpen(true)}
        products={products}
        search={search}
        setSearch={setSearch}
      />

      {/* =================================================
          SHOP LIVE
      ================================================= */}

      <ShopLive />

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <ProductsGrid
        loading={loading}
        sort={sort}
        setSort={setSort}
        sortLabels={sortLabels}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categoryRef={categoryRef}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        products={products}
        search={search}
        setSearch={setSearch}
        paginatedProducts={paginatedProducts}
        visibleProducts={visibleProducts}
        cart={cart}
        addToCart={addToCart}
        loadMoreRef={loadMoreRef}
      />

      {/* =================================================
          LOAD MORE SKELETON
      ================================================= */}

      <div ref={loadMoreRef} className="w-full">
        {loadingMore && <ProductsGridSkeleton count={4} />}
      </div>

      {/* =================================================
          NO MORE PRODUCTS
      ================================================= */}

      {!loadingMore &&
        paginatedProducts.length > 0 &&
        paginatedProducts.length >= visibleProducts.length && (
          <div className="py-5 text-center">
            <p className="text-xs text-gray-400">No more products</p>
          </div>
        )}
    </div>
  );
}
