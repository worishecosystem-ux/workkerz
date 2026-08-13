/* =========================================
   app/data/products.ts
========================================= */

import { supabase } from "@/lib/supabase";

/* =========================================
   PRODUCT CATEGORY
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
  | "granite"

/* =========================================
   CATEGORY
========================================= */

export interface ProductCategoryItem {
  id: ProductCategory;
  label: string;
  description: string;
  image: string;
  color: string;
  bgColor: string;
}

/* =========================================
   VARIANT
========================================= */

export interface ProductVariant {
  id: string;
  productId: string;

  variantName: string;

  watt?: number | null;

  price: number;
  originalPrice?: number | null;

  stock: number;

  sku?: string | null;
  unit?: string | null;

  specs: Record<string, unknown>;

  image?: string;
  images: string[];

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/* =========================================
   PRODUCT
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

  specs: Record<string, unknown>;

  about?: string;

  materialName?: string;
  unitType?: string;
  measurement?: string;

  variants: ProductVariant[];

  hasVariants: boolean;

  createdAt?: string;

  is_active?: boolean;
}

/* =========================================
   STORAGE
========================================= */

const BUCKET = "products";

/* =========================================
   CATEGORY LIST
========================================= */

export const productCategories: ProductCategoryItem[] = [
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
    id: "tiles",
    label: "Tiles",
    description: "Floor, wall & bathroom tiles",
    image: "/categories/eaurix/tiles.png",
    color: "#0F766E",
    bgColor: "#F0FDFA",
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
    id: "bathroom_fittings",
    label: "Bathroom Fittings",
    description: "Taps, showers & bathroom accessories",
    image: "/categories/eaurix/Bathroom fitting.png",
    color: "#0284C7",
    bgColor: "#F0F9FF",
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
    label: "Safety Equipment",
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
    id: "granite",
    label: "Granite",
    description: "Granite slabs & countertops",
    image: "/categories/eaurix/granite marble (1).png",
    color: "#6B7280",
    bgColor: "#E5E7EB",
  },
 
];

/* =========================================
   CATEGORY MAPS
========================================= */

export const CATEGORY_LABELS = Object.fromEntries(
  productCategories.map((category) => [
    category.id,
    category.label,
  ]),
) as Record<ProductCategory, string>;

export const CATEGORY_COLORS = Object.fromEntries(
  productCategories.map((category) => [
    category.id,
    category.bgColor,
  ]),
) as Record<ProductCategory, string>;

/* =========================================
   CATEGORY NORMALIZER
========================================= */

function normalizeCategory(
  value?: string | null,
): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

/* =========================================
   CATEGORY ALIASES
========================================= */

const CATEGORY_ALIASES: Record<
  string,
  ProductCategory
> = {
  sand: "sand",

  aggregate: "aggregate",
  aggregates: "aggregate",

  brick: "brick",
  bricks: "brick",

  cement: "cement",

  tmt: "tmt",
  tmtsteel: "tmt",
  tmtbars: "tmt",

  paint: "paint",
  paints: "paint",

  plumbing: "plumbing",

  tiles: "tiles",
  tile: "tiles",

  electrical: "electrical",

  hardware: "hardware",

  sanitaryware: "sanitaryware",
  sanitary: "sanitaryware",
  sanitarywares: "sanitaryware",

  bathroomfittings: "bathroom_fittings",
  bathroomfitting: "bathroom_fittings",

  kitchenfittings: "kitchen_fittings",
  kitchenfitting: "kitchen_fittings",

  watertank: "water_tank",
  watertanks: "water_tank",
  tank: "water_tank",

  pipes: "pipes",
  pipe: "pipes",
  pipesfittings: "pipes",
  pipefittings: "pipes",

  doors: "doors",
  door: "doors",

  windows: "windows",
  window: "windows",

  roofing: "roofing",

  flooring: "flooring",

  adhesive: "adhesive",
  adhesives: "adhesive",

  tools: "tools",
  tool: "tools",
  toolsequipment: "tools",

  safety: "safety",
  safetyequipment: "safety",

  lighting: "lighting",
  lights: "lighting",

  wirecable: "wire_cable",
  wirescables: "wire_cable",
  wireandcable: "wire_cable",

  switches: "switches",
  switchessockets: "switches",
  switchandsockets: "switches",

  pumps: "pumps",
  pump: "pumps",
  waterpumps: "pumps",

  constructionchemicals:
    "construction_chemicals",

  steel: "steel",

  stone: "stone",

  granite: "granite",
};

/* =========================================
   CATEGORY HELPERS
========================================= */

export function getProductCategory(
  id?: string | null,
): ProductCategoryItem {
  const resolved = findProductCategory(id);

  return resolved;
}

/* =========================================
   FIND CATEGORY
========================================= */

export function findProductCategory(
  value?: string | null,
): ProductCategoryItem {
  const normalized = normalizeCategory(value);

  /*
   * 1. Direct database/category ID alias
   */
  const alias =
    CATEGORY_ALIASES[normalized];

  if (alias) {
    const category = productCategories.find(
      (item) => item.id === alias,
    );

    if (category) {
      return category;
    }
  }

  /*
   * 2. Exact ID match
   */
  const byId = productCategories.find(
    (category) =>
      normalizeCategory(category.id) ===
      normalized,
  );

  if (byId) {
    return byId;
  }

  /*
   * 3. Label match
   */
  const byLabel = productCategories.find(
    (category) =>
      normalizeCategory(category.label) ===
      normalized,
  );

  if (byLabel) {
    return byLabel;
  }

  /*
   * 4. Never silently return Sand for an
   *    unknown category.
   *
   *    Return Sand only as final safety fallback.
   */
  return productCategories[0];
}

/* =========================================
   SAFE HELPERS
========================================= */

function safeString(
  value: unknown,
  fallback = "",
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const result = String(value).trim();

  return result || fallback;
}

function safeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const result = Number(value);

  return Number.isFinite(result)
    ? result
    : fallback;
}

function safeObject(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

function safeArray(
  value: unknown,
): unknown[] {
  return Array.isArray(value)
    ? value
    : [];
}

/* =========================================
   STORAGE URL
========================================= */

function getStorageUrl(
  value?: string | null,
  folder = "",
): string {
  const fallback = "/placeholder.png";

  if (!value) {
    return fallback;
  }

  const raw = String(value).trim();

  if (!raw) {
    return fallback;
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  let path = raw.replace(/^\/+/, "");

  if (
    folder &&
    !path.startsWith(`${folder}/`)
  ) {
    path = `${folder}/${path}`;
  }

  const { data } =
    supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

  return (
    data?.publicUrl ||
    fallback
  );
}

/* =========================================
   PRODUCT IMAGE
========================================= */

function getProductImage(
  value?: string | null,
): string {
  return getStorageUrl(
    value,
    "images",
  );
}

/* =========================================
   BROCHURE
========================================= */

function getBrochureUrl(
  value?: string | null,
): string {
  if (!value) {
    return "";
  }

  const raw = String(value).trim();

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/")
  ) {
    return raw;
  }

  return getStorageUrl(
    raw,
    "brochures",
  );
}

/* =========================================
   SELECTS
========================================= */

const PRODUCT_VARIANT_SELECT = `
  id,
  product_id,
  variant_name,
  watt,
  price,
  original_price,
  stock,
  sku,
  unit,
  specs,
  image,
  images,
  is_active,
  created_at,
  updated_at
`;

const PRODUCT_SELECT = `
  id,
  shop_id,
  name,
  brand,
  category,
  category_label,
  description,
  long_description,
  price,
  original_price,
  rating,
  review_count,
  stock,
  unit,
  image,
  images,
  brochure,
  color,
  badge,
  tags,
  specs,
  about,
  material_name,
  unit_type,
  measurement,
  is_active,
  created_at,
  product_variants (
    ${PRODUCT_VARIANT_SELECT}
  )
`;

/* =========================================
   EMPTY VARIANT
========================================= */

export function emptyProductVariant(
  productId = "",
): ProductVariant {
  return {
    id: "",
    productId,
    variantName: "",
    watt: null,
    price: 0,
    originalPrice: null,
    stock: 0,
    sku: null,
    unit: "Piece",
    specs: {},
    image: "",
    images: [],
    isActive: true,
  };
}

/* =========================================
   EMPTY PRODUCT
========================================= */

export const emptyProduct =
  (): Omit<Product, "id"> => ({
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

    color:
      productCategories[0].color,

    badge: undefined,

    tags: [],

    specs: {},

    about: "",

    materialName: "",
    unitType: "",
    measurement: "",

    variants: [],
    hasVariants: false,

    is_active: true,
  });

/* =========================================
   MAP VARIANT
========================================= */

function mapVariant(
  variant: Record<string, unknown>,
): ProductVariant {
  const rawImages = safeArray(
    variant.images,
  );

  const images = rawImages
    .filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        String(item).trim() !== "",
    )
    .map((item) =>
      getProductImage(
        String(item),
      ),
    );

  const rawImage = safeString(
    variant.image,
  );

  return {
    id: safeString(
      variant.id,
    ),

    productId: safeString(
      variant.product_id ??
        variant.productId,
    ),

    variantName:
      safeString(
        variant.variant_name ??
          variant.variantName,
      ) || "Option",

    watt:
      variant.watt === null ||
      variant.watt === undefined ||
      variant.watt === ""
        ? null
        : safeNumber(
            variant.watt,
          ),

    price: safeNumber(
      variant.price,
    ),

    originalPrice:
      variant.original_price ===
        null ||
      variant.original_price ===
        undefined ||
      variant.original_price ===
        ""
        ? null
        : safeNumber(
            variant.original_price,
          ),

    stock: safeNumber(
      variant.stock,
    ),

    sku:
      safeString(
        variant.sku,
      ) || null,

    unit:
      safeString(
        variant.unit,
      ) || null,

    specs: safeObject(
      variant.specs,
    ),

    image: rawImage
      ? getProductImage(
          rawImage,
        )
      : images[0] || "",

    images,

    isActive:
      variant.is_active !== false,

    createdAt:
      safeString(
        variant.created_at,
      ) || undefined,

    updatedAt:
      safeString(
        variant.updated_at,
      ) || undefined,
  };
}

/* =========================================
   MAP VARIANTS
========================================= */

function mapVariants(
  variants: unknown,
): ProductVariant[] {
  if (!Array.isArray(variants)) {
    return [];
  }

  return variants
    .filter(
      (
        variant,
      ): variant is Record<
        string,
        unknown
      > =>
        !!variant &&
        typeof variant ===
          "object" &&
        !Array.isArray(
          variant,
        ),
    )
    .map(mapVariant)
    .sort((a, b) => {
      if (
        a.watt !== null &&
        a.watt !== undefined &&
        b.watt !== null &&
        b.watt !== undefined
      ) {
        return a.watt - b.watt;
      }

      if (
        a.price !== b.price
      ) {
        return (
          a.price - b.price
        );
      }

      return a.variantName.localeCompare(
        b.variantName,
      );
    });
}

/* =========================================
   MAP PRODUCT
========================================= */

function mapProduct(
  product: Record<string, unknown>,
): Product {
  const categoryData =
    findProductCategory(
      safeString(
        product.category,
      ),
    );

  const variants =
    mapVariants(
      product.product_variants ??
        product.variants ??
        [],
    );

  const activeVariants =
    variants.filter(
      (variant) =>
        variant.isActive,
    );

  const name =
    safeString(
      product.name,
    ) ||
    safeString(
      product.product_name,
    ) ||
    safeString(
      product.title,
    ) ||
    "Product";

  const brand =
    safeString(
      product.brand,
    ) ||
    safeString(
      product.brand_name,
    );

  const rawImages =
    safeArray(
      product.images,
    );

  const images =
    rawImages
      .filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          String(item).trim() !== "",
      )
      .map((item) =>
        getProductImage(
          String(item),
        ),
      );

  const rawMainImage =
    safeString(
      product.image,
    ) ||
    safeString(
      product.product_image,
    ) ||
    images[0] ||
    "";

  const mainImage =
    rawMainImage
      ? getProductImage(
          rawMainImage,
        )
      : "/placeholder.png";

  const variantPrices =
    activeVariants
      .map((variant) =>
        safeNumber(
          variant.price,
        ),
      )
      .filter(
        (price) =>
          price >= 0,
      );

  const lowestVariantPrice =
    variantPrices.length
      ? Math.min(
          ...variantPrices,
        )
      : safeNumber(
          product.price,
        );

  const variantStock =
    activeVariants.reduce(
      (total, variant) =>
        total +
        safeNumber(
          variant.stock,
        ),
      0,
    );

  const stock =
    activeVariants.length
      ? variantStock
      : safeNumber(
          product.stock,
        );

  const originalPrice =
    product.original_price !==
      null &&
    product.original_price !==
      undefined &&
    product.original_price !==
      ""
      ? safeNumber(
          product.original_price,
        )
      : undefined;

  const tags =
    safeArray(
      product.tags,
    )
      .filter(
        (tag) =>
          tag !== null &&
          tag !== undefined &&
          String(tag).trim() !== "",
      )
      .map(String);

  return {
    id: safeString(
      product.id,
    ),

    shop_id:
      safeString(
        product.shop_id,
      ) ||
      safeString(
        product.shopId,
      ),

    name,
    brand,

    category:
      categoryData.id,

    categoryLabel:
      safeString(
        product.category_label,
      ) ||
      categoryData.label,

    description:
      safeString(
        product.description,
      ),

    longDescription:
      safeString(
        product.long_description,
      ) ||
      safeString(
        product.longDescription,
      ),

    price:
      activeVariants.length
        ? lowestVariantPrice
        : safeNumber(
            product.price,
          ),

    originalPrice,

    rating: safeNumber(
      product.rating,
    ),

    reviewCount:
      safeNumber(
        product.review_count ??
          product.reviewCount,
      ),

    stock,

    unit:
      safeString(
        product.unit,
      ) ||
      safeString(
        product.unit_type,
      ),

    image: mainImage,

    images,

    brochure:
      getBrochureUrl(
        safeString(
          product.brochure,
        ),
      ),

    color:
      safeString(
        product.color,
      ) ||
      categoryData.color,

    badge:
      safeString(
        product.badge,
      ) || undefined,

    tags,

    specs: safeObject(
      product.specs,
    ),

    about:
      safeString(
        product.about,
      ) || undefined,

    materialName:
      safeString(
        product.material_name,
      ) ||
      safeString(
        product.materialName,
      ) ||
      undefined,

    unitType:
      safeString(
        product.unit_type,
      ) ||
      safeString(
        product.unitType,
      ) ||
      undefined,

    measurement:
      safeString(
        product.measurement,
      ) || undefined,

    variants,

    hasVariants:
      activeVariants.length >
      0,

    createdAt:
      safeString(
        product.created_at,
      ) || undefined,

    is_active:
      product.is_active !==
      false,
  };
}

/* =========================================
   GET PRODUCT VARIANTS
========================================= */

export async function getProductVariants(
  productId: string,
): Promise<ProductVariant[]> {
  if (!productId) {
    return [];
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from(
        "product_variants",
      )
      .select(
        PRODUCT_VARIANT_SELECT,
      )
      .eq(
        "product_id",
        productId,
      )
      .eq(
        "is_active",
        true,
      )
      .order("watt", {
        ascending: true,
        nullsFirst: false,
      });

    if (error) {
      console.error(
        "GET PRODUCT VARIANTS ERROR:",
        error.message,
      );

      return [];
    }

    return mapVariants(data);
  } catch (error) {
    console.error(
      "GET PRODUCT VARIANTS ERROR:",
      error,
    );

    return [];
  }
}

/* =========================================
   GET PRODUCTS
========================================= */

export async function getProducts(
  shopId?: string,
  includeOffline = false,
  limit = 100,
): Promise<Product[]> {
  try {
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(limit);

    if (shopId) {
      query = query.eq(
        "shop_id",
        shopId,
      );
    }

    if (!includeOffline) {
      query = query.eq(
        "is_active",
        true,
      );
    }

    const {
      data,
      error,
    } = await query;

    if (error) {
      console.error(
        "GET PRODUCTS ERROR:",
        error.message,
      );

      return [];
    }

    return (
      data ?? []
    ).map((item) =>
      mapProduct(
        item as unknown as Record<
          string,
          unknown
        >,
      ),
    );
  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error,
    );

    return [];
  }
}

/* =========================================
   GET PRODUCT BY ID
========================================= */

export async function getProductById(
  id: string,
): Promise<Product | null> {
  if (!id) {
    return null;
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "GET PRODUCT BY ID ERROR:",
        error.message,
      );

      return null;
    }

    if (!data) {
      return null;
    }

    return mapProduct(
      data as Record<
        string,
        unknown
      >,
    );
  } catch (error) {
    console.error(
      "GET PRODUCT BY ID ERROR:",
      error,
    );

    return null;
  }
}

/* =========================================
   ADD PRODUCT
========================================= */

export async function addProduct(
  product: Omit<Product, "id">,
) {
  const payload = {
    shop_id:
      product.shop_id || null,

    name:
      safeString(
        product.name,
      ) || "Product",

    brand:
      safeString(
        product.brand,
      ),

    category:
      findProductCategory(
        product.category,
      ).id,

    category_label:
      product.categoryLabel ||
      getProductCategory(
        product.category,
      ).label,

    description:
      product.description || "",

    long_description:
      product.longDescription || "",

    price:
      safeNumber(
        product.price,
      ),

    original_price:
      product.originalPrice ??
      null,

    rating:
      safeNumber(
        product.rating,
        4.8,
      ),

    review_count:
      safeNumber(
        product.reviewCount,
      ),

    stock:
      safeNumber(
        product.stock,
      ),

    unit:
      product.unit || "",

    image:
      product.image || null,

    images:
      Array.isArray(
        product.images,
      )
        ? product.images
        : [],

    brochure:
      product.brochure || null,

    color:
      product.color ||
      getProductCategory(
        product.category,
      ).color,

    badge:
      product.badge || null,

    tags:
      Array.isArray(
        product.tags,
      )
        ? product.tags
        : [],

    specs:
      product.specs || {},

    about:
      product.about || null,

    material_name:
      product.materialName ||
      null,

    unit_type:
      product.unitType ||
      null,

    measurement:
      product.measurement ||
      null,

    is_active:
      product.is_active ??
      true,
  };

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(
      "ADD PRODUCT ERROR:",
      error.message,
    );

    throw error;
  }

  if (
    data?.id &&
    product.variants?.length
  ) {
    await saveProductVariants(
      String(data.id),
      product.variants,
    );
  }

  return data;
}

/* =========================================
   UPDATE PRODUCT
========================================= */

export async function updateProduct(
  id: string,
  product: Partial<Product>,
) {
  if (!id) {
    throw new Error(
      "Product ID is required",
    );
  }

  const updateData: Record<
    string,
    unknown
  > = {};

  if (
    product.shop_id !==
    undefined
  ) {
    updateData.shop_id =
      product.shop_id || null;
  }

  if (
    product.name !==
    undefined
  ) {
    updateData.name =
      safeString(
        product.name,
      ) || "Product";
  }

  if (
    product.brand !==
    undefined
  ) {
    updateData.brand =
      product.brand;
  }

  if (
    product.category !==
    undefined
  ) {
    updateData.category =
      findProductCategory(
        product.category,
      ).id;

    updateData.category_label =
      product.categoryLabel ||
      getProductCategory(
        product.category,
      ).label;
  }

  if (
    product.categoryLabel !==
    undefined
  ) {
    updateData.category_label =
      product.categoryLabel;
  }

  if (
    product.description !==
    undefined
  ) {
    updateData.description =
      product.description;
  }

  if (
    product.longDescription !==
    undefined
  ) {
    updateData.long_description =
      product.longDescription;
  }

  if (
    product.price !==
    undefined
  ) {
    updateData.price =
      safeNumber(
        product.price,
      );
  }

  if (
    product.originalPrice !==
    undefined
  ) {
    updateData.original_price =
      product.originalPrice ??
      null;
  }

  if (
    product.rating !==
    undefined
  ) {
    updateData.rating =
      safeNumber(
        product.rating,
      );
  }

  if (
    product.reviewCount !==
    undefined
  ) {
    updateData.review_count =
      safeNumber(
        product.reviewCount,
      );
  }

  if (
    product.stock !==
    undefined
  ) {
    updateData.stock =
      safeNumber(
        product.stock,
      );
  }

  if (
    product.unit !==
    undefined
  ) {
    updateData.unit =
      product.unit;
  }

  if (
    product.image !==
    undefined
  ) {
    updateData.image =
      product.image ||
      null;
  }

  if (
    product.images !==
    undefined
  ) {
    updateData.images =
      Array.isArray(
        product.images,
      )
        ? product.images
        : [];
  }

  if (
    product.brochure !==
    undefined
  ) {
    updateData.brochure =
      product.brochure ||
      null;
  }

  if (
    product.color !==
    undefined
  ) {
    updateData.color =
      product.color;
  }

  if (
    product.badge !==
    undefined
  ) {
    updateData.badge =
      product.badge ||
      null;
  }

  if (
    product.tags !==
    undefined
  ) {
    updateData.tags =
      Array.isArray(
        product.tags,
      )
        ? product.tags
        : [];
  }

  if (
    product.specs !==
    undefined
  ) {
    updateData.specs =
      product.specs || {};
  }

  if (
    product.about !==
    undefined
  ) {
    updateData.about =
      product.about || null;
  }

  if (
    product.materialName !==
    undefined
  ) {
    updateData.material_name =
      product.materialName ||
      null;
  }

  if (
    product.unitType !==
    undefined
  ) {
    updateData.unit_type =
      product.unitType ||
      null;
  }

  if (
    product.measurement !==
    undefined
  ) {
    updateData.measurement =
      product.measurement ||
      null;
  }

  if (
    product.is_active !==
    undefined
  ) {
    updateData.is_active =
      product.is_active;
  }

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error.message,
    );

    throw error;
  }

  if (
    product.variants !==
    undefined
  ) {
    await updateProductVariants(
      id,
      product.variants,
    );
  }

  return data;
}

/* =========================================
   SAVE VARIANTS
========================================= */

export async function saveProductVariants(
  productId: string,
  variants: ProductVariant[],
) {
  if (
    !productId ||
    !Array.isArray(
      variants,
    ) ||
    variants.length === 0
  ) {
    return [];
  }

  const rows = variants
    .filter(
      (variant) =>
        !!variant &&
        !!safeString(
          variant.variantName,
        ),
    )
    .map((variant) => ({
      product_id:
        productId,

      variant_name:
        safeString(
          variant.variantName,
        ) || "Option",

      watt:
        variant.watt == null
          ? null
          : safeNumber(
              variant.watt,
            ),

      price:
        safeNumber(
          variant.price,
        ),

      original_price:
        variant.originalPrice ==
        null
          ? null
          : safeNumber(
              variant.originalPrice,
            ),

      stock:
        safeNumber(
          variant.stock,
        ),

      sku:
        safeString(
          variant.sku,
        ) || null,

      unit:
        safeString(
          variant.unit,
        ) || null,

      specs:
        safeObject(
          variant.specs,
        ),

      image:
        safeString(
          variant.image,
        ) || null,

      images:
        Array.isArray(
          variant.images,
        )
          ? variant.images
          : [],

      is_active:
        variant.isActive !==
        false,
    }));

  if (!rows.length) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "product_variants",
    )
    .insert(rows)
    .select(
      PRODUCT_VARIANT_SELECT,
    );

  if (error) {
    console.error(
      "SAVE PRODUCT VARIANTS ERROR:",
      error.message,
    );

    throw error;
  }

  return mapVariants(data);
}

/* =========================================
   UPDATE VARIANTS
========================================= */

export async function updateProductVariants(
  productId: string,
  variants: ProductVariant[],
) {
  if (!productId) {
    throw new Error(
      "Product ID is required",
    );
  }

  const {
    error,
  } = await supabase
    .from(
      "product_variants",
    )
    .delete()
    .eq(
      "product_id",
      productId,
    );

  if (error) {
    console.error(
      "DELETE OLD VARIANTS ERROR:",
      error.message,
    );

    throw error;
  }

  if (
    !Array.isArray(
      variants,
    ) ||
    variants.length === 0
  ) {
    return [];
  }

  return saveProductVariants(
    productId,
    variants,
  );
}

/* =========================================
   UPDATE SINGLE VARIANT
========================================= */

export async function updateProductVariant(
  variantId: string,
  variant: Partial<ProductVariant>,
) {
  if (!variantId) {
    throw new Error(
      "Variant ID is required",
    );
  }

  const updateData: Record<
    string,
    unknown
  > = {};

  if (
    variant.variantName !==
    undefined
  ) {
    updateData.variant_name =
      safeString(
        variant.variantName,
      ) || "Option";
  }

  if (
    variant.watt !==
    undefined
  ) {
    updateData.watt =
      variant.watt === null
        ? null
        : safeNumber(
            variant.watt,
          );
  }

  if (
    variant.price !==
    undefined
  ) {
    updateData.price =
      safeNumber(
        variant.price,
      );
  }

  if (
    variant.originalPrice !==
    undefined
  ) {
    updateData.original_price =
      variant.originalPrice ??
      null;
  }

  if (
    variant.stock !==
    undefined
  ) {
    updateData.stock =
      safeNumber(
        variant.stock,
      );
  }

  if (
    variant.sku !==
    undefined
  ) {
    updateData.sku =
      safeString(
        variant.sku,
      ) || null;
  }

  if (
    variant.unit !==
    undefined
  ) {
    updateData.unit =
      safeString(
        variant.unit,
      ) || null;
  }

  if (
    variant.specs !==
    undefined
  ) {
    updateData.specs =
      safeObject(
        variant.specs,
      );
  }

  if (
    variant.image !==
    undefined
  ) {
    updateData.image =
      safeString(
        variant.image,
      ) || null;
  }

  if (
    variant.images !==
    undefined
  ) {
    updateData.images =
      Array.isArray(
        variant.images,
      )
        ? variant.images
        : [];
  }

  if (
    variant.isActive !==
    undefined
  ) {
    updateData.is_active =
      variant.isActive;
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "product_variants",
    )
    .update(updateData)
    .eq(
      "id",
      variantId,
    )
    .select(
      PRODUCT_VARIANT_SELECT,
    )
    .single();

  if (error) {
    console.error(
      "UPDATE VARIANT ERROR:",
      error.message,
    );

    throw error;
  }

  return mapVariant(
    data as Record<
      string,
      unknown
    >,
  );
}

/* =========================================
   DELETE VARIANT
========================================= */

export async function deleteProductVariant(
  variantId: string,
) {
  if (!variantId) {
    return false;
  }

  const {
    error,
  } = await supabase
    .from(
      "product_variants",
    )
    .delete()
    .eq(
      "id",
      variantId,
    );

  if (error) {
    console.error(
      "DELETE VARIANT ERROR:",
      error.message,
    );

    throw error;
  }

  return true;
}

/* =========================================
   TOGGLE PRODUCT
========================================= */

export async function toggleProductStatus(
  id: string,
  active: boolean,
) {
  if (!id) {
    throw new Error(
      "Product ID is required",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .update({
      is_active: active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "TOGGLE PRODUCT ERROR:",
      error.message,
    );

    throw error;
  }

  return data;
}

/* =========================================
   TOGGLE VARIANT
========================================= */

export async function toggleProductVariantStatus(
  id: string,
  active: boolean,
) {
  if (!id) {
    throw new Error(
      "Variant ID is required",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "product_variants",
    )
    .update({
      is_active: active,
    })
    .eq("id", id)
    .select(
      PRODUCT_VARIANT_SELECT,
    )
    .single();

  if (error) {
    console.error(
      "TOGGLE VARIANT ERROR:",
      error.message,
    );

    throw error;
  }

  return mapVariant(
    data as Record<
      string,
      unknown
    >,
  );
}

/* =========================================
   DELETE PRODUCT
========================================= */

export async function deleteProduct(
  id: string,
) {
  if (!id) {
    return false;
  }

  const {
    error: variantError,
  } = await supabase
    .from(
      "product_variants",
    )
    .delete()
    .eq(
      "product_id",
      id,
    );

  if (variantError) {
    console.error(
      "DELETE PRODUCT VARIANTS ERROR:",
      variantError.message,
    );

    return false;
  }

  const {
    error,
  } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error.message,
    );

    return false;
  }

  return true;
}

/* =========================================
   PRODUCTS BY CATEGORY
========================================= */

export async function getProductsByCategory(
  category:
    | ProductCategory
    | string,
  limit = 100,
): Promise<Product[]> {
  try {
    if (!category) {
      console.warn(
        "GET PRODUCTS BY CATEGORY: EMPTY CATEGORY",
      );

      return [];
    }

    const categoryData =
      findProductCategory(
        category,
      );

    const categoryId =
      categoryData.id;

    console.log(
      "CATEGORY REQUEST:",
      {
        received: category,
        resolved: categoryId,
        label:
          categoryData.label,
      },
    );

    /*
     * IMPORTANT:
     * Filter only by database category ID.
     *
     * This means:
     *
     * tools → all 15
     * tiles → all 101
     * tmt → all 30
     * pipes → all 17
     * water_tank → all 5
     */
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq(
        "category",
        categoryId,
      )
      .eq(
        "is_active",
        true,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(limit);

    if (error) {
      console.error(
        "GET PRODUCTS BY CATEGORY ERROR:",
        error.message,
      );

      return [];
    }

    console.log(
      `CATEGORY "${categoryId}" FOUND:`,
      data?.length ?? 0,
    );

    return (
      data ?? []
    ).map((item) =>
      mapProduct(
        item as unknown as Record<
          string,
          unknown
        >,
      ),
    );
  } catch (error) {
    console.error(
      "GET PRODUCTS BY CATEGORY ERROR:",
      error,
    );

    return [];
  }
}

/* =========================================
   FEATURED PRODUCTS
========================================= */

export async function getFeaturedProducts(
  limit = 20,
): Promise<Product[]> {
  try {
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq(
        "is_active",
        true,
      )
      .in("badge", [
        "popular",
        "pro",
      ])
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(limit);

    if (error) {
      console.error(
        "GET FEATURED PRODUCTS ERROR:",
        error.message,
      );

      return [];
    }

    return (
      data ?? []
    ).map((item) =>
      mapProduct(
        item as unknown as Record<
          string,
          unknown
        >,
      ),
    );
  } catch (error) {
    console.error(
      "GET FEATURED PRODUCTS ERROR:",
      error,
    );

    return [];
  }
}

/* =========================================
   RELATED PRODUCTS
========================================= */

export async function getRelatedProducts(
  product: Product,
  count = 4,
): Promise<Product[]> {
  if (!product?.id) {
    return [];
  }

  try {
    let query =
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq(
          "category",
          product.category,
        )
        .eq(
          "is_active",
          true,
        )
        .neq(
          "id",
          product.id,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        )
        .limit(count);

    if (product.shop_id) {
      query =
        query.eq(
          "shop_id",
          product.shop_id,
        );
    }

    const {
      data,
      error,
    } = await query;

    if (error) {
      console.error(
        "GET RELATED PRODUCTS ERROR:",
        error.message,
      );

      return [];
    }

    return (
      data ?? []
    ).map((item) =>
      mapProduct(
        item as unknown as Record<
          string,
          unknown
        >,
      ),
    );
  } catch (error) {
    console.error(
      "GET RELATED PRODUCTS ERROR:",
      error,
    );

    return [];
  }
}

/* =========================================
   PRICE HELPERS
========================================= */

export function getLowestVariantPrice(
  product: Product,
): number {
  const variants =
    product.variants?.filter(
      (variant) =>
        variant.isActive,
    ) || [];

  if (!variants.length) {
    return safeNumber(
      product.price,
    );
  }

  return Math.min(
    ...variants.map(
      (variant) =>
        safeNumber(
          variant.price,
        ),
    ),
  );
}

/* =========================================
   HIGHEST VARIANT PRICE
========================================= */

export function getHighestVariantPrice(
  product: Product,
): number {
  const variants =
    product.variants?.filter(
      (variant) =>
        variant.isActive,
    ) || [];

  if (!variants.length) {
    return safeNumber(
      product.price,
    );
  }

  return Math.max(
    ...variants.map(
      (variant) =>
        safeNumber(
          variant.price,
        ),
    ),
  );
}

/* =========================================
   TOTAL VARIANT STOCK
========================================= */

export function getTotalVariantStock(
  product: Product,
): number {
  const variants =
    product.variants?.filter(
      (variant) =>
        variant.isActive,
    ) || [];

  if (!variants.length) {
    return safeNumber(
      product.stock,
    );
  }

  return variants.reduce(
    (total, variant) =>
      total +
      safeNumber(
        variant.stock,
      ),
    0,
  );
}

/* =========================================
   FIND VARIANT
========================================= */

export function findProductVariant(
  product: Product,
  variantId: string,
): ProductVariant | null {
  return (
    product.variants?.find(
      (variant) =>
        String(
          variant.id,
        ) ===
        String(
          variantId,
        ),
    ) ?? null
  );
}

/* =========================================
   FIND VARIANT BY WATT
========================================= */

export function findVariantByWatt(
  product: Product,
  watt: number,
): ProductVariant | null {
  return (
    product.variants?.find(
      (variant) =>
        variant.watt !==
          null &&
        variant.watt !==
          undefined &&
        Number(
          variant.watt,
        ) ===
          Number(watt),
    ) ?? null
  );
}