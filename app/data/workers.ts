import { supabase } from "@/lib/supabase";

/* =========================================================
   PRICING TYPE
========================================================= */

export type PricingType =
  | "per_job"
  | "daily"
  | "monthly"
  | "per_service"
  | "visit_charge"
  | "custom";

/* =========================================================
   SERVICE CATEGORIES
========================================================= */

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

/* =========================================================
   SERVICE CATEGORY TYPE
========================================================= */

export type ServiceCategory =
  (typeof serviceCategories)[number];

/* =========================================================
   WORKER TYPE
========================================================= */

export type Worker = {
  id: string;

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

/* =========================================================
   FORM TYPE
========================================================= */

export type WorkerFormData = Omit<
  Worker,
  "id" | "createdAt"
>;

/* =========================================================
   SUPABASE ROW TYPE
========================================================= */

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
  review_count: number | null;

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

/* =========================================================
   SUPABASE SELECT
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function numberValue(
  value: number | string | null | undefined,
): number {
  return Number(value ?? 0) || 0;
}

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

/* =========================================================
   MAP DATABASE → FRONTEND
========================================================= */

export function mapWorker(row: WorkerRow): Worker {
  return {
    id: row.id,

    name: row.name ?? "",
    phone: row.phone ?? "",

    category: row.category ?? "",
    subcategory: row.subcategory ?? "",
    specialty: row.specialty ?? "",

    services: Array.isArray(row.services)
      ? row.services
      : [],

    pricingType: pricingValue(
      row.pricing_type,
    ),

    startingPrice: numberValue(
      row.starting_price,
    ),

    halfDayPrice: numberValue(
      row.half_day_price,
    ),

    fullDayPrice: numberValue(
      row.full_day_price,
    ),

    monthlyPrice: numberValue(
      row.monthly_price,
    ),

    visitCharge: numberValue(
      row.visit_charge,
    ),

    rating: numberValue(row.rating),

    reviewCount:
      Number(row.review_count ?? 0),

    location: row.location ?? "",

    labourChauk:
      row.labour_chauk ?? "",

    available:
      row.available ?? true,

    yearsExperience:
      Number(row.years_experience ?? 0),

    completedJobs:
      Number(row.completed_jobs ?? 0),

    bio: row.bio ?? "",

    skills: Array.isArray(row.skills)
      ? row.skills
      : [],

    photo: row.photo ?? "",

    responseTime:
      row.response_time ??
      "Within 1 hour",

    certifications:
      Array.isArray(row.certifications)
        ? row.certifications
        : [],

    createdAt:
      row.created_at ?? "",
  };
}

/* =========================================================
   GET ALL WORKERS
========================================================= */

export async function getWorkers(): Promise<Worker[]> {
  const { data, error } = await supabase
    .from("workers")
    .select(WORKER_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "GET WORKERS ERROR:",
      error,
    );

    throw new Error(error.message);
  }

  return (
    (data ?? []) as unknown as WorkerRow[]
  ).map(mapWorker);
}

/* =========================================================
   GET SINGLE WORKER
========================================================= */

export async function getWorkerById(
  id: string,
): Promise<Worker | null> {
  if (!id) {
    return null;
  }

  const { data, error } = await supabase
    .from("workers")
    .select(WORKER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "GET WORKER ERROR:",
      error,
    );

    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapWorker(
    data as unknown as WorkerRow,
  );
}

/* =========================================================
   FRONTEND → DATABASE
========================================================= */

function workerPayload(
  worker: WorkerFormData,
) {
  return {
    name: worker.name.trim(),

    phone:
      worker.phone?.trim() || null,

    category:
      worker.category,

    subcategory:
      worker.subcategory || null,

    specialty:
      worker.specialty.trim(),

    services:
      worker.services ?? [],

    pricing_type:
      worker.pricingType,

    starting_price:
      Number(worker.startingPrice) || 0,

    half_day_price:
      Number(worker.halfDayPrice) || 0,

    full_day_price:
      Number(worker.fullDayPrice) || 0,

    monthly_price:
      Number(worker.monthlyPrice) || 0,

    visit_charge:
      Number(worker.visitCharge) || 0,

    rating:
      Number(worker.rating) || 0,

    review_count:
      Number(worker.reviewCount) || 0,

    location:
      worker.location.trim(),

    labour_chauk:
      worker.labourChauk || null,

    available:
      worker.available ?? true,

    years_experience:
      Number(worker.yearsExperience) || 0,

    completed_jobs:
      Number(worker.completedJobs) || 0,

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

/* =========================================================
   CREATE WORKER
========================================================= */

export async function createWorker(
  worker: WorkerFormData,
): Promise<Worker> {
  const payload =
    workerPayload(worker);

  const { data, error } =
    await supabase
      .from("workers")
      .insert(payload)
      .select(WORKER_SELECT)
      .single();

  if (error) {
    console.error(
      "CREATE WORKER ERROR:",
      error,
    );

    throw new Error(error.message);
  }

  return mapWorker(
    data as unknown as WorkerRow,
  );
}

/* =========================================================
   UPDATE WORKER
========================================================= */

export async function updateWorker(
  id: string,
  worker: WorkerFormData,
): Promise<Worker> {
  const payload =
    workerPayload(worker);

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
      error,
    );

    throw new Error(error.message);
  }

  return mapWorker(
    data as unknown as WorkerRow,
  );
}

/* =========================================================
   DELETE WORKER
========================================================= */

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
      error,
    );

    throw new Error(error.message);
  }
}

/* =========================================================
   AVAILABILITY
========================================================= */

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
      error,
    );

    throw new Error(error.message);
  }
}

/* =========================================================
   REVIEWS
========================================================= */

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