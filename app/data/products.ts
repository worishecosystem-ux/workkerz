/* =========================================
   products.ts
========================================= */

import { supabase } from "@/lib/supabase";

/* =========================================
   PRODUCT CATEGORY TYPE
========================================= */

export type ProductCategory =
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

/* =========================================
   PRODUCT INTERFACE
========================================= */

export interface Product {
  id: string;

  shop_id: string;

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

  images?: string[];

  brochure?: string;

  color: string;

  badge?: string;

  tags: string[];

  specs: Record<string, any>;
  about?: string;

  materialName?: string;

  unitType?: string;

  measurement?: string;

  createdAt?: string;

  is_active?: boolean;
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
    id: "sand",
    label: "Sand",
    description: "River sand & construction sand",
    image: "/categories/eaurix/River sand.png",
    color: "#F59E0B",
    bgColor: "#FFF7ED",
  },
  {
    id: "aggregate",
    label: "Aggregate",
    description: "Stone aggregate & gitti materials",
    image: "/categories/eaurix/aggregate (1).png",
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
  {
    id: "brick",
    label: "Brick",
    description: "Red bricks & fly ash bricks",
    image: "/categories/eaurix/Bricks.png",
    color: "#DC2626",
    bgColor: "#FEF2F2",
  },
  {
    id: "cement",
    label: "Cement",
    description: "Cement bags & building cement",
    image: "/categories/eaurix/cement (1).png",
    color: "#2563EB",
    bgColor: "#EFF6FF",
  },
  {
    id: "tmt",
    label: "TMT Steel",
    description: "TMT bars & steel rods",
    image: "/categories/eaurix/TMT bars.png",
    color: "#475569",
    bgColor: "#F1F5F9",
  },
  {
    id: "paint",
    label: "Paint",
    description: "Wall paint & waterproof paint",
    image: "/categories/eaurix/paints (1).png",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
  },
  {
    id: "plumbing",
    label: "Plumbing",
    description: "Pipes, taps & fittings",
    image: "/categories/eaurix/Plumbing.png",
    color: "#0891B2",
    bgColor: "#ECFEFF",
  },
  {
    id: "electrical",
    label: "Electrical",
    description: "Wires, switches & electrical items",
    image: "/categories/eaurix/electrical (1).png",
    color: "#EAB308",
    bgColor: "#FEFCE8",
  },
  {
    id: "hardware",
    label: "Hardware",
    description: "Construction hardware & fasteners",
    image: "/categories/eaurix/Hardware.png",
    color: "#52525B",
    bgColor: "#F5F5F5",
  },
  {
    id: "sanitaryware",
    label: "Sanitary Ware",
    description: "Wash basins, toilets & sanitary products",
    image: "/categories/eaurix/sanitary ware (1).png",
    color: "#059669",
    bgColor: "#ECFDF5",
  },
  {
    id: "kitchen_fittings",
    label: "Kitchen Fittings",
    description: "Kitchen sinks & accessories",
    image: "/categories/eaurix/kitchen fitting (2) (1).png",
    color: "#4F46E5",
    bgColor: "#EEF2FF",
  },
  {
    id: "water_tank",
    label: "Water Tank",
    description: "Plastic & overhead water tanks",
    image: "/categories/eaurix/tanki.png",
    color: "#0EA5E9",
    bgColor: "#E0F2FE",
  },
  {
    id: "pipes",
    label: "Pipes",
    description: "PVC, CPVC & GI pipes",
    image: "/categories/eaurix/pipes.png",
    color: "#06B6D4",
    bgColor: "#ECFEFF",
  },
  {
    id: "doors",
    label: "Doors",
    description: "Wooden, steel & PVC doors",
    image: "/categories/eaurix/doors (1).png",
    color: "#B45309",
    bgColor: "#FFF7ED",
  },
  {
    id: "windows",
    label: "Windows",
    description: "Aluminium, UPVC & wooden windows",
    image: "/categories/eaurix/windows (1).png",
    color: "#9333EA",
    bgColor: "#FDF4FF",
  },
  {
    id: "roofing",
    label: "Roofing",
    description: "Roof sheets & roofing solutions",
    image: "/categories/eaurix/roofers (1).png",
    color: "#64748B",
    bgColor: "#F1F5F9",
  },
  {
    id: "flooring",
    label: "Flooring",
    description: "Wooden, vinyl & laminate flooring",
    image: "/categories/eaurix/flloring (1).png",
    color: "#7C3AED",
    bgColor: "#FAF5FF",
  },
  {
    id: "adhesive",
    label: "Adhesive",
    description: "Tile adhesive & construction glue",
    image: "/categories/eaurix/adhesives (1).png",
    color: "#D97706",
    bgColor: "#FEF3C7",
  },
  {
    id: "tools",
    label: "Tools & Equipment",
    description: "Tools, machinery & work equipment",
    image: "/categories/eaurix/tools (1).png",
    color: "#2563EB",
    bgColor: "#EFF6FF",
  },
  {
    id: "safety",
    label: "Safety",
    description: "Safety helmets, gloves & PPE",
    image: "/categories/eaurix/safety (1).png",
    color: "#DC2626",
    bgColor: "#FEF2F2",
  },
  {
    id: "lighting",
    label: "Lighting",
    description: "LED lights & lighting fixtures",
    image: "/categories/eaurix/lights (1).png",
    color: "#CA8A04",
    bgColor: "#FFFBEB",
  },
  {
    id: "wire_cable",
    label: "Wire & Cable",
    description: "Electrical wires & power cables",
    image: "/categories/eaurix/wires and cables (1).png",
    color: "#4338CA",
    bgColor: "#EEF2FF",
  },
  {
    id: "switches",
    label: "Switches & Sockets",
    description: "Switches, sockets & electrical plates",
    image: "/categories/eaurix/Switch and socket (1).png",
    color: "#475569",
    bgColor: "#F8FAFC",
  },
  {
    id: "pumps",
    label: "Water Pumps",
    description: "Submersible & pressure pumps",
    image: "/categories/eaurix/motor pumps (1).png",
    color: "#0891B2",
    bgColor: "#ECFEFF",
  },
  {
    id: "construction_chemicals",
    label: "Construction Chemicals",
    description: "Waterproofing & repair chemicals",
    image: "/categories/eaurix/construction chemical (1).png",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
  {
    id: "steel",
    label: "Steel",
    description: "Steel sheets, sections & bars",
    image: "/categories/eaurix/steel.png",
    color: "#475569",
    bgColor: "#E2E8F0",
  },
  {
    id: "stone",
    label: "Stone",
    description: "Natural stones & paving stones",
    image: "/categories/eaurix/stone (1).png",
    color: "#64748B",
    bgColor: "#F1F5F9",
  },
  {
    id: "marble",
    label: "Marble",
    description: "Premium marble slabs & tiles",
    image: "/categories/eaurix/marble tiles (1).png",
    color: "#94A3B8",
    bgColor: "#F8FAFC",
  },
  {
    id: "granite",
    label: "Granite",
    description: "Granite slabs & countertops",
    image: "/categories/eaurix/granite marble (1).png",
    color: "#6B7280",
    bgColor: "#E5E7EB",
  },
] as const;

/* =========================================
   CATEGORY LABELS
========================================= */

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  sand: "Sand",
  aggregate: "Aggregate",
  brick: "Brick",
  cement: "Cement",
  tmt: "TMT Steel",
  paint: "Paint",
  plumbing: "Plumbing",
  tiles: "Tiles",
  electrical: "Electrical",

  hardware: "Hardware",
  sanitaryware: "Sanitary Ware",
  bathroom_fittings: "Bathroom Fittings",
  kitchen_fittings: "Kitchen Fittings",
  water_tank: "Water Tank",
  pipes: "Pipes",
  doors: "Doors",
  windows: "Windows",
  roofing: "Roofing",
  flooring: "Flooring",
  adhesive: "Adhesive",
  tools: "Tools",
  safety: "Safety Equipment",
  lighting: "Lighting",
  wire_cable: "Wire & Cable",
  switches: "Switches & Sockets",
  pumps: "Water Pumps",
  construction_chemicals: "Construction Chemicals",
  steel: "Steel",
  stone: "Stone",
  marble: "Marble",
  granite: "Granite",
};

/* =========================================
   CATEGORY COLORS
========================================= */

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  sand: "#FFF7ED",
  aggregate: "#F3F4F6",
  brick: "#FEF2F2",
  cement: "#F8FAFC",
  tmt: "#F1F5F9",
  paint: "#F5F3FF",
  plumbing: "#EFF6FF",
  tiles: "#F0FDFA",
  electrical: "#FEFCE8",

  hardware: "#F5F5F5",
  sanitaryware: "#ECFDF5",
  bathroom_fittings: "#F0F9FF",
  kitchen_fittings: "#EEF2FF",
  water_tank: "#E0F2FE",
  pipes: "#ECFEFF",
  doors: "#FFF1F2",
  windows: "#FDF4FF",
  roofing: "#F3F4F6",
  flooring: "#FAF5FF",
  adhesive: "#FEF3C7",
  tools: "#F3F4F6",
  safety: "#FEF2F2",
  lighting: "#FFFBEB",
  wire_cable: "#EEF2FF",
  switches: "#F8FAFC",
  pumps: "#ECFEFF",
  construction_chemicals: "#F5F3FF",
  steel: "#E2E8F0",
  stone: "#F1F5F9",
  marble: "#F8FAFC",
  granite: "#E5E7EB",
};

/* =========================================
   EMPTY PRODUCT
========================================= */

export const emptyProduct = (): Omit<Product, "id"> => ({
  shop_id: "",

  name: "",

  brand: "",

  category: "sand",

  categoryLabel: "Sand",

  description: "",

  longDescription: "",

  price: 0,

  originalPrice: undefined,

  rating: 4.8,

  reviewCount: 0,

  stock: 0,

  unit: "",

  image: "",

  images: [],

  brochure: "",

  color: "#FFF7ED",

  badge: undefined,

  tags: [],

  specs: {},

  is_active: true,
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

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    if (!cleanPath.startsWith("images/")) {
      cleanPath = `images/${cleanPath}`;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(cleanPath);

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

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    if (!cleanPath.startsWith("brochures/")) {
      cleanPath = `brochures/${cleanPath}`;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(cleanPath);

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
  const category = (p.category || "sand") as ProductCategory;

  return {
    id: String(p.id),

    shop_id: p.shop_id || "",

    name: p.name || "",

    brand: p.brand || "",

    category,

    categoryLabel: p.category_label || CATEGORY_LABELS[category],

    description: p.description || "",

    longDescription: p.long_description || "",

    price: Number(p.price || 0),

    originalPrice: p.original_price ? Number(p.original_price) : undefined,

    rating: Number(p.rating || 0),

    reviewCount: Number(p.review_count || 0),

    stock: Number(p.stock || 0),

    unit: p.unit || "",

    image: getBucketImage(p.image),

    images: Array.isArray(p.images)
      ? p.images.map((img: string) => getBucketImage(img))
      : [],

    brochure: getBrochureUrl(p.brochure),

    color: p.color || CATEGORY_COLORS[category],

    badge: p.badge || undefined,

    tags: Array.isArray(p.tags) ? p.tags : [],

    specs: typeof p.specs === "object" && p.specs !== null ? p.specs : {},

    is_active: p.is_active !== false,
  };
};

/* =========================================
   GET PRODUCTS
========================================= */

export async function getProducts(
  shopId?: string,
  includeOffline = false,
): Promise<Product[]> {
  try {
    let query = supabase
      .from("products")
      .select(
        `
          *,
          shops!inner (
            id,
            status
          )
        `,
      )
      .order("created_at", {
        ascending: false,
      });

    /* SHOP FILTER */

    if (shopId) {
      query = query.eq("shop_id", shopId);
    }

    /* ONLINE SHOP ONLY */

    if (!includeOffline) {
      query = query.eq("shops.status", "online");

      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.log("GET PRODUCTS ERROR:", error);

      return [];
    }

    return (data || []).map((item: any) => mapProduct(item));
  } catch (err) {
    console.log(err);

    return [];
  }
}

/* =========================================
   GET PRODUCT BY ID
========================================= */

export async function getProductById(id: string): Promise<Product | null> {
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

export async function addProduct(product: Omit<Product, "id">) {
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        shop_id: product.shop_id,

        name: product.name,

        brand: product.brand,

        category: product.category,

        category_label: product.categoryLabel,

        description: product.description,

        long_description: product.longDescription,

        price: product.price,

        original_price: product.originalPrice,

        rating: product.rating,

        review_count: product.reviewCount,

        stock: product.stock,

        unit: product.unit,

        image: product.image,

        images: product.images,

        brochure: product.brochure,

        color: product.color,

        badge: product.badge,

        tags: product.tags,

        specs: product.specs,

        is_active: product.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.log("ADD PRODUCT ERROR:", error);

    throw error;
  }

  return data;
}

/* =========================================
   UPDATE PRODUCT
========================================= */

export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabase
    .from("products")
    .update({
      shop_id: product.shop_id,

      name: product.name,

      brand: product.brand,

      category: product.category,

      category_label: product.categoryLabel,

      description: product.description,

      long_description: product.longDescription,

      price: product.price,

      original_price: product.originalPrice,

      rating: product.rating,

      review_count: product.reviewCount,

      stock: product.stock,

      unit: product.unit,

      image: product.image,

      images: product.images,

      brochure: product.brochure,

      color: product.color,

      badge: product.badge,

      tags: product.tags,

      specs: product.specs,

      is_active: product.is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.log("UPDATE PRODUCT ERROR:", error);

    throw error;
  }

  return data;
}

/* =========================================
   TOGGLE PRODUCT STATUS
========================================= */

export async function toggleProductStatus(id: string, active: boolean) {
  const { data, error } = await supabase
    .from("products")
    .update({
      is_active: active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.log("TOGGLE PRODUCT ERROR:", error);

    throw error;
  }

  return data;
}

/* =========================================
   DELETE PRODUCT
========================================= */

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.log("DELETE PRODUCT ERROR:", error);

    return false;
  }

  return true;
}

/* =========================================
   HELPERS
========================================= */

export async function getProductsByCategory(cat: ProductCategory) {
  const products = await getProducts();

  return products.filter((p) => p.category === cat);
}

/* ========================================= */

export async function getFeaturedProducts() {
  const products = await getProducts();

  return products.filter((p) => p.badge === "popular" || p.badge === "pro");
}

/* ========================================= */

export async function getRelatedProducts(product: Product, count = 4) {
  const products = await getProducts(product.shop_id);

  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, count);
}
