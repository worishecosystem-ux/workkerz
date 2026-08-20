"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

import {
  X,
  User,
  Phone,
  BriefcaseBusiness,
  MapPin,
  Loader2,
  Wrench,
  IndianRupee,
  Camera,
  Upload,
  Trash2,
  Star,
  Clock3,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

import {
  updateWorker,
  type Worker,
  type WorkerFormData,
} from "@/app/data/workers";

import { createClient } from "@supabase/supabase-js";

/* =====================================================
   SUPABASE
===================================================== */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const WORKER_IMAGE_BUCKET = "workers";

/* =====================================================
   TYPES
===================================================== */

type EditWorkerModalProps = {
  worker: Worker | null;
  onClose: () => void;
  onUpdated: (worker: Worker) => void;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function EditWorkerModal({
  worker,
  onClose,
  onUpdated,
}: EditWorkerModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* =====================================================
     BASIC
  ===================================================== */

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [specialty, setSpecialty] = useState("");

  const [location, setLocation] = useState("");
  const [labourChauk, setLabourChauk] = useState("");

  const [yearsExperience, setYearsExperience] = useState("");
  const [completedJobs, setCompletedJobs] = useState("");

  const [bio, setBio] = useState("");

  /* =====================================================
     PHOTO
  ===================================================== */

  const [photo, setPhoto] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  /* =====================================================
     ARRAYS
  ===================================================== */

  const [services, setServices] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  /* =====================================================
     PRICING
  ===================================================== */

  const [pricingType, setPricingType] =
    useState<Worker["pricingType"]>("custom");

  const [startingPrice, setStartingPrice] = useState("");
  const [halfDayPrice, setHalfDayPrice] = useState("");
  const [fullDayPrice, setFullDayPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [visitCharge, setVisitCharge] = useState("");

  /* =====================================================
     OTHER
  ===================================================== */

  const [responseTime, setResponseTime] = useState("Within 1 hour");
  const [rating, setRating] = useState("");
  const [reviewCount, setReviewCount] = useState("");
  const [available, setAvailable] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     ANDROID KEYBOARD
  ===================================================== */

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  /* =====================================================
     LOAD WORKER
  ===================================================== */

  useEffect(() => {
    if (!worker) return;

    setName(worker.name ?? "");
    setPhone(worker.phone ?? "");

    setCategory(worker.category ?? "");
    setSubcategory(worker.subcategory ?? "");
    setSpecialty(worker.specialty ?? "");

    setLocation(worker.location ?? "");
    setLabourChauk(worker.labourChauk ?? "");

    setYearsExperience(
      worker.yearsExperience != null ? String(worker.yearsExperience) : "",
    );

    setCompletedJobs(
      worker.completedJobs != null ? String(worker.completedJobs) : "",
    );

    setBio(worker.bio ?? "");

    setPhoto(worker.photo ?? "");
    setPhotoPreview(worker.photo ?? "");
    setSelectedPhoto(null);
    setPhotoError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setServices(Array.isArray(worker.services) ? [...worker.services] : []);

    setSkills(Array.isArray(worker.skills) ? [...worker.skills] : []);

    setCertifications(
      Array.isArray(worker.certifications) ? [...worker.certifications] : [],
    );

    setPricingType(worker.pricingType ?? "custom");

    setStartingPrice(
      worker.startingPrice != null ? String(worker.startingPrice) : "",
    );

    setHalfDayPrice(
      worker.halfDayPrice != null ? String(worker.halfDayPrice) : "",
    );

    setFullDayPrice(
      worker.fullDayPrice != null ? String(worker.fullDayPrice) : "",
    );

    setMonthlyPrice(
      worker.monthlyPrice != null ? String(worker.monthlyPrice) : "",
    );

    setVisitCharge(
      worker.visitCharge != null ? String(worker.visitCharge) : "",
    );

    setResponseTime(worker.responseTime || "Within 1 hour");

    setRating(worker.rating != null ? String(worker.rating) : "");

    setReviewCount(
      worker.reviewCount != null ? String(worker.reviewCount) : "",
    );

    setAvailable(worker.available ?? true);

    setError("");
    setKeyboardOpen(false);
  }, [worker]);

  /* =====================================================
     CAPACITOR ANDROID KEYBOARD LISTENER
  ===================================================== */

  useEffect(() => {
    if (!worker) return;

    if (!Capacitor.isNativePlatform()) {
      setKeyboardOpen(false);
      return;
    }

    let showListener: {
      remove: () => Promise<void>;
    } | null = null;

    let hideListener: {
      remove: () => Promise<void>;
    } | null = null;

    let didCancel = false;

    const setupKeyboardListeners = async () => {
      try {
        showListener = await Keyboard.addListener("keyboardWillShow", () => {
          if (!didCancel) {
            setKeyboardOpen(true);
          }
        });

        hideListener = await Keyboard.addListener("keyboardWillHide", () => {
          if (!didCancel) {
            setKeyboardOpen(false);
          }
        });

        /*
         * Android can sometimes fire only the "Did" events
         * depending on WebView/keyboard configuration.
         */
        await Keyboard.addListener("keyboardDidShow", () => {
          if (!didCancel) {
            setKeyboardOpen(true);
          }
        });

        await Keyboard.addListener("keyboardDidHide", () => {
          if (!didCancel) {
            setKeyboardOpen(false);
          }
        });
      } catch (error) {
        console.error("KEYBOARD LISTENER ERROR:", error);
      }
    };

    setupKeyboardListeners();

    return () => {
      didCancel = true;

      showListener?.remove();
      hideListener?.remove();
    };
  }, [worker]);

  /* =====================================================
     ESCAPE KEY
  ===================================================== */

  useEffect(() => {
    if (!worker) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [worker, loading, onClose]);

  /* =====================================================
     BODY SCROLL LOCK
  ===================================================== */

  useEffect(() => {
    if (!worker) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [worker]);

  /* =====================================================
     CLEAN BLOB
  ===================================================== */

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  /* =====================================================
     SELECT PHOTO
  ===================================================== */

  const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Only JPG, PNG and WebP images are allowed.");

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setPhotoError("Image size must be less than 5 MB.");

      event.target.value = "";
      return;
    }

    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedPhoto(file);
    setPhotoPreview(previewUrl);
  };

  /* =====================================================
     REMOVE PHOTO
  ===================================================== */

  const handleRemovePhoto = () => {
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(null);
    setPhoto("");
    setPhotoPreview("");
    setPhotoError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     UPLOAD PHOTO
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
        throw new Error("Unable to generate image URL.");
      }

      return publicUrl;
    } catch (error) {
      console.error("PHOTO UPLOAD ERROR:", error);

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
     VALIDATION
  ===================================================== */

  const validate = () => {
    if (!name.trim()) {
      return "Worker name is required.";
    }

    if (!phone.trim()) {
      return "Mobile number is required.";
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return "Enter valid 10 digit mobile number.";
    }

    if (!category.trim()) {
      return "Category is required.";
    }

    if (!subcategory.trim()) {
      return "Subcategory is required.";
    }

    if (!specialty.trim()) {
      return "Specialty is required.";
    }

    if (!location.trim()) {
      return "Location is required.";
    }

    return "";
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!worker) return;
    if (loading) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      let finalPhoto = photo.trim();

      if (selectedPhoto) {
        finalPhoto = await uploadWorkerPhoto(selectedPhoto);
      }

      const cleanLabourChauk = labourChauk.trim();

      const workerData: WorkerFormData = {
        name: name.trim(),

        phone: phone.trim(),

        category: category.trim(),

        subcategory: subcategory.trim(),

        specialty: specialty.trim(),

        services: [...services],

        pricingType,

        startingPrice: Number(startingPrice) || 0,

        halfDayPrice: Number(halfDayPrice) || 0,

        fullDayPrice: Number(fullDayPrice) || 0,

        monthlyPrice: Number(monthlyPrice) || 0,

        visitCharge: Number(visitCharge) || 0,

        rating: Number(rating) || 0,

        reviewCount: Number(reviewCount) || 0,

        location: location.trim(),

        labourChauk: cleanLabourChauk,

        available,

        yearsExperience: Number(yearsExperience) || 0,

        completedJobs: Number(completedJobs) || 0,

        bio: bio.trim(),

        skills: [...skills],

        photo: finalPhoto,

        responseTime: responseTime.trim() || "Within 1 hour",

        certifications: [...certifications],
      };

      const updatedWorker = await updateWorker(worker.id, workerData);

      onUpdated(updatedWorker);
      onClose();
    } catch (error) {
      console.error("UPDATE WORKER ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Unable to update worker.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     NO WORKER
  ===================================================== */

  if (!worker) {
    return null;
  }

  /* =====================================================
     FULL SCREEN UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-100 flex h-dvh w-full flex-col bg-white">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex h-24 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 pt-[env(safe-area-inset-top)] shadow-sm sm:h-18 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h2 className="truncate text-base font-black text-[#0F172A] sm:text-lg lg:text-xl">
            Edit Worker
          </h2>

          <p className="mt-0.5 truncate text-[11px] text-[#64748B] sm:text-xs">
            Update worker profile and pricing.
          </p>
        </div>
      </header>

      {/* =================================================
          FORM
      ================================================= */}

      <form
        id="edit-worker-form"
        onSubmit={handleSubmit}
        className="
          flex
          min-h-0
          flex-1
          flex-col
        "
      >
        {/* =================================================
            SCROLL AREA
        ================================================= */}

        <div
          className="
            flex-1
            overflow-y-auto
            overscroll-contain
            px-4
            py-5
            pb-24
            sm:px-6
            sm:py-6
            sm:pb-28
            lg:px-8
            lg:py-7
            lg:pb-28
          "
        >
          <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
            {/* PHOTO */}

            <section>
              <SectionTitle icon={Camera} title="Worker Photo" />

              <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="relative mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-orange-50 sm:mx-0 sm:h-28 sm:w-28">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={name || "Worker"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-[#FF5C39]" />
                  )}

                  {selectedPhoto && (
                    <div className="absolute bottom-1 right-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white">
                      NEW
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="
                        flex
                        h-10
                        items-center
                        gap-2
                        rounded-xl
                        bg-[#FF5C39]
                        px-4
                        text-xs
                        font-bold
                        text-white
                        transition
                        hover:bg-[#e54e2e]
                        active:scale-[0.98]
                        disabled:opacity-50
                        sm:text-sm
                      "
                    >
                      <Upload className="h-4 w-4" />

                      {photoPreview ? "Change Photo" : "Upload Photo"}
                    </button>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={loading}
                        className="
                          flex
                          h-10
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          bg-white
                          px-4
                          text-xs
                          font-bold
                          text-red-500
                          transition
                          hover:bg-red-50
                          disabled:opacity-50
                          sm:text-sm
                        "
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-center text-[10px] text-[#64748B] sm:text-left sm:text-xs">
                    JPG, PNG or WebP • Maximum 5 MB
                  </p>

                  {selectedPhoto && (
                    <p className="mt-1 truncate text-center text-[10px] font-medium text-emerald-600 sm:text-left sm:text-xs">
                      {selectedPhoto.name}
                    </p>
                  )}
                </div>
              </div>

              {photoError && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  {photoError}
                </p>
              )}
            </section>

            {/* BASIC INFORMATION */}

            <FormSection title="Basic Information" icon={User}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                <InputField
                  label="Worker Name"
                  icon={User}
                  value={name}
                  onChange={setName}
                  placeholder="Enter worker name"
                  required
                />

                <InputField
                  label="Phone"
                  icon={Phone}
                  value={phone}
                  onChange={(value) =>
                    setPhone(value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10 digit mobile number"
                  required
                  inputMode="numeric"
                />

                <InputField
                  label="Category"
                  icon={BriefcaseBusiness}
                  value={category}
                  onChange={setCategory}
                  placeholder="e.g. Labour"
                  required
                />

                <InputField
                  label="Subcategory"
                  icon={BriefcaseBusiness}
                  value={subcategory}
                  onChange={setSubcategory}
                  placeholder="e.g. General Labour"
                  required
                />

                <InputField
                  label="Specialty"
                  icon={Wrench}
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
                  placeholder="Enter location"
                  required
                />

                <InputField
                  label="Labour Chauk"
                  icon={MapPin}
                  value={labourChauk}
                  onChange={setLabourChauk}
                  placeholder="Enter labour chauk"
                />
              </div>
            </FormSection>

            {/* EXPERIENCE */}

            <FormSection title="Experience" icon={BriefcaseBusiness}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                <InputField
                  label="Years Experience"
                  icon={BriefcaseBusiness}
                  value={yearsExperience}
                  onChange={setYearsExperience}
                  placeholder="e.g. 5"
                  type="number"
                  inputMode="numeric"
                />

                <InputField
                  label="Jobs Completed"
                  icon={BriefcaseBusiness}
                  value={completedJobs}
                  onChange={setCompletedJobs}
                  placeholder="e.g. 100"
                  type="number"
                  inputMode="numeric"
                />
              </div>
            </FormSection>

            {/* BIO */}

            <FormSection title="About Worker" icon={User}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
                  Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Describe worker experience..."
                  rows={4}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-200
                    bg-[#F8FAFC]
                    px-3
                    py-3
                    text-xs
                    text-[#0F172A]
                    outline-none
                    transition
                    placeholder:text-[#A8B2C1]
                    focus:border-[#FF5C39]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-orange-100
                    sm:px-4
                    sm:text-sm
                  "
                />
              </div>
            </FormSection>

            {/* PRICING */}

            <FormSection title="Pricing" icon={IndianRupee}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                <InputField
                  label="Starting Price"
                  icon={IndianRupee}
                  value={startingPrice}
                  onChange={setStartingPrice}
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                />

                <InputField
                  label="Half Day Price"
                  icon={IndianRupee}
                  value={halfDayPrice}
                  onChange={setHalfDayPrice}
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                />

                <InputField
                  label="Full Day Price"
                  icon={IndianRupee}
                  value={fullDayPrice}
                  onChange={setFullDayPrice}
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                />

                <InputField
                  label="Monthly Price"
                  icon={IndianRupee}
                  value={monthlyPrice}
                  onChange={setMonthlyPrice}
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                />

                <InputField
                  label="Visit Charge"
                  icon={IndianRupee}
                  value={visitCharge}
                  onChange={setVisitCharge}
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                />
              </div>
            </FormSection>

            {/* REVIEWS */}

            <FormSection title="Reviews & Response" icon={Star}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InputField
                  label="Rating"
                  icon={Star}
                  value={rating}
                  onChange={setRating}
                  placeholder="0"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                />

                <InputField
                  label="Review Count"
                  icon={Star}
                  value={reviewCount}
                  onChange={setReviewCount}
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                />

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
                    Response Time
                  </label>

                  <div className="relative">
                    <Clock3 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

                    <select
                      value={responseTime}
                      onChange={(event) => setResponseTime(event.target.value)}
                      className="
                        h-10
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        border-gray-200
                        bg-[#F8FAFC]
                        pl-10
                        pr-3
                        text-xs
                        text-[#0F172A]
                        outline-none
                        focus:border-[#FF5C39]
                        focus:bg-white
                        focus:ring-2
                        focus:ring-orange-100
                        sm:h-11
                        sm:text-sm
                      "
                    >
                      <option>Within 30 minutes</option>
                      <option>Within 1 hour</option>
                      <option>Within 2 hours</option>
                      <option>Within 4 hours</option>
                      <option>Within 1 day</option>
                    </select>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* AVAILABILITY */}

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0F172A] sm:text-sm">
                  Worker Availability
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-[#64748B] sm:text-xs">
                  Allow this worker to receive new bookings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAvailable((value) => !value)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  available ? "bg-emerald-500" : "bg-gray-300"
                }`}
                aria-label="Toggle worker availability"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                    available ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 sm:px-4 sm:py-3">
                <p className="text-xs leading-5 text-red-600 sm:text-sm">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            BOTTOM ACTION BAR
            HIDDEN COMPLETELY WHEN ANDROID KEYBOARD OPENS
        ================================================= */}

        {!keyboardOpen && (
          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              z-40
              shrink-0
              border-t
              border-gray-200
              bg-white/95
              px-3
              pt-2.5
              shadow-[0_-6px_20px_rgba(15,23,42,0.08)]
              backdrop-blur-xl
              pb-[calc(10px+env(safe-area-inset-bottom))]
              sm:px-6
              sm:pt-3
              sm:pb-3
              lg:px-8
            "
          >
            <div className="mx-auto flex w-full max-w-5xl gap-2">
              {/* CANCEL */}

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  h-10
                  flex-1
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-3
                  text-[11px]
                  font-bold
                  text-[#64748B]
                  transition
                  hover:bg-[#F8FAFC]
                  active:scale-[0.98]
                  disabled:opacity-50
                  sm:h-12
                  sm:px-6
                  sm:text-sm
                "
              >
                Cancel
              </button>

              {/* SAVE */}

              <button
                type="submit"
                form="edit-worker-form"
                disabled={loading || photoUploading}
                className="
                  flex
                  h-10
                  flex-[1.5]
                  items-center
                  justify-center
                  gap-1.5
                  rounded-xl
                  bg-[#FF5C39]
                  px-3
                  text-[11px]
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#e54e2e]
                  active:scale-[0.98]
                  disabled:opacity-60
                  sm:h-12
                  sm:px-7
                  sm:text-sm
                "
              >
                {(loading || photoUploading) && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                )}

                {photoUploading
                  ? "Uploading..."
                  : loading
                    ? "Saving..."
                    : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

/* =====================================================
   FORM SECTION
===================================================== */

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <Icon className="h-3.5 w-3.5 text-[#FF5C39]" />
        </div>

        <h3 className="text-xs font-black text-[#0F172A] sm:text-sm">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

/* =====================================================
   SECTION TITLE
===================================================== */

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
        <Icon className="h-3.5 w-3.5 text-[#FF5C39]" />
      </div>

      <p className="text-xs font-black text-[#0F172A] sm:text-sm">{title}</p>
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
  step,
}: {
  label: string;
  icon: LucideIcon;
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
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
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
          step={step}
          className="
            h-10
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
            transition
            placeholder:text-[#A8B2C1]
            focus:border-[#FF5C39]
            focus:bg-white
            focus:ring-2
            focus:ring-orange-100
            sm:h-11
            sm:pl-10
            sm:pr-4
            sm:text-sm
          "
        />
      </div>
    </div>
  );
}
