
"use client";

import {
  BriefcaseBusiness,
  Users,
  ClipboardCheck,
  Globe,
  CheckCircle2,
} from "lucide-react";

import type { WorkerRequest } from "./types";
import type { ElementType } from "react";

interface RequestOverviewProps {
  request: WorkerRequest;
}

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface DetailItemProps {
  icon: ElementType;
  label: string;
  value: string;
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-green-100 bg-green-50/50 p-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 ring-1 ring-green-100">
        <Icon size={17} strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium leading-4 text-gray-500">
          {label}
        </p>

        <p className="mt-0.5 break-words text-xs font-semibold leading-4 text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function RequestOverview({
  request,
}: RequestOverviewProps) {
  const workerCount =
    request.total_workers || request.workers_required || 0;

  return (
    <section className="w-full min-w-0 rounded-xl border border-green-100 bg-white p-3 shadow-sm sm:p-4">

      {/* Section Heading */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
          <ClipboardCheck size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold leading-5 text-gray-900">
            Request Overview
          </h2>

          <p className="text-[11px] leading-4 text-gray-500">
            Basic work request information
          </p>
        </div>

        <CheckCircle2
          size={17}
          className="shrink-0 text-green-600"
          aria-hidden="true"
        />
      </div>

      {/* Compact Mobile Grid */}
      <div className="grid grid-cols-2 gap-2">
        <DetailItem
          icon={BriefcaseBusiness}
          label="Work Category"
          value={formatValue(request.category)}
        />

        <DetailItem
          icon={Users}
          label="Workers Required"
          value={`${workerCount} ${
            workerCount === 1 ? "Worker" : "Workers"
          }`}
        />

        <DetailItem
          icon={ClipboardCheck}
          label="Request Status"
          value={formatValue(request.status)}
        />

        <DetailItem
          icon={Globe}
          label="Request Source"
          value={formatValue(request.source)}
        />
      </div>
    </section>
  );
}