import type { LucideIcon } from "lucide-react";

type InputFieldProps = {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url" | "search";
};

export default function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  inputMode,
}: InputFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block truncate text-xs font-semibold text-[#0F172A] sm:text-sm">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8] sm:left-3.5 sm:h-4 sm:w-4" />

        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-9 pr-3 text-xs text-[#0F172A] outline-none transition placeholder:text-[#A8B2C1] focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:h-11 sm:pl-10 sm:pr-4 sm:text-sm"
        />
      </div>
    </div>
  );
}