"use client";

import { supabase } from "@/lib/supabase";

/* =========================================
   PRICING TYPE
========================================= */

export type PricingType =
  | "per_job"
  | "daily"
  | "monthly"
  | "per_service"
  | "visit_charge"
  | "custom";

/* =========================================
   PRICE KEY
   Used for DISPLAY CHARGE
========================================= */

export type PriceKey =
  | "per_job"
  | "half_day"
  | "full_day"
  | "monthly"
  | "visit_charge";

/* =========================================
   SERVICE CATEGORIES
========================================= */

export const serviceCategories = [
  {
    id: "all",
    label: "All",
    description: "Find trusted workers and professionals for every need",
    featured: false,
    color: "#475569",
    bg: "#F8FAFC",
    image: "",
  },
  {
    id: "Labour",
    label: "Labour",
    description: "Daily wage and general workers",
    featured: true,
    color: "#F97316",
    bg: "#FFF5EB",
    image: "/categories/workkerz/Labour.png",
  },
  {
    id: "Driver",
    label: "Driver",
    description: "Professional drivers for personal and commercial needs",
    featured: true,
    color: "#16A34A",
    bg: "#F0FDF4",
    image: "/categories/workkerz/Driver.png",
  },
  {
    id: "Mechanic",
    label: "Mechanic",
    description: "Vehicle repair and maintenance professionals",
    featured: true,
    color: "#2563EB",
    bg: "#EFF6FF",
    image: "/categories/workkerz/Mechanic.png",
  },
  {
    id: "Electrical & Plumbing",
    label: "Electrical & Plumbing",
    description: "Electricians and plumbers for home and commercial work",
    featured: false,
    color: "#CA8A04",
    bg: "#FEFCE8",
    image: "/categories/workkerz/Electricianandplumber.png",
  },
  {
    id: "Home Repair",
    label: "Home Repair",
    description: "Reliable professionals for home repair and maintenance",
    featured: false,
    color: "#D97706",
    bg: "#FFF7ED",
    image: "/categories/workkerz/Home repair.png",
  },
  {
    id: "AC & Appliances",
    label: "AC & Appliances",
    description: "AC, refrigerator and appliance repair professionals",
    featured: false,
    color: "#0284C7",
    bg: "#F0F9FF",
    image: "/categories/workkerz/Ac and appliances repair.png",
  },
  {
    id: "Washer",
    label: "Washer",
    description: "Car, bike and other vehicle washing professionals",
    featured: false,
    color: "#0891B2",
    bg: "#ECFEFF",
    image: "/categories/workkerz/Washer.png",
  },
  {
    id: "Cleaner",
    label: "Cleaner",
    description: "Home, office and commercial cleaning professionals",
    featured: false,
    color: "#059669",
    bg: "#ECFDF5",
    image: "/categories/workkerz/Cleaner.png",
  },
  {
    id: "Garden & Pest Control",
    label: "Garden & Pest Control",
    description: "Gardening, lawn care and pest control services",
    featured: false,
    color: "#65A30D",
    bg: "#F7FEE7",
    image: "/categories/workkerz/Garden and pest control.png",
  },
  {
    id: "Office & Computer",
    label: "Office & Computer",
    description: "Office assistants, computer operators and professionals",
    featured: false,
    color: "#7C3AED",
    bg: "#F5F3FF",
    image: "/categories/workkerz/Office and computer.png",
  },
  {
    id: "Delivery & Warehouse",
    label: "Delivery & Warehouse",
    description: "Delivery, loading, unloading and warehouse workers",
    featured: false,
    color: "#0F766E",
    bg: "#F0FDFA",
    image: "/categories/workkerz/Delivery and warehouse.png",
  },
  {
    id: "Restaurant",
    label: "Restaurant",
    description: "Restaurant, kitchen, waiter and service workers",
    featured: true,
    color: "#DC2626",
    bg: "#FEF2F2",
    image: "/categories/workkerz/Restaurant.png",
  },
  {
    id: "Salon & Beauty",
    label: "Salon & Beauty",
    description: "Beauty, salon, makeup and personal care professionals",
    featured: false,
    color: "#E11D48",
    bg: "#FFF1F2",
    image: "/categories/workkerz/Salon and beauty.png",
  },
  {
    id: "Security & Events",
    label: "Security & Events",
    description: "Security guards, event staff and function workers",
    featured: false,
    color: "#1E3A8A",
    bg: "#EFF6FF",
    image: "/categories/workkerz/Events.png",
  },
  {
    id: "Factory",
    label: "Factory",
    description: "Factory, production and industrial workers",
    featured: false,
    color: "#475569",
    bg: "#F8FAFC",
    image: "/categories/workkerz/Factory worker.png",
  },
  {
    id: "Agriculture",
    label: "Agriculture",
    description: "Farm, agricultural and field workers",
    featured: false,
    color: "#15803D",
    bg: "#F0FDF4",
    image: "/categories/workkerz/Agriculture.png",
  },
  {
    id: "Moving & Packing",
    label: "Moving & Packing",
    description: "Packers, movers, loading and shifting workers",
    featured: false,
    color: "#9333EA",
    bg: "#FAF5FF",
    image: "/categories/workkerz/Moving and packers.png",
  },
  {
    id: "Other Services",
    label: "Other Services",
    description: "Other skilled and general services near you",
    featured: false,
    color: "#64748B",
    bg: "#F1F5F9",
    image: "/categories/workkerz/Other services.png",
  },
] as const;

export type ServiceCategory =
  (typeof serviceCategories)[number];

/* =========================================
   SERVICE DESCRIPTIONS
========================================= */

export const serviceCategoryDescriptions: Record<
  string,
  string
> = {
  Labour: "Daily wage & general workers",
  Driver: "Drivers for every requirement",
  Mechanic: "Vehicle repair & maintenance",
  "Electrical & Plumbing":
    "Electrical, plumbing, pipes & water work",
  "Home Repair":
    "Carpentry, painting, masonry & home repair",
  "AC & Appliances":
    "AC, refrigerator, RO & appliance services",
  Washer:
    "Vehicle cleaning & washing professionals",
  Cleaner:
    "Home, office & commercial cleaning",
  "Garden & Pest Control":
    "Garden, landscaping & pest control services",
  "Office & Computer":
    "Office, computer & data entry professionals",
  "Delivery & Warehouse":
    "Delivery, warehouse, loading & packing workers",
  Restaurant:
    "Restaurant, kitchen & serving staff",
  "Salon & Beauty":
    "Beauty, grooming & personal care services",
  "Security & Events":
    "Security, event staff & event support workers",
  Factory:
    "Factory & industrial workers",
  Agriculture:
    "Farming & agricultural workers",
  "Moving & Packing":
    "Moving, shifting & packing workers",
  "Other Services":
    "Other skilled & general work services",
};

/* =========================================
   WORKER
========================================= */

export type Worker = {
  id: string;
  workerCode: string | null;

  name: string;
  phone: string;

  category: string;
  subcategory: string;
  specialty: string;

  /* =========================================
     ACTUAL SERVICES
     Example:
     ["Visit", "Repair", "Emergency"]
  ========================================= */

  services: string[];

  /* =========================================
     DISPLAY CHARGE
     
     IMPORTANT:
     This is NOT a service name.

     It stores one PriceKey:
     per_job
     half_day
     full_day
     monthly
     visit_charge
  ========================================= */

  displayService: PriceKey | null;

  pricingType: PricingType;

  startingPrice: number;
  halfDayPrice: number;
  fullDayPrice: number;
  monthlyPrice: number;
  visitCharge: number;

  visiblePricingTypes: PriceKey[];

  rating: number;
  reviewCount: number;

  location: string;
  labourChauk: string;

  available: boolean;

  yearsExperience: number;
  completedJobs: number;

  bio: string;

  skills: string[];

  photo: string;

  responseTime: string;

  certifications: string[];

  createdAt: string;
};

/* =========================================
   FORM DATA
========================================= */

export type WorkerFormData = Omit<
  Worker,
  "id" | "createdAt" | "workerCode"
>;

/* =========================================
   DATABASE ROW
========================================= */

type WorkerRow = {
  id: string;

  name: string;
  category: string;
  specialty: string;

  rating: number | string | null;
  review_count: number | string | null;

  location: string;

  available: boolean | null;

  years_experience: number | string | null;
  completed_jobs: number | string | null;

  bio: string | null;

  skills: string[] | null;

  photo: string | null;

  response_time: string | null;

  certifications: string[] | null;

  created_at: string;

  subcategory: string | null;

  services: string[] | null;

  /* =========================================
     DISPLAY CHARGE
     DB COLUMN:
     display_service
     
     VALUE:
     per_job / half_day / full_day /
     monthly / visit_charge
  ========================================= */

  display_service: string | null;

  phone: string | null;

  pricing_type: string | null;

  starting_price: number | string | null;
  half_day_price: number | string | null;
  full_day_price: number | string | null;
  monthly_price: number | string | null;

  visit_charge: number | string | null;

  labour_chauk: string | null;

  worker_code: string | null;

  visible_pricing_types: string[] | null;
};

/* =========================================
   EXACT DATABASE SELECT
========================================= */

const WORKER_SELECT = `
  id,
  name,
  category,
  specialty,
  rating,
  review_count,
  location,
  available,
  years_experience,
  completed_jobs,
  bio,
  skills,
  photo,
  response_time,
  certifications,
  created_at,
  subcategory,
  services,
  display_service,
  phone,
  pricing_type,
  starting_price,
  half_day_price,
  full_day_price,
  monthly_price,
  visit_charge,
  labour_chauk,
  worker_code,
  visible_pricing_types
`;

/* =========================================
   HELPERS
========================================= */

function numberValue(
  value:
    | number
    | string
    | null
    | undefined,
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const result = Number(value);

  return Number.isFinite(result)
    ? result
    : 0;
}

/* =========================================
   PRICING TYPE
========================================= */

function pricingValue(
  value: string | null | undefined,
): PricingType {
  switch (value) {
    case "per_job":
    case "daily":
    case "monthly":
    case "per_service":
    case "visit_charge":
    case "custom":
      return value;

    default:
      return "custom";
  }
}

/* =========================================
   PRICE KEYS
========================================= */

export const PRICE_KEYS: PriceKey[] = [
  "per_job",
  "half_day",
  "full_day",
  "monthly",
  "visit_charge",
];

/* =========================================
   DISPLAY SERVICE VALUE
========================================= */

/**
 * display_service is a PRICE KEY.
 *
 * Valid:
 *   per_job
 *   half_day
 *   full_day
 *   monthly
 *   visit_charge
 *
 * Invalid examples:
 *   Repair
 *   Visit
 *   Emergency
 */

function displayServiceValue(
  value:
    | string
    | null
    | undefined,
): PriceKey | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const cleanValue =
    value.trim();

  if (
    !cleanValue
  ) {
    return null;
  }

  return PRICE_KEYS.includes(
    cleanValue as PriceKey,
  )
    ? (cleanValue as PriceKey)
    : null;
}

/* =========================================
   VISIBLE PRICES
========================================= */

function visiblePrices(
  value:
    | string[]
    | null
    | undefined,
): PriceKey[] {
  if (!Array.isArray(value)) {
    return [
      "per_job",
      "half_day",
    ];
  }

  return value.filter(
    (item): item is PriceKey =>
      PRICE_KEYS.includes(
        item as PriceKey,
      ),
  );
}

/* =========================================
   STRING ARRAY
========================================= */

function stringArray(
  value:
    | string[]
    | null
    | undefined,
): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item ===
          "string",
      )
    : [];
}

/* =========================================
   MAP DATABASE → WORKER
========================================= */

export function mapWorker(
  row: WorkerRow,
): Worker {
  const mappedWorker: Worker = {
    id:
      row.id,

    workerCode:
      row.worker_code ??
      null,

    name:
      row.name ??
      "",

    phone:
      row.phone ??
      "",

    category:
      row.category ??
      "",

    subcategory:
      row.subcategory ??
      "",

    specialty:
      row.specialty ??
      "",

    /* =====================================
       ACTUAL SERVICES
    ===================================== */

    services:
      stringArray(
        row.services,
      ),

    /* =====================================
       DISPLAY CHARGE

       DB:
       display_service

       APP:
       displayService

       Example:
       "half_day"
    ===================================== */

    displayService:
      displayServiceValue(
        row.display_service,
      ),

    pricingType:
      pricingValue(
        row.pricing_type,
      ),

    startingPrice:
      numberValue(
        row.starting_price,
      ),

    halfDayPrice:
      numberValue(
        row.half_day_price,
      ),

    fullDayPrice:
      numberValue(
        row.full_day_price,
      ),

    monthlyPrice:
      numberValue(
        row.monthly_price,
      ),

    visitCharge:
      numberValue(
        row.visit_charge,
      ),

    visiblePricingTypes:
      visiblePrices(
        row.visible_pricing_types,
      ),

    rating:
      numberValue(
        row.rating,
      ),

    reviewCount:
      numberValue(
        row.review_count,
      ),

    location:
      row.location ??
      "",

    labourChauk:
      row.labour_chauk ??
      "",

    available:
      row.available ??
      true,

    yearsExperience:
      numberValue(
        row.years_experience,
      ),

    completedJobs:
      numberValue(
        row.completed_jobs,
      ),

    bio:
      row.bio ??
      "",

    skills:
      stringArray(
        row.skills,
      ),

    photo:
      row.photo ??
      "",

    responseTime:
      row.response_time ??
      "Within 1 hour",

    certifications:
      stringArray(
        row.certifications,
      ),

    createdAt:
      row.created_at ??
      "",
  };

  /* =====================================
     DEBUG
  ===================================== */

  console.log(
    "WORKER MAPPED:",
    {
      id:
        mappedWorker.id,

      name:
        mappedWorker.name,

      services:
        mappedWorker.services,

      displayService:
        mappedWorker.displayService,

      visitCharge:
        mappedWorker.visitCharge,

      startingPrice:
        mappedWorker.startingPrice,

      halfDayPrice:
        mappedWorker.halfDayPrice,

      fullDayPrice:
        mappedWorker.fullDayPrice,

      monthlyPrice:
        mappedWorker.monthlyPrice,

      visiblePricingTypes:
        mappedWorker.visiblePricingTypes,
    },
  );

  return mappedWorker;
}

/* =========================================
   DATABASE PAYLOAD
========================================= */

function workerPayload(
  worker: WorkerFormData,
) {
  const cleanServices =
    stringArray(
      worker.services,
    );

  /* =====================================
     DISPLAY CHARGE

     IMPORTANT:
     Do NOT compare this with services.

     displayService is a PriceKey.

     Example:
       services:
       ["Visit", "Repair", "Emergency"]

       displayService:
       "half_day"

       halfDayPrice:
       600
  ===================================== */

  const cleanDisplayService: PriceKey | null =
    displayServiceValue(
      worker.displayService,
    );

  return {
    name:
      worker.name?.trim() ||
      "",

    category:
      worker.category?.trim() ||
      "",

    specialty:
      worker.specialty?.trim() ||
      "",

    rating:
      numberValue(
        worker.rating,
      ),

    review_count:
      numberValue(
        worker.reviewCount,
      ),

    location:
      worker.location?.trim() ||
      "",

    available:
      worker.available ??
      true,

    years_experience:
      numberValue(
        worker.yearsExperience,
      ),

    completed_jobs:
      numberValue(
        worker.completedJobs,
      ),

    bio:
      worker.bio?.trim() ||
      null,

    skills:
      stringArray(
        worker.skills,
      ),

    photo:
      worker.photo?.trim() ||
      null,

    response_time:
      worker.responseTime?.trim() ||
      "Within 1 hour",

    certifications:
      stringArray(
        worker.certifications,
      ),

    subcategory:
      worker.subcategory?.trim() ||
      null,

    /* =====================================
       ACTUAL SERVICES
    ===================================== */

    services:
      cleanServices,

    /* =====================================
       DISPLAY CHARGE

       Stores PriceKey only
    ===================================== */

    display_service:
      cleanDisplayService,

    phone:
      worker.phone?.trim() ||
      null,

    pricing_type:
      worker.pricingType ??
      "custom",

    starting_price:
      numberValue(
        worker.startingPrice,
      ),

    half_day_price:
      numberValue(
        worker.halfDayPrice,
      ),

    full_day_price:
      numberValue(
        worker.fullDayPrice,
      ),

    monthly_price:
      numberValue(
        worker.monthlyPrice,
      ),

    visit_charge:
      numberValue(
        worker.visitCharge,
      ),

    labour_chauk:
      worker.labourChauk?.trim() ||
      null,

    visible_pricing_types:
      Array.isArray(
        worker.visiblePricingTypes,
      )
        ? worker.visiblePricingTypes
        : [],
  };
}

/* =========================================
   GET WORKERS
========================================= */

export async function getWorkers(
  limit = 100,
): Promise<Worker[]> {
  try {
    const {
      data,
      error,
    } = await supabase
      .from("workers")
      .select(WORKER_SELECT)
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(limit);

    if (error) {
      console.error(
        "GET WORKERS ERROR:",
        error.message,
      );

      throw new Error(
        error.message,
      );
    }

    const rows =
      (data ?? []) as unknown as WorkerRow[];

    console.log(
      "GET WORKERS RAW DATA:",
      rows.map(
        (row) => ({
          id:
            row.id,

          name:
            row.name,

          services:
            row.services,

          display_service:
            row.display_service,

          starting_price:
            row.starting_price,

          half_day_price:
            row.half_day_price,

          full_day_price:
            row.full_day_price,

          monthly_price:
            row.monthly_price,

          visit_charge:
            row.visit_charge,
        }),
      ),
    );

    return rows.map(
      mapWorker,
    );
  } catch (error) {
    console.error(
      "GET WORKERS ERROR:",
      error,
    );

    throw error;
  }
}

/* =========================================
   GET SINGLE WORKER
========================================= */

export async function getWorkerById(
  id: string,
): Promise<Worker | null> {
  if (!id) {
    return null;
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from("workers")
      .select(WORKER_SELECT)
      .eq(
        "id",
        id,
      )
      .maybeSingle();

    if (error) {
      console.error(
        "GET WORKER ERROR:",
        error.message,
      );

      throw new Error(
        error.message,
      );
    }

    if (!data) {
      console.warn(
        "GET WORKER: No worker found",
        id,
      );

      return null;
    }

    /* =====================================
       RAW DATABASE DEBUG
    ===================================== */

    const rawWorker =
      data as unknown as WorkerRow;

    console.log(
      "GET WORKER RAW DATABASE:",
      {
        id:
          rawWorker.id,

        name:
          rawWorker.name,

        services:
          rawWorker.services,

        display_service:
          rawWorker.display_service,

        starting_price:
          rawWorker.starting_price,

        half_day_price:
          rawWorker.half_day_price,

        full_day_price:
          rawWorker.full_day_price,

        monthly_price:
          rawWorker.monthly_price,

        visit_charge:
          rawWorker.visit_charge,

        visible_pricing_types:
          rawWorker.visible_pricing_types,
      },
    );

    const worker =
      mapWorker(
        rawWorker,
      );

    /* =====================================
       FINAL WORKER DEBUG
    ===================================== */

    console.log(
      "GET WORKER BY ID:",
      {
        id:
          worker.id,

        name:
          worker.name,

        services:
          worker.services,

        displayService:
          worker.displayService,

        visitCharge:
          worker.visitCharge,

        startingPrice:
          worker.startingPrice,

        halfDayPrice:
          worker.halfDayPrice,

        fullDayPrice:
          worker.fullDayPrice,

        monthlyPrice:
          worker.monthlyPrice,

        visiblePricingTypes:
          worker.visiblePricingTypes,
      },
    );

    return worker;
  } catch (error) {
    console.error(
      "GET WORKER ERROR:",
      error,
    );

    throw error;
  }
}

/* =========================================
   CREATE WORKER
========================================= */

export async function createWorker(
  worker: WorkerFormData,
): Promise<Worker> {
  const payload =
    workerPayload(
      worker,
    );

  console.log(
    "CREATE WORKER PAYLOAD:",
    {
      services:
        payload.services,

      display_service:
        payload.display_service,

      visit_charge:
        payload.visit_charge,

      starting_price:
        payload.starting_price,

      half_day_price:
        payload.half_day_price,

      full_day_price:
        payload.full_day_price,

      monthly_price:
        payload.monthly_price,

      visible_pricing_types:
        payload.visible_pricing_types,
    },
  );

  const {
    data,
    error,
  } = await supabase
    .from("workers")
    .insert(
      payload,
    )
    .select(
      WORKER_SELECT,
    )
    .single();

  if (error) {
    console.error(
      "CREATE WORKER ERROR:",
      error.message,
    );

    if (
      error.code ===
      "23505"
    ) {
      throw new Error(
        "A worker with the same name, category, subcategory, specialty and location already exists.",
      );
    }

    throw new Error(
      error.message ||
        "Unable to create worker.",
    );
  }

  if (!data) {
    throw new Error(
      "Worker was not returned after saving.",
    );
  }

  const createdWorker =
    mapWorker(
      data as unknown as WorkerRow,
    );

  console.log(
    "CREATED WORKER:",
    {
      id:
        createdWorker.id,

      name:
        createdWorker.name,

      services:
        createdWorker.services,

      displayService:
        createdWorker.displayService,

      visitCharge:
        createdWorker.visitCharge,

      startingPrice:
        createdWorker.startingPrice,

      halfDayPrice:
        createdWorker.halfDayPrice,

      fullDayPrice:
        createdWorker.fullDayPrice,

      monthlyPrice:
        createdWorker.monthlyPrice,

      visiblePricingTypes:
        createdWorker.visiblePricingTypes,
    },
  );

  return createdWorker;
}

/* =========================================
   UPDATE WORKER
========================================= */

export async function updateWorker(
  id: string,
  worker: WorkerFormData,
): Promise<Worker> {
  if (!id) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  const payload =
    workerPayload(
      worker,
    );

  console.log(
    "UPDATE WORKER PAYLOAD:",
    {
      id,

      services:
        payload.services,

      display_service:
        payload.display_service,

      visit_charge:
        payload.visit_charge,

      starting_price:
        payload.starting_price,

      half_day_price:
        payload.half_day_price,

      full_day_price:
        payload.full_day_price,

      monthly_price:
        payload.monthly_price,

      visible_pricing_types:
        payload.visible_pricing_types,
    },
  );

  const {
    data,
    error,
  } = await supabase
    .from("workers")
    .update(
      payload,
    )
    .eq(
      "id",
      id,
    )
    .select(
      WORKER_SELECT,
    )
    .single();

  if (error) {
    console.error(
      "UPDATE WORKER ERROR:",
      error.message,
    );

    if (
      error.code ===
      "23505"
    ) {
      throw new Error(
        "Another worker already exists with the same name, category, subcategory, specialty and location.",
      );
    }

    throw new Error(
      error.message ||
        "Unable to update worker.",
    );
  }

  if (!data) {
    throw new Error(
      "Worker was not returned after update.",
    );
  }

  const updatedWorker =
    mapWorker(
      data as unknown as WorkerRow,
    );

  console.log(
    "UPDATED WORKER FROM DATABASE:",
    {
      id:
        updatedWorker.id,

      name:
        updatedWorker.name,

      services:
        updatedWorker.services,

      displayService:
        updatedWorker.displayService,

      visitCharge:
        updatedWorker.visitCharge,

      startingPrice:
        updatedWorker.startingPrice,

      halfDayPrice:
        updatedWorker.halfDayPrice,

      fullDayPrice:
        updatedWorker.fullDayPrice,

      monthlyPrice:
        updatedWorker.monthlyPrice,

      visiblePricingTypes:
        updatedWorker.visiblePricingTypes,
    },
  );

  return updatedWorker;
}

/* =========================================
   DELETE WORKER
========================================= */

export async function deleteWorker(
  id: string,
): Promise<void> {
  if (!id) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  const {
    error,
  } = await supabase
    .from("workers")
    .delete()
    .eq(
      "id",
      id,
    );

  if (error) {
    console.error(
      "DELETE WORKER ERROR:",
      error.message,
    );

    throw new Error(
      error.message,
    );
  }
}

/* =========================================
   AVAILABILITY
========================================= */

export async function setWorkerAvailability(
  id: string,
  available: boolean,
): Promise<void> {
  if (!id) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  const {
    error,
  } = await supabase
    .from("workers")
    .update({
      available,
    })
    .eq(
      "id",
      id,
    );

  if (error) {
    console.error(
      "UPDATE AVAILABILITY ERROR:",
      error.message,
    );

    throw new Error(
      error.message,
    );
  }
}

/* =========================================
   REVIEWS
========================================= */

export type Review = {
  id: string;
  workerId: string;
  author: string;
  authorPhoto: string;
  rating: number;
  date: string;
  comment: string;
  jobType: string;
};

export const reviews: Review[] = [];