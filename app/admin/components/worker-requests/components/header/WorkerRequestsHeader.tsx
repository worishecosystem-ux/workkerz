"use client";

import {
  BellRing,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

type Props = {
  pendingCount: number;
  totalCount: number;
  loading?: boolean;
  onRefresh?: () => void;
  onCreateRequest?: () => void;
  mobile?: boolean;
};

export default function WorkerRequestsHeader({
  pendingCount,
  totalCount,
  loading = false,
  onRefresh,
  onCreateRequest,
  mobile = false,
}: Props) {
  return (
    <header className={mobile ? "mb-3" : "mb-4 md:mb-5"}>
      <div className="flex items-center justify-between gap-2.5">
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
              bg-[#FFF1EC]
              text-[#E23744]
              ${mobile ? "h-8 w-8" : "h-9 w-9"}
            `}
          >
            <Users
              className={
                mobile
                  ? "h-4 w-4"
                  : "h-4.5 w-4.5"
              }
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1
                className={`
                  truncate
                  font-extrabold
                  tracking-tight
                  text-[#1C1C1C]
                  ${mobile ? "text-base" : "text-lg md:text-xl"}
                `}
              >
                Worker Requests
              </h1>

              {pendingCount > 0 && (
                <span
                  className="
                    shrink-0
                    rounded-full
                    bg-[#FFF1EC]
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-extrabold
                    text-[#E23744]
                  "
                >
                  {pendingCount}
                </span>
              )}
            </div>

            <p
              className={`
                truncate
                font-medium
                text-[#828282]
                ${mobile ? "text-[8px]" : "text-[9px] md:text-[10px]"}
              `}
            >
              Manage customer worker requests
            </p>
          </div>
        </div>

        {/* =================================================
            RIGHT ACTIONS
        ================================================= */}

        <div className="flex shrink-0 items-center gap-1.5">
          {/* PENDING */}

          {pendingCount > 0 && (
            <div
              className="
                hidden
                items-center
                gap-1.5
                rounded-lg
                border
                border-[#FFE0D7]
                bg-white
                px-2
                py-1.5
                shadow-[0_1px_4px_rgba(28,28,28,0.05)]
                sm:flex
              "
            >
              <span
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-md
                  bg-[#FFF1EC]
                "
              >
                <BellRing className="h-3 w-3 text-[#E23744]" />
              </span>

              <span className="text-[8px] font-extrabold text-[#E23744]">
                {pendingCount} Pending
              </span>
            </div>
          )}

          {/* TOTAL */}

          {!mobile && (
            <div
              className="
                hidden
                items-center
                gap-1.5
                rounded-lg
                border
                border-gray-100
                bg-white
                px-2.5
                py-1.5
                shadow-[0_1px_4px_rgba(28,28,28,0.04)]
                md:flex
              "
            >
              <span className="text-[8px] font-bold text-[#828282]">
                Total
              </span>

              <span className="text-[10px] font-extrabold text-[#1C1C1C]">
                {totalCount}
              </span>
            </div>
          )}

          {/* REFRESH */}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh requests"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-gray-100
                bg-white
                text-[#696969]
                shadow-[0_1px_4px_rgba(28,28,28,0.04)]
                transition
                hover:bg-[#FAFAFA]
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50
                md:h-9
                md:w-9
              "
            >
              <RefreshCw
                className={`
                  h-3.5
                  w-3.5
                  md:h-4
                  md:w-4
                  ${loading ? "animate-spin" : ""}
                `}
              />
            </button>
          )}

          {/* NEW REQUEST */}

          {onCreateRequest && (
            <button
              type="button"
              onClick={onCreateRequest}
              className="
                flex
                h-8
                items-center
                gap-1
                rounded-lg
                bg-[#E23744]
                px-2.5
                text-[9px]
                font-extrabold
                text-white
                shadow-[0_2px_6px_rgba(226,55,68,0.18)]
                transition
                hover:bg-[#D92F3C]
                active:scale-95
                md:h-9
                md:gap-1.5
                md:px-3
                md:text-[10px]
              "
            >
              <Plus className="h-3.5 w-3.5" />

              <span className="hidden sm:inline">
                New Request
              </span>

              <span className="sm:hidden">
                New
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}