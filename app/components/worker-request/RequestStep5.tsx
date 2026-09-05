"use client";

import {
  Banknote,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import type { WorkerGroup } from "@/app/components/ProjectWorkerGroups";

interface RequestStep5Props {
  budget: string;
  setBudget: (value: string) => void;

  requirement: string;
  setRequirement: (value: string) => void;

  workerGroups: WorkerGroup[];

  projectName: string;
  projectType: string;
  requestLocation: string;

  workDate: string;
  startTime: string;
  duration: string;

  submitting: boolean;
  submitted: boolean;

  onBack: () => void;
}

export default function RequestStep5({
  budget,
  setBudget,
  requirement,
  setRequirement,
  workerGroups,
  projectName,
  projectType,
  requestLocation,
  workDate,
  startTime,
  duration,
  submitting,
  submitted,
  onBack,
}: RequestStep5Props) {
  const totalWorkers = workerGroups.reduce(
    (total, group) =>
      total + Math.max(0, Number(group.workers_required) || 0),
    0,
  );

  const workerSummary = workerGroups
    .filter((group) => Number(group.workers_required) > 0)
    .map(
      (group) =>
        `${group.category} × ${group.workers_required}`,
    )
    .join(", ");

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)]">

      {/* HEADER */}
      <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ClipboardList className="h-4.5 w-4.5" />
          </div>

          <div>
    
            <h1 className="mt-0.5 text-[15px] font-black tracking-tight text-gray-950">
              Final Details
            </h1>

            <p className="mt-0.5 text-[9px] leading-3.5 text-gray-500">
              Review your request and add your requirement.
            </p>
          </div>

        </div>
      </div>

      {/* FORM */}
      <div className="space-y-3 p-3.5 sm:p-4 ">

        {/* BUDGET */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-gray-700">
            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
            Approx Budget
            <span className="ml-0.5 text-[8px] font-medium text-gray-400">
              Optional
            </span>
          </label>

          <div className="mt-1.5 flex h-10 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10">

            <span className="mr-2 text-sm font-black text-gray-500">
              ₹
            </span>

            <input
              type="text"
              inputMode="numeric"
              value={budget}
              onChange={(event) =>
                setBudget(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 9),
                )
              }
              placeholder="Enter approximate budget"
              className="min-w-0 w-full bg-transparent text-xs font-semibold text-gray-900 outline-none placeholder:text-gray-400"
            />

          </div>

          <p className="mt-1 text-[8px] font-medium text-gray-400">
            Leave blank if you haven't decided the budget.
          </p>
        </div>

        {/* REQUIREMENT */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-gray-700">
            <ClipboardList className="h-3.5 w-3.5 text-emerald-600" />
            Work Requirement
            <span className="text-red-500">*</span>
          </label>

          <textarea
            value={requirement}
            onChange={(event) => setRequirement(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Describe the work, skills, material or special instructions..."
            className="mt-1.5 min-h-24 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium leading-5 text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
          />

          <div className="mt-1 flex justify-end">
            <span className="text-[8px] font-medium text-gray-400">
              {requirement.length}/1000
            </span>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/60">

          <div className="border-b border-emerald-100 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />

              <p className="text-[9px] font-black uppercase tracking-wide text-emerald-700">
                Request Summary
              </p>
            </div>
          </div>

          <div className="space-y-2 p-3">

            {/* PROJECT */}
            <SummaryRow
              label="Project"
              value={projectName || "Not specified"}
            />

            {/* TYPE */}
            <SummaryRow
              label="Type"
              value={projectType || "Not specified"}
            />

            {/* WORKERS */}
            <div className="flex items-start gap-2">

              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold uppercase tracking-wide text-gray-400">
                  Workers
                </p>

                <p className="mt-0.5 text-[10px] font-bold leading-4 text-gray-700">
                  {totalWorkers} workers
                  {workerSummary
                    ? ` — ${workerSummary}`
                    : ""}
                </p>
              </div>

            </div>

            {/* LOCATION */}
            <div className="flex items-start gap-2">

              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold uppercase tracking-wide text-gray-400">
                  Work Location
                </p>

                <p className="mt-0.5 text-[10px] font-bold leading-4 text-gray-700">
                  {requestLocation || "Not specified"}
                </p>
              </div>

            </div>

            {/* SCHEDULE */}
            <div className="flex items-start gap-2">

              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold uppercase tracking-wide text-gray-400">
                  Schedule
                </p>

                <p className="mt-0.5 text-[10px] font-bold leading-4 text-gray-700">
                  {workDate ? formatDate(workDate) : "Date not selected"}
                  {startTime ? ` • ${formatTime(startTime)}` : ""}
                  {duration ? ` • ${duration}` : ""}
                </p>
              </div>

            </div>

            {/* BUDGET */}
            {budget && (
              <SummaryRow
                label="Budget"
                value={`₹${Number(budget).toLocaleString("en-IN")}`}
              />
            )}

          </div>
        </div>

        {/* NOTE */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
          <p className="text-center text-[8px] font-medium leading-3.5 text-gray-500">
            Please check your details before submitting.
          </p>
        </div>

      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-100 px-4 py-2.5 sm:px-5">

        {submitted ? (
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />

            <p className="text-[9px] font-black text-emerald-700">
              Request submitted successfully.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">

            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className="h-9 rounded-xl border border-gray-200 bg-white px-4 text-[9px] font-black text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <p className="text-[8px] font-medium text-gray-400">
              Review before submitting
            </p>

          </div>
        )}

      </div>

    </section>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">

      <p className="shrink-0 text-[8px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="min-w-0 text-right text-[10px] font-bold leading-4 text-gray-700">
        {value}
      </p>

    </div>
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