"use client";

import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  CircleCheckBig,
  XCircle,
} from "lucide-react";

export type BookingTab =
  | "pending"
  | "confirmed"
  | "outOfWork"
  | "completed"
  | "rejected";

type Props = {
  active: BookingTab;
  onChange: (tab: BookingTab) => void;
  counts: {
    pending: number;
    confirmed: number;
    outOfWork: number;
    completed: number;
    rejected: number;
  };
};

const tabs: {
  key: BookingTab;
  label: string;
  mobileLabel: string;
  icon: typeof ClipboardList;
}[] = [
  {
    key: "pending",
    label: "Pending",
    mobileLabel: "New",
    icon: ClipboardList,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    mobileLabel: "Confirmed",
    icon: CheckCircle2,
  },
  {
    key: "outOfWork",
    label: "Out of Work",
    mobileLabel: "Working",
    icon: Clock3,
  },
  {
    key: "completed",
    label: "Completed",
    mobileLabel: "Done",
    icon: CircleCheckBig,
  },
  {
    key: "rejected",
    label: "Cancelled",
    mobileLabel: "Cancelled",
    icon: XCircle,
  },
];

const colors: Record<
  BookingTab,
  {
    text: string;
    underline: string;
  }
> = {
  pending: {
    text: "text-red-600",
    underline: "bg-red-500",
  },
  confirmed: {
    text: "text-blue-600",
    underline: "bg-blue-500",
  },
  outOfWork: {
    text: "text-orange-600",
    underline: "bg-orange-500",
  },
  completed: {
    text: "text-emerald-600",
    underline: "bg-emerald-500",
  },
  rejected: {
    text: "text-rose-600",
    underline: "bg-rose-500",
  },
};

export default function BookingTabs({
  active,
  onChange,
  counts,
}: Props) {
  return (
    <nav className="w-full border-b border-slate-200">
      <div
        className="
          flex
          w-full
          items-end
          overflow-x-auto
          scrollbar-none
        "
      >
        {tabs.map((tab) => {
          const selected = active === tab.key;
          const Icon = tab.icon;
          const count = counts[tab.key];
          const color = colors[tab.key];

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              aria-current={selected ? "page" : undefined}
              className={`
                group
                relative
                flex
                min-w-0
                flex-1
                items-center
                justify-center
                gap-1
                px-1.5
                py-2.5
                sm:gap-1.5
                sm:px-2
                sm:py-3
                md:gap-2
                md:py-3
                lg:py-3.5
                transition-colors
                duration-200
                focus:outline-none

                ${
                  selected
                    ? color.text
                    : "text-slate-500 hover:text-slate-800"
                }
              `}
            >
              {/* ICON */}

              <Icon
                className="
                  h-3.5
                  w-3.5
                  shrink-0
                  sm:h-4
                  sm:w-4
                "
                strokeWidth={2.3}
              />

              {/* LABEL */}

              <span
                className="
                  min-w-0
                  truncate
                  text-[9px]
                  font-bold
                  sm:text-[10px]
                  md:text-[11px]
                  lg:text-xs
                "
              >
                {/* MOBILE LABEL */}

                <span className="sm:hidden">
                  {tab.mobileLabel}
                </span>

                {/* TABLET / DESKTOP LABEL */}

                <span className="hidden sm:inline">
                  {tab.label}
                </span>
              </span>

              {/* COUNT */}

              <span
                className={`
                  shrink-0
                  text-[9px]
                  font-black
                  sm:text-[10px]
                  md:text-[11px]
                  ${
                    selected
                      ? color.text
                      : "text-slate-400"
                  }
                `}
              >
                {count}
              </span>

              {/* ACTIVE UNDERLINE */}

              {selected && (
                <span
                  className={`
                    absolute
                    bottom-0
                    left-1/2
                    h-[3px]
                    -translate-x-1/2
                    rounded-full
                    transition-all
                    duration-200
                    w-[75%]
                    sm:w-[65%]
                    md:w-[60%]
                    ${color.underline}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}