"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Keyboard } from "@capacitor/keyboard";
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
  X,
  Mail,
  Eye,
  MapPin,
  FileText,
  Store,
} from "lucide-react";
import { productCategories } from "../../data/products";
import { usePlatform } from "@/app/components/context/PlatformContext";
import { useAdmin } from "@/app/components/context/AdminContext";
import { getShop } from "@/app/data/shops";
import ProductSearch from "./shop/ProductSearch";

export function EAurixProduct() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { addToCart, cart } = usePlatform();
  const { getProductById, getRelatedProducts, products } = useAdmin();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showBrochure, setShowBrochure] = useState(false);
  const product = getProductById(id);
  const [showShopDetails, setShowShopDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [shopData, setShopData] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    let showListener: Awaited<ReturnType<typeof Keyboard.addListener>>;
    let hideListener: Awaited<ReturnType<typeof Keyboard.addListener>>;

    const init = async () => {
      showListener = await Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardOpen(true);
      });

      hideListener = await Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardOpen(false);
      });
    };

    init();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [loadingShop, setLoadingShop] = useState(false);
  useEffect(() => {
    async function fetchShop() {
      try {
        if (!product?.shop_id) return;

        setLoadingShop(true);

        const data = await getShop(product.shop_id);

        setShopData(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingShop(false);
      }
    }

    fetchShop();
  }, [product]);
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>
            Product not found
          </h2>
          <Link href="/eaurix" className="text-[#0EA5E9] text-sm">
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
      icon: product.image || "",
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
      icon: product.image || "",
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
  const [showCartHint, setShowCartHint] = useState(false);

  const handleCartClick = () => {
    if (!inCart) {
      handleAddToCart();

      setShowCartHint(true);

      setTimeout(() => {
        setShowCartHint(false);
      }, 9000);

      return;
    }                                                

    // Already in cart → open cart
    router.push("/eaurix/cart"); // ya setCartOpen(true)
  };
  return (
    <>
      {showCartHint && (
        <div className="fixed bottom-24 left-1/2 z-9999 w-[92%] max-w-md -translate-x-1/2">
          <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>

              <span className="text-sm font-semibold whitespace-nowrap">
                Item added to cart
              </span>
            </div>

            {/* Right */}
            <button
              onClick={() => router.push("/eaurix/cart")}
              className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
            >
              Go to Cart
            </button>
          </div>
        </div>
      )}
      <div className="bg-linear-to-br from-sky-100 via-sky-150 to-cyan-100 pb-30">
        {/* Breadcrumb */}
        <div
          className={`fixed inset-x-0 top-0 z-50 overflow-visible border-b border-sky-200/50 bg-[linear-gradient(135deg,#020617_0%,#0F172A_25%,#1D4ED8_65%,#38BDF8_100%)] shadow-xl backdrop-blur-xl transition-all duration-300 ${
            isScrolled ? "px-5 pt-2 pb-1" : "px-5 pt-12 pb-5"
          }`}
        >
          <div
            className={`relative transition-all duration-300 ${
              isScrolled
                ? "opacity-0 -translate-y-3 pointer-events-none"
                : "opacity-100 translate-y-0 mt-2"
            }`}
          >
            <ProductSearch
              products={products}
              search={search}
              setSearch={setSearch}
            />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4  pt-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-1">
            <div>
              {/* INNER CARD */}
              <div
                className="relative h-90 rounded-[30px] overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${product.color} 0%, ${product.color}90 100%)`,
                }}
              >
                {/* SOFT GLOW */}
                <div
                  className="absolute w-70 h-70 rounded-full blur-3xl opacity-20"
                  style={{
                    background: "#fff",
                  }}
                />

                {/* PRODUCT IMAGE */}
                {product.image ? (
                  <div
                    className="
      relative z-10
      flex h-[88%] w-[88%]
      items-center justify-center
      rounded-3xl
      bg-white/15
      p-3
      shadow-[0_20px_40px_rgba(0,0,0,0.18)]
      backdrop-blur-sm
    "
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="
        h-full
        w-full
        rounded-2xl
        object-cover
        transition-all
        duration-500
        hover:scale-[1.02]
      "
                    />
                  </div>
                ) : (
                  <div
                    className="
      relative z-10
      flex h-52 w-52
      items-center justify-center
      rounded-3xl
      bg-white/30
      text-6xl
      font-bold
      text-white
    "
                  >
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* TRUST BADGES */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  {
                    icon: Truck,
                    label: "Next-Day Delivery",
                    sub: "Before 3PM",
                  },
                  {
                    icon: Shield,
                    label: "Quality",
                    sub: "Certified",
                  },
                  {
                    icon: Package,
                    label: "Returns",
                    sub: "5 Days",
                  },
                ].map((t) => {
                  const Icon = t.icon;

                  return (
                    <div
                      key={t.label}
                      className="
          rounded-xl
          border border-slate-100
          bg-white
          p-2
          text-center
          shadow-sm
        "
                    >
                      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                        <Icon className="h-4 w-4 text-sky-500" />
                      </div>

                      <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-slate-900">
                        {t.label}
                      </p>

                      <p className="mt-0.5 text-[9px] leading-tight text-slate-500">
                        {t.sub}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-2 mt-2 flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[18px] font-extrabold leading-tight text-slate-900">
                    {product.name}
                  </h1>

                  {product.brand && (
                    <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                      {product.brand}
                    </span>
                  )}
                </div>

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
                </div>
              </div>

              <p className="text-[#475569] text-sm mb-2 leading-relaxed">
                {product.longDescription}
              </p>

              {/* Price */}
              <div className="mb-2 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <span className="mb-1 text-xs text-slate-500">
                        / {product.unit}
                      </span>
                    </div>

                    {product.originalPrice && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-slate-400 line-through">
                          ₹{product.originalPrice}
                        </span>

                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                          Save ₹{product.originalPrice - product.price}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-full bg-emerald-50 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {product.stock}+ In Stock
                    </div>
                  </div>
                </div>
              </div>
              {/* Specs */}
              {product.specs &&
                Object.entries(product.specs).filter(
                  ([, value]) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== "",
                ).length > 0 && (
                  <div className="mb-3 rounded-2xl border border-gray-100 bg-white p-6">
                    <h2
                      className="mb-5 text-[#0F172A]"
                      style={{ fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      Technical Specifications
                    </h2>

                    <div className="grid grid-cols-1 gap-0 divide-y sm:grid-cols-2 sm:divide-y-0">
                      {Object.entries(product.specs)
                        .filter(
                          ([, value]) =>
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== "",
                        )
                        .map(([key, val], i) => (
                          <div
                            key={key}
                            className={`flex items-start gap-4 border-b border-gray-50 py-3 sm:py-2.5 last:border-0 ${
                              i % 2 === 0
                                ? "sm:pr-8"
                                : "sm:border-l sm:border-b sm:pl-8"
                            }`}
                          >
                            <span className="w-36 shrink-0 text-sm font-medium text-[#94A3B8]">
                              {key}
                            </span>

                            <span className="text-sm font-semibold text-[#0F172A]">
                              {String(val)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              {/* Tags */}
              {product.tags?.filter((tag) => tag?.trim()).length > 0 && (
                <div className="mb-6 flex flex-wrap gap-1.5">
                  {product.tags
                    .filter((tag) => tag?.trim())
                    .map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full border border-gray-100 bg-white px-2.5 py-1 text-xs text-[#475569]"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                </div>
              )}
              {/* ====================================================== */
              /* ORDER FULFILLED BY */
              /* ====================================================== */}

              {shopData && (
                <div className="mt-2 mb-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    {/* Left */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      {/* Logo */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white">
                        {shopData.logo ? (
                          <img
                            src={shopData.logo}
                            alt={shopData.shop_name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Store className="h-5 w-5 text-gray-400" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                          Fulfilled by
                        </p>

                        <h3 className="truncate text-[14px] font-bold text-slate-900">
                          {shopData.shop_name}
                        </h3>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => setShowShopDetails(true)}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl bg-gray-300 px-4 py-2 text-[11px] font-semibold text-black transition hover:bg-sky-600"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {/* Actions */}
              <div
                className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_-8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${
                  keyboardOpen
                    ? "translate-y-full opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100"
                }`}
              >
                <div className="grid grid-cols-2 gap-3 px-3 py-3 pb-[calc(env(safe-area-inset-bottom)+8px)] bg-gray-100">
                  {/* Add to Cart */}
                  <button
                    onClick={handleCartClick}
                    className={`relative flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98] ${
                      added
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : inCart
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {added ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        {inCart ? "View Cart" : "Add to Cart"}
                      </>
                    )}
                  </button>

                  {/* Buy Now */}
                  <button
                    onClick={handleBuyNow}
                    className="flex h-12 items-center justify-between rounded-xl bg-linear-to-r from-sky-600 to-cyan-500 px-4 text-white shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-white/80">
                        {qty} Item{qty > 1 ? "s" : ""}
                      </span>
                      <span className="text-sm font-bold">Buy Now</span>
                    </div>

                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {/* VIEW BROCHURE BUTTON */}
              {product.brochure && (
                <>
                  <button
                    onClick={() => setShowBrochure(true)}
                    className="
        w-full mt-4
        h-12
        rounded-2xl
        bg-white
        border border-gray-200
        hover:border-[#0EA5E9]
        hover:bg-sky-50
        text-[#0F172A]
        text-sm
        transition-all
      "
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    View Brochure
                  </button>

                  {/* POPUP */}
                  {showBrochure && (
                    <div className="fixed inset-0 z-100 bg-black/70 flex items-center justify-center p-4">
                      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl">
                        {/* HEADER */}
                        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-5">
                          <div>
                            <h2
                              className="text-[#0F172A] text-lg"
                              style={{ fontWeight: 800 }}
                            >
                              Product Brochure
                            </h2>

                            <p className="text-[#64748B] text-xs">
                              {product.name}
                            </p>
                          </div>

                          <button
                            onClick={() => setShowBrochure(false)}
                            className="
                w-10 h-10
                rounded-xl
                hover:bg-gray-100
                flex items-center justify-center
              "
                          >
                            <X className="w-5 h-5 text-[#64748B]" />
                          </button>
                        </div>

                        {/* PDF */}
                        <iframe
                          src={product.brochure}
                          className="w-full h-[calc(90vh-64px)]"
                          title="Brochure"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-slate-900">
                  Related Products
                </h2>

                <span className="text-[11px] text-slate-500">
                  {related.length} Products
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/eaurix/product/${p.id}`}
                    className="group w-35 shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-sky-300 hover:shadow-md"
                  >
                    {/* Image */}
                    <div
                      className="relative h-25 p-2"
                      style={{
                        background: `linear-gradient(135deg, ${p.color}15, ${p.color}35)`,
                      }}
                    >
                      <div
                        className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${p.color}, ${p.color}90)`,
                        }}
                      >
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-[88%] w-[88%] rounded-lg object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/30 text-lg font-bold text-white">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1 p-3">
                      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-sky-600">
                        {p.brand}
                      </p>

                      <h3 className="line-clamp-2 h-9 text-[13px] font-semibold leading-4 text-slate-900">
                        {p.name}
                      </h3>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[15px] font-bold text-slate-900">
                          ₹{p.price}
                        </span>

                        <div className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-600">
                          View
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
        {/* ====================================================== */
        /* SHOP DETAILS POPUP */
        /* ====================================================== */}

        {showShopDetails && shopData && (
          <div className="fixed inset-0 z-999 bg-black/70 backdrop-blur-md flex items-center justify-center p-3">
            <div className="relative w-full h-160 max-w-2xl bg-white rounded-[35px] overflow-hidden shadow-2xl flex flex-col">
              {/* CLOSE */}

              <button
                onClick={() => setShowShopDetails(false)}
                className="absolute top-5 right-5 z-50 w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              {/* BANNER */}

              <div className="relative h-50 bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600">
                {shopData.banner || shopData.logo ? (
                  <img
                    src={shopData.banner || shopData.logo}
                    alt={shopData.shop_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-24 h-24 text-white/40" />
                  </div>
                )}

                {/* OVERLAY */}

                <div className="absolute inset-0 bg-black/30" />

                {/* LOGO */}

                <div className="absolute -bottom-16 left-10">
                  <div className="w-20 h-20 rounded-[15px] bg-white border-2 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                    {shopData.logo ? (
                      <img
                        src={shopData.logo}
                        alt={shopData.shop_name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Store className="w-14 h-14 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* CONTENT */}

              <div className="flex-1 overflow-y-auto pt-14 px-4 pb-5 bg-[#F8FAFC] mt-2">
                {/* TOP */}

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h2 className="text-[26px] md:text-[30px] font-black text-[#0F172A] leading-tight">
                      {shopData.shop_name}
                    </h2>

                    <p className="text-[13px] text-gray-500 mt-1 font-semibold">
                      Owner : {shopData.owner_name}
                    </p>

                    {/* DETAILS */}

                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="px-3 py-2 rounded-xl bg-violet-50 border border-violet-100">
                        <h3 className="text-[12px] font-black text-violet-700 ">
                          Shop : {shopData.shop_uid || "N/A"}
                        </h3>
                      </div>

                      <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                        <h3 className="text-[12px] font-black text-emerald-700 mt-0.5">
                          Registration Date :{" "}
                          {shopData.joined_date
                            ? new Date(shopData.joined_date).toLocaleDateString(
                                "en-GB",
                              )
                            : "-"}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        shopData.status === "online"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {shopData.status}
                    </span>
                  </div>
                </div>

                {/* INFO */}

                <div className="grid md:grid-cols-2 gap-3 mt-5">
                  {[
                    {
                      icon: Package,
                      title: "Category",
                      value: `${shopData.category || "-"}`,
                      color: "text-orange-500",
                      bg: "bg-orange-100",
                    },

                    {
                      icon: MapPin,
                      title: "Location",
                      value: `${shopData.city || ""} ${shopData.state || ""}`,
                      color: "text-green-500",
                      bg: "bg-green-100",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
                        >
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>

                        <p className="text-[13px] text-gray-700 wrap-break-word leading-relaxed">
                          <span className="font-black text-[#0F172A]">
                            {item.title} :
                          </span>{" "}
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* ADDRESS */}

                  <div className="md:col-span-2 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                        <Store className="w-4 h-4 text-violet-500" />
                      </div>

                      <h3 className="font-black text-[12px] text-[#0F172A]">
                        Address : {shopData.address || "-"}
                      </h3>
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="md:col-span-2 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-cyan-500" />
                      </div>

                      <h3 className="font-black text-[12px] text-[#0F172A]">
                        Description : {shopData.description || "-"}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
