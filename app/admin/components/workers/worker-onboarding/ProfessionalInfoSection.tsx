"use client";

import {
  Award,
  Briefcase,
  Clock3,
  Plus,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";

type Device = "desktop" | "tablet" | "mobile";

type Props = {
  experience: string;
  setExperience: (value: string) => void;

  responseTime: string;
  setResponseTime: (value: string) => void;

  bio: string;
  setBio: (value: string) => void;

  skills: string[];
  setSkills: (values: string[]) => void;

  services: string[];
  setServices: (values: string[]) => void;

  certifications: string[];
  setCertifications: (values: string[]) => void;

  device: Device;
};

export default function ProfessionalInfoSection({
  experience,
  setExperience,
  responseTime,
  setResponseTime,
  bio,
  setBio,
  skills,
  setSkills,
  services,
  setServices,
  certifications,
  setCertifications,
  device,
}: Props) {
  return (
    <section
      className={[
        "rounded-2xl border border-[#E2E8F0] bg-white",
        device === "mobile" ? "p-3" : "p-5",
      ].join(" ")}
    >
      {/* HEADER */}

      <div className="mb-5">
        <h2
          className={[
            "font-bold text-[#0F172A]",
            device === "mobile"
              ? "text-base"
              : "text-lg",
          ].join(" ")}
        >
          Professional Information
        </h2>

        <p className="mt-1 text-xs text-[#64748B]">
          Experience, skills and services.
        </p>
      </div>

      {/* EXPERIENCE + RESPONSE */}

      <div
        className={[
          "grid",
          device === "mobile"
            ? "grid-cols-1 gap-3"
            : "grid-cols-2 gap-4",
        ].join(" ")}
      >
        <InputField
          label="Years of Experience"
          icon={Briefcase}
          value={experience}
          onChange={(value) =>
            setExperience(
              value.replace(/\D/g, "").slice(0, 2)
            )
          }
          placeholder="e.g. 5"
          type="number"
          device={device}
        />

        <InputField
          label="Response Time"
          icon={Clock3}
          value={responseTime}
          onChange={setResponseTime}
          placeholder="e.g. Within 30 minutes"
          device={device}
        />
      </div>

      {/* BIO */}

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
          Worker Bio
        </label>

        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#94A3B8]" />

          <textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value.slice(0, 500))
            }
            placeholder="Write a short description about the worker..."
            rows={device === "mobile" ? 3 : 4}
            className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <p className="mt-1 text-right text-[10px] text-[#94A3B8]">
          {bio.length}/500
        </p>
      </div>

      {/* SKILLS */}

      <TagInput
        title="Skills"
        icon={Wrench}
        placeholder="Add skill"
        values={skills}
        setValues={setSkills}
        device={device}
      />

      {/* SERVICES */}

      <TagInput
        title="Services"
        icon={Briefcase}
        placeholder="Add service"
        values={services}
        setValues={setServices}
        device={device}
      />

      {/* CERTIFICATIONS */}

      <TagInput
        title="Certifications"
        icon={Award}
        placeholder="Add certification"
        values={certifications}
        setValues={setCertifications}
        device={device}
      />
    </section>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  device,
}: {
  label: string;
  icon: typeof Briefcase;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  device: Device;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
        {label}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "w-full rounded-xl border border-[#E2E8F0]",
            "bg-white text-[#0F172A] outline-none",
            "placeholder:text-[#94A3B8]",
            "focus:border-[#FF5C39]",
            "focus:ring-2 focus:ring-orange-100",
            device === "mobile"
              ? "h-10 pl-9 pr-3 text-xs"
              : "h-11 pl-10 pr-3 text-sm",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/* =========================================================
   TAG INPUT
========================================================= */

function TagInput({
  title,
  icon: Icon,
  placeholder,
  values,
  setValues,
  device,
}: {
  title: string;
  icon: typeof Wrench;
  placeholder: string;
  values: string[];
  setValues: (values: string[]) => void;
  device: Device;
}) {
  const [input, setInput] = useState("");

  const addValue = () => {
    const value = input.trim();

    if (!value) return;

    if (
      values.some(
        (item) =>
          item.toLowerCase() === value.toLowerCase()
      )
    ) {
      setInput("");
      return;
    }

    setValues([...values, value]);
    setInput("");
  };

  const removeValue = (value: string) => {
    setValues(
      values.filter((item) => item !== value)
    );
  };

  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
        {title}
      </label>

      <div
        className={[
          "flex items-center rounded-xl border border-[#E2E8F0]",
          "bg-white focus-within:border-[#FF5C39]",
          "focus-within:ring-2 focus-within:ring-orange-100",
          device === "mobile"
            ? "min-h-10"
            : "min-h-11",
        ].join(" ")}
      >
        <Icon className="ml-3 h-4 w-4 shrink-0 text-[#94A3B8]" />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          placeholder={placeholder}
          className={[
            "min-w-0 flex-1 bg-transparent outline-none",
            "text-[#0F172A] placeholder:text-[#94A3B8]",
            device === "mobile"
              ? "px-2 text-xs"
              : "px-2 text-sm",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={addValue}
          className={[
            "mr-1.5 flex shrink-0 items-center justify-center",
            "rounded-lg bg-[#FF5C39] text-white",
            "active:scale-95",
            device === "mobile"
              ? "h-7 w-7"
              : "h-8 w-8",
          ].join(" ")}
        >
          <Plus
            size={device === "mobile" ? 14 : 16}
          />
        </button>
      </div>

      {/* SELECTED */}

      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className={[
                "flex items-center gap-1 rounded-lg",
                "bg-[#FFF1ED] font-semibold text-[#FF5C39]",
                device === "mobile"
                  ? "px-2 py-1 text-[10px]"
                  : "px-2.5 py-1.5 text-[11px]",
              ].join(" ")}
            >
              {value}

              <button
                type="button"
                onClick={() => removeValue(value)}
                className="rounded-full hover:bg-[#FFE0D8]"
              >
                <X
                  size={
                    device === "mobile"
                      ? 11
                      : 13
                  }
                />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}