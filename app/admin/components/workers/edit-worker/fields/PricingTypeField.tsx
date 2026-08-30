import { IndianRupee } from "lucide-react";
import type { Worker } from "@/app/data/workers";

type PricingTypeFieldProps = {
  value: Worker["pricingType"];
  onChange: (value: Worker["pricingType"]) => void;
};

export default function PricingTypeField({
  value,
  onChange,
}: PricingTypeFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block truncate text-xs font-semibold text-[#0F172A] sm:text-sm">
        Pricing Type
      </label>

      <div className="relative">
        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />

        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value as Worker["pricingType"])
          }
          className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-[#F8FAFC] pl-9 pr-3 text-xs font-semibold text-[#0F172A] outline-none transition focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:h-11 sm:text-sm"
        >
          <option value="per_job">Per Work</option>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="per_service">Per Service</option>
          <option value="visit_charge">Visit Charge</option>
          <option value="custom">Custom</option>
        </select>
      </div>
    </div>
  );
}