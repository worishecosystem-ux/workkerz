"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Store,
  MapPin,
  BadgeCheck,
  Package,
  X,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { EAurixCart } from "../../components/EAurixCart";

import ProductsGrid from "../../components/shop/ProductsGrid";

import {
  getShop,
  type Shop,
} from "@/app/data/shops";

import {
  getProducts,
  type Product,
} from "@/app/data/products";

import { usePlatform } from "@/app/components/context/PlatformContext";

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(url?: string) {
  if (!url || !url.trim()) {
    return "";
  }

  return url.trim();
}

function getProductName(product: Product) {
  return product.name || "Product";
}

function getProductImage(product: Product) {
  return product.image || "/placeholder-product.png";
}

function getProductPrice(product: Product) {
  const value = Number(product.price ?? 0);

  return Number.isFinite(value) ? value : 0;
}

/* =========================================================
   SHOP IMAGE
========================================================= */

function ShopImage({
  shop,
}: {
  shop: Shop;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const image = getImageUrl(shop.logo);

  if (!image || imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
          <Store
            size={21}
            strokeWidth={1.7}
            className="text-slate-300"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {!imageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-100" />
      )}

      <img
        src={image}
        alt={shop.shop_name || "Shop"}
        loading="eager"
        referrerPolicy="no-referrer"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        className={`relative h-full w-full object-cover transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

/* =========================================================
   PRODUCT SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_9px_rgba(15,23,42,0.045)]">
      <div className="aspect-square animate-pulse bg-slate-100" />

      <div className="p-2.5">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-100" />

        <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />

        <div className="mt-3 flex items-center justify-between">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />

          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE SKELETON
========================================================= */

function ShopProductsSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white">
        <div className="pt-[max(env(safe-area-inset-top),10px)]">
          <div className="flex h-14 items-center gap-3 px-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />

            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />

              <div className="mt-1.5 h-2.5 w-20 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </header>

      <section className="bg-white px-3 pb-3 pt-3">
        <div className="overflow-hidden rounded-[20px] bg-slate-100">
          <div className="flex items-center gap-3 p-4">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-2.5 w-20 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="border-t border-slate-200/50 px-4 py-2.5">
            <div className="h-2.5 w-40 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </section>

      <section className="px-3 pt-1">
        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
      </section>

      <section className="px-3 pb-8 pt-5">
        <div className="mb-3">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

          <div className="mt-1.5 h-2.5 w-36 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ShopProductsPage() {
  const router = useRouter();

  const params = useParams();

  const shopId = String(params.shopId);

  /* =======================================================
     GLOBAL CART
  ======================================================= */

  const {
    cart,
    addToCart,
    updateQty,
  } = usePlatform();

  /* =======================================================
     SHOP
  ======================================================= */

  const [shop, setShop] = useState<Shop | null>(null);

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     PRODUCTS GRID STATE
  ======================================================= */

  const [sort, setSort] = useState("default");

  const [activeCategory, setActiveCategory] =
    useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /* =======================================================
     CART
  ======================================================= */

  const [cartOpen, setCartOpen] = useState(false);

  /* =======================================================
     SORT LABELS
  ======================================================= */

  const sortLabels: Record<string, string> = {
    default: "Recommended",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    rating: "Top Rated",
  };

  /* =======================================================
     LOAD SHOP
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadShop() {
      try {
        const data = await getShop(shopId);

        if (!mounted) {
          return;
        }

        setShop(data);
      } catch (error) {
        console.error(
          "Failed to load shop:",
          error,
        );

        if (mounted) {
          setShop(null);
        }
      }
    }

    if (shopId) {
      loadShop();
    }

    return () => {
      mounted = false;
    };
  }, [shopId]);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);

        const data = await getProducts(shopId);

        if (!mounted) {
          return;
        }

        setProducts(data);
      } catch (error) {
        console.error(
          "Products loading error:",
          error,
        );

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (shopId) {
      loadProducts();
    }

    return () => {
      mounted = false;
    };
  }, [shopId]);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
      }
    >();

    for (const product of products) {
      const categoryId = String(
        product.category ||
          product.categoryLabel ||
          "other",
      );

      const categoryName = String(
        product.categoryLabel ||
          product.category ||
          "Other",
      );

      if (!map.has(categoryId)) {
        map.set(categoryId, {
          id: categoryId,
          name: categoryName,
        });
      }
    }

    return Array.from(map.values());
  }, [products]);

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = [...products];

    /* CATEGORY */

    if (activeCategory) {
      result = result.filter((product) => {
        const category = String(
          product.category ||
            product.categoryLabel ||
            "other",
        );

        return category === activeCategory;
      });
    }

    /* SEARCH */

    if (query) {
      result = result.filter((product) => {
        const name = String(
          product.name || "",
        ).toLowerCase();

        const category = String(
          product.categoryLabel ||
            product.category ||
            "",
        ).toLowerCase();

        const brand = String(
          product.brand || "",
        ).toLowerCase();

        const material = String(
          product.materialName || "",
        ).toLowerCase();

        return (
          name.includes(query) ||
          category.includes(query) ||
          brand.includes(query) ||
          material.includes(query)
        );
      });
    }

    /* SORT */

    if (sort === "price_asc") {
      result.sort(
        (a, b) =>
          getProductPrice(a) -
          getProductPrice(b),
      );
    }

    if (sort === "price_desc") {
      result.sort(
        (a, b) =>
          getProductPrice(b) -
          getProductPrice(a),
      );
    }

    return result;
  }, [
    products,
    search,
    activeCategory,
    sort,
  ]);

  /* =======================================================
     PRODUCTS GRID DATA
  ======================================================= */

  const paginatedProducts =
    filteredProducts;

  const visibleProducts =
    filteredProducts;

  /* =======================================================
     PRODUCT QUANTITY
  ======================================================= */

  const getProductQuantity = (
    productId: string,
  ) => {
    const item = cart.find(
      (cartItem) =>
        cartItem.productId === productId &&
        !cartItem.variantId,
    );

    return item?.qty || 0;
  };

  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.qty || 0),
      0,
    );
  }, [cart]);

  /* =======================================================
     CART TOTAL
  ======================================================= */

  const cartTotal = useMemo(() => {
    return Number(
      cart
        .reduce(
          (total, item) =>
            total +
            Number(item.price || 0) *
              Number(item.qty || 0),
          0,
        )
        .toFixed(2),
    );
  }, [cart]);

  /* =======================================================
     ADD PRODUCT
  ======================================================= */

  const addProduct = (
    product: Product,
  ) => {
    const productId = String(
      product.id,
    );

    const currentQuantity =
      getProductQuantity(productId);

    /* STOCK CHECK */

    if (
      typeof product.stock ===
        "number" &&
      product.stock <= 0
    ) {
      return;
    }

    if (
      typeof product.stock ===
        "number" &&
      product.stock > 0 &&
      currentQuantity >=
        product.stock
    ) {
      return;
    }

    /* ADD TO GLOBAL CART */

    addToCart({
      productId,

      name:
        product.name ||
        "Product",

      brand:
        product.brand ||
        "",

      price:
        getProductPrice(
          product,
        ),

      qty: 1,

      icon:
        getProductImage(
          product,
        ),

      color:
        (product as any)
          .color ||
        "#10B981",

      unit:
        product.unit ||
        "",
    });
  };

  /* =======================================================
     REMOVE PRODUCT
  ======================================================= */

  const removeProduct = (
    productId: string,
  ) => {
    const item = cart.find(
      (cartItem) =>
        cartItem.productId ===
          productId &&
        !cartItem.variantId,
    );

    if (!item) {
      return;
    }

    updateQty(
      item.id,
      Math.max(
        0,
        Number(item.qty || 0) - 1,
      ),
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <ShopProductsSkeleton />
    );
  }

  /* =======================================================
     SHOP NOT FOUND
  ======================================================= */

  if (!shop) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f7] p-5">
        <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
            <Store
              size={25}
              className="text-slate-400"
            />
          </div>

          <h1 className="mt-4 text-sm font-black text-slate-900">
            Shop not found
          </h1>

          <p className="mt-1 text-[10px] text-slate-500">
            This shop may no longer be available.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/eaurix/shops",
              )
            }
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-[11px] font-black text-white active:scale-95"
          >
            View All Shops
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     SHOP IMAGE
  ======================================================= */

  const shopImage = getImageUrl(
    shop.logo,
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-24">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="pt-[max(env(safe-area-inset-top),8px)]">
          <div className="flex h-13 items-center gap-2.5 px-3">
            <button
              type="button"
              onClick={() =>
                router.back()
              }
              aria-label="Back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-700 transition active:scale-90"
            >
              <ArrowLeft
                size={18}
                strokeWidth={2.4}
              />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[14px] font-black leading-4 text-slate-900">
                {shop.shop_name}
              </h1>

              <p className="mt-0.5 truncate text-[8px] font-semibold text-slate-400">
                {shop.category ||
                  "Building Materials"}
              </p>
            </div>

            {/* HEADER CART */}

            <button
              type="button"
              aria-label="Cart"
              onClick={() =>
                setCartOpen(true)
              }
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 active:scale-90"
            >
              <ShoppingCart
                size={17}
              />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[7px] font-black text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================
          SHOP HERO
      =================================================== */}

      <section className="bg-white px-3 pb-3 pt-3">
        <div className="relative overflow-hidden rounded-[20px] bg-emerald-700 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-700 to-teal-900" />

          <div className="relative flex items-center gap-3 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 bg-white shadow-lg">
              {shopImage ? (
                <ShopImage shop={shop} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-50">
                  <Store
                    size={21}
                    className="text-slate-300"
                  />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-white">
              <div className="flex items-center gap-1">
                <h2 className="truncate text-[16px] font-black leading-5">
                  {shop.shop_name ||
                    "Shop"}
                </h2>

                {shop.status ===
                  "online" && (
                  <BadgeCheck
                    size={15}
                    strokeWidth={2.5}
                    className="shrink-0"
                  />
                )}
              </div>

              <p className="mt-1 truncate text-[9px] font-semibold text-emerald-100">
                {shop.category ||
                  "Building Materials"}
              </p>

              <div className="mt-2 flex items-center gap-1 text-[8px] font-semibold text-emerald-50">
                <MapPin
                  size={10}
                  className="shrink-0"
                />

                <span className="truncate">
                  {shop.city
                    ? `${shop.city}${
                        shop.state
                          ? `, ${shop.state}`
                          : ""
                      }`
                    : shop.address ||
                      "Nearby shop"}
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-1.5 border-t border-white/10 px-4 py-2.5">
            <span className="relative flex h-2 w-2">
              {shop.status ===
                "online" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
              )}

              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  shop.status ===
                  "online"
                    ? "bg-white"
                    : "bg-red-300"
                }`}
              />
            </span>

            <span className="text-[8px] font-black tracking-wide text-white">
              {shop.status ===
              "online"
                ? "SHOP ONLINE • READY FOR ORDERS"
                : "SHOP OFFLINE"}
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================
          SEARCH
      =================================================== */}

      <section className="px-3 pt-1">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            placeholder={`Search products in ${shop.shop_name}`}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-[11px] font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-90"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </section>

      {/* ===================================================
          PRODUCTS HEADER
      =================================================== */}

      <section className="px-3 pb-1 pt-5">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-black leading-5 text-slate-900">
              Shop Products
            </h2>

            <p className="mt-0.5 text-[9px] font-medium text-slate-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length ===
              1
                ? "product"
                : "products"}{" "}
              available
            </p>
          </div>

          {search && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700">
              Search active
            </span>
          )}
        </div>
      </section>

      {/* ===================================================
          PRODUCTS GRID
          
          USING ProductsGrid.tsx
      =================================================== */}

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
        products={filteredProducts as any}
        search={search}
        setSearch={setSearch}
        paginatedProducts={
          paginatedProducts as any
        }
        visibleProducts={
          visibleProducts as any
        }
        cart={cart}
        addToCart={addToCart}
        loadMoreRef={loadMoreRef}
      />

      {/* ===================================================
          CART BAR
      =================================================== */}

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold text-slate-400">
                {shop.shop_name}
              </p>

              <p className="text-[12px] font-black text-slate-900">
                {cartCount}{" "}
                {cartCount === 1
                  ? "item"
                  : "items"}{" "}
                • ₹
                {cartTotal.toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setCartOpen(true)
              }
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-[10px] font-black text-white shadow-sm active:scale-95"
            >
              View Cart

              <ShoppingCart
                size={13}
              />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          CART
      =================================================== */}

      {cartOpen && (
        <div className="fixed inset-0 z-[100] bg-white">
          <EAurixCart />
        </div>
      )}
    </main>
  );
}