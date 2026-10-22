"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  ChevronRight,
  RefreshCw,
  UserRound,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import BookingOverview from "@/app/components/BookingOverview";
import BookingDetailCards from "@/app/components/BookingDetailCards";

import BookingDetailsModal, {
  type ModalType,
  type RefundFormValues,
} from "@/app/components/BookingDetailsModal";

import type { Booking, RefundRequest } from "@/lib/booking-details";

import {
  getAddress,
  getBookingCharge,
  isWithinRefundWindow,
} from "@/lib/booking-details";

const POLICY_VERSION = "workkerz-booking-refund-19-v1";

const PAID_STATUSES = [
  "paid",
  "captured",
  "success",
  "successful",
  "completed",
];

const CANCELLED_STATUSES = ["cancelled", "canceled"];

const COMPLETED_STATUSES = ["completed", "complete", "work_completed"];

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const bookingIdParam = Array.isArray(params.bookingId)
    ? params.bookingId[0]
    : params.bookingId;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const [refundError, setRefundError] = useState("");
  const [refundSuccess, setRefundSuccess] = useState("");

  const [refundRequest, setRefundRequest] = useState<RefundRequest | null>(
    null,
  );

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const loadBooking = useCallback(async () => {
    if (!bookingIdParam) {
      setBooking(null);
      setRefundRequest(null);
      setLoadError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_id", bookingIdParam)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setBooking(null);
        setRefundRequest(null);
        setLoadError("Booking not found.");
        return;
      }

      setBooking(data as Booking);

      const { data: requestData, error: requestError } = await supabase
        .from("booking_cancellation_requests")
        .select(
          [
            "id",
            "booking_id",
            "status",
            "refund_status",
            "refund_amount",
            "refund_expected_from",
            "refund_expected_by",
            "cancellation_reason",
            "reason",
            "requested_at",
          ].join(","),
        )
        .eq("booking_id", data.id)
        .order("requested_at", { ascending: false })
        .limit(1);

      if (requestError) {
        console.error("REFUND REQUEST LOAD ERROR:", requestError.message);

        setRefundRequest(null);
      } else {
        const row = requestData?.[0];

        setRefundRequest(row ? (row as unknown as RefundRequest) : null);
      }
    } catch (error) {
      console.error("BOOKING DETAILS ERROR:", error);

      setLoadError(
        error instanceof Error ? error.message : "Unable to load booking.",
      );

      setBooking(null);
      setRefundRequest(null);
    } finally {
      setLoading(false);
    }
  }, [bookingIdParam]);

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const address = useMemo(
    () => (booking ? getAddress(booking) : ""),
    [booking],
  );

  const totalAmount =
    booking?.grand_total ??
    booking?.payable_amount ??
    booking?.total_amount ??
    booking?.booking_fee ??
    0;

  const workerName =
    booking?.worker_name ||
    booking?.worker?.full_name ||
    booking?.worker?.name ||
    booking?.worker?.worker_name ||
    "Assigned worker";

  const workerPhone =
    booking?.worker_phone ||
    booking?.worker?.phone ||
    booking?.worker?.mobile_number ||
    "";

  const serviceName =
    booking?.service_name ||
    booking?.service ||
    booking?.category ||
    "Work booking";

  const bookingReference =
    booking?.booking_number || booking?.booking_id || booking?.id || "";

  const normalizedStatus = String(booking?.booking_status || "")
    .trim()
    .toLowerCase();

  const alreadyCancelled = CANCELLED_STATUSES.includes(normalizedStatus);

  const completed = COMPLETED_STATUSES.includes(normalizedStatus);

  const paid = PAID_STATUSES.includes(
    String(booking?.payment_status || "")
      .trim()
      .toLowerCase(),
  );

  const withinWindow = booking ? isWithinRefundWindow(booking) : false;

  const hasRefundRequest = Boolean(refundRequest);

  const canApply = Boolean(
    booking &&
    paid &&
    !alreadyCancelled &&
    !completed &&
    withinWindow &&
    !hasRefundRequest,
  );

  const handleRefundSubmit = async (
    event: FormEvent<HTMLFormElement>,
    values?: RefundFormValues,
  ) => {
    event.preventDefault();

    if (submittingRefund) return;

    setRefundError("");
    setRefundSuccess("");

    // Fix: prevent undefined values.reason crash.
    if (
      !values ||
      typeof values.reason !== "string" ||
      !values.refundDetails ||
      (values.refundMethod !== "upi" && values.refundMethod !== "bank")
    ) {
      console.error("Invalid refund form payload:", values);
      setRefundError(
        "Form data missing. Please close and reopen the refund form.",
      );
      return;
    }

    if (!booking?.id) {
      setRefundError("Booking ID is missing.");
      return;
    }

    if (!paid) {
      setRefundError(
        "A successful payment is required before requesting a refund.",
      );
      return;
    }

    if (!isWithinRefundWindow(booking)) {
      setRefundError(
        "Refund requests are allowed only within 5 hours of booking creation.",
      );
      return;
    }

    if (alreadyCancelled || completed || refundRequest) {
      setRefundError("This booking is not eligible for a new refund request.");
      return;
    }

    const reason = values.reason.trim();

    if (reason.length < 5 || reason.length > 150) {
      setRefundError(
        "Please enter a refund reason between 5 and 150 characters.",
      );
      return;
    }

    let refundDetails: RefundFormValues["refundDetails"];

    if (values.refundMethod === "upi") {
      if (
        !("upiId" in values.refundDetails) ||
        typeof values.refundDetails.upiId !== "string"
      ) {
        setRefundError("Please enter your UPI ID.");
        return;
      }

      const upiId = values.refundDetails.upiId.trim();

      if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(upiId)) {
        setRefundError("Please enter a valid UPI ID.");
        return;
      }

      refundDetails = { upiId };
    } else {
      if (
        !("accountHolder" in values.refundDetails) ||
        typeof values.refundDetails.accountHolder !== "string" ||
        typeof values.refundDetails.accountNumber !== "string" ||
        typeof values.refundDetails.ifsc !== "string"
      ) {
        setRefundError("Please enter your bank account details.");
        return;
      }

      const accountHolder = values.refundDetails.accountHolder.trim();

      const accountNumber = values.refundDetails.accountNumber.replace(
        /\s/g,
        "",
      );

      const ifsc = values.refundDetails.ifsc.trim().toUpperCase();

      if (!accountHolder || accountHolder.length > 100) {
        setRefundError("Please enter a valid account holder name.");
        return;
      }

      if (!/^\d{9,18}$/.test(accountNumber)) {
        setRefundError("Please enter a valid bank account number.");
        return;
      }

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        setRefundError("Please enter a valid IFSC code.");
        return;
      }

      refundDetails = {
        accountHolder,
        accountNumber,
        ifsc,
      };
    }

    setSubmittingRefund(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Please log in again to submit your refund request.");
      }

      const response = await fetch("/api/bookings/cancellation-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          reason,
          refundType: "booking_charge",
          refundAmount: getBookingCharge(),
          refundMethod: values.refundMethod,
          refundDetails,
          policyVersion: POLICY_VERSION,
          policyAccepted: true,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.success !== true) {
        throw new Error(
          result?.error ||
            result?.message ||
            `Refund request failed (${response.status}).`,
        );
      }

      setRefundSuccess(
        result?.message ||
          "₹49 booking charge refund request submitted for admin review.",
      );

      setRefundReason("");
      setActiveModal(null);

      void loadBooking();
    } catch (error) {
      console.error("REFUND REQUEST ERROR:", error);

      setRefundError(
        error instanceof Error
          ? error.message
          : "Unable to submit refund request.",
      );
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-emerald-50/50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-3">
          <div className="h-8 w-48 rounded-lg bg-emerald-100" />
          <div className="h-28 rounded-2xl bg-emerald-100" />
          <div className="h-56 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-emerald-50/50 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-600" />

          <h1 className="mt-3 text-lg font-bold text-gray-900">
            Booking not found
          </h1>

          <p className="mt-2 break-words text-xs text-gray-600">
            {loadError || "Unable to find this booking."}
          </p>

          <button
            type="button"
            onClick={() => void loadBooking()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
          >
            <RefreshCw size={14} />
            Try again
          </button>

          <Link
            href="/my-bookings"
            className="mt-3 block text-xs font-semibold text-emerald-800 hover:underline"
          >
            Back to all bookings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-emerald-50/60 px-3 py-4 text-gray-900 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl space-y-4 pt-12">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-700"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <Link
            href="/my-bookings"
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            All bookings
          </Link>
        </div>

        <BookingOverview
          booking={booking}
          bookingReference={String(bookingReference)}
          serviceName={serviceName}
          totalAmount={totalAmount}
        />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveModal("user")}
            className="group rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-500 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <UserRound size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Customer
                </span>

                <span className="mt-0.5 block truncate text-sm font-bold">
                  {booking.customer_name || "User details"}
                </span>

                <span className="mt-0.5 block text-[10px] text-gray-500">
                  View full customer details
                </span>
              </span>

              <ChevronRight size={17} className="text-emerald-700" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("worker")}
            className="group rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-500 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <BriefcaseBusiness size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Assigned worker
                </span>

                <span className="mt-0.5 block truncate text-sm font-bold">
                  {workerName}
                </span>

                <span className="mt-0.5 block text-[10px] text-gray-500">
                  View full worker details
                </span>
              </span>

              <ChevronRight size={17} className="text-emerald-700" />
            </div>
          </button>
        </section>

        <BookingDetailCards
          booking={booking}
          address={address}
          bookingReference={String(bookingReference)}
          serviceName={serviceName}
          totalAmount={totalAmount}
          refundRequest={refundRequest}
          withinWindow={withinWindow}
          canApply={canApply}
          onApply={() => {
            setRefundError("");
            setRefundSuccess("");
            setActiveModal("refund");
          }}
        />

        {alreadyCancelled && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <XCircle size={16} className="mt-0.5 shrink-0" />
            <p>
              This booking has already been cancelled. Check the refund status
              in the booking details.
            </p>
          </div>
        )}

        {refundSuccess && (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
          >
            {refundSuccess}
          </p>
        )}

        {refundError && (
          <p
            role="alert"
            className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800"
          >
            {refundError}
          </p>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] leading-4 text-emerald-900">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          <p>
            Refund requests are reviewed by admin. Submitting a request does not
            itself cancel the booking or initiate a Razorpay refund. Only the
            ₹49 booking charge is covered by this form.
          </p>
        </div>
      </div>

      <BookingDetailsModal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        booking={booking}
        address={address}
        bookingReference={String(bookingReference)}
        serviceName={serviceName}
        workerName={workerName}
        workerPhone={workerPhone}
        reason={refundReason}
        setReason={setRefundReason}
        submitting={submittingRefund}
        error={refundError}
        success={refundSuccess}
        onClearError={() => setRefundError("")}
        onSubmit={handleRefundSubmit}
      />
    </main>
  );
}
