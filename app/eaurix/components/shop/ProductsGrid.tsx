"use client";

import Link from "next/link";
import { Eye, ShoppingCart, ChevronRight } from "lucide-react";
import {
  useMemo,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import ProductImage from "./ProductImage";

interface ProductVariant {
  id: string;
  productId?: string;
  variantName: string;
  watt?: number | null;
  price: number;
  originalPrice?: number | null;
  stock: number;
  sku?: string | null;
  unit?: string | null;
  specs?: Record<string, unknown>;
  image?: string;
  images?: string[];
  isActive: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  color?: string;
  unit?: string;
  category?: string;
  variants?: ProductVariant[];
  hasVariants?: boolean;
  stock?: number;
}

interface ProductsGridProps {
  loading: boolean;

  sort: string;
  setSort: Dispatch<SetStateAction<string>>;

  sortLabels: Record<string, string>;

  categories: any[];

  activeCategory: string | null;
  setActiveCategory: Dispatch<SetStateAction<string | null>>;

  categoryRef: RefObject<HTMLDivElement | null>;

  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;

  products: ProductItem[];

  search: string;
  setSearch: Dispatch<SetStateAction<string>>;

  paginatedProducts: ProductItem[];
  visibleProducts: ProductItem[];

  cart: any[];

  addToCart: (item: any) => void;

  loadMoreRef: RefObject<HTMLDivElement | null>;
}

export default function ProductsGrid({
  loading,
  sort,
  setSort,
  sortLabels,
  categories,
  activeCategory,
  setActiveCategory,
  categoryRef,
  sidebarOpen,
  setSidebarOpen,
  products,
  search,
  setSearch,
  paginatedProducts,
  visibleProducts,
  cart,
  addToCart,
  loadMoreRef,
}: ProductsGridProps) {
  /* =====================================================
     MIX PRODUCTS BY CATEGORY
     
     IMPORTANT:
     Only paginated products are mixed.
  ===================================================== */

  const mixedTopProducts = useMemo(() => {
    if (activeCategory) {
      return paginatedProducts;
    }

    const grouped = new Map<string, ProductItem[]>();

    for (const product of paginatedProducts) {
      const category = product.category ?? "other";

      if (!grouped.has(category)) {
        grouped.set(category, []);
      }

      grouped.get(category)!.push(product);
    }

    const result: ProductItem[] = [];
    const groups = Array.from(grouped.values());

    let added = true;

    while (added) {
      added = false;

      for (const group of groups) {
        if (group.length > 0) {
          result.push(group.shift()!);
          added = true;
        }
      }
    }

    return result;
  }, [paginatedProducts, activeCategory]);

  /* =====================================================
     ACTIVE VARIANTS
  ===================================================== */

  function getActiveVariants(product: ProductItem) {
    return Array.isArray(product.variants)
      ? product.variants.filter(
          (variant) => variant && variant.isActive,
        )
      : [];
  }

  /* =====================================================
     DISPLAY PRICE
     
     If variants exist:
     show the lowest active variant price.
  ===================================================== */

  function getDisplayPrice(product: ProductItem) {
    const variants = getActiveVariants(product);

    if (variants.length > 0) {
      return Math.min(
        ...variants.map(
          (variant) => Number(variant.price) || 0,
        ),
      );
    }

    return Number(product.price) || 0;
  }

  /* =====================================================
     VARIANT COUNT
  ===================================================== */

  function getVariantCount(product: ProductItem) {
    return getActiveVariants(product).length;
  }

  return (
    <>
      <div className="px-4 pb-8">
        {/* =================================================
            NO PRODUCTS
        ================================================= */}

        {activeCategory &&
          !loading &&
          visibleProducts.length === 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg">
                📦
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-[12px] font-bold leading-4 text-slate-900">
                  No Products Found
                </h2>

                <p className="truncate text-[9px] leading-3.5 text-slate-500">
                  {categories.find(
                    (c) => c.id === activeCategory,
                  )?.name}{" "}
                  products coming soon.
                </p>
              </div>

              <button
                onClick={() => setActiveCategory(null)}
                className="shrink-0 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[9px] font-bold text-white active:scale-95"
              >
                View All
              </button>
            </div>
          )}

        {/* =================================================
            PRODUCTS GRID
        ================================================= */}

        {visibleProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pb-10 md:grid-cols-4 md:gap-4">
            {mixedTopProducts.map((product) => {
              const activeVariants =
                getActiveVariants(product);

              const hasVariants =
                activeVariants.length > 0;

              const displayPrice =
                getDisplayPrice(product);

              /*
               * Product-level cart item.
               *
               * Variant products are NOT considered
               * product-level cart items.
               */
              const inCart = cart.some(
                (item) =>
                  item.productId === product.id &&
                  !item.variantId,
              );

              const productUrl =
                `/eaurix/product/${product.id}`;

              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  {/* =================================================
                      PRODUCT IMAGE
                  ================================================= */}

                  <Link href={productUrl}>
                    <div className="relative overflow-hidden">
                      <div className="p-2">
                        <div className="h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:h-64">
                          {product.image ? (
                            <ProductImage
                              image={product.image}
                              name={product.name}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 px-3 text-center">
                              <span className="line-clamp-3 text-sm font-bold text-slate-700 md:text-lg">
                                {product.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BRAND */}

                      {product.brand && (
                        <span className="absolute right-2 top-2 max-w-[45%] truncate rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-medium text-white md:text-[10px]">
                          {product.brand}
                        </span>
                      )}

                      {/* VARIANT COUNT */}

                      {hasVariants && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold text-slate-800 shadow-sm">
                          {activeVariants.length}{" "}
                          {activeVariants.length === 1
                            ? "Option"
                            : "Options"}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* =================================================
                      PRODUCT DETAILS
                  ================================================= */}

                  <div className="p-2 md:p-3">
                    <Link href={productUrl}>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 flex-1 text-xs font-semibold text-slate-900 md:text-sm">
                          {product.name}
                        </h3>

                        <span className="shrink-0 text-sm font-bold text-emerald-600 md:text-lg">
                          ₹{displayPrice}
                        </span>
                      </div>
                    </Link>

                    {/* =================================================
                        VARIANT PREVIEW
                    ================================================= */}

                    {hasVariants && (
                      <Link
                        href={productUrl}
                        className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <div className="min-w-0">
                          <p className="text-[9px] font-medium text-slate-500">
                            Available options
                          </p>

                          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-800">
                            {activeVariants
                              .slice(0, 3)
                              .map(
                                (variant) =>
                                  variant.variantName,
                              )
                              .join(" • ")}

                            {activeVariants.length > 3 &&
                              ` +${
                                activeVariants.length - 3
                              }`}
                          </p>
                        </div>

                        <ChevronRight
                          size={14}
                          className="shrink-0 text-slate-400"
                        />
                      </Link>
                    )}

                    {/* =================================================
                        CART + VIEW
                    ================================================= */}

                    <div className="mt-3 flex gap-2">
                      {hasVariants ? (
                        /*
                         * Variant products:
                         * Don't add directly to cart.
                         * Open product page to select option.
                         */
                        <Link
                          href={productUrl}
                          className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                        >
                          <ShoppingCart size={13} />
                          <span>Select Option</span>
                        </Link>
                      ) : (
                        /*
                         * Normal products:
                         * Add directly to cart.
                         */
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!inCart) {
                              addToCart({
                                productId: product.id,
                                name: product.name,
                                brand: product.brand,
                                price: displayPrice,
                                qty: 1,
                                icon:
                                  product.image || "",
                                color:
                                  product.color ??
                                  "#10b981",
                                unit:
                                  product.unit ??
                                  "pcs",
                              });
                            }
                          }}
                          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-95 ${
                            inCart
                              ? "bg-black text-white"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                          }`}
                        >
                          <ShoppingCart
                            size={16}
                            className={
                              inCart
                                ? "fill-white"
                                : ""
                            }
                          />
                        </button>
                      )}

                      {/* VIEW BUTTON */}

                      <Link
                        href={productUrl}
                        className={`flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-500 px-2 text-[11px] font-semibold text-white transition-all hover:bg-emerald-600 active:scale-95 ${
                          hasVariants
                            ? "w-20"
                            : "flex-1"
                        }`}
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
        )}

        {/* =================================================
            FEW PRODUCTS MESSAGE
        ================================================= */}

        {activeCategory &&
          visibleProducts.length > 0 &&
          visibleProducts.length < 6 && (
            <div className="mx-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  📦
                </div>

                <h2 className="text-base font-semibold text-slate-900">
                  More Products Coming Soon
                </h2>
              </div>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Only {visibleProducts.length} product
                {visibleProducts.length !== 1
                  ? "s are"
                  : " is"}{" "}
                available in{" "}
                {
                  categories.find(
                    (c) => c.id === activeCategory,
                  )?.name
                }{" "}
                category.
              </p>

              <button
                onClick={() => setActiveCategory(null)}
                className="mt-4 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Visit Again Soon
              </button>
            </div>
          )}
      </div>

      {/* =====================================================
          LOAD MORE
      ===================================================== */}

      {visibleProducts.length > 0 &&
        paginatedProducts.length <
          visibleProducts.length && (
          <div
            ref={loadMoreRef}
            className="flex h-20 items-center justify-center"
          >
            <div className="flex gap-2">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500" />
            </div>
          </div>
        )}
    </>
  );
}