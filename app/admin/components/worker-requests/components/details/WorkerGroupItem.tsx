"use client";

import { Users } from "lucide-react";

import type {
  WorkerRequirement,
} from "../../types";

type Props = {
  group: WorkerRequirement;

  compact?: boolean;
};

export default function WorkerGroupItem({
  group,
  compact = false,
}: Props) {
  const count = Number(
    group.workers_required || 0,
  );

  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        justify-between
        gap-2
        rounded-xl
        border
        border-gray-100
        bg-white
        ${
          compact
            ? "p-2"
            : "p-2.5"
        }
      `}
    >
      {/* =================================================
          LEFT
      ================================================= */}

      <div className="flex min-w-0 items-center gap-2">
        <div
          className={`
            flex
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-orange-50
            text-[#FF5C39]
            ${
              compact
                ? "h-7 w-7"
                : "h-8 w-8"
            }
          `}
        >
          <Users
            className={
              compact
                ? "h-3.5 w-3.5"
                : "h-4 w-4"
            }
          />
        </div>

        <div className="min-w-0">
          <p
            className={`
              truncate
              font-black
              text-[#172033]
              ${
                compact
                  ? "text-[10px]"
                  : "text-xs"
              }
            `}
          >
            {group.category ||
              "Worker"}
          </p>

          <p className="text-[8px] font-medium text-[#94A3B8]">
            Worker group
          </p>
        </div>
      </div>

      {/* =================================================
          COUNT
      ================================================= */}

      <div
        className={`
          shrink-0
          rounded-lg
          bg-gray-50
          font-black
          text-[#172033]
          ${
            compact
              ? "px-2 py-1 text-[9px]"
              : "px-2.5 py-1.5 text-xs"
          }
        `}
      >
        × {count}
      </div>
    </div>
  );
}