"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  Package,
  Plus,
  Minus,
  CheckCircle,
  Tag,
  ArrowRight,
} from "lucide-react";
import { productCategories } from "../../data/products";
import { usePlatform } from "@/app/components/context/PlatformContext";
import { useAdmin } from "@/app/components/context/AdminContext";

export function EAurixProduct() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { addToCart, cart } = usePlatform();
  const { getProductById, getRelatedProducts } = useAdmin();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = getProductById(id);
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>
            Product not found
          </h2>
          <Link href="/eaurix/shop" className="text-[#0EA5E9] text-sm">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelatedProducts(product);
  const catData = productCategories.find((c) => c.id === product.category);
  const inCart = cart.some((c) => c.productId === product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      qty,
      icon: product.icon,
      color: product.color,
      unit: product.unit,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      qty,
      icon: product.icon,
      color: product.color,
      unit: product.unit,
    });
    router.push("/eaurix/cart");
  };

  const badgeMap: Record<string, { label: string; cls: string }> = {
    popular: { label: "Popular", cls: "bg-orange-500" },
    sale: { label: "Sale", cls: "bg-rose-500" },
    new: { label: "New", cls: "bg-sky-500" },
    pro: { label: "Pro Choice", cls: "bg-violet-500" },
  };
  const badge = product.badge ? badgeMap[product.badge] : null;

  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-20 pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-[#64748B]">
          <Link href="/eaurix" className="hover:text-[#0EA5E9]">
            E-Aurix
          </Link>
          <span>/</span>
          <Link
            href={`/eaurix/shop?category=${product.category}`}
            className="hover:text-[#0EA5E9]"
          >
            {catData?.label}
          </Link>
          <span>/</span>
          <span
            className="text-[#0F172A] line-clamp-1"
            style={{ fontWeight: 500 }}
          >
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Product Visual */}
          <div>
            <div
              className="rounded-3xl h-80 flex items-center justify-center relative overflow-hidden shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${product.color} 0%, ${product.color}70 100%)`,
              }}
            >
              <span className="text-[8rem]">{product.icon}</span>
              {badge && (
                <div
                  className={`absolute top-4 left-4 text-white text-xs px-3 py-1 rounded-full ${badge.cls}`}
                  style={{ fontWeight: 700 }}
                >
                  {badge.label}
                </div>
              )}
              {discount > 0 && (
                <div
                  className="absolute top-4 right-4 bg-rose-500 text-white text-xs px-3 py-1 rounded-full"
                  style={{ fontWeight: 700 }}
                >
                  -{discount}% OFF
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                {
                  icon: Truck,
                  label: "Next-Day Delivery",
                  sub: "Order before 3PM",
                },
                {
                  icon: Shield,
                  label: "Quality Guarantee",
                  sub: "Trade-certified",
                },
                { icon: Package, label: "Easy Returns", sub: "30-day policy" },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.label}
                    className="bg-white border border-gray-100 rounded-xl p-3 text-center"
                  >
                    <Icon className="w-5 h-5 text-[#0EA5E9] mx-auto mb-1.5" />
                    <div
                      className="text-[#0F172A] text-xs"
                      style={{ fontWeight: 600 }}
                    >
                      {t.label}
                    </div>
                    <div className="text-[#94A3B8] text-[10px]">{t.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[#0EA5E9] text-xs px-2 py-0.5 bg-sky-50 border border-sky-200 rounded-full"
                style={{ fontWeight: 700 }}
              >
                {catData?.icon} {catData?.label}
              </span>
              <span className="text-[#64748B] text-xs">{product.brand}</span>
            </div>

            <h1
              className="text-[#0F172A] mb-2"
              style={{ fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.2 }}
            >
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                  />
                ))}
              </div>
              <span
                className="text-sm text-[#0F172A]"
                style={{ fontWeight: 600 }}
              >
                {product.rating}
              </span>
              <span className="text-sm text-[#64748B]">
                ({product.reviewCount} reviews)
              </span>
            </div>

            <p className="text-[#475569] text-sm mb-5 leading-relaxed">
              {product.longDescription}
            </p>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6 p-4 bg-white rounded-2xl border border-gray-100">
              <div>
                <span
                  className="text-[#0F172A]"
                  style={{ fontWeight: 900, fontSize: "2rem" }}
                >
                  ${product.price}
                </span>
                <span className="text-[#94A3B8] text-sm ml-2">
                  {product.unit}
                </span>
              </div>
              {product.originalPrice && (
                <div className="mb-1">
                  <div className="text-[#94A3B8] text-sm line-through">
                    ${product.originalPrice}
                  </div>
                  <div
                    className="text-rose-500 text-xs"
                    style={{ fontWeight: 700 }}
                  >
                    Save ${product.originalPrice - product.price}
                  </div>
                </div>
              )}
              <div className="ml-auto text-right">
                <div
                  className="flex items-center gap-1 text-emerald-600 text-xs"
                  style={{ fontWeight: 600 }}
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  In Stock ({product.stock}+ units)
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label
                className="block text-sm text-[#0F172A] mb-2"
                style={{ fontWeight: 600 }}
              >
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1.5">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4 text-[#64748B]" />
                  </button>
                  <span
                    className="w-10 text-center text-[#0F172A]"
                    style={{ fontWeight: 700 }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-8 h-8 rounded-lg bg-sky-50 hover:bg-sky-100 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#0EA5E9]" />
                  </button>
                </div>
                <span className="text-sm text-[#64748B]">
                  Subtotal:{" "}
                  <span className="text-[#0F172A]" style={{ fontWeight: 700 }}>
                    ${(product.price * qty).toFixed(2)}
                  </span>
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-xs bg-white border border-gray-100 text-[#475569] px-2.5 py-1 rounded-full"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {t}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm transition-all ${
                  added
                    ? "bg-emerald-500 text-white"
                    : inCart
                      ? "bg-sky-50 border-2 border-[#0EA5E9] text-[#0EA5E9]"
                      : "border-2 border-[#0EA5E9] text-[#0EA5E9] hover:bg-sky-50"
                }`}
                style={{ fontWeight: 700 }}
              >
                {added ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Added!
                  </>
                ) : inCart ? (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Update Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm bg-[#0EA5E9] hover:bg-[#0284C7] text-white transition-colors shadow-lg shadow-sky-200"
                style={{ fontWeight: 700 }}
              >
                Buy Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2
            className="text-[#0F172A] mb-5"
            style={{ fontWeight: 700, fontSize: "1.1rem" }}
          >
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0">
            {Object.entries(product.specs).map(([key, val], i) => (
              <div
                key={key}
                className={`flex items-start gap-4 py-3 sm:py-2.5 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "sm:pr-8" : "sm:pl-8 sm:border-l sm:border-b"}`}
              >
                <span
                  className="text-[#94A3B8] text-sm shrink-0 w-36"
                  style={{ fontWeight: 500 }}
                >
                  {key}
                </span>
                <span
                  className="text-[#0F172A] text-sm"
                  style={{ fontWeight: 600 }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2
              className="text-[#0F172A] mb-5"
              style={{ fontWeight: 700, fontSize: "1.1rem" }}
            >
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/eaurix/product/${p.id}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-sky-100 transition-all group"
                >
                  <div
                    className="h-24 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${p.color}, ${p.color}80)`,
                    }}
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {p.icon}
                    </span>
                  </div>
                  <div className="p-3">
                    <div
                      className="text-[10px] text-[#0EA5E9] mb-0.5"
                      style={{ fontWeight: 600 }}
                    >
                      {p.brand}
                    </div>
                    <div
                      className="text-[#0F172A] text-xs line-clamp-2 mb-1"
                      style={{ fontWeight: 600 }}
                    >
                      {p.name}
                    </div>
                    <div
                      className="text-[#0F172A] text-sm"
                      style={{ fontWeight: 800 }}
                    >
                      ${p.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
