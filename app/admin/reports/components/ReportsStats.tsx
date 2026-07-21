"use client";

import {
  FileText,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Props {
  total: number;
  pending: number;
  progress: number;
  resolved: number;
  high: number;
}

const stats = [
  {
    title: "Total Reports",
    key: "total",
    icon: FileText,
    color: "border-blue-500",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Pending",
    key: "pending",
    icon: Clock3,
    color: "border-amber-500",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    title: "In Progress",
    key: "progress",
    icon: LoaderCircle,
    color: "border-indigo-500",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    title: "Resolved",
    key: "resolved",
    icon: CheckCircle2,
    color: "border-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "High Priority",
    key: "high",
    icon: AlertTriangle,
    color: "border-red-500",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
];

export default function ReportsStats({
  total,
  pending,
  progress,
  resolved,
  high,
}: Props) {
  const values = {
    total,
    pending,
    progress,
    resolved,
    high,
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className={`rounded-2xl border-l-4 ${item.color} border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.title}</p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {values[item.key as keyof typeof values]}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  Live Dashboard
                </p>
              </div>

              <div
                className={`rounded-2xl p-3 ${item.iconBg}`}
              >
                <Icon
                  className={item.iconColor}
                  size={28}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}