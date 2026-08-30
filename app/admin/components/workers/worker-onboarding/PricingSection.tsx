"use client";

import {
  Check,
  IndianRupee,
} from "lucide-react";

import type {
  PricingType,
  PriceKey,
} from "@/app/data/workers";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

type Props = {
  pricingType: PricingType;

  setPricingType: (
    value: PricingType,
  ) => void;

  startingPrice: string;

  setStartingPrice: (
    value: string,
  ) => void;

  halfDayPrice: string;

  setHalfDayPrice: (
    value: string,
  ) => void;

  fullDayPrice: string;

  setFullDayPrice: (
    value: string,
  ) => void;

  monthlyPrice: string;

  setMonthlyPrice: (
    value: string,
  ) => void;

  visitCharge: string;

  setVisitCharge: (
    value: string,
  ) => void;

  visiblePricingTypes: PriceKey[];

  setVisiblePricingTypes: (
    values: PriceKey[],
  ) => void;

  handleVisiblePriceChange: (
    price: PriceKey,
    checked: boolean,
  ) => void;

  device: Device;
};

type PriceInputProps = {
  label: string;

  value: string;

  setValue: (
    value: string,
  ) => void;
};

/* =========================================
   VISIBLE PRICING OPTIONS
========================================= */

const options: {
  value: PriceKey;
  label: string;
}[] = [
  {
    value: "per_job",
    label: "Per Work",
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

/* =========================================
   PRICE INPUT
========================================= */

function PriceInput({
  label,
  value,
  setValue,
}: PriceInputProps) {
  const handleChange = (
    inputValue: string,
  ) => {
    let clean =
      inputValue.replace(
        /[^0-9.]/g,
        "",
      );

    const firstDot =
      clean.indexOf(".");

    if (firstDot !== -1) {
      clean =
        clean.slice(
          0,
          firstDot + 1,
        ) +
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
            handleChange(
              e.target.value,
            )
          }
          placeholder="0"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="done"
          className="h-10 w-full rounded-lg border border-[#E1E6ED] bg-[#F8FAFC] pl-7 pr-2 text-xs font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#FF8A5B] focus:bg-white focus:ring-1 focus:ring-[#FF8A5B]/20"
        />
      </div>
    </div>
  );
}

/* =========================================
   PRICING SECTION
========================================= */

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

  visiblePricingTypes,
  setVisiblePricingTypes,

  handleVisiblePriceChange,

  device,
}: Props) {
  const mobile =
    device === "mobile";

  const tablet =
    device === "tablet";

  /* =========================================
     CHECK VISIBILITY
  ========================================= */

  const isVisible = (
    type: PriceKey,
  ) =>
    visiblePricingTypes.includes(
      type,
    );

  /* =========================================
     HANDLE PRICING CHANGE
     
     Parent owns the state.
     We only pass:
       price
       checked
  ========================================= */

  const handlePricingToggle = (
    price: PriceKey,
  ) => {
    const checked =
      !visiblePricingTypes.includes(
        price,
      );

    handleVisiblePriceChange(
      price,
      checked,
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#F0E2DB] bg-white">
      {/* =========================================
          HEADER
      ========================================= */}

      <div
        className={
          mobile
            ? "border-b border-[#F3E8E2] px-4 py-3"
            : "border-b border-[#F3E8E2] px-5 py-4"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
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
              Choose which pricing options
              appear on the worker profile.
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-[#FFF3EE] px-2.5 py-1 text-[10px] font-bold text-[#FF7048]">
            {visiblePricingTypes.length}{" "}
            Selected
          </div>
        </div>
      </div>

      {/* =========================================
          CONTENT
      ========================================= */}

      <div
        className={
          mobile
            ? "p-3"
            : "px-5 py-4"
        }
      >
        {/* =========================================
            PRICING OPTIONS
        ========================================= */}

        <div
          className={[
            "grid gap-2",
            mobile
              ? "grid-cols-2"
              : tablet
                ? "grid-cols-3"
                : "grid-cols-4",
          ].join(" ")}
        >
          {options.map(
            (option) => {
              const selected =
                isVisible(
                  option.value,
                );

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() =>
                    handlePricingToggle(
                      option.value,
                    )
                  }
                  className={[
                    "flex min-h-10 items-center gap-2 rounded-xl border px-3 text-left transition-all",

                    selected
                      ? "border-[#FF8A5B] bg-[#FFF7F3]"
                      : "border-[#E7EBF0] bg-white hover:bg-[#F8FAFC]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all",

                      selected
                        ? "border-[#FF8A5B] bg-[#FF8A5B] text-white"
                        : "border-[#CBD5E1] bg-white",
                    ].join(" ")}
                  >
                    {selected && (
                      <Check
                        size={11}
                        strokeWidth={3}
                      />
                    )}
                  </span>

                  <span
                    className={[
                      "truncate text-[11px] font-semibold",

                      selected
                        ? "text-[#172033]"
                        : "text-[#64748B]",
                    ].join(" ")}
                  >
                    {option.label}
                  </span>
                </button>
              );
            },
          )}
        </div>

        {/* =========================================
            PRICE INPUTS
        ========================================= */}

        {visiblePricingTypes.length >
          0 && (
          <div
            className={[
              "mt-4 grid gap-x-2.5 gap-y-3",

              mobile
                ? "grid-cols-2"
                : tablet
                  ? "grid-cols-3"
                  : "grid-cols-4",
            ].join(" ")}
          >
            {/* PER WORK */}

            {isVisible(
              "per_job",
            ) && (
              <PriceInput
                label="Per Work"
                value={
                  startingPrice
                }
                setValue={
                  setStartingPrice
                }
              />
            )}

            {/* HALF DAY */}

            {isVisible(
              "half_day",
            ) && (
              <PriceInput
                label="Half Day"
                value={
                  halfDayPrice
                }
                setValue={
                  setHalfDayPrice
                }
              />
            )}

            {/* FULL DAY */}

            {isVisible(
              "full_day",
            ) && (
              <PriceInput
                label="Full Day"
                value={
                  fullDayPrice
                }
                setValue={
                  setFullDayPrice
                }
              />
            )}

            {/* MONTHLY */}

            {isVisible(
              "monthly",
            ) && (
              <PriceInput
                label="Monthly"
                value={
                  monthlyPrice
                }
                setValue={
                  setMonthlyPrice
                }
              />
            )}

            {/* VISIT CHARGE */}

            {isVisible(
              "visit_charge",
            ) && (
              <PriceInput
                label="Visit Charge"
                value={
                  visitCharge
                }
                setValue={
                  setVisitCharge
                }
              />
            )}
          </div>
        )}

        {/* =========================================
            EMPTY STATE
        ========================================= */}

        {visiblePricingTypes.length ===
          0 && (
          <div className="mt-3 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-center">
            <p className="text-xs font-semibold text-[#64748B]">
              Select at least one
              pricing option
            </p>

            <p className="mt-1 text-[10px] text-[#94A3B8]">
              Selected pricing will
              appear on the worker
              profile.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}