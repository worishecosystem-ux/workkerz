"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import type { WorkerBooking } from "../types/booking";

type Props = {
  booking: WorkerBooking | null;
  onClose: () => void;
};

function text(value: string | null | undefined) {
  return value || "Not available";
}

function amount(value: number | null | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function date(value: string | null) {
  if (!value) return "Date not set";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fullDate(value: string | null) {
  if (!value) return "Date not set";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatus(booking: WorkerBooking) {
  if (booking.booking_status === "completed") {
    return {
      label: "Completed",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    };
  }

  if (booking.booking_status === "rejected") {
    return {
      label: "Cancelled",
      dot: "bg-rose-500",
      text: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-100",
    };
  }

  if (booking.work_status === "active") {
    return {
      label: "Work in Progress",
      dot: "bg-orange-500",
      text: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-100",
    };
  }

  if (booking.booking_status === "confirmed") {
    return {
      label: "Confirmed",
      dot: "bg-blue-500",
      text: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-100",
    };
  }

  return {
    label: "Pending",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
  };
}

export default function BookingDetails({
  booking,
  onClose,
}: Props) {
  const [workerPhone, setWorkerPhone] = useState<string | null>(
    booking?.worker_phone || null
  );

  const [workerLoading, setWorkerLoading] = useState(false);

  /*
   * =========================================================
   * FETCH WORKER PHONE
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function fetchWorkerPhone() {
      if (!booking?.worker_id) {
        setWorkerPhone(null);
        return;
      }

      if (booking.worker_phone) {
        setWorkerPhone(booking.worker_phone);
        return;
      }

      setWorkerLoading(true);

      try {
        const { data, error } = await supabase
          .from("workers")
          .select("phone")
          .eq("id", booking.worker_id)
          .maybeSingle();

        if (error) {
          console.error("FETCH WORKER PHONE ERROR:", error);

          if (!cancelled) {
            setWorkerPhone(null);
          }

          return;
        }

        if (!cancelled) {
          setWorkerPhone(data?.phone || null);
        }
      } catch (error) {
        console.error("FETCH WORKER PHONE ERROR:", error);

        if (!cancelled) {
          setWorkerPhone(null);
        }
      } finally {
        if (!cancelled) {
          setWorkerLoading(false);
        }
      }
    }

    fetchWorkerPhone();

    return () => {
      cancelled = true;
    };
  }, [booking?.worker_id, booking?.worker_phone]);

  if (!booking) return null;

  const status = getStatus(booking);

  /*
   * =========================================================
   * COPY BOOKING ID
   * =========================================================
   */

  const copyId = async () => {
    if (!booking.booking_id) return;

    try {
      await navigator.clipboard.writeText(booking.booking_id);
    } catch {
      // Clipboard unavailable
    }
  };

  /*
   * =========================================================
   * ADDRESS CHECK
   * =========================================================
   */

  const hasAddress =
    Boolean(booking.house_no) ||
    Boolean(booking.address) ||
    Boolean(booking.landmark) ||
    Boolean(booking.city) ||
    Boolean(booking.district) ||
    Boolean(booking.state) ||
    Boolean(booking.pincode);

  return (
    <div
      className="
        fixed
        left-0
        right-0
        top-0
        bottom-0
        z-[9999]
        flex
        justify-end
        bg-slate-950/55
        backdrop-blur-[2px]
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          flex
          h-[100dvh]
          w-full
          flex-col
          overflow-hidden
          bg-[#f7f8fa]
          shadow-[-20px_0_70px_rgba(15,23,42,0.18)]
          sm:h-full
          sm:max-w-[720px]
          sm:border-l
          sm:border-slate-200
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header className="shrink-0 bg-white pt-12">
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              px-4
              py-3
              sm:px-6
              sm:py-4
            "
          >
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-950
                  text-white
                  sm:h-11
                  sm:w-11
                  sm:rounded-2xl
                "
              >
                <ReceiptText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-black text-slate-950 sm:text-base">
                    Booking Details
                  </h2>

                  {/* DESKTOP STATUS */}
                  <span
                    className={`
                      hidden
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      sm:inline-flex
                      ${status.bg}
                      ${status.text}
                      ${status.border}
                    `}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                    />

                    {status.label}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-[11px] text-slate-400 sm:text-xs">
                  Booking #{text(booking.booking_id)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-500
                transition
                hover:bg-slate-50
                hover:text-slate-950
                active:scale-95
                sm:h-10
                sm:w-10
              "
              aria-label="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* =================================================
              MOBILE STATUS
          ================================================= */}

          <div className="border-b border-slate-100 px-4 py-2.5 sm:hidden">
            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                text-[10px]
                font-bold
                ${status.bg}
                ${status.text}
                ${status.border}
              `}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
              />

              {status.label}
            </span>
          </div>
        </header>

        {/* =================================================
            SCROLL CONTENT
        ================================================= */}

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div
            className="
              space-y-3
              p-3
              pb-4
              sm:space-y-4
              sm:p-5
            "
          >
            {/* =================================================
                BOOKING HERO
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="bg-slate-950 px-4 py-4 text-white sm:px-6 sm:py-5">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-orange-500
                        sm:h-12
                        sm:w-12
                        sm:rounded-2xl
                      "
                    >
                      <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Requested Service
                      </p>

                      <h3 className="mt-1 truncate text-base font-black sm:text-lg">
                        {text(booking.service_type)}
                      </h3>

                      <p className="mt-0.5 truncate text-[11px] text-slate-400 sm:mt-1 sm:text-xs">
                        {text(booking.worker_specialty)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:text-[9px]">
                      Total
                    </p>

                    <p className="mt-0.5 text-lg font-black sm:mt-1 sm:text-xl">
                      {amount(booking.grand_total)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 sm:mt-5 sm:pt-4">
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:text-[9px]">
                      Booking ID
                    </p>

                    <p className="mt-1 truncate text-[11px] font-bold text-slate-200 sm:text-xs">
                      #{text(booking.booking_id)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyId}
                    className="
                      flex
                      h-8
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-white/10
                      px-2.5
                      text-[10px]
                      font-bold
                      text-slate-300
                      transition
                      hover:bg-white/15
                      hover:text-white
                      active:scale-95
                    "
                  >
                    <Copy className="h-3 w-3" />
                    Copy ID
                  </button>
                </div>
              </div>

              {/* =================================================
                  SCHEDULE
              ================================================= */}

              <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <ScheduleItem
                  icon={<CalendarDays />}
                  label="Scheduled Date"
                  value={fullDate(booking.booking_date)}
                />

                <ScheduleItem
                  icon={<Clock3 />}
                  label="Scheduled Time"
                  value={text(booking.booking_time)}
                />
              </div>
            </section>

            {/* =================================================
                CUSTOMER / WORKER
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <SectionHeader
                icon={<UserRound />}
                title="People"
              />

              <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                {/* CUSTOMER */}

                <ProfileRow
                  label="Customer"
                  name={booking.customer_name}
                  subtitle={booking.customer_phone}
                  icon={<UserRound />}
                  action={
                    booking.customer_phone ? (
                      <a
                        href={`tel:${booking.customer_phone}`}
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-emerald-50
                          text-emerald-600
                          transition
                          hover:bg-emerald-100
                          active:scale-95
                        "
                        aria-label="Call customer"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    ) : null
                  }
                />

                {/* ASSIGNED WORKER */}

                <ProfileRow
                  label="Assigned Worker"
                  name={booking.worker_name}
                  subtitle={
                    workerLoading
                      ? "Fetching phone number..."
                      : workerPhone || booking.worker_specialty
                  }
                  image={booking.worker_photo}
                  icon={<UserRound />}
                  rating={
                    booking.worker_rating
                      ? `${booking.worker_rating} ★`
                      : undefined
                  }
                  action={
                    workerPhone ? (
                      <a
                        href={`tel:${workerPhone}`}
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-emerald-50
                          text-emerald-600
                          transition
                          hover:bg-emerald-100
                          active:scale-95
                        "
                        aria-label={`Call ${booking.worker_name || "worker"
                          }`}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    ) : null
                  }
                />
              </div>
            </section>

            {/* =================================================
                LOCATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <SectionHeader
                icon={<MapPin />}
                title="Work Location"
              />

              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 sm:mt-5 sm:p-4">
                {hasAddress ? (
                  <div className="space-y-3 sm:space-y-4">
                    {/* MAIN ADDRESS */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm sm:h-11 sm:w-11">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Service Address
                          </p>

                          {booking.address_type && (
                            <span className="rounded-md bg-white px-2 py-0.5 text-[9px] font-bold capitalize text-slate-500">
                              {booking.address_type}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs font-bold leading-5 text-slate-800 sm:text-sm">
                          {[booking.house_no, booking.address]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        {booking.landmark && (
                          <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                            Landmark: {booking.landmark}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* LOCATION DETAILS */}

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 sm:pt-4">
                      {booking.city && (
                        <LocationItem
                          label="City"
                          value={booking.city}
                        />
                      )}

                      {booking.district && (
                        <LocationItem
                          label="District"
                          value={booking.district}
                        />
                      )}

                      {booking.state && (
                        <LocationItem
                          label="State"
                          value={booking.state}
                        />
                      )}

                      {booking.pincode && (
                        <LocationItem
                          label="Pincode"
                          value={booking.pincode}
                        />
                      )}

                      {booking.country && (
                        <LocationItem
                          label="Country"
                          value={booking.country}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 sm:text-sm">
                        Address not available
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                        No address was saved with this booking.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                BILL
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <SectionHeader
                icon={<ReceiptText />}
                title="Payment Summary"
              />

              <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 sm:mt-5 sm:p-4">
                <PriceLine
                  label="Worker Charges"
                  value={booking.total_cost}
                />

                {Number(booking.materials_cost || 0) > 0 && (
                  <PriceLine
                    label="Materials"
                    value={booking.materials_cost}
                  />
                )}

                <div className="my-3 border-t border-dashed border-slate-200 sm:my-4" />

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 sm:text-xs">
                      Grand Total
                    </p>

                    <p className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                      {amount(booking.grand_total)}
                    </p>
                  </div>

                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700 sm:text-[10px]">
                    Total Amount
                  </span>
                </div>
              </div>
            </section>

            {/* =================================================
                WORK REQUEST
            ================================================= */}

            {booking.description && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                <SectionHeader
                  icon={<FileText />}
                  title="Work Request"
                />

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 sm:mt-5 sm:p-4">
                  <p className="whitespace-pre-wrap text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                    {booking.description}
                  </p>
                </div>
              </section>
            )}

            {/* =================================================
                NOTES
            ================================================= */}

            {booking.notes && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                <SectionHeader
                  icon={<FileText />}
                  title="Customer Notes"
                />

                <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 sm:mt-5 sm:p-4">
                  <p className="whitespace-pre-wrap text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                    {booking.notes}
                  </p>
                </div>
              </section>
            )}

            {/* =================================================
                BOOKING META
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <SectionHeader
                icon={<CheckCircle2 />}
                title="Booking Information"
              />

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">
                <MetaBox
                  label="Booking Type"
                  value={text(booking.booking_type)}
                />

                <MetaBox
                  label="Created"
                  value={date(booking.created_at)}
                />

                <MetaBox
                  label="Work Status"
                  value={text(booking.work_status)}
                />

                <MetaBox
                  label="Worker Available"
                  value={
                    booking.worker_available
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </section>

            <div className="h-1 sm:h-2" />
          </div>
        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="shrink-0 border-t border-slate-200 bg-white p-3 sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="hidden sm:block">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Booking Reference
              </p>

              <p className="mt-1 text-xs font-bold text-slate-700">
                #{text(booking.booking_id)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                ml-auto
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-950
                px-5
                text-xs
                font-bold
                text-white
                transition
                hover:bg-slate-800
                active:scale-[0.98]
                sm:h-11
                sm:w-auto
                sm:px-6
              "
            >
              Close Details
              <X className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          bg-slate-100
          text-slate-600
          [&>svg]:h-4
          [&>svg]:w-4
          sm:h-9
          sm:w-9
          sm:rounded-xl
        "
      >
        {icon}
      </div>

      <h3 className="text-sm font-black text-slate-950">
        {title}
      </h3>
    </div>
  );
}

/* =========================================================
   SCHEDULE
========================================================= */

function ScheduleItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-orange-50
          text-orange-500
          [&>svg]:h-4
          [&>svg]:w-4
          sm:h-10
          sm:w-10
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
          {label}
        </p>

        <p className="mt-1 truncate text-[11px] font-bold text-slate-800 sm:text-xs">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE ROW
========================================================= */

function ProfileRow({
  label,
  name,
  subtitle,
  image,
  icon,
  rating,
  action,
}: {
  label: string;
  name: string | null | undefined;
  subtitle: string | null | undefined;
  image?: string | null;
  icon: React.ReactNode;
  rating?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2.5
        rounded-2xl
        border
        border-slate-100
        bg-slate-50
        p-3
        sm:gap-3
        sm:p-3.5
      "
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm sm:h-12 sm:w-12">
        {image ? (
          <img
            src={image}
            alt={text(name)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300 [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-black text-slate-900 sm:text-sm">
          {text(name)}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
          {text(subtitle)}
        </p>
      </div>

      {rating && (
        <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[9px] font-black text-amber-500 shadow-sm sm:text-[10px]">
          {rating}
        </span>
      )}

      {action}
    </div>
  );
}

/* =========================================================
   LOCATION ITEM
========================================================= */

function LocationItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div>
      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-semibold text-slate-700 sm:text-xs">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PRICE LINE
========================================================= */

function PriceLine({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-xs text-slate-500 sm:text-sm">
        {label}
      </span>

      <span className="text-xs font-bold text-slate-800 sm:text-sm">
        {amount(value)}
      </span>
    </div>
  );
}

/* =========================================================
   META BOX
========================================================= */

function MetaBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-2.5 sm:p-3">
      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
        {label}
      </p>

      <p className="mt-1.5 truncate text-[11px] font-bold text-slate-700 sm:text-xs">
        {value}
      </p>
    </div>
  );
}