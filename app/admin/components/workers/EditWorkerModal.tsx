"use client";

import {
  FormEvent,
  useEffect,
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
} from "lucide-react";

import {
  updateWorker,
  type Worker,
  type WorkerFormData,
} from "@/app/data/workers";

type EditWorkerModalProps = {
  worker: Worker | null;
  onClose: () => void;
  onUpdated: (worker: Worker) => void;
};

export default function EditWorkerModal({
  worker,
  onClose,
  onUpdated,
}: EditWorkerModalProps) {
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
  const [photo, setPhoto] = useState("");

  const [services, setServices] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  const [pricingType, setPricingType] =
    useState<Worker["pricingType"]>("custom");

  const [startingPrice, setStartingPrice] = useState("");
  const [halfDayPrice, setHalfDayPrice] = useState("");
  const [fullDayPrice, setFullDayPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [visitCharge, setVisitCharge] = useState("");

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

    console.log("EDIT WORKER DATA:", worker);
    console.log(
      "EDIT LABOUR CHAUK:",
      worker.labourChauk,
    );

    setName(worker.name ?? "");
    setPhone(worker.phone ?? "");

    setCategory(worker.category ?? "");
    setSubcategory(worker.subcategory ?? "");
    setSpecialty(worker.specialty ?? "");

    setLocation(worker.location ?? "");

    /*
     * IMPORTANT
     *
     * Worker type already uses:
     * labourChauk
     *
     * workers.ts mapWorker() converts:
     * labour_chauk -> labourChauk
     */
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
    setPhoto(worker.photo ?? "");

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
      worker.responseTime ||
        "Within 1 hour",
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

      const cleanLabourChauk =
        labourChauk.trim();

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

        /*
         * FRONTEND NAME
         *
         * workers.ts converts this to:
         * labour_chauk
         */
        labourChauk: cleanLabourChauk,

        available,

        yearsExperience:
          Number(yearsExperience) || 0,

        completedJobs:
          Number(completedJobs) || 0,

        bio: bio.trim(),

        skills: [...skills],

        photo: photo.trim(),

        responseTime:
          responseTime.trim() ||
          "Within 1 hour",

        certifications: [
          ...certifications,
        ],
      };

      console.log(
        "SAVING LABOUR CHAUK:",
        workerData.labourChauk,
      );

      const updatedWorker =
        await updateWorker(
          worker.id,
          workerData,
        );

      console.log(
        "UPDATED WORKER FROM DATABASE:",
        updatedWorker,
      );

      console.log(
        "UPDATED LABOUR CHAUK:",
        updatedWorker.labourChauk,
      );

      /*
       * IMPORTANT:
       * Parent ko complete updated mapped Worker
       * object mil raha hai.
       */
      onUpdated(updatedWorker);

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

  if (!worker) {
    return null;
  }

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
            {/* PHOTO */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-orange-50">
                {photo ? (
                  <img
                    src={photo}
                    alt={name || "Worker"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-6 w-6 text-[#FF5C39]" />
                )}
              </div>

              <div className="flex-1">
                <InputField
                  label="Worker Photo URL"
                  icon={Camera}
                  value={photo}
                  onChange={setPhoto}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* NAME */}
            <InputField
              label="Worker Name"
              icon={User}
              value={name}
              onChange={setName}
              placeholder="Enter worker name"
              required
            />

            {/* PHONE */}
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

            {/* CATEGORY */}
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

            {/* SPECIALTY */}
            <InputField
              label="Specialty"
              icon={Wrench}
              value={specialty}
              onChange={setSpecialty}
              placeholder="e.g. Brick Mason"
              required
            />

            {/* LOCATION */}
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

            {/* EXPERIENCE */}
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

            {/* BIO */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                Bio
              </label>

              <textarea
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                placeholder="Describe worker experience..."
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* PRICING */}
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

            {/* AVAILABILITY */}
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

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* BUTTONS */}
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
                disabled={loading}
                className="flex h-11 items-center gap-2 rounded-xl bg-[#FF5C39] px-6 text-sm font-bold text-white hover:bg-[#e54e2e] disabled:opacity-60"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading
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
  icon: typeof User;
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
            onChange(event.target.value)
          }
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </div>
  );
}