"use client";

import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  active?: boolean;
  onClick?: () => void;
};

export default function RequestStatsCard({
  label,
  value,
  icon: Icon,
  iconClassName = "bg-gray-50 text-gray-500",
  valueClassName = "text-[#172033]",
  active = false,
  onClick,
}: Props) {
  const content = (
    <>
      {/* ICON */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9 md:rounded-xl ${
          iconClassName
        }`}
      >
        <Icon className="h-4 w-4 md:h-[17px] md:w-[17px]" />
      </div>

      {/* CONTENT */}
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#94A3B8] md:text-[9px]">
          {label}
        </p>

        <p
          className={`mt-0.5 text-base font-black leading-none md:text-lg ${valueClassName}`}
        >
          {value}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border bg-white p-2.5 text-left shadow-sm transition md:gap-3 md:rounded-2xl md:p-3 ${
          active
            ? "border-[#FF5C39] bg-orange-50/40 shadow-orange-100"
            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
        }`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border bg-white p-2.5 shadow-sm md:gap-3 md:rounded-2xl md:p-3 ${
        active
          ? "border-[#FF5C39] bg-orange-50/40"
          : "border-gray-100"
      }`}
    >
      {content}
    </div>
  );
}