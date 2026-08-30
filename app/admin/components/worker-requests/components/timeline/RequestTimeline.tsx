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
}: Props) {
  if (mobile) {
    return (
      <MobileTimeline status={status} />
    );
  }

  return (
    <DesktopTimeline status={status} />
  );
}

/* =========================================================
   DESKTOP TIMELINE
========================================================= */

function DesktopTimeline({
  status,
}: {
  status: string;
}) {
  const {
    current,
    rejected,
  } = getTimelineState(status);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex w-full items-start">
        {steps.map((step, index) => {
          const Icon = step.icon;

          const done =
            index < current;

          const active =
            index === current;

          const rejectedStep =
            rejected && index === 2;

          const last =
            index === steps.length - 1;

          /*
           * COMPLETED CURRENT STEP = GREEN
           */
          const completedCurrent =
            active &&
            index === 3;

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
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    transition-all
                    ${
                      rejectedStep
                        ? `
                          bg-red-50
                          text-red-500
                          ring-1
                          ring-red-100
                        `
                        : completedCurrent
                          ? `
                            bg-emerald-500
                            text-white
                            shadow-sm
                            shadow-emerald-100
                          `
                          : done
                            ? `
                              bg-emerald-50
                              text-emerald-600
                              ring-1
                              ring-emerald-100
                            `
                            : active
                              ? `
                                bg-orange-50
                                text-[#FF5C39]
                                ring-1
                                ring-orange-100
                              `
                              : `
                                bg-gray-50
                                text-gray-300
                                ring-1
                                ring-gray-100
                              `
                    }
                  `}
                >
                  {rejectedStep ? (
                    <X className="h-4 w-4" />
                  ) : done ||
                    completedCurrent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
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

              <div className="mt-2.5 px-1 text-center">
                <p
                  className={`
                    text-[10px]
                    font-black
                    leading-tight
                    ${
                      rejectedStep
                        ? "text-red-600"
                        : done ||
                            active
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
                    text-[9px]
                    font-medium
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
========================================================= */

function MobileTimeline({
  status,
}: {
  status: string;
}) {
  const {
    current,
    rejected,
  } = getTimelineState(status);

  return (
    <div className="w-full">
      {steps.map((step, index) => {
        const Icon = step.icon;

        const done =
          index < current;

        const active =
          index === current;

        const rejectedStep =
          rejected && index === 2;

        const completedCurrent =
          active && index === 3;

        const last =
          index === steps.length - 1;

        return (
          <div
            key={step.key}
            className="flex items-start"
          >
            {/* ICON + LINE */}

            <div className="flex w-8 shrink-0 flex-col items-center">
              <div
                className={`
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
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
                  <X className="h-4 w-4" />
                ) : done ||
                  completedCurrent ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              {!last && (
                <div
                  className={`
                    my-1
                    h-7
                    w-[2px]
                    ${
                      index < current
                        ? "bg-emerald-500"
                        : "bg-gray-200"
                    }
                  `}
                />
              )}
            </div>

            {/* TEXT */}

            <div className="ml-3 min-w-0 pb-5">
              <p
                className={`
                  text-xs
                  font-black
                  ${
                    rejectedStep
                      ? "text-red-600"
                      : done ||
                          active
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
                  text-[10px]
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
        );
      })}
    </div>
  );
}