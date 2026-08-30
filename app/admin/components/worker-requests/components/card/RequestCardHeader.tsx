"use client";

import {
  Building2,
  Users,
} from "lucide-react";

import type { WorkerRequest } from "../../types";

import {
  getRequestTitle,
  getRequesterName,
} from "../../utils/requestHelpers";

import RequestStatusBadge from "./RequestStatusBadge";

type Props = {
  request: WorkerRequest;
};

export default function RequestCardHeader({
  request,
}: Props) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      {/* =================================================
          REQUEST ICON
      ================================================= */}

      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5C39] md:h-11 md:w-11">
        <Users className="h-4.5 w-4.5 md:h-5 md:w-5" />

        {request.status
          .toLowerCase() ===
          "pending" && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#FF5C39]" />
        )}
      </div>

      {/* =================================================
          TITLE
      ================================================= */}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-xs font-black text-[#172033] md:text-sm">
              {getRequestTitle(request)}
            </h3>

            <div className="mt-0.5 flex min-w-0 items-center gap-1">
              {request.company_name ? (
                <Building2 className="h-3 w-3 shrink-0 text-[#94A3B8]" />
              ) : null}

              <p className="truncate text-[10px] font-medium text-[#64748B] md:text-xs">
                {getRequesterName(request)}
              </p>
            </div>
          </div>

          {/* =================================================
              STATUS
          ================================================= */}

          <RequestStatusBadge
            status={request.status}
          />
        </div>
      </div>
    </div>
  );
}