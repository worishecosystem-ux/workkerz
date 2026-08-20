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
  Plus,
  Save,
  Tag,
  User,
  X,
  Home,
  ClipboardList,
  Settings,
  Phone,
} from "lucide-react";
import { Keyboard } from "@capacitor/keyboard";
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

/* =========================================================
   ANDROID DEVICE DETECTION
========================================================= */

function detectAndroid() {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";

  const androidBrowser = /android/i.test(ua);

  const capacitor =
    !!(window as any).Capacitor &&
    (window as any).Capacitor.getPlatform?.() === "android";

  return androidBrowser || capacitor;
}

/* =========================================================
   ANDROID TABLET DETECTION
========================================================= */

function detectAndroidTablet() {
  if (typeof window === "undefined") return false;

  const android = detectAndroid();

  if (!android) return false;

  const width = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
  );

  const height = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0,
  );

  const shortest = Math.min(width, height);

  return shortest >= 600;
}

/* =========================================================
   KEYBOARD DETECTION
========================================================= */

function useKeyboardOpen(isAndroid: boolean) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isAndroid) return;

    const vv = window.visualViewport;

    if (!vv) return;

    const check = () => {
      const heightDifference = window.innerHeight - vv.height;

      setKeyboardOpen(heightDifference > 140);
    };

    check();

    vv.addEventListener("resize", check);
    vv.addEventListener("scroll", check);
    window.addEventListener("resize", check);

    return () => {
      vv.removeEventListener("resize", check);
      vv.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [isAndroid]);

  return keyboardOpen;
}

/* =========================================================
   MAIN
========================================================= */

export default function WorkerOnboardForm({ onBack, onCreated }: Props) {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const updateDevice = () => {
      setIsAndroid(detectAndroid());
      setIsTablet(detectAndroidTablet());
    };

    updateDevice();

    window.addEventListener("resize", updateDevice);

    return () => {
      window.removeEventListener("resize", updateDevice);
    };
  }, []);

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
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    let showListener: { remove: () => Promise<void> } | null = null;
    let hideListener: { remove: () => Promise<void> } | null = null;

    const setupKeyboard = async () => {
      showListener = await Keyboard.addListener("keyboardWillShow", () => {
        setKeyboardOpen(true);
      });

      hideListener = await Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardOpen(false);
      });
    };

    setupKeyboard();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);
  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const validatePhoto = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return "Only JPG, PNG and WebP images are allowed.";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Image size must be less than 5 MB.";
    }

    return "";
  };

  const selectPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validationError = validatePhoto(file);

    setPhotoError(validationError);

    if (validationError) {
      e.target.value = "";
      return;
    }

    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUrl("");

    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = () => {
    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

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

      if (!data?.publicUrl) {
        throw new Error("Unable to generate worker photo URL.");
      }

      return data.publicUrl;
    } finally {
      setPhotoUploading(false);
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

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

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Your admin session has expired. Please login again.");
      }

      let finalPhoto = photoUrl.trim();

      if (photoFile) {
        finalPhoto = await uploadPhoto(photoFile);
      }

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

      if (!response.ok) {
        throw new Error(data.error || "Unable to create worker.");
      }

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

  /*
   * ========================================================
   * ANDROID UI
   * ========================================================
   */

  if (isAndroid) {
    return (
      <div
        className={[
          "min-h-screen w-full overflow-x-hidden",
          "bg-[#F5F7FA] text-[#0F172A]",
          "select-none",
          isTablet ? "android-tablet" : "android-phone",
        ].join(" ")}
      >
        {/* ==================================================
            ANDROID TOP APP BAR
        ================================================== */}

        <header
          className={[
            "fixed inset-x-0 top-0 z-80",
            "border-b border-gray-200",
            "bg-white",
            "shadow-[0_1px_5px_rgba(15,23,42,0.08)]",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center",
              "px-4",
              isTablet ? "h-19 pt-1 pb-1" : "h-28 pt-15 pb-3",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={onBack}
              disabled={disabled}
              aria-label="Go back"
              className={[
                "flex shrink-0 items-center justify-center",
                "rounded-full",
                "active:scale-95",
                "disabled:opacity-50",
                isTablet ? "h-14 w-14" : "h-11 w-11",
              ].join(" ")}
            >
              <ArrowLeft className={isTablet ? "h-8 w-8" : "h-6 w-6"} />
            </button>

            <div className="ml-2 min-w-0 flex-1">
              <h1
                className={[
                  "truncate font-black",
                  isTablet ? "text-2xl" : "text-lg",
                ].join(" ")}
              >
                Worker Onboarding
              </h1>

              <p
                className={[
                  "truncate text-[#64748B]",
                  isTablet ? "mt-1 text-sm" : "text-[11px]",
                ].join(" ")}
              >
                Add a new worker
              </p>
            </div>

            <div
              className={[
                "flex shrink-0 items-center gap-2",
                "rounded-full",
                "bg-emerald-50",
                "text-emerald-700",
                "font-bold",
                isTablet ? "px-4 py-3 text-sm" : "px-3 py-2 text-[10px]",
              ].join(" ")}
            >
              <span
                className={[
                  "rounded-full bg-emerald-500",
                  isTablet ? "h-3 w-3" : "h-2 w-2",
                ].join(" ")}
              />
              Available
            </div>
          </div>
        </header>

        {/* ==================================================
            ANDROID CONTENT
        ================================================== */}

        <main
          className={[
            "mx-auto w-full",
            isTablet
              ? "max-w-275 px-7 pt-25 pb-20"
              : "px-4 pt-32 pb-10",
          ].join(" ")}
        >
          <form
            onSubmit={submit}
            className={isTablet ? "space-y-6" : "space-y-4"}
          >
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <AndroidSection
              title="Basic Information"
              description="Worker identity and contact details."
              tablet={isTablet}
            >
              <div
                className={isTablet ? "grid grid-cols-2 gap-5" : "space-y-4"}
              >
                <AndroidInput
                  label="Worker Name"
                  icon={User}
                  value={name}
                  onChange={setName}
                  placeholder="Enter worker name"
                  required
                  tablet={isTablet}
                />

                <AndroidInput
                  label="Phone Number"
                  icon={Phone}
                  value={phone}
                  onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter mobile number"
                  type="tel"
                  inputMode="numeric"
                  required
                  tablet={isTablet}
                />

                <AndroidCategory
                  value={category}
                  onChange={(v) => {
                    setCategory(v);
                    setSubcategory("");
                  }}
                  tablet={isTablet}
                />

                <AndroidSubcategory
                  category={category}
                  value={subcategory}
                  onChange={setSubcategory}
                  tablet={isTablet}
                />

                <AndroidInput
                  label="Specialty"
                  icon={BriefcaseBusiness}
                  value={specialty}
                  onChange={setSpecialty}
                  placeholder="e.g. Brick Mason"
                  required
                  tablet={isTablet}
                />

                <AndroidInput
                  label="Location"
                  icon={MapPin}
                  value={location}
                  onChange={setLocation}
                  placeholder="e.g. Gwalior"
                  required
                  tablet={isTablet}
                />

                <div className={isTablet ? "col-span-2" : ""}>
                  <AndroidInput
                    label="Labour Chauk"
                    icon={MapPin}
                    value={labourChauk}
                    onChange={setLabourChauk}
                    placeholder="e.g. Thatipur Labour Chauk"
                    tablet={isTablet}
                  />
                </div>
              </div>
            </AndroidSection>

            {/* =================================================
                PHOTO
            ================================================= */}

            <AndroidSection
              title="Worker Photo"
              description="Take a live photo or choose an image."
              tablet={isTablet}
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

              <div
                className={[
                  "rounded-2xl",
                  "border border-dashed border-gray-200",
                  "bg-[#F8FAFC]",
                  isTablet ? "flex items-center gap-8 p-7" : "p-4",
                ].join(" ")}
              >
                <div
                  className={[
                    "relative mx-auto flex shrink-0",
                    "items-center justify-center",
                    "overflow-hidden",
                    "rounded-2xl",
                    "border border-gray-200",
                    "bg-orange-50",
                    isTablet ? "h-48 w-48 mx-0" : "h-32 w-32",
                  ].join(" ")}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={name || "Worker"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera
                      className={
                        isTablet
                          ? "h-14 w-14 text-[#FF5C39]"
                          : "h-10 w-10 text-[#FF5C39]"
                      }
                    />
                  )}

                  {photoFile && (
                    <span
                      className={[
                        "absolute bottom-2",
                        "rounded-full",
                        "bg-emerald-500",
                        "font-bold text-white",
                        isTablet
                          ? "px-4 py-2 text-xs"
                          : "px-3 py-1.5 text-[9px]",
                      ].join(" ")}
                    >
                      SELECTED
                    </span>
                  )}
                </div>

                <div className="mt-4 min-w-0 flex-1">
                  <p
                    className={[
                      "font-bold text-[#0F172A]",
                      isTablet ? "text-xl" : "text-sm",
                    ].join(" ")}
                  >
                    {photoPreview
                      ? "Worker photo selected"
                      : "Add worker photo"}
                  </p>

                  <p
                    className={[
                      "mt-1 text-[#64748B]",
                      isTablet ? "text-sm" : "text-xs",
                    ].join(" ")}
                  >
                    Use camera or choose an image from your device.
                  </p>

                  <div
                    className={[
                      "mt-4 grid gap-3",
                      isTablet ? "grid-cols-3" : "grid-cols-1",
                    ].join(" ")}
                  >
                    <AndroidPhotoButton
                      onClick={() => cameraRef.current?.click()}
                      disabled={disabled}
                      icon={Camera}
                      tablet={isTablet}
                    >
                      Take Photo
                    </AndroidPhotoButton>

                    <AndroidPhotoButton
                      onClick={() => fileRef.current?.click()}
                      disabled={disabled}
                      icon={ImagePlus}
                      light
                      tablet={isTablet}
                    >
                      Choose File
                    </AndroidPhotoButton>

                    {photoPreview && (
                      <AndroidPhotoButton
                        onClick={removePhoto}
                        disabled={disabled}
                        icon={X}
                        danger
                        tablet={isTablet}
                      >
                        Remove
                      </AndroidPhotoButton>
                    )}
                  </div>

                  {photoError && (
                    <div className="mt-3">
                      <AndroidMessage error tablet={isTablet}>
                        {photoError}
                      </AndroidMessage>
                    </div>
                  )}
                </div>
              </div>
            </AndroidSection>

            {/* =================================================
                PROFESSIONAL
            ================================================= */}

            <AndroidSection
              title="Professional Information"
              description="Experience, skills and services."
              tablet={isTablet}
            >
              <div className="space-y-5">
                <div
                  className={isTablet ? "grid grid-cols-2 gap-5" : "space-y-4"}
                >
                  <AndroidInput
                    label="Years of Experience"
                    icon={BriefcaseBusiness}
                    value={yearsExperience}
                    onChange={setYearsExperience}
                    placeholder="0"
                    type="number"
                    inputMode="numeric"
                    tablet={isTablet}
                  />

                  <AndroidInput
                    label="Response Time"
                    icon={CheckCircle2}
                    value={responseTime}
                    onChange={setResponseTime}
                    placeholder="e.g. Within 30 minutes"
                    tablet={isTablet}
                  />
                </div>

                <div>
                  <label
                    className={[
                      "mb-2 block font-bold",
                      isTablet ? "text-base" : "text-sm",
                    ].join(" ")}
                  >
                    Worker Bio
                  </label>

                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short description about the worker..."
                    rows={isTablet ? 5 : 4}
                    className={[
                      "w-full resize-y",
                      "rounded-2xl",
                      "border border-gray-200",
                      "bg-[#F8FAFC]",
                      "outline-none",
                      "focus:border-[#FF5C39]",
                      "focus:bg-white",
                      "focus:ring-4",
                      "focus:ring-orange-100",
                      isTablet
                        ? "min-h-[130px] px-5 py-4 text-base"
                        : "min-h-[105px] px-4 py-3 text-sm",
                    ].join(" ")}
                  />
                </div>

                <AndroidTags
                  label="Skills"
                  placeholder="Add a skill"
                  value={skillInput}
                  setValue={setSkillInput}
                  items={skills}
                  setItems={setSkills}
                  tablet={isTablet}
                />

                <AndroidTags
                  label="Services"
                  placeholder="Add a service"
                  value={serviceInput}
                  setValue={setServiceInput}
                  items={services}
                  setItems={setServices}
                  tablet={isTablet}
                />

                <AndroidTags
                  label="Certifications"
                  placeholder="Add certification"
                  value={certificationInput}
                  setValue={setCertificationInput}
                  items={certifications}
                  setItems={setCertifications}
                  tablet={isTablet}
                />
              </div>
            </AndroidSection>

            {/* =================================================
                PRICING
            ================================================= */}

            <AndroidSection
              title="Pricing"
              description="Set marketplace pricing."
              tablet={isTablet}
            >
              <div className="space-y-5">
                <div>
                  <label
                    className={[
                      "mb-2 block font-bold",
                      isTablet ? "text-base" : "text-sm",
                    ].join(" ")}
                  >
                    Pricing Type
                  </label>

                  <div className="relative">
                    <select
                      value={pricingType}
                      onChange={(e) =>
                        setPricingType(e.target.value as PricingType)
                      }
                      className={[
                        "w-full appearance-none",
                        "rounded-2xl",
                        "border border-gray-200",
                        "bg-[#F8FAFC]",
                        "font-semibold",
                        "outline-none",
                        "focus:border-[#FF5C39]",
                        "focus:bg-white",
                        "focus:ring-4",
                        "focus:ring-orange-100",
                        isTablet
                          ? "h-14 px-5 pr-12 text-base"
                          : "h-12 px-4 pr-10 text-sm",
                      ].join(" ")}
                    >
                      <option value="custom">Custom</option>
                      <option value="per_job">Per Job</option>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="per_service">Per Service</option>
                      <option value="visit_charge">Visit Charge</option>
                    </select>

                    <ChevronDown
                      className={[
                        "pointer-events-none",
                        "absolute right-4 top-1/2",
                        "-translate-y-1/2",
                        "text-[#64748B]",
                        isTablet ? "h-6 w-6" : "h-5 w-5",
                      ].join(" ")}
                    />
                  </div>
                </div>

                <div
                  className={[
                    "grid gap-3",
                    isTablet ? "grid-cols-5 gap-4" : "grid-cols-2",
                  ].join(" ")}
                >
                  <AndroidPrice
                    label="Starting Price"
                    value={startingPrice}
                    set={setStartingPrice}
                    tablet={isTablet}
                  />

                  <AndroidPrice
                    label="Half Day"
                    value={halfDayPrice}
                    set={setHalfDayPrice}
                    tablet={isTablet}
                  />

                  <AndroidPrice
                    label="Full Day"
                    value={fullDayPrice}
                    set={setFullDayPrice}
                    tablet={isTablet}
                  />

                  <AndroidPrice
                    label="Monthly"
                    value={monthlyPrice}
                    set={setMonthlyPrice}
                    tablet={isTablet}
                  />

                  <AndroidPrice
                    label="Visit Charge"
                    value={visitCharge}
                    set={setVisitCharge}
                    tablet={isTablet}
                  />
                </div>
              </div>
            </AndroidSection>

            {/* =================================================
                AVAILABILITY
            ================================================= */}

            <AndroidSection
              title="Availability"
              description="Control worker availability."
              tablet={isTablet}
            >
              <button
                type="button"
                onClick={() => setAvailable((v) => !v)}
                className={[
                  "flex w-full items-center",
                  "rounded-2xl",
                  "border border-gray-200",
                  "bg-[#F8FAFC]",
                  "text-left",
                  isTablet ? "gap-5 p-5" : "gap-4 p-4",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex shrink-0 items-center",
                    "rounded-full p-1",
                    "transition",
                    isTablet ? "h-9 w-16" : "h-7 w-12",
                    available ? "bg-emerald-500" : "bg-gray-300",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "rounded-full bg-white shadow",
                      "transition-transform",
                      isTablet ? "h-7 w-7" : "h-5 w-5",
                      available
                        ? isTablet
                          ? "translate-x-7"
                          : "translate-x-5"
                        : "",
                    ].join(" ")}
                  />
                </div>

                <div>
                  <p
                    className={[
                      "font-bold",
                      isTablet ? "text-base" : "text-sm",
                    ].join(" ")}
                  >
                    {available ? "Available Now" : "Currently Unavailable"}
                  </p>

                  <p
                    className={[
                      "mt-1 text-[#64748B]",
                      isTablet ? "text-sm" : "text-xs",
                    ].join(" ")}
                  >
                    {available
                      ? "Worker can receive bookings."
                      : "Worker will not appear as available."}
                  </p>
                </div>
              </button>
            </AndroidSection>

            {/* =================================================
                MESSAGES
            ================================================= */}

            {error && (
              <AndroidMessage error tablet={isTablet}>
                {error}
              </AndroidMessage>
            )}

            {success && (
              <AndroidMessage success tablet={isTablet}>
                <CheckCircle2 className={isTablet ? "h-5 w-5" : "h-4 w-4"} />

                {success}
              </AndroidMessage>
            )}
          </form>
        </main>

        {/* ==================================================
            REAL ANDROID BOTTOM ACTION BAR
        ================================================== */}

        {!keyboardOpen && (
          <div className="fixed inset-x-0 bottom-0 z-100 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(15,23,42,0.12)]">
            <div
              className={
                isTablet ? "mx-auto w-full max-w-275 px-5" : "w-full px-2.5"
              }
            >
              <div className={isTablet ? "flex gap-3 py-3" : "flex gap-2 py-6"}>
                <button
                  type="button"
                  onClick={onBack}
                  disabled={disabled}
                  className={[
                    "flex items-center justify-center",
                    "border border-gray-200 bg-white",
                    "font-bold text-[#475569]",
                    "active:scale-[0.98]",
                    "disabled:opacity-50",
                    isTablet
                      ? "h-14 flex-1 rounded-xl text-base"
                      : "h-11 flex-1 rounded-lg text-xs",
                  ].join(" ")}
                >
                  <X className={isTablet ? "mr-2 h-5 w-5" : "mr-1.5 h-4 w-4"} />
                  Close
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const form = document.querySelector(
                      "form",
                    ) as HTMLFormElement | null;
                    form?.requestSubmit();
                  }}
                  className={[
                    "flex flex-[1.5] items-center justify-center",
                    "gap-1.5",
                    "bg-[#FF5C39]",
                    "font-bold text-white",
                    "shadow-[0_3px_10px_rgba(255,92,57,0.22)]",
                    "active:scale-[0.98]",
                    "disabled:opacity-60",
                    isTablet
                      ? "h-14 rounded-xl text-base"
                      : "h-11 rounded-lg text-xs",
                  ].join(" ")}
                >
                  {disabled ? (
                    <Loader2
                      className={
                        isTablet
                          ? "h-5 w-5 animate-spin"
                          : "h-4 w-4 animate-spin"
                      }
                    />
                  ) : (
                    <Save className={isTablet ? "h-5 w-5" : "h-4 w-4"} />
                  )}

                  {photoUploading
                    ? "Uploading Photo..."
                    : loading
                      ? "Creating..."
                      : "Create Worker"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /*
   * ========================================================
   * DESKTOP UI
   * ========================================================
   *
   * Android se completely separate.
   */

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAFC]">
      {/* DESKTOP HEADER */}

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={disabled}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#64748B] hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#0F172A]">
                  Worker Onboarding
                </h1>

                <span className="text-[#CBD5E1]">/</span>

                <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#FF5C39]">
                  New Worker
                </span>
              </div>

              <p className="mt-1 text-sm text-[#64748B]">
                Add a worker to the Workkerz marketplace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-bold text-emerald-700">
              New Worker
            </span>
          </div>
        </div>
      </header>

      {/* DESKTOP CONTENT */}

      <main className="mx-auto w-full max-w-7xl px-8 py-6 pb-10">
        <form onSubmit={submit} className="space-y-5">
          <Section
            title="Basic Information"
            description="Worker identity and contact details."
          >
            <div className="grid grid-cols-2 gap-4">
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

              <div className="col-span-2">
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

            <div className="flex items-center gap-8 rounded-2xl border border-dashed border-gray-200 bg-[#F8FAFC] p-7">
              <div className="relative flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-orange-50">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={name || "Worker"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-12 w-12 text-[#FF5C39]" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-lg font-bold text-[#0F172A]">
                  {photoPreview ? "Worker photo selected" : "Add worker photo"}
                </p>

                <p className="mt-1 text-sm text-[#64748B]">
                  Use camera or choose an image from your device.
                </p>

                <div className="mt-4 flex gap-3">
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
              </div>
            </div>

            {photoError && (
              <div className="mt-3">
                <Message error>{photoError}</Message>
              </div>
            )}
          </Section>

          <Section
            title="Professional Information"
            description="Experience, skills and services."
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Worker Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short description about the worker..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-3 text-sm outline-none focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100"
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

          <Section
            title="Pricing"
            description="Set the worker's marketplace pricing."
          >
            <div className="space-y-4">
              <div className="relative">
                <select
                  value={pricingType}
                  onChange={(e) =>
                    setPricingType(e.target.value as PricingType)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 pr-10 text-sm font-semibold outline-none focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100"
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

              <div className="grid grid-cols-5 gap-3">
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

          <Section
            title="Availability"
            description="Control whether this worker is currently available."
          >
            <button
              type="button"
              onClick={() => setAvailable((v) => !v)}
              className="flex items-center gap-4"
            >
              <div
                className={`flex h-7 w-12 items-center rounded-full p-1 ${
                  available ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    available ? "translate-x-5" : ""
                  }`}
                />
              </div>

              <div>
                <p className="text-sm font-bold">
                  {available ? "Available Now" : "Currently Unavailable"}
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  {available
                    ? "Worker can receive bookings."
                    : "Worker will not appear as available."}
                </p>
              </div>
            </button>
          </Section>

          {error && <Message error>{error}</Message>}

          {success && (
            <Message success>
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </Message>
          )}

          {/* DESKTOP ACTIONS */}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={disabled}
              className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-[#64748B]"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={disabled}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#FF5C39] px-7 text-sm font-bold text-white"
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
        </form>
      </main>
    </div>
  );
}

/* =========================================================
   ANDROID SECTION
========================================================= */

function AndroidSection({
  title,
  description,
  children,
  tablet,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  tablet: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
      <div
        className={[
          "border-b border-gray-100",
          tablet ? "px-6 py-5" : "px-4 py-4",
        ].join(" ")}
      >
        <h2
          className={[
            "font-black text-[#0F172A]",
            tablet ? "text-xl" : "text-base",
          ].join(" ")}
        >
          {title}
        </h2>

        <p
          className={[
            "mt-1 text-[#64748B]",
            tablet ? "text-sm" : "text-xs",
          ].join(" ")}
        >
          {description}
        </p>
      </div>

      <div className={tablet ? "p-6" : "p-4"}>{children}</div>
    </section>
  );
}

/* =========================================================
   ANDROID INPUT
========================================================= */

function AndroidInput({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  inputMode,
  tablet,
}: {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  tablet: boolean;
}) {
  return (
    <div>
      <label
        className={[
          "mb-2 block font-bold text-[#0F172A]",
          tablet ? "text-base" : "text-sm",
        ].join(" ")}
      >
        {label}

        {required && <span className="ml-1 text-[#FF5C39]">*</span>}
      </label>

      <div className="relative">
        <Icon
          className={[
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]",
            tablet ? "h-5 w-5" : "h-4 w-4",
          ].join(" ")}
        />

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          min={type === "number" ? "0" : undefined}
          className={[
            "box-border w-full",
            "rounded-2xl",
            "border border-gray-200",
            "bg-[#F8FAFC]",
            "font-medium text-[#0F172A]",
            "outline-none",
            "placeholder:text-[#A8B2C1]",
            "focus:border-[#FF5C39]",
            "focus:bg-white",
            "focus:ring-4",
            "focus:ring-orange-100",
            tablet ? "h-14 pl-12 pr-5 text-base" : "h-12 pl-11 pr-4 text-sm",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ANDROID CATEGORY
========================================================= */

function AndroidCategory({
  value,
  onChange,
  tablet,
}: {
  value: Category | "";
  onChange: (value: Category) => void;
  tablet: boolean;
}) {
  return (
    <div>
      <label
        className={[
          "mb-2 block font-bold",
          tablet ? "text-base" : "text-sm",
        ].join(" ")}
      >
        Worker Category
        <span className="ml-1 text-[#FF5C39]">*</span>
      </label>

      <div className="relative">
        <BriefcaseBusiness
          className={[
            "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#94A3B8]",
            tablet ? "h-5 w-5" : "h-4 w-4",
          ].join(" ")}
        />

        <select
          value={value}
          required
          onChange={(e) => onChange(e.target.value as Category)}
          className={[
            "w-full appearance-none",
            "rounded-2xl border",
            "bg-[#F8FAFC]",
            "pl-11 pr-12",
            "font-semibold outline-none",
            "focus:border-[#FF5C39]",
            "focus:bg-white",
            "focus:ring-4",
            "focus:ring-orange-100",
            tablet ? "h-14 text-base" : "h-12 text-sm",
            value
              ? "border-orange-200 text-[#0F172A]"
              : "border-gray-200 text-[#94A3B8]",
          ].join(" ")}
        >
          <option value="">Select worker category</option>

          {Object.keys(CATEGORIES).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <ChevronDown
          className={[
            "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]",
            tablet ? "h-6 w-6" : "h-5 w-5",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ANDROID SUBCATEGORY
========================================================= */

function AndroidSubcategory({
  category,
  value,
  onChange,
  tablet,
}: {
  category: Category | "";
  value: string;
  onChange: (value: string) => void;
  tablet: boolean;
}) {
  const items = category ? CATEGORIES[category] : [];

  const disabled = !category;

  return (
    <div>
      <label
        className={[
          "mb-2 block font-bold",
          tablet ? "text-base" : "text-sm",
        ].join(" ")}
      >
        Worker Subcategory
        <span className="ml-1 text-[#FF5C39]">*</span>
      </label>

      <div className="relative">
        <Tag
          className={[
            "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#94A3B8]",
            tablet ? "h-5 w-5" : "h-4 w-4",
          ].join(" ")}
        />

        <select
          value={value}
          disabled={disabled}
          required
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full appearance-none",
            "rounded-2xl border",
            "pl-11 pr-12",
            "font-semibold outline-none",
            tablet ? "h-14 text-base" : "h-12 text-sm",
            disabled
              ? "border-gray-100 bg-gray-50 text-[#CBD5E1]"
              : "border-gray-200 bg-[#F8FAFC] text-[#0F172A]",
            "focus:border-[#FF5C39]",
            "focus:bg-white",
            "focus:ring-4",
            "focus:ring-orange-100",
          ].join(" ")}
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

        <ChevronDown
          className={[
            "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]",
            tablet ? "h-6 w-6" : "h-5 w-5",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ANDROID PRICE
========================================================= */

function AndroidPrice({
  label,
  value,
  set,
  tablet,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
  tablet: boolean;
}) {
  return (
    <div>
      <label
        className={[
          "mb-2 block truncate font-bold text-[#64748B]",
          tablet ? "text-sm" : "text-[11px]",
        ].join(" ")}
      >
        {label}
      </label>

      <div className="relative">
        <IndianRupee
          className={[
            "absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]",
            tablet ? "h-5 w-5" : "h-4 w-4",
          ].join(" ")}
        />

        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          onChange={(e) => set(e.target.value)}
          className={[
            "w-full rounded-2xl",
            "border border-gray-200",
            "bg-[#F8FAFC]",
            "font-bold",
            "outline-none",
            "focus:border-[#FF5C39]",
            "focus:ring-4",
            "focus:ring-orange-100",
            tablet ? "h-14 pl-9 pr-3 text-base" : "h-12 pl-8 pr-2 text-sm",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ANDROID TAGS
========================================================= */

function AndroidTags({
  label,
  placeholder,
  value,
  setValue,
  items,
  setItems,
  tablet,
}: {
  label: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  tablet: boolean;
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
    <div>
      <label
        className={[
          "mb-2 block font-bold",
          tablet ? "text-base" : "text-sm",
        ].join(" ")}
      >
        {label}
      </label>

      <div className="flex gap-3">
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
          className={[
            "min-w-0 flex-1",
            "rounded-2xl",
            "border border-gray-200",
            "bg-[#F8FAFC]",
            "outline-none",
            "focus:border-[#FF5C39]",
            "focus:ring-4",
            "focus:ring-orange-100",
            tablet ? "h-14 px-5 text-base" : "h-12 px-4 text-sm",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={add}
          className={[
            "flex shrink-0 items-center justify-center",
            "rounded-2xl",
            "border border-gray-200",
            "bg-white",
            "active:scale-95",
            tablet ? "h-14 w-14" : "h-12 w-12",
          ].join(" ")}
        >
          <Plus className={tablet ? "h-6 w-6" : "h-5 w-5"} />
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className={[
                "inline-flex items-center gap-2",
                "rounded-full",
                "bg-orange-50",
                "font-bold text-[#C2410C]",
                tablet ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs",
              ].join(" ")}
            >
              <span className="max-w-[220px] truncate">{item}</span>

              <button
                type="button"
                onClick={() =>
                  setItems(items.filter((_, index) => index !== i))
                }
              >
                <X className={tablet ? "h-4 w-4" : "h-3 w-3"} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ANDROID PHOTO BUTTON
========================================================= */

function AndroidPhotoButton({
  children,
  onClick,
  disabled,
  icon: Icon,
  light = false,
  danger = false,
  tablet,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  icon: typeof Camera;
  light?: boolean;
  danger?: boolean;
  tablet: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center justify-center",
        "gap-2 rounded-2xl",
        "font-bold",
        "disabled:opacity-50",
        "active:scale-[0.98]",
        tablet ? "h-14 px-5 text-base" : "h-12 px-4 text-sm",
        danger
          ? "border border-red-200 bg-white text-red-500"
          : light
            ? "border border-gray-200 bg-white text-[#475569]"
            : "bg-[#FF5C39] text-white",
      ].join(" ")}
    >
      <Icon className={tablet ? "h-5 w-5" : "h-4 w-4"} />

      {children}
    </button>
  );
}

/* =========================================================
   ANDROID MESSAGE
========================================================= */

function AndroidMessage({
  children,
  error = false,
  success = false,
  tablet,
}: {
  children: React.ReactNode;
  error?: boolean;
  success?: boolean;
  tablet: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl border",
        tablet ? "px-5 py-4 text-base" : "px-4 py-3 text-sm",
        error
          ? "border-red-200 bg-red-50 text-red-600"
          : success
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* =========================================================
   DESKTOP COMPONENTS
========================================================= */

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
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-black text-[#0F172A]">{title}</h2>

        <p className="mt-1 text-xs text-[#64748B]">{description}</p>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

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
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
        {label}

        {required && <span className="ml-1 text-[#FF5C39]">*</span>}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          min={type === "number" ? "0" : undefined}
          className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#0F172A] outline-none placeholder:text-[#A8B2C1] focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: Category | "";
  onChange: (value: Category) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">
        Worker Category
        <span className="ml-1 text-[#FF5C39]">*</span>
      </label>

      <div className="relative">
        <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

        <select
          value={value}
          required
          onChange={(e) => onChange(e.target.value as Category)}
          className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-10 text-sm font-semibold outline-none focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100"
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
    </div>
  );
}

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

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">
        Worker Subcategory
        <span className="ml-1 text-[#FF5C39]">*</span>
      </label>

      <div className="relative">
        <Tag className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

        <select
          value={value}
          disabled={!category}
          required
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-10 text-sm font-semibold outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
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
    </div>
  );
}

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
    <div>
      <label className="mb-1.5 block truncate text-xs font-semibold text-[#64748B]">
        {label}
      </label>

      <div className="relative">
        <IndianRupee className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#94A3B8]" />

        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          onChange={(e) => set(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-8 pr-3 text-sm font-semibold outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </div>
  );
}

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
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>

      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 text-sm outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
        />

        <button
          type="button"
          onClick={add}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#C2410C]"
            >
              {item}

              <button
                type="button"
                onClick={() =>
                  setItems(items.filter((_, index) => index !== i))
                }
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
      className={[
        "flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold",
        danger
          ? "border border-red-200 bg-white text-red-500"
          : light
            ? "border border-gray-200 bg-white text-[#475569]"
            : "bg-[#FF5C39] text-white",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

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
      className={[
        "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
        error
          ? "border-red-200 bg-red-50 text-red-600"
          : success
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
