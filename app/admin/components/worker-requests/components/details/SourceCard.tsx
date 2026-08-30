"use client";

import {
  CalendarClock,
  Globe2,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";

import {
  useState,
} from "react";

import type { WorkerRequest } from "../../types";

import {
  formatCreatedAt,
  getRequestAge,
} from "../../utils/requestHelpers";

type Props = {
  request: WorkerRequest;
  compact?: boolean;
};

/* =========================================================
   SIMPLE REQUEST ID
========================================================= */

function getSimpleRequestId(
  id: string,
) {
  const clean = String(id)
    .replace(/-/g, "")
    .toUpperCase();

  return `REQ-${clean.slice(-6)}`;
}

/* =========================================================
   SOURCE ICON
========================================================= */

function getSourceIcon(
  source?: string | null,
) {
  const value = String(
    source || "",
  ).toLowerCase();

  if (
    value.includes("app") ||
    value.includes("android") ||
    value.includes("ios")
  ) {
    return Smartphone;
  }

  return Globe2;
}

/* =========================================================
   MAIN
========================================================= */

export default function SourceCard({
  request,
  compact = false,
}: Props) {
  const SourceIcon =
    getSourceIcon(request.source);

  const createdAt =
    formatCreatedAt(
      request.created_at,
    );

  const age =
    getRequestAge(
      request.created_at,
    );

  const simpleId =
    getSimpleRequestId(
      request.id,
    );

  const [copied, setCopied] =
    useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(
        request.id,
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <section
      className="
        rounded-xl
        border
        border-gray-100
        bg-white
        p-3
        shadow-[0_1px_4px_rgba(28,28,28,0.04)]
        md:p-3.5
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-2">
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#FFF1EC]
            text-[#E23744]
          "
        >
          <CalendarClock className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h3
            className="
              text-xs
              font-extrabold
              text-[#1C1C1C]
              md:text-sm
            "
          >
            Request Information
          </h3>

          <p
            className="
              mt-0.5
              text-[8px]
              font-medium
              text-[#828282]
            "
          >
            Source and request timing
          </p>
        </div>
      </div>

      {/* =================================================
          INFO GRID
      ================================================= */}

      <div
        className="
          mt-3
          grid
          grid-cols-2
          gap-x-4
          gap-y-3
        "
      >
        {/* SOURCE */}

        <SourceItem
          icon={
            <SourceIcon className="h-3.5 w-3.5" />
          }
          label="Source"
          value={
            request.source ||
            "Unknown"
          }
        />

        {/* CREATED */}

        <SourceItem
          icon={
            <CalendarClock className="h-3.5 w-3.5" />
          }
          label="Created"
          value={createdAt}
        />

        {/* AGE */}

        <SourceItem
          icon={
            <CalendarClock className="h-3.5 w-3.5" />
          }
          label="Age"
          value={age || "—"}
        />

        {/* REQUEST ID */}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-gray-50
                text-[7px]
                font-black
                text-[#828282]
              "
            >
              ID
            </span>

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.06em]
                text-[#94A3B8]
              "
            >
              Request ID
            </span>
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <p
              className="
                truncate
                text-[10px]
                font-extrabold
                tracking-wide
                text-[#1C1C1C]
              "
              title={request.id}
            >
              {simpleId}
            </p>

            <button
              type="button"
              onClick={copyId}
              aria-label="Copy request ID"
              className="
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-md
                bg-gray-50
                text-[#828282]
                transition
                hover:bg-[#FFF1EC]
                hover:text-[#E23744]
              "
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SOURCE ITEM
========================================================= */

function SourceItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-gray-50
            text-[#94A3B8]
          "
        >
          {icon}
        </span>

        <span
          className="
            truncate
            text-[8px]
            font-bold
            uppercase
            tracking-[0.06em]
            text-[#94A3B8]
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-1
          truncate
          text-[10px]
          font-extrabold
          text-[#1C1C1C]
        "
      >
        {value}
      </p>
    </div>
  );
}