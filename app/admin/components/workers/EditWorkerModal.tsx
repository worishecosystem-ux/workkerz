"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

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
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

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
  const [selectedPhoto, setSelectedPhoto] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  /* =====================================================
     ARRAYS
  ===================================================== */

  const [services, setServices] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] =
    useState<string[]>([]);

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

  const [responseTime, setResponseTime] =
    useState("Within 1 hour");

  const [rating, setRating] = useState("");
  const [reviewCount, setReviewCount] = useState("");

  const [available, setAvailable] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD WORKER
  ===================================================== */

  useEffect(() => {
    if (!worker) return;

    console.log("EDIT WORKER:", worker);
    console.log("LABOUR CHAUK:", worker.labourChauk);

    setName(worker.name ?? "");
    setPhone(worker.phone ?? "");

    setCategory(worker.category ?? "");
    setSubcategory(worker.subcategory ?? "");
    setSpecialty(worker.specialty ?? "");

    setLocation(worker.location ?? "");
    setLabourChauk(worker.labourChauk ?? "");

    setYearsExperience(
      worker.yearsExperience != null
        ? String(worker.yearsExperience)
        : "",
    );

    setCompletedJobs(
      worker.completedJobs != null
        ? String(worker.completedJobs)
        : "",
    );

    setBio(worker.bio ?? "");

    /* Existing image */
    setPhoto(worker.photo ?? "");
    setPhotoPreview(worker.photo ?? "");

    /* Reset selected image */
    setSelectedPhoto(null);
    setPhotoError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    /* Arrays */
    setServices(
      Array.isArray(worker.services)
        ? [...worker.services]
        : [],
    );

    setSkills(
      Array.isArray(worker.skills)
        ? [...worker.skills]
        : [],
    );

    setCertifications(
      Array.isArray(worker.certifications)
        ? [...worker.certifications]
        : [],
    );

    /* Pricing */
    setPricingType(
      worker.pricingType ?? "custom",
    );

    setStartingPrice(
      worker.startingPrice != null
        ? String(worker.startingPrice)
        : "",
    );

    setHalfDayPrice(
      worker.halfDayPrice != null
        ? String(worker.halfDayPrice)
        : "",
    );

    setFullDayPrice(
      worker.fullDayPrice != null
        ? String(worker.fullDayPrice)
        : "",
    );

    setMonthlyPrice(
      worker.monthlyPrice != null
        ? String(worker.monthlyPrice)
        : "",
    );

    setVisitCharge(
      worker.visitCharge != null
        ? String(worker.visitCharge)
        : "",
    );

    setResponseTime(
      worker.responseTime || "Within 1 hour",
    );

    setRating(
      worker.rating != null
        ? String(worker.rating)
        : "",
    );

    setReviewCount(
      worker.reviewCount != null
        ? String(worker.reviewCount)
        : "",
    );

    setAvailable(
      worker.available ?? true,
    );

    setError("");
  }, [worker]);

  /* =====================================================
     CLEAN BLOB PREVIEW
  ===================================================== */

  useEffect(() => {
    return () => {
      if (
        photoPreview &&
        photoPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  /* =====================================================
     SELECT PHOTO
  ===================================================== */

  const handlePhotoSelect = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setPhotoError(
        "Only JPG, PNG and WebP images are allowed.",
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setPhotoError(
        "Image size must be less than 5 MB.",
      );

      event.target.value = "";
      return;
    }

    /* Remove old blob URL */
    if (
      photoPreview &&
      photoPreview.startsWith("blob:")
    ) {
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
    if (
      photoPreview &&
      photoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(null);

    /*
     * IMPORTANT:
     * Empty photo means remove existing
     * image from worker record.
     */
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

  const uploadWorkerPhoto = async (
    file: File,
  ): Promise<string> => {
    setPhotoUploading(true);
    setPhotoError("");

    try {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const safeName =
        name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") ||
        "worker";

      const fileName =
        `${safeName}-${Date.now()}.${extension}`;

      const filePath =
        `workers/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(WORKER_IMAGE_BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(WORKER_IMAGE_BUCKET)
        .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to generate image URL.",
        );
      }

      return publicUrl;
    } catch (error) {
      console.error(
        "PHOTO UPLOAD ERROR:",
        error,
      );

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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!worker || loading) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      /* -----------------------------------------------
         PHOTO
      ------------------------------------------------ */

      let finalPhoto = photo.trim();

      if (selectedPhoto) {
        finalPhoto =
          await uploadWorkerPhoto(
            selectedPhoto,
          );
      }

      /* -----------------------------------------------
         LABOUR CHAUK
      ------------------------------------------------ */

      const cleanLabourChauk =
        labourChauk.trim();

      /* -----------------------------------------------
         WORKER DATA
      ------------------------------------------------ */

      const workerData: WorkerFormData = {
        name: name.trim(),
        phone: phone.trim(),

        category: category.trim(),
        subcategory: subcategory.trim(),
        specialty: specialty.trim(),

        services: [...services],

        pricingType,

        startingPrice:
          Number(startingPrice) || 0,

        halfDayPrice:
          Number(halfDayPrice) || 0,

        fullDayPrice:
          Number(fullDayPrice) || 0,

        monthlyPrice:
          Number(monthlyPrice) || 0,

        visitCharge:
          Number(visitCharge) || 0,

        rating:
          Number(rating) || 0,

        reviewCount:
          Number(reviewCount) || 0,

        location: location.trim(),

        labourChauk:
          cleanLabourChauk,

        available,

        yearsExperience:
          Number(yearsExperience) || 0,

        completedJobs:
          Number(completedJobs) || 0,

        bio: bio.trim(),

        skills: [...skills],

        photo: finalPhoto,

        responseTime:
          responseTime.trim() ||
          "Within 1 hour",

        certifications: [
          ...certifications,
        ],
      };

      console.log(
        "FINAL WORKER DATA:",
        workerData,
      );

      console.log(
        "FINAL LABOUR CHAUK:",
        workerData.labourChauk,
      );

      console.log(
        "FINAL PHOTO:",
        workerData.photo,
      );

      /* -----------------------------------------------
         DATABASE UPDATE
      ------------------------------------------------ */

      const updatedWorker =
        await updateWorker(
          worker.id,
          workerData,
        );

      console.log(
        "UPDATED WORKER:",
        updatedWorker,
      );

      /* -----------------------------------------------
         UPDATE PARENT STATE
      ------------------------------------------------ */

      onUpdated(updatedWorker);

      /* -----------------------------------------------
         CLOSE MODAL
      ------------------------------------------------ */

      onClose();
    } catch (error) {
      console.error(
        "UPDATE WORKER ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update worker.",
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
     UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close edit worker"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      {/* MODAL */}

      <div className="absolute left-1/2 top-1/2 w-[620px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2">
        <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* HEADER */}

          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">
                Edit Worker
              </h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Update worker profile and pricing.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="h-5 w-5 text-[#64748B]" />
            </button>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 overflow-y-auto p-6"
          >

            {/* =================================================
                PHOTO
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                Worker Photo
              </label>

              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4">

                {/* PREVIEW */}

                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-orange-50">

                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={
                        name ||
                        "Worker"
                      }
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

                {/* ACTIONS */}

                <div className="flex flex-1 flex-col gap-2">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handlePhotoSelect
                    }
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={loading}
                      className="flex h-10 items-center gap-2 rounded-xl bg-[#FF5C39] px-4 text-sm font-bold text-white hover:bg-[#e54e2e] disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />

                      {photoPreview
                        ? "Change Photo"
                        : "Upload Photo"}
                    </button>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={
                          handleRemovePhoto
                        }
                        disabled={loading}
                        className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />

                        Remove
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-[#64748B]">
                    JPG, PNG or WebP • Maximum 5 MB
                  </p>

                  {selectedPhoto && (
                    <p className="text-xs font-medium text-emerald-600">
                      New photo selected:{" "}
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
            </div>

            {/* =================================================
                NAME
            ================================================= */}

            <InputField
              label="Worker Name"
              icon={User}
              value={name}
              onChange={setName}
              placeholder="Enter worker name"
              required
            />

            {/* =================================================
                PHONE
            ================================================= */}

            <InputField
              label="Phone"
              icon={Phone}
              value={phone}
              onChange={(value) =>
                setPhone(
                  value
                    .replace(/\D/g, "")
                    .slice(0, 10),
                )
              }
              placeholder="10 digit mobile number"
              required
            />

            {/* =================================================
                CATEGORY
            ================================================= */}

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* =================================================
                SPECIALTY
            ================================================= */}

            <InputField
              label="Specialty"
              icon={Wrench}
              value={specialty}
              onChange={setSpecialty}
              placeholder="e.g. Brick Mason"
              required
            />

            {/* =================================================
                LOCATION
            ================================================= */}

            <div className="grid grid-cols-2 gap-4">
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

            {/* =================================================
                EXPERIENCE
            ================================================= */}

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Years Experience"
                icon={BriefcaseBusiness}
                value={yearsExperience}
                onChange={setYearsExperience}
                placeholder="e.g. 5"
                type="number"
              />

              <InputField
                label="Jobs Completed"
                icon={BriefcaseBusiness}
                value={completedJobs}
                onChange={setCompletedJobs}
                placeholder="e.g. 100"
                type="number"
              />
            </div>

            {/* =================================================
                BIO
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                Bio
              </label>

              <textarea
                value={bio}
                onChange={(event) =>
                  setBio(
                    event.target.value,
                  )
                }
                placeholder="Describe worker experience..."
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* =================================================
                PRICING
            ================================================= */}

            <div>
              <div className="mb-3 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-[#FF5C39]" />

                <p className="text-sm font-bold text-[#0F172A]">
                  Pricing
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Starting Price"
                  icon={IndianRupee}
                  value={startingPrice}
                  onChange={setStartingPrice}
                  placeholder="0"
                  type="number"
                />

                <InputField
                  label="Half Day Price"
                  icon={IndianRupee}
                  value={halfDayPrice}
                  onChange={setHalfDayPrice}
                  placeholder="0"
                  type="number"
                />

                <InputField
                  label="Full Day Price"
                  icon={IndianRupee}
                  value={fullDayPrice}
                  onChange={setFullDayPrice}
                  placeholder="0"
                  type="number"
                />

                <InputField
                  label="Monthly Price"
                  icon={IndianRupee}
                  value={monthlyPrice}
                  onChange={setMonthlyPrice}
                  placeholder="0"
                  type="number"
                />

                <InputField
                  label="Visit Charge"
                  icon={IndianRupee}
                  value={visitCharge}
                  onChange={setVisitCharge}
                  placeholder="0"
                  type="number"
                />
              </div>
            </div>

            {/* =================================================
                AVAILABILITY
            ================================================= */}

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-[#F8FAFC] p-4">
              <div>
                <p className="text-sm font-bold text-[#0F172A]">
                  Worker Availability
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Allow this worker to receive new bookings.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAvailable(
                    (value) => !value,
                  )
                }
                className={`relative h-6 w-11 rounded-full transition ${
                  available
                    ? "bg-emerald-500"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                    available
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  loading ||
                  photoUploading
                }
                className="flex h-11 items-center gap-2 rounded-xl bg-[#FF5C39] px-6 text-sm font-bold text-white hover:bg-[#e54e2e] disabled:opacity-60"
              >
                {(loading ||
                  photoUploading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {photoUploading
                  ? "Uploading Photo..."
                  : loading
                    ? "Saving..."
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
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
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </div>
  );
}