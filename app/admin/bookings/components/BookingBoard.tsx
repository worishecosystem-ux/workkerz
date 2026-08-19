"use client";

import type { ReactNode } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  XCircle,
  BriefcaseBusiness,
  Inbox,
} from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  count: number;
  color:
    | "red"
    | "blue"
    | "orange"
    | "green"
    | "rose";
  children: ReactNode;
};

const colors = {
  red: {
    strip: "bg-red-500",
    icon: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700 border-red-100",
    emptyIcon: "bg-red-50 text-red-400",
  },

  blue: {
    strip: "bg-blue-500",
    icon: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    emptyIcon: "bg-blue-50 text-blue-400",
  },

  orange: {
    strip: "bg-orange-500",
    icon: "bg-orange-50 text-orange-600",
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    emptyIcon: "bg-orange-50 text-orange-400",
  },

  green: {
    strip: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    emptyIcon: "bg-emerald-50 text-emerald-400",
  },

  rose: {
    strip: "bg-rose-500",
    icon: "bg-rose-50 text-rose-600",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    emptyIcon: "bg-rose-50 text-rose-400",
  },
};

function getIcon(color: Props["color"]) {
  switch (color) {
    case "red":
      return ClipboardList;

    case "blue":
      return CheckCircle2;

    case "orange":
      return Clock3;

    case "green":
      return BriefcaseBusiness;

    case "rose":
      return XCircle;

    default:
      return ClipboardList;
  }
}

function getEmptyTitle(color: Props["color"]) {
  switch (color) {
    case "red":
      return "No new bookings";

    case "blue":
      return "No confirmed bookings";

    case "orange":
      return "No active work";

    case "green":
      return "No completed bookings";

    case "rose":
      return "No cancelled bookings";

    default:
      return "No bookings";
  }
}

function getEmptyDescription(color: Props["color"]) {
  switch (color) {
    case "red":
      return "New worker booking requests will appear here.";

    case "blue":
      return "Accepted worker assignments will appear here.";

    case "orange":
      return "Workers currently on active jobs will appear here.";

    case "green":
      return "Successfully completed worker jobs will appear here.";

    case "rose":
      return "Rejected or cancelled bookings will appear here.";

    default:
      return "Bookings will appear here automatically.";
  }
}

export default function BookingBoard({
  title,
  subtitle,
  count,
  color,
  children,
}: Props) {
  const theme = colors[color];
  const Icon = getIcon(color);

  const isEmpty = count === 0;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* STATUS STRIP */}

      <div className={`h-1 w-full ${theme.strip}`} />

      {/* HEADER */}

      <div className="flex min-h-[68px] items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* ICON */}

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${theme.icon}`}
          >
            <Icon
              className="h-[18px] w-[18px]"
              strokeWidth={2.3}
            />
          </div>

          {/* TITLE */}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[14px] font-bold text-slate-900">
                {title}
              </h2>

              {/* LIVE */}

              {color === "red" && count > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* COUNT */}

        <div
          className={`ml-3 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border px-2 text-[11px] font-bold ${theme.badge}`}
        >
          {count}
        </div>
      </div>

      {/* BODY */}

      <div className="bg-[#FAFBFC] p-3">
        {isEmpty ? (
          /* EMPTY STATE */
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white">
            <div className="flex max-w-[320px] flex-col items-center px-6 py-10 text-center">
              {/* ICON */}

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${theme.emptyIcon}`}
              >
                <Inbox
                  className="h-6 w-6"
                  strokeWidth={1.8}
                />
              </div>

              {/* TITLE */}

              <h3 className="mt-4 text-[14px] font-bold text-slate-700">
                {getEmptyTitle(color)}
              </h3>

              {/* DESCRIPTION */}

              <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                {getEmptyDescription(color)}
              </p>

              {/* STATUS */}

              <div className="mt-4 flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />

                Nothing to show
              </div>
            </div>
          </div>
        ) : (
          /* BOOKINGS */

          children
        )}
      </div>
    </section>
  );
}