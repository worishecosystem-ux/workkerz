import { IndianRupee } from "lucide-react";

type PriceInputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  decimal?: boolean;
};

export default function PriceInputField({
  label,
  value,
  onChange,
  decimal = false,
}: PriceInputFieldProps) {
  const handleChange = (rawValue: string) => {
    const clean = rawValue.replace(
      decimal ? /[^0-9.]/g : /[^0-9]/g,
      "",
    );

    if (decimal) {
      const parts = clean.split(".");

      if (parts.length > 2) {
        return;
      }
    }

    onChange(clean);
  };

  return (
    <div className="min-w-0">
      <label className="mb-1.5 block truncate text-xs font-semibold text-[#0F172A] sm:text-sm">
        {label}
      </label>

      <div className="relative">
        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8] sm:left-3.5 sm:h-4 sm:w-4" />

        <input
          type="text"
          inputMode={decimal ? "decimal" : "numeric"}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="0"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-9 pr-3 text-xs font-semibold text-[#0F172A] outline-none transition placeholder:text-[#A8B2C1] focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:h-11 sm:pl-10 sm:pr-4 sm:text-sm"
        />
      </div>
    </div>
  );
}