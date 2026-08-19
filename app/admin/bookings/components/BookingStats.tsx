"use client";

import {
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Clock3,
  XCircle,
} from "lucide-react";

type Props = {
  pending: number;
  confirmed: number;
  outOfWork: number;
  completed: number;
  rejected: number;
};

const stats = [
  {
    key: "pending",
    label: "New Requests",
    icon: ClipboardList,
    iconClass: "bg-red-50 text-red-500",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    iconClass: "bg-blue-50 text-blue-500",
  },
  {
    key: "outOfWork",
    label: "Out of Work",
    icon: BriefcaseBusiness,
    iconClass: "bg-orange-50 text-orange-500",
  },
  {
    key: "completed",
    label: "Completed",
    icon: Clock3,
    iconClass: "bg-emerald-50 text-emerald-500",
  },
  {
    key: "rejected",
    label: "Cancelled",
    icon: XCircle,
    iconClass: "bg-rose-50 text-rose-500",
  },
] as const;

export default function BookingStats({
  pending,
  confirmed,
  outOfWork,
  completed,
  rejected,
}: Props) {
  const values = {
    pending,
    confirmed,
    outOfWork,
    completed,
    rejected,
  };

  return (
    <section
      className="
        grid
        grid-cols-2
        gap-2
        sm:grid-cols-3
        sm:gap-2.5
        lg:grid-cols-5
        lg:gap-3
      "
    >
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className="
              min-w-0
              rounded-xl
              border
              border-slate-200
              bg-white
              px-2.5
              py-2.5
              shadow-sm
              sm:rounded-xl
              sm:px-3
              sm:py-3
              lg:px-3.5
              lg:py-3
            "
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              {/* TEXT */}

              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate
                    text-[9px]
                    font-semibold
                    text-slate-500
                    sm:text-[10px]
                    lg:text-[11px]
                  "
                >
                  {item.label}
                </p>

                <p
                  className="
                    mt-0.5
                    text-lg
                    font-black
                    leading-none
                    text-slate-900
                    sm:text-xl
                    lg:text-2xl
                  "
                >
                  {values[item.key]}
                </p>
              </div>

              {/* ICON */}

              <div
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  sm:h-9
                  sm:w-9
                  sm:rounded-xl
                  lg:h-10
                  lg:w-10
                  ${item.iconClass}
                `}
              >
                <Icon
                  className="
                    h-4
                    w-4
                    sm:h-[18px]
                    sm:w-[18px]
                    lg:h-5
                    lg:w-5
                  "
                />
              </div>
            </div>

            {/* LIVE */}

            <div className="mt-1.5 flex items-center gap-1 sm:mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <p
                className="
                  text-[8px]
                  font-semibold
                  text-emerald-600
                  sm:text-[9px]
                "
              >
                Live data
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}