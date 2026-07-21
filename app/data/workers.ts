import { supabase } from "@/lib/supabase";

/* =========================
   TYPES
========================= */

export type ServiceCategory = string;

export interface Worker {
  id: string;

  name: string;
  phone: string;

  category: string;
  subcategory: string;
  specialty: string;

  services: string[];

  pricingType:
    | "per_job"
    | "daily"
    | "monthly"
    | "per_service"
    | "visit_charge"
    | "custom";

  startingPrice: number;

  halfDayPrice: number;
  fullDayPrice: number;

  monthlyPrice: number;

  visitCharge: number;

  rating: number;
  reviewCount: number;

  location: string;

  available: boolean;

  yearsExperience: number;
  completedJobs: number;

  bio: string;

  skills: string[];

  photo: string;

  responseTime: string;

  certifications: string[];
}

export interface Review {
  id: string;
  workerId: string;
  author: string;
  authorPhoto: string;
  rating: number;
  date: string;
  comment: string;
  jobType: string;
}

/* =========================
   SERVICE CATEGORIES
========================= */

export const serviceCategories = [
  {
    id: "all",
    label: "Workers",
    description: "Browse all workers",
    color: "#0F172A",
    bgColor: "#F8FAFC",
  },
  {
    id: "Labour",
    label: "Labour",
    description: "General & skilled labour workers",
    color: "#F97316",
    bgColor: "#FFF7ED",
  },

  {
    id: "Driver",
    label: "Driver",
    description: "Car, taxi & heavy vehicle drivers",
    color: "#10B981",
    bgColor: "#ECFDF5",
  },

  {
    id: "Mechanic",
    label: "Mechanic",
    description: "Vehicle repair specialists",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
  },

  {
    id: "Washer",
    label: "Washer",
    description: "Vehicle washing services",
    color: "#06B6D4",
    bgColor: "#ECFEFF",
  },

  {
    id: "Office Worker",
    label: "Office Worker",
    description: "Office support staff",
    color: "#EC4899",
    bgColor: "#FCE7F3",
  },

  {
    id: "Home Services",
    label: "Home Services",
    description: "Domestic & cleaning services",
    color: "#22C55E",
    bgColor: "#DCFCE7",
  },

  {
    id: "Salon & Beauty",
    label: "Salon & Beauty",
    description: "Salon & beauty experts",
    color: "#F43F5E",
    bgColor: "#FFE4E6",
  },

  {
    id: "Restaurant",
    label: "Restaurant",
    description: "Restaurant staff & chefs",
    color: "#EF4444",
    bgColor: "#FEE2E2",
  },

  {
    id: "Contractor",
    label: "Contractor",
    description: "Repair & contractor services",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
  },

  {
    id: "Factory",
    label: "Factory",
    description: "Factory & warehouse workers",
    color: "#475569",
    bgColor: "#F1F5F9",
  },

  {
    id: "Security",
    label: "Security",
    description: "Security guards & bouncers",
    color: "#334155",
    bgColor: "#E2E8F0",
  },

  {
    id: "Event Services",
    label: "Event Services",
    description: "Event & decoration staff",
    color: "#A855F7",
    bgColor: "#F3E8FF",
  },
];

/* =========================
   HELPER
========================= */

const mapWorker = (w: any): Worker => ({
  id: String(w.id),

  name: w.name ?? "",
  phone: w.phone ?? "",

  category: w.category ?? "",
  subcategory: w.subcategory ?? "",
  specialty: w.specialty ?? "",

  services: Array.isArray(w.services) ? w.services : [],

  pricingType: w.pricing_type ?? "custom",

  startingPrice: Number(w.starting_price ?? 0),

  halfDayPrice: Number(w.half_day_price ?? 0),

  fullDayPrice: Number(w.full_day_price ?? 0),

  monthlyPrice: Number(w.monthly_price ?? 0),

  visitCharge: Number(w.visit_charge ?? 0),

  rating: Number(w.rating ?? 0),

  reviewCount: Number(w.review_count ?? 0),

  location: w.location ?? "",

  available: Boolean(w.available),

  yearsExperience: Number(w.years_experience ?? 0),

  completedJobs: Number(w.completed_jobs ?? 0),

  bio: w.bio ?? "",

  skills: Array.isArray(w.skills) ? w.skills : [],

  photo: w.photo ?? "",

  responseTime: w.response_time ?? "Within 1 hour",

  certifications: Array.isArray(w.certifications) ? w.certifications : [],
});

/* =========================
   FETCH ALL WORKERS
========================= */

export async function getWorkers(): Promise<Worker[]> {
  const { data, error } = await supabase
    .from("workers")
    .select(
      `
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
      available,

      years_experience,
      completed_jobs,

      bio,
      skills,

      photo,

      response_time,
      certifications,

      created_at
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.log("SUPABASE ERROR =>", JSON.stringify(error, null, 2));

    return [];
  }

  return (data || []).map(mapWorker);
}

/* =========================
   FETCH SINGLE WORKER
========================= */

export async function getWorkerById(id: string): Promise<Worker | null> {
  try {
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: String(data.id),

      name: data.name || "",
      phone: data.phone || "",

      category: data.category || "",
      subcategory: data.subcategory || "",
      specialty: data.specialty || "",

      services: Array.isArray(data.services) ? data.services : [],

      pricingType: data.pricing_type || "custom",

      startingPrice: Number(data.starting_price || 0),

      halfDayPrice: Number(data.half_day_price || 0),

      fullDayPrice: Number(data.full_day_price || 0),

      monthlyPrice: Number(data.monthly_price || 0),

      visitCharge: Number(data.visit_charge || 0),

      rating: Number(data.rating || 0),

      reviewCount: Number(data.review_count || 0),

      location: data.location || "",

      available: data.available ?? false,

      yearsExperience: Number(data.years_experience || 0),

      completedJobs: Number(data.completed_jobs || 0),

      bio: data.bio || "",

      skills: Array.isArray(data.skills) ? data.skills : [],

      photo: data.photo || "",

      responseTime: data.response_time || "Within 1 hour",

      certifications: Array.isArray(data.certifications)
        ? data.certifications
        : [],
    };
  } catch (err) {
    console.error("GET WORKER ERROR =>", err);

    return null;
  }
}

/* =========================
   REVIEWS
========================= */

export const reviews: Review[] = [];
