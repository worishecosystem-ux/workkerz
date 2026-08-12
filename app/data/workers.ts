/* =========================================
   app/data/workers.ts
========================================= */

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
   SERVICE CATEGORIES
========================================= */

export const serviceCategories = [
  { id: "all", label: "All" },
  { id: "Labour", label: "Labour" },
  { id: "Driver", label: "Driver" },
  { id: "Mechanic", label: "Mechanic" },
  { id: "Painter", label: "Painter" },
  { id: "Washer", label: "Washer" },
  { id: "Office Worker", label: "Office Worker" },
  { id: "Home Services", label: "Home Services" },
  { id: "Restaurant", label: "Restaurant" },
  { id: "Home Contractor", label: "Home Contractor" },
  { id: "Factory", label: "Factory" },
  { id: "Salon & Beauty", label: "Salon & Beauty" },
  { id: "Construction", label: "Construction" },
  { id: "Security", label: "Security" },
  { id: "Event Services", label: "Event Services" },
] as const;

export type ServiceCategory =
  (typeof serviceCategories)[number];

/* =========================================
   WORKER
========================================= */

export type Worker = {
  id: string;
  workerCode?: string | null;

  name: string;
  phone: string;

  category: string;
  subcategory: string;
  specialty: string;

  services: string[];

  pricingType: PricingType;

  startingPrice: number;
  halfDayPrice: number;
  fullDayPrice: number;
  monthlyPrice: number;
  visitCharge: number;

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
   FORM
========================================= */

export type WorkerFormData = Omit<
  Worker,
  "id" | "createdAt"
>;

/* =========================================
   DATABASE ROW
========================================= */

type WorkerRow = {
  id: string;

  name: string;
  phone: string | null;

  category: string;
  subcategory: string | null;
  specialty: string;

  services: string[] | null;

  pricing_type: string | null;

  starting_price: number | string | null;
  half_day_price: number | string | null;
  full_day_price: number | string | null;
  monthly_price: number | string | null;
  visit_charge: number | string | null;

  rating: number | string | null;
  review_count: number | string | null;

  location: string;
  labour_chauk: string | null;

  available: boolean | null;

  years_experience: number | null;
  completed_jobs: number | null;

  bio: string | null;

  skills: string[] | null;

  photo: string | null;

  response_time: string | null;

  certifications: string[] | null;

  created_at: string;
};

/* =========================================
   SELECT
========================================= */

const WORKER_SELECT = `
  id,
  name,
  phone,
  category,
  subcategory,
  specialty,
  services,
  pricing_type,
  starting_price,
  half_day_price,
  full_day_price,
  monthly_price,
  visit_charge,
  rating,
  review_count,
  location,
  labour_chauk,
  available,
  years_experience,
  completed_jobs,
  bio,
  skills,
  photo,
  response_time,
  certifications,
  created_at
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
  const result = Number(value ?? 0);

  return Number.isFinite(result)
    ? result
    : 0;
}

function pricingValue(
  value:
    | string
    | null
    | undefined,
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
   MAP WORKER
========================================= */

export function mapWorker(
  row: WorkerRow,
): Worker {
  return {
    id: row.id,

    name: row.name ?? "",
    phone: row.phone ?? "",

    category:
      row.category ?? "",

    subcategory:
      row.subcategory ?? "",

    specialty:
      row.specialty ?? "",

    services:
      Array.isArray(row.services)
        ? row.services
        : [],

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

    rating:
      numberValue(row.rating),

    reviewCount:
      numberValue(
        row.review_count,
      ),

    location:
      row.location ?? "",

    labourChauk:
      row.labour_chauk ?? "",

    available:
      row.available ?? true,

    yearsExperience:
      Number(
        row.years_experience ?? 0,
      ),

    completedJobs:
      Number(
        row.completed_jobs ?? 0,
      ),

    bio:
      row.bio ?? "",

    skills:
      Array.isArray(row.skills)
        ? row.skills
        : [],

    photo:
      row.photo ?? "",

    responseTime:
      row.response_time ||
      "Within 1 hour",

    certifications:
      Array.isArray(
        row.certifications,
      )
        ? row.certifications
        : [],

    createdAt:
      row.created_at ?? "",
  };
}

/* =========================================
   GET WORKERS
========================================= */

export async function getWorkers(
  limit = 100,
): Promise<Worker[]> {
  try {
    const { data, error } =
      await supabase
        .from("workers")
        .select(WORKER_SELECT)
        .order("created_at", {
          ascending: false,
        })
        .limit(limit);

    if (error) {
      console.error(
        "GET WORKERS ERROR:",
        error.message,
      );

      return [];
    }

    return (
      (data ?? []) as unknown as WorkerRow[]
    ).map(mapWorker);
  } catch (error) {
    console.error(
      "GET WORKERS ERROR:",
      error,
    );

    return [];
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
    const { data, error } =
      await supabase
        .from("workers")
        .select(WORKER_SELECT)
        .eq("id", id)
        .maybeSingle();

    if (error) {
      console.error(
        "GET WORKER ERROR:",
        error.message,
      );

      return null;
    }

    if (!data) {
      return null;
    }

    return mapWorker(
      data as unknown as WorkerRow,
    );
  } catch (error) {
    console.error(
      "GET WORKER ERROR:",
      error,
    );

    return null;
  }
}

/* =========================================
   WORKER PAYLOAD
========================================= */

function workerPayload(
  worker: WorkerFormData,
) {
  return {
    name:
      worker.name?.trim() || "",

    phone:
      worker.phone?.trim() || null,

    category:
      worker.category,

    subcategory:
      worker.subcategory || null,

    specialty:
      worker.specialty?.trim() || "",

    services:
      worker.services ?? [],

    pricing_type:
      worker.pricingType,

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

    rating:
      numberValue(worker.rating),

    review_count:
      numberValue(
        worker.reviewCount,
      ),

    location:
      worker.location?.trim() || "",

    labour_chauk:
      worker.labourChauk || null,

    available:
      worker.available ?? true,

    years_experience:
      numberValue(
        worker.yearsExperience,
      ),

    completed_jobs:
      numberValue(
        worker.completedJobs,
      ),

    bio:
      worker.bio?.trim() || null,

    skills:
      worker.skills ?? [],

    photo:
      worker.photo || null,

    response_time:
      worker.responseTime ||
      "Within 1 hour",

    certifications:
      worker.certifications ?? [],
  };
}

/* =========================================
   CREATE WORKER
========================================= */

export async function createWorker(
  worker: WorkerFormData,
): Promise<Worker> {
  const payload =
    workerPayload(worker);

  try {
    const { data, error } =
      await supabase
        .from("workers")
        .insert(payload)
        .select(WORKER_SELECT)
        .single();

    if (error) {
      console.error(
        "CREATE WORKER ERROR:",
        error.message,
      );

      throw error;
    }

    return mapWorker(
      data as unknown as WorkerRow,
    );
  } catch (error) {
    console.error(
      "CREATE WORKER ERROR:",
      error,
    );

    throw error;
  }
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
    workerPayload(worker);

  try {
    const { data, error } =
      await supabase
        .from("workers")
        .update(payload)
        .eq("id", id)
        .select(WORKER_SELECT)
        .single();

    if (error) {
      console.error(
        "UPDATE WORKER ERROR:",
        error.message,
      );

      throw error;
    }

    return mapWorker(
      data as unknown as WorkerRow,
    );
  } catch (error) {
    console.error(
      "UPDATE WORKER ERROR:",
      error,
    );

    throw error;
  }
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

  const { error } =
    await supabase
      .from("workers")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "DELETE WORKER ERROR:",
      error.message,
    );

    throw error;
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

  const { error } =
    await supabase
      .from("workers")
      .update({
        available,
      })
      .eq("id", id);

  if (error) {
    console.error(
      "UPDATE AVAILABILITY ERROR:",
      error.message,
    );

    throw error;
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