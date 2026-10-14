
"use client";

import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Clock3,
  XCircle,
  LoaderCircle,
  CircleHelp,
} from "lucide-react";

interface RequestHeaderProps {
  requestId: string;
  status?: string | null;
  onBack: () => void;
}

function getStatusConfig(status?: string | null) {
  const value = (status ?? "").toLowerCase().trim();

  if (["completed", "complete"].includes(value)) {
    return {
      label: "Completed",
      style: "bg-green-50 text-green-700 border-green-200",
      Icon: CheckCircle2,
    };
  }

  if (["cancelled", "canceled", "rejected"].includes(value)) {
    return {
      label: value === "rejected" ? "Rejected" : "Cancelled",
      style: "bg-red-50 text-red-700 border-red-200",
      Icon: XCircle,
    };
  }

  if (["in_progress", "in progress", "ongoing"].includes(value)) {
    return {
      label: "In Progress",
      style: "bg-blue-50 text-blue-700 border-blue-200",
      Icon: LoaderCircle,
    };
  }

  if (["pending", "requested", "open"].includes(value)) {
    return {
      label: value === "requested" ? "Requested" : "Pending",
      style: "bg-amber-50 text-amber-700 border-amber-200",
      Icon: Clock3,
    };
  }

  return {
    label: status?.trim()
      ? status
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Unknown",
    style: "bg-gray-100 text-gray-600 border-gray-200",
    Icon: CircleHelp,
  };
}

export default function RequestHeader({
  requestId,
  status,
  onBack,
}: RequestHeaderProps) {
  const config = getStatusConfig(status);
  const StatusIcon = config.Icon;

  return (
    <header className="m-0 w-full bg-green-700 pt-12">

      {/* Green Navigation Bar */}
      <div className="flex h-14 items-center gap-3 px-3 text-white sm:px-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition active:scale-95 active:bg-white/20"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold leading-5">
            Work Request Details
          </h1>

          <p className="mt-0.5 truncate text-[11px] text-green-100">
            ID: {requestId}
          </p>
        </div>

        <ClipboardList
          size={22}
          className="shrink-0 text-green-100"
        />
      </div>

      {/* Compact Request Summary */}
      <div className="border-b border-green-100 bg-green-50 px-3 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-green-100 bg-white p-2.5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
            <ClipboardList size={19} strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold leading-4 text-gray-900">
              Work Request
            </p>

            <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
              Request details and current status
            </p>
          </div>

          <span
            className={`inline-flex max-w-[125px] shrink-0 items-center gap-1 rounded-full border px-2 py-1.5 text-[10px] font-bold ${config.style}`}
          >
            <StatusIcon size={12} className="shrink-0" />
            <span className="truncate">{config.label}</span>
          </span>

        </div>
      </div>
    </header>
  );
}