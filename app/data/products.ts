/* =========================================
   products.ts
========================================= */

import { supabase } from "@/lib/supabase";

/* =========================================
   TYPES
========================================= */

export type ProductCategory =
  | "masonry"
  | "plumbing"
  | "electrical"
  | "moving"
  | "tools"
  | "safety";

export interface Product {
  id: string;

  name: string;

  brand: string;

  category: ProductCategory;

  categoryLabel: string;

  description: string;

  longDescription: string;

  price: number;

  originalPrice?: number;

  rating: number;

  reviewCount: number;

  stock: number;

  unit: string;

  image?: string;

  brochure?: string;

  color: string;

  badge?: string;

  tags: string[];

  specs: Record<string, string>;
}

/* =========================================
   STORAGE
========================================= */

const BUCKET = "products";

/* =========================================
   PRODUCT CATEGORIES
========================================= */

export const productCategories = [
  {
    id: "masonry",
    label: "Masonry & Concrete",
    description: "Cement, bricks & construction materials",
    color: "#F97316",
    bgColor: "#FFF7ED",
  },

  {
    id: "plumbing",
    label: "Plumbing Supplies",
    description: "Pipes, taps & plumbing materials",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
  },

  {
    id: "electrical",
    label: "Electrical Components",
    description: "Wires, switches & lighting products",
    color: "#EAB308",
    bgColor: "#FEFCE8",
  },

  {
    id: "moving",
    label: "Moving & Packing",
    description: "Packing & shifting products",
    color: "#10B981",
    bgColor: "#ECFDF5",
  },

  {
    id: "tools",
    label: "Tools & Equipment",
    description: "Professional tools & machines",
    color: "#6366F1",
    bgColor: "#EEF2FF",
  },

  {
    id: "safety",
    label: "Safety & PPE",
    description: "Safety equipment & PPE kits",
    color: "#EF4444",
    bgColor: "#FEF2F2",
  },
];

/* =========================================
   EMPTY PRODUCT
========================================= */

export const emptyProduct = (): Omit<Product, "id"> => ({
  name: "",
  brand: "",
  category: "masonry",
  categoryLabel: "Masonry & Concrete",
  description: "",
  longDescription: "",
  price: 0,
  originalPrice: undefined,
  rating: 4.8,
  reviewCount: 0,
  stock: 0,
  unit: "per item",
  image: "",
  brochure: "",
  color: "#FFF7ED",
  badge: undefined,
  tags: [],
  specs: {},
});

/* =========================================
   GET IMAGE URL
========================================= */

const getBucketImage = (fileName?: string) => {
  try {
    if (!fileName) {
      return "/placeholder.png";
    }

    let cleanPath = fileName.trim();

    cleanPath = cleanPath.replace(/^\/+/, "");

    /* if already full url */
    if (
      cleanPath.startsWith("http://") ||
      cleanPath.startsWith("https://")
    ) {
      return cleanPath;
    }

    /* prevent double images/images */
    if (!cleanPath.startsWith("images/")) {
      cleanPath = `images/${cleanPath}`;
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(cleanPath);

    return data.publicUrl;
  } catch (error) {
    console.log("IMAGE ERROR:", error);

    return "/placeholder.png";
  }
};

/* =========================================
   GET BROCHURE URL
========================================= */

const getBrochureUrl = (fileName?: string) => {
  try {
    if (!fileName) {
      return "";
    }

    let cleanPath = fileName.trim();

    cleanPath = cleanPath.replace(/^\/+/, "");

    if (
      cleanPath.startsWith("http://") ||
      cleanPath.startsWith("https://")
    ) {
      return cleanPath;
    }

    if (!cleanPath.startsWith("brochures/")) {
      cleanPath = `brochures/${cleanPath}`;
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(cleanPath);

    return data.publicUrl;
  } catch (error) {
    console.log("BROCHURE ERROR:", error);

    return "";
  }
};

/* =========================================
   MAP PRODUCT
========================================= */

const mapProduct = (p: any): Product => {
  return {
    id: String(p.id),

    name: p.name || "",

    brand: p.brand || "",

    category: p.category || "masonry",

    categoryLabel: p.category_label || "",

    description: p.description || "",

    longDescription: p.long_description || "",

    price: Number(p.price || 0),

    originalPrice: p.original_price
      ? Number(p.original_price)
      : undefined,

    rating: Number(p.rating || 0),

    reviewCount: Number(p.review_count || 0),

    stock: Number(p.stock || 0),

    unit: p.unit || "per item",

    /* IMAGE FROM BUCKET */
    image: getBucketImage(p.image),

    /* PDF FROM BUCKET */
    brochure: getBrochureUrl(p.brochure),

    color: p.color || "#F8FAFC",

    badge: p.badge || undefined,

    tags: Array.isArray(p.tags)
      ? p.tags
      : [],

    specs:
      typeof p.specs === "object" &&
      p.specs !== null
        ? p.specs
        : {},
  };
};

/* =========================================
   GET PRODUCTS
========================================= */

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.log("GET PRODUCTS ERROR:", error);

    return [];
  }

  return (data || []).map(mapProduct);
}

/* =========================================
   GET PRODUCT BY ID
========================================= */

export async function getProductById(
  id: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.log("GET PRODUCT ERROR:", error);

    return null;
  }

  return mapProduct(data);
}

/* =========================================
   ADD PRODUCT
========================================= */

export async function addProduct(
  product: Omit<Product, "id">,
) {
  const { error } = await supabase
    .from("products")
    .insert([
      {
        name: product.name,

        brand: product.brand,

        category: product.category,

        category_label:
          product.categoryLabel,

        description:
          product.description,

        long_description:
          product.longDescription,

        price: product.price,

        original_price:
          product.originalPrice,

        rating: product.rating,

        review_count:
          product.reviewCount,

        stock: product.stock,

        unit: product.unit,

        /* SAVE ONLY FILE NAME */
        image: product.image,

        brochure: product.brochure,

        color: product.color,

        badge: product.badge,

        tags: product.tags,

        specs: product.specs,
      },
    ]);

  if (error) {
    console.log(
      "ADD PRODUCT ERROR:",
      error,
    );

    return false;
  }

  return true;
}

/* =========================================
   UPDATE PRODUCT
========================================= */

export async function updateProduct(
  id: string,
  product: Partial<Product>,
) {
  const { error } = await supabase
    .from("products")
    .update({
      name: product.name,

      brand: product.brand,

      category: product.category,

      category_label:
        product.categoryLabel,

      description:
        product.description,

      long_description:
        product.longDescription,

      price: product.price,

      original_price:
        product.originalPrice,

      rating: product.rating,

      review_count:
        product.reviewCount,

      stock: product.stock,

      unit: product.unit,

      image: product.image,

      brochure: product.brochure,

      color: product.color,

      badge: product.badge,

      tags: product.tags,

      specs: product.specs,
    })
    .eq("id", id);

  if (error) {
    console.log(
      "UPDATE PRODUCT ERROR:",
      error,
    );

    return false;
  }

  return true;
}

/* =========================================
   DELETE PRODUCT
========================================= */

export async function deleteProduct(
  id: string,
) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(
      "DELETE PRODUCT ERROR:",
      error,
    );

    return false;
  }

  return true;
}

/* =========================================
   HELPERS
========================================= */

export async function getProductsByCategory(
  cat: ProductCategory,
) {
  const products =
    await getProducts();

  return products.filter(
    (p) => p.category === cat,
  );
}

export async function getFeaturedProducts() {
  const products =
    await getProducts();

  return products.filter(
    (p) =>
      p.badge === "popular" ||
      p.badge === "pro",
  );
}

export async function getRelatedProducts(
  product: Product,
  count = 4,
) {
  const products =
    await getProducts();

  return products
    .filter(
      (p) =>
        p.category === product.category &&
        p.id !== product.id,
    )
    .slice(0, count);
}