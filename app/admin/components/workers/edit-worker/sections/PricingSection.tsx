"use client";

import { IndianRupee } from "lucide-react";
import type { Worker, PriceKey } from "@/app/data/workers";
import PriceInputField from "../fields/PriceInputField";
import PricingTypeField from "../fields/PricingTypeField";

type PricingSectionProps = {
  pricingType: Worker["pricingType"];

  startingPrice: string;
  halfDayPrice: string;
  fullDayPrice: string;
  monthlyPrice: string;
  visitCharge: string;

  visiblePricingTypes: PriceKey[];

  displayService: PriceKey | null;

  setPricingType: (
    value: Worker["pricingType"],
  ) => void;

  setStartingPrice: (
    value: string,
  ) => void;

  setHalfDayPrice: (
    value: string,
  ) => void;

  setFullDayPrice: (
    value: string,
  ) => void;

  setMonthlyPrice: (
    value: string,
  ) => void;

  setVisitCharge: (
    value: string,
  ) => void;

  setVisiblePricingTypes: React.Dispatch<
    React.SetStateAction<PriceKey[]>
  >;

  setDisplayService: (
    value: PriceKey | null,
  ) => void;
};

const PRICING_OPTIONS: Array<
  [PriceKey, string]
> = [
  ["per_job", "Per Work"],
  ["half_day", "Half Day"],
  ["full_day", "Full Day"],
  ["monthly", "Monthly"],
  ["visit_charge", "Visit"],
];

export default function PricingSection({
  pricingType,
  startingPrice,
  halfDayPrice,
  fullDayPrice,
  monthlyPrice,
  visitCharge,
  visiblePricingTypes,
  displayService,
  setPricingType,
  setStartingPrice,
  setHalfDayPrice,
  setFullDayPrice,
  setMonthlyPrice,
  setVisitCharge,
  setVisiblePricingTypes,
  setDisplayService,
}: PricingSectionProps) {
  /* =====================================================
     PRICE MAP
  ===================================================== */

  const priceMap: Record<PriceKey, number> = {
    per_job: Number(startingPrice || 0),
    half_day: Number(halfDayPrice || 0),
    full_day: Number(fullDayPrice || 0),
    monthly: Number(monthlyPrice || 0),
    visit_charge: Number(visitCharge || 0),
  };

  /* =====================================================
     TOGGLE VISIBLE PRICING
  ===================================================== */

  const togglePricingType = (
    id: PriceKey,
  ) => {
    setVisiblePricingTypes((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id,
          )
        : [...current, id],
    );
  };

  /* =====================================================
     PRICE CHANGE
  ===================================================== */

  const handlePriceChange = (
    id: PriceKey,
    value: string,
  ) => {
    switch (id) {
      case "per_job":
        setStartingPrice(value);
        break;

      case "half_day":
        setHalfDayPrice(value);
        break;

      case "full_day":
        setFullDayPrice(value);
        break;

      case "monthly":
        setMonthlyPrice(value);
        break;

      case "visit_charge":
        setVisitCharge(value);
        break;
    }

    /*
     * If selected Display Charge price becomes 0,
     * remove Display Charge selection.
     */

    if (
      displayService === id &&
      Number(value || 0) <= 0
    ) {
      setDisplayService(null);
    }
  };

  /* =====================================================
     FILLED PRICES
  ===================================================== */

  const filledPricingOptions =
    PRICING_OPTIONS.filter(
      ([id]) =>
        Number.isFinite(priceMap[id]) &&
        priceMap[id] > 0,
    );

  /* =====================================================
     DISPLAY SUFFIX
  ===================================================== */

  const getDisplaySuffix = (
    id: PriceKey,
  ) => {
    switch (id) {
      case "per_job":
        return "per work";

      case "half_day":
        return "half day";

      case "full_day":
        return "full day";

      case "monthly":
        return "per month";

      case "visit_charge":
        return "per visit";

      default:
        return "";
    }
  };

  /* =====================================================
     DISPLAY LABEL
  ===================================================== */

  const getDisplayLabel = (
    id: PriceKey,
  ) => {
    const option =
      PRICING_OPTIONS.find(
        ([optionId]) =>
          optionId === id,
      );

    return option?.[1] ?? id;
  };

  return (
    <section>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <IndianRupee className="h-3.5 w-3.5 text-[#FF5C39]" />
        </div>

        <h3 className="text-sm font-bold text-[#0F172A] sm:text-base">
          Pricing
        </h3>
      </div>

      {/* =================================================
          PRICING INPUTS
      ================================================= */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">

        <div className="col-span-2 sm:col-span-1">
          <PricingTypeField
            value={pricingType}
            onChange={setPricingType}
          />
        </div>

        <PriceInputField
          label="Starting Price"
          value={startingPrice}
          onChange={(value) =>
            handlePriceChange(
              "per_job",
              value,
            )
          }
        />

        <PriceInputField
          label="Half Day Price"
          value={halfDayPrice}
          onChange={(value) =>
            handlePriceChange(
              "half_day",
              value,
            )
          }
        />

        <PriceInputField
          label="Full Day Price"
          value={fullDayPrice}
          onChange={(value) =>
            handlePriceChange(
              "full_day",
              value,
            )
          }
        />

        <PriceInputField
          label="Monthly Price"
          value={monthlyPrice}
          onChange={(value) =>
            handlePriceChange(
              "monthly",
              value,
            )
          }
        />

        <PriceInputField
          label="Visit Charge"
          value={visitCharge}
          onChange={(value) =>
            handlePriceChange(
              "visit_charge",
              value,
            )
          }
        />

        {/* =================================================
            DISPLAY CHARGE
        ================================================= */}

        <div className="col-span-2 rounded-xl border border-blue-200 bg-blue-50/50 p-3 lg:col-span-3">

          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#0F172A]">
                Display Charge
              </p>

              <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
                Select one price to display on
                the worker profile.
              </p>
            </div>

            {displayService && (
              <span className="shrink-0 rounded-full bg-blue-600 px-2 py-1 text-[9px] font-bold uppercase text-white">
                Selected
              </span>
            )}
          </div>

          {filledPricingOptions.length ===
          0 ? (
            <div className="rounded-lg border border-dashed border-blue-200 bg-white px-3 py-4 text-center">
              <p className="text-xs font-semibold text-[#64748B]">
                No pricing available
              </p>

              <p className="mt-1 text-[10px] text-[#94A3B8]">
                Enter a price above first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {filledPricingOptions.map(
                ([id, label]) => {
                  const selected =
                    displayService === id;

                  const price =
                    priceMap[id];

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setDisplayService(
                          id,
                        )
                      }
                      className={[
                        "flex min-h-[72px] flex-col justify-between rounded-lg border p-3 text-left transition active:scale-[0.98]",
                        selected
                          ? "border-blue-500 bg-blue-600 text-white ring-1 ring-blue-500"
                          : "border-gray-200 bg-white text-[#0F172A] hover:border-blue-300 hover:bg-blue-50",
                      ].join(" ")}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span
                          className={[
                            "text-[11px] font-bold",
                            selected
                              ? "text-white"
                              : "text-[#334155]",
                          ].join(" ")}
                        >
                          {label}
                        </span>

                        <span
                          className={[
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold",
                            selected
                              ? "border-white bg-white text-blue-600"
                              : "border-gray-300 bg-white text-transparent",
                          ].join(" ")}
                        >
                          ✓
                        </span>
                      </div>

                      <div className="mt-2">
                        <p
                          className={[
                            "text-sm font-extrabold",
                            selected
                              ? "text-white"
                              : "text-[#0F172A]",
                          ].join(" ")}
                        >
                          ₹
                          {price.toLocaleString(
                            "en-IN",
                          )}
                        </p>

                        <p
                          className={[
                            "mt-0.5 text-[9px]",
                            selected
                              ? "text-blue-100"
                              : "text-[#94A3B8]",
                          ].join(" ")}
                        >
                          {getDisplaySuffix(
                            id,
                          )}
                        </p>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}

          {/* =================================================
              SELECTED DISPLAY CHARGE
          ================================================= */}

          {displayService &&
            priceMap[
              displayService
            ] > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-blue-600 px-3 py-2.5 text-white">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-100">
                    Profile Display
                  </p>

                  <p className="text-xs font-bold">
                    {getDisplayLabel(
                      displayService,
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-extrabold">
                    ₹
                    {priceMap[
                      displayService
                    ].toLocaleString(
                      "en-IN",
                    )}
                  </p>

                  <p className="text-[9px] text-blue-100">
                    {getDisplaySuffix(
                      displayService,
                    )}
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* =================================================
            VISIBLE PRICING
        ================================================= */}

        <div className="col-span-2 rounded-xl border border-gray-200 bg-[#F8FAFC] p-3 lg:col-span-3">
          <p className="mb-2 text-xs font-bold text-[#0F172A]">
            Show on Profile
          </p>

          <p className="mb-3 text-[10px] text-[#64748B]">
            Choose which pricing options are
            visible on the profile.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PRICING_OPTIONS.map(
              ([id, label]) => {
                const checked =
                  visiblePricingTypes.includes(
                    id,
                  );

                const price =
                  priceMap[id];

                const hasPrice =
                  Number.isFinite(price) &&
                  price > 0;

                return (
                  <label
                    key={id}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition",
                      checked
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-200 bg-white",
                      !hasPrice
                        ? "opacity-50"
                        : "",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        togglePricingType(
                          id,
                        )
                      }
                      className="accent-[#FF5C39]"
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {label}
                    </span>
                  </label>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}