"use client";

import {
  Check,
  CheckCircle2,
  Clock3,
  Users,
  X,
} from "lucide-react";

import { normalizeStatus } from "../../utils/requestHelpers";

type Props = {
  status: string;
  mobile?: boolean;
  compact?: boolean;
};

/* =========================================================
   STEPS
========================================================= */

const steps = [
  {
    key: "received",
    title: "New Request",
    subtitle: "Received",
    icon: CheckCircle2,
  },
  {
    key: "review",
    title: "Under Review",
    subtitle: "Admin reviewing",
    icon: Clock3,
  },
  {
    key: "decision",
    title: "Request Decision",
    subtitle: "Accept or reject",
    icon: Users,
  },
  {
    key: "completed",
    title: "Work Completed",
    subtitle: "Successfully completed",
    icon: CheckCircle2,
  },
];

/* =========================================================
   TIMELINE STATE
========================================================= */

function getTimelineState(status: string) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "completed":
      return {
        current: 3,
        rejected: false,
      };

    case "accepted":
      return {
        current: 2,
        rejected: false,
      };

    case "rejected":
      return {
        current: 2,
        rejected: true,
      };

    case "cancelled":
      return {
        current: 1,
        rejected: false,
      };

    case "pending":
    default:
      return {
        current: 1,
        rejected: false,
      };
  }
}

/* =========================================================
   MAIN
========================================================= */

export default function RequestTimeline({
  status,
  mobile = false,
  compact = false,
}: Props) {
  if (mobile) {
    return (
      <div
        className={`
          w-full
          ${compact ? "pt-2" : "pt-3"}
        `}
      >
        <MobileTimeline
          status={status}
          compact={compact}
        />
      </div>
    );
  }

  return (
    <div
      className={`
        w-full
        ${compact ? "pt-2" : "pt-4"}
      `}
    >
      <DesktopTimeline
        status={status}
        compact={compact}
      />
    </div>
  );
}

/* =========================================================
   DESKTOP TIMELINE
========================================================= */

function DesktopTimeline({
  status,
  compact = false,
}: {
  status: string;
  compact?: boolean;
}) {
  const { current, rejected } =
    getTimelineState(status);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex w-full items-start">
        {steps.map((step, index) => {
          const Icon = step.icon;

          const done = index < current;
          const active = index === current;
          const rejectedStep =
            rejected && index === 2;
          const last =
            index === steps.length - 1;

          const completedCurrent =
            active && index === 3;

          return (
            <div
              key={step.key}
              className="min-w-0 flex-1"
            >
              <div className="flex w-full items-start">

                {/* LEFT LINE */}

                <div className="flex flex-1 items-center pt-[15px]">
                  {index > 0 ? (
                    <div
                      className={`
                        h-[2px]
                        w-full
                        ${
                          index <= current
                            ? rejected &&
                              index === 2
                              ? "bg-red-400"
                              : "bg-emerald-500"
                            : "bg-gray-200"
                        }
                      `}
                    />
                  ) : (
                    <div className="w-full" />
                  )}
                </div>

                {/* ICON */}

                <div
                  className={`
                    relative
                    z-10
                    flex
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    ${
                      compact
                        ? "h-7 w-7"
                        : "h-8 w-8"
                    }
                    ${
                      rejectedStep
                        ? "bg-red-50 text-red-500 ring-1 ring-red-100"
                        : completedCurrent
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-100"
                          : done
                            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                            : active
                              ? "bg-orange-50 text-[#FF5C39] ring-1 ring-orange-100"
                              : "bg-gray-50 text-gray-300 ring-1 ring-gray-100"
                    }
                  `}
                >
                  {rejectedStep ? (
                    <X
                      className={
                        compact
                          ? "h-3.5 w-3.5"
                          : "h-4 w-4"
                      }
                    />
                  ) : done ||
                    completedCurrent ? (
                    <Check
                      className={
                        compact
                          ? "h-3.5 w-3.5"
                          : "h-4 w-4"
                      }
                    />
                  ) : (
                    <Icon
                      className={
                        compact
                          ? "h-3.5 w-3.5"
                          : "h-4 w-4"
                      }
                    />
                  )}
                </div>

                {/* RIGHT LINE */}

                <div className="flex flex-1 items-center pt-[15px]">
                  {!last ? (
                    <div
                      className={`
                        h-[2px]
                        w-full
                        ${
                          index < current
                            ? "bg-emerald-500"
                            : "bg-gray-200"
                        }
                      `}
                    />
                  ) : (
                    <div className="w-full" />
                  )}
                </div>
              </div>

              {/* LABEL */}

              <div
                className={`
                  px-1
                  text-center
                  ${compact ? "mt-2" : "mt-2.5"}
                `}
              >
                <p
                  className={`
                    font-black
                    leading-tight
                    ${
                      compact
                        ? "text-[9px]"
                        : "text-[10px]"
                    }
                    ${
                      rejectedStep
                        ? "text-red-600"
                        : done || active
                          ? "text-[#172033]"
                          : "text-gray-400"
                    }
                  `}
                >
                  {rejectedStep
                    ? "Request Rejected"
                    : step.title}
                </p>

                <p
                  className={`
                    mt-1
                    font-medium
                    ${
                      compact
                        ? "text-[8px]"
                        : "text-[9px]"
                    }
                    ${
                      rejectedStep
                        ? "text-red-400"
                        : completedCurrent
                          ? "text-emerald-600"
                          : active
                            ? "text-[#FF5C39]"
                            : done
                              ? "text-emerald-500"
                              : "text-gray-400"
                    }
                  `}
                >
                  {rejectedStep
                    ? "Not accepted"
                    : completedCurrent
                      ? "Current"
                      : active
                        ? "Current"
                        : done
                          ? "Completed"
                          : step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE TIMELINE
   4 STEPS → 2 COLUMNS × 2 ROWS
========================================================= */

function MobileTimeline({
  status,
  compact = false,
}: {
  status: string;
  compact?: boolean;
}) {
  const { current, rejected } =
    getTimelineState(status);

  return (
    <div
      className={`
        w-full
        overflow-hidden
        rounded-xl
        ${compact ? "px-1" : "px-0"}
      `}
    >
      <div className="grid w-full grid-cols-2 gap-x-3 gap-y-3">

        {steps.map((step, index) => {
          const Icon = step.icon;

          const done = index < current;
          const active = index === current;

          const rejectedStep =
            rejected && index === 2;

          const completedCurrent =
            active && index === 3;

          return (
            <div
              key={step.key}
              className="
                relative
                min-w-0
                rounded-xl
                border
                border-gray-100
                bg-white
                px-2.5
                py-2
                shadow-[0_1px_5px_rgba(28,28,28,0.04)]
              "
            >
              <div className="flex min-w-0 items-center gap-2">

                {/* ICON */}

                <div
                  className={`
                    flex
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    ${
                      compact
                        ? "h-7 w-7"
                        : "h-8 w-8"
                    }
                    ${
                      rejectedStep
                        ? "bg-red-50 text-red-500 ring-1 ring-red-100"
                        : completedCurrent
                          ? "bg-emerald-500 text-white"
                          : done
                            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                            : active
                              ? "bg-orange-50 text-[#FF5C39] ring-1 ring-orange-100"
                              : "bg-gray-50 text-gray-300 ring-1 ring-gray-100"
                    }
                  `}
                >
                  {rejectedStep ? (
                    <X
                      className={
                        compact
                          ? "h-3.5 w-3.5"
                          : "h-4 w-4"
                      }
                    />
                  ) : done ||
                    completedCurrent ? (
                    <Check
                      className={
                        compact
                          ? "h-3.5 w-3.5"
                          : "h-4 w-4"
                      }
                    />
                  ) : (
                    <Icon
                      className={
                        compact
                          ? "h-3.5 w-3.5"
                          : "h-4 w-4"
                      }
                    />
                  )}
                </div>

                {/* TEXT */}

                <div className="min-w-0 flex-1">
                  <p
                    className={`
                      truncate
                      font-black
                      leading-tight
                      ${
                        compact
                          ? "text-[10px]"
                          : "text-[11px]"
                      }
                      ${
                        rejectedStep
                          ? "text-red-600"
                          : done || active
                            ? "text-[#172033]"
                            : "text-gray-400"
                      }
                    `}
                  >
                    {rejectedStep
                      ? "Request Rejected"
                      : step.title}
                  </p>

                  <p
                    className={`
                      mt-0.5
                      truncate
                      font-medium
                      ${
                        compact
                          ? "text-[8px]"
                          : "text-[9px]"
                      }
                      ${
                        rejectedStep
                          ? "text-red-400"
                          : completedCurrent
                            ? "text-emerald-600"
                            : active
                              ? "text-[#FF5C39]"
                              : done
                                ? "text-emerald-500"
                                : "text-gray-400"
                      }
                    `}
                  >
                    {rejectedStep
                      ? "Not accepted"
                      : completedCurrent
                        ? "Current"
                        : active
                          ? "Currently here"
                          : done
                            ? "Completed"
                            : step.subtitle}
                  </p>
                </div>
              </div>

              {/* STEP NUMBER */}

              <span
                className={`
                  absolute
                  right-1.5
                  top-1.5
                  flex
                  h-4
                  w-4
                  items-center
                  justify-center
                  rounded-full
                  text-[7px]
                  font-black
                  ${
                    rejectedStep
                      ? "bg-red-100 text-red-500"
                      : done ||
                          completedCurrent
                        ? "bg-emerald-100 text-emerald-600"
                        : active
                          ? "bg-orange-100 text-[#FF5C39]"
                          : "bg-gray-100 text-gray-400"
                  }
                `}
              >
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}