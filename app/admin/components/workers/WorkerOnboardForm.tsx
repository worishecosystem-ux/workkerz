"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Search,
  Tag,
  User,
  X,
} from "lucide-react";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

type WorkerOnboardFormProps = {
  onBack: () => void;
  onCreated?: (worker: any) => void;
};

type PricingType =
  | "custom"
  | "per_job"
  | "daily"
  | "monthly"
  | "per_service"
  | "visit_charge";

/* =====================================================
   WORKER CATEGORY DATA
===================================================== */

const WORKER_CATEGORIES = {
  Labour: ["Labour", "Skilled Labour", "Certified Labour"],

  Driver: [
    "Car Driver",
    "Commercial Driver",
    "Taxi Driver",
    "Heavy Vehicle Driver",
    "Heavy Vehicle Helper",
  ],

  Mechanic: [
    "Two Wheeler Mechanic",
    "Three Wheeler Mechanic",
    "Four Wheeler Mechanic",
    "Heavy Vehicle Mechanic",
  ],

  Washer: [
    "Two Wheeler Washer",
    "Three Wheeler Washer",
    "Four Wheeler Washer",
    "Heavy Vehicle Washer",
  ],

  "Computer Operator": [
    "Web Developer",
    "Application Developer",
    "Graphic Designer",
    "Software Developer",
    "Computer Technician",
    "Data Entry Operator",
  ],

  "Office Worker": ["Peon", "Cleaner", "Helper", "Assistant"],

  "Home Services": [
    "Chef",
    "Maid",
    "Cook",
    "Laundry Worker",
    "Washroom Cleaner",
  ],

  Restaurant: [
    "Chef",
    "Kitchen Helper",
    "Waiter",
    "Waiter Helper",
    "Captain",
    "Manager",
  ],

  "Home Contractor": [
    "Welder",
    "Plumber",
    "Carpenter",
    "Electrician",
    "Roofer",
  ],

  Factory: [
    "Assembly Line Worker",
    "Machine Operator",
    "Maintenance Technician",
    "Warehouse Associate",
  ],

  Roads: ["Roller Operator", "General Labour", "Mason", "Concrete Finisher"],
} as const;

type WorkerCategory = keyof typeof WORKER_CATEGORIES;

/* =====================================================
   CONSTANTS
===================================================== */

const WORKER_IMAGE_BUCKET = "workers";

/* =====================================================
   COMPONENT
===================================================== */

export default function WorkerOnboardForm({
  onBack,
  onCreated,
}: WorkerOnboardFormProps) {
  /* =====================================================
     BASIC INFORMATION
  ===================================================== */

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [category, setCategory] = useState<WorkerCategory | "">("");

  const [subcategory, setSubcategory] = useState("");

  const [specialty, setSpecialty] = useState("");

  const [location, setLocation] = useState("");

  const [labourChauk, setLabourChauk] = useState("");

  /* =====================================================
     PROFESSIONAL INFORMATION
  ===================================================== */

  const [yearsExperience, setYearsExperience] = useState("0");

  const [bio, setBio] = useState("");

  const [responseTime, setResponseTime] = useState("");

  const [skills, setSkills] = useState<string[]>([]);

  const [services, setServices] = useState<string[]>([]);

  const [certifications, setCertifications] = useState<string[]>([]);

  const [skillInput, setSkillInput] = useState("");

  const [serviceInput, setServiceInput] = useState("");

  const [certificationInput, setCertificationInput] = useState("");

  /* =====================================================
     PHOTO
  ===================================================== */

  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [photoPreview, setPhotoPreview] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");

  const [photoError, setPhotoError] = useState("");

  const [photoUploading, setPhotoUploading] = useState(false);

  /* =====================================================
     PRICING
  ===================================================== */

  const [pricingType, setPricingType] = useState<PricingType>("custom");

  const [startingPrice, setStartingPrice] = useState("0");

  const [halfDayPrice, setHalfDayPrice] = useState("0");

  const [fullDayPrice, setFullDayPrice] = useState("0");

  const [monthlyPrice, setMonthlyPrice] = useState("0");

  const [visitCharge, setVisitCharge] = useState("0");

  /* =====================================================
     STATUS
  ===================================================== */

  const [available, setAvailable] = useState(true);

  /* =====================================================
     UI
  ===================================================== */

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =====================================================
     CLEAN PHOTO PREVIEW
  ===================================================== */

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  /* =====================================================
     PHOTO VALIDATION
  ===================================================== */

  const validatePhoto = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, PNG and WebP images are allowed.";
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return "Image size must be less than 5 MB.";
    }

    return "";
  };

  /* =====================================================
     SELECT PHOTO
  ===================================================== */

  const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoError("");

    const validationError = validatePhoto(file);

    if (validationError) {
      setPhotoError(validationError);

      event.target.value = "";

      return;
    }

    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setPhotoFile(file);

    setPhotoPreview(previewUrl);

    setPhotoUrl("");

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     REMOVE PHOTO
  ===================================================== */

  const removePhoto = () => {
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(null);
    setPhotoPreview("");
    setPhotoUrl("");
    setPhotoError("");

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     UPLOAD WORKER PHOTO
  ===================================================== */

  const uploadWorkerPhoto = async (file: File): Promise<string> => {
    setPhotoUploading(true);
    setPhotoError("");

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeName =
        name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "worker";

      const fileName = `${safeName}-${Date.now()}.${extension}`;

      const filePath = `workers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(WORKER_IMAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(WORKER_IMAGE_BUCKET)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error("Unable to generate worker photo URL.");
      }

      return publicUrl;
    } catch (error) {
      console.error("WORKER PHOTO UPLOAD ERROR:", error);

      throw new Error(
        error instanceof Error
          ? error.message
          : "Unable to upload worker photo.",
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  /* =====================================================
     CREATE WORKER
  ===================================================== */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      if (!name.trim()) {
        throw new Error("Worker name is required.");
      }

      if (!phone.trim()) {
        throw new Error("Phone number is required.");
      }

      if (!/^[6-9]\d{9}$/.test(phone.trim())) {
        throw new Error("Enter valid 10 digit mobile number.");
      }

      if (!category) {
        throw new Error("Worker category is required.");
      }

      if (!subcategory.trim()) {
        throw new Error("Worker subcategory is required.");
      }

      if (!specialty.trim()) {
        throw new Error("Specialty is required.");
      }

      if (!location.trim()) {
        throw new Error("Location is required.");
      }

      /* =================================================
         SUPABASE SESSION
      ================================================= */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Your admin session has expired. Please login again.");
      }

      /* =================================================
         PHOTO
      ================================================= */

      let finalPhoto = photoUrl.trim();

      if (photoFile) {
        finalPhoto = await uploadWorkerPhoto(photoFile);
      }

      /* =================================================
         PAYLOAD
      ================================================= */

      const workerPayload = {
        name: name.trim(),

        category: category.trim(),

        subcategory: subcategory.trim(),

        specialty: specialty.trim(),

        location: location.trim(),

        phone: phone.trim() || null,

        labour_chauk: labourChauk.trim() || null,

        years_experience: Number(yearsExperience) || 0,

        bio: bio.trim() || null,

        response_time: responseTime.trim() || null,

        skills: [...skills],

        services: [...services],

        certifications: [...certifications],

        pricing_type: pricingType,

        starting_price: Number(startingPrice) || 0,

        half_day_price: Number(halfDayPrice) || 0,

        full_day_price: Number(fullDayPrice) || 0,

        monthly_price: Number(monthlyPrice) || 0,

        visit_charge: Number(visitCharge) || 0,

        available,

        photo: finalPhoto || null,
      };

      /* =================================================
         API
      ================================================= */

      const response = await fetch("/api/admin/workers", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify(workerPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create worker.");
      }

      setSuccess("Worker onboarded successfully.");

      onCreated?.(data.worker);
    } catch (error) {
      console.error("Worker onboarding error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to onboard worker.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-3 sm:min-h-20 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl hover:bg-[#F8FAFC] disabled:opacity-50 sm:mr-4 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-5 w-5 text-[#64748B]" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-[#0F172A] sm:text-2xl">
                Worker Onboarding
              </h1>

              <p className="mt-0.5 hidden text-xs text-[#64748B] sm:block sm:text-sm">
                Add a worker to the Workkerz marketplace.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="hidden text-xs font-semibold text-[#64748B] sm:block">
              New Worker
            </span>
          </div>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto w-full max-w-6xl p-3 sm:p-5 lg:p-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 pb-6 sm:space-y-6 sm:pb-8"
        >
          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="overflow-visible rounded-xl border border-gray-100 bg-white sm:rounded-2xl">
            <SectionHeader
              title="Basic Information"
              description="Worker identity and contact details."
            />

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-6">
              <InputField
                label="Worker Name"
                icon={User}
                value={name}
                onChange={setName}
                placeholder="Enter worker name"
                required
              />

              <InputField
                label="Phone Number"
                icon={Phone}
                value={phone}
                onChange={(value) =>
                  setPhone(value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="Enter mobile number"
                type="tel"
                inputMode="numeric"
                required
              />

              {/* CUSTOM CATEGORY */}

              <CategoryDropdown
                value={category}
                onChange={(value) => {
                  setCategory(value);

                  setSubcategory("");
                }}
              />

              {/* CUSTOM SUBCATEGORY */}

              <SubcategoryDropdown
                category={category}
                value={subcategory}
                onChange={setSubcategory}
              />

              <InputField
                label="Specialty"
                icon={BriefcaseBusiness}
                value={specialty}
                onChange={setSpecialty}
                placeholder="e.g. Brick Mason"
                required
              />

              <InputField
                label="Location"
                icon={MapPin}
                value={location}
                onChange={setLocation}
                placeholder="e.g. Gwalior"
                required
              />

              <InputField
                label="Labour Chauk"
                icon={MapPin}
                value={labourChauk}
                onChange={setLabourChauk}
                placeholder="e.g. Thatipur Labour Chauk"
              />
            </div>
          </section>

          {/* =================================================
              WORKER PHOTO
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white sm:rounded-2xl">
            <SectionHeader
              title="Worker Photo"
              description="Take a live photo or choose an existing image."
            />

            <div className="p-4 sm:p-6">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-gray-200 bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-orange-50 sm:mx-0 sm:h-32 sm:w-32">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={name || "Worker photo"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-9 w-9 text-[#FF5C39]" />
                  )}

                  {photoFile && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-bold text-white">
                      SELECTED
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-center text-sm font-bold text-[#0F172A] sm:text-left">
                    {photoPreview
                      ? "Worker photo selected"
                      : "Add worker photo"}
                  </p>

                  <p className="mt-1 text-center text-xs text-[#64748B] sm:text-left">
                    Use camera for a new photo or choose one from your device.
                  </p>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={loading || photoUploading}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5C39] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#e54e2e] disabled:opacity-50 sm:w-auto sm:text-sm"
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || photoUploading}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-[#475569] hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:text-sm"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Choose File
                    </button>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        disabled={loading || photoUploading}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-50 sm:w-auto sm:text-sm"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  <p className="mt-3 text-center text-[10px] text-[#94A3B8] sm:text-left sm:text-xs">
                    JPG, PNG or WebP • Maximum 5 MB
                  </p>

                  {photoFile && (
                    <p className="mt-1 truncate text-center text-[10px] font-medium text-emerald-600 sm:text-left sm:text-xs">
                      {photoFile.name}
                    </p>
                  )}
                </div>
              </div>

              {photoError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs text-red-600">{photoError}</p>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              PROFESSIONAL INFORMATION
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white sm:rounded-2xl">
            <SectionHeader
              title="Professional Information"
              description="Experience, skills and services."
            />

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <InputField
                  label="Years of Experience"
                  icon={BriefcaseBusiness}
                  value={yearsExperience}
                  onChange={setYearsExperience}
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                />

                <InputField
                  label="Response Time"
                  icon={CheckCircle2}
                  value={responseTime}
                  onChange={setResponseTime}
                  placeholder="e.g. Within 30 minutes"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#0F172A] sm:text-sm">
                  Worker Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Write a short description about the worker..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3 text-xs text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 sm:px-4 sm:text-sm"
                />
              </div>

              <TagInput
                label="Skills"
                placeholder="Add a skill and press Enter"
                value={skillInput}
                setValue={setSkillInput}
                items={skills}
                setItems={setSkills}
              />

              <TagInput
                label="Services"
                placeholder="Add a service and press Enter"
                value={serviceInput}
                setValue={setServiceInput}
                items={services}
                setItems={setServices}
              />

              <TagInput
                label="Certifications"
                placeholder="Add certification and press Enter"
                value={certificationInput}
                setValue={setCertificationInput}
                items={certifications}
                setItems={setCertifications}
              />
            </div>
          </section>

          {/* =================================================
              PRICING
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white sm:rounded-2xl">
            <SectionHeader
              title="Pricing"
              description="Set the worker's marketplace pricing."
            />

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#0F172A] sm:text-sm">
                  Pricing Type
                </label>

                <div className="relative">
                  <select
                    value={pricingType}
                    onChange={(event) =>
                      setPricingType(event.target.value as PricingType)
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 pr-10 text-xs text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 sm:h-11 sm:px-4 sm:text-sm"
                  >
                    <option value="custom">Custom</option>

                    <option value="per_job">Per Job</option>

                    <option value="daily">Daily</option>

                    <option value="monthly">Monthly</option>

                    <option value="per_service">Per Service</option>

                    <option value="visit_charge">Visit Charge</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] sm:right-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                <PriceInput
                  label="Starting Price"
                  value={startingPrice}
                  onChange={setStartingPrice}
                />

                <PriceInput
                  label="Half Day"
                  value={halfDayPrice}
                  onChange={setHalfDayPrice}
                />

                <PriceInput
                  label="Full Day"
                  value={fullDayPrice}
                  onChange={setFullDayPrice}
                />

                <PriceInput
                  label="Monthly"
                  value={monthlyPrice}
                  onChange={setMonthlyPrice}
                />

                <PriceInput
                  label="Visit Charge"
                  value={visitCharge}
                  onChange={setVisitCharge}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              AVAILABILITY
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white sm:rounded-2xl">
            <SectionHeader
              title="Availability"
              description="Control whether this worker is currently available."
            />

            <div className="p-4 sm:p-6">
              <button
                type="button"
                onClick={() => setAvailable((value) => !value)}
                className="flex w-full items-center gap-3 text-left sm:w-auto sm:gap-4"
              >
                <div
                  className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
                    available ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      available ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#0F172A] sm:text-sm">
                    {available ? "Available Now" : "Currently Unavailable"}
                  </p>

                  <p className="mt-1 text-[10px] text-[#64748B] sm:text-xs">
                    {available
                      ? "Worker can receive bookings."
                      : "Worker will not appear as available."}
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* =================================================
              MESSAGES
          ================================================= */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="text-xs leading-5 text-red-600 sm:text-sm">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 sm:px-4 sm:py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />

              <p className="text-xs text-emerald-700 sm:text-sm">{success}</p>
            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="sticky bottom-0 z-30 -mx-3 flex items-center justify-end gap-2 border-t border-gray-100 bg-[#F8FAFC]/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <button
              type="button"
              onClick={onBack}
              disabled={loading || photoUploading}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-[#64748B] hover:bg-gray-50 disabled:opacity-50 sm:h-11 sm:px-6 sm:text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || photoUploading}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#FF5C39] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#e54e2e] disabled:opacity-60 sm:h-11 sm:px-7 sm:text-sm"
            >
              {loading || photoUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {photoUploading
                ? "Uploading Photo..."
                : loading
                  ? "Creating Worker..."
                  : "Create Worker"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* =====================================================
   SECTION HEADER
===================================================== */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
      <h2 className="text-sm font-black text-[#0F172A] sm:text-base">
        {title}
      </h2>

      <p className="mt-1 text-[10px] text-[#64748B] sm:text-xs">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   CUSTOM CATEGORY DROPDOWN
===================================================== */

function CategoryDropdown({
  value,
  onChange,
}: {
  value: WorkerCategory | "";
  onChange: (value: WorkerCategory) => void;
}) {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const categories = Object.keys(WORKER_CATEGORIES) as WorkerCategory[];

  const filteredCategories = categories.filter((item) =>
    item.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:mb-2 sm:text-sm">
        Worker Category
        <span className="ml-1 text-[#FF5C39]">*</span>
      </label>

      {/* INPUT */}

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);

          setSearch("");
        }}
        className={`
          flex
          h-10
          w-full
          items-center
          justify-between
          rounded-xl
          border
          bg-[#F8FAFC]
          px-3
          text-left
          outline-none
          transition
          sm:h-11
          sm:px-4
          ${
            open
              ? "border-[#FF5C39] bg-white ring-2 ring-orange-100"
              : "border-gray-200 hover:border-gray-300"
          }
        `}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <BriefcaseBusiness className="h-4 w-4 shrink-0 text-[#94A3B8]" />

          <span
            className={`truncate text-xs font-semibold sm:text-sm ${
              value ? "text-[#0F172A]" : "text-[#94A3B8]"
            }`}
          >
            {value || "Select worker category"}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}

      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-50
            mt-2
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-[0_12px_35px_rgba(15,23,42,0.12)]
          "
        >
          {/* SEARCH */}

          <div className="border-b border-gray-100 p-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />

              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search category..."
                className="
                  h-9
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-[#F8FAFC]
                  pl-9
                  pr-3
                  text-xs
                  text-[#0F172A]
                  outline-none
                  focus:border-[#FF5C39]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-orange-100
                "
              />
            </div>
          </div>

          {/* OPTIONS */}

          <div className="max-h-64 overflow-y-auto p-1.5">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((item) => {
                const selected = value === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onChange(item);

                      setOpen(false);

                      setSearch("");
                    }}
                    className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        transition
                        ${
                          selected
                            ? "bg-orange-50 text-[#C2410C]"
                            : "text-[#334155] hover:bg-[#F8FAFC]"
                        }
                      `}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            ${selected ? "bg-orange-100" : "bg-gray-100"}
                          `}
                      >
                        <BriefcaseBusiness
                          className={`h-3.5 w-3.5 ${
                            selected ? "text-[#FF5C39]" : "text-[#64748B]"
                          }`}
                        />
                      </div>

                      <span className="truncate text-xs font-semibold sm:text-sm">
                        {item}
                      </span>
                    </div>

                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-[#FF5C39]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center">
                <Search className="mx-auto h-5 w-5 text-[#CBD5E1]" />

                <p className="mt-2 text-xs font-semibold text-[#64748B]">
                  No category found
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {value && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C39]" />

          <span className="text-[10px] font-semibold text-[#64748B] sm:text-xs">
            {WORKER_CATEGORIES[value].length} subcategories available
          </span>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   CUSTOM SUBCATEGORY DROPDOWN
===================================================== */

function SubcategoryDropdown({
  category,
  value,
  onChange,
}: {
  category: WorkerCategory | "";
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const disabled = !category;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const subcategories = category ? [...WORKER_CATEGORIES[category]] : [];

  const filteredSubcategories = subcategories.filter((item) =>
    item.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:mb-2 sm:text-sm">
        Worker Subcategory
        <span className="ml-1 text-[#FF5C39]">*</span>
      </label>

      {/* INPUT */}

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }

          setOpen((current) => !current);

          setSearch("");
        }}
        className={`
          flex
          h-10
          w-full
          items-center
          justify-between
          rounded-xl
          border
          px-3
          text-left
          outline-none
          transition
          sm:h-11
          sm:px-4
          ${
            disabled
              ? "cursor-not-allowed border-gray-100 bg-gray-50"
              : open
                ? "border-[#FF5C39] bg-white ring-2 ring-orange-100"
                : "border-gray-200 bg-[#F8FAFC] hover:border-gray-300"
          }
        `}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Tag
            className={`h-4 w-4 shrink-0 ${
              disabled ? "text-[#CBD5E1]" : "text-[#94A3B8]"
            }`}
          />

          <span
            className={`truncate text-xs font-semibold sm:text-sm ${
              disabled
                ? "text-[#CBD5E1]"
                : value
                  ? "text-[#0F172A]"
                  : "text-[#94A3B8]"
            }`}
          >
            {disabled ? "Select category first" : value || "Select subcategory"}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${
            disabled ? "text-[#CBD5E1]" : "text-[#94A3B8]"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN */}

      {open && !disabled && (
        <div
          className="
              absolute
              left-0
              right-0
              top-full
              z-50
              mt-2
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-[0_12px_35px_rgba(15,23,42,0.12)]
            "
        >
          {/* SEARCH */}

          <div className="border-b border-gray-100 p-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />

              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subcategory..."
                className="
                    h-9
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-[#F8FAFC]
                    pl-9
                    pr-3
                    text-xs
                    text-[#0F172A]
                    outline-none
                    focus:border-[#FF5C39]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-orange-100
                  "
              />
            </div>
          </div>

          {/* OPTIONS */}

          <div className="max-h-64 overflow-y-auto p-1.5">
            {filteredSubcategories.length > 0 ? (
              filteredSubcategories.map((item) => {
                const selected = value === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onChange(item);

                      setOpen(false);

                      setSearch("");
                    }}
                    className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-xl
                          px-3
                          py-2.5
                          text-left
                          transition
                          ${
                            selected
                              ? "bg-orange-50 text-[#C2410C]"
                              : "text-[#334155] hover:bg-[#F8FAFC]"
                          }
                        `}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              ${selected ? "bg-orange-100" : "bg-gray-100"}
                            `}
                      >
                        <Tag
                          className={`h-3.5 w-3.5 ${
                            selected ? "text-[#FF5C39]" : "text-[#64748B]"
                          }`}
                        />
                      </div>

                      <span className="truncate text-xs font-semibold sm:text-sm">
                        {item}
                      </span>
                    </div>

                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-[#FF5C39]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center">
                <Search className="mx-auto h-5 w-5 text-[#CBD5E1]" />

                <p className="mt-2 text-xs font-semibold text-[#64748B]">
                  No subcategory found
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {value && (
        <div className="mt-2">
          <span className="inline-flex max-w-full items-center rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#C2410C] sm:text-xs">
            <span className="truncate">{value}</span>
          </span>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   INPUT FIELD
===================================================== */

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  inputMode,
}: {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:mb-2 sm:text-sm">
        {label}

        {required && <span className="ml-1 text-[#FF5C39]">*</span>}
      </label>

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8] sm:left-3.5 sm:h-4 sm:w-4" />

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          min={type === "number" ? "0" : undefined}
          className="h-10 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-9 pr-3 text-xs text-[#0F172A] outline-none transition placeholder:text-[#A8B2C1] focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:h-11 sm:pl-10 sm:pr-4 sm:text-sm"
        />
      </div>
    </div>
  );
}

/* =====================================================
   PRICE INPUT
===================================================== */

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold text-[#64748B] sm:mb-2 sm:text-xs">
        {label}
      </label>

      <div className="relative">
        <IndianRupee className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#94A3B8] sm:left-3 sm:h-3.5 sm:w-3.5" />

        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="numeric"
          className="h-10 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-7 pr-2 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 sm:pl-8 sm:pr-3 sm:text-sm"
        />
      </div>
    </div>
  );
}

/* =====================================================
   TAG INPUT
===================================================== */

function TagInput({
  label,
  placeholder,
  value,
  setValue,
  items,
  setItems,
}: {
  label: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const add = () => {
    const clean = value.trim();

    if (!clean) {
      return;
    }

    if (items.some((item) => item.toLowerCase() === clean.toLowerCase())) {
      setValue("");

      return;
    }

    setItems([...items, clean]);

    setValue("");
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:mb-2 sm:text-sm">
        {label}
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              add();
            }
          }}
          placeholder={placeholder}
          className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 text-xs text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 sm:h-11 sm:px-4 sm:text-sm"
        />

        <button
          type="button"
          onClick={add}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-[#F8FAFC] hover:bg-gray-100 sm:h-11 sm:w-11"
        >
          <Plus className="h-4 w-4 text-[#64748B]" />
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[10px] font-semibold text-[#C2410C] sm:px-3 sm:text-xs"
            >
              <span className="max-w-[200px] truncate">{item}</span>

              <button
                type="button"
                onClick={() =>
                  setItems(items.filter((_, itemIndex) => itemIndex !== index))
                }
                className="shrink-0 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
