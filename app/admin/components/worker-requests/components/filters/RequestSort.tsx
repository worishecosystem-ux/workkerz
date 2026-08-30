"use client";

import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUpAZ,
  CalendarArrowDown,
  ChevronDown,
  IndianRupee,
  Users,
} from "lucide-react";

import type { RequestSort } from "../../types";

type Props = {
  value: RequestSort;

  onChange: (
    value: RequestSort,
  ) => void;
};

const options: Array<{
  value: RequestSort;
  label: string;
  icon: typeof ArrowDownUp;
}> = [
  {
    value: "newest",
    label: "Newest First",
    icon: CalendarArrowDown,
  },
  {
    value: "oldest",
    label: "Oldest First",
    icon: ArrowUpAZ,
  },
  {
    value: "workers_high",
    label: "Most Workers",
    icon: Users,
  },
  {
    value: "workers_low",
    label: "Least Workers",
    icon: Users,
  },
  {
    value: "budget_high",
    label: "Highest Budget",
    icon: IndianRupee,
  },
  {
    value: "budget_low",
    label: "Lowest Budget",
    icon: IndianRupee,
  },
];

export default function RequestSort({
  value,
  onChange,
}: Props) {
  const selected =
    options.find(
      (option) =>
        option.value === value,
    ) || options[0];

  const Icon = selected.icon;

  return (
    <div className="relative shrink-0">
      {/* SELECT */}
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value as RequestSort,
          )
        }
        className="
          h-10
          w-full
          appearance-none
          rounded-xl
          border
          border-gray-200
          bg-white
          pl-9
          pr-9
          text-xs
          font-bold
          text-[#475569]
          outline-none
          transition
          focus:border-[#FF5C39]
          focus:ring-2
          focus:ring-orange-50
          md:h-11
          md:rounded-2xl
          md:text-sm
        "
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

      {/* LEFT ICON */}
      <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-[#94A3B8]">
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* RIGHT ICON */}
      <div className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center text-[#94A3B8]">
        <ChevronDown className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}