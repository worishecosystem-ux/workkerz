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
  | "electrical";

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
    image: "/sand.webp",
    color: "#F59E0B",
    bgColor: "#FFF7ED",
  },

  {
    id: "aggregate",
    label: "Aggregate",
    description: "Stone aggregate & gitti materials",
    image: "/20-mm-aggregates.jpg",
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },

  {
    id: "brick",
    label: "Brick",
    description: "Red bricks & fly ash bricks",
    image: "/red-brick.jpeg",
    color: "#DC2626",
    bgColor: "#FEF2F2",
  },

  {
    id: "cement",
    label: "Cement",
    description: "Cement bags & building cement",
    image: "/cements_.jpg",
    color: "#2563EB",
    bgColor: "#EFF6FF",
  },

  {
    id: "tmt",
    label: "TMT",
    description: "TMT bars & steel rods",
    image: "/captain-tmt-bars-500x500.webp",
    color: "#475569",
    bgColor: "#F1F5F9",
  },

  {
    id: "paint",
    label: "Paint",
    description: "Wall paint & waterproof paint",
    image:
      "/closeup-of-house-painting-renovation-4519567.webp",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
  },

  {
    id: "plumbing",
    label: "Plumbing",
    description: "Pipes, taps & fittings",
    image:
      "/pipes-18242-1676036604740.webp",
    color: "#0891B2",
    bgColor: "#ECFEFF",
  },

  {
    id: "tiles",
    label: "Tiles",
    description: "Floor & wall tiles",
    image: "/tiles.avif",
    color: "#EA580C",
    bgColor: "#FFF7ED",
  },

  {
    id: "electrical",
    label: "Electrical",
    description: "Wires, switches & electrical items",
    image: "/electrical.avif",
    color: "#EAB308",
    bgColor: "#FEFCE8",
  },
] as const;

/* =========================================
   CATEGORY LABELS
========================================= */

export const CATEGORY_LABELS: Record<
  ProductCategory,
  string
> = {
  sand: "Sand",

  aggregate: "Aggregate",

  brick: "Brick",

  cement: "Cement",

  tmt: "TMT",

  paint: "Paint",

  plumbing: "Plumbing",

  tiles: "Tiles",

  electrical: "Electrical",
};

/* =========================================
   CATEGORY COLORS
========================================= */

export const CATEGORY_COLORS: Record<
  ProductCategory,
  string
> = {
  sand: "#FFF7ED",

  aggregate: "#F3F4F6",

  brick: "#FEF2F2",

  cement: "#F8FAFC",

  tmt: "#F1F5F9",

  paint: "#F5F3FF",

  plumbing: "#EFF6FF",

  tiles: "#F0FDFA",

  electrical: "#FEFCE8",
};

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

    color: "#FFF7ED",

    badge: undefined,

    tags: [],

    specs: {},

    is_active: true,
  });

/* =========================================
   GET IMAGE URL
========================================= */

const getBucketImage = (
  fileName?: string,
) => {
  try {
    if (!fileName) {
      return "/placeholder.png";
    }

    let cleanPath =
      fileName.trim();

    cleanPath =
      cleanPath.replace(
        /^\/+/,
        "",
      );

    if (
      cleanPath.startsWith(
        "http://",
      ) ||
      cleanPath.startsWith(
        "https://",
      )
    ) {
      return cleanPath;
    }

    if (
      !cleanPath.startsWith(
        "images/",
      )
    ) {
      cleanPath = `images/${cleanPath}`;
    }

    const { data } =
      supabase.storage
        .from(BUCKET)
        .getPublicUrl(
          cleanPath,
        );

    return data.publicUrl;
  } catch (error) {
    console.log(
      "IMAGE ERROR:",
      error,
    );

    return "/placeholder.png";
  }
};

/* =========================================
   GET BROCHURE URL
========================================= */

const getBrochureUrl = (
  fileName?: string,
) => {
  try {
    if (!fileName) {
      return "";
    }

    let cleanPath =
      fileName.trim();

    cleanPath =
      cleanPath.replace(
        /^\/+/,
        "",
      );

    if (
      cleanPath.startsWith(
        "http://",
      ) ||
      cleanPath.startsWith(
        "https://",
      )
    ) {
      return cleanPath;
    }

    if (
      !cleanPath.startsWith(
        "brochures/",
      )
    ) {
      cleanPath = `brochures/${cleanPath}`;
    }

    const { data } =
      supabase.storage
        .from(BUCKET)
        .getPublicUrl(
          cleanPath,
        );

    return data.publicUrl;
  } catch (error) {
    console.log(
      "BROCHURE ERROR:",
      error,
    );

    return "";
  }
};

/* =========================================
   MAP PRODUCT
========================================= */

const mapProduct = (
  p: any,
): Product => {
  const category =
    (
      p.category ||
      "sand"
    ) as ProductCategory;

  return {
    id: String(
      p.id,
    ),

    shop_id:
      p.shop_id || "",

    name:
      p.name || "",

    brand:
      p.brand || "",

    category,

    categoryLabel:
      p.category_label ||
      CATEGORY_LABELS[
        category
      ],

    description:
      p.description || "",

    longDescription:
      p.long_description ||
      "",

    price: Number(
      p.price || 0,
    ),

    originalPrice:
      p.original_price
        ? Number(
            p.original_price,
          )
        : undefined,

    rating: Number(
      p.rating || 0,
    ),

    reviewCount:
      Number(
        p.review_count ||
          0,
      ),

    stock: Number(
      p.stock || 0,
    ),

    unit:
      p.unit || "",

    image:
      getBucketImage(
        p.image,
      ),

    images:
      Array.isArray(
        p.images,
      )
        ? p.images.map(
            (
              img: string,
            ) =>
              getBucketImage(
                img,
              ),
          )
        : [],

    brochure:
      getBrochureUrl(
        p.brochure,
      ),

    color:
      p.color ||
      CATEGORY_COLORS[
        category
      ],

    badge:
      p.badge ||
      undefined,

    tags:
      Array.isArray(
        p.tags,
      )
        ? p.tags
        : [],

    specs:
      typeof p.specs ===
        "object" &&
      p.specs !== null
        ? p.specs
        : {},

    is_active:
      p.is_active !==
      false,
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
    let query =
      supabase
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
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

    /* SHOP FILTER */

    if (shopId) {
      query = query.eq(
        "shop_id",
        shopId,
      );
    }

    /* ONLINE SHOP ONLY */

    if (
      !includeOffline
    ) {
      query = query.eq(
        "shops.status",
        "online",
      );

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
      console.log(
        "GET PRODUCTS ERROR:",
        error,
      );

      return [];
    }

    return (
      data || []
    ).map(
      (
        item: any,
      ) =>
        mapProduct(
          item,
        ),
    );
  } catch (err) {
    console.log(err);

    return [];
  }
}

/* =========================================
   GET PRODUCT BY ID
========================================= */

export async function getProductById(
  id: string,
): Promise<Product | null> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "products",
      )
      .select("*")
      .eq(
        "id",
        id,
      )
      .maybeSingle();

  if (
    error ||
    !data
  ) {
    console.log(
      "GET PRODUCT ERROR:",
      error,
    );

    return null;
  }

  return mapProduct(
    data,
  );
}

/* =========================================
   ADD PRODUCT
========================================= */

export async function addProduct(
  product: Omit<
    Product,
    "id"
  >,
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "products",
      )
      .insert([
        {
          shop_id:
            product.shop_id,

          name:
            product.name,

          brand:
            product.brand,

          category:
            product.category,

          category_label:
            product.categoryLabel,

          description:
            product.description,

          long_description:
            product.longDescription,

          price:
            product.price,

          original_price:
            product.originalPrice,

          rating:
            product.rating,

          review_count:
            product.reviewCount,

          stock:
            product.stock,

          unit:
            product.unit,

          image:
            product.image,

          images:
            product.images,

          brochure:
            product.brochure,

          color:
            product.color,

          badge:
            product.badge,

          tags:
            product.tags,

          specs:
            product.specs,

          is_active:
            product.is_active ??
            true,
        },
      ])
      .select()
      .single();

  if (error) {
    console.log(
      "ADD PRODUCT ERROR:",
      error,
    );

    throw error;
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
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "products",
      )
      .update({
        shop_id:
          product.shop_id,

        name:
          product.name,

        brand:
          product.brand,

        category:
          product.category,

        category_label:
          product.categoryLabel,

        description:
          product.description,

        long_description:
          product.longDescription,

        price:
          product.price,

        original_price:
          product.originalPrice,

        rating:
          product.rating,

        review_count:
          product.reviewCount,

        stock:
          product.stock,

        unit:
          product.unit,

        image:
          product.image,

        images:
          product.images,

        brochure:
          product.brochure,

        color:
          product.color,

        badge:
          product.badge,

        tags:
          product.tags,

        specs:
          product.specs,

        is_active:
          product.is_active,
      })
      .eq(
        "id",
        id,
      )
      .select()
      .single();

  if (error) {
    console.log(
      "UPDATE PRODUCT ERROR:",
      error,
    );

    throw error;
  }

  return data;
}

/* =========================================
   TOGGLE PRODUCT STATUS
========================================= */

export async function toggleProductStatus(
  id: string,
  active: boolean,
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "products",
      )
      .update({
        is_active:
          active,
      })
      .eq(
        "id",
        id,
      )
      .select()
      .single();

  if (error) {
    console.log(
      "TOGGLE PRODUCT ERROR:",
      error,
    );

    throw error;
  }

  return data;
}

/* =========================================
   DELETE PRODUCT
========================================= */

export async function deleteProduct(
  id: string,
) {
  const {
    error,
  } =
    await supabase
      .from(
        "products",
      )
      .delete()
      .eq(
        "id",
        id,
      );

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
    (p) =>
      p.category ===
      cat,
  );
}

/* ========================================= */

export async function getFeaturedProducts() {
  const products =
    await getProducts();

  return products.filter(
    (p) =>
      p.badge ===
        "popular" ||
      p.badge ===
        "pro",
  );
}

/* ========================================= */

export async function getRelatedProducts(
  product: Product,
  count = 4,
) {
  const products =
    await getProducts(
      product.shop_id,
    );

  return products
    .filter(
      (p) =>
        p.category ===
          product.category &&
        p.id !==
          product.id,
    )
    .slice(0, count);
}