"use client";

import {
  Ban,
  CheckCircle2,
  Clock3,
  LayoutList,
  XCircle,
} from "lucide-react";

import type {
  RequestFilter,
} from "../../types";

type Props = {
  active: RequestFilter;

  onChange: (
    filter: RequestFilter,
  ) => void;

  pendingCount: number;

  acceptedCount: number;

  rejectedCount: number;

  completedCount: number;

  cancelledCount: number;
};

export default function RequestFilterTabs({
  active,
  onChange,
  pendingCount,
  acceptedCount,
  rejectedCount,
  completedCount,
  cancelledCount,
}: Props) {
  const tabs = [
    {
      key: "all" as RequestFilter,
      label: "All",
      count:
        pendingCount +
        acceptedCount +
        rejectedCount +
        completedCount +
        cancelledCount,
      icon: LayoutList,
    },

    {
      key: "pending" as RequestFilter,
      label: "Pending",
      count: pendingCount,
      icon: Clock3,
    },

    {
      key: "accepted" as RequestFilter,
      label: "Accepted",
      count: acceptedCount,
      icon: CheckCircle2,
    },

    {
      key: "rejected" as RequestFilter,
      label: "Rejected",
      count: rejectedCount,
      icon: XCircle,
    },

    {
      key: "completed" as RequestFilter,
      label: "Completed",
      count: completedCount,
      icon: CheckCircle2,
    },

    {
      key: "cancelled" as RequestFilter,
      label: "Cancelled",
      count: cancelledCount,
      icon: Ban,
    },
  ];

  return (
    <div
      className="
        flex
        w-full
        items-center
        gap-1.5
        overflow-x-auto
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-1.5
        shadow-sm
        scrollbar-hide
      "
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        const isActive =
          active === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() =>
              onChange(tab.key)
            }
            className={`
              flex
              h-9
              shrink-0
              items-center
              justify-center
              gap-1.5
              rounded-xl
              px-3
              text-[10px]
              font-black
              transition-all
              ${
                isActive
                  ? "bg-[#FF5C39] text-white shadow-sm shadow-orange-100"
                  : "text-[#64748B] hover:bg-gray-50"
              }
            `}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />

            <span>
              {tab.label}
            </span>

            <span
              className={`
                min-w-[18px]
                rounded-full
                px-1
                py-0.5
                text-center
                text-[8px]
                font-black
                ${
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.key ===
                        "pending"
                      ? "bg-orange-50 text-[#FF5C39]"
                      : "bg-gray-100 text-gray-500"
                }
              `}
            >
              {tab.count > 99
                ? "99+"
                : tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}