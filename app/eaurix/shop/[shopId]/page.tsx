"use client";

import {
  useEffect,
  useMemo,
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
  Plus,
  Minus,
  X,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { EAurixCart } from "../../components/EAurixCart";

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

function getProductName(
  product: Product,
) {
  return product.name || "Product";
}

function getProductImage(
  product: Product,
) {
  return (
    product.image ||
    "/placeholder-product.png"
  );
}

function getProductPrice(
  product: Product,
) {
  const value = Number(
    product.price ?? 0,
  );

  return Number.isFinite(value)
    ? value
    : 0;
}

/* =========================================================
   SHOP IMAGE
========================================================= */

function ShopImage({
  shop,
}: {
  shop: Shop;
}) {
  const [imageError, setImageError] =
    useState(false);

  const [imageLoaded, setImageLoaded] =
    useState(false);

  const image = getImageUrl(
    shop.logo,
  );

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
        alt={
          shop.shop_name ||
          "Shop"
        }
        loading="eager"
        referrerPolicy="no-referrer"
        onLoad={() =>
          setImageLoaded(true)
        }
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        className={`relative h-full w-full object-cover transition-opacity duration-300 ${
          imageLoaded
            ? "opacity-100"
            : "opacity-0"
        }`}
      />
    </>
  );
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({
  product,
}: {
  product: Product;
}) {
  const [imageError, setImageError] =
    useState(false);

  const [imageLoaded, setImageLoaded] =
    useState(false);

  const image =
    getProductImage(product);

  if (!image || imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Package
            size={22}
            strokeWidth={1.6}
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
        alt={getProductName(product)}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() =>
          setImageLoaded(true)
        }
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        className={`h-full w-full object-cover transition duration-300 ${
          imageLoaded
            ? "opacity-100"
            : "opacity-0"
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
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <ProductSkeleton
              key={index}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const name =
    getProductName(product);

  const price =
    getProductPrice(product);

  const outOfStock =
    typeof product.stock ===
      "number" &&
    product.stock <= 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_9px_rgba(15,23,42,0.045)]">
      {/* IMAGE */}

      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <ProductImage
          product={product}
        />

        {/* CATEGORY */}

        {product.categoryLabel && (
          <span className="absolute left-2 top-2 max-w-[80%] truncate rounded-md bg-white/95 px-1.5 py-1 text-[7px] font-black uppercase text-slate-600 shadow-sm backdrop-blur">
            {product.categoryLabel}
          </span>
        )}

        {/* BADGE */}

        {product.badge && (
          <span className="absolute right-2 top-2 max-w-[70%] truncate rounded-md bg-emerald-600 px-1.5 py-1 text-[7px] font-black uppercase text-white shadow-sm">
            {product.badge}
          </span>
        )}

        {/* OUT OF STOCK */}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rounded-lg bg-white px-2 py-1 text-[9px] font-black text-red-600">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}

      <div className="p-2.5">
        <h3 className="line-clamp-2 min-h-8 text-[11px] font-extrabold leading-4 text-slate-900">
          {name}
        </h3>

        {product.brand && (
          <p className="mt-1 truncate text-[8px] font-semibold text-slate-400">
            {product.brand}
          </p>
        )}

        {product.unit && (
          <p className="mt-0.5 truncate text-[8px] font-semibold text-slate-400">
            Per {product.unit}
          </p>
        )}

        <div className="mt-2.5 flex items-end justify-between gap-2">
          {/* PRICE */}

          <div className="min-w-0">
            <p className="text-[14px] font-black leading-4 text-emerald-700">
              ₹
              {price.toLocaleString(
                "en-IN",
              )}
            </p>

            {product.originalPrice &&
              product.originalPrice >
                price && (
                <p className="mt-0.5 text-[8px] font-semibold text-slate-400 line-through">
                  ₹
                  {product.originalPrice.toLocaleString(
                    "en-IN",
                  )}
                </p>
              )}
          </div>

          {/* QUANTITY */}

          {quantity === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              disabled={outOfStock}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition active:scale-90 disabled:bg-slate-300"
            >
              <Plus
                size={16}
                strokeWidth={3}
              />
            </button>
          ) : (
            <div className="flex h-8 items-center overflow-hidden rounded-lg bg-emerald-600 text-white shadow-sm">
              <button
                type="button"
                onClick={onRemove}
                className="flex h-8 w-7 items-center justify-center active:bg-emerald-700"
              >
                <Minus
                  size={13}
                  strokeWidth={3}
                />
              </button>

              <span className="min-w-5 text-center text-[10px] font-black">
                {quantity}
              </span>

              <button
                type="button"
                onClick={onAdd}
                disabled={
                  typeof product.stock ===
                    "number" &&
                  product.stock > 0 &&
                  quantity >=
                    product.stock
                }
                className="flex h-8 w-7 items-center justify-center active:bg-emerald-700 disabled:opacity-40"
              >
                <Plus
                  size={13}
                  strokeWidth={3}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ShopProductsPage() {
  const router =
    useRouter();

  const params =
    useParams();

  const shopId =
    String(params.shopId);

  /* =======================================================
     GLOBAL CART
  ======================================================= */

  const {
    cart,
    addToCart,
    updateQty,
  } = usePlatform();

  const [shop, setShop] =
    useState<Shop | null>(
      null,
    );

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [cartOpen, setCartOpen] =
    useState(false);

  /* =======================================================
     LOAD SHOP
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadShop() {
      try {
        const data =
          await getShop(shopId);

        if (!mounted) return;

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

        const data =
          await getProducts(shopId);

        if (!mounted) return;

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
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return products;
      }

      return products.filter(
        (product) => {
          const name =
            String(
              product.name || "",
            ).toLowerCase();

          const category =
            String(
              product.categoryLabel ||
                product.category ||
                "",
            ).toLowerCase();

          const brand =
            String(
              product.brand || "",
            ).toLowerCase();

          const material =
            String(
              product.materialName ||
                "",
            ).toLowerCase();

          return (
            name.includes(query) ||
            category.includes(query) ||
            brand.includes(query) ||
            material.includes(query)
          );
        },
      );
    }, [
      products,
      search,
    ]);

  /* =======================================================
     PRODUCT QUANTITY FROM GLOBAL CART
  ======================================================= */

  const getProductQuantity = (
    productId: string,
  ) => {
    const item = cart.find(
      (cartItem) =>
        cartItem.productId ===
        productId,
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
    const productId =
      String(product.id);

    const currentQuantity =
      getProductQuantity(
        productId,
      );

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

    /* GLOBAL CART */

    addToCart({
      productId,

      name:
        product.name ||
        "Product",

      brand:
        product.brand || "",

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
        product.unit || "",
    });
  };

  /* =======================================================
     REMOVE / DECREASE PRODUCT
  ======================================================= */

  const removeProduct = (
    productId: string,
  ) => {
    const item = cart.find(
      (cartItem) =>
        cartItem.productId ===
        productId,
    );

    if (!item) return;

    updateQty(
      item.id,
      item.qty - 1,
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

  const shopImage =
    getImageUrl(shop.logo);

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
                <ShopImage
                  shop={shop}
                />
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

      <section className="px-3 pb-2 pt-5">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-black leading-5 text-slate-900">
              Shop Products
            </h2>

            <p className="mt-0.5 text-[9px] font-medium text-slate-500">
              {
                filteredProducts.length
              }{" "}
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
          PRODUCTS
      =================================================== */}

      <section className="px-3">
        {!filteredProducts.length ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              {search ? (
                <Search
                  size={23}
                  className="text-slate-400"
                />
              ) : (
                <Package
                  size={23}
                  className="text-slate-400"
                />
              )}
            </div>

            <h3 className="mt-4 text-sm font-black text-slate-800">
              {search
                ? "No products found"
                : "No products available"}
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              {search
                ? "Try another product name, brand or category."
                : "This shop has not added any products yet."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-black text-white active:scale-95"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={getProductQuantity(
                    String(
                      product.id,
                    ),
                  )}
                  onAdd={() =>
                    addProduct(
                      product,
                    )
                  }
                  onRemove={() =>
                    removeProduct(
                      String(
                        product.id,
                      ),
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </section>

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