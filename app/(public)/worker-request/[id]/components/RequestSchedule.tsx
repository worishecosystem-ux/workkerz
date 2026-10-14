
"use client";

import {
  CalendarDays,
  Clock3,
  Timer,
} from "lucide-react";

import type { ElementType } from "react";
import type { WorkerRequest } from "./types";

interface RequestScheduleProps {
  request: WorkerRequest;
}

interface ScheduleItemProps {
  icon: ElementType;
  label: string;
  value: string;
}

function ScheduleItem({
  icon: Icon,
  label,
  value,
}: ScheduleItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-green-100 bg-green-50/50 p-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 ring-1 ring-green-100">
        <Icon size={17} strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium leading-4 text-gray-500">
          {label}
        </p>

        <p className="mt-0.5 break-words text-xs font-semibold leading-4 text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "Not provided";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string | null): string {
  if (!value) return "Not provided";

  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return value;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDuration(value?: string | null): string {
  if (!value) return "Not provided";

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function RequestSchedule({
  request,
}: RequestScheduleProps) {
  return (
    <section className="w-full min-w-0 rounded-xl border border-green-100 bg-white p-3 shadow-sm sm:p-4">

      {/* Section Heading */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
          <CalendarDays size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold leading-5 text-gray-900">
            Work Schedule
          </h2>

          <p className="text-[11px] leading-4 text-gray-500">
            Date, time and duration
          </p>
        </div>
      </div>

      {/* Compact Android Grid */}
      <div className="grid grid-cols-0 gap-2 sm:grid-cols-3">
        <ScheduleItem
          icon={CalendarDays}
          label="Work Date"
          value={formatDate(request.work_date)}
        />

        <ScheduleItem
          icon={Clock3}
          label="Start Time"
          value={formatTime(request.start_time)}
        />

        <ScheduleItem
          icon={Timer}
          label="Duration"
          value={formatDuration(request.duration)}
        />
      </div>
    </section>
  );
}