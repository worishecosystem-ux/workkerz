import { IndianRupee } from "lucide-react";
import type { Worker } from "@/app/data/workers";
import type { PriceKey } from "../editWorker.types";
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
  setPricingType: (value: Worker["pricingType"]) => void;
  setStartingPrice: (value: string) => void;
  setHalfDayPrice: (value: string) => void;
  setFullDayPrice: (value: string) => void;
  setMonthlyPrice: (value: string) => void;
  setVisitCharge: (value: string) => void;
  setVisiblePricingTypes: React.Dispatch<React.SetStateAction<PriceKey[]>>;
};

const PRICING_OPTIONS: Array<[PriceKey, string]> = [
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
  setPricingType,
  setStartingPrice,
  setHalfDayPrice,
  setFullDayPrice,
  setMonthlyPrice,
  setVisitCharge,
  setVisiblePricingTypes,
}: PricingSectionProps) {
  const togglePricingType = (id: PriceKey) => {
    setVisiblePricingTypes((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <IndianRupee className="h-3.5 w-3.5 text-[#FF5C39]" />
        </div>

        <h3 className="text-sm font-bold text-[#0F172A] sm:text-base">
          Pricing
        </h3>
      </div>

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
          onChange={setStartingPrice}
        />

        <PriceInputField
          label="Half Day Price"
          value={halfDayPrice}
          onChange={setHalfDayPrice}
        />

        <PriceInputField
          label="Full Day Price"
          value={fullDayPrice}
          onChange={setFullDayPrice}
        />

        <PriceInputField
          label="Monthly Price"
          value={monthlyPrice}
          onChange={setMonthlyPrice}
        />

        <PriceInputField
          label="Visit Charge"
          value={visitCharge}
          onChange={setVisitCharge}
        />

        <div className="col-span-2 rounded-xl border border-gray-200 bg-[#F8FAFC] p-3 lg:col-span-3">
          <p className="mb-2 text-xs font-bold text-[#0F172A]">
            Show on Profile
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PRICING_OPTIONS.map(([id, label]) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold"
              >
                <input
                  type="checkbox"
                  checked={visiblePricingTypes.includes(id)}
                  onChange={() => togglePricingType(id)}
                  className="accent-[#FF5C39]"
                />

                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}