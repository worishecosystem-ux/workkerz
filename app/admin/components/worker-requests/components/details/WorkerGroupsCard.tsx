"use client";

import { Users } from "lucide-react";

import type { WorkerRequest } from "../../types";

import {
  getTotalWorkers,
  getWorkerGroups,
} from "../../utils/requestHelpers";

import WorkerGroupItem from "./WorkerGroupItem";

type Props = {
  request: WorkerRequest;

  compact?: boolean;
};

export default function WorkerGroupsCard({
  request,
  compact = false,
}: Props) {
  const groups =
    getWorkerGroups(request);

  const totalWorkers =
    getTotalWorkers(request);

  /*
   * If request has no grouped requirements,
   * don't render an empty section.
   */
  if (!groups.length) {
    return null;
  }

  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-3.5
        shadow-sm
        md:p-4
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5C39]">
            <Users className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-black text-[#172033] md:text-sm">
              Worker Groups
            </h3>

            <p className="mt-0.5 text-[9px] font-medium text-[#94A3B8]">
              Required workers by category
            </p>
          </div>
        </div>

        {/* GROUP COUNT */}

        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[8px] font-black text-gray-500">
          {groups.length}{" "}
          {groups.length === 1
            ? "Group"
            : "Groups"}
        </span>
      </div>

      {/* =================================================
          GROUP LIST
      ================================================= */}

      <div
        className={`
          mt-3
          grid
          gap-2
          ${
            compact
              ? "grid-cols-1"
              : "sm:grid-cols-2"
          }
        `}
      >
        {groups.map(
          (group, index) => (
            <WorkerGroupItem
              key={`${group.category}-${index}`}
              group={group}
              compact={compact}
            />
          ),
        )}
      </div>

      {/* =================================================
          TOTAL WORKERS
      ================================================= */}

      <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-emerald-600">
            <Users className="h-3.5 w-3.5" />
          </div>

          <div>
            <p className="text-[9px] font-bold text-emerald-700">
              Total Workers
            </p>

            <p className="text-[8px] font-medium text-emerald-600/70">
              All worker groups
            </p>
          </div>
        </div>

        <span className="text-base font-black text-emerald-700">
          {totalWorkers}
        </span>
      </div>
    </section>
  );
}