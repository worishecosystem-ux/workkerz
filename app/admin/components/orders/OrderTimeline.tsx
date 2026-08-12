"use client";

import {
  Bike,
  Check,
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (status: string) => void;
};

const statuses = [
  { value: "Pending", label: "Pending", icon: Clock3 },
  { value: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { value: "Preparing", label: "Preparing", icon: Package },
  { value: "Packed", label: "Packed", icon: PackageCheck },
  { value: "Ready to Dispatch", label: "Dispatch", icon: Truck },
  { value: "Out For Delivery", label: "Delivery", icon: Bike },
  { value: "Delivered", label: "Delivered", icon: Check },
  { value: "Cancelled", label: "Cancelled", icon: XCircle },
];

export default function OrderStatusTimeline({ value, onChange }: Props) {
  const currentIndex = statuses.findIndex((status) => status.value === value);

  const cancelled = value === "Cancelled";

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full items-center">
          {statuses.map((status, index) => {
            const Icon = status.icon;
            const active = status.value === value;
            const isCancelled = status.value === "Cancelled";
            const completed = !cancelled && currentIndex > index;

            return (
              <div key={status.value} className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => onChange(status.value)}
                  className={[
                    "flex h-8 shrink-0 items-center gap-1.5",
                    "rounded-lg border px-2.5",
                    "text-[9px] font-bold whitespace-nowrap",
                    "transition-all duration-200",
                    "active:scale-[0.97]",
                    "sm:h-9 sm:px-3 sm:text-xs",
                    active
                      ? isCancelled
                        ? "border-red-500 bg-red-500 text-white shadow-sm"
                        : "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : completed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <Icon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />

                  <span>{status.label}</span>
                </button>

                {index < statuses.length - 1 && (
                  <div
                    className={[
                      "mx-1.5 h-0.5 w-4 shrink-0 rounded-full",
                      "sm:mx-2 sm:w-6",
                      completed ? "bg-emerald-400" : "bg-slate-200",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
