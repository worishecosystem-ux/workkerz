"use client";

import {
  Bell,
  ChevronRight,
} from "lucide-react";

type Props = {
  pendingCount: number;
  onPendingClick?: () => void;
};

export default function RequestHeader({
  pendingCount,
  onPendingClick,
}: Props) {
  return (
    <header className="mb-3 md:mb-4">
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className="
                truncate
                text-base
                font-extrabold
                tracking-tight
                text-[#1C1C1C]
                md:text-xl
              "
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
                  md:px-2
                  md:py-1
                  md:text-[9px]
                "
              >
                {pendingCount}
              </span>
            )}
          </div>

          <p
            className="
              mt-0.5
              truncate
              text-[9px]
              font-medium
              text-[#828282]
              md:mt-1
              md:text-xs
            "
          >
            Manage customer worker requests
          </p>
        </div>

        {/* =================================================
            ACTION
        ================================================= */}

        {pendingCount > 0 && (
          <button
            type="button"
            onClick={onPendingClick}
            className="
              group
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-xl
              border
              border-[#FFE0D7]
              bg-white
              px-2
              py-1.5
              shadow-[0_1px_4px_rgba(28,28,28,0.06)]
              transition
              hover:border-[#FFCCBE]
              hover:bg-[#FFF8F6]
              active:scale-[0.98]
              md:gap-2
              md:px-2.5
              md:py-2
            "
          >
            {/* BELL */}

            <span
              className="
                relative
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-lg
                bg-[#FFF1EC]
                text-[#E23744]
                md:h-7
                md:w-7
              "
            >
              <Bell
                className="
                  h-3
                  w-3
                  md:h-3.5
                  md:w-3.5
                "
              />

              <span
                className="
                  absolute
                  right-0
                  top-0
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[#E23744]
                  ring-1
                  ring-white
                "
              />
            </span>

            {/* TEXT */}

            <span className="hidden min-w-0 text-left sm:block">
              <span
                className="
                  block
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-[#E23744]
                "
              >
                Action Required
              </span>

              <span
                className="
                  mt-0.5
                  block
                  text-[9px]
                  font-extrabold
                  text-[#1C1C1C]
                  md:text-[10px]
                "
              >
                {pendingCount} waiting
              </span>
            </span>

            <ChevronRight
              className="
                h-3
                w-3
                text-[#E23744]
                transition
                group-hover:translate-x-0.5
                md:h-3.5
                md:w-3.5
              "
            />
          </button>
        )}
      </div>
    </header>
  );
}