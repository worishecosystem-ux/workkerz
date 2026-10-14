
"use client";

import {
  CalendarClock,
  Database,
  ShieldCheck,
} from "lucide-react";

import type { WorkerRequest } from "./types";

interface RequestMetaProps {
  request: WorkerRequest;
}

function formatCreatedDate(value?: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default function RequestMeta({
  request,
}: RequestMetaProps) {
  return (
    <section className="w-full min-w-0 rounded-xl border border-green-100 bg-white p-3 shadow-sm sm:p-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
          <ShieldCheck
            className="h-4 w-4 text-green-700"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-900">
            Request Information
          </h2>

          <p className="text-[11px] leading-4 text-gray-500">
            Creation and record details
          </p>
        </div>
      </div>

      {/* Request Metadata */}
      <div className="grid grid-cols-0 gap-2">
        <div className="flex min-w-0 items-start gap-2 rounded-xl border border-green-100 bg-green-50/50 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-green-100">
            <CalendarClock
              className="h-4 w-4 text-green-700"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Created At
            </p>

            <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-900">
              {formatCreatedDate(request.created_at)}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-2 rounded-xl border border-green-100 bg-green-50/50 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-green-100">
            <Database
              className="h-4 w-4 text-green-700"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Request ID
            </p>

            <p className="mt-1 break-all font-mono text-xs font-semibold leading-5 text-gray-900">
              {request.id || "Not available"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}