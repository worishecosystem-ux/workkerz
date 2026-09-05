"use client";

import {
  ChevronDown,
  MapPin,
  MapPinned,
} from "lucide-react";

interface RequestStep3Props {
  requestLocation: string;
  setRequestLocation: (value: string) => void;

  fullAddress: string;
  setFullAddress: (value: string) => void;

  locality: string;
  setLocality: (value: string) => void;

  state: string;
  setState: (value: string) => void;

  district: string;
  setDistrict: (value: string) => void;

  pincode: string;
  setPincode: (value: string) => void;

  onNext: () => void;
  onBack: () => void;
}

const cities = [
  "Bhopal",
  "Gwalior",
  "Indore",
  "Jabalpur",
  "Bilaspur",
  "Raipur",
  "Other",
];

const states = [
  "Madhya Pradesh",
  "Chhattisgarh",
  "Rajasthan",
  "Maharashtra",
  "Uttar Pradesh",
  "Other",
];

const districtsByState: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Bhopal",
    "Gwalior",
    "Indore",
    "Jabalpur",
    "Ujjain",
    "Sagar",
    "Other",
  ],

  Chhattisgarh: [
    "Bilaspur",
    "Raipur",
    "Durg",
    "Korba",
    "Rajnandgaon",
    "Other",
  ],

  Rajasthan: [
    "Jaipur",
    "Kota",
    "Udaipur",
    "Jodhpur",
    "Other",
  ],

  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Other",
  ],

  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Other",
  ],

  Other: ["Other"],
};

export default function RequestStep3({
  requestLocation,
  setRequestLocation,
  fullAddress,
  setFullAddress,
  locality,
  setLocality,
  state,
  setState,
  district,
  setDistrict,
  pincode,
  setPincode,
  onNext,
  onBack,
}: RequestStep3Props) {
  const districts = districtsByState[state] || [];

  function handleStateChange(value: string) {
    setState(value);
    setDistrict("");
  }

  function handleNext() {
    if (!requestLocation) return;
    if (!fullAddress.trim()) return;
    if (!locality.trim()) return;
    if (!state) return;
    if (!district) return;
    if (pincode.length !== 6) return;

    onNext();
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
      {/* HEADER */}

      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <MapPinned className="h-4 w-4" />
          </div>

          <div className="min-w-0">
           
            <h1 className="mt-0.5 text-[14px] font-black tracking-tight text-gray-950">
              Work Address
            </h1>

            <p className="mt-0.5 text-[9px] leading-3 text-gray-500">
              Where do you need the workers?
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}

      <div className="space-y-4 p-3 sm:p-3.5">
        {/* CITY */}

        <div>
          <FieldLabel
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Work City"
            required
          />

          <SelectBox
            value={requestLocation}
            onChange={setRequestLocation}
            placeholder="Select work city"
            options={cities}
          />
        </div>

        {/* FULL ADDRESS */}

        <div>
          <FieldLabel
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Full Work Address"
            required
          />

          <textarea
            value={fullAddress}
            onChange={(event) =>
              setFullAddress(event.target.value)
            }
            rows={2}
            placeholder="House no., street, building, landmark..."
            className="mt-1 min-h-[60px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        {/* LOCALITY */}

        <div>
          <FieldLabel
            label="Area / Locality"
            required
          />

          <input
            value={locality}
            onChange={(event) =>
              setLocality(event.target.value)
            }
            placeholder="e.g. Kolar Road"
            className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        {/* STATE + DISTRICT */}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel
              label="State"
              required
            />

            <SelectBox
              value={state}
              onChange={handleStateChange}
              placeholder="Select state"
              options={states}
            />
          </div>

          <div>
            <FieldLabel
              label="District"
              required
            />

            <SelectBox
              value={district}
              onChange={setDistrict}
              placeholder={
                state
                  ? "Select district"
                  : "Select state first"
              }
              options={districts}
              disabled={!state}
            />
          </div>
        </div>

        {/* PINCODE */}

        <div>
          <FieldLabel
            label="Pincode"
            required
          />

          <input
            value={pincode}
            onChange={(event) =>
              setPincode(
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6),
              )
            }
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit pincode"
            className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium tracking-wide text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        {/* ADDRESS PREVIEW */}

        {(requestLocation ||
          locality ||
          fullAddress) && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
            <div className="flex gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wide text-emerald-600">
                  Work Location
                </p>

                <p className="mt-0.5 line-clamp-2 text-[9px] font-semibold leading-3.5 text-gray-700">
                  {[
                    fullAddress,
                    locality,
                    district,
                    state,
                    requestLocation,
                    pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="border-t border-gray-100 px-4 py-2 sm:px-5">
        <p className="text-center text-[9px] font-medium text-gray-400">
          Enter the exact location where workers will report.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  icon,
  label,
  required,
}: {
  icon?: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-1 text-[10px] font-bold text-gray-700">
      {icon && (
        <span className="text-emerald-600">
          {icon}
        </span>
      )}

      {label}

      {required && (
        <span className="text-red-500">
          *
        </span>
      )}
    </label>
  );
}

/* =========================================================
   SELECT BOX
========================================================= */

function SelectBox({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative mt-1">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 pr-8 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
    </div>
  );
}