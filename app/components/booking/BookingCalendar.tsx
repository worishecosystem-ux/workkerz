"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDate = value ? new Date(value) : new Date();

  const selectedLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();

    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);

    const lastDay = new Date(year, month + 1, 0);

    const startOffset = (firstDay.getDay() + 6) % 7;

    const total = startOffset + lastDay.getDate();

    const cells = [];

    for (let i = 0; i < total; i++) {
      if (i < startOffset) {
        cells.push(null);
      } else {
        cells.push(new Date(year, month, i - startOffset + 1));
      }
    }

    return cells;
  }, [currentMonth]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999 bg-black/40 flex items-end md:items-center md:justify-center">
      <div className="w-full md:max-w-xl bg-white rounded-t-4xl md:rounded-4xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}

        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[2rem] font-black text-[#0F172A]">
              When's your booking?
            </h2>

            <p className="mt-1 text-[#64748B]">{selectedLabel}</p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month */}

        <div className="bg-[#FAFAFA] rounded-[28px] p-5">
          <div className="flex items-center justify-between mb-5">
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
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="font-bold text-lg">{monthName}</div>

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
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Week */}

          <div className="grid grid-cols-7 mb-3">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, index) => (
              <div
                key={`${d}-${index}`}
                className="text-center text-sm text-gray-400 font-semibold"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Dates */}

          <div className="grid grid-cols-7 gap-y-3">
            {days.map((day, i) => {
              if (!day) return <div key={i} />;

              const iso = day.toISOString().split("T")[0];

              const active = value === iso;

              const booked = bookedDates.includes(iso);

              return (
                <button
                  key={iso}
                  disabled={booked}
                  onClick={() => {
                    onSelect(iso);
                  }}
                  className={`relative mx-auto w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all ${
                    active
                      ? "bg-[#FF5C39] text-white shadow-lg"
                      : booked
                        ? "text-red-400"
                        : "hover:bg-gray-100"
                  }`}
                >
                  {day.getDate()}

                  {booked && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
