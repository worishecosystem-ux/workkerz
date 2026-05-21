"use client";

import { useState } from "react";

import { X, Pencil, AlertTriangle } from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  type Product,
  type ProductCategory,
  emptyProduct,
} from "@/app/data/products";

/* ========================================= */

const PRODUCT_CATEGORIES: ProductCategory[] = [
  "masonry",
  "plumbing",
  "electrical",
  "moving",
  "tools",
  "safety",
];

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  masonry: "Masonry & Concrete",

  plumbing: "Plumbing Supplies",

  electrical: "Electrical Components",

  moving: "Moving & Packing",

  tools: "Tools & Equipment",

  safety: "Safety & PPE",
};

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  masonry: "#FFF7ED",

  plumbing: "#EFF6FF",

  electrical: "#FEFCE8",

  moving: "#ECFDF5",

  tools: "#EEF2FF",

  safety: "#FEF2F2",
};

const inp =
  "w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#0EA5E9] transition-colors";

/* ========================================= */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const MAX_PDF_SIZE = 10 * 1024 * 1024;

/* ========================================= */

function ProductForm({
  initial,

  onSave,

  onClose,
}: {
  initial?: Product;

  onSave: (p: Omit<Product, "id">) => Promise<void>;

  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Product, "id">>(
    initial
      ? {
          ...initial,
        }
      : emptyProduct(),
  );

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState(form.image || "");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [brochureFile, setBrochureFile] = useState<File | null>(null);

  /* ========================================= */

  const u = (
    field: keyof Omit<Product, "id">,

    val: any,
  ) => {
    setForm((f) => {
      const updated = {
        ...f,

        [field]: val,
      };

      if (field === "category") {
        updated.categoryLabel = CATEGORY_LABELS[val as ProductCategory];

        updated.color = CATEGORY_COLORS[val as ProductCategory];
      }

      return updated;
    });
  };

  /* ========================================= */

  const validate = () => {
    if (!form.name.trim()) {
      return "Name is required";
    }

    if (!form.brand.trim()) {
      return "Brand is required";
    }

    if (form.price <= 0) {
      return "Price must be greater than 0";
    }

    return "";
  };

  /* ========================================= */

  const handleSave = async () => {
    const err = validate();

    if (err) {
      setError(err);

      return;
    }

    try {
      setLoading(true);

      setError("");

      /* =========================================
         IMAGE FILE NAME ONLY
      ========================================= */

      let imagePath = form.image || "";

      if (imageFile) {
        /* SIZE LIMIT */

        if (imageFile.size > MAX_IMAGE_SIZE) {
          setError("Image size must be less than 5MB");

          setLoading(false);

          return;
        }

        /* TYPE CHECK */

        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ];

        if (!allowedTypes.includes(imageFile.type)) {
          setError("Only PNG, JPG and WEBP images allowed");

          setLoading(false);

          return;
        }

        const ext = imageFile.name.split(".").pop();

        const fileName = `product-${Date.now()}.${ext}`;

        const storagePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(`images/${storagePath}`, imageFile, {
            cacheControl: "3600",

            upsert: false,
          });

        if (uploadError) {
          console.log(uploadError);

          setError("Image upload failed");

          setLoading(false);

          return;
        }

        /* SAVE ONLY STORAGE PATH */

        imagePath = storagePath;
      }

      /* =========================================
         PDF FILE
      ========================================= */

      let brochurePath = form.brochure || "";

      if (brochureFile) {
        if (brochureFile.size > MAX_PDF_SIZE) {
          setError("PDF size must be less than 10MB");

          setLoading(false);

          return;
        }

        const ext = brochureFile.name.split(".").pop();

        const fileName = `brochure-${Date.now()}.${ext}`;

       const storagePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(
  `brochures/${storagePath}`, brochureFile, {
            cacheControl: "3600",

            upsert: false,
          });

        if (uploadError) {
          console.log(uploadError);

          setError("PDF upload failed");

          setLoading(false);

          return;
        }

        brochurePath = storagePath;
      }

      /* =========================================
         SAVE PRODUCT
      ========================================= */

      await onSave({
        ...form,

        image: imagePath,

        brochure: brochurePath,
      });

      onClose();
    } catch (e) {
      console.log(e);

      setError("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  /* ========================================= */

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}

      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            {initial ? "Edit Product" : "Add Product"}
          </h2>

          <p className="text-xs text-[#64748B] mt-1">Manage E-Aurix products</p>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-[#64748B]" />
        </button>
      </div>

      {/* BODY */}

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* ERROR */}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm">
            <AlertTriangle className="w-4 h-4" />

            {error}
          </div>
        )}

        {/* IMAGE */}

        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-2">
            Product Image
          </label>

          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 bg-[#F8FAFC] flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">No Image</span>
              )}
            </div>

            <div className="flex-1">
              <label className="h-11 px-4 rounded-xl bg-[#0EA5E9] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer">
                <Pencil className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    if (file.size > MAX_IMAGE_SIZE) {
                      setError("Image size must be less than 5MB");

                      return;
                    }

                    setError("");

                    setImageFile(file);

                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
              </label>

              <p className="text-xs text-[#64748B] mt-2">
                PNG, JPG, WEBP • Max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* PDF */}

        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-2">
            Product Brochure PDF
          </label>

          <input
            type="file"
            accept=".pdf"
            className={inp}
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              if (file.size > MAX_PDF_SIZE) {
                setError("PDF size must be less than 10MB");

                return;
              }

              setError("");

              setBrochureFile(file);
            }}
          />
        </div>

        {/* FORM */}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Product Name">
            <input
              value={form.name}
              onChange={(e) => u("name", e.target.value)}
              className={inp}
            />
          </Field>

          <Field label="Brand">
            <input
              value={form.brand}
              onChange={(e) => u("brand", e.target.value)}
              className={inp}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => u("category", e.target.value)}
              className={inp}
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Stock">
            <input
              type="number"
              value={form.stock}
              onChange={(e) => u("stock", Number(e.target.value))}
              className={inp}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price">
            <input
              type="number"
              value={form.price}
              onChange={(e) => u("price", Number(e.target.value))}
              className={inp}
            />
          </Field>

          <Field label="Unit">
            <input
              value={form.unit}
              onChange={(e) => u("unit", e.target.value)}
              className={inp}
            />
          </Field>
        </div>

        <Field label="Short Description">
          <input
            value={form.description}
            onChange={(e) => u("description", e.target.value)}
            className={inp}
          />
        </Field>

        <Field label="Full Description">
          <textarea
            rows={5}
            value={form.longDescription}
            onChange={(e) => u("longDescription", e.target.value)}
            className={`${inp} resize-none`}
          />
        </Field>
      </div>

      {/* FOOTER */}

      <div className="p-5 border-t border-gray-100 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-[#475569]"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 h-11 rounded-xl bg-[#0EA5E9] text-white text-sm font-bold disabled:opacity-50"
        >
          {loading ? "Saving..." : initial ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </div>
  );
}

/* ========================================= */

function Field({
  label,

  children,
}: {
  label: string;

  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#64748B] mb-2">
        {label}
      </label>

      {children}
    </div>
  );
}

/* ========================================= */

export default ProductForm;
