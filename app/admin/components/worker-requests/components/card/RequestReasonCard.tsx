"use client";

import {
  AlertCircle,
  FileText,
} from "lucide-react";

import type { WorkerRequest } from "../../types";

import {
  getRequirement,
} from "../../utils/requestHelpers";

type Props = {
  request: WorkerRequest;
  compact?: boolean;
};

export default function RequestReasonCard({
  request,
  compact = false,
}: Props) {
  const requirement =
    getRequirement(request);

  const hasRequirement =
    Boolean(
      request.requirement?.trim(),
    );

  return (
    <section
      className={`
        rounded-xl
        border
        ${
          hasRequirement
            ? "border-orange-100 bg-orange-50/60"
            : "border-gray-100 bg-gray-50"
        }
        ${
          compact
            ? "p-2.5"
            : "p-3 md:p-3.5"
        }
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-2">
        <div
          className={`
            flex
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${
              hasRequirement
                ? "bg-white text-[#FF5C39]"
                : "bg-white text-gray-400"
            }
            ${
              compact
                ? "h-7 w-7"
                : "h-8 w-8"
            }
          `}
        >
          {hasRequirement ? (
            <FileText
              className={
                compact
                  ? "h-3.5 w-3.5"
                  : "h-4 w-4"
              }
            />
          ) : (
            <AlertCircle
              className={
                compact
                  ? "h-3.5 w-3.5"
                  : "h-4 w-4"
              }
            />
          )}
        </div>

        <div className="min-w-0">
          <p
            className={`
              font-black
              text-[#172033]
              ${
                compact
                  ? "text-[10px]"
                  : "text-xs"
              }
            `}
          >
            {hasRequirement
              ? "Requirement"
              : "Work Requirement"}
          </p>

          <p className="text-[8px] font-medium text-[#94A3B8]">
            {hasRequirement
              ? "Customer's requirement"
              : "No specific requirement"}
          </p>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className={`
          ${
            compact
              ? "mt-2"
              : "mt-2.5"
          }
        `}
      >
        <p
          className={`
            break-words
            leading-5
            ${
              hasRequirement
                ? "text-[#475569]"
                : "text-[#94A3B8]"
            }
            ${
              compact
                ? "text-[10px]"
                : "text-xs"
            }
          `}
        >
          {requirement}
        </p>
      </div>

      {/* =================================================
          CATEGORY TAG
      ================================================= */}

      {request.category && (
        <div
          className={`
            flex
            items-center
            justify-between
            border-t
            border-black/5
            ${
              compact
                ? "mt-2 pt-2"
                : "mt-2.5 pt-2.5"
            }
          `}
        >
          <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
            Category
          </span>

          <span
            className={`
              rounded-full
              bg-white
              font-bold
              text-[#FF5C39]
              ${
                compact
                  ? "px-2 py-1 text-[8px]"
                  : "px-2.5 py-1 text-[9px]"
              }
            `}
          >
            {request.category}
          </span>
        </div>
      )}
    </section>
  );
}