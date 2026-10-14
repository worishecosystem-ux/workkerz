"use client";

import { ArrowLeft, Check, ShieldCheck } from "lucide-react";

export type BookingStep = 1 | 2 | 3 | 4 | 5;

export const BOOKING_STEPS = [
  { id: 1, label: "Basic" },
  { id: 2, label: "Schedule" },
  { id: 3, label: "Contact" },
  { id: 4, label: "Review" },
  { id: 5, label: "Payment" },
] as const;

interface Props {
  step: BookingStep;
  onBack: () => void;
  onStepClick?: (step: BookingStep) => void;
}

export default function BookingHeader({
  step,
  onBack,
  onStepClick,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-3 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-xl border"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold sm:text-lg">
              Book a Workkerz
            </h1>
            <p className="text-xs text-slate-500">
              Step {step} of 5
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1.5 text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold">Secure</span>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <nav className="mt-3 grid grid-cols-5 gap-1">
          {BOOKING_STEPS.map((item) => {
            const completed = item.id < step;
            const active = item.id === step;

            return (
              <button
                key={item.id}
                type="button"
                disabled={!completed || !onStepClick}
                onClick={() => onStepClick?.(item.id)}
                className="flex min-w-0 flex-col items-center gap-1 py-1"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    completed
                      ? "bg-teal-500 text-white"
                      : active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    item.id
                  )}
                </span>

                <span className="truncate text-[10px] sm:text-xs">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}