
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOOKING_CHARGE = 49;
const REFUND_WINDOW_MS = 5 * 60 * 60 * 1000;
const POLICY_VERSION = "workkerz-booking-refund-49-v1";

const UPI_RE = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const PAID_STATUSES = [
  "paid",
  "captured",
  "success",
  "successful",
  "completed",
];

const BLOCKED_BOOKING_STATUSES = [
  "cancelled",
  "canceled",
  "completed",
  "complete",
  "work_completed",
  "rejected",
];

const OPEN_STATUSES = [
  "requested",
  "pending",
  "under_review",
  "approved",
  "processing",
];

function jsonError(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase server environment variables are missing."
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown): string {
  return getString(value).toLowerCase();
}

function normalizePhone(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/\D/g, "")
    : "";
}

function jsonObject(value: unknown): Record<string, unknown> {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

export async function POST(request: NextRequest) {
  let supabase: ReturnType<typeof getSupabaseAdmin>;

  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    console.error("[REFUND REQUEST] Configuration error:", error);

    return jsonError(
      "Refund service is not configured correctly.",
      500
    );
  }

  let body: Record<string, unknown>;

  try {
    body = jsonObject(await request.json());
  } catch {
    return jsonError("Invalid request body.");
  }

  const bookingId = getString(body.bookingId);
  const reason = getString(body.reason);
  const description = getString(body.description);

  const refundMethod = getString(body.refundMethod).toLowerCase();
  const refundDetails = jsonObject(body.refundDetails);

  if (!bookingId || !reason) {
    return jsonError(
      "Booking ID and refund reason are required."
    );
  }

  if (reason.length < 5 || reason.length > 150) {
    return jsonError(
      "Refund reason must contain between 5 and 150 characters."
    );
  }

  if (description.length > 1000) {
    return jsonError("Description cannot exceed 1000 characters.");
  }

  if (
    body.policyAccepted !== true ||
    body.policyVersion !== POLICY_VERSION
  ) {
    return jsonError(
      "Please accept the current refund policy."
    );
  }

  if (
    body.refundType !== "booking_charge" ||
    Number(body.refundAmount) !== BOOKING_CHARGE
  ) {
    return jsonError(
      "Invalid booking-charge refund request."
    );
  }

  // Validate the selected method and its destination.
  if (refundMethod !== "upi" && refundMethod !== "bank") {
    return jsonError(
      "Please select UPI or bank account."
    );
  }

  let upiId = "";
  let accountHolder = "";
  let accountNumber = "";
  let ifsc = "";

  if (refundMethod === "upi") {
    upiId = getString(refundDetails.upiId);

    if (!UPI_RE.test(upiId)) {
      return jsonError("Please enter a valid UPI ID.");
    }
  }

  if (refundMethod === "bank") {
    accountHolder = getString(refundDetails.accountHolder);
    accountNumber = getString(refundDetails.accountNumber)
      .replace(/\s/g, "");
    ifsc = getString(refundDetails.ifsc).toUpperCase();

    if (
      !accountHolder ||
      accountHolder.length > 100 ||
      !/^\d{9,18}$/.test(accountNumber) ||
      !IFSC_RE.test(ifsc)
    ) {
      return jsonError(
        "Please enter valid bank account details."
      );
    }
  }

  // Find the booking using its database ID.
  const {
    data: booking,
    error: bookingError,
  } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    console.error(
      "[REFUND REQUEST] Booking lookup failed:",
      bookingError.message
    );

    return jsonError("Unable to verify booking.", 500);
  }

  if (!booking) {
    return jsonError("Booking not found.", 404);
  }

  // Verify that the saved booking has customer contact information.
  const savedEmail = normalizeEmail(
    booking.customer_email ?? booking.email
  );

  const savedPhone = normalizePhone(
    booking.customer_phone ?? booking.phone
  );

  if (!savedEmail && !savedPhone) {
    return jsonError(
      "Customer contact details are missing from the booking record.",
      422
    );
  }

  // Reject supplied contact details that conflict with the booking.
  const submittedEmail = normalizeEmail(body.customerEmail);
  const submittedPhone = normalizePhone(body.customerPhone);

  if (
    submittedEmail &&
    savedEmail &&
    submittedEmail !== savedEmail
  ) {
    return jsonError(
      "Customer email does not match this booking.",
      403
    );
  }

  if (
    submittedPhone &&
    savedPhone &&
    submittedPhone !== savedPhone
  ) {
    return jsonError(
      "Customer phone does not match this booking.",
      403
    );
  }

  // Verify the 5-hour booking creation window.
  const createdAt = new Date(booking.created_at).getTime();
  const elapsed = Date.now() - createdAt;

  if (
    !Number.isFinite(createdAt) ||
    elapsed < 0 ||
    elapsed > REFUND_WINDOW_MS
  ) {
    return jsonError(
      "The 5-hour booking-charge refund window has expired.",
      409
    );
  }

  const paymentStatus = getString(booking.payment_status)
    .toLowerCase();

  if (!PAID_STATUSES.includes(paymentStatus)) {
    return jsonError(
      "Only successfully paid bookings are eligible.",
      409
    );
  }

  const bookingStatus = getString(booking.booking_status)
    .toLowerCase();

  if (BLOCKED_BOOKING_STATUSES.includes(bookingStatus)) {
    return jsonError(
      "This booking is not eligible for a refund request.",
      409
    );
  }

  // Check for an existing cancellation/refund request.
  const {
    data: previousRequests,
    error: previousError,
  } = await supabase
    .from("booking_cancellation_requests")
    .select("id,status,refund_status")
    .eq("booking_id", booking.id)
    .order("requested_at", { ascending: false })
    .limit(100);

  if (previousError) {
    console.error(
      "[REFUND REQUEST] Existing request lookup failed:",
      previousError.message
    );

    return jsonError(
      "Unable to check previous requests.",
      500
    );
  }

  const hasActiveRequest = (previousRequests ?? []).some((item) => {
    const status = getString(item.status).toLowerCase();
    const refundStatus = getString(item.refund_status).toLowerCase();

    return (
      OPEN_STATUSES.includes(status) ||
      [
        "processing",
        "processed",
        "completed",
      ].includes(refundStatus)
    );
  });

  if (hasActiveRequest) {
    return jsonError(
      "A cancellation or refund request already exists for this booking.",
      409
    );
  }

  const now = new Date().toISOString();
  const fullReason = description
    ? `${reason}: ${description}`
    : reason;

  // Insert only columns that exist in your current request schema.
  // refund_type is intentionally omitted.
  const {
    data: savedRequest,
    error: insertError,
  } = await supabase
    .from("booking_cancellation_requests")
    .insert({
      booking_id: booking.id,
      booking_number: String(
        booking.booking_number ??
          booking.booking_id ??
          booking.id
      ),
      customer_name: String(
        booking.customer_name ?? "Customer"
      ),
      customer_phone:
        booking.customer_phone ?? booking.phone ?? null,
      customer_email:
        booking.customer_email ?? booking.email ?? null,
      reason: fullReason,
      cancellation_reason: reason,
      refund_method: refundMethod,
      refund_amount: BOOKING_CHARGE,
      status: "requested",
      refund_status: "pending",
      requested_at: now,
      updated_at: now,
    })
    .select(
      "id,booking_id,booking_number,status,refund_status,refund_method,refund_amount,requested_at"
    )
    .single();

  if (insertError || !savedRequest) {
    console.error(
      "[REFUND REQUEST] Insert failed:",
      insertError?.message
    );

    return jsonError(
      "Unable to save refund request.",
      500
    );
  }

  // Save UPI/bank details in the separate destination table.
  const {
    error: detailsError,
  } = await supabase
    .from("booking_cancellation_refund_details")
    .insert({
      request_id: savedRequest.id,
      booking_id: booking.id,
      refund_method: refundMethod,

      refund_account_holder_name:
        refundMethod === "bank" ? accountHolder : null,

      refund_bank_name: null,

      refund_account_number:
        refundMethod === "bank" ? accountNumber : null,

      refund_ifsc_code:
        refundMethod === "bank" ? ifsc : null,

      refund_upi_id:
        refundMethod === "upi" ? upiId : null,
    });

  if (detailsError) {
    console.error(
      "[REFUND REQUEST] Destination insert failed:",
      detailsError.message
    );

    // Remove the incomplete request if destination storage fails.
    const { error: rollbackError } = await supabase
      .from("booking_cancellation_requests")
      .delete()
      .eq("id", savedRequest.id);

    if (rollbackError) {
      console.error(
        "[REFUND REQUEST] Rollback failed:",
        rollbackError.message
      );
    }

    return jsonError(
      "Unable to save refund details. Please try again.",
      500
    );
  }

  return NextResponse.json(
    {
      success: true,
      requestId: savedRequest.id,
      message: "Refund request submitted for admin review.",
    },
    { status: 201 }
  );
}
