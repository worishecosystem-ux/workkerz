"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import type { WorkerRequest } from "../../types";

import {
  formatShortDate,
  formatTime,
  getLocationLabel,
  getWorkerLabel,
} from "../../utils/requestHelpers";

type Props = {
  request: WorkerRequest;
};

export default function RequestCardMeta({
  request,
}: Props) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5 md:flex md:flex-wrap md:items-center md:gap-x-4 md:gap-y-2">
      {/* =================================================
          WORKERS
      ================================================= */}

      <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2 py-1.5 md:rounded-none md:bg-transparent md:px-0 md:py-0">
        <Users className="h-3 w-3 shrink-0 text-[#94A3B8]" />

        <span className="truncate text-[9px] font-bold text-[#64748B] md:text-[11px]">
          {getWorkerLabel(
            request.workers_required,
          )}
        </span>
      </div>

      {/* =================================================
          LOCATION
      ================================================= */}

      <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2 py-1.5 md:max-w-[220px] md:rounded-none md:bg-transparent md:px-0 md:py-0">
        <MapPin className="h-3 w-3 shrink-0 text-[#94A3B8]" />

        <span className="truncate text-[9px] font-bold text-[#64748B] md:text-[11px]">
          {getLocationLabel(request)}
        </span>
      </div>

      {/* =================================================
          DATE
      ================================================= */}

      <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2 py-1.5 md:rounded-none md:bg-transparent md:px-0 md:py-0">
        <CalendarDays className="h-3 w-3 shrink-0 text-[#94A3B8]" />

        <span className="truncate text-[9px] font-bold text-[#64748B] md:text-[11px]">
          {formatShortDate(
            request.work_date,
          )}
        </span>
      </div>

      {/* =================================================
          START TIME
      ================================================= */}

      {request.start_time && (
        <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2 py-1.5 md:rounded-none md:bg-transparent md:px-0 md:py-0">
          <Clock3 className="h-3 w-3 shrink-0 text-[#94A3B8]" />

          <span className="truncate text-[9px] font-bold text-[#64748B] md:text-[11px]">
            {formatTime(
              request.start_time,
            )}
          </span>
        </div>
      )}
    </div>
  );
}