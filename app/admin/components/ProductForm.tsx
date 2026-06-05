"use client";

import { useState } from "react";


import {
  X,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  ImagePlus,
  FileText,
  ChevronDown,
} from "lucide-react";

import * as XLSX from "xlsx";

import { supabase } from "@/lib/supabase";

import { type Product, emptyProduct } from "@/app/data/products";


import {
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
} from "lucide-react";

/* ========================================= */
/* CATEGORY TYPES */
/* ========================================= */

type ProductCategory =
  | "sand"
  | "aggregate"
  | "brick"
  | "cement"
  | "tmt"
  | "paint"
  | "plumbing"
  | "tiles"
  | "electrical"
  | "hardware"
  | "sanitaryware"
  | "bathroom_fittings"
  | "kitchen_fittings"
  | "water_tank"
  | "pipes"
  | "doors"
  | "windows"
  | "roofing"
  | "flooring"
  | "adhesive"
  | "tools"
  | "safety"
  | "lighting"
  | "wire_cable"
  | "switches"
  | "pumps"
  | "construction_chemicals"
  | "steel"
  | "stone"
  | "marble"
  | "granite";

/* ========================================= */
/* CATEGORIES */
/* ========================================= */

const PRODUCT_CATEGORIES: {
  id: ProductCategory;
  name: string;
  image: string;
}[] = [
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
  {
    id: "hardware",
    name: "Hardware",
    image: "/hardware.webp",
  },
  {
    id: "sanitaryware",
    name: "Sanitaryware",
    image: "/sanitaryware.webp",
  },
  {
    id: "bathroom_fittings",
    name: "Bathroom Fittings",
    image: "/bathroom-fittings.webp",
  },
  {
    id: "kitchen_fittings",
    name: "Kitchen Fittings",
    image: "/kitchen-fittings.webp",
  },
  {
    id: "water_tank",
    name: "Water Tank",
    image: "/water-tank.webp",
  },
  {
    id: "pipes",
    name: "Pipes & Fittings",
    image: "/pipes.webp",
  },
  {
    id: "doors",
    name: "Doors",
    image: "/doors.webp",
  },
  {
    id: "windows",
    name: "Windows",
    image: "/windows.webp",
  },
  {
    id: "roofing",
    name: "Roofing Sheets",
    image: "/roofing.webp",
  },
  {
    id: "flooring",
    name: "Flooring",
    image: "/flooring.webp",
  },
  {
    id: "adhesive",
    name: "Adhesives",
    image: "/adhesive.webp",
  },
  {
    id: "tools",
    name: "Tools & Equipment",
    image: "/tools.webp",
  },
  {
    id: "safety",
    name: "Safety Equipment",
    image: "/safety.webp",
  },
  {
    id: "lighting",
    name: "Lighting",
    image: "/lighting.webp",
  },
  {
    id: "wire_cable",
    name: "Wires & Cables",
    image: "/wire-cable.webp",
  },
  {
    id: "switches",
    name: "Switches & Sockets",
    image: "/switches.webp",
  },
  {
    id: "pumps",
    name: "Water Pumps",
    image: "/pump.webp",
  },
  {
    id: "construction_chemicals",
    name: "Construction Chemicals",
    image: "/chemical.webp",
  },
  {
    id: "steel",
    name: "Steel Products",
    image: "/steel.webp",
  },
  {
    id: "stone",
    name: "Natural Stone",
    image: "/stone.webp",
  },
  {
    id: "marble",
    name: "Marble",
    image: "/marble.webp",
  },
  {
    id: "granite",
    name: "Granite",
    image: "/granite.webp",
  },
];

/* ========================================= */

const inp =
  "w-full bg-[#F8FAFC] border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#0EA5E9]";

/* ========================================= */




function ProductForm({
  shop,
  initial,
  onSave,
  onClose,
}: {
  shop: any;

  initial?: Product;

  onSave: (p: Omit<Product, "id">) => Promise<void>;

  onClose: () => void;
}) {
  const [mode, setMode] = useState<"manual" | "excel">("manual");

  const [loading, setLoading] = useState(false);

  const [importLoading, setImportLoading] = useState(false);

  const [error, setError] = useState("");

  const [excelFile, setExcelFile] = useState<File | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");

  const [brochureFile, setBrochureFile] = useState<File | null>(null);

  const [brochureName, setBrochureName] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);

  const [showCropper, setShowCropper] = useState(false);


  const [selectedImage, setSelectedImage] = useState("");


 const [zoom, setZoom] = useState(1);
const [rotation, setRotation] = useState(0);

  

  /* ========================================= */

  const [form, setForm] = useState<Omit<Product, "id">>(
    initial
      ? {
          ...initial,
        }
      : {
          ...emptyProduct(),

          shop_id: shop?.id || "",

          category: "sand" as any,

          categoryLabel: "Sand",

          color: "#FFF7ED",
        },
  );

  

  /* ========================================= */

  const selectedCategory =
    PRODUCT_CATEGORIES.find((c) => c.id === form.category) ||
    PRODUCT_CATEGORIES[0];

  /* ========================================= */

  const u = (field: keyof Omit<Product, "id">, value: any) => {
    setForm((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  /* ========================================= */
  /* IMAGE UPLOAD */
  /* ========================================= */

  async function uploadImage(file: File) {
    const ext = file.name.split(".").pop();

    const fileName = `product-${Date.now()}.${ext}`;

    const storagePath = `images/${fileName}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(storagePath, file);

    if (error) {
      throw error;
    }

    return fileName;
  }

  /* ========================================= */
  /* BROCHURE UPLOAD */
  /* ========================================= */

  async function uploadBrochure(file: File) {
    const ext = file.name.split(".").pop();

    const fileName = `brochure-${Date.now()}.${ext}`;

    const storagePath = `brochures/${fileName}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(storagePath, file);

    if (error) {
      throw error;
    }

    return fileName;
  }

  /* ========================================= */
  /* SAVE PRODUCT */
  /* ========================================= */

  async function handleSave() {
    try {
      setLoading(true);

      setError("");

      let imagePath = form.image || "";

      let brochurePath = form.brochure || "";

      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }

      if (brochureFile) {
        brochurePath = await uploadBrochure(brochureFile);
      }

      await onSave({
        ...form,

        shop_id: shop?.id,

        category: form.category,

        categoryLabel: selectedCategory.name,

        image: imagePath,

        images: imagePath ? [imagePath] : [],

        brochure: brochurePath,
      });

      onClose();
    } catch (err) {
      console.log(err);

      setError("Failed to save product");
    } finally {
      setLoading(false);
    }
  }

 const handleImageSelect = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file =
    e.target.files?.[0];

  if (!file) return;

  const url =
    URL.createObjectURL(file);

  setSelectedImage(url);

  setZoom(1);
  setRotation(0);

  setShowCropper(true);
};

  /* ========================================= */
  /* EXCEL IMPORT */
  /* ========================================= */

  async function handleExcelImport() {
    try {
      if (!excelFile) {
        setError("Select excel file");
        return;
      }

      setImportLoading(true);
      setError("");

      const buffer = await excelFile.arrayBuffer();

      const workbook = XLSX.read(buffer);

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const normalize = (text: string) =>
        text
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(/[\s_-]+/g, "");

      for (const row of rows) {
        const categoryText = normalize(String(row["Category"] || ""));

        const category = PRODUCT_CATEGORIES.find(
          (c) =>
            normalize(c.id) === categoryText ||
            normalize(c.name) === categoryText,
        );

        const categoryId = (category?.id || "sand") as ProductCategory;

        await onSave({
          ...emptyProduct(),

          shop_id: shop?.id,

          name: row["Product Name"] || row["Material Name"] || "",

          brand: row["Brand"] || "Local Supplier",

          category: categoryId as any,

          categoryLabel: category?.name || "Sand",

          description: row["Measurement"] || "",

          longDescription: row["About Product"] || row["About"] || "",

          price: Number(
            String(row["Price"] || 0)
              .replace("₹", "")
              .replace(",", "")
              .trim(),
          ),

          stock: Number(row["Stock"] || 0) || 0,

          unit: row["Unit Type"] || "",

          image: "",

          images: [],

          brochure: "",

          color: "#FFF7ED",

          badge: undefined,

          tags: [],

          specs: {
            measurement: row["Measurement"] || "",
          },
        });
      }

      onClose();
    } catch (err) {
      console.log(err);

      setError("Excel import failed");
    } finally {
      setImportLoading(false);
    }
  }

  {
  }

  /* ========================================= */

  return (
    <>
      {showCropper && (
  <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
    <div className="bg-white rounded-3xl w-[95vw] max-w-3xl overflow-hidden">

      <div className="h-[500px] bg-gray-100 flex items-center justify-center overflow-hidden">

        <img
          src={selectedImage}
          alt=""
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: "0.2s",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />

      </div>

      <div className="p-5 space-y-4">

        <div className="flex items-center gap-3">
          <ZoomOut size={18} />

          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) =>
              setZoom(Number(e.target.value))
            }
            className="flex-1"
          />

          <ZoomIn size={18} />
        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              setRotation(rotation - 90)
            }
            className="flex-1 h-11 rounded-xl bg-gray-100 font-medium"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Left
          </button>

          <button
            onClick={() =>
              setRotation(rotation + 90)
            }
            className="flex-1 h-11 rounded-xl bg-gray-100 font-medium"
          >
            <RotateCw className="w-4 h-4 inline mr-2" />
            Right
          </button>

        </div>

        <div className="flex gap-3">

          <button
            onClick={() => {
              setZoom(1);
              setRotation(0);
            }}
            className="flex-1 h-12 rounded-xl border"
          >
            Reset
          </button>

          <button
            onClick={() => {
              setImageFile(null);
              setImagePreview("");
              setSelectedImage("");
              setShowCropper(false);
            }}
            className="flex-1 h-12 rounded-xl bg-red-500 text-white"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Remove
          </button>

          <button
            onClick={async () => {
              const response =
                await fetch(selectedImage);

              const blob =
                await response.blob();

              const file =
                new File(
                  [blob],
                  `product-${Date.now()}.jpg`,
                  {
                    type:
                      "image/jpeg",
                  }
                );

              setImageFile(file);
              setImagePreview(selectedImage);

              setShowCropper(false);
            }}
            className="flex-1 h-12 rounded-xl bg-sky-500 text-white font-bold"
          >
            Save Image
          </button>

        </div>

      </div>

    </div>
  </div>
)}
      <div className="flex flex-col h-full bg-white">
        {/* HEADER */}

        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A]">
              Product Manager
            </h2>

            <p className="text-sm text-gray-500 mt-1">{shop?.shop_name}</p>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE */}

        <div className="p-5 flex gap-3 border-b border-gray-100">
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 h-12 rounded-2xl font-black text-sm ${
              mode === "manual"
                ? "bg-[#0EA5E9] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Manual Product
          </button>

          <button
            onClick={() => setMode("excel")}
            className={`flex-1 h-12 rounded-2xl font-black text-sm ${
              mode === "excel"
                ? "bg-[#0EA5E9] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Import Excel
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mx-5 mt-5 p-3 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />

            {error}
          </div>
        )}

        {/* ========================================= */}
        {/* MANUAL */}
        {/* ========================================= */}

        {mode === "manual" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* CATEGORY */}

            <div className="relative">
              <label className="block text-xs font-black text-gray-500 mb-2">
                Product Category
              </label>

              <button
                type="button"
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-[#F8FAFC] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCategory.image}
                    className="w-9 h-9 rounded-xl object-cover"
                  />

                  <span className="text-sm font-bold text-[#0F172A]">
                    {selectedCategory.name}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {categoryOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        u("category", category.id);

                        u("categoryLabel", category.name);

                        setCategoryOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-sky-50 transition-colors"
                    >
                      <img
                        src={category.image}
                        className="w-10 h-10 rounded-xl object-cover"
                      />

                      <span className="text-sm font-bold text-[#0F172A]">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* IMAGE */}

            <div>
              <label className="block text-xs font-black text-gray-500 mb-3">
                Product Image
              </label>

              <label className="relative h-44 rounded-3xl border-2 border-dashed border-sky-300 bg-sky-50 flex items-center justify-center cursor-pointer overflow-hidden">
                {imagePreview ? (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <img
                      src={imagePreview}
                      alt="Product"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImagePlus className="w-10 h-10 text-sky-500 mb-3" />
                    <p className="text-sm font-black text-sky-700">
                      Upload Product Image
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>
            </div>

            {/* BROCHURE */}

            <div>
              <label className="block text-xs font-black text-gray-500 mb-3">
                Product Brochure PDF
              </label>

              <label className="h-32 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50 flex flex-col items-center justify-center cursor-pointer">
                <FileText className="w-8 h-8 text-emerald-500 mb-2" />

                <p className="text-sm font-black text-emerald-700">
                  Upload Brochure
                </p>

                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    setBrochureFile(file);

                    setBrochureName(file.name);
                  }}
                />
              </label>

              {brochureName && (
                <div className="mt-3 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <p className="text-sm font-bold">{brochureName}</p>
                </div>
              )}
            </div>

            {/* NAME */}

            <Field label="Product Name">
              <input
                value={form.name}
                onChange={(e) => u("name", e.target.value)}
                className={inp}
              />
            </Field>

            {/* BRAND */}

            <Field label="Brand">
              <input
                value={form.brand}
                onChange={(e) => u("brand", e.target.value)}
                className={inp}
              />
            </Field>

            {/* UNIT */}

            <Field label="Unit Type">
              <input
                value={form.unit}
                onChange={(e) => u("unit", e.target.value)}
                className={inp}
              />
            </Field>

            {/* MEASUREMENT */}

            <Field label="Measurement">
              <input
                value={form.description}
                onChange={(e) => u("description", e.target.value)}
                className={inp}
              />
            </Field>

            {/* PRICE */}

            <Field label="Price">
              <input
                type="number"
                value={form.price}
                onChange={(e) => u("price", Number(e.target.value))}
                className={inp}
              />
            </Field>

            {/* ABOUT */}

            <Field label="About Product">
              <textarea
                rows={5}
                value={form.longDescription}
                onChange={(e) => u("longDescription", e.target.value)}
                className={`${inp} resize-none`}
              />
            </Field>

            {/* SAVE */}

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-[#0EA5E9] text-white font-black"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        )}

        {/* EXCEL */}

        {mode === "excel" && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="rounded-3xl border border-dashed border-sky-300 bg-sky-50 p-8 text-center">
              <FileSpreadsheet className="w-14 h-14 mx-auto text-sky-500 mb-4" />

              <h3 className="text-xl font-black text-[#0F172A]">
                Import Material List
              </h3>

              <label className="inline-flex mt-5 h-12 px-5 rounded-2xl bg-[#0EA5E9] text-white font-black items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Select Excel File
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                />
              </label>

              {excelFile && (
                <div className="mt-5 p-4 rounded-2xl bg-white border border-gray-200">
                  <p className="text-sm font-bold">{excelFile.name}</p>
                </div>
              )}

              <button
                onClick={handleExcelImport}
                disabled={importLoading}
                className="w-full mt-5 h-12 rounded-2xl bg-emerald-500 text-white font-black"
              >
                {importLoading ? "Importing..." : "Import Products"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
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
      <label className="block text-xs font-black text-gray-500 mb-2">
        {label}
      </label>

      {children}
    </div>
  );
}

export default ProductForm;
