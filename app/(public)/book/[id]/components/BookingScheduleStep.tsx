"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  Clock3,
  Timer,
  X,
  Zap,
  Sun,
  Calendar,
  IndianRupee,
  Briefcase,
} from "lucide-react";

import BookingCalendar from "@/app/components/booking/BookingCalendar";
import dayjs from "dayjs";

import type {
  Worker,
  PriceKey,
} from "@/app/data/workers";

interface BookingScheduleStepProps {
  form: any;
  setForm: React.Dispatch<
    React.SetStateAction<any>
  >;

  bookedDates: string[];
  bookedSlots: string[];
  timeSlots: string[];

  showCalendar: boolean;
  setShowCalendar: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  worker: Worker;
}

/* =========================================
   PRICE OPTION
========================================= */

type BookingPriceOption = {
  key: PriceKey;
  label: string;
  price: number;
  icon: React.ReactNode;
};

/* =========================================
   BOOKING SCHEDULE STEP
========================================= */

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
  /* =========================================
     VISIBLE PRICING
     
     ONLY ADMIN SELECTED PRICES
  ========================================= */

  const visiblePriceOptions =
    useMemo<BookingPriceOption[]>(
      () => {
        const visible =
          Array.isArray(
            worker.visiblePricingTypes,
          )
            ? worker.visiblePricingTypes
            : [];

        const priceMap: Record<
          PriceKey,
          BookingPriceOption
        > = {
          per_job: {
            key: "per_job",
            label: "Per Job",
            price: Number(
              worker.startingPrice ||
                0,
            ),
            icon: (
              <Briefcase className="h-5 w-5" />
            ),
          },

          half_day: {
            key: "half_day",
            label: "Half Day",
            price: Number(
              worker.halfDayPrice ||
                0,
            ),
            icon: (
              <Sun className="h-5 w-5" />
            ),
          },

          full_day: {
            key: "full_day",
            label: "Full Day",
            price: Number(
              worker.fullDayPrice ||
                0,
            ),
            icon: (
              <Sun className="h-5 w-5" />
            ),
          },

          monthly: {
            key: "monthly",
            label: "Monthly",
            price: Number(
              worker.monthlyPrice ||
                0,
            ),
            icon: (
              <Calendar className="h-5 w-5" />
            ),
          },

          visit_charge: {
            key: "visit_charge",
            label: "Visit Charge",
            price: Number(
              worker.visitCharge ||
                0,
            ),
            icon: (
              <Zap className="h-5 w-5" />
            ),
          },
        };

        return visible
          .map(
            (key) =>
              priceMap[key],
          )
          .filter(
            (
              option,
            ) =>
              option &&
              option.price > 0,
          );
      },
      [
        worker.visiblePricingTypes,
        worker.startingPrice,
        worker.halfDayPrice,
        worker.fullDayPrice,
        worker.monthlyPrice,
        worker.visitCharge,
      ],
    );

  /* =========================================
     SELECTED DATE
  ========================================= */

  const selectedDate =
    form.date || "";

  /* =========================================
     TIME VALUE
  ========================================= */

  const timeValue = form.time
    ? dayjs(
        `2025-01-01 ${form.time}`,
        "YYYY-MM-DD hh:mm A",
      )
    : dayjs();

  return (
    <div className="space-y-4">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mt-3 flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold text-[#000000]">
            Schedule Booking
          </h2>

          <p className="mt-0.5 truncate text-xs text-[#64748B]">
            Pick your booking slot
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4EF]">
          <CalendarDays className="h-4 w-4 text-[#b910b6]" />
        </div>
      </div>

      {/* =========================================
          DATE SELECTOR
      ========================================= */}

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">

        <div className="mb-5 flex items-center justify-between gap-2">

          <div className="min-w-0">
            <div className="text-sm font-bold text-[#0F172A]">
              Choose Date
            </div>

            <div className="mt-1 truncate text-xs text-[#94A3B8]">
              Next available booking days
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#FFF4EF] px-3 py-1.5 text-[10px] font-bold text-[#FF5C39] sm:text-xs">
            Live Availability
          </div>
        </div>

        {/* =========================================
            DATE CARDS
        ========================================= */}

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-10">

          {Array.from({
            length: 19,
          }).map((_, i) => {
            const date =
              new Date();

            date.setDate(
              date.getDate() + i,
            );

            const iso =
              date
                .toISOString()
                .split("T")[0];

            const active =
              form.date === iso;

            const fullyBooked =
              bookedDates.includes(
                iso,
              );

            return (
              <button
                key={iso}
                type="button"
                disabled={
                  fullyBooked
                }
                onClick={() =>
                  setForm({
                    ...form,
                    date: iso,
                    time: "",
                  })
                }
                className={`h-14 rounded-xl border p-1 transition-all ${
                  active
                    ? "border-[#FF5C39] bg-[#FF5C39] text-white shadow"
                    : fullyBooked
                      ? "border-red-200 bg-red-50 text-red-400 opacity-70"
                      : "border-gray-200 bg-white active:bg-orange-50"
                }`}
              >
                <div className="flex h-full flex-col items-center justify-center leading-none">

                  <span
                    className={`text-[9px] ${
                      active
                        ? "text-white/80"
                        : fullyBooked
                          ? "text-red-400"
                          : "text-[#64748B]"
                    }`}
                  >
                    {date.toLocaleDateString(
                      "en-US",
                      {
                        month:
                          "short",
                      },
                    )}
                  </span>

                  <span
                    className={`text-base font-black ${
                      fullyBooked
                        ? "text-red-500"
                        : ""
                    }`}
                  >
                    {
                      date.getDate()
                    }
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
                    {date.toLocaleDateString(
                      "en-US",
                      {
                        weekday:
                          "short",
                      },
                    )}
                  </span>

                </div>
              </button>
            );
          })}

          {/* =====================================
              MORE DATE
          ===================================== */}

          <button
            type="button"
            onClick={() =>
              setShowCalendar(
                !showCalendar,
              )
            }
            className="flex h-14 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-[#FAFAFA] p-1 hover:border-[#FF5C39] hover:bg-orange-50"
          >
            <CalendarDays className="h-4 w-4 text-[#FF5C39]" />

            <span className="mt-1 text-[9px] font-semibold">
              More
            </span>
          </button>
        </div>

        {/* =========================================
            CALENDAR MODAL
        ========================================= */}

        {showCalendar && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">

            <div className="w-full animate-in slide-in-from-bottom rounded-t-3xl bg-white shadow-2xl duration-300 sm:max-w-md sm:rounded-3xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b px-4 py-4">

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Select Date
                  </h3>

                  <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                    Choose a future booking date
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCalendar(
                      false,
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>

              </div>

              {/* CALENDAR */}

              <div className="max-h-[75vh] overflow-y-auto p-3">
                <BookingCalendar
                  open={
                    showCalendar
                  }
                  value={
                    form.date
                  }
                  bookedDates={
                    bookedDates
                  }
                  onClose={() =>
                    setShowCalendar(
                      false,
                    )
                  }
                  onSelect={(
                    date,
                  ) => {
                    setForm({
                      ...form,
                      date,
                      time: "",
                    });

                    setShowCalendar(
                      false,
                    );
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          TIME SECTION
      ========================================= */}

      {form.date && (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          {/* HEADER */}

          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
              <Clock3 className="h-5 w-5 text-[#FF5C39]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900">
                Select Time
              </h3>

              <p className="truncate text-xs text-slate-500">
                Choose your preferred slot
              </p>
            </div>

          </div>

          {/* SELECTED TIME */}

          {form.time && (
            <div className="px-5 pt-4">
              <div className="rounded-xl border border-orange-100 bg-orange-50 py-2 text-center">
                <span className="text-sm font-semibold text-[#FF5C39]">
                  Selected:{" "}
                  {form.time}
                </span>
              </div>
            </div>
          )}

          {/* TIME SLOTS */}

          <div className="p-5">
            <div className="grid grid-cols-4 gap-2">

              {timeSlots.map(
                (slot) => {
                  const disabled =
                    bookedSlots.includes(
                      `${form.date} ${slot}`,
                    );

                  const active =
                    form.time ===
                    slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        setForm({
                          ...form,
                          time: slot,
                        })
                      }
                      className={`h-10 rounded-xl border text-[10px] font-semibold transition-all ${
                        active
                          ? "border-[#FF5C39] bg-[#FF5C39] text-white shadow"
                          : disabled
                            ? "border-red-100 bg-red-50 text-red-400 opacity-60"
                            : "border-gray-200 bg-gray-50 active:bg-orange-50"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                },
              )}

            </div>
          </div>
        </div>
      )}

      {/* =========================================
          SERVICE PACKAGE
      ========================================= */}

      {form.time && (
        <div className="mb-20 rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">

          {/* HEADER */}

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F4FF]">
              <Timer className="h-5 w-5 text-[#6366F1]" />
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-[#0F172A]">
                Select Service Package
              </div>

              <div className="mt-0.5 text-xs text-[#94A3B8]">
                Choose booking option
              </div>
            </div>

          </div>

          {/* =========================================
              ADMIN HAS SELECTED NO PRICE
          ========================================= */}

          {visiblePriceOptions.length ===
            0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-center">
              <p className="text-xs font-semibold text-amber-700">
                No booking package is
                currently available.
              </p>

              <p className="mt-1 text-[10px] text-amber-600">
                Please contact this
                worker for pricing.
              </p>
            </div>
          )}

          {/* =========================================
              ONLY ADMIN VISIBLE PRICES
          ========================================= */}

          {visiblePriceOptions.length >
            0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

              {visiblePriceOptions.map(
                (option) => {
                  const active =
                    form.bookingType ===
                    option.key;

                  return (
                    <button
                      key={
                        option.key
                      }
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          bookingType:
                            option.key,
                        })
                      }
                      className={`h-[72px] rounded-2xl border px-3 transition-all duration-200 ${
                        active
                          ? "border-[#6366F1] bg-[#6366F1] text-white shadow-lg"
                          : "border-gray-200 bg-white hover:border-[#6366F1]/30 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="flex h-full items-center justify-between gap-2">

                        {/* TEXT */}

                        <div className="min-w-0 text-left">

                          <div
                            className={`truncate text-[11px] font-bold ${
                              active
                                ? "text-white"
                                : "text-[#0F172A]"
                            }`}
                          >
                            {
                              option.label
                            }
                          </div>

                          <div
                            className={`mt-1 flex items-center gap-0.5 text-sm font-extrabold ${
                              active
                                ? "text-white"
                                : "text-[#0F172A]"
                            }`}
                          >
                            <IndianRupee className="h-3 w-3" />

                            {
                              option.price
                            }
                          </div>

                        </div>

                        {/* ICON */}

                        <div
                          className={`shrink-0 ${
                            active
                              ? "text-white"
                              : "text-[#6366F1]"
                          }`}
                        >
                          {
                            option.icon
                          }
                        </div>

                      </div>
                    </button>
                  );
                },
              )}

            </div>
          )}

          {/* =========================================
              CURRENT SELECTION
          ========================================= */}

          {form.bookingType &&
            visiblePriceOptions.some(
              (item) =>
                item.key ===
                form.bookingType,
            ) && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5">

                <div className="flex items-center justify-between gap-3">

                  <span className="text-[10px] font-medium text-indigo-600">
                    Selected package
                  </span>

                  <span className="truncate text-xs font-bold text-indigo-700">
                    {
                      visiblePriceOptions.find(
                        (item) =>
                          item.key ===
                          form.bookingType,
                      )?.label
                    }
                  </span>

                </div>

              </div>
            )}
        </div>
      )}
    </div>
  );
}