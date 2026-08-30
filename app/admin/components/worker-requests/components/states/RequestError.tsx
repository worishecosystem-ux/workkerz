"use client";

import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

type Props = {
  message?: string;

  onRetry?: () => void;

  mobile?: boolean;
};

export default function RequestError({
  message = "Something went wrong while loading requests.",
  onRetry,
  mobile = false,
}: Props) {
  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-red-100
        bg-white
        text-center
        shadow-sm
        ${
          mobile
            ? "min-h-[280px] p-8"
            : "min-h-[340px] p-12"
        }
      `}
    >
      {/* =================================================
          ICON
      ================================================= */}

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" />
      </div>

      {/* =================================================
          TITLE
      ================================================= */}

      <h2
        className={`
          mt-4
          font-black
          text-[#172033]
          ${
            mobile
              ? "text-sm"
              : "text-base"
          }
        `}
      >
        Unable to Load Requests
      </h2>

      {/* =================================================
          MESSAGE
      ================================================= */}

      <p
        className={`
          mt-1.5
          max-w-md
          leading-5
          text-[#64748B]
          ${
            mobile
              ? "text-[10px]"
              : "text-xs"
          }
        `}
      >
        {message}
      </p>

      {/* =================================================
          RETRY
      ================================================= */}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="
            mt-4
            inline-flex
            items-center
            gap-1.5
            rounded-xl
            bg-[#FF5C39]
            px-4
            py-2.5
            text-[10px]
            font-black
            text-white
            shadow-sm
            shadow-orange-100
            transition
            hover:bg-[#F45130]
          "
        >
          <RefreshCw className="h-3.5 w-3.5" />

          Try Again
        </button>
      )}
    </div>
  );
}