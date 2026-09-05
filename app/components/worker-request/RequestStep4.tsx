"use client";

import {
  CalendarDays,
  Check,
  Clock3,
} from "lucide-react";

interface RequestStep4Props {
  workDate: string;
  setWorkDate: (value: string) => void;

  startTime: string;
  setStartTime: (value: string) => void;

  duration: string;
  setDuration: (value: string) => void;

  onNext: () => void;
  onBack: () => void;
}

const durations = [
  "Few Hours",
  "1 Day",
  "2 Days",
  "3 Days",
  "1 Week",
  "1 Month",
];

export default function RequestStep4({
  workDate,
  setWorkDate,
  startTime,
  setStartTime,
  duration,
  setDuration,
}: RequestStep4Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)]">

      {/* HEADER */}
      <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CalendarDays className="h-4.5 w-4.5" />
          </div>

          <div>
            <h1 className="text-[15px] font-black tracking-tight text-gray-950">
              Work Schedule
            </h1>

            <p className="mt-0.5 text-[9px] leading-3.5 text-gray-500">
              When do you need the workers?
            </p>
          </div>

        </div>
      </div>

      {/* FORM */}
      <div className="space-y-10 p-3.5 sm:p-4">

        {/* DATE + TIME */}
        <div className="grid gap-2.5 sm:grid-cols-2">

          {/* DATE */}
          <div>
            <FieldLabel
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="Work Date"
              required
            />

            <div className="group relative mt-1.5">

              <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CalendarDays className="h-3.5 w-3.5" />
              </div>

              <input
                type="date"
                value={workDate}
                min={today}
                onChange={(event) =>
                  setWorkDate(event.target.value)
                }
                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-3 text-xs font-bold text-gray-800 outline-none transition hover:border-gray-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
              />

            </div>
          </div>

          {/* TIME */}
          <div>
            <FieldLabel
              icon={<Clock3 className="h-3.5 w-3.5" />}
              label="Start Time"
              optional
            />

            <div className="group relative mt-1.5">

              <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Clock3 className="h-3.5 w-3.5" />
              </div>

              <input
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-3 text-xs font-bold text-gray-800 outline-none transition hover:border-gray-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
              />

            </div>
          </div>

        </div>

        {/* DURATION */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-700">
              Work Duration
            </label>

            <span className="text-[9px] font-medium text-gray-400">
              Select one
            </span>
          </div>

          <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-6">

            {durations.map((item) => {
              const active = duration === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDuration(item)}
                  className={`relative flex min-h-10 items-center justify-center rounded-xl border px-2 text-[9px] font-black transition active:scale-[.98] ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-200 hover:bg-white"
                  }`}
                >
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-2 w-2" />
                    </span>
                  )}

                  {item}
                </button>
              );
            })}

          </div>
        </div>

        {/* SUMMARY */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">

          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />

            <p className="text-[9px] font-black uppercase tracking-wide text-emerald-600">
              Schedule Summary
            </p>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1.5">

            {workDate && (
              <SummaryBadge>
                {formatDate(workDate)}
              </SummaryBadge>
            )}

            {startTime && (
              <SummaryBadge>
                {formatTime(startTime)}
              </SummaryBadge>
            )}

            {duration && (
              <SummaryBadge>
                {duration}
              </SummaryBadge>
            )}

          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-100 px-4 py-2.5 sm:px-5">
        <p className="text-center text-[9px] font-medium text-gray-400">
          You can change the schedule before submitting.
        </p>
      </div>

    </section>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  icon,
  label,
  required,
  optional,
}: {
  icon?: React.ReactNode;
  label: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">

      {icon && (
        <span className="text-emerald-600">
          {icon}
        </span>
      )}

      <label className="text-[10px] font-bold text-gray-700">
        {label}
      </label>

      {required && (
        <span className="text-red-500">
          *
        </span>
      )}

      {optional && (
        <span className="ml-0.5 text-[8px] font-medium text-gray-400">
          Optional
        </span>
      )}

    </div>
  );
}

/* =========================================================
   SUMMARY BADGE
========================================================= */

function SummaryBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-lg bg-white px-2.5 py-1.5 text-[9px] font-bold text-gray-700 shadow-sm">
      {children}
    </span>
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value: string) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(value: string) {
  if (!value) return "";

  const [hours, minutes] = value.split(":");

  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minutes} ${suffix}`;
}