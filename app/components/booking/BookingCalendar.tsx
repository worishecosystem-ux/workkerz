"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";

interface BookingCalendarProps {
  open: boolean;
  value?: string;
  bookedDates?: string[];
  onClose: () => void;
  onSelect: (date: string) => void;
}

export default function BookingCalendar({
  open,
  value,
  bookedDates = [],
  onClose,
  onSelect,
}: BookingCalendarProps) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : today,
  );

  const [selected, setSelected] = useState(value || "");

  const monthTitle = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedLabel = selected
    ? new Date(selected).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Select a booking date";

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const start = (first.getDay() + 6) % 7;

    const arr = [];

    for (let i = 0; i < start; i++) arr.push(null);

    for (let d = 1; d <= last.getDate(); d++) {
      arr.push(new Date(year, month, d));
    }

    return arr;
  }, [currentMonth]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999 bg-black/60 flex items-end">
      <div className="w-full h-[94vh] bg-white rounded-t-[36px] flex flex-col overflow-hidden">
        {/* Header */}

        <div className="bg-linear-to-br from-sky-900 to-sky-800 text-white px-6 pt-6 pb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>

              <div>
                <p className="text-white/70 text-sm">Choose Date</p>

                <h2 className="text-3xl font-black">Booking Calendar</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8">
            <p className="text-white/70 text-sm">Selected Date</p>

            <h3 className="text-xl font-bold mt-1">{selectedLabel}</h3>
          </div>
        </div>

        {/* Calendar */}

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1,
                  ),
                )
              }
              className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center"
            >
              <ChevronLeft />
            </button>

            <h2 className="font-black text-xl">{monthTitle}</h2>

            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1,
                  ),
                )
              }
              className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Week */}

          <div className="grid grid-cols-7 mb-5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, index) => (
              <div
                key={`${d}-${index}`}
                className="text-center text-xs font-bold text-gray-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Dates */}

          <div className="grid grid-cols-7 gap-y-5">
            {days.map((day, index) => {
              if (!day) return <div key={index} />;

              const iso = day.toISOString().split("T")[0];

              const booked = bookedDates.includes(iso);

              const active = selected === iso;

              const isToday = iso === today.toISOString().split("T")[0];

              const past =
                new Date(iso) < new Date(today.toISOString().split("T")[0]);

              return (
                <button
                  key={iso}
                  disabled={booked || past}
                  onClick={() => setSelected(iso)}
                  className={`
                  relative
                  mx-auto
                  w-12
                  h-12
                  rounded-2xl
                  text-base
                  font-bold
                  transition
                  ${
                    active
                      ? "bg-[#FF5C39] text-white shadow-xl scale-105"
                      : isToday
                        ? "border-2 border-[#FF5C39]"
                        : "hover:bg-gray-100"
                  }
                  ${booked ? "text-red-400" : ""}
                  ${past ? "text-gray-300" : ""}
                  `}
                >
                  {day.getDate()}

                  {booked && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom */}

        <div className="border-t bg-white p-5 pb-[max(env(safe-area-inset-bottom),20px)]">
          <button
            disabled={!selected}
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
            className="w-full h-14 rounded-2xl bg-[#FF5C39] text-white font-bold text-lg disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
