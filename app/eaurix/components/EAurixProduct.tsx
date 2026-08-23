"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Keyboard } from "@capacitor/keyboard";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Eye,
  FileText,
  MapPin,
  Package,
  Ruler,
  ShoppingCart,
  ShieldCheck,
  Star,
  Store,
  Tag,
  Truck,
  X,
  Zap,
} from "lucide-react";

import {
  productCategories,
  type Product,
  type ProductVariant,
} from "../../data/products";

import { usePlatform } from "@/app/components/context/PlatformContext";
import { useAdmin } from "@/app/components/context/AdminContext";
import { getShop } from "@/app/data/shops";

import ProductSearch from "./shop/ProductSearch";

/* =========================================================
   COMPONENT
========================================================= */

export function EAurixProduct() {
  /* =========================================================
     ROUTER
  ========================================================= */

  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : String(params?.id || "");

  /* =========================================================
     CONTEXT
  ========================================================= */

  const { addToCart, cart } = usePlatform();

  const { getProductById, getRelatedProducts, products } = useAdmin();

  /* =========================================================
     PRODUCT STATE
  ========================================================= */

  const [product, setProduct] = useState<Product | null>(null);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  /* =========================================================
     LOADING
  ========================================================= */

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [loadingShop, setLoadingShop] = useState(false);

  /* =========================================================
     UI STATE
  ========================================================= */

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showCartHint, setShowCartHint] = useState(false);

  const [showImage, setShowImage] = useState(false);
  const [showBrochure, setShowBrochure] = useState(false);
  const [showShopDetails, setShowShopDetails] = useState(false);

  const [shopData, setShopData] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!id) {
        setProduct(null);
        setLoadingProduct(false);
        return;
      }

      try {
        setLoadingProduct(true);

        const result = await getProductById(id);

        if (!cancelled) {
          setProduct(result || null);
        }
      } catch (error) {
        console.error("EAURIX PRODUCT LOAD ERROR:", error);

        if (!cancelled) {
          setProduct(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingProduct(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     SELECT FIRST ACTIVE VARIANT
  ========================================================= */

  useEffect(() => {
    if (!product) {
      setSelectedVariant(null);
      return;
    }

    const variants = Array.isArray(product.variants)
      ? product.variants.filter((variant) => variant.isActive)
      : [];

    if (variants.length === 0) {
      setSelectedVariant(null);
      return;
    }

    setSelectedVariant(variants[0]);
    setQty(1);
  }, [product]);

  /* =========================================================
     LOAD RELATED PRODUCTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadRelated() {
      if (!product) {
        setRelatedProducts([]);
        return;
      }

      try {
        setLoadingRelated(true);

        const result = await getRelatedProducts(product);

        if (!cancelled) {
          setRelatedProducts(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        console.error("RELATED PRODUCTS ERROR:", error);

        if (!cancelled) {
          setRelatedProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRelated(false);
        }
      }
    }

    loadRelated();

    return () => {
      cancelled = true;
    };
  }, [product]);

  /* =========================================================
     LOAD SHOP
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadShop() {
      const shopId = product?.shop_id;

      if (!shopId) {
        setShopData(null);
        setLoadingShop(false);
        return;
      }

      try {
        setLoadingShop(true);

        const result = await getShop(shopId);

        if (!cancelled) {
          setShopData(result || null);
        }
      } catch (error) {
        console.error("SHOP LOAD ERROR:", error);

        if (!cancelled) {
          setShopData(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingShop(false);
        }
      }
    }

    loadShop();

    return () => {
      cancelled = true;
    };
  }, [product?.shop_id]);

  /* =========================================================
     KEYBOARD
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    let showListener: Awaited<ReturnType<typeof Keyboard.addListener>> | null =
      null;

    let hideListener: Awaited<ReturnType<typeof Keyboard.addListener>> | null =
      null;

    async function setupKeyboard() {
      try {
        const show = await Keyboard.addListener("keyboardDidShow", () => {
          if (mounted) {
            setKeyboardOpen(true);
          }
        });

        const hide = await Keyboard.addListener("keyboardDidHide", () => {
          if (mounted) {
            setKeyboardOpen(false);
          }
        });

        if (!mounted) {
          show.remove();
          hide.remove();
          return;
        }

        showListener = show;
        hideListener = hide;
      } catch (error) {
        console.warn("KEYBOARD LISTENER ERROR:", error);
      }
    }

    setupKeyboard();

    return () => {
      mounted = false;

      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  /* =========================================================
     SCROLL
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 70);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     ACTIVE VARIANTS
  ========================================================= */

  const activeVariants = useMemo(() => {
    if (!product?.variants) {
      return [];
    }

    return product.variants.filter((variant) => variant.isActive);
  }, [product]);

  /* =========================================================
     DISPLAY DATA
  ========================================================= */

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;

  const displayOriginalPrice =
    selectedVariant?.originalPrice ?? product?.originalPrice ?? null;

  const displayStock = selectedVariant?.stock ?? product?.stock ?? 0;

  const displayUnit = selectedVariant?.unit || product?.unit || "";

  const displayImage = selectedVariant?.image || product?.image || "";

  const variantDiscount =
    displayOriginalPrice && displayOriginalPrice > displayPrice
      ? Math.round((1 - displayPrice / displayOriginalPrice) * 100)
      : 0;

  const savings =
    displayOriginalPrice && displayOriginalPrice > displayPrice
      ? displayOriginalPrice - displayPrice
      : 0;

  /* =========================================================
     CATEGORY
  ========================================================= */

  const categoryData = useMemo(() => {
    if (!product) {
      return null;
    }

    return (
      productCategories.find((item) => item.id === product.category) || null
    );
  }, [product]);

  /* =========================================================
     CART STATE
  ========================================================= */

  const inCart = useMemo(() => {
    if (!product) {
      return false;
    }

    return cart.some((item) => item.productId === product.id);
  }, [cart, product]);

  /* =========================================================
     SPECS
  ========================================================= */

  const technicalSpecs = useMemo(() => {
    if (!product?.specs) {
      return [];
    }

    return Object.entries(product.specs).filter(
      ([, value]) =>
        value !== null && value !== undefined && String(value).trim() !== "",
    );
  }, [product]);

  const measurementEntries = useMemo(() => {
    if (!product?.specs) {
      return [];
    }

    return Object.entries(product.specs).filter(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        return false;
      }

      return /size|dimension|length|width|height|weight|thickness|diameter|capacity|volume|depth|breadth|measurement|gauge|mm|cm|inch|ft|kg|gram|litre|liter/i.test(
        key,
      );
    });
  }, [product]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const cleanLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addCurrentProductToCart = () => {
    if (!product) {
      return;
    }

    const variantName = selectedVariant?.variantName || "";

    const finalName = variantName
      ? `${product.name} - ${variantName}`
      : product.name;

    addToCart({
      productId: product.id,
      name: finalName,
      brand: product.brand,
      price: displayPrice,
      qty,
      icon: displayImage,
      color: product.color,
      unit: displayUnit,
    });
  };

  /* =========================================================
     ADD CART
  ========================================================= */

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (activeVariants.length > 0 && !selectedVariant) {
      return;
    }

    if (displayStock <= 0) {
      return;
    }

    addCurrentProductToCart();

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  /* =========================================================
     BUY NOW
  ========================================================= */

  const handleBuyNow = () => {
    if (!product) {
      return;
    }

    if (displayStock <= 0) {
      return;
    }

    addCurrentProductToCart();

    router.push("/eaurix/cart");
  };

  /* =========================================================
     CART BUTTON
  ========================================================= */

  const handleCartClick = () => {
    if (!product) {
      return;
    }

    if (inCart) {
      router.push("/eaurix/cart");
      return;
    }

    handleAddToCart();

    setShowCartHint(true);

    window.setTimeout(() => {
      setShowCartHint(false);
    }, 8000);
  };

  /* =========================================================
     QUANTITY
  ========================================================= */

  const decreaseQty = () => {
    setQty((value) => Math.max(1, value - 1));
  };

  const increaseQty = () => {
    if (displayStock <= 0) {
      return;
    }

    setQty((value) => Math.min(displayStock, value + 1));
  };

  /* =========================================================
     BADGE
  ========================================================= */

  const badgeMap: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    popular: {
      label: "Popular",
      className: "bg-orange-500",
    },

    sale: {
      label: "Sale",
      className: "bg-rose-500",
    },

    new: {
      label: "New",
      className: "bg-sky-500",
    },

    pro: {
      label: "Pro Choice",
      className: "bg-violet-500",
    },
  };

  const badge = product?.badge ? badgeMap[product.badge] : null;

  /* =========================================================
     LOADING UI
  ========================================================= */

  if (loadingProduct) {
    return <ProductPageSkeleton />;
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            🔍
          </div>

          <h2 className="text-lg font-black text-slate-900">
            Product not found
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            This product may have been removed or is no longer available.
          </p>

          <Link
            href="/eaurix"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-sky-600 px-5 text-xs font-bold text-white"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <>
      {/* =====================================================
          CART HINT
      ===================================================== */}

      {showCartHint && (
        <div className="fixed bottom-24 left-1/2 z-9999 w-[calc(100%-24px)] max-w-md -translate-x-1/2">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950 px-3 py-3 text-white shadow-2xl">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold">Added to cart</p>

                {selectedVariant && (
                  <p className="truncate text-[9px] text-slate-400">
                    {selectedVariant.variantName}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/eaurix/cart")}
              className="shrink-0 rounded-xl bg-emerald-500 px-3 py-2 text-[10px] font-bold"
            >
              Go to Cart
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="min-h-screen bg-linear-to-br from-sky-100 via-sky-50 to-cyan-100 pb-32">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className={`fixed inset-x-0 top-0 z-50 border-b border-sky-200/60 bg-linear-to-br from-sky-100 via-sky-50 to-cyan-100 shadow-lg backdrop-blur-xl transition-all duration-300 ${
            isScrolled ? "px-3 pb-2 pt-2" : "px-3 pb-4 pt-10"
          }`}
        >
          <div className="mx-auto max-w-5xl">
            <div
              className={`transition-all duration-300 ${
                isScrolled
                  ? "pointer-events-none max-h-0 -translate-y-3 overflow-hidden opacity-0"
                  : "max-h-20 translate-y-0 opacity-100"
              }`}
            >
              <ProductSearch
                products={products || []}
                search={search}
                setSearch={setSearch}
              />
            </div>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="mx-auto max-w-6xl px-3 pt-28 sm:px-5 sm:pt-32 lg:px-6">
          {/* BACK */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="min-w-0">
              {/* PRODUCT IMAGE */}
              <div className="relative h-77.5 overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm sm:h-105">
                {displayImage ? (
                  <button
                    type="button"
                    onClick={() => setShowImage(true)}
                    className="relative h-full w-full overflow-hidden"
                  >
                    <img
                      src={displayImage}
                      alt={
                        selectedVariant
                          ? `${product.name} ${selectedVariant.variantName}`
                          : product.name
                      }
                      className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                    />

                    {/* IMAGE BORDER */}
                    <span className="pointer-events-none absolute inset-0 rounded-3xl border border-black/10" />

                    {/* VIEW */}
                    <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[9px] font-bold text-white backdrop-blur-md">
                      <Eye className="h-3 w-3" />
                      View
                    </span>
                  </button>
                ) : (
                  /* NO IMAGE — SAME BOX + BORDER */
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background:
                        product.color || categoryData?.color || "#F8FAFC",
                    }}
                  >
                    <div className="flex h-[78%] w-[78%] items-center justify-center rounded-[20px] border border-white/50 bg-white/20 text-7xl font-black text-white">
                      {product.name.charAt(0)}
                    </div>
                  </div>
                )}

                {/* STOCK BADGE */}
                <div
                  className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[9px] font-black shadow-sm backdrop-blur-md ${
                    displayStock > 0
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {displayStock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                </div>
              </div>

              {/* VARIANT THUMBNAILS */}
              {activeVariants.length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {activeVariants.map((variant) => {
                    const selected = selectedVariant?.id === variant.id;
                    const outOfStock = Number(variant.stock) <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setQty(1);
                        }}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                          selected
                            ? "border-orange-500 ring-2 ring-orange-100"
                            : "border-gray-200"
                        } ${outOfStock ? "opacity-40" : ""}`}
                      >
                        {variant.image ? (
                          <img
                            src={variant.image}
                            alt={variant.variantName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-full w-full items-center justify-center text-[9px] font-bold ${
                              selected
                                ? "bg-orange-50 text-orange-600"
                                : "bg-sky-50 text-sky-600"
                            }`}
                          >
                            {variant.variantName.slice(0, 5)}
                          </div>
                        )}

                        {selected && (
                          <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-tl-md bg-orange-500">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TRUST */}
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <TrustCard
                  icon={Truck}
                  title="Fast Delivery"
                  subtitle="Next Day"
                />

                <TrustCard
                  icon={ShieldCheck}
                  title="Quality"
                  subtitle="Verified"
                />

                <TrustCard icon={Package} title="Returns" subtitle="5 Days" />
              </div>
            </div>

            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="min-w-0">
              {/* TITLE */}

              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    {badge && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase text-white ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    )}

                    {product.brand && (
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wide text-sky-700">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  <h1 className="text-[20px] font-black leading-tight tracking-tight text-slate-950 sm:text-[25px]">
                    {product.name}
                  </h1>
                </div>

                <div className="shrink-0 rounded-xl border border-amber-100 bg-amber-50 px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

                    <span className="text-[11px] font-black text-slate-900">
                      {product.rating}
                    </span>
                  </div>

                  <p className="text-[7px] text-slate-500">
                    {product.reviewCount} reviews
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}

              {product.longDescription && (
                <p className="mb-3 text-[11px] leading-5 text-slate-600 sm:text-xs">
                  {product.longDescription}
                </p>
              )}

              {/* =================================================
                  AMAZON STYLE VARIANT SELECTOR
              ================================================= */}

              {activeVariants.length > 0 && (
                <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* HEADER */}

                  <div className="border-b border-slate-100 px-3.5 py-3 sm:px-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-orange-500" />

                          <h2 className="text-[14px] font-black text-slate-900">
                            Select Variant
                          </h2>
                        </div>

                        <p className="mt-0.5 text-[9px] text-slate-500">
                          Choose your preferred option
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black text-slate-600">
                        {activeVariants.length} options
                      </span>
                    </div>
                  </div>

                  {/* OPTIONS */}

                  <div className="p-3 sm:p-4">
                    <div className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1">
                      {activeVariants.map((variant) => {
                        const selected = selectedVariant?.id === variant.id;

                        const outOfStock = Number(variant.stock) <= 0;

                        const variantSave =
                          variant.originalPrice &&
                          variant.originalPrice > variant.price
                            ? Math.round(
                                (1 - variant.price / variant.originalPrice) *
                                  100,
                              )
                            : 0;

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            disabled={outOfStock}
                            onClick={() => {
                              setSelectedVariant(variant);
                              setQty(1);
                            }}
                            className={`
                              relative min-w-[126px]
                              shrink-0 overflow-hidden
                              rounded-xl border-2
                              px-3 py-2.5
                              text-left
                              transition-all duration-150
                              active:scale-[0.98]
                              ${
                                selected
                                  ? "border-orange-500 bg-orange-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-orange-300"
                              }
                              ${
                                outOfStock
                                  ? "cursor-not-allowed opacity-45"
                                  : "cursor-pointer"
                              }
                            `}
                          >
                            {/* SELECTED */}

                            {selected && (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 shadow-sm">
                                <Check className="h-3 w-3 text-white" />
                              </span>
                            )}

                            {/* IMAGE */}

                            {variant.image ? (
                              <div className="mb-2 h-16 w-full overflow-hidden rounded-lg bg-white">
                                <img
                                  src={variant.image}
                                  alt={variant.variantName}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`
                                  mb-2 flex h-16 w-full
                                  items-center justify-center
                                  rounded-lg
                                  text-[10px] font-black
                                  ${
                                    selected
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-slate-100 text-slate-600"
                                  }
                                `}
                              >
                                <span className="line-clamp-2 px-2 text-center">
                                  {variant.variantName}
                                </span>
                              </div>
                            )}

                            {/* NAME */}

                            <p className="line-clamp-2 min-h-[30px] pr-5 text-[11px] font-black leading-4 text-slate-900">
                              {variant.variantName}
                            </p>

                            {/* WATT */}

                            {variant.watt !== null &&
                              variant.watt !== undefined && (
                                <span className="mt-1 inline-flex rounded-md bg-violet-50 px-1.5 py-0.5 text-[8px] font-bold text-violet-600">
                                  {variant.watt}W
                                </span>
                              )}

                            {/* PRICE */}

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span className="text-[15px] font-black text-slate-950">
                                ₹{Number(variant.price).toFixed(0)}
                              </span>

                              {variant.originalPrice &&
                                variant.originalPrice > variant.price && (
                                  <span className="text-[8px] text-slate-400 line-through">
                                    ₹{Number(variant.originalPrice).toFixed(0)}
                                  </span>
                                )}
                            </div>

                            {/* DISCOUNT */}

                            {variantSave > 0 && (
                              <p className="mt-0.5 text-[8px] font-black text-emerald-600">
                                {variantSave}% off
                              </p>
                            )}

                            {/* STOCK */}

                            <p
                              className={`mt-1.5 text-[8px] font-bold ${
                                outOfStock
                                  ? "text-rose-500"
                                  : "text-emerald-600"
                              }`}
                            >
                              {outOfStock
                                ? "Out of stock"
                                : `${variant.stock} available`}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SELECTED SUMMARY */}

                  {selectedVariant && (
                    <div className="border-t border-slate-100 bg-slate-50 px-3.5 py-2.5 sm:px-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {selectedVariant.image && (
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                              <img
                                src={selectedVariant.image}
                                alt={selectedVariant.variantName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                              Selected
                            </p>

                            <p className="truncate text-[11px] font-black text-slate-900">
                              {selectedVariant.variantName}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[13px] font-black text-slate-950">
                            ₹{Number(selectedVariant.price).toFixed(0)}
                          </p>

                          <p
                            className={`text-[8px] font-bold ${
                              Number(selectedVariant.stock) > 0
                                ? "text-emerald-600"
                                : "text-rose-500"
                            }`}
                          >
                            {Number(selectedVariant.stock) > 0
                              ? `${selectedVariant.stock} available`
                              : "Out of stock"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                  PRICE
              ================================================= */}

              <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      {selectedVariant
                        ? "Selected Variant Price"
                        : "Product Price"}
                    </p>

                    <div className="flex items-end gap-1.5">
                      <span className="text-[28px] font-black tracking-tight text-slate-950">
                        ₹{Number(displayPrice).toFixed(2)}
                      </span>

                      {displayUnit && (
                        <span className="mb-1.5 text-[9px] text-slate-500">
                          / {displayUnit}
                        </span>
                      )}
                    </div>

                    {displayOriginalPrice &&
                      displayOriginalPrice > displayPrice && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{Number(displayOriginalPrice).toFixed(2)}
                          </span>

                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[8px] font-bold text-rose-600">
                            Save ₹{savings.toFixed(2)}
                          </span>

                          {variantDiscount > 0 && (
                            <span className="text-[9px] font-black text-emerald-600">
                              {variantDiscount}% OFF
                            </span>
                          )}
                        </div>
                      )}
                  </div>

                  <div
                    className={`rounded-xl px-2.5 py-2 ${
                      displayStock > 0 ? "bg-emerald-50" : "bg-rose-50"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1 text-[8px] font-black ${
                        displayStock > 0 ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          displayStock > 0 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />

                      {displayStock > 0
                        ? `${displayStock} In Stock`
                        : "Out of Stock"}
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SELECTED VARIANT INFO
              ================================================= */}

              {selectedVariant && (
                <div className="mb-3 overflow-hidden rounded-2xl border border-orange-100 bg-orange-50/50">
                  <div className="flex items-center justify-between border-b border-orange-100 px-3 py-2.5">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-wider text-orange-600">
                        Selected Variant
                      </p>

                      <h3 className="text-[13px] font-black text-slate-900">
                        {selectedVariant.variantName}
                      </h3>
                    </div>

                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
                    {selectedVariant.watt !== null &&
                      selectedVariant.watt !== undefined && (
                        <MiniInfo
                          label="Watt"
                          value={`${selectedVariant.watt}W`}
                        />
                      )}

                    <MiniInfo
                      label="Stock"
                      value={String(selectedVariant.stock)}
                    />

                    {selectedVariant.unit && (
                      <MiniInfo label="Unit" value={selectedVariant.unit} />
                    )}

                    {selectedVariant.sku && (
                      <MiniInfo label="SKU" value={selectedVariant.sku} />
                    )}
                  </div>

                  {selectedVariant.specs &&
                    Object.keys(selectedVariant.specs).length > 0 && (
                      <div className="border-t border-orange-100 px-3 pb-3 pt-2.5">
                        <p className="mb-2 text-[8px] font-black uppercase tracking-wider text-orange-600">
                          Variant Specifications
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedVariant.specs).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="rounded-xl bg-white px-2.5 py-2"
                              >
                                <p className="text-[8px] capitalize text-slate-400">
                                  {cleanLabel(key)}
                                </p>

                                <p className="mt-0.5 break-words text-[10px] font-bold text-slate-900">
                                  {String(value)}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <div className="mb-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Quantity
                  </p>

                  <p className="mt-0.5 text-[13px] font-black text-slate-900">
                    {qty} {displayUnit || "Item"}
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={decreaseQty}
                    disabled={qty <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-slate-700 shadow-sm disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="w-8 text-center text-sm font-black text-slate-900">
                    {qty}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQty}
                    disabled={qty >= displayStock || displayStock <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-slate-700 shadow-sm disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* =================================================
                  ABOUT
              ================================================= */}

              {product.about && (
                <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <h2 className="mb-1.5 text-[14px] font-black text-slate-900">
                    About Product
                  </h2>

                  <p className="text-[11px] leading-5 text-slate-600">
                    {product.about}
                  </p>
                </div>
              )}

              {/* =================================================
                  PRODUCT DETAILS
              ================================================= */}

              <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-[14px] font-black text-slate-900">
                    Product Details
                  </h2>
                </div>

                <div className="px-4">
                  <InfoRow label="Brand" value={product.brand} />

                  <InfoRow label="Category" value={product.categoryLabel} />

                  <InfoRow label="Material" value={product.materialName} />

                  <InfoRow label="Unit" value={displayUnit} />

                  <InfoRow label="Measurement" value={product.measurement} />
                </div>
              </div>

              {/* =================================================
                  SIZE / MEASUREMENTS
              ================================================= */}

              <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                    <Ruler className="h-[18px] w-[18px] text-sky-600" />
                  </div>

                  <div>
                    <h2 className="text-[14px] font-black text-slate-900">
                      Size & Measurements
                    </h2>

                    <p className="text-[8px] text-slate-500">
                      Product dimensions & specifications
                    </p>
                  </div>
                </div>

                {product.description && (
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="mb-1 text-[8px] font-black uppercase tracking-wide text-slate-400">
                      Standard Measurement
                    </p>

                    <p className="text-[12px] font-black text-slate-900">
                      {product.description}
                    </p>
                  </div>
                )}

                {measurementEntries.length > 0 && (
                  <div className="grid grid-cols-2">
                    {measurementEntries.map(([key, value], index) => (
                      <div
                        key={key}
                        className={`px-4 py-3 ${
                          index % 2 === 0 ? "border-r border-slate-100" : ""
                        } ${
                          index < measurementEntries.length - 2
                            ? "border-b border-slate-100"
                            : ""
                        }`}
                      >
                        <p className="mb-1 text-[8px] capitalize text-slate-400">
                          {cleanLabel(key)}
                        </p>

                        <p className="break-words text-[11px] font-bold text-slate-900">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {measurementEntries.length === 0 && !product.description && (
                  <div className="px-4 py-4 text-center">
                    <p className="text-[10px] text-slate-400">
                      Measurement details not available
                    </p>
                  </div>
                )}
              </div>

              {/* =================================================
                  TECHNICAL SPECS
              ================================================= */}

              {technicalSpecs.length > 0 && (
                <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h2 className="text-[14px] font-black text-slate-900">
                      Technical Specifications
                    </h2>

                    <p className="mt-0.5 text-[8px] text-slate-500">
                      Complete product specifications
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {technicalSpecs.map(([key, value]) => (
                      <div
                        key={key}
                        className="grid grid-cols-[42%_58%] px-4 py-2.5"
                      >
                        <span className="pr-3 text-[9px] capitalize text-slate-500">
                          {cleanLabel(key)}
                        </span>

                        <span className="break-words text-[9px] font-bold text-slate-900">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================================
                  TAGS
              ================================================= */}

              {product.tags?.filter((tag) => tag?.trim()).length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {product.tags
                    .filter((tag) => tag?.trim())
                    .map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-medium text-slate-600"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                </div>
              )}

              {/* =================================================
                  SHOP
              ================================================= */}

              {shopData && (
                <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white">
                        {shopData.logo ? (
                          <img
                            src={shopData.logo}
                            alt={shopData.shop_name || "Shop"}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Store className="h-5 w-5 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                          Fulfilled by
                        </p>

                        <h3 className="truncate text-[13px] font-black text-slate-900">
                          {shopData.shop_name}
                        </h3>

                        <p className="truncate text-[8px] text-slate-500">
                          {shopData.city} {shopData.state}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/eaurix/shop/${shopData.id}`)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 hover:bg-sky-100"
                    >
                      <Eye className="h-4 w-4 text-slate-700" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  BROCHURE
              ================================================= */}

              {product.brochure && (
                <button
                  type="button"
                  onClick={() => setShowBrochure(true)}
                  className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-xs font-black text-slate-900 shadow-sm hover:border-sky-400 hover:bg-sky-50"
                >
                  <FileText className="h-4 w-4 text-sky-500" />
                  View Product Brochure
                </button>
              )}
            </div>
          </div>

          {/* ===================================================
              RELATED PRODUCTS
          =================================================== */}

          {relatedProducts.length > 0 && (
            <section className="mt-7">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h2 className="text-[17px] font-black text-slate-900">
                    Related Products
                  </h2>

                  <p className="text-[9px] text-slate-500">
                    More products from this category
                  </p>
                </div>

                <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-bold text-slate-500 shadow-sm">
                  {relatedProducts.length} Products
                </span>
              </div>

              <div className="scrollbar-hide flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/eaurix/product/${item.id}`}
                    className="group w-[145px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-lg"
                  >
                    <div
                      className="h-28 p-2"
                      style={{
                        background: `linear-gradient(135deg, ${
                          item.color || "#0EA5E9"
                        }15, ${item.color || "#0EA5E9"}35)`,
                      }}
                    >
                      <div
                        className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${
                            item.color || "#0EA5E9"
                          }, ${item.color || "#0EA5E9"}90)`,
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-[88%] w-[88%] rounded-lg object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/30 text-lg font-black text-white">
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5">
                      {item.brand && (
                        <p className="truncate text-[8px] font-black uppercase tracking-wide text-sky-600">
                          {item.brand}
                        </p>
                      )}

                      <h3 className="mt-1 line-clamp-2 h-8 text-[11px] font-bold leading-4 text-slate-900">
                        {item.name}
                      </h3>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[14px] font-black text-slate-900">
                          ₹{item.price}
                        </span>

                        <span className="rounded-full bg-sky-50 px-2 py-1 text-[8px] font-bold text-sky-600">
                          View
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* =====================================================
            BROCHURE MODAL
        ===================================================== */}

        {showBrochure && product.brochure && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm sm:p-4">
            <div className="relative flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-slate-900">
                    Product Brochure
                  </h2>

                  <p className="truncate text-[9px] text-slate-500">
                    {product.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBrochure(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <iframe
                src={product.brochure}
                title="Product Brochure"
                className="h-[calc(94vh-56px)] w-full"
              />
            </div>
          </div>
        )}

        {/* =====================================================
            SHOP DETAILS MODAL
        ===================================================== */}

        {showShopDetails && shopData && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-2 backdrop-blur-md sm:p-4">
            <div className="relative flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
              {/* CLOSE */}

              <button
                type="button"
                onClick={() => setShowShopDetails(false)}
                className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xl"
              >
                <X className="h-5 w-5 text-slate-700" />
              </button>

              {/* BANNER */}

              <div className="relative h-40 shrink-0 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 sm:h-52">
                {shopData.banner || shopData.logo ? (
                  <img
                    src={shopData.banner || shopData.logo}
                    alt={shopData.shop_name || "Shop"}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Store className="h-20 w-20 text-white/40" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute -bottom-9 left-5">
                  <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-2xl">
                    {shopData.logo ? (
                      <img
                        src={shopData.logo}
                        alt={shopData.shop_name || "Shop"}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Store className="h-9 w-9 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* SHOP CONTENT */}

              <div className="flex-1 overflow-y-auto bg-slate-50 px-4 pb-6 pt-14">
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-[22px] font-black leading-tight text-slate-950">
                          {shopData.shop_name}
                        </h2>

                        {shopData.owner_name && (
                          <p className="mt-1 text-[10px] font-semibold text-slate-500">
                            Owner: {shopData.owner_name}
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[8px] font-black uppercase ${
                          shopData.status === "online"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {shopData.status || "offline"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-xl bg-violet-50 px-2.5 py-1.5 text-[8px] font-black text-violet-700">
                        Shop ID: {shopData.shop_uid || "N/A"}
                      </span>

                      <span className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-[8px] font-black text-emerald-700">
                        Joined:{" "}
                        {shopData.joined_date
                          ? new Date(shopData.joined_date).toLocaleDateString(
                              "en-GB",
                            )
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <ShopInfoCard
                      icon={Package}
                      title="Category"
                      value={shopData.category || "-"}
                    />

                    <ShopInfoCard
                      icon={MapPin}
                      title="Location"
                      value={`${shopData.city || ""} ${shopData.state || ""}`}
                    />

                    <ShopInfoCard
                      icon={Store}
                      title="Address"
                      value={shopData.address || "-"}
                      full
                    />

                    <ShopInfoCard
                      icon={FileText}
                      title="Description"
                      value={shopData.description || "-"}
                      full
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          MOBILE BOTTOM BAR
      ===================================================== */}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-10px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-all duration-300 ${
          keyboardOpen
            ? "pointer-events-none translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 bg-white px-2.5 py-2.5 pb-[calc(env(safe-area-inset-bottom)+6px)]">
          {/* CART */}

          <button
            type="button"
            disabled={displayStock <= 0}
            onClick={handleCartClick}
            className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-[11px] font-black transition active:scale-[0.98] ${
              displayStock <= 0
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : added
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : inCart
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            {added ? (
              <>
                <CheckCircle2 className="h-[18px] w-[18px]" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-[18px] w-[18px]" />

                {displayStock <= 0
                  ? "Out of Stock"
                  : inCart
                    ? "View Cart"
                    : "Add to Cart"}
              </>
            )}
          </button>

          {/* BUY NOW */}

          <button
            type="button"
            disabled={displayStock <= 0}
            onClick={handleBuyNow}
            className={`flex h-11 items-center justify-between rounded-xl px-3.5 text-white shadow-md transition active:scale-[0.98] ${
              displayStock <= 0
                ? "cursor-not-allowed bg-slate-400"
                : "bg-gradient-to-r from-sky-600 to-cyan-500"
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-white/75">
                {qty} Item
                {qty > 1 ? "s" : ""}
              </span>

              <span className="text-[11px] font-black">
                {displayStock <= 0 ? "Unavailable" : "Buy Now"}
              </span>
            </div>

            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* =====================================================
          FULLSCREEN IMAGE
      ===================================================== */}

      {showImage && displayImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={() => setShowImage(false)}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowImage(false);
            }}
            className="absolute right-4 top-16 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="flex h-screen w-screen items-center justify-center overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={5}
              centerOnInit
              centerZoomedOut
            >
              <TransformComponent
                wrapperClass="!h-screen !w-screen"
                contentClass="!flex !h-screen !w-screen !items-center !justify-center"
              >
                <img
                  src={displayImage}
                  alt={product.name}
                  draggable={false}
                  className="max-h-[78vh] max-w-[94vw] select-none object-contain"
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   TRUST CARD
============================================================ */

function TrustCard({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Truck;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 text-center shadow-sm">
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-xl bg-sky-50">
        <Icon className="h-3.5 w-3.5 text-sky-500" />
      </div>

      <p className="truncate text-[8px] font-black text-slate-900">{title}</p>

      <p className="mt-0.5 text-[7px] text-slate-400">{subtitle}</p>
    </div>
  );
}

/* ============================================================
   MINI INFO
============================================================ */

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-orange-100 bg-white px-2.5 py-2">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[10px] font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({ label, value }: { label: string; value?: unknown }) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="shrink-0 text-[10px] text-slate-500">{label}</span>

      <span className="max-w-[62%] wrap-break-word text-right text-[10px] font-bold text-slate-900">
        {String(value)}
      </span>
    </div>
  );
}

/* ============================================================
   SHOP INFO
============================================================ */

function ShopInfoCard({
  icon: Icon,
  title,
  value,
  full = false,
}: {
  icon: typeof Package;
  title: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50">
          <Icon className="h-4 w-4 text-sky-500" />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-0.5 break-words text-[10px] font-bold leading-4 text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOADING SKELETON
============================================================ */

function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-sky-100 via-sky-50 to-cyan-100 px-3 pb-20 pt-28">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="mb-3 h-9 w-20 rounded-xl bg-white/80" />

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="h-77.5 rounded-[28px] bg-white/70 sm:h-105" />

            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="h-20 rounded-2xl bg-white/70" />
              <div className="h-20 rounded-2xl bg-white/70" />
              <div className="h-20 rounded-2xl bg-white/70" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded-xl bg-white/70" />

            <div className="h-16 rounded-2xl bg-white/70" />

            <div className="h-32 rounded-2xl bg-white/70" />

            <div className="h-28 rounded-2xl bg-white/70" />

            <div className="h-44 rounded-2xl bg-white/70" />

            <div className="h-32 rounded-2xl bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
