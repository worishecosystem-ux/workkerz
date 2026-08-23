"use client";

import { useEffect, useState } from "react";
import WorkerOnboardSections from "./worker-onboarding/WorkerOnboardSections";
import { WORKER_CATEGORIES } from "./data/workerCategories";
import { supabase } from "@/lib/supabase";

type Props = {
  onBack?: () => void;
  onCreated?: (worker: unknown) => void;
};

type Device = "desktop" | "tablet" | "mobile";

type PricingType =
  | "per_job"
  | "daily"
  | "half_day"
  | "full_day"
  | "monthly"
  | "visit_charge"
  | "custom";

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
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  /* =====================================================
     PROFESSIONAL INFORMATION
  ===================================================== */

  const [experience, setExperience] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [bio, setBio] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [certifications, setCertifications] =
    useState<string[]>([]);

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

      setDevice(
        shortest >= 600 ? "tablet" : "mobile",
      );
    };

    detectDevice();

    window.addEventListener("resize", detectDevice);

    return () => {
      window.removeEventListener(
        "resize",
        detectDevice,
      );
    };
  }, []);

  /* =====================================================
     PHOTO UPLOAD
  ===================================================== */

  const uploadWorkerPhoto = async (
    file: File,
  ): Promise<string> => {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

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
      throw uploadError;
    }

    const { data } =
      supabase.storage
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
     VALIDATE PRICE
  ===================================================== */

  const validatePrice = (
    value: string,
    label: string,
  ) => {
    if (!value.trim()) return;

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
     SAVE WORKER
  ===================================================== */

  const handleSave = async () => {
    if (saving) return;

    setError("");
    setSuccess("");

    try {
      /* ---------------------------------------------
         BASIC VALIDATION
      --------------------------------------------- */

      if (!name.trim()) {
        throw new Error(
          "Worker name is required.",
        );
      }

      if (name.trim().length < 2) {
        throw new Error(
          "Worker name must be at least 2 characters.",
        );
      }

      if (!phone.trim()) {
        throw new Error(
          "Phone number is required.",
        );
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
        throw new Error(
          "Specialty is required.",
        );
      }

      if (!location.trim()) {
        throw new Error(
          "Location is required.",
        );
      }

      /* ---------------------------------------------
         PRICE VALIDATION
      --------------------------------------------- */

      validatePrice(
        startingPrice,
        "Starting price",
      );

      validatePrice(
        halfDayPrice,
        "Half day price",
      );

      validatePrice(
        fullDayPrice,
        "Full day price",
      );

      validatePrice(
        monthlyPrice,
        "Monthly price",
      );

      validatePrice(
        visitCharge,
        "Visit charge",
      );

      /* ---------------------------------------------
         START SAVING
      --------------------------------------------- */

      setSaving(true);

      /* ---------------------------------------------
         ADMIN SESSION
      --------------------------------------------- */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired. Please login again.",
        );
      }

      /* ---------------------------------------------
         PHOTO
      --------------------------------------------- */

      let photoUrl = "";

      if (photo) {
        photoUrl =
          await uploadWorkerPhoto(photo);
      }

      /* ---------------------------------------------
         PAYLOAD
      --------------------------------------------- */

      const payload = {
        name: name.trim(),

        phone: phone.trim(),

        category: category.trim(),

        subcategory:
          subcategory.trim(),

        specialty:
          specialty.trim(),

        location:
          location.trim(),

        labour_chauk:
          labourChauk.trim() || null,

        service_types:
          serviceTypes,

        years_experience:
          Number(experience) || 0,

        bio:
          bio.trim() || null,

        response_time:
          responseTime.trim() || null,

        skills,

        services,

        certifications,

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

        available,

        photo:
          photoUrl || null,
      };

      /* ---------------------------------------------
         API REQUEST
      --------------------------------------------- */

      const response = await fetch(
        "/api/admin/workers",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body:
            JSON.stringify(payload),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create worker.",
        );
      }

      /* ---------------------------------------------
         SUCCESS
      --------------------------------------------- */

      setSuccess(
        "Worker added successfully.",
      );

      onCreated?.(
        data?.worker ?? data,
      );

    } catch (err) {
      console.error(
        "Worker onboarding error:",
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
    if (saving) return;

    onBack?.();
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-[#E9ECF1] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">

          {onBack && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9] disabled:opacity-50"
            >
              Back
            </button>
          )}

          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">
              Worker Onboarding
            </h1>

            <p className="text-xs text-[#64748B]">
              Add a new worker
            </p>
          </div>

        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-5xl p-4">

        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
            {success}
          </div>
        )}

        <WorkerOnboardSections

          /* BASIC */

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

          /* PHOTO */

          photo={photo}
          setPhoto={setPhoto}

          /* CATEGORY */

          category={category}
          setCategory={setCategory}

          subcategory={subcategory}
          setSubcategory={setSubcategory}

          serviceTypes={serviceTypes}
          setServiceTypes={setServiceTypes}

          /* PROFESSIONAL */

          experience={experience}
          setExperience={setExperience}

          responseTime={responseTime}
          setResponseTime={setResponseTime}

          bio={bio}
          setBio={setBio}

          skills={skills}
          setSkills={setSkills}

          services={services}
          setServices={setServices}

          certifications={certifications}
          setCertifications={setCertifications}

          /* PRICING */

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

          /* AVAILABILITY */

          available={available}
          setAvailable={setAvailable}

          /* DATA */

          categories={WORKER_CATEGORIES}
          device={device}

          /* ACTIONS */

          onCancel={handleCancel}
          onSave={handleSave}
          saving={saving}
        />

      </main>
    </div>
  );
}