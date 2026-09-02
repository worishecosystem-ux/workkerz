"use client";

import { useEffect } from "react";

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

  displayService: PriceKey | null;

  setDisplayService: (
    value: PriceKey | null,
  ) => void;

  device: Device;
};

type PricingOption = {
  key: PriceKey;
  label: string;
  price: number;
  suffix: string;
};

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
  handleVisiblePriceChange,

  displayService,
  setDisplayService,

  device,
}: Props) {
  const isMobile =
    device === "mobile";

  /* =====================================================
     PRICING TYPE OPTIONS
  ===================================================== */

  const pricingOptions: {
    key: PricingType;
    label: string;
    description: string;
  }[] = [
    {
      key: "custom",
      label: "Custom",
      description:
        "Use your own pricing structure",
    },
    {
      key: "per_job",
      label: "Per Work",
      description:
        "Charge for each work",
    },
    {
      key: "daily",
      label: "Daily",
      description:
        "Charge for a full day",
    },
    {
      key: "monthly",
      label: "Monthly",
      description:
        "Monthly worker pricing",
    },
    {
      key: "per_service",
      label: "Per Service",
      description:
        "Charge according to service",
    },
    {
      key: "visit_charge",
      label: "Visit Charge",
      description:
        "Charge for worker visit",
    },
  ];

  /* =====================================================
     ALL DISPLAY CHARGE OPTIONS

     IMPORTANT:
     key is explicitly PriceKey.
  ===================================================== */

  const allDisplayChargeOptions: PricingOption[] = [
    {
      key: "per_job",
      label: "Starting Price",
      price: Number(
        startingPrice || 0,
      ),
      suffix: "per work",
    },
    {
      key: "half_day",
      label: "Half Day",
      price: Number(
        halfDayPrice || 0,
      ),
      suffix: "half day",
    },
    {
      key: "full_day",
      label: "Full Day",
      price: Number(
        fullDayPrice || 0,
      ),
      suffix: "full day",
    },
    {
      key: "monthly",
      label: "Monthly",
      price: Number(
        monthlyPrice || 0,
      ),
      suffix: "per month",
    },
    {
      key: "visit_charge",
      label: "Visit Charge",
      price: Number(
        visitCharge || 0,
      ),
      suffix: "per visit",
    },
  ];

  /* =====================================================
     ONLY FILLED PRICING OPTIONS

     This is the important fix.

     No `.filter()` outside an expression.
  ===================================================== */

  const displayChargeOptions =
    allDisplayChargeOptions.filter(
      (item) =>
        Number.isFinite(
          item.price,
        ) &&
        item.price > 0,
    );

  /* =====================================================
     CLEAR INVALID DISPLAY CHARGE

     If selected price is removed,
     clear displayService.
  ===================================================== */

  useEffect(() => {
    if (!displayService) {
      return;
    }

    const selectedOption =
      displayChargeOptions.find(
        (option) =>
          option.key ===
          displayService,
      );

    if (!selectedOption) {
      setDisplayService(null);

      console.log(
        "DISPLAY CHARGE CLEARED:",
        displayService,
      );
    }
  }, [
    displayService,
    startingPrice,
    halfDayPrice,
    fullDayPrice,
    monthlyPrice,
    visitCharge,
    setDisplayService,
  ]);

  /* =====================================================
     SELECTED DISPLAY OPTION
  ===================================================== */

  const selectedDisplayOption =
    displayChargeOptions.find(
      (option) =>
        option.key ===
        displayService,
    );

  /* =====================================================
     NUMBER INPUT CLEANER
  ===================================================== */

  const cleanNumberInput = (
    value: string,
  ) => {
    const cleaned =
      value.replace(
        /[^\d.]/g,
        "",
      );

    const firstDot =
      cleaned.indexOf(".");

    if (firstDot === -1) {
      return cleaned;
    }

    return (
      cleaned.slice(
        0,
        firstDot + 1,
      ) +
      cleaned
        .slice(firstDot + 1)
        .replace(/\./g, "")
    );
  };

  /* =====================================================
     PRICE INPUT
  ===================================================== */

  const renderPriceInput = ({
    label,
    value,
    setValue,
    placeholder,
    description,
  }: {
    label: string;
    value: string;
    setValue: (
      value: string,
    ) => void;
    placeholder: string;
    description: string;
  }) => {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
        <div className="mb-2">
          <p className="text-xs font-bold text-[#0F172A]">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] leading-4 text-[#64748B]">
            {description}
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100">
          <span className="mr-2 text-sm font-bold text-[#64748B]">
            ₹
          </span>

          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(event) =>
              setValue(
                cleanNumberInput(
                  event.target.value,
                ),
              )
            }
            placeholder={
              placeholder
            }
            className="h-10 w-full bg-transparent text-sm font-bold text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
          />
        </div>
      </div>
    );
  };

  return (
    <section
      className={[
        "rounded-2xl border border-[#E2E8F0]",
        "bg-white shadow-sm",
        isMobile
          ? "p-3"
          : "p-5",
      ].join(" ")}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-5">
        <h2
          className={[
            "font-bold text-[#0F172A]",
            isMobile
              ? "text-base"
              : "text-lg",
          ].join(" ")}
        >
          Pricing
        </h2>

        <p className="mt-1 text-xs text-[#64748B]">
          Set worker pricing and choose
          the charge shown on the profile.
        </p>
      </div>

      {/* =================================================
          PRICING TYPE
      ================================================= */}

      <div className="mb-5">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#0F172A]">
            Pricing Type
          </h3>

          <p className="mt-0.5 text-[10px] text-[#64748B]">
            Select the worker pricing model.
          </p>
        </div>

        <div
          className={[
            "grid gap-2",
            device === "mobile"
              ? "grid-cols-1"
              : device === "tablet"
                ? "grid-cols-2"
                : "grid-cols-3",
          ].join(" ")}
        >
          {pricingOptions.map(
            (option) => {
              const selected =
                pricingType ===
                option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    setPricingType(
                      option.key,
                    )
                  }
                  className={[
                    "rounded-xl border p-3 text-left transition active:scale-[0.99]",
                    selected
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-[#E2E8F0] bg-white hover:border-blue-200",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={[
                        "text-xs font-bold",
                        selected
                          ? "text-blue-700"
                          : "text-[#334155]",
                      ].join(" ")}
                    >
                      {
                        option.label
                      }
                    </span>

                    <span
                      className={[
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-[#CBD5E1] bg-white text-transparent",
                      ].join(" ")}
                    >
                      ✓
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
                    {
                      option.description
                    }
                  </p>
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* =================================================
          PRICE DETAILS
      ================================================= */}

      <div className="mb-5">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#0F172A]">
            Price Details
          </h3>

          <p className="mt-0.5 text-[10px] leading-4 text-[#64748B]">
            Fill the pricing options applicable
            to this worker.
          </p>
        </div>

        <div
          className={[
            "grid gap-3",
            device === "mobile"
              ? "grid-cols-1"
              : "grid-cols-2",
          ].join(" ")}
        >
          {renderPriceInput({
            label: "Starting Price",
            value: startingPrice,
            setValue:
              setStartingPrice,
            placeholder: "300",
            description:
              "Starting charge per work",
          })}

          {renderPriceInput({
            label: "Half Day Price",
            value: halfDayPrice,
            setValue:
              setHalfDayPrice,
            placeholder: "600",
            description:
              "Charge for half day",
          })}

          {renderPriceInput({
            label: "Full Day Price",
            value: fullDayPrice,
            setValue:
              setFullDayPrice,
            placeholder: "1000",
            description:
              "Charge for full day",
          })}

          {renderPriceInput({
            label: "Monthly Price",
            value: monthlyPrice,
            setValue:
              setMonthlyPrice,
            placeholder: "15000",
            description:
              "Monthly worker charge",
          })}

          {renderPriceInput({
            label: "Visit Charge",
            value: visitCharge,
            setValue:
              setVisitCharge,
            placeholder: "200",
            description:
              "Charge for worker visit",
          })}
        </div>
      </div>

      {/* =================================================
          DISPLAY CHARGE
      ================================================= */}

      <div className="mb-5 rounded-2xl border border-[#BFDBFE] bg-[#F8FAFF] p-3 sm:p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Display Charge
              </h3>

              <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
                Select one filled pricing option
                to show as the primary charge on
                the worker profile.
              </p>
            </div>

            {selectedDisplayOption && (
              <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                Selected
              </span>
            )}
          </div>
        </div>

        {displayChargeOptions.length ===
        0 ? (
          <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-5 text-center">
            <p className="text-xs font-semibold text-[#64748B]">
              Enter at least one price above
            </p>

            <p className="mt-1 text-[10px] text-[#94A3B8]">
              Filled pricing options will appear
              here.
            </p>
          </div>
        ) : (
          <div
            className={[
              "grid gap-2",
              device === "mobile"
                ? "grid-cols-1"
                : "grid-cols-2",
            ].join(" ")}
          >
            {displayChargeOptions.map(
              (option) => {
                const selected =
                  displayService ===
                  option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() =>
                      setDisplayService(
                        option.key,
                      )
                    }
                    className={[
                      "flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition active:scale-[0.99]",
                      selected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-[#E2E8F0] bg-white hover:border-blue-200 hover:bg-blue-50/30",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <p
                        className={[
                          "text-xs font-bold",
                          selected
                            ? "text-blue-700"
                            : "text-[#334155]",
                        ].join(" ")}
                      >
                        {
                          option.label
                        }
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#64748B]">
                        {
                          option.suffix
                        }
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-extrabold text-[#0F172A]">
                        ₹
                        {option.price.toLocaleString(
                          "en-IN",
                        )}
                      </span>

                      <span
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold",
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-[#CBD5E1] bg-white text-transparent",
                        ].join(" ")}
                      >
                        ✓
                      </span>
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

        {selectedDisplayOption && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-600 px-3 py-2.5 text-white">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-100">
                Profile will show
              </p>

              <p className="mt-0.5 truncate text-xs font-bold">
                {
                  selectedDisplayOption.label
                }
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-extrabold">
                ₹
                {selectedDisplayOption.price.toLocaleString(
                  "en-IN",
                )}
              </p>

              <p className="text-[9px] text-blue-100">
                {
                  selectedDisplayOption.suffix
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          VISIBLE PRICING
      ================================================= */}

      <div>
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#0F172A]">
            Visible Pricing
          </h3>

          <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
            Choose which pricing options can be
            shown elsewhere. This is separate
            from Display Charge.
          </p>
        </div>

        <div className="space-y-2">
          {(
            [
              {
                key: "per_job",
                label: "Starting Price",
              },
              {
                key: "half_day",
                label: "Half Day",
              },
              {
                key: "full_day",
                label: "Full Day",
              },
              {
                key: "monthly",
                label: "Monthly",
              },
              {
                key: "visit_charge",
                label: "Visit Charge",
              },
            ] satisfies {
              key: PriceKey;
              label: string;
            }[]
          ).map(
            (option) => {
              const checked =
                visiblePricingTypes.includes(
                  option.key,
                );

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    handleVisiblePriceChange(
                      option.key,
                      !checked,
                    )
                  }
                  className={[
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition",
                    checked
                      ? "border-[#A7F3D0] bg-[#ECFDF5]"
                      : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-xs font-semibold",
                      checked
                        ? "text-[#047857]"
                        : "text-[#475569]",
                    ].join(" ")}
                  >
                    {
                      option.label
                    }
                  </span>

                  <span
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold",
                      checked
                        ? "border-[#10B981] bg-[#10B981] text-white"
                        : "border-[#CBD5E1] bg-white text-transparent",
                    ].join(" ")}
                  >
                    ✓
                  </span>
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* =================================================
          INFORMATION
      ================================================= */}

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
        <p className="text-[10px] leading-4 text-[#64748B]">
          <span className="font-bold text-[#334155]">
            Note:
          </span>{" "}
          Display Charge is the single pricing
          option used as the primary charge on
          the worker profile. Visible Pricing
          is separate.
        </p>
      </div>
    </section>
  );
}