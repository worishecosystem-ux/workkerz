"use client";

import {
  CheckCircle2,
  Clock3,
  XCircle,
  Ban,
  CircleCheck,
  SearchCheck,
} from "lucide-react";

import type { RequestStatus } from "../../types";

import {
  getStatusBadgeClass,
  getStatusDotClass,
  getStatusLabel,
  normalizeStatus,
} from "../../utils/requestHelpers";

type Props = {
  status: string;
  size?: "sm" | "md";
  showIcon?: boolean;
};

export default function RequestStatusBadge({
  status,
  size = "sm",
  showIcon = false,
}: Props) {
  const normalized = normalizeStatus(status);
  const label = getStatusLabel(normalized);
  const badgeClass = getStatusBadgeClass(normalized);
  const dotClass = getStatusDotClass(normalized);

  const iconClass = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  const icons: Record<RequestStatus, typeof Clock3> = {
    pending: Clock3,
    under_review: SearchCheck,
    accepted: CheckCircle2,
    rejected: XCircle,
    completed: CircleCheck,
    cancelled: Ban,
  };

  const Icon = icons[normalized];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-bold capitalize ${badgeClass} ${
        size === "md"
          ? "px-2.5 py-1.5 text-xs"
          : "px-2 py-1 text-[9px]"
      }`}
    >
      {showIcon ? (
        <Icon className={iconClass} />
      ) : (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
      )}

      <span>{label}</span>
    </span>
  );
}