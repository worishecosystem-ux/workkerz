"use client";

import FeaturedProducts from "./FeaturedProducts";
import { getProducts, type Product } from "@/app/data/products";
import { useAdmin } from "@/app/components/context/AdminContext";
import ProductsGrid from "./shop/ProductsGrid";
import ShopLive from "@/app/components/ShopLive";
import CategoriesHeader from "./shop/CategoriesHeader";

import { useMemo, useState, useEffect, useRef } from "react";

import { usePlatform } from "@/app/components/context/PlatformContext";
/* ===================================================== */

/* ===================================================== */
function ProductImage({ image, name }: { image?: string; name: string }) {
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("latest");
  const { cart, addToCart } = usePlatform();
  const [products, setProducts] = useState<Product[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const PRODUCTS_PER_PAGE = 2;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [showHeader, setShowHeader] = useState(false);
  const hasHiddenFeatured = useRef(false);
const [hideFeatured, setHideFeatured] = useState(false);

useEffect(() => {
  const onScroll = () => {
    setShowHeader(window.scrollY > 180);

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
    <div className="bg-[#F0F9FF]">
      <div
        className={`fixed inset-x-0 top-0 z-50 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600  pt-10 shadow-md transition-all duration-300 ${showHeader
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
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
      {!hideFeatured && (
        <FeaturedProducts products={featuredProducts} />
      )}
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
