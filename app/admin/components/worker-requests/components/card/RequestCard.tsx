"use client";

import {
  ChevronRight,
  Clock3,
} from "lucide-react";

import type {
  DeviceType,
  StatusType,
  WorkerRequest,
} from "../../types";

import {
  getRequestAge,
  getTotalWorkers,
  normalizeStatus,
} from "../../utils/requestHelpers";

import RequestCardHeader from "./RequestCardHeader";
import RequestCardMeta from "./RequestCardMeta";
import RequestReasonCard from "./RequestReasonCard";
import RequestBudgetBadge from "./RequestBudgetBadge";
import RequestCardActions from "./RequestCardActions";

type Props = {
  request: WorkerRequest;

  device: DeviceType;

  updating?: string | null;

  onView: (
    request: WorkerRequest,
  ) => void;

  onUpdate: (
    id: string,
    status: StatusType,
  ) => void;
};

export default function RequestCard({
  request,
  device,
  updating = null,
  onView,
  onUpdate,
}: Props) {
  const status = normalizeStatus(
    request.status,
  );

  const isMobile =
    device === "mobile";

  const totalWorkers =
    getTotalWorkers(request);

  const requestAge =
    getRequestAge(
      request.created_at,
    );

  return (
    <article
      className={`
        overflow-hidden
        rounded-2xl
        border
        bg-white
        shadow-sm
        transition
        duration-200
        ${
          status === "pending"
            ? "border-orange-100"
            : "border-gray-100"
        }
        ${
          !isMobile
            ? "hover:-translate-y-[1px] hover:border-gray-200 hover:shadow-md"
            : ""
        }
      `}
    >
      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className={`
          ${
            isMobile
              ? "p-3"
              : "p-4 lg:p-5"
          }
        `}
      >
        {/* HEADER */}

        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              onView(request)
            }
            className="min-w-0 flex-1 text-left"
          >
            <RequestCardHeader
              request={request}
            />
          </button>

          {/* REQUEST AGE */}

          {requestAge && (
            <div className="flex shrink-0 items-center gap-1 text-[8px] font-medium text-[#94A3B8] md:text-[9px]">
              <Clock3 className="h-3 w-3" />

              <span>
                {requestAge}
              </span>
            </div>
          )}
        </div>

        {/* META */}

        <RequestCardMeta
          request={request}
        />

        {/* =================================================
            QUICK SUMMARY
        ================================================= */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-2
            rounded-xl
            bg-[#FAFAFA]
            px-2.5
            py-2
            md:px-3
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF5C39] shadow-sm">
              <span className="text-[10px] font-black">
                {totalWorkers}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black text-[#172033]">
                {totalWorkers} Workers Required
              </p>

              <p className="text-[8px] font-medium text-[#94A3B8]">
                {request.duration ||
                  "Work duration not specified"}
              </p>
            </div>
          </div>

          <RequestBudgetBadge
            budget={request.budget}
            compact={isMobile}
          />
        </div>

        {/* =================================================
            REASON
        ================================================= */}

        {request.requirement && (
          <div className="mt-2.5">
            <RequestReasonCard
              request={request}
              compact={isMobile}
            />
          </div>
        )}

        {/* =================================================
            VIEW DETAILS
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            onView(request)
          }
          className="
            mt-2.5
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            border
            border-gray-100
            bg-white
            px-3
            py-2
            text-left
            transition
            hover:border-gray-200
            hover:bg-gray-50
          "
        >
          <span className="text-[9px] font-bold text-[#64748B] md:text-[10px]">
            View complete request details
          </span>

          <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
        </button>
      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div
        className={`
          border-t
          border-gray-100
          bg-[#FAFAFA]
          ${
            isMobile
              ? "p-2.5"
              : "px-4 py-3 lg:px-5"
          }
        `}
      >
        <RequestCardActions
          request={request}
          updating={updating}
          onView={() =>
            onView(request)
          }
          onUpdate={onUpdate}
          compact={isMobile}
        />
      </div>
    </article>
  );
}