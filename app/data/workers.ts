import { supabase } from "@/lib/supabase";

/* =========================
   TYPES
========================= */

export type ServiceCategory = string;

export interface Worker {
  id: string;

  name: string;

  category: string;

  subcategory: string;

  specialty: string;

  services: string[];

  rating: number;

  reviewCount: number;

  hourlyRate: number;

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
    color: "#EAB308",
    bgColor: "#FEFCE8",
  },

  {
    id: "Computer Operator",
    label: "Computer Operator",
    description: "IT & office computer professionals",
    color: "#9333EA",
    bgColor: "#F3E8FF",
  },

  {
    id: "Office Worker",
    label: "Office Worker",
    description: "Office support staff",
    color: "#DB2777",
    bgColor: "#FCE7F3",
  },

  {
    id: "Home Services",
    label: "Home Services",
    description: "Domestic and hotel services",
    color: "#65A30D",
    bgColor: "#ECFCCB",
  },

  {
    id: "Restaurant",
    label: "Restaurant",
    description: "Restaurant staff and chefs",
    color: "#E11D48",
    bgColor: "#FFE4E6",
  },

  {
    id: "Home Contractor",
    label: "Home Contractor",
    description: "Construction & repair contractors",
    color: "#0284C7",
    bgColor: "#E0F2FE",
  },

  {
    id: "Factory",
    label: "Factory",
    description: "Factory and warehouse workers",
    color: "#475569",
    bgColor: "#F1F5F9",
  },

  {
    id: "Roads",
    label: "Roads",
    description: "Road construction workers",
    color: "#D97706",
    bgColor: "#FEF3C7",
  },
];

/* =========================
   HELPER
========================= */

const mapWorker = (w: any): Worker => ({
  id: String(w.id),

  name: w.name ?? "",

  category: w.category ?? "",

  subcategory: w.subcategory ?? "",

  specialty: w.specialty ?? "",

  services: Array.isArray(w.services) ? w.services : [],

  rating: Number(w.rating ?? 0),

  reviewCount: Number(w.review_count ?? 0),

  hourlyRate: Number(w.hourly_rate ?? 0),

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
      category,
      subcategory,
      specialty,
      services,
      rating,
      review_count,
      hourly_rate,
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
      id: data.id,

      name: data.name || "",

      category: data.category || "",

      subcategory: data.subcategory || "",

      specialty: data.specialty || "",
      services: Array.isArray(data.services) ? data.services : [],

      rating: Number(data.rating || 0),

      reviewCount: Number(data.review_count || 0),

      hourlyRate: Number(data.hourly_rate || 0),

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
