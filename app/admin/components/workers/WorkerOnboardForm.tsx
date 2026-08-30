"use client";

import { useEffect, useState } from "react";

import WorkerOnboardSections from "./worker-onboarding/WorkerOnboardSections";
import { WORKER_CATEGORIES } from "./data/workerCategories";

import { supabase } from "@/lib/supabase";

import { ChevronLeft } from "lucide-react";

import type { PricingType, PriceKey } from "@/app/data/workers";

type Props = {
  onBack?: () => void;
  onCreated?: (worker: unknown) => void;
};

type Device = "desktop" | "tablet" | "mobile";

export default function WorkerOnboardForm({
  onBack,
  onCreated,
}: Props) {
  const [device, setDevice] = useState<Device>("desktop");

  /* =====================================================
     BASIC INFORMATION
  ===================================================== */

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [labourChauk, setLabourChauk] = useState("");

  /* =====================================================
     PHOTO
  ===================================================== */

  const [photo, setPhoto] = useState<File | null>(null);

  /* =====================================================
     CATEGORY
  ===================================================== */

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  /* =====================================================
     SERVICE TYPES
     
     SINGLE SOURCE OF TRUTH
  ===================================================== */

  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  /* =====================================================
     PROFESSIONAL INFORMATION
  ===================================================== */

  const [experience, setExperience] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  /* =====================================================
     PRICING
  ===================================================== */

  const [pricingType, setPricingType] =
    useState<PricingType>("custom");

  const [startingPrice, setStartingPrice] = useState("");
  const [halfDayPrice, setHalfDayPrice] = useState("");
  const [fullDayPrice, setFullDayPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [visitCharge, setVisitCharge] = useState("");

  /* =====================================================
     VISIBLE PRICING TYPES
     
     SINGLE SOURCE OF TRUTH
     
     Database:
     public.workers.visible_pricing_types
  ===================================================== */

  const [visiblePricingTypes, setVisiblePricingTypes] =
    useState<PriceKey[]>([
      "per_job",
      "half_day",
    ]);

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  const [available, setAvailable] = useState(true);

  /* =====================================================
     SAVE STATE
  ===================================================== */

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     DEVICE DETECTION
  ===================================================== */

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent.toLowerCase();

      if (!ua.includes("android")) {
        setDevice("desktop");
        return;
      }

      const shortest = Math.min(
        window.innerWidth,
        window.innerHeight,
      );

      setDevice(shortest >= 600 ? "tablet" : "mobile");
    };

    detectDevice();

    window.addEventListener("resize", detectDevice);

    return () => {
      window.removeEventListener("resize", detectDevice);
    };
  }, []);

  /* =====================================================
     PHOTO UPLOAD
  ===================================================== */

  const uploadWorkerPhoto = async (
    file: File,
  ): Promise<string> => {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeName =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "worker";

    const path = `workers/${safeName}-${Date.now()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("workers")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

    if (uploadError) {
      throw new Error(
        uploadError.message ||
          "Unable to upload worker photo.",
      );
    }

    const { data } = supabase.storage
      .from("workers")
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      throw new Error(
        "Unable to generate worker photo URL.",
      );
    }

    return data.publicUrl;
  };

  /* =====================================================
     PRICE VALIDATION
  ===================================================== */

  const validatePrice = (
    value: string,
    label: string,
  ) => {
    if (!value.trim()) {
      return;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      throw new Error(
        `${label} must be a valid number.`,
      );
    }

    if (number < 0) {
      throw new Error(
        `${label} cannot be negative.`,
      );
    }
  };

  /* =====================================================
     VISIBLE PRICE CHANGE
  ===================================================== */

  const handleVisiblePriceChange = (
    price: PriceKey,
    checked: boolean,
  ) => {
    setVisiblePricingTypes((current) => {
      if (checked) {
        if (current.includes(price)) {
          return current;
        }

        return [...current, price];
      }

      return current.filter(
        (item) => item !== price,
      );
    });
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      /* ===============================================
         BASIC VALIDATION
      =============================================== */

      if (!name.trim()) {
        throw new Error("Worker name is required.");
      }

      if (name.trim().length < 2) {
        throw new Error(
          "Worker name must be at least 2 characters.",
        );
      }

      if (!phone.trim()) {
        throw new Error("Phone number is required.");
      }

      if (!/^[6-9]\d{9}$/.test(phone.trim())) {
        throw new Error(
          "Enter a valid 10 digit mobile number.",
        );
      }

      if (!category.trim()) {
        throw new Error(
          "Worker category is required.",
        );
      }

      if (!subcategory.trim()) {
        throw new Error(
          "Worker subcategory is required.",
        );
      }

      if (!specialty.trim()) {
        throw new Error("Specialty is required.");
      }

      if (!location.trim()) {
        throw new Error("Location is required.");
      }

      /* ===============================================
         PRICE VALIDATION
      =============================================== */

      validatePrice(startingPrice, "Starting price");
      validatePrice(halfDayPrice, "Half day price");
      validatePrice(fullDayPrice, "Full day price");
      validatePrice(monthlyPrice, "Monthly price");
      validatePrice(visitCharge, "Visit charge");

      /* ===============================================
         CLEAN VISIBLE PRICES
      =============================================== */

      const cleanVisiblePricingTypes =
        Array.from(
          new Set(visiblePricingTypes),
        );

      setSaving(true);

      /* ===============================================
         AUTH
      =============================================== */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error(
          "Your admin session has expired. Please login again.",
        );
      }

      /* ===============================================
         PHOTO
      =============================================== */

      let photoUrl: string | null = null;

      if (photo) {
        photoUrl = await uploadWorkerPhoto(photo);
      }

      /* ===============================================
         CLEAN SERVICES
      =============================================== */

      const cleanServices = Array.from(
        new Map(
          serviceTypes
            .filter(
              (service): service is string =>
                typeof service === "string",
            )
            .map((service) => service.trim())
            .filter(Boolean)
            .map((service) => [
              service.toLowerCase(),
              service,
            ]),
        ).values(),
      );

      console.log(
        "================================",
      );

      console.log(
        "SELECTED SERVICE TYPES:",
        serviceTypes,
      );

      console.log(
        "SERVICES TO SAVE:",
        cleanServices,
      );

      console.log(
        "VISIBLE PRICING TYPES:",
        cleanVisiblePricingTypes,
      );

      /* ===============================================
         DATABASE PAYLOAD
      =============================================== */

      const workerData = {
        name: name.trim(),
        phone: phone.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
        specialty: specialty.trim(),
        location: location.trim(),

        labour_chauk:
          labourChauk.trim() || null,

        years_experience:
          Number(experience) || 0,

        bio:
          bio.trim() || null,

        response_time:
          responseTime.trim() || null,

        skills:
          Array.isArray(skills)
            ? [...skills]
            : [],

        services:
          cleanServices,

        certifications:
          Array.isArray(certifications)
            ? [...certifications]
            : [],

        pricing_type:
          pricingType,

        starting_price:
          Number(startingPrice) || 0,

        half_day_price:
          Number(halfDayPrice) || 0,

        full_day_price:
          Number(fullDayPrice) || 0,

        monthly_price:
          Number(monthlyPrice) || 0,

        visit_charge:
          Number(visitCharge) || 0,

        visible_pricing_types:
          cleanVisiblePricingTypes,

        available,

        photo:
          photoUrl,
      };

      console.log(
        "WORKER PAYLOAD:",
        workerData,
      );

      /* ===============================================
         INSERT
      =============================================== */

      const {
        data: worker,
        error: insertError,
      } = await supabase
        .from("workers")
        .insert(workerData)
        .select("*")
        .single();

      /* ===============================================
         ERROR
      =============================================== */

      if (insertError) {
        console.error(
          "WORKER INSERT ERROR:",
          insertError,
        );

        if (insertError.code === "23505") {
          throw new Error(
            "This worker already exists with the same name, category, subcategory, specialty and location.",
          );
        }

        if (insertError.code === "42501") {
          throw new Error(
            "You do not have permission to add workers.",
          );
        }

        if (insertError.code === "23503") {
          throw new Error(
            "Worker data contains an invalid reference.",
          );
        }

        throw new Error(
          insertError.message ||
            "Unable to create worker.",
        );
      }

      /* ===============================================
         RETURN CHECK
      =============================================== */

      if (!worker) {
        throw new Error(
          "Worker was not returned after saving.",
        );
      }

      console.log(
        "WORKER SAVED:",
        worker,
      );

      console.log(
        "SAVED SERVICES:",
        (
          worker as {
            services?: string[] | null;
          }
        ).services,
      );

      console.log(
        "SAVED VISIBLE PRICES:",
        (
          worker as {
            visible_pricing_types?:
              | string[]
              | null;
          }
        ).visible_pricing_types,
      );

      /* ===============================================
         WORKER CODE
      =============================================== */

      const workerCode =
        (
          worker as {
            worker_code?: string | null;
          }
        ).worker_code;

      /* ===============================================
         SUCCESS
      =============================================== */

      setSuccess(
        workerCode
          ? `Worker added successfully — ${workerCode}`
          : "Worker added successfully.",
      );

      onCreated?.(worker);
    } catch (err) {
      console.error(
        "WORKER ONBOARDING ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add worker.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CANCEL
  ===================================================== */

  const handleCancel = () => {
    if (saving) {
      return;
    }

    onBack?.();
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="sticky top-0 z-40 border-b border-[#E9ECF1] bg-white/95 px-3 pt-12 pb-3 backdrop-blur-md sm:px-4 sm:pt-8 sm:pb-3.5 md:pt-6 lg:px-6 lg:pt-4 lg:pb-4">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2.5 sm:gap-3">
          {onBack && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              aria-label="Go back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#334155] transition hover:bg-[#F1F5F9] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
            >
              <ChevronLeft
                size={22}
                strokeWidth={2.2}
              />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold leading-5 text-[#0F172A] sm:text-lg sm:leading-6">
              Worker Onboarding
            </h1>

            <p className="mt-0.5 truncate text-[11px] leading-4 text-[#64748B] sm:text-xs">
              Add a new worker
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-3 pt-3 pb-32 sm:px-4 sm:pt-4 sm:pb-32 md:pt-3 lg:px-6 lg:pt-4 lg:pb-32">
        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold leading-5 text-red-700 sm:mb-4 sm:px-4 sm:py-3 sm:text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-semibold leading-5 text-orange-700 sm:mb-4 sm:px-4 sm:py-3 sm:text-sm">
            {success}
          </div>
        )}

        <WorkerOnboardSections
          name={name}
          phone={phone}
          specialty={specialty}
          location={location}
          labourChauk={labourChauk}
          setName={setName}
          setPhone={setPhone}
          setSpecialty={setSpecialty}
          setLocation={setLocation}
          setLabourChauk={setLabourChauk}
          photo={photo}
          setPhoto={setPhoto}
          category={category}
          setCategory={setCategory}
          subcategory={subcategory}
          setSubcategory={setSubcategory}
          serviceTypes={serviceTypes}
          setServiceTypes={setServiceTypes}
          experience={experience}
          setExperience={setExperience}
          responseTime={responseTime}
          setResponseTime={setResponseTime}
          bio={bio}
          setBio={setBio}
          skills={skills}
          setSkills={setSkills}
          services={serviceTypes}
          setServices={setServiceTypes}
          certifications={certifications}
          setCertifications={setCertifications}
          pricingType={pricingType}
          setPricingType={setPricingType}
          startingPrice={startingPrice}
          setStartingPrice={setStartingPrice}
          halfDayPrice={halfDayPrice}
          setHalfDayPrice={setHalfDayPrice}
          fullDayPrice={fullDayPrice}
          setFullDayPrice={setFullDayPrice}
          monthlyPrice={monthlyPrice}
          setMonthlyPrice={setMonthlyPrice}
          visitCharge={visitCharge}
          setVisitCharge={setVisitCharge}
          visiblePricingTypes={visiblePricingTypes}
          setVisiblePricingTypes={setVisiblePricingTypes}
          handleVisiblePriceChange={handleVisiblePriceChange}
          available={available}
          setAvailable={setAvailable}
          categories={WORKER_CATEGORIES}
          device={device}
          onCancel={handleCancel}
          onSave={handleSave}
          saving={saving}
        />
      </main>
    </div>
  );
}