"use client";
import { useState } from "react";
import { CalendarDays, Clock3, Timer, X, Pencil } from "lucide-react";
import BookingCalendar from "@/app/components/booking/BookingCalendar";

import dayjs from "dayjs";
interface BookingScheduleStepProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;

  bookedDates: string[];
  bookedSlots: string[];
  timeSlots: string[];

  showCalendar: boolean;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;

  worker: any;
}

export default function BookingScheduleStep({
  form,
  setForm,
  bookedDates,
  bookedSlots,
  timeSlots,
  showCalendar,
  setShowCalendar,
  worker,
}: BookingScheduleStepProps) {
  const timeValue = form.time
    ? dayjs(`2025-01-01 ${form.time}`, "YYYY-MM-DD hh:mm A")
    : dayjs();

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mt-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#000000]">
            Schedule Booking
          </h2>

          <p className="text-xs text-[#64748B] mt-0.5">
            Pick your booking slot
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-[#FFF4EF] flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-[#b910b6]" />
        </div>
      </div>

      {/* DATE SELECTOR */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[#0F172A] text-sm" style={{ fontWeight: 700 }}>
              Choose Date
            </div>

            <div className="text-xs text-[#94A3B8] mt-1">
              Next available booking days
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-[#FFF4EF] text-[#FF5C39] text-xs font-bold">
            Live Availability
          </div>
        </div>

        {/* DATE CARDS */}
        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2">
          {Array.from({ length: 19 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);

            const iso = date.toISOString().split("T")[0];
            const active = form.date === iso;
            const fullyBooked = bookedDates.includes(iso);

            return (
              <button
                key={iso}
                disabled={fullyBooked}
                onClick={() =>
                  setForm({
                    ...form,
                    date: iso,
                    time: "",
                  })
                }
                className={`h-14 rounded-xl border p-1 transition-all ${
                  active
                    ? "bg-[#FF5C39] border-[#FF5C39] text-white shadow"
                    : fullyBooked
                      ? "bg-red-50 border-red-200 text-red-400 opacity-70"
                      : "bg-white border-gray-200 active:bg-orange-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full leading-none">
                  <span
                    className={`text-[9px] ${
                      active
                        ? "text-white/80"
                        : fullyBooked
                          ? "text-red-400"
                          : "text-[#64748B]"
                    }`}
                  >
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </span>

                  <span
                    className={`text-base font-black ${
                      fullyBooked ? "text-red-500" : ""
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  <span
                    className={`text-[9px] ${
                      active
                        ? "text-white/80"
                        : fullyBooked
                          ? "text-red-400"
                          : "text-[#94A3B8]"
                    }`}
                  >
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                </div>
              </button>
            );
          })}

          {/* OTHER DATE BUTTON */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="h-14 rounded-xl border border-dashed border-gray-300 bg-[#FAFAFA] p-1 flex flex-col items-center justify-center hover:border-[#FF5C39] hover:bg-orange-50"
          >
            <CalendarDays className="w-4 h-4 text-[#FF5C39]" />
            <span className="text-[9px] font-semibold mt-1">More</span>
          </button>
        </div>

        {/* CALENDAR */}
        {showCalendar && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center ">
            {/* Sheet */}
            <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Select Date
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Choose a future booking date
                  </p>
                </div>

                <button
                  onClick={() => setShowCalendar(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 active:bg-gray-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Calendar */}
              <div className="p-3 max-h-[75vh] overflow-y-auto">
                <BookingCalendar
                  open={showCalendar}
                  value={form.date}
                  bookedDates={bookedDates}
                  onClose={() => setShowCalendar(false)}
                  onSelect={(date) => {
                    setForm({
                      ...form,
                      date,
                      time: "",
                    });

                    setShowCalendar(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TIME SECTION */}
      {form.date && (
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-[#FF5C39]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Select Time
              </h3>
              <p className="text-xs text-slate-500">
                Choose your preferred slot
              </p>
            </div>
          </div>

          {/* Selected Time */}
          {form.time && (
            <div className="px-5 pt-4">
              <div className="rounded-xl bg-orange-50 border border-orange-100 py-2 text-center">
                <span className="text-sm font-semibold text-[#FF5C39]">
                  Selected: {form.time}
                </span>
              </div>
            </div>
          )}

          {/* Time Slots */}
          <div className="p-5">
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const disabled = bookedSlots.includes(`${form.date} ${slot}`);
                const active = form.time === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setForm({
                        ...form,
                        time: slot,
                      })
                    }
                    className={`h-10 rounded-xl text-[10px] font-semibold transition-all
                ${
                  active
                    ? "bg-[#FF5C39] text-white shadow"
                    : disabled
                      ? "bg-red-50 text-red-400 border border-red-100 opacity-60"
                      : "bg-gray-50 border border-gray-200 active:bg-orange-50"
                }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DURATION */}
      {form.time && (
        <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-[#F3F4FF] flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 text-[#6366F1]" />
            </div>

            <div>
              <div
                className="text-[#0F172A] text-sm"
                style={{ fontWeight: 700 }}
              >
                Select Service Package
              </div>

              <div className="text-xs text-[#94A3B8] mt-0.5">
                Choose booking option
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Quick Service",
                value: "quick_service",
                price: worker.visitCharge || worker.startingPrice,
                icon: "⚡",
              },
              {
                label: "Half Day",
                value: "half_day",
                price: worker.halfDayPrice || worker.startingPrice,
                icon: "🌤️",
              },
              {
                label: "Full Day",
                value: "full_day",
                price: worker.fullDayPrice || worker.startingPrice,
                icon: "☀️",
              },
              {
                label: "Monthly",
                value: "monthly",
                price: worker.monthlyPrice || worker.startingPrice,
                icon: "📅",
              },
            ].map((option) => {
              const active = form.bookingType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      bookingType: option.value,
                    })
                  }
                  className={`h-14 px-4 rounded-2xl border transition-all duration-200 ${
                    active
                      ? "bg-[#6366F1] border-[#6366F1] text-white shadow-lg"
                      : "bg-white border-gray-200 hover:border-[#6366F1]/30 hover:bg-indigo-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div
                        className={`text-sm ${
                          active ? "text-white" : "text-[#0F172A]"
                        }`}
                        style={{ fontWeight: 700 }}
                      >
                        {option.label}
                      </div>

                      <div
                        className={`text-xs mt-1 ${
                          active ? "text-white/80" : "text-[#64748B]"
                        }`}
                      >
                        ₹{option.price}
                      </div>
                    </div>

                    <div className="text-2xl">{option.icon}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
