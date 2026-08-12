"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import {
  AlertCircle,
  Check,
  ChevronDown,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  emptyProduct,
  emptyProductVariant,
  getProductCategory,
  productCategories,
  type Product,
  type ProductCategory,
  type ProductVariant,
} from "@/app/data/products";

/* =========================================================
   PROPS
========================================================= */

type ProductFormProps = {
  shop: any;
  initial?: Product;
  onSave: (product: Omit<Product, "id">) => Promise<any>;
  onClose: () => void;
};

/* =========================================================
   INTERNAL VARIANT
========================================================= */

type FormVariant = ProductVariant & {
  tempId: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const BUCKET = "products";

const UNITS = [
  "Piece",
  "Pc",
  "Unit",
  "Set",
  "Pair",
  "Pack",
  "Box",
  "Bag",
  "Bottle",
  "Kg",
  "Gram",
  "Quintal",
  "Ton",
  "Meter",
  "Feet",
  "Sq Ft",
  "Sq M",
  "CFT",
  "CBM",
  "Liter",
  "ML",
  "Watt",
  "Volt",
  "Bundle",
  "Roll",
  "Custom",
];

const MEASUREMENT_TYPES = [
  "None",
  "Size",
  "Weight",
  "Length",
  "Width",
  "Height",
  "Thickness",
  "Diameter",
  "Capacity",
  "Power",
  "Voltage",
  "Count",
];

const QUICK_OPTIONS = [
  "400W",
  "500W",
  "600W",
  "800W",
  "1000W",
  "1200W",
  "1500W",
  "2000W",
  "1 Kg",
  "5 Kg",
  "10 Kg",
  "20 Kg",
  "25 Kg",
  "40 Kg",
  "43 Kg",
  "50 Kg",
  "1 L",
  "5 L",
  "10 L",
  "20 L",
  "1/2 Inch",
  "3/4 Inch",
  "1 Inch",
  "1.5 Inch",
  "2 Inch",
  "3 Inch",
  "4 Inch",
  "6 Inch",
  "8 Inch",
  "300 × 300 mm",
  "600 × 600 mm",
  "600 × 1200 mm",
];

/* =========================================================
   STYLES
========================================================= */

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

const labelClass = "mb-1.5 block text-[11px] font-bold text-slate-600";

/* =========================================================
   HELPERS
========================================================= */

function makeTempId() {
  return `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createFormVariant(variant?: ProductVariant): FormVariant {
  const base = variant || emptyProductVariant();

  return {
    ...base,
    id: base.id || "",
    productId: base.productId || "",
    variantName: base.variantName || "",
    watt:
      base.watt === null || base.watt === undefined ? null : Number(base.watt),
    price: Number(base.price || 0),
    originalPrice:
      base.originalPrice === null || base.originalPrice === undefined
        ? null
        : Number(base.originalPrice),
    stock: Number(base.stock || 0),
    sku: base.sku || null,
    unit: base.unit || "Piece",
    specs: base.specs || {},
    image: base.image || "",
    images: Array.isArray(base.images) ? base.images : [],
    isActive: base.isActive !== false,
    tempId: makeTempId(),
  };
}

function getPublicImageUrl(path?: string | null) {
  if (!path) return "";

  const value = String(path).trim();

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const cleanPath = value.startsWith("images/") ? value : `images/${value}`;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(cleanPath);

  return data.publicUrl || "";
}

function getBrochureUrl(path?: string | null) {
  if (!path) return "";

  const value = String(path).trim();

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const cleanPath = value.startsWith("brochures/")
    ? value
    : `brochures/${value}`;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(cleanPath);

  return data.publicUrl || "";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductForm({
  shop,
  initial,
  onSave,
  onClose,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);

  const [form, setForm] = useState<Omit<Product, "id">>(() => {
    if (initial) {
      return {
        ...initial,
        shop_id: initial.shop_id || shop?.id || "",
        variants: initial.variants || [],
        hasVariants: initial.hasVariants || Boolean(initial.variants?.length),
      };
    }

    return {
      ...emptyProduct(),
      shop_id: shop?.id || "",
      variants: [],
      hasVariants: false,
    };
  });

  const [variants, setVariants] = useState<FormVariant[]>(() => {
    if (initial?.variants?.length) {
      return initial.variants.map(createFormVariant);
    }

    return [createFormVariant()];
  });

  const [imagePreview, setImagePreview] = useState("");

  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [brochureName, setBrochureName] = useState("");

  const [expandedVariant, setExpandedVariant] = useState(0);

  const [showDescription, setShowDescription] = useState(false);

  const mainImageRef = useRef<HTMLInputElement>(null);

  const galleryRef = useRef<HTMLInputElement>(null);

  const brochureRef = useRef<HTMLInputElement>(null);

  /* =======================================================
     INITIAL DATA
  ======================================================= */

  useEffect(() => {
    if (!initial) return;

    if (initial.image) {
      setImagePreview(getPublicImageUrl(initial.image));
    }

    if (initial.images?.length) {
      setGalleryPreviews(initial.images.map((item) => getPublicImageUrl(item)));
    }

    if (initial.brochure) {
      const name = initial.brochure.split("/").pop();

      setBrochureName(name || "Brochure");
    }
  }, [initial]);
useEffect(() => {
  const previousOverflow = document.body.style.overflow;

  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = previousOverflow;
  };
}, []);
  /* =======================================================
     CATEGORY
  ======================================================= */

  const selectedCategory = getProductCategory(form.category);

  /* =======================================================
     PRICE SUMMARY
  ======================================================= */

  const priceSummary = useMemo(() => {
    const active = variants.filter((variant) => variant.isActive);

    const prices = active.map((variant) => Number(variant.price || 0));

    const mrps = active
      .map((variant) =>
        variant.originalPrice == null ? 0 : Number(variant.originalPrice),
      )
      .filter((value) => value > 0);

    const stock = active.reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0,
    );

    return {
      price: prices.length > 0 ? Math.min(...prices) : Number(form.price || 0),

      maxPrice:
        prices.length > 0 ? Math.max(...prices) : Number(form.price || 0),

      mrp:
        mrps.length > 0 ? Math.max(...mrps) : Number(form.originalPrice || 0),

      stock,
    };
  }, [variants, form.price, form.originalPrice]);

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  function updateField<K extends keyof Omit<Product, "id">>(
    field: K,
    value: Omit<Product, "id">[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =======================================================
     UPDATE VARIANT
  ======================================================= */

  function updateVariant(
    index: number,
    field: keyof ProductVariant,
    value: any,
  ) {
    setVariants((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  /* =======================================================
     ADD VARIANT
  ======================================================= */

  function addVariant() {
    setVariants((previous) => [...previous, createFormVariant()]);

    setExpandedVariant(variants.length);
  }

  /* =======================================================
     REMOVE VARIANT
  ======================================================= */

  function removeVariant(index: number) {
    if (variants.length === 1) {
      setError("At least one product option is required.");
      return;
    }

    setVariants((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );

    setExpandedVariant(Math.max(0, index - 1));
  }

  /* =======================================================
     DUPLICATE VARIANT
  ======================================================= */

  function duplicateVariant(index: number) {
    const source = variants[index];

    if (!source) return;

    const copy: FormVariant = {
      ...source,
      id: "",
      tempId: makeTempId(),
      variantName: source.variantName ? `${source.variantName} Copy` : "",
      sku: null,
    };

    setVariants((previous) => [...previous, copy]);

    setExpandedVariant(variants.length);
  }

  /* =======================================================
     UPLOAD FILE
  ======================================================= */

  async function uploadFile(file: File, folder: "images" | "brochures") {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${folder === "images" ? "product" : "brochure"}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`;

    const path = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      throw error;
    }

    return fileName;
  }

  /* =======================================================
     MAIN IMAGE
  ======================================================= */

  async function handleMainImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const fileName = await uploadFile(file, "images");

      updateField("image", fileName);

      updateField("images", [
        fileName,
        ...(form.images || []).filter((item) => item !== fileName),
      ]);

      setImagePreview(URL.createObjectURL(file));
    } catch (err) {
      console.error("MAIN IMAGE ERROR:", err);

      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  /* =======================================================
     GALLERY
  ======================================================= */

  async function handleGallery(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024,
    );

    if (!validFiles.length) {
      setError("Please select valid images under 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const uploaded: string[] = [];

      for (const file of validFiles) {
        const path = await uploadFile(file, "images");

        uploaded.push(path);
      }

      const existing = Array.isArray(form.images) ? form.images : [];

      updateField("images", Array.from(new Set([...existing, ...uploaded])));

      setGalleryPreviews((previous) => [
        ...previous,
        ...validFiles.map((file) => URL.createObjectURL(file)),
      ]);
    } catch (err) {
      console.error("GALLERY ERROR:", err);

      setError(err instanceof Error ? err.message : "Gallery upload failed.");
    } finally {
      setUploading(false);

      if (galleryRef.current) {
        galleryRef.current.value = "";
      }
    }
  }

  /* =======================================================
     BROCHURE
  ======================================================= */

  async function handleBrochure(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF brochure.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Brochure must be less than 20 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const fileName = await uploadFile(file, "brochures");

      updateField("brochure", fileName);

      setBrochureName(file.name);
    } catch (err) {
      console.error("BROCHURE ERROR:", err);

      setError(err instanceof Error ? err.message : "Brochure upload failed.");
    } finally {
      setUploading(false);
    }
  }

  /* =======================================================
     VARIANT QUICK OPTION
  ======================================================= */

  function applyQuickOption(index: number, value: string) {
    updateVariant(index, "variantName", value);

    const match = value.match(/^([\d.]+)\s*(.*)$/);

    if (!match) return;

    const numericValue = Number(match[1]);

    const suffix = match[2]?.trim().toLowerCase() || "";

    if (Number.isNaN(numericValue)) {
      return;
    }

    updateVariant(index, "specs", {
      ...(variants[index]?.specs || {}),
      measurementValue: numericValue,
      measurementUnit: suffix,
    });

    if (suffix === "w") {
      updateVariant(index, "watt", numericValue);
    }
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validate() {
    if (!form.shop_id) {
      return "Shop ID is missing.";
    }

    if (!form.name.trim()) {
      return "Please enter product name.";
    }

    if (!form.brand.trim()) {
      return "Please enter brand.";
    }

    if (!form.category) {
      return "Please select category.";
    }

    if (!form.unit) {
      return "Please select product unit.";
    }

    if (!variants.length) {
      return "Add at least one product option.";
    }

    const skuSet = new Set<string>();

    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];

      if (!variant.variantName.trim()) {
        return `Enter option name for Variant ${index + 1}.`;
      }

      const price = Number(variant.price || 0);

      const mrp =
        variant.originalPrice == null ? null : Number(variant.originalPrice);

      const stock = Number(variant.stock || 0);

      if (price < 0) {
        return `Invalid price for ${variant.variantName}.`;
      }

      if (mrp !== null && mrp < price) {
        return `MRP cannot be lower than selling price for ${variant.variantName}.`;
      }

      if (stock < 0) {
        return `Invalid stock for ${variant.variantName}.`;
      }

      const sku = String(variant.sku || "")
        .trim()
        .toLowerCase();

      if (sku) {
        if (skuSet.has(sku)) {
          return `Duplicate SKU: ${variant.sku}`;
        }

        skuSet.add(sku);
      }
    }

    return "";
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function handleSave() {
    try {
      setError("");

      const validation = validate();

      if (validation) {
        setError(validation);
        return;
      }

      setLoading(true);

      const prices = variants.map((variant) => Number(variant.price || 0));

      const mrps = variants
        .map((variant) =>
          variant.originalPrice == null ? 0 : Number(variant.originalPrice),
        )
        .filter((value) => value > 0);

      const lowestPrice = prices.length ? Math.min(...prices) : 0;

      const highestMrp = mrps.length ? Math.max(...mrps) : undefined;

      const totalStock = variants.reduce(
        (total, variant) => total + Number(variant.stock || 0),
        0,
      );

      const cleanVariants: ProductVariant[] = variants.map((variant) => ({
        id: variant.id || "",
        productId: initial?.id || "",
        variantName: variant.variantName.trim(),
        watt: variant.watt == null ? null : Number(variant.watt),
        price: Number(variant.price || 0),
        originalPrice:
          variant.originalPrice == null ? null : Number(variant.originalPrice),
        stock: Number(variant.stock || 0),
        sku: String(variant.sku || "").trim() || null,
        unit: String(variant.unit || "Piece").trim(),
        specs: variant.specs || {},
        image: variant.image || "",
        images: Array.isArray(variant.images) ? variant.images : [],
        isActive: variant.isActive !== false,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      }));

      const productData: Omit<Product, "id"> = {
        ...form,

        shop_id: shop?.id || form.shop_id,

        name: form.name.trim(),

        brand: form.brand.trim(),

        category: form.category as ProductCategory,

        categoryLabel: selectedCategory.label,

        color: selectedCategory.bgColor,

        price: lowestPrice,

        originalPrice:
          highestMrp && highestMrp > lowestPrice ? highestMrp : undefined,

        stock: totalStock,

        unit: form.unit || "Piece",

        image: form.image || "",

        images: Array.isArray(form.images) ? form.images : [],

        description:
          form.description ||
          `${cleanVariants.length} product options available.`,

        longDescription: form.longDescription || "",

        specs: {
          ...(form.specs || {}),
          hasVariants: cleanVariants.length > 0,
          variantCount: cleanVariants.length,
        },

        variants: cleanVariants,

        hasVariants: cleanVariants.length > 0,

        is_active: form.is_active !== false,
      };

      /*
       * IMPORTANT:
       *
       * addProduct/updateProduct in products.ts
       * already save product_variants.
       *
       * Therefore we DON'T insert variants
       * here again.
       */
      await onSave(productData);

      onClose();
    } catch (err) {
      console.error("SAVE PRODUCT ERROR:", err);

      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     REMOVE GALLERY IMAGE
  ======================================================= */

  function removeGalleryImage(index: number) {
    const current = Array.isArray(form.images) ? form.images : [];

    updateField(
      "images",
      current.filter((_, itemIndex) => itemIndex !== index),
    );

    setGalleryPreviews((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f7fa]">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-5 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
              <Plus className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-slate-950 sm:text-base">
                {initial ? "Edit Product" : "Add New Product"}
              </h1>

              <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                {shop?.shop_name || "Product Management"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mx-3 mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:mx-5 lg:mx-auto lg:w-full lg:max-w-7xl">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span className="min-w-0 flex-1">{error}</span>

          <button type="button" onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-3 py-3 pb-28 sm:px-5 sm:py-5 lg:px-7">
          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-bold text-slate-900">
                Product Information
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Enter the basic information customers will see.
              </p>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
              {/* PRODUCT NAME */}

              <div className="sm:col-span-2 lg:col-span-2">
                <label className={labelClass}>Product Name *</label>

                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Example: Bosch Professional Air Blower"
                  className={inputClass}
                />
              </div>

              {/* BRAND */}

              <div>
                <label className={labelClass}>Brand *</label>

                <input
                  value={form.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  placeholder="Bosch"
                  className={inputClass}
                />
              </div>

              {/* CATEGORY */}

              <div className="relative">
                <label className={labelClass}>Category *</label>

                <button
                  type="button"
                  onClick={() => setCategoryOpen((value) => !value)}
                  className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {selectedCategory.image && (
                      <img
                        src={selectedCategory.image}
                        alt=""
                        className="h-7 w-7 rounded-md object-cover"
                      />
                    )}

                    <span className="truncate text-sm font-semibold text-slate-800">
                      {selectedCategory.label}
                    </span>
                  </div>

                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                </button>

                {categoryOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    {productCategories.map((category) => (
                      <button
                        type="button"
                        key={category.id}
                        onClick={() => {
                          updateField("category", category.id);

                          updateField("categoryLabel", category.label);

                          updateField("color", category.bgColor);

                          setCategoryOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg p-2 text-left ${
                          form.category === category.id
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <img
                          src={category.image}
                          alt=""
                          className="h-8 w-8 rounded-md object-cover"
                        />

                        <span className="text-xs font-semibold text-slate-800">
                          {category.label}
                        </span>

                        {form.category === category.id && (
                          <Check className="ml-auto h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* UNIT */}

              <div>
                <label className={labelClass}>Unit *</label>

                <select
                  value={form.unit || "Piece"}
                  onChange={(event) => updateField("unit", event.target.value)}
                  className={selectClass}
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* TAG */}

              <div>
                <label className={labelClass}>Badge</label>

                <select
                  value={form.badge || ""}
                  onChange={(event) =>
                    updateField("badge", event.target.value || undefined)
                  }
                  className={selectClass}
                >
                  <option value="">No Badge</option>
                  <option value="popular">Popular</option>
                  <option value="pro">Pro</option>
                  <option value="new">New</option>
                  <option value="best">Best Seller</option>
                </select>
              </div>
            </div>
          </section>

          {/* =================================================
              MEDIA + SIDE SUMMARY
          ================================================= */}

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
                <h2 className="text-sm font-bold text-slate-900">
                  Product Images
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Main image is shown first on the product page.
                </p>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  {/* MAIN IMAGE */}

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
                      Main Image
                    </label>

                    <button
                      type="button"
                      onClick={() => mainImageRef.current?.click()}
                      className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt=""
                          className="h-full w-full object-contain p-3"
                        />
                      ) : (
                        <div className="text-center">
                          <ImagePlus className="mx-auto h-8 w-8 text-slate-300" />

                          <p className="mt-2 text-[10px] font-bold text-slate-500">
                            Add image
                          </p>
                        </div>
                      )}

                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      )}
                    </button>

                    <input
                      ref={mainImageRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleMainImage}
                    />
                  </div>

                  {/* GALLERY */}

                  <div>
                    <label className={labelClass}>Additional Images</label>

                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                      {galleryPreviews.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                        >
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-contain p-1"
                          />

                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => galleryRef.current?.click()}
                        className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                      >
                        <Plus className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>

                    <input
                      ref={galleryRef}
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleGallery}
                    />

                    <p className="mt-2 text-[9px] text-slate-400">
                      JPG, PNG, WEBP · Max 10 MB each
                    </p>
                  </div>
                </div>

                {/* BROCHURE */}

                <div className="mt-5">
                  <label className={labelClass}>Product Brochure</label>

                  <button
                    type="button"
                    onClick={() => brochureRef.current?.click()}
                    className="flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-left hover:border-blue-400"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {brochureName || "Upload PDF brochure"}
                      </p>

                      <p className="text-[9px] text-slate-400">
                        PDF · Max 20 MB
                      </p>
                    </div>

                    <span className="rounded-md bg-white px-2 py-1 text-[9px] font-bold text-slate-500">
                      Browse
                    </span>
                  </button>

                  <input
                    ref={brochureRef}
                    type="file"
                    hidden
                    accept=".pdf,application/pdf"
                    onChange={handleBrochure}
                  />
                </div>
              </div>
            </section>

            {/* SUMMARY */}

            <aside className="h-fit rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Product Preview
                </p>
              </div>

              <div className="p-4">
                <div className="flex gap-3">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-slate-100 object-contain"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-50">
                      <ImagePlus className="h-6 w-6 text-slate-300" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">
                      {selectedCategory.label}
                    </p>

                    <h3 className="mt-0.5 line-clamp-2 text-sm font-bold text-slate-900">
                      {form.name || "Product Name"}
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {form.brand || "Brand"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xl font-bold text-slate-950">
                    ₹{priceSummary.price.toLocaleString("en-IN")}
                  </span>

                  {priceSummary.maxPrice > priceSummary.price && (
                    <span className="ml-1 text-[10px] text-slate-400">
                      onwards
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <MiniBox label="Options" value={String(variants.length)} />

                  <MiniBox label="Stock" value={String(priceSummary.stock)} />
                </div>

                <div className="mt-2">
                  <MiniBox label="Category" value={selectedCategory.label} />
                </div>
              </div>
            </aside>
          </div>

          {/* =================================================
              VARIANTS
          ================================================= */}

          <section className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Product Variants
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Flipkart-style options with separate price, stock and SKU.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </button>
            </div>

            <div className="p-3 sm:p-4">
              <div className="space-y-2">
                {variants.map((variant, index) => {
                  const open = expandedVariant === index;

                  return (
                    <div
                      key={variant.tempId}
                      className="overflow-hidden rounded-lg border border-slate-200"
                    >
                      {/* VARIANT HEADER */}

                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-[10px] font-bold text-blue-700">
                          {index + 1}
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedVariant(open ? -1 : index)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-xs font-bold text-slate-800">
                            {variant.variantName || `Variant ${index + 1}`}
                          </p>

                          <p className="text-[9px] text-slate-400">
                            ₹
                            {Number(variant.price || 0).toLocaleString("en-IN")}{" "}
                            · Stock {Number(variant.stock || 0)}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => duplicateVariant(index)}
                          className="hidden h-7 rounded-md bg-white px-2 text-[9px] font-bold text-slate-500 sm:block"
                        >
                          Duplicate
                        </button>

                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedVariant(open ? -1 : index)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-400"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* VARIANT BODY */}

                      {open && (
                        <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {/* NAME */}

                            <div className="sm:col-span-2">
                              <label className={labelClass}>
                                Option Name *
                              </label>

                              <input
                                value={variant.variantName}
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "variantName",
                                    event.target.value,
                                  )
                                }
                                placeholder="400W / 10 Kg / Red / 6mm"
                                className={inputClass}
                              />
                            </div>

                            {/* WATT */}

                            <div>
                              <label className={labelClass}>Watt</label>

                              <input
                                type="number"
                                min="0"
                                value={variant.watt ?? ""}
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "watt",
                                    event.target.value
                                      ? Number(event.target.value)
                                      : null,
                                  )
                                }
                                placeholder="400"
                                className={inputClass}
                              />
                            </div>

                            {/* MEASUREMENT */}

                            <div>
                              <label className={labelClass}>Measurement</label>

                              <select
                                value={String(
                                  variant.specs?.measurementType || "None",
                                )}
                                onChange={(event) =>
                                  updateVariant(index, "specs", {
                                    ...(variant.specs || {}),
                                    measurementType: event.target.value,
                                  })
                                }
                                className={selectClass}
                              >
                                {MEASUREMENT_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* MEASUREMENT VALUE */}

                            <div>
                              <label className={labelClass}>Value</label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  variant.specs?.measurementValue == null
                                    ? ""
                                    : String(variant.specs.measurementValue)
                                }
                                onChange={(event) =>
                                  updateVariant(index, "specs", {
                                    ...(variant.specs || {}),
                                    measurementValue:
                                      event.target.value === ""
                                        ? null
                                        : Number(event.target.value),
                                  })
                                }
                                placeholder="50"
                                className={inputClass}
                              />
                            </div>

                            {/* UNIT */}

                            <div>
                              <label className={labelClass}>Unit</label>

                              <select
                                value={variant.unit || "Piece"}
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "unit",
                                    event.target.value,
                                  )
                                }
                                className={selectClass}
                              >
                                {UNITS.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* SELLING PRICE */}

                            <div>
                              <label className={labelClass}>
                                Selling Price *
                              </label>

                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                  ₹
                                </span>

                                <input
                                  type="number"
                                  min="0"
                                  value={variant.price}
                                  onChange={(event) =>
                                    updateVariant(
                                      index,
                                      "price",
                                      event.target.value
                                        ? Number(event.target.value)
                                        : 0,
                                    )
                                  }
                                  className={`${inputClass} pl-7`}
                                />
                              </div>
                            </div>

                            {/* MRP */}

                            <div>
                              <label className={labelClass}>MRP</label>

                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                  ₹
                                </span>

                                <input
                                  type="number"
                                  min="0"
                                  value={variant.originalPrice ?? ""}
                                  onChange={(event) =>
                                    updateVariant(
                                      index,
                                      "originalPrice",
                                      event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                    )
                                  }
                                  className={`${inputClass} pl-7`}
                                />
                              </div>
                            </div>

                            {/* STOCK */}

                            <div>
                              <label className={labelClass}>Stock *</label>

                              <input
                                type="number"
                                min="0"
                                value={variant.stock}
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "stock",
                                    event.target.value
                                      ? Number(event.target.value)
                                      : 0,
                                  )
                                }
                                className={inputClass}
                              />
                            </div>

                            {/* SKU */}

                            <div>
                              <label className={labelClass}>SKU</label>

                              <input
                                value={variant.sku || ""}
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "sku",
                                    event.target.value,
                                  )
                                }
                                placeholder="AUTO-400W"
                                className={inputClass}
                              />
                            </div>

                            {/* ACTIVE */}

                            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
                              <input
                                type="checkbox"
                                checked={variant.isActive}
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "isActive",
                                    event.target.checked,
                                  )
                                }
                                className="h-4 w-4 accent-blue-600"
                              />

                              <span className="text-[11px] font-semibold text-slate-600">
                                Active
                              </span>
                            </label>
                          </div>

                          {/* QUICK OPTIONS */}

                          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                Quick Options
                              </p>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {QUICK_OPTIONS.map((option) => (
                                <button
                                  type="button"
                                  key={option}
                                  onClick={() =>
                                    applyQuickOption(index, option)
                                  }
                                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[9px] font-bold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* VARIANT IMAGE */}

                          <div className="mt-4">
                            <label className={labelClass}>Variant Image</label>

                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3">
                              {variant.image ? (
                                <img
                                  src={getPublicImageUrl(variant.image)}
                                  alt=""
                                  className="h-12 w-12 rounded-lg bg-white object-contain"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
                                  <ImagePlus className="h-5 w-5 text-slate-300" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-700">
                                  {variant.image
                                    ? "Change variant image"
                                    : "Add variant image"}
                                </p>

                                <p className="text-[9px] text-slate-400">
                                  JPG, PNG or WEBP
                                </p>
                              </div>

                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={async (event) => {
                                  const file = event.target.files?.[0];

                                  if (!file) return;

                                  try {
                                    setUploading(true);
                                    setError("");

                                    const path = await uploadFile(
                                      file,
                                      "images",
                                    );

                                    updateVariant(index, "image", path);

                                    updateVariant(index, "images", [path]);
                                  } catch (err) {
                                    setError(
                                      err instanceof Error
                                        ? err.message
                                        : "Variant image upload failed.",
                                    );
                                  } finally {
                                    setUploading(false);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 text-[11px] font-bold text-blue-600 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                Add Another Variant
              </button>
            </div>
          </section>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <section className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowDescription((value) => !value)}
              className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5"
            >
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Product Description
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Optional product details, features, warranty and usage.
                </p>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  showDescription ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDescription && (
              <div className="border-t border-slate-100 p-4 sm:p-5">
                <textarea
                  rows={7}
                  value={form.longDescription || ""}
                  onChange={(event) =>
                    updateField("longDescription", event.target.value)
                  }
                  placeholder="Enter detailed product description..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            )}
          </section>

          {/* =================================================
              FINAL PREVIEW
          ================================================= */}

          <section className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm mb-10">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-bold text-slate-900">
                Listing Summary
              </h2>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-[100px_1fr] sm:p-5">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt=""
                  className="h-24 w-24 rounded-lg border border-slate-100 object-contain"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-50">
                  <ImagePlus className="h-7 w-7 text-slate-300" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-blue-600">
                  {selectedCategory.label}
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-950">
                  {form.name || "Product Name"}
                </h3>

                <p className="text-xs text-slate-500">
                  {form.brand || "Brand"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-slate-950">
                    ₹{priceSummary.price.toLocaleString("en-IN")}
                  </span>

                  {priceSummary.mrp > priceSummary.price && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{priceSummary.mrp.toLocaleString("en-IN")}
                    </span>
                  )}

                  <span className="rounded-md bg-green-50 px-2 py-1 text-[9px] font-bold text-green-700">
                    {variants.length} options
                  </span>

                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                    Stock {priceSummary.stock}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ===================================================
          BOTTOM ACTION BAR
      =================================================== */}

      <footer className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white px-3 py-2 shadow-[0_-3px_10px_rgba(0,0,0,0.05)] sm:px-4">
  <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">

    <button
      type="button"
      onClick={onClose}
      disabled={loading}
      className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:h-10 sm:px-5"
    >
      Cancel
    </button>

    <div className="hidden flex-1 text-center sm:block">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        Ready to publish
      </p>

      <p className="text-[9px] text-slate-500">
        {variants.length} variants · {priceSummary.stock} stock
      </p>
    </div>

    <button
      type="button"
      onClick={handleSave}
      disabled={loading || uploading}
      className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[10px] font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:min-w-[160px]"
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5" />
          {initial ? "Update Product" : "Add Product"}
        </>
      )}
    </button>

  </div>
</footer>
    </div>
  );
}

/* =========================================================
   MINI BOX
========================================================= */

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2.5">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}
