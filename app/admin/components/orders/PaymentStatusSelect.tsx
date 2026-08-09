"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  RotateCcw,
  XCircle,
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
    paymentStatuses.find((item) => item.value === value) ||
    paymentStatuses[0];

  const Icon = current.icon;

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <div ref={ref} className="relative w-full min-w-[120px] sm:min-w-[135px]">
      {/* SELECT BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-2.5 text-[10px] font-semibold shadow-sm transition sm:h-10 sm:px-3 sm:text-xs ${current.bg} ${current.color} ${
          open
            ? "border-slate-300 ring-2 ring-slate-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 shrink-0" />

          <span className="whitespace-nowrap">
            {current.label}
          </span>
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute left-0 top-full z-[100] mt-1.5 w-full min-w-[150px] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
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
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left transition ${
                  active
                    ? `${status.bg} ${status.color}`
                    : `text-slate-600 ${status.hover}`
                }`}
              >
                <span className="flex items-center gap-2">
                  <ItemIcon className="h-3.5 w-3.5 shrink-0" />

                  <span className="whitespace-nowrap text-[10px] font-semibold sm:text-xs">
                    {status.label}
                  </span>
                </span>

                {active && (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}