"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Tag,
  User,
  X,
} from "lucide-react";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

type Props = {
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

const CATEGORIES = {
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

type Category = keyof typeof CATEGORIES;

const BUCKET = "workers";

export default function WorkerOnboardForm({ onBack, onCreated }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [subcategory, setSubcategory] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [labourChauk, setLabourChauk] = useState("");

  const [yearsExperience, setYearsExperience] = useState("0");
  const [bio, setBio] = useState("");
  const [responseTime, setResponseTime] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  const [skillInput, setSkillInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [certificationInput, setCertificationInput] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const [pricingType, setPricingType] = useState<PricingType>("custom");

  const [startingPrice, setStartingPrice] = useState("0");
  const [halfDayPrice, setHalfDayPrice] = useState("0");
  const [fullDayPrice, setFullDayPrice] = useState("0");
  const [monthlyPrice, setMonthlyPrice] = useState("0");
  const [visitCharge, setVisitCharge] = useState("0");

  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const validatePhoto = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return "Only JPG, PNG and WebP images are allowed.";

    if (file.size > 5 * 1024 * 1024)
      return "Image size must be less than 5 MB.";

    return "";
  };

  const selectPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validatePhoto(file);
    setPhotoError(error);

    if (error) {
      e.target.value = "";
      return;
    }

    if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUrl("");

    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = () => {
    if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);

    setPhotoFile(null);
    setPhotoPreview("");
    setPhotoUrl("");
    setPhotoError("");

    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadPhoto = async (file: File) => {
    setPhotoUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeName =
        name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "worker";

      const path = `workers/${safeName}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      if (!data?.publicUrl)
        throw new Error("Unable to generate worker photo URL.");

      return data.publicUrl;
    } finally {
      setPhotoUploading(false);
    }
  };

  const addItem = (
    value: string,
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    items: string[],
    clear: () => void,
  ) => {
    const item = value.trim();
    if (!item) return;

    if (!items.some((x) => x.toLowerCase() === item.toLowerCase())) {
      setItems([...items, item]);
    }

    clear();
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      if (!name.trim()) throw new Error("Worker name is required.");

      if (!phone.trim()) throw new Error("Phone number is required.");

      if (!/^[6-9]\d{9}$/.test(phone.trim()))
        throw new Error("Enter valid 10 digit mobile number.");

      if (!category) throw new Error("Worker category is required.");

      if (!subcategory.trim())
        throw new Error("Worker subcategory is required.");

      if (!specialty.trim()) throw new Error("Specialty is required.");

      if (!location.trim()) throw new Error("Location is required.");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token)
        throw new Error("Your admin session has expired. Please login again.");

      let finalPhoto = photoUrl.trim();

      if (photoFile) finalPhoto = await uploadPhoto(photoFile);

      const payload = {
        name: name.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
        specialty: specialty.trim(),
        location: location.trim(),
        phone: phone.trim(),
        labour_chauk: labourChauk.trim() || null,
        years_experience: Number(yearsExperience) || 0,
        bio: bio.trim() || null,
        response_time: responseTime.trim() || null,
        skills,
        services,
        certifications,
        pricing_type: pricingType,
        starting_price: Number(startingPrice) || 0,
        half_day_price: Number(halfDayPrice) || 0,
        full_day_price: Number(fullDayPrice) || 0,
        monthly_price: Number(monthlyPrice) || 0,
        visit_charge: Number(visitCharge) || 0,
        available,
        photo: finalPhoto || null,
      };

      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Unable to create worker.");

      setSuccess("Worker onboarded successfully.");
      onCreated?.(data.worker);
    } catch (err) {
      console.error("Worker onboarding error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to onboard worker.",
      );
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || photoUploading;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAFC]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:min-h-20 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl hover:bg-gray-50 disabled:opacity-50 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-5 w-5 text-[#64748B]" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-black text-[#0F172A] sm:text-xl lg:text-2xl">
                Worker Onboarding
              </h1>

              <p className="hidden truncate text-xs text-[#64748B] sm:block">
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

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-7xl px-3 py-3 pb-28 sm:px-5 sm:py-5 sm:pb-8 lg:px-8 lg:py-7">
        <form onSubmit={submit} className="min-w-0 space-y-3 sm:space-y-5">
          {/* BASIC */}
          <Section
            title="Basic Information"
            description="Worker identity and contact details."
          >
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <Input
                label="Worker Name"
                icon={User}
                value={name}
                onChange={setName}
                placeholder="Enter worker name"
                required
              />

              <Input
                label="Phone Number"
                icon={Phone}
                value={phone}
                onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter mobile number"
                type="tel"
                inputMode="numeric"
                required
              />

              <CategorySelect
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setSubcategory("");
                }}
              />

              <SubcategorySelect
                category={category}
                value={subcategory}
                onChange={setSubcategory}
              />

              <Input
                label="Specialty"
                icon={BriefcaseBusiness}
                value={specialty}
                onChange={setSpecialty}
                placeholder="e.g. Brick Mason"
                required
              />

              <Input
                label="Location"
                icon={MapPin}
                value={location}
                onChange={setLocation}
                placeholder="e.g. Gwalior"
                required
              />

              <div className="sm:col-span-2">
                <Input
                  label="Labour Chauk"
                  icon={MapPin}
                  value={labourChauk}
                  onChange={setLabourChauk}
                  placeholder="e.g. Thatipur Labour Chauk"
                />
              </div>
            </div>
          </Section>

          {/* PHOTO */}
          <Section
            title="Worker Photo"
            description="Take a live photo or choose an existing image."
          >
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={selectPhoto}
              className="hidden"
            />

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectPhoto}
              className="hidden"
            />

            <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-dashed border-gray-200 bg-[#F8FAFC] p-3 sm:flex-row sm:items-center sm:p-5">
              <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-orange-50 sm:mx-0 sm:h-32 sm:w-32">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={name || "Worker"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-9 w-9 text-[#FF5C39]" />
                )}

                {photoFile && (
                  <span className="absolute bottom-2 rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-bold text-white">
                    SELECTED
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-center text-sm font-bold text-[#0F172A] sm:text-left">
                  {photoPreview ? "Worker photo selected" : "Add worker photo"}
                </p>

                <p className="mt-1 text-center text-xs text-[#64748B] sm:text-left">
                  Use camera or choose an image from your device.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                  <PhotoButton
                    onClick={() => cameraRef.current?.click()}
                    disabled={disabled}
                    icon={Camera}
                  >
                    Take Photo
                  </PhotoButton>

                  <PhotoButton
                    onClick={() => fileRef.current?.click()}
                    disabled={disabled}
                    icon={ImagePlus}
                    light
                  >
                    Choose File
                  </PhotoButton>

                  {photoPreview && (
                    <PhotoButton
                      onClick={removePhoto}
                      disabled={disabled}
                      icon={X}
                      danger
                    >
                      Remove
                    </PhotoButton>
                  )}
                </div>

                <p className="mt-2 text-center text-[10px] text-[#94A3B8] sm:text-left">
                  JPG, PNG or WebP • Maximum 5 MB
                </p>

                {photoFile && (
                  <p className="mt-1 truncate text-center text-[10px] font-medium text-emerald-600 sm:text-left">
                    {photoFile.name}
                  </p>
                )}
              </div>
            </div>

            {photoError && <Message error>{photoError}</Message>}
          </Section>

          {/* PROFESSIONAL */}
          <Section
            title="Professional Information"
            description="Experience, skills and services."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Input
                  label="Years of Experience"
                  icon={BriefcaseBusiness}
                  value={yearsExperience}
                  onChange={setYearsExperience}
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                />

                <Input
                  label="Response Time"
                  icon={CheckCircle2}
                  value={responseTime}
                  onChange={setResponseTime}
                  placeholder="e.g. Within 30 minutes"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
                  Worker Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short description about the worker..."
                  rows={4}
                  className="min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3 text-xs text-[#0F172A] outline-none focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:px-4 sm:text-sm"
                />
              </div>

              <Tags
                label="Skills"
                placeholder="Add a skill"
                value={skillInput}
                setValue={setSkillInput}
                items={skills}
                setItems={setSkills}
              />

              <Tags
                label="Services"
                placeholder="Add a service"
                value={serviceInput}
                setValue={setServiceInput}
                items={services}
                setItems={setServices}
              />

              <Tags
                label="Certifications"
                placeholder="Add certification"
                value={certificationInput}
                setValue={setCertificationInput}
                items={certifications}
                setItems={setCertifications}
              />
            </div>
          </Section>

          {/* PRICING */}
          <Section
            title="Pricing"
            description="Set the worker's marketplace pricing."
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
                  Pricing Type
                </label>

                <div className="relative">
                  <select
                    value={pricingType}
                    onChange={(e) =>
                      setPricingType(e.target.value as PricingType)
                    }
                    className="h-10 w-full min-w-0 appearance-none rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 pr-10 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:h-11 sm:px-4 sm:text-sm"
                  >
                    <option value="custom">Custom</option>
                    <option value="per_job">Per Job</option>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="per_service">Per Service</option>
                    <option value="visit_charge">Visit Charge</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                <Price
                  label="Starting Price"
                  value={startingPrice}
                  set={setStartingPrice}
                />
                <Price
                  label="Half Day"
                  value={halfDayPrice}
                  set={setHalfDayPrice}
                />
                <Price
                  label="Full Day"
                  value={fullDayPrice}
                  set={setFullDayPrice}
                />
                <Price
                  label="Monthly"
                  value={monthlyPrice}
                  set={setMonthlyPrice}
                />
                <Price
                  label="Visit Charge"
                  value={visitCharge}
                  set={setVisitCharge}
                />
              </div>
            </div>
          </Section>

          {/* AVAILABILITY */}
          <Section
            title="Availability"
            description="Control whether this worker is currently available."
          >
            <button
              type="button"
              onClick={() => setAvailable((v) => !v)}
              className="flex w-full min-w-0 items-center gap-3 text-left sm:max-w-md sm:gap-4"
            >
              <div
                className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 ${
                  available ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    available ? "translate-x-5" : ""
                  }`}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[#0F172A] sm:text-sm">
                  {available ? "Available Now" : "Currently Unavailable"}
                </p>

                <p className="mt-1 text-[10px] text-[#64748B] sm:text-xs">
                  {available
                    ? "Worker can receive bookings."
                    : "Worker will not appear as available."}
                </p>
              </div>
            </button>
          </Section>

          {/* MESSAGES */}
          {error && <Message error>{error}</Message>}

          {success && (
            <Message success>
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </Message>
          )}

          {/* ACTIONS */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
            <div className="mx-auto flex w-full max-w-7xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onBack}
                disabled={disabled}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-5 text-xs font-bold text-[#64748B] hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:h-11 sm:text-sm"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={disabled}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5C39] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#e54e2e] disabled:opacity-60 sm:h-11 sm:w-auto sm:px-7 sm:text-sm"
              >
                {disabled ? (
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
          </div>
        </form>
      </main>
    </div>
  );
}

/* ========================= SECTION ========================= */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white sm:rounded-2xl">
      <div className="border-b border-gray-100 px-4 py-3.5 sm:px-6 sm:py-4">
        <h2 className="text-sm font-black text-[#0F172A] sm:text-base">
          {title}
        </h2>

        <p className="mt-1 text-[10px] text-[#64748B] sm:text-xs">
          {description}
        </p>
      </div>

      <div className="min-w-0 p-3.5 sm:p-6">{children}</div>
    </section>
  );
}

/* ========================= INPUT ========================= */

function Input({
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
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
        {label}
        {required && <span className="ml-1 text-[#FF5C39]">*</span>}
      </label>

      <div className="relative min-w-0">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8] sm:left-3.5 sm:h-4 sm:w-4" />

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          min={type === "number" ? "0" : undefined}
          className="box-border h-10 w-full min-w-0 rounded-xl border border-gray-200 bg-[#F8FAFC] pl-9 pr-3 text-xs text-[#0F172A] outline-none placeholder:text-[#A8B2C1] focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:h-11 sm:pl-10 sm:pr-4 sm:text-sm"
        />
      </div>
    </div>
  );
}

/* ========================= CATEGORY ========================= */

function CategorySelect({
  value,
  onChange,
}: {
  value: Category | "";
  onChange: (value: Category) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
        Worker Category
        <span className="ml-1 text-[#FF5C39]">*</span>
      </label>

      <div className="relative min-w-0">
        <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

        <select
          value={value}
          required
          onChange={(e) => onChange(e.target.value as Category)}
          className={`box-border h-10 w-full min-w-0 appearance-none rounded-xl border bg-[#F8FAFC] pl-9 pr-10 text-xs font-semibold outline-none sm:h-11 sm:pl-10 sm:text-sm ${
            value
              ? "border-orange-200 text-[#0F172A]"
              : "border-gray-200 text-[#94A3B8]"
          } focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100`}
        >
          <option value="">Select worker category</option>

          {Object.keys(CATEGORIES).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
      </div>

      {value && (
        <p className="mt-1.5 text-[10px] font-semibold text-[#64748B]">
          {CATEGORIES[value].length} subcategories available
        </p>
      )}
    </div>
  );
}

/* ========================= SUBCATEGORY ========================= */

function SubcategorySelect({
  category,
  value,
  onChange,
}: {
  category: Category | "";
  value: string;
  onChange: (value: string) => void;
}) {
  const items = category ? CATEGORIES[category] : [];
  const disabled = !category;

  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
        Worker Subcategory
        <span className="ml-1 text-[#FF5C39]">*</span>
      </label>

      <div className="relative min-w-0">
        <Tag className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

        <select
          value={value}
          disabled={disabled}
          required
          onChange={(e) => onChange(e.target.value)}
          className={`box-border h-10 w-full min-w-0 appearance-none rounded-xl border pl-9 pr-10 text-xs font-semibold outline-none sm:h-11 sm:pl-10 sm:text-sm ${
            disabled
              ? "border-gray-100 bg-gray-50 text-[#CBD5E1]"
              : "border-gray-200 bg-[#F8FAFC] text-[#0F172A]"
          } focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100`}
        >
          <option value="">
            {category ? "Select subcategory" : "Select category first"}
          </option>

          {items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
      </div>

      {value && (
        <span className="mt-1.5 inline-flex max-w-full rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#C2410C]">
          <span className="truncate">{value}</span>
        </span>
      )}
    </div>
  );
}

/* ========================= PRICE ========================= */

function Price({
  label,
  value,
  set,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block truncate text-[10px] font-semibold text-[#64748B] sm:text-xs">
        {label}
      </label>

      <div className="relative min-w-0">
        <IndianRupee className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#94A3B8]" />

        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          onChange={(e) => set(e.target.value)}
          className="box-border h-10 w-full min-w-0 rounded-xl border border-gray-200 bg-[#F8FAFC] pl-7 pr-2 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 sm:h-11 sm:pl-8 sm:pr-3 sm:text-sm"
        />
      </div>
    </div>
  );
}

/* ========================= TAGS ========================= */

function Tags({
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
    const item = value.trim();

    if (!item) return;

    if (!items.some((x) => x.toLowerCase() === item.toLowerCase())) {
      setItems([...items, item]);
    }

    setValue("");
  };

  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
        {label}
      </label>

      <div className="flex min-w-0 gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="box-border h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 text-xs text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 sm:h-11 sm:px-4 sm:text-sm"
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
        <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[10px] font-semibold text-[#C2410C] sm:text-xs"
            >
              <span className="max-w-[calc(100vw-110px)] truncate sm:max-w-xs">
                {item}
              </span>

              <button
                type="button"
                onClick={() =>
                  setItems(items.filter((_, index) => index !== i))
                }
                className="shrink-0"
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

/* ========================= PHOTO BUTTON ========================= */

function PhotoButton({
  children,
  onClick,
  disabled,
  icon: Icon,
  light = false,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  icon: typeof Camera;
  light?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold disabled:opacity-50 sm:w-auto sm:text-sm ${
        danger
          ? "border border-red-200 bg-white text-red-500 hover:bg-red-50"
          : light
            ? "border border-gray-200 bg-white text-[#475569] hover:bg-gray-50"
            : "bg-[#FF5C39] text-white hover:bg-[#e54e2e]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

/* ========================= MESSAGE ========================= */

function Message({
  children,
  error = false,
  success = false,
}: {
  children: React.ReactNode;
  error?: boolean;
  success?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-600"
          : success
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : ""
      }`}
    >
      {children}
    </div>
  );
}
