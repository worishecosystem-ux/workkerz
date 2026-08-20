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

const tabs: { key: BookingTab; label: string; icon: typeof ClipboardList }[] = [
  { key: "pending", label: "New Booking", icon: ClipboardList },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "outOfWork", label: "Out of Work", icon: Clock3 },
  { key: "completed", label: "Completed", icon: CircleCheckBig },
  { key: "rejected", label: "Cancelled", icon: XCircle },
];

const colors: Record<BookingTab, { text: string; underline: string }> = {
  pending: { text: "text-red-600", underline: "bg-red-500" },
  confirmed: { text: "text-blue-600", underline: "bg-blue-500" },
  outOfWork: { text: "text-orange-600", underline: "bg-orange-500" },
  completed: { text: "text-emerald-600", underline: "bg-emerald-500" },
  rejected: { text: "text-rose-600", underline: "bg-rose-500" },
};

export default function BookingTabs({ active, onChange, counts }: Props) {
  return (
    <nav className="w-full border-b border-slate-200">
      <div className="grid w-full grid-cols-3 md:flex md:items-end">
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
              className={`group relative flex min-w-0 items-center justify-center gap-1 px-1 py-2.5 transition-colors duration-200 focus:outline-none md:flex-1 md:gap-1.5 md:px-2 md:py-3 lg:gap-2 lg:px-3 lg:py-3.5 ${selected ? color.text : "text-slate-500 hover:text-slate-800"}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4 lg:h-[17px] lg:w-[17px]" strokeWidth={2.3} />

              <span className="min-w-0 truncate text-[9px] font-bold md:text-[10px] lg:text-xs">
                {tab.label}
              </span>

              <span className={`shrink-0 text-[9px] font-black md:text-[10px] lg:text-[11px] ${selected ? color.text : "text-slate-400"}`}>
                {count}
              </span>

              {selected && (
                <span className={`absolute bottom-0 left-1/2 h-[2px] w-[72%] -translate-x-1/2 rounded-full transition-all duration-200 md:h-[3px] md:w-[65%] lg:w-[60%] ${color.underline}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}