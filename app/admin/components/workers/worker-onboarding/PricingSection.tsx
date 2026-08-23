"use client";

import { IndianRupee, ChevronDown } from "lucide-react";

type Device = "desktop" | "tablet" | "mobile";

type PricingType =
  | "per_job"
  | "daily"
  | "half_day"
  | "full_day"
  | "monthly"
  | "visit_charge"
  | "custom";

type Props = {
  pricingType: PricingType;
  setPricingType: (value: PricingType) => void;

  startingPrice: string;
  setStartingPrice: (value: string) => void;

  halfDayPrice: string;
  setHalfDayPrice: (value: string) => void;

  fullDayPrice: string;
  setFullDayPrice: (value: string) => void;

  monthlyPrice: string;
  setMonthlyPrice: (value: string) => void;

  visitCharge: string;
  setVisitCharge: (value: string) => void;

  available: boolean;
  setAvailable: (value: boolean) => void;

  device: Device;
};

const options: {
  value: PricingType;
  label: string;
}[] = [
  {
    value: "custom",
    label: "Custom",
  },
  {
    value: "per_job",
    label: "Per Job",
  },
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "half_day",
    label: "Half Day",
  },
  {
    value: "full_day",
    label: "Full Day",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "visit_charge",
    label: "Visit Charge",
  },
];

export default function PricingSection({
  pricingType,
  setPricingType,

  startingPrice,
  setStartingPrice,

  halfDayPrice,
  setHalfDayPrice,

  fullDayPrice,
  setFullDayPrice,

  monthlyPrice,
  setMonthlyPrice,

  visitCharge,
  setVisitCharge,

  device,
}: Props) {
  const mobile = device === "mobile";
  const tablet = device === "tablet";

  /*
   * IMPORTANT:
   * Do not call scrollIntoView() from input onFocus.
   *
   * Android Capacitor/WebView can repeatedly recalculate the
   * viewport when keyboard opens, causing:
   *
   * keyboard open -> scroll -> layout change -> focus change
   * -> keyboard close -> keyboard open
   *
   * The Capacitor Keyboard listener in WorkerOnboardSections
   * handles the keyboard viewport globally.
   */

  const PriceInput = ({
    label,
    value,
    setValue,
  }: {
    label: string;
    value: string;
    setValue: (value: string) => void;
  }) => {
    const handleChange = (inputValue: string) => {
      /*
       * Allow only:
       * 0-9
       * one decimal point
       */
      let clean = inputValue.replace(/[^0-9.]/g, "");

      const firstDot = clean.indexOf(".");

      if (firstDot !== -1) {
        clean =
          clean.slice(0, firstDot + 1) +
          clean
            .slice(firstDot + 1)
            .replace(/\./g, "");
      }

      setValue(clean);
    };

    return (
      <div className="min-w-0">
        <label className="mb-1 block truncate text-[11px] font-semibold text-[#5F6F8A]">
          {label}
        </label>

        <div className="relative">
          <IndianRupee
            size={12}
            strokeWidth={2}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />

          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) =>
              handleChange(e.target.value)
            }
            placeholder="0"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="done"
            className={[
              "h-10 w-full",
              "rounded-lg",
              "border border-[#E1E6ED]",
              "bg-[#F8FAFC]",
              "pl-7 pr-2",
              "text-xs font-semibold text-[#111827]",
              "outline-none",
              "transition-colors",
              "placeholder:text-[#94A3B8]",
              "focus:border-[#FF8A5B]",
              "focus:bg-white",
              "focus:ring-1",
              "focus:ring-[#FF8A5B]/20",
            ].join(" ")}
          />
        </div>
      </div>
    );
  };

  return (
    <section
      className={[
        "overflow-hidden",
        "rounded-2xl",
        "border border-[#F0E2DB]",
        "bg-white",
      ].join(" ")}
    >
      {/* =========================
          HEADER
      ========================= */}

      <div
        className={
          mobile
            ? "border-b border-[#F3E8E2] px-4 py-3"
            : "border-b border-[#F3E8E2] px-5 py-4"
        }
      >
        <h2
          className={
            mobile
              ? "text-base font-bold text-[#172033]"
              : "text-[17px] font-bold text-[#172033]"
          }
        >
          Pricing
        </h2>

        <p className="mt-0.5 text-[11px] text-[#68768A]">
          Set the worker&apos;s marketplace pricing.
        </p>
      </div>

      {/* =========================
          BODY
      ========================= */}

      <div
        className={
          mobile
            ? "p-3"
            : "px-5 py-4"
        }
      >
        {/* =========================
            PRICING TYPE
        ========================= */}

        <div className="relative">
          <select
            value={pricingType}
            onChange={(e) =>
              setPricingType(
                e.target.value as PricingType,
              )
            }
            className={[
              "h-10 w-full",
              "appearance-none",
              "rounded-lg",
              "border border-[#F2B39A]",
              "bg-[#FFF9F6]",
              "px-3 pr-8",
              "text-xs font-semibold",
              "text-[#111827]",
              "outline-none",
              "focus:border-[#FF8A5B]",
              "focus:ring-1",
              "focus:ring-[#FF8A5B]/20",
            ].join(" ")}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A98AA]"
          />
        </div>

        {/* =========================
            PRICE FIELDS
        ========================= */}

        <div
          className={[
            "mt-3 grid",
            "gap-x-2.5",
            "gap-y-3",

            mobile
              ? "grid-cols-2"
              : tablet
                ? "grid-cols-3"
                : "grid-cols-5",
          ].join(" ")}
        >
          <PriceInput
            label="Starting Price"
            value={startingPrice}
            setValue={setStartingPrice}
          />

          <PriceInput
            label="Half Day"
            value={halfDayPrice}
            setValue={setHalfDayPrice}
          />

          <PriceInput
            label="Full Day"
            value={fullDayPrice}
            setValue={setFullDayPrice}
          />

          <PriceInput
            label="Monthly"
            value={monthlyPrice}
            setValue={setMonthlyPrice}
          />

          <PriceInput
            label="Visit Charge"
            value={visitCharge}
            setValue={setVisitCharge}
          />
        </div>
      </div>
    </section>
  );
}