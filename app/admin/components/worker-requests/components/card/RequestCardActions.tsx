"use client";

import { ArrowRight, Check, Clock3, Loader2, X } from "lucide-react";
import type { StatusType, WorkerRequest } from "../../types";
import { normalizeStatus } from "../../utils/requestHelpers";

type Props = {
  request: WorkerRequest;
  updating?: string | null;
  onView: () => void;
  onUpdate: (id: string, status: StatusType) => void;
  compact?: boolean;
};

export default function RequestCardActions({
  request,
  updating = null,
  onView,
  onUpdate,
  compact = false,
}: Props) {
  const status = normalizeStatus(request.status);
  const isBusy = updating === request.id;
  const size = compact ? "h-9 text-[9px]" : "h-10 text-xs";
  const icon = compact ? "h-3 w-3" : "h-3.5 w-3.5";

  /* UNDER REVIEW / ACCEPTED / OTHER */
  if (status !== "pending") {
    return (
      <button
        type="button"
        onClick={onView}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 ${size}`}
      >
        <span>View Details</span>
        <ArrowRight className={icon} />
      </button>
    );
  }

  /* PENDING → UNDER REVIEW */
  return (
    <div className={`grid grid-cols-3 ${compact ? "gap-1.5" : "gap-2"}`}>
      <button
        type="button"
        onClick={onView}
        disabled={isBusy}
        className={`flex items-center justify-center rounded-xl border border-gray-200 bg-white font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${size}`}
      >
        View
      </button>

      <button
        type="button"
        disabled={isBusy}
        onClick={() => onUpdate(request.id, "rejected")}
        className={`flex items-center justify-center gap-1 rounded-xl border border-red-100 bg-red-50 font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 ${size}`}
      >
        {isBusy ? (
          <Loader2 className={`${icon} animate-spin`} />
        ) : (
          <>
            <X className={icon} />
            <span>Reject</span>
          </>
        )}
      </button>

      <button
        type="button"
        disabled={isBusy}
        onClick={() => onUpdate(request.id, "under_review")}
        className={`flex items-center justify-center gap-1 rounded-xl bg-[#FF5C39] font-black text-white shadow-sm shadow-orange-100 transition hover:bg-[#F45130] disabled:cursor-not-allowed disabled:opacity-50 ${size}`}
      >
        {isBusy ? (
          <Loader2 className={`${icon} animate-spin`} />
        ) : (
          <>
            <Clock3 className={icon} />
            <span>Review</span>
          </>
        )}
      </button>
    </div>
  );
}