"use client";

import { Report } from "./types";

interface Props {
  report: Report;
  onStatusChange: (id: string, status: string) => void;
}

export default function ReportCard({
  report,
  onStatusChange,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="flex flex-col gap-6 p-6 lg:flex-row">

        {/* Screenshot */}

        <div className="shrink-0">
          {report.screenshot ? (
            <a
              href={report.screenshot}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={report.screenshot}
                alt={report.subject}
                className="h-36 w-36 rounded-2xl border object-cover transition hover:scale-105"
              />
            </a>
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded-2xl border bg-slate-100 text-sm text-slate-500">
              No Image
            </div>
          )}
        </div>

        {/* Content */}

        <div className="flex-1">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <p className="font-mono text-xs text-slate-500">
                {report.report_number ??
                  report.id.slice(0, 8).toUpperCase()}
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {report.subject}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {report.issue_type}
              </p>

            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold
                ${
                  report.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : report.priority === "Medium"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
            >
              {report.priority}
            </span>

          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            {report.description}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div>
              <p className="text-xs uppercase text-slate-400">
                Email
              </p>

              <p className="font-medium">
                {report.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-slate-400">
                Phone
              </p>

              <p className="font-medium">
                {report.phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-slate-400">
                Created
              </p>

              <p className="font-medium">
                {new Date(report.created_at).toLocaleString()}
              </p>
            </div>

          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">

            <div>

              <p className="mb-2 text-xs uppercase text-slate-400">
                Status
              </p>

              <select
                value={report.status}
                onChange={(e) =>
                  onStatusChange(report.id, e.target.value)
                }
                className="rounded-xl border border-slate-300 px-4 py-2"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Rejected</option>
              </select>

            </div>

            {report.booking_id && (
              <div className="rounded-xl bg-slate-100 px-5 py-2">
                <span className="text-xs text-slate-500">
                  Booking ID
                </span>

                <p className="font-semibold">
                  {report.booking_id}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}