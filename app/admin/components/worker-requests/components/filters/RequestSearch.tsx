"use client";

import {
  Search,
  X,
} from "lucide-react";

type Props = {
  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder?: string;
};

export default function RequestSearch({
  value,
  onChange,
  placeholder = "Search requests, customer, location...",
}: Props) {
  const hasValue =
    value.trim().length > 0;

  return (
    <div
      className="
        relative
        flex
        h-10
        w-full
        items-center
        rounded-xl
        border
        border-gray-100
        bg-white
        shadow-sm
        transition
        focus-within:border-orange-200
        focus-within:ring-2
        focus-within:ring-orange-50
      "
    >
      {/* =================================================
          SEARCH ICON
      ================================================= */}

      <div className="pointer-events-none flex h-full w-10 shrink-0 items-center justify-center">
        <Search className="h-4 w-4 text-[#94A3B8]" />
      </div>

      {/* =================================================
          INPUT
      ================================================= */}

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="
          h-full
          min-w-0
          flex-1
          bg-transparent
          pr-2
          text-xs
          font-medium
          text-[#172033]
          outline-none
          placeholder:text-[#94A3B8]
        "
      />

      {/* =================================================
          CLEAR
      ================================================= */}

      {hasValue && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() =>
            onChange("")
          }
          className="
            mr-1.5
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-gray-100
            text-gray-500
            transition
            hover:bg-gray-200
          "
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}