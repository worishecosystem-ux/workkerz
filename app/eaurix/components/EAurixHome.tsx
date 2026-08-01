"use client";

import FeaturedProducts from "./FeaturedProducts";
import { useAdmin } from "@/app/components/context/AdminContext";
import ProductsGrid from "./shop/ProductsGrid";
import ShopLive from "@/app/components/ShopLive";
import CategoriesHeader from "./shop/CategoriesHeader";
import EAurixHomeSkeleton from "./shop/EAurixHomeSkeleton";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  getProducts,
  productCategories,
  type Product,
} from "@/app/data/products";
import { usePlatform } from "@/app/components/context/PlatformContext";
/* ===================================================== */

/* ===================================================== */

export function EAurixHome() {
  const { shops = [] } = useAdmin();
  const categoryRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("latest");
  const { cart, addToCart } = usePlatform();
  const [products, setProducts] = useState<Product[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const PRODUCTS_PER_PAGE = 8;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const hasHiddenFeatured = useRef(false);
  const [hideFeatured, setHideFeatured] = useState(false);
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
    }

    return list;
  }, [products, onlineShopIds, sort]);

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
    return <EAurixHomeSkeleton />;
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
      image: "/categories/all-categories.png",
    },
    ...productCategories.map((category) => ({
      id: category.id,
      name: category.label,
      image: category.image,
    })),
  ];
  /* ===================================================== */

  return (
    <div className="bg-linear-to-br from-sky-100 via-sky-150 to-cyan-100">
      <div className="sticky top-0 z-50 bg-linear-to-br from-sky-100 via-sky-150 to-cyan-100  shadow-md">
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
      </div>
      <div className="pt-2 mb-1">
        <ShopLive />
      </div>
      {!hideFeatured && <FeaturedProducts products={featuredProducts} />}
      <div>
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
      </div>
    </div>
  );
}
