
"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  BriefcaseBusiness,
  IndianRupee,
  ClipboardCheck,
} from "lucide-react";

import type { WorkerGroup } from "@/app/components/ProjectWorkerGroups";

type Props = {
  requesterName: string;
  requesterMobile: string;
  requesterEmail: string;
  projectName: string;
  projectType: string;
  workerGroups: WorkerGroup[];
  requestLocation: string;
  fullAddress: string;
  workDate: string;
  startTime: string;
  duration: string;
  budget: string;
  requirement: string;
};

export default function RequestStep6Payment({
  requesterName,
  requesterMobile,
  requesterEmail,
  projectName,
  projectType,
  workerGroups,
  requestLocation,
  fullAddress,
  workDate,
  startTime,
  duration,
  budget,
  requirement,
}: Props) {
  const totalWorkers = workerGroups.reduce(
    (sum, group) =>
      sum + Math.max(1, Number(group.workers_required) || 1),
    0
  );

  const workerSummary = workerGroups
    .map(
      (group) =>
        `${group.category} × ${Math.max(
          1,
          Number(group.workers_required) || 1
        )}`
    )
    .join(", ");

  const formattedDate = workDate
    ? new Date(`${workDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not selected";

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 pb-5">

      {/* PAGE INTRO */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <ClipboardCheck className="h-6 w-6" />
        </div>

        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
          Step 6 · Final Review
        </p>

        <h2 className="mt-1 text-xl font-black text-gray-900">
          Review Your Worker Request
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Check your details before submitting your request.
        </p>
      </div>

      {/* FREE REQUEST CARD */}
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">

        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-700 to-green-500 px-4 py-4 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              Worker Request
            </p>

            <h3 className="mt-1 text-lg font-black">
              Free Submission
            </h3>

            <p className="mt-1 text-[11px] text-white/85">
              No request submission fee
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-semibold text-emerald-100">
              Request charge
            </p>

            <p className="text-3xl font-black">₹0</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          You can submit this request without paying anything.
        </div>
      </div>

      {/* REQUEST DETAILS */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-black text-gray-900">
            Request Summary
          </h3>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Your selected work and project details
          </p>
        </div>

        <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4">

          {/* PROJECT */}
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-gray-500">
              <BriefcaseBusiness className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Project
              </span>
            </div>

            <p className="mt-2 text-sm font-black text-gray-900">
              {projectName || "Not provided"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {projectType}
            </p>
          </div>

          {/* WORKERS */}
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Workers Required
              </span>
            </div>

            <p className="mt-2 text-sm font-black text-gray-900">
              {totalWorkers} Worker{totalWorkers === 1 ? "" : "s"}
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              {workerSummary || "No categories selected"}
            </p>
          </div>

          {/* SCHEDULE */}
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Work Date
              </span>
            </div>

            <p className="mt-2 text-sm font-black text-gray-900">
              {formattedDate}
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <Clock3 className="h-3.5 w-3.5" />
              {startTime || "Time to be confirmed"} · {duration}
            </p>
          </div>

          {/* LOCATION */}
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Work Location
              </span>
            </div>

            <p className="mt-2 text-sm font-black text-gray-900">
              {requestLocation || "Not selected"}
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              {fullAddress || "Address not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* REQUESTER */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wide text-gray-500">
          Requester Details
        </h3>

        <p className="mt-2 text-sm font-black text-gray-900">
          {requesterName}
        </p>

        <p className="mt-1 text-xs text-gray-600">
          {requesterMobile}
        </p>

        {requesterEmail && (
          <p className="mt-1 break-all text-xs text-gray-600">
            {requesterEmail}
          </p>
        )}
      </div>

      {/* BUDGET & REQUIREMENT */}
      {(budget || requirement) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wide text-gray-500">
            Work Requirements
          </h3>

          {budget && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-600">
                Estimated Budget
              </span>

              <span className="flex items-center text-sm font-black text-gray-900">
                <IndianRupee className="h-3.5 w-3.5" />
                {Number(budget).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {requirement && (
            <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-gray-600">
              {requirement}
            </p>
          )}
        </div>
      )}

      {/* CANCELLATION POLICY */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3.5">
        <div className="flex items-start gap-2.5">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />

          <div>
            <p className="text-xs font-black text-blue-900">
              Cancellation Information
            </p>

            <p className="mt-1 text-[11px] leading-5 text-blue-900">
              You may submit a cancellation request with a valid reason
              within 5 hours of request creation. Requests are subject
              to the Workkerz cancellation policy and admin review.
            </p>

            <p className="mt-1 text-[11px] leading-5 text-blue-900">
              If Workkerz cannot arrange the requested workers,
              Workkerz may cancel the request.
            </p>
          </div>
        </div>
      </div>

      {/* FINAL NOTICE */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

          <div>
            <p className="text-xs font-black text-emerald-900">
              Ready to Submit
            </p>

            <p className="mt-1 text-[11px] leading-5 text-emerald-800">
              Your Worker Request submission is completely free.
              Worker service charges, if applicable, will be discussed
              separately with the workers.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
