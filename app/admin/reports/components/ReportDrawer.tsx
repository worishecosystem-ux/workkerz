"use client";

import {
  X,
  Calendar,
  Mail,
  Phone,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { Report } from "./types";

import type { ReactNode } from "react";
interface Props {
  report: Report | null;
  onClose: () => void;

  onPriorityChange: (
    id: string,
    priority: string
  ) => Promise<void>;

  onStatusChange: (
    id: string,
    status: string
  ) => Promise<void>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-orange-100 text-orange-700",
    Low: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[priority] || "bg-slate-100 text-slate-700"
      }`}
    >
      {priority}
    </span>
  );
}

function InfoCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs uppercase tracking-wider">{title}</span>
      </div>

      <p className="wrap-break-word font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function ReportDrawer({
  report,
  onClose,
  onPriorityChange,
  onStatusChange,
}: Props) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-999 bg-slate-950/60 backdrop-blur-sm">
      <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-slate-50 shadow-2xl">
        {/* Header */}

        <div className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur-xl">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Report Details
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                  {report.report_number ?? report.id.slice(0, 8).toUpperCase()}
                </span>

                <StatusBadge status={report.status} />

                <PriorityBadge priority={report.priority} />
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Screenshot */}

          <div className="overflow-hidden rounded-3xl border bg-white">
            {report.screenshot ? (
              <img
                src={report.screenshot}
                alt={report.subject}
                className="h-80 w-full object-cover"
              />
            ) : (
              <div className="flex h-80 items-center justify-center text-slate-400">
                No Screenshot Available
              </div>
            )}
          </div>

          {/* Subject */}

          <div className="rounded-3xl border bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Subject
            </p>

            <h3 className="mt-2 text-2xl font-bold">{report.subject}</h3>

            <p className="mt-3 text-sm text-slate-500">{report.issue_type}</p>
          </div>

          {/* Description */}

          <div className="rounded-3xl border bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Description
            </p>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">
              {report.description}
            </p>
          </div>

          {/* Customer */}

          <div className="rounded-3xl border bg-white p-6">
            <h3 className="mb-5 text-lg font-bold">Customer Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                title="Email"
                value={report.email || "-"}
                icon={<Mail size={16} />}
              />

              <InfoCard
                title="Phone"
                value={report.phone || "-"}
                icon={<Phone size={16} />}
              />
            </div>
          </div>
          {/* Report Information */}

          <div className="rounded-3xl border bg-white p-6">
            <h3 className="mb-5 text-lg font-bold">Report Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <AlertTriangle size={16} />

                  <span className="text-xs uppercase tracking-wider">
                    Priority
                  </span>
                </div>

                <select
                  value={report.priority}
                  onChange={(e) =>
                    void onPriorityChange(report.id, e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                >
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟠 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <CheckCircle2 size={16} />

                  <span className="text-xs uppercase tracking-wider">
                    Status
                  </span>
                </div>

                <select
                  value={report.status}
                  onChange={(e) =>
                    void onStatusChange(report.id, e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <InfoCard
                title="Booking ID"
                value={report.booking_id || "-"}
                icon={<ClipboardList size={16} />}
              />

              <InfoCard
                title="Created"
                value={new Date(report.created_at).toLocaleString()}
                icon={<Calendar size={16} />}
              />
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="sticky bottom-0 border-t bg-white p-5"></div>
      </div>
    </div>
  );
}
