"use client";

import {
  SearchX,
  Users,
} from "lucide-react";

import type {
  RequestFilter,
} from "../../types";

type Props = {
  search?: string;

  filter?: RequestFilter;

  onClear?: () => void;

  mobile?: boolean;
};

export default function EmptyRequests({
  search = "",
  filter = "all",
  onClear,
  mobile = false,
}: Props) {
  const hasSearch =
    search.trim().length > 0;

  const hasFilter =
    filter !== "all";

  const filtered =
    hasSearch || hasFilter;

  const title = filtered
    ? "No Matching Requests"
    : "No Worker Requests";

  const description = filtered
    ? hasSearch
      ? `No requests found for "${search.trim()}".`
      : `No ${filter} requests available right now.`
    : "New worker requests will appear here automatically.";

  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-gray-100
        bg-white
        text-center
        shadow-sm
        ${
          mobile
            ? "min-h-[300px] p-8"
            : "min-h-[360px] p-12"
        }
      `}
    >
      {/* =================================================
          ICON
      ================================================= */}

      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-orange-50
          text-[#FF5C39]
        "
      >
        {filtered ? (
          <SearchX className="h-7 w-7" />
        ) : (
          <Users className="h-7 w-7" />
        )}
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
        {title}
      </h2>

      {/* =================================================
          DESCRIPTION
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
        {description}
      </p>

      {/* =================================================
          CLEAR
      ================================================= */}

      {filtered && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="
            mt-4
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
          Clear Filters
        </button>
      )}
    </div>
  );
}