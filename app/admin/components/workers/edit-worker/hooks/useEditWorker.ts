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

export type EditWorkerFormState = {
  id: string;

  name: string;
  phone: string;

  category: string;
  subcategory: string;
  specialty: string;

  services: string[];

  pricingType: PricingType;

  startingPrice: string;
  halfDayPrice: string;
  fullDayPrice: string;
  monthlyPrice: string;
  visitCharge: string;

  visiblePricingTypes: PriceKey[];

  location: string;
  labourChauk: string;

  available: boolean;

  yearsExperience: string;
  completedJobs: string;

  bio: string;
  skills: string[];

  rating: string;
  reviewCount: string;

  responseTime: string;
  certifications: string[];

  photo: string;
};

const DEFAULT_VISIBLE_PRICING_TYPES: PriceKey[] = [
  "per_job",
  "half_day",
];

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
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD DATABASE
  ===================================================== */

  const loadFromDatabase =
    useCallback(
      (
        data: Partial<EditWorkerFormState>,
      ) => {
        setForm({
          id: data.id ?? "",

          name: data.name ?? "",
          phone: data.phone ?? "",

          category:
            data.category ?? "",

          subcategory:
            data.subcategory ?? "",

          specialty:
            data.specialty ?? "",

          services:
            Array.isArray(data.services)
              ? [...data.services]
              : [],

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

          location:
            data.location ?? "",

          labourChauk:
            data.labourChauk ?? "",

          available:
            data.available ?? true,

          yearsExperience:
            data.yearsExperience ??
            "",

          completedJobs:
            data.completedJobs ??
            "",

          bio:
            data.bio ?? "",

          skills:
            Array.isArray(data.skills)
              ? [...data.skills]
              : [],

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
      form.visiblePricingTypes
        .length === 0
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

    setName,
    setPhone,
    setCategory,
    setSubcategory,
    setSpecialty,

    setLocation,
    setLabourChauk,

    setYearsExperience,
    setCompletedJobs,
    setBio,

    setServices,

    setPricingType,

    setStartingPrice,
    setHalfDayPrice,
    setFullDayPrice,
    setMonthlyPrice,
    setVisitCharge,

    setVisiblePricingTypes,

    setRating,
    setReviewCount,

    setResponseTime,

    setAvailable,
  };
}