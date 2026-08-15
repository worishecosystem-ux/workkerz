"use client";

import {
  CalendarDays,
  Check,
  Clock3,
} from "lucide-react";

interface RequestStep4Props {
  workDate: string;
  setWorkDate: (value: string) => void;

  startTime: string;
  setStartTime: (value: string) => void;

  duration: string;
  setDuration: (value: string) => void;

  onNext: () => void;
  onBack: () => void;
}

const durations = [
  "Few Hours",
  "1 Day",
  "2 Days",
  "3 Days",
  "1 Week",
  "1 Month",
];

export default function RequestStep4({
  workDate,
  setWorkDate,

  startTime,
  setStartTime,

  duration,
  setDuration,

  onNext,
  onBack,
}: RequestStep4Props) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  function handleNext() {
    if (!workDate) return;

    onNext();
  }

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-[0_10px_40px_rgba(0,0,0,0.05)]
      "
    >
      {/* HEADER */}

      <div
        className="
          border-b
          border-gray-100
          px-4
          py-4
          sm:px-5
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-emerald-600
            "
          >
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-emerald-600
              "
            >
              Step 4
            </p>

            <h1
              className="
                mt-0.5
                text-base
                font-black
                tracking-tight
                text-gray-950
              "
            >
              Work Schedule
            </h1>

            <p
              className="
                mt-0.5
                text-[10px]
                leading-4
                text-gray-500
              "
            >
              When do you need the workers?
            </p>
          </div>

        </div>
      </div>

      {/* FORM */}

      <div className="space-y-5 p-4 sm:p-5">

        {/* DATE */}

        <div>
          <label
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-bold
              text-gray-700
            "
          >
            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />

            Work Date

            <span className="text-red-500">
              *
            </span>
          </label>

          <div className="relative mt-1.5">

            <input
              type="date"
              value={workDate}
              min={today}
              onChange={(event) =>
                setWorkDate(
                  event.target.value,
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-3
                text-xs
                font-semibold
                text-gray-800
                outline-none
                transition

                focus:border-emerald-500
                focus:bg-white
                focus:ring-2
                focus:ring-emerald-500/10
              "
            />

          </div>
        </div>

        {/* TIME */}

        <div>
          <label
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-bold
              text-gray-700
            "
          >
            <Clock3 className="h-3.5 w-3.5 text-emerald-600" />

            Start Time

            <span className="ml-1 text-[9px] font-medium text-gray-400">
              Optional
            </span>
          </label>

          <input
            type="time"
            value={startTime}
            onChange={(event) =>
              setStartTime(
                event.target.value,
              )
            }
            className="
              mt-1.5
              h-11
              w-full
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-3
              text-xs
              font-semibold
              text-gray-800
              outline-none
              transition

              focus:border-emerald-500
              focus:bg-white
              focus:ring-2
              focus:ring-emerald-500/10
            "
          />
        </div>

        {/* DURATION */}

        <div>
          <div className="flex items-center justify-between">

            <label
              className="
                text-[10px]
                font-black
                text-gray-700
              "
            >
              Work Duration
            </label>

            <span
              className="
                text-[9px]
                font-medium
                text-gray-400
              "
            >
              Select one
            </span>

          </div>

          <div
            className="
              mt-2
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
            "
          >
            {durations.map(
              (item) => {
                const active =
                  duration ===
                  item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setDuration(
                        item,
                      )
                    }
                    className={`
                      relative
                      flex
                      min-h-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      px-3
                      text-[10px]
                      font-black
                      transition
                      active:scale-[.98]

                      ${
                        active
                          ? `
                            border-emerald-500
                            bg-emerald-50
                            text-emerald-700
                            shadow-sm
                          `
                          : `
                            border-gray-200
                            bg-gray-50
                            text-gray-600
                            hover:border-emerald-200
                          `
                      }
                    `}
                  >
                    {active && (
                      <span
                        className="
                          absolute
                          right-2
                          top-2
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-emerald-500
                          text-white
                        "
                      >
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}

                    {item}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* SUMMARY */}

        <div
          className="
            rounded-xl
            border
            border-emerald-100
            bg-emerald-50/60
            px-3
            py-3
          "
        >
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-wide
              text-emerald-600
            "
          >
            Schedule Summary
          </p>

          <div
            className="
              mt-1.5
              flex
              flex-wrap
              gap-1.5
            "
          >
            {workDate && (
              <SummaryBadge>
                {formatDate(workDate)}
              </SummaryBadge>
            )}

            {startTime && (
              <SummaryBadge>
                {formatTime(startTime)}
              </SummaryBadge>
            )}

            <SummaryBadge>
              {duration}
            </SummaryBadge>
          </div>
        </div>

      </div>

      {/* FOOTER */}

      <div
        className="
          border-t
          border-gray-100
          px-4
          py-3
          sm:px-5
        "
      >
        <p
          className="
            text-center
            text-[9px]
            font-medium
            text-gray-400
          "
        >
          You can change the schedule before submitting.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   SUMMARY BADGE
========================================================= */

function SummaryBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="
        rounded-lg
        bg-white
        px-2.5
        py-1.5
        text-[9px]
        font-bold
        text-gray-700
        shadow-sm
      "
    >
      {children}
    </span>
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
  value: string,
) {
  if (!value) return "";

  const date =
    new Date(
      `${value}T00:00:00`,
    );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
  value: string,
) {
  if (!value) return "";

  const [
    hours,
    minutes,
  ] = value.split(":");

  const hour =
    Number(hours);

  const suffix =
    hour >= 12
      ? "PM"
      : "AM";

  const formattedHour =
    hour % 12 || 12;

  return `${formattedHour}:${minutes} ${suffix}`;
}