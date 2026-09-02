"use client";

import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type {
  PricingType,
} from "@/app/data/workers";

import type {
  PriceKey,
} from "../editWorker.types";

/* =====================================================
   FORM STATE
===================================================== */

export type EditWorkerFormState = {
  id: string;

  name: string;
  phone: string;

  category: string;
  subcategory: string;
  specialty: string;

  /* SERVICES */

  services: string[];

  /* PRICING */

  pricingType: PricingType;

  startingPrice: string;
  halfDayPrice: string;
  fullDayPrice: string;
  monthlyPrice: string;
  visitCharge: string;

  /* VISIBLE PRICING */

  visiblePricingTypes: PriceKey[];

  /*
   * DISPLAY CHARGE
   *
   * IMPORTANT:
   * This is NOT a service name.
   *
   * Allowed values:
   *
   * per_job
   * half_day
   * full_day
   * monthly
   * visit_charge
   */

  displayService: PriceKey | null;

  /* LOCATION */

  location: string;
  labourChauk: string;

  /* AVAILABILITY */

  available: boolean;

  /* EXPERIENCE */

  yearsExperience: string;
  completedJobs: string;

  /* ABOUT */

  bio: string;
  skills: string[];

  /* REVIEWS */

  rating: string;
  reviewCount: string;

  responseTime: string;
  certifications: string[];

  /* PHOTO */

  photo: string;
};

/* =====================================================
   DEFAULT VISIBLE PRICING
===================================================== */

const DEFAULT_VISIBLE_PRICING_TYPES: PriceKey[] = [
  "per_job",
  "half_day",
];

/* =====================================================
   EMPTY FORM
===================================================== */

const EMPTY_FORM: EditWorkerFormState = {
  id: "",

  name: "",
  phone: "",

  category: "",
  subcategory: "",
  specialty: "",

  services: [],

  pricingType: "custom",

  startingPrice: "",
  halfDayPrice: "",
  fullDayPrice: "",
  monthlyPrice: "",
  visitCharge: "",

  visiblePricingTypes:
    DEFAULT_VISIBLE_PRICING_TYPES,

  /*
   * No display charge selected initially.
   */
  displayService: null,

  location: "",
  labourChauk: "",

  available: true,

  yearsExperience: "",
  completedJobs: "",

  bio: "",
  skills: [],

  rating: "",
  reviewCount: "",

  responseTime: "Within 1 hour",

  certifications: [],

  photo: "",
};

/* =====================================================
   HOOK
===================================================== */

export default function useEditWorker() {
  const [form, setForm] =
    useState<EditWorkerFormState>({
      ...EMPTY_FORM,

      services: [],

      skills: [],

      certifications: [],

      visiblePricingTypes: [
        ...DEFAULT_VISIBLE_PRICING_TYPES,
      ],

      displayService: null,
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD FROM DATABASE
  ===================================================== */

  const loadFromDatabase =
    useCallback(
      (
        data: Partial<EditWorkerFormState>,
      ) => {
        setForm({
          id: data.id ?? "",

          name:
            data.name ?? "",

          phone:
            data.phone ?? "",

          category:
            data.category ?? "",

          subcategory:
            data.subcategory ?? "",

          specialty:
            data.specialty ?? "",

          /* SERVICES */

          services:
            Array.isArray(data.services)
              ? [...data.services]
              : [],

          /* PRICING */

          pricingType:
            data.pricingType ??
            "custom",

          startingPrice:
            data.startingPrice ??
            "",

          halfDayPrice:
            data.halfDayPrice ??
            "",

          fullDayPrice:
            data.fullDayPrice ??
            "",

          monthlyPrice:
            data.monthlyPrice ??
            "",

          visitCharge:
            data.visitCharge ??
            "",

          /* VISIBLE PRICING */

          visiblePricingTypes:
            Array.isArray(
              data.visiblePricingTypes,
            )
              ? [
                  ...data.visiblePricingTypes,
                ]
              : [
                  ...DEFAULT_VISIBLE_PRICING_TYPES,
                ],

          /* DISPLAY CHARGE */

          displayService:
            data.displayService ??
            null,

          /* LOCATION */

          location:
            data.location ?? "",

          labourChauk:
            data.labourChauk ?? "",

          /* AVAILABILITY */

          available:
            data.available ?? true,

          /* EXPERIENCE */

          yearsExperience:
            data.yearsExperience ??
            "",

          completedJobs:
            data.completedJobs ??
            "",

          /* ABOUT */

          bio:
            data.bio ?? "",

          skills:
            Array.isArray(data.skills)
              ? [...data.skills]
              : [],

          /* REVIEWS */

          rating:
            data.rating ?? "",

          reviewCount:
            data.reviewCount ??
            "",

          responseTime:
            data.responseTime ??
            "Within 1 hour",

          certifications:
            Array.isArray(
              data.certifications,
            )
              ? [
                  ...data.certifications,
                ]
              : [],

          /* PHOTO */

          photo:
            data.photo ?? "",
        });

        setError("");
      },
      [],
    );

  /* =====================================================
     BASIC INFORMATION
  ===================================================== */

  const setName = useCallback(
    (value: string) => {
      setForm((prev) => ({
        ...prev,
        name: value,
      }));
    },
    [],
  );

  const setPhone = useCallback(
    (value: string) => {
      setForm((prev) => ({
        ...prev,
        phone: value,
      }));
    },
    [],
  );

  const setCategory = useCallback(
    (value: string) => {
      setForm((prev) => ({
        ...prev,
        category: value,
      }));
    },
    [],
  );

  const setSubcategory =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          subcategory: value,
        }));
      },
      [],
    );

  const setSpecialty =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          specialty: value,
        }));
      },
      [],
    );

  /* =====================================================
     LOCATION
  ===================================================== */

  const setLocation =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          location: value,
        }));
      },
      [],
    );

  const setLabourChauk =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          labourChauk: value,
        }));
      },
      [],
    );

  /* =====================================================
     PROFESSIONAL
  ===================================================== */

  const setYearsExperience =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          yearsExperience: value,
        }));
      },
      [],
    );

  const setCompletedJobs =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          completedJobs: value,
        }));
      },
      [],
    );

  const setBio =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          bio: value,
        }));
      },
      [],
    );

  /* =====================================================
     SERVICES
     
     ONLY ACTUAL SERVICES.
     
     Example:
     ["Visit", "Repair", "Emergency"]
     
     Display Charge is NOT managed here.
  ===================================================== */

  const setServices =
    useCallback(
      (
        value:
          | string[]
          | ((prev: string[]) => string[]),
      ) => {
        setForm((prev) => {
          const nextValue =
            typeof value === "function"
              ? value(prev.services)
              : value;

          return {
            ...prev,
            services: [...nextValue],
          };
        });
      },
      [],
    );

  /* =====================================================
     PRICING TYPE
  ===================================================== */

  const setPricingType =
    useCallback(
      (
        value:
          | PricingType
          | ((
              prev: PricingType,
            ) => PricingType),
      ) => {
        setForm((prev) => {
          const nextValue =
            typeof value === "function"
              ? value(prev.pricingType)
              : value;

          return {
            ...prev,
            pricingType: nextValue,
          };
        });
      },
      [],
    );

  /* =====================================================
     PRICES
  ===================================================== */

  const setStartingPrice =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          startingPrice: value,
        }));
      },
      [],
    );

  const setHalfDayPrice =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          halfDayPrice: value,
        }));
      },
      [],
    );

  const setFullDayPrice =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          fullDayPrice: value,
        }));
      },
      [],
    );

  const setMonthlyPrice =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          monthlyPrice: value,
        }));
      },
      [],
    );

  const setVisitCharge =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          visitCharge: value,
        }));
      },
      [],
    );

  /* =====================================================
     DISPLAY CHARGE
     
     Stores ONLY the selected pricing key.
     
     Example:
     
     "half_day"
     "full_day"
     "monthly"
     "visit_charge"
     
     NOT:
     
     "Repair"
     "Emergency"
     "Installation"
  ===================================================== */

  const setDisplayService =
    useCallback(
      (
        value: PriceKey | null,
      ) => {
        setForm((prev) => ({
          ...prev,
          displayService: value,
        }));
      },
      [],
    );

  /* =====================================================
     VISIBLE PRICING TYPES
  ===================================================== */

  const setVisiblePricingTypes: Dispatch<
    SetStateAction<PriceKey[]>
  > = useCallback(
    (value) => {
      setForm((prev) => {
        const nextValue =
          typeof value === "function"
            ? value(
                prev.visiblePricingTypes,
              )
            : value;

        return {
          ...prev,
          visiblePricingTypes: [
            ...nextValue,
          ],
        };
      });
    },
    [],
  );

  /* =====================================================
     RATING
  ===================================================== */

  const setRating =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          rating: value,
        }));
      },
      [],
    );

  const setReviewCount =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          reviewCount: value,
        }));
      },
      [],
    );

  /* =====================================================
     RESPONSE TIME
  ===================================================== */

  const setResponseTime =
    useCallback(
      (value: string) => {
        setForm((prev) => ({
          ...prev,
          responseTime: value,
        }));
      },
      [],
    );

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  const setAvailable: Dispatch<
    SetStateAction<boolean>
  > = useCallback(
    (value) => {
      setForm((prev) => ({
        ...prev,
        available:
          typeof value === "function"
            ? value(prev.available)
            : value,
      }));
    },
    [],
  );

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validate = useCallback(() => {
    if (!form.name.trim()) {
      return "Worker name is required.";
    }

    if (!form.phone.trim()) {
      return "Phone number is required.";
    }

    if (!form.category.trim()) {
      return "Category is required.";
    }

    if (!form.subcategory.trim()) {
      return "Subcategory is required.";
    }

    if (!form.specialty.trim()) {
      return "Specialty is required.";
    }

    if (
      form.visiblePricingTypes.length ===
      0
    ) {
      return "Select at least one pricing type to show.";
    }

    return "";
  }, [form]);

  /* =====================================================
     RESET
  ===================================================== */

  const resetForm = useCallback(() => {
    setForm({
      ...EMPTY_FORM,

      services: [],

      skills: [],

      certifications: [],

      visiblePricingTypes: [
        ...DEFAULT_VISIBLE_PRICING_TYPES,
      ],

      displayService: null,
    });

    setLoading(false);
    setError("");
  }, []);

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    form,

    loading,
    setLoading,

    error,
    setError,

    loadFromDatabase,

    resetForm,

    validate,

    /* BASIC */

    setName,
    setPhone,
    setCategory,
    setSubcategory,
    setSpecialty,

    /* LOCATION */

    setLocation,
    setLabourChauk,

    /* PROFESSIONAL */

    setYearsExperience,
    setCompletedJobs,
    setBio,

    /* SERVICES */

    setServices,

    /* PRICING */

    setPricingType,

    setStartingPrice,
    setHalfDayPrice,
    setFullDayPrice,
    setMonthlyPrice,
    setVisitCharge,

    /* DISPLAY CHARGE */

    setDisplayService,

    /* VISIBLE PRICING */

    setVisiblePricingTypes,

    /* REVIEWS */

    setRating,
    setReviewCount,

    setResponseTime,

    /* AVAILABILITY */

    setAvailable,
  };
}