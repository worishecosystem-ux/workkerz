"use client";

import type { Report } from "./types";
import PriorityBadge from "./PriorityBadge";
import { Eye } from "lucide-react";

interface Props {
  report: Report;
  onStatusChange: (id: string, status: string) => Promise<void>;

  onView: (report: Report) => void;
}

export default function ReportRow({ report, onStatusChange, onView }: Props) {
  return (
    <tr className="border-b transition hover:bg-slate-50">
      {/* Screenshot */}
      <td className="px-6 py-4">
        {report.screenshot ? (
          <img
            src={report.screenshot}
            alt={report.subject}
            className="h-14 w-14 rounded-xl border object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
            N/A
          </div>
        )}
      </td>

      {/* Report */}
      <td className="px-6 py-4">
        <p className="font-semibold text-slate-900">{report.subject}</p>

        <p className="mt-1 text-xs font-mono text-slate-500">
          {report.report_number ?? report.id.slice(0, 8).toUpperCase()}
        </p>
      </td>

      {/* Issue */}
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">{report.issue_type}</span>
      </td>

      {/* Priority */}
      <td className="px-6 py-4">
        <PriorityBadge priority={report.priority} />
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <select
          value={report.status}
          onChange={(e) => void onStatusChange(report.id, e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Rejected</option>
        </select>
      </td>

      {/* Customer */}
      <td className="px-6 py-4">
        <p className="font-medium">{report.email || "-"}</p>

        <p className="text-xs text-slate-500">{report.phone || "-"}</p>
      </td>

      {/* Created */}
      <td className="px-6 py-4 text-sm text-slate-600">
        {new Date(report.created_at).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onView(report)}
          className="rounded-lg border p-2 transition hover:bg-slate-100"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
}
