"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  UserRound,
} from "lucide-react";

import type { WorkerRequest } from "../../types";

import {
  formatBudget,
  formatShortDate,
  formatTime,
  getLocationLabel,
  getWorkerLabel,
} from "../../utils/requestHelpers";

type Props = {
  request: WorkerRequest;
  compact?: boolean;
};

function DetailItem({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gray-50 text-[#94A3B8]">
          {icon}
        </span>

        <span className="truncate text-[8px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          {label}
        </span>
      </div>

      <p
        className={`mt-1 truncate text-xs font-black ${
          highlight
            ? "text-[#FF5C39]"
            : "text-[#172033]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function WorkDetailsCard({
  request,
  compact = false,
}: Props) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm md:p-4">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-black text-[#172033] md:text-sm">
            Work Details
          </h3>

          <p className="mt-0.5 text-[9px] font-medium text-[#94A3B8]">
            Complete request information
          </p>
        </div>

        {request.category && (
          <span className="max-w-[45%] truncate rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-black text-[#FF5C39]">
            {request.category}
          </span>
        )}
      </div>

      {/* =================================================
          GRID
      ================================================= */}

      <div
        className={`
          mt-4
          grid
          grid-cols-2
          gap-x-3
          gap-y-4
          ${
            compact
              ? ""
              : "sm:grid-cols-3"
          }
        `}
      >
        <DetailItem
          icon={
            <Users className="h-3 w-3" />
          }
          label="Workers"
          value={getWorkerLabel(
            request.workers_required,
          )}
          highlight
        />

        <DetailItem
          icon={
            <UserRound className="h-3 w-3" />
          }
          label="Category"
          value={
            request.category ||
            "Not specified"
          }
        />

        <DetailItem
          icon={
            <CalendarDays className="h-3 w-3" />
          }
          label="Work Date"
          value={formatShortDate(
            request.work_date,
          )}
        />

        <DetailItem
          icon={
            <Clock3 className="h-3 w-3" />
          }
          label="Start Time"
          value={formatTime(
            request.start_time,
          )}
        />

        <DetailItem
          icon={
            <MapPin className="h-3 w-3" />
          }
          label="Location"
          value={getLocationLabel(
            request,
          )}
        />

        <DetailItem
          icon={
            <span className="text-[9px] font-black">
              ₹
            </span>
          }
          label="Budget"
          value={formatBudget(
            request.budget,
          )}
          highlight
        />
      </div>

      {/* =================================================
          DURATION
      ================================================= */}

      {request.duration && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <DetailItem
            icon={
              <Clock3 className="h-3 w-3" />
            }
            label="Duration"
            value={request.duration}
          />
        </div>
      )}
    </section>
  );
}