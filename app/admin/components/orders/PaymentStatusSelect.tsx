"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

type Props = {
  value?: string;
  onChange: (status: string) => void;
};

const paymentStatuses = [
  {
    value: "Pending",
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    hover: "hover:bg-amber-50",
    icon: Clock3,
  },
  {
    value: "Paid",
    label: "Paid",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    hover: "hover:bg-emerald-50",
    icon: CheckCircle2,
  },
  {
    value: "Failed",
    label: "Failed",
    color: "text-red-700",
    bg: "bg-red-50",
    hover: "hover:bg-red-50",
    icon: XCircle,
  },
  {
    value: "Refunded",
    label: "Refunded",
    color: "text-blue-700",
    bg: "bg-blue-50",
    hover: "hover:bg-blue-50",
    icon: RotateCcw,
  },
];

export default function PaymentStatusSelect({
  value = "Pending",
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const current =
    paymentStatuses.find((s) => s.value === value) ||
    paymentStatuses[0];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", close);

    return () =>
      window.removeEventListener("mousedown", close);
  }, []);

  const Icon = current.icon;

  return (
    <div ref={ref} className="relative w-48">
      {/* Button */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-3 shadow-sm transition hover:border-slate-300 ${current.bg}`}
      >
        <div
          className={`flex items-center gap-2 font-semibold ${current.color}`}
        >
          <Icon className="h-4 w-4" />
          {current.label}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {paymentStatuses.map((status) => {
            const ItemIcon = status.icon;

            const active = value === status.value;

            return (
              <button
                key={status.value}
                type="button"
                onClick={() => {
                  onChange(status.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-left transition
                  ${status.hover}
                  ${
                    active
                      ? `${status.bg} ${status.color}`
                      : "text-slate-700"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <ItemIcon className="h-4 w-4" />

                  <span className="font-medium">
                    {status.label}
                  </span>
                </div>

                {active && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}