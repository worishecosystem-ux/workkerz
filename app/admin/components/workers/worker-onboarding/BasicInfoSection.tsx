"use client";

import {
  BriefcaseBusiness,
  MapPin,
  Phone,
  User,
} from "lucide-react";

type Props = {
  name: string;
  phone: string;
  specialty: string;
  location: string;
  labourChauk: string;

  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setSpecialty: (value: string) => void;
  setLocation: (value: string) => void;
  setLabourChauk: (value: string) => void;

  device: "desktop" | "tablet" | "mobile";
};

export default function BasicInfoSection(props: Props) {
  const {
    name,
    phone,
    specialty,
    location,
    labourChauk,
    setName,
    setPhone,
    setSpecialty,
    setLocation,
    setLabourChauk,
    device,
  } = props;

  if (device === "desktop") {
    return (
      <DesktopBasic
        {...props}
      />
    );
  }

  if (device === "tablet") {
    return (
      <TabletBasic
        {...props}
      />
    );
  }

  return (
    <MobileBasic
      {...props}
    />
  );
}

/* =========================
   DESKTOP
========================= */

function DesktopBasic({
  name,
  phone,
  specialty,
  location,
  labourChauk,
  setName,
  setPhone,
  setSpecialty,
  setLocation,
  setLabourChauk,
}: Props) {
  return (
    <Section
      title="Basic Information"
      subtitle="Worker identity and contact details."
      className="p-5"
    >
      <div className="grid grid-cols-3 gap-4">
        <Field
          label="Worker Name"
          icon={User}
          value={name}
          onChange={setName}
          placeholder="Enter worker name"
          required
        />

        <Field
          label="Phone Number"
          icon={Phone}
          value={phone}
          onChange={(v) =>
            setPhone(v.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Enter mobile number"
          type="tel"
          required
        />

        <Field
          label="Specialty"
          icon={BriefcaseBusiness}
          value={specialty}
          onChange={setSpecialty}
          placeholder="e.g. Brick Mason"
          required
        />

        <Field
          label="Location"
          icon={MapPin}
          value={location}
          onChange={setLocation}
          placeholder="e.g. Gwalior"
          required
        />

        <Field
          label="Labour Chauk"
          icon={MapPin}
          value={labourChauk}
          onChange={setLabourChauk}
          placeholder="e.g. Thatipur Labour Chauk"
        />
      </div>
    </Section>
  );
}

/* =========================
   TABLET
========================= */

function TabletBasic({
  name,
  phone,
  specialty,
  location,
  labourChauk,
  setName,
  setPhone,
  setSpecialty,
  setLocation,
  setLabourChauk,
}: Props) {
  return (
    <Section
      title="Basic Information"
      subtitle="Worker identity and contact details."
      className="p-6"
    >
      <div className="grid grid-cols-2 gap-5">
        <Field
          label="Worker Name"
          icon={User}
          value={name}
          onChange={setName}
          placeholder="Enter worker name"
          required
          large
        />

        <Field
          label="Phone Number"
          icon={Phone}
          value={phone}
          onChange={(v) =>
            setPhone(v.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Enter mobile number"
          type="tel"
          required
          large
        />

        <Field
          label="Specialty"
          icon={BriefcaseBusiness}
          value={specialty}
          onChange={setSpecialty}
          placeholder="e.g. Brick Mason"
          required
          large
        />

        <Field
          label="Location"
          icon={MapPin}
          value={location}
          onChange={setLocation}
          placeholder="e.g. Gwalior"
          required
          large
        />

        <Field
          label="Labour Chauk"
          icon={MapPin}
          value={labourChauk}
          onChange={setLabourChauk}
          placeholder="e.g. Thatipur Labour Chauk"
          large
        />
      </div>
    </Section>
  );
}

/* =========================
   MOBILE
========================= */

function MobileBasic({
  name,
  phone,
  specialty,
  location,
  labourChauk,
  setName,
  setPhone,
  setSpecialty,
  setLocation,
  setLabourChauk,
}: Props) {
  return (
    <Section
      title="Basic Information"
      subtitle="Worker identity and contact details."
      className="p-3"
    >
      <div className="space-y-3">
        <Field
          label="Worker Name"
          icon={User}
          value={name}
          onChange={setName}
          placeholder="Enter worker name"
          required
          small
        />

        <Field
          label="Phone Number"
          icon={Phone}
          value={phone}
          onChange={(v) =>
            setPhone(v.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Enter mobile number"
          type="tel"
          required
          small
        />

        <Field
          label="Specialty"
          icon={BriefcaseBusiness}
          value={specialty}
          onChange={setSpecialty}
          placeholder="e.g. Brick Mason"
          required
          small
        />

        <Field
          label="Location"
          icon={MapPin}
          value={location}
          onChange={setLocation}
          placeholder="e.g. Gwalior"
          required
          small
        />

        <Field
          label="Labour Chauk"
          icon={MapPin}
          value={labourChauk}
          onChange={setLabourChauk}
          placeholder="e.g. Thatipur Labour Chauk"
          small
        />
      </div>
    </Section>
  );
}

/* =========================
   SHARED SECTION
========================= */

function Section({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#E2E8F0] bg-white ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#0F172A]">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-[#64748B]">
          {subtitle}
        </p>
      </div>

      {children}
    </section>
  );
}

/* =========================
   SHARED FIELD
========================= */

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  large = false,
  small = false,
}: {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  large?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <label
        className={`mb-1.5 block font-semibold text-[#334155] ${
          small ? "text-[11px]" : "text-xs"
        }`}
      >
        {label}

        {required && (
          <span className="ml-1 text-[#FF5C39]">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <Icon
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] ${
            small ? "h-3.5 w-3.5" : "h-4 w-4"
          }`}
        />

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 ${
            large
              ? "h-12 pl-11 pr-4 text-sm"
              : small
                ? "h-10 pl-9 pr-3 text-xs"
                : "h-11 pl-10 pr-3 text-sm"
          }`}
        />
      </div>
    </div>
  );
}