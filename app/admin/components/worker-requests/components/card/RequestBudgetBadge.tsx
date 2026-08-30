"use client";

import { IndianRupee } from "lucide-react";

import {
  formatBudget,
} from "../../utils/requestHelpers";

type Props = {
  budget?: number | null;

  compact?: boolean;
};

export default function RequestBudgetBadge({
  budget,
  compact = false,
}: Props) {
  const hasBudget =
    budget !== null &&
    budget !== undefined &&
    !Number.isNaN(Number(budget));

  if (!hasBudget) {
    return (
      <div
        className={`
          inline-flex
          items-center
          gap-1.5
          rounded-lg
          bg-gray-50
          font-bold
          text-gray-500
          ${
            compact
              ? "px-2 py-1 text-[9px]"
              : "px-2.5 py-1.5 text-xs"
          }
        `}
      >
        <IndianRupee
          className={
            compact
              ? "h-3 w-3"
              : "h-3.5 w-3.5"
          }
        />

        <span>Budget not specified</span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        bg-emerald-50
        font-black
        text-emerald-700
        ${
          compact
            ? "px-2 py-1 text-[9px]"
            : "px-2.5 py-1.5 text-xs"
        }
      `}
    >
      <IndianRupee
        className={
          compact
            ? "h-3 w-3"
            : "h-3.5 w-3.5"
        }
      />

      <span>
        {formatBudget(budget)}
      </span>
    </div>
  );
}