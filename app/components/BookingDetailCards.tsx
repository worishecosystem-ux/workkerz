
"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  ClipboardList,
  Hash,
  IndianRupee,
  MapPin,
  ShieldCheck,
  XCircle,
  FileText,
} from "lucide-react";

import type {
  Booking,
  RefundRequest,
} from "@/lib/booking-details";

import {
  formatCurrency,
  formatDate,
  formatLabel,
} from "@/lib/booking-details";

import InfoLine from "./InfoLine";

type BookingDetailCardsProps = {
  booking: Booking;
  address: string;
  bookingReference: string;
  serviceName: string;
  totalAmount: unknown;
  refundRequest: RefundRequest | null;
  withinWindow: boolean;
  canApply: boolean;
  onApply: () => void;
  onCancelBooking?: () => void;
  cancellingBooking?: boolean;
};

export default function BookingDetailCards({
  booking,
  address,
  bookingReference,
  serviceName,
  totalAmount,
  refundRequest,
  withinWindow,
  canApply,
  onApply,
  onCancelBooking,
  cancellingBooking = false,
}: BookingDetailCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {/* Work Information */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-xs font-extrabold text-emerald-900">
          <ClipboardList size={15} />
          Work information
        </h2>

        <InfoLine
          label="Booking reference"
          value={bookingReference}
          icon={<Hash size={13} />}
        />

        <InfoLine
          label="Service / category"
          value={serviceName}
          icon={<BriefcaseBusiness size={13} />}
        />

        <InfoLine label="Work description" value={booking.description} />

        <InfoLine
          label="Scheduled date"
          value={formatDate(booking.booking_date)}
          icon={<CalendarDays size={13} />}
        />

        <InfoLine
          label="Scheduled time"
          value={booking.booking_time}
          icon={<Clock3 size={13} />}
        />

        {onCancelBooking && (
          <button
            type="button"
            onClick={onCancelBooking}
            disabled={cancellingBooking}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle size={16} />
            {cancellingBooking
              ? "Please wait..."
              : "Cancel Booking"}
          </button>
        )}
      </div>

      {/* Work Location */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-xs font-extrabold text-emerald-900">
          <MapPin size={15} />
          Work location
        </h2>

        <InfoLine
          label="Full address"
          value={address}
          icon={<MapPin size={13} />}
        />

        <InfoLine label="Landmark" value={booking.landmark} />

        <InfoLine
          label="City / district"
          value={[booking.city, booking.district]
            .filter(Boolean)
            .join(", ")}
        />

        <InfoLine
          label="State / pincode"
          value={[booking.state, booking.pincode]
            .filter(Boolean)
            .join(" - ")}
        />

        {!address && (
          <p className="mt-2 rounded-lg bg-amber-50 p-2 text-[10px] leading-4 text-amber-800">
            Address is not present in the booking row.
          </p>
        )}
      </div>

      {/* Payment Breakdown */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-xs font-extrabold text-emerald-900">
          <IndianRupee size={15} />
          Payment breakdown
        </h2>

        <InfoLine
          label="Total amount"
          value={formatCurrency(totalAmount)}
        />

        <InfoLine
          label="Booking fee"
          value={
            booking.booking_fee != null
              ? formatCurrency(booking.booking_fee)
              : undefined
          }
        />

        <InfoLine
          label="Visit charge"
          value={
            booking.visit_charge != null
              ? formatCurrency(booking.visit_charge)
              : undefined
          }
        />

        <InfoLine
          label="Payment type"
          value={formatLabel(booking.payment_type)}
        />

        <InfoLine
          label="Payment status"
          value={formatLabel(booking.payment_status)}
        />
      </div>

      {/* Cancellation / ₹49 Refund */}
      <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-xs font-extrabold text-red-800">
          <ShieldCheck size={15} />
          Cancellation & ₹49 refund
        </h2>

        {refundRequest ? (
          <>
            <InfoLine
              label="Request status"
              value={formatLabel(refundRequest.status)}
            />

            <InfoLine
              label="Refund status"
              value={formatLabel(refundRequest.refund_status)}
            />

            <InfoLine
              label="Refund amount"
              value={formatCurrency(refundRequest.refund_amount ?? 49)}
            />

            <InfoLine
              label="Request reason"
              value={
                refundRequest.reason ||
                refundRequest.cancellation_reason
              }
            />

            {(refundRequest.refund_expected_from ||
              refundRequest.refund_expected_by) && (
              <InfoLine
                label="Expected refund window"
                value={`${formatDate(refundRequest.refund_expected_from)} – ${formatDate(refundRequest.refund_expected_by)}`}
              />
            )}

            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-[10px] leading-4 text-amber-800">
              Your cancellation request has already been recorded. Check the
              request status above for updates.
            </p>
          </>
        ) : (
          <>
            <InfoLine
              label="Eligible booking charge"
              value={formatCurrency(49)}
            />

            <p className="py-2 text-[10px] leading-4 text-gray-600">
              The ₹49 booking-charge refund request must be submitted within
              5 hours of booking creation and is subject to the existing
              refund policy and admin verification.
            </p>

            {!withinWindow && (
              <p className="rounded-lg bg-amber-50 p-2 text-[10px] leading-4 text-amber-800">
                The 5-hour refund window has expired or the booking time
                could not be verified.
              </p>
            )}

            {canApply && (
              <button
                type="button"
                onClick={onApply}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-xs font-extrabold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
              >
                <FileText size={15} />
                Cancel Request
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
