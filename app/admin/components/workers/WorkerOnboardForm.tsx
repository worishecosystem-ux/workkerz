"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Star,
  Tag,
  User,
  X,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

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

export default function WorkerOnboardForm({
  onBack,
  onCreated,
}: WorkerOnboardFormProps) {
  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [subcategory, setSubcategory] =
    useState("");

  const [specialty, setSpecialty] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [labourChauk, setLabourChauk] =
    useState("");

  // =====================================================
  // PROFESSIONAL INFORMATION
  // =====================================================

  const [yearsExperience, setYearsExperience] =
    useState("0");

  const [bio, setBio] =
    useState("");

  const [responseTime, setResponseTime] =
    useState("");

  const [skills, setSkills] =
    useState<string[]>([]);

  const [services, setServices] =
    useState<string[]>([]);

  const [certifications, setCertifications] =
    useState<string[]>([]);

  const [skillInput, setSkillInput] =
    useState("");

  const [serviceInput, setServiceInput] =
    useState("");

  const [certificationInput, setCertificationInput] =
    useState("");

  // =====================================================
  // PRICING
  // =====================================================

  const [pricingType, setPricingType] =
    useState<PricingType>("custom");

  const [startingPrice, setStartingPrice] =
    useState("0");

  const [halfDayPrice, setHalfDayPrice] =
    useState("0");

  const [fullDayPrice, setFullDayPrice] =
    useState("0");

  const [monthlyPrice, setMonthlyPrice] =
    useState("0");

  const [visitCharge, setVisitCharge] =
    useState("0");

  // =====================================================
  // STATUS
  // =====================================================

  const [available, setAvailable] =
    useState(true);

  // =====================================================
  // UI
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // ADD ARRAY ITEM
  // =====================================================

  const addItem = (
    value: string,
    setter: React.Dispatch<
      React.SetStateAction<string[]>
    >,
    list: string[],
    clear: () => void,
  ) => {
    const cleanValue =
      value.trim();

    if (!cleanValue) {
      return;
    }

    if (
      list.some(
        (item) =>
          item.toLowerCase() ===
          cleanValue.toLowerCase(),
      )
    ) {
      clear();
      return;
    }

    setter([
      ...list,
      cleanValue,
    ]);

    clear();
  };

  // =====================================================
  // REMOVE ARRAY ITEM
  // =====================================================

  const removeItem = (
    index: number,
    setter: React.Dispatch<
      React.SetStateAction<string[]>
    >,
    list: string[],
  ) => {
    setter(
      list.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  };

  // =====================================================
  // CREATE WORKER
  // =====================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // =================================================
      // VALIDATION
      // =================================================

      if (!name.trim()) {
        throw new Error(
          "Worker name is required.",
        );
      }

      if (!category.trim()) {
        throw new Error(
          "Category is required.",
        );
      }

      if (!subcategory.trim()) {
        throw new Error(
          "Subcategory is required.",
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

      // =================================================
      // SUPABASE SESSION
      // =================================================

      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired. Please login again.",
        );
      }

      // =================================================
      // WORKER PAYLOAD
      // =================================================

      const workerPayload = {
        name: name.trim(),

        category:
          category.trim(),

        subcategory:
          subcategory.trim(),

        specialty:
          specialty.trim(),

        location:
          location.trim(),

        phone:
          phone.trim() || null,

        labour_chauk:
          labourChauk.trim() || null,

        years_experience:
          Number(yearsExperience) || 0,

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
      };

      // =================================================
      // API
      // =================================================

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

          body: JSON.stringify(
            workerPayload,
          ),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create worker.",
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Worker onboarded successfully.",
      );

      onCreated?.(data.worker);
    } catch (error) {
      console.error(
        "Worker onboarding error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to onboard worker.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between">

        <div className="flex items-center">

          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#F8FAFC] mr-4 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5 text-[#64748B]" />
          </button>

          <div>

            <h1 className="text-2xl font-black text-[#0F172A]">
              Worker Onboarding
            </h1>

            <p className="text-sm text-[#64748B] mt-1">
              Add a worker to the Workkerz marketplace.
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <span className="w-2 h-2 rounded-full bg-emerald-500" />

          <span className="text-xs font-semibold text-[#64748B]">
            New Worker
          </span>

        </div>

      </header>

      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

      <div className="p-8 max-w-6xl mx-auto">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ================================================= */}
          {/* BASIC INFORMATION */}
          {/* ================================================= */}

          <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

            <SectionHeader
              title="Basic Information"
              description="Worker identity and contact details."
            />

            <div className="p-6 grid grid-cols-2 gap-5">

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
                onChange={setPhone}
                placeholder="Enter mobile number"
                type="tel"
              />

              <InputField
                label="Category"
                icon={BriefcaseBusiness}
                value={category}
                onChange={setCategory}
                placeholder="e.g. Construction"
                required
              />

              <InputField
                label="Subcategory"
                icon={Tag}
                value={subcategory}
                onChange={setSubcategory}
                placeholder="e.g. Civil Work"
                required
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

          {/* ================================================= */}
          {/* PROFESSIONAL */}
          {/* ================================================= */}

          <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

            <SectionHeader
              title="Professional Information"
              description="Experience, skills and services."
            />

            <div className="p-6 space-y-5">

              <div className="grid grid-cols-2 gap-5">

                <InputField
                  label="Years of Experience"
                  icon={BriefcaseBusiness}
                  value={yearsExperience}
                  onChange={setYearsExperience}
                  placeholder="0"
                  type="number"
                />

                <InputField
                  label="Response Time"
                  icon={CheckCircle2}
                  value={responseTime}
                  onChange={setResponseTime}
                  placeholder="e.g. Within 30 minutes"
                />

              </div>

              {/* BIO */}

              <div>

                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Worker Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(event) =>
                    setBio(
                      event.target.value,
                    )
                  }
                  placeholder="Write a short description about the worker..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-[#0F172A] outline-none resize-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* SKILLS */}

              <TagInput
                label="Skills"
                placeholder="Add a skill and press Enter"
                value={skillInput}
                setValue={setSkillInput}
                items={skills}
                setItems={setSkills}
              />

              {/* SERVICES */}

              <TagInput
                label="Services"
                placeholder="Add a service and press Enter"
                value={serviceInput}
                setValue={setServiceInput}
                items={services}
                setItems={setServices}
              />

              {/* CERTIFICATIONS */}

              <TagInput
                label="Certifications"
                placeholder="Add certification and press Enter"
                value={certificationInput}
                setValue={
                  setCertificationInput
                }
                items={certifications}
                setItems={setCertifications}
              />

            </div>

          </section>

          {/* ================================================= */}
          {/* PRICING */}
          {/* ================================================= */}

          <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

            <SectionHeader
              title="Pricing"
              description="Set the worker's marketplace pricing."
            />

            <div className="p-6 space-y-5">

              {/* PRICING TYPE */}

              <div>

                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Pricing Type
                </label>

                <div className="relative">

                  <select
                    value={pricingType}
                    onChange={(event) =>
                      setPricingType(
                        event.target
                          .value as PricingType,
                      )
                    }
                    className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-[#0F172A] outline-none appearance-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="custom">
                      Custom
                    </option>

                    <option value="per_job">
                      Per Job
                    </option>

                    <option value="daily">
                      Daily
                    </option>

                    <option value="monthly">
                      Monthly
                    </option>

                    <option value="per_service">
                      Per Service
                    </option>

                    <option value="visit_charge">
                      Visit Charge
                    </option>
                  </select>

                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />

                </div>

              </div>

              {/* PRICE GRID */}

              <div className="grid grid-cols-5 gap-4">

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

          {/* ================================================= */}
          {/* AVAILABILITY */}
          {/* ================================================= */}

          <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

            <SectionHeader
              title="Availability"
              description="Control whether this worker is currently available."
            />

            <div className="p-6">

              <button
                type="button"
                onClick={() =>
                  setAvailable(
                    (value) => !value,
                  )
                }
                className="flex items-center gap-4"
              >

                <div
                  className={`w-12 h-7 rounded-full p-1 transition ${
                    available
                      ? "bg-emerald-500"
                      : "bg-gray-300"
                  }`}
                >

                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      available
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />

                </div>

                <div className="text-left">

                  <p className="text-sm font-bold text-[#0F172A]">
                    {available
                      ? "Available Now"
                      : "Currently Unavailable"}
                  </p>

                  <p className="text-xs text-[#64748B] mt-1">
                    {available
                      ? "Worker can receive bookings."
                      : "Worker will not appear as available."}
                  </p>

                </div>

              </button>

            </div>

          </section>

          {/* ================================================= */}
          {/* MESSAGES */}
          {/* ================================================= */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

              <p className="text-sm text-emerald-700">
                {success}
              </p>
            </div>
          )}

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="flex items-center justify-end gap-3 pb-8">

            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="h-11 px-6 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-7 rounded-xl bg-[#FF5C39] hover:bg-[#e54e2e] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}

              {loading
                ? "Creating Worker..."
                : "Create Worker"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* ===================================================== */
/* SECTION HEADER */
/* ===================================================== */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-5 border-b border-gray-100">

      <h2 className="text-base font-black text-[#0F172A]">
        {title}
      </h2>

      <p className="text-xs text-[#64748B] mt-1">
        {description}
      </p>

    </div>
  );
}

/* ===================================================== */
/* INPUT */
/* ===================================================== */

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
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-[#0F172A] mb-2">

        {label}

        {required && (
          <span className="text-[#FF5C39] ml-1">
            *
          </span>
        )}

      </label>

      <div className="relative">

        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

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
          min={
            type === "number"
              ? "0"
              : undefined
          }
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 transition"
        />

      </div>

    </div>
  );
}

/* ===================================================== */
/* PRICE INPUT */
/* ===================================================== */

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>

      <label className="block text-xs font-semibold text-[#64748B] mb-2">
        {label}
      </label>

      <div className="relative">

        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />

        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="w-full h-10 pl-8 pr-3 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
        />

      </div>

    </div>
  );
}

/* ===================================================== */
/* TAG INPUT */
/* ===================================================== */

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
  setValue: (
    value: string,
  ) => void;
  items: string[];
  setItems: React.Dispatch<
    React.SetStateAction<string[]>
  >;
}) {
  const add = () => {
    const clean =
      value.trim();

    if (!clean) {
      return;
    }

    if (
      items.some(
        (item) =>
          item.toLowerCase() ===
          clean.toLowerCase(),
      )
    ) {
      setValue("");
      return;
    }

    setItems([
      ...items,
      clean,
    ]);

    setValue("");
  };

  return (
    <div>

      <label className="block text-sm font-semibold text-[#0F172A] mb-2">
        {label}
      </label>

      <div className="flex gap-2">

        <input
          type="text"
          value={value}
          onChange={(event) =>
            setValue(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
        />

        <button
          type="button"
          onClick={add}
          className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-gray-200 flex items-center justify-center hover:bg-gray-100"
        >
          <Plus className="w-4 h-4 text-[#64748B]" />
        </button>

      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">

          {items.map(
            (
              item,
              index,
            ) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-[#C2410C] text-xs font-semibold"
              >
                {item}

                <button
                  type="button"
                  onClick={() =>
                    setItems(
                      items.filter(
                        (
                          _,
                          itemIndex,
                        ) =>
                          itemIndex !==
                          index,
                      ),
                    )
                  }
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>

              </span>
            ),
          )}

        </div>
      )}

    </div>
  );
}