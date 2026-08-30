import type { Worker } from "@/app/data/workers";

export type EditWorkerModalProps = {
  worker: Worker | null;
  onClose: () => void;
  onUpdated: (worker: Worker) => void;
};

export type PriceKey =
  | "per_job"
  | "half_day"
  | "full_day"
  | "monthly"
  | "visit_charge";

export type EditWorkerFormState = {
  name: string;
  phone: string;
  category: string;
  subcategory: string;
  specialty: string;
  location: string;
  labourChauk: string;

  yearsExperience: string;
  completedJobs: string;
  bio: string;

  services: string[];
  skills: string[];
  certifications: string[];

  pricingType: Worker["pricingType"];
  startingPrice: string;
  halfDayPrice: string;
  fullDayPrice: string;
  monthlyPrice: string;
  visitCharge: string;
  visiblePricingTypes: PriceKey[];

  responseTime: string;
  rating: string;
  reviewCount: string;

  available: boolean;
};