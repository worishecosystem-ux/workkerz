"use client";

import Link from "next/link";
import { Eye, ShoppingCart } from "lucide-react";
import type { Dispatch, RefObject, SetStateAction } from "react";

import CategoriesHeader from "./CategoriesHeader";
import CategoriesDrawer from "./CategoriesDrawer";
import ProductImage from "./ProductImage";

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

    products: any[];

    search: string;
    setSearch: Dispatch<SetStateAction<string>>;

    paginatedProducts: any[];
    visibleProducts: any[];

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
    return (
        <>
            <div className="px-4 pt-3">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    {paginatedProducts.map((product) => {
                        const inCart = cart.some(
                            (item) => item.productId === product.id
                        );

                        return (
                            <div
                                key={product.id}
                                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                            >
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

                                    <div className="mt-3 flex gap-2">
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
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500" />
                    </div>
                </div>
            )}

        </>
    );
}