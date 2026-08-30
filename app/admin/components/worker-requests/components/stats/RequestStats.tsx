"use client";

import {
  CheckCircle2,
  Clock3,
  ListChecks,
  SearchCheck,
  XCircle,
} from "lucide-react";

import type { WorkerRequest } from "../../types";
import { normalizeStatus } from "../../utils/requestHelpers";

type Props = {
  requests: WorkerRequest[];
};

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: "dark" | "orange" | "amber" | "green" | "red";
};

const toneStyles = {
  dark: {
    box: "bg-[#172033] text-white",
    icon: "bg-white/10 text-white",
    value: "text-white",
    label: "text-white/60",
  },
  orange: {
    box: "bg-orange-50 text-[#172033]",
    icon: "bg-white text-[#FF5C39]",
    value: "text-[#172033]",
    label: "text-[#94A3B8]",
  },
  amber: {
    box: "bg-amber-50 text-[#172033]",
    icon: "bg-white text-amber-600",
    value: "text-[#172033]",
    label: "text-[#94A3B8]",
  },
  green: {
    box: "bg-emerald-50 text-[#172033]",
    icon: "bg-white text-emerald-600",
    value: "text-[#172033]",
    label: "text-[#94A3B8]",
  },
  red: {
    box: "bg-red-50 text-[#172033]",
    icon: "bg-white text-red-500",
    value: "text-[#172033]",
    label: "text-[#94A3B8]",
  },
};

export default function RequestStats({ requests }: Props) {
  const total = requests.length;

  const pending = requests.filter(
    (request) => normalizeStatus(request.status) === "pending",
  ).length;

  const underReview = requests.filter(
    (request) => normalizeStatus(request.status) === "under_review",
  ).length;

  const accepted = requests.filter(
    (request) => normalizeStatus(request.status) === "accepted",
  ).length;

  const rejected = requests.filter(
    (request) => normalizeStatus(request.status) === "rejected",
  ).length;

  const stats: StatCardProps[] = [
    {
      label: "Total Requests",
      value: total,
      icon: ListChecks,
      tone: "dark",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock3,
      tone: "orange",
    },
    {
      label: "Under Review",
      value: underReview,
      icon: SearchCheck,
      tone: "amber",
    },
    {
      label: "Confirmed",
      value: accepted,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircle,
      tone: "red",
    },
  ];

  return (
    <section className="mb-4 md:mb-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 md:gap-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 rounded-2xl border border-gray-100 p-3 shadow-sm md:p-3.5 ${styles.box}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p
          className={`text-lg font-black leading-none md:text-xl ${styles.value}`}
        >
          {value}
        </p>

        <p
          className={`mt-1 truncate text-[9px] font-bold md:text-[10px] ${styles.label}`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}