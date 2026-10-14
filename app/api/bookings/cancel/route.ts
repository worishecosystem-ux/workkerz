
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_RE = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function getAdminClient() {
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

function getWorkStart(
  dateValue: unknown,
  timeValue: unknown
): Date | null {
  if (
    typeof dateValue !== "string" ||
    !dateValue.trim()
  ) {
    return null;
  }

  const date = dateValue.slice(0, 10);
  const time =
    typeof timeValue === "string"
      ? timeValue.trim()
      : "";

  let hours: number;
  let minutes: number;

  const time24 = time.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?$/
  );

  const time12 = time.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (time24) {
    hours = Number(time24[1]);
    minutes = Number(time24[2]);
  } else if (time12) {
    hours = Number(time12[1]);
    minutes = Number(time12[2]);

    if (hours < 1 || hours > 12) {
      return null;
    }

    const period = time12[3].toUpperCase();

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }
  } else {
    return null;
  }

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const result = new Date(`${date}T00:00:00`);

  if (Number.isNaN(result.getTime())) {
    return null;
  }

  result.setHours(hours, minutes, 0, 0);

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bookingId =
      typeof body.bookingId === "string"
        ? body.bookingId.trim()
        : "";

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    const customerPhone =
      typeof body.customerPhone === "string"
        ? body.customerPhone.trim()
        : "";

    const customerEmail =
      typeof body.customerEmail === "string"
        ? body.customerEmail.trim().toLowerCase()
        : "";

    const refundMethod =
      body.refundMethod === "bank"
        ? "bank"
        : body.refundMethod === "upi"
          ? "upi"
          : "";

    const refundAccountHolderName =
      typeof body.refundAccountHolderName === "string"
        ? body.refundAccountHolderName.trim()
        : "";

    const refundBankName =
      typeof body.refundBankName === "string"
        ? body.refundBankName.trim()
        : "";

    const refundAccountNumber =
      typeof body.refundAccountNumber === "string"
        ? body.refundAccountNumber.trim()
        : "";

    const refundIfscCode =
      typeof body.refundIfscCode === "string"
        ? body.refundIfscCode.trim().toUpperCase()
        : "";

    const refundUpiId =
      typeof body.refundUpiId === "string"
        ? body.refundUpiId.trim()
        : "";

    // 1. Validate input.
    if (!UUID_RE.test(bookingId)) {
      return jsonError("Invalid booking ID.");
    }

    if (
      !reason ||
      reason.length < 5 ||
      reason.length > 1200
    ) {
      return jsonError(
        "Please provide a valid cancellation reason."
      );
    }

    if (!customerPhone && !customerEmail) {
      return jsonError(
        "Customer contact details are required."
      );
    }

    if (!refundMethod) {
      return jsonError(
        "Select UPI or Bank Account as the refund method."
      );
    }

    if (
      refundAccountHolderName.length > 100 ||
      refundBankName.length > 100 ||
      refundAccountNumber.length > 34 ||
      refundUpiId.length > 100
    ) {
      return jsonError(
        "Refund details exceed the allowed length."
      );
    }

    if (
      refundMethod === "bank" &&
      !(
        refundAccountHolderName &&
        refundBankName &&
        refundAccountNumber.length >= 6 &&
        IFSC_RE.test(refundIfscCode)
      )
    ) {
      return jsonError(
        "Enter account holder name, bank name, account number and valid IFSC code."
      );
    }

    if (
      refundMethod === "upi" &&
      !UPI_RE.test(refundUpiId)
    ) {
      return jsonError("Enter a valid UPI ID.");
    }

    const supabase = getAdminClient();

    // 2. Fetch booking.
    const { data: booking, error: bookingError } =
      await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .maybeSingle();

    if (bookingError) {
      console.error(
        "[CANCEL] Booking lookup failed:",
        bookingError
      );

      return jsonError(
        "Could not load booking details.",
        500
      );
    }

    if (!booking) {
      return jsonError("Booking not found.", 404);
    }

    // 3. Verify customer contact against booking.
    const savedPhone = String(
      booking.customer_phone ?? booking.phone ?? ""
    ).trim();

    const savedEmail = String(
      booking.customer_email ?? booking.email ?? ""
    )
      .trim()
      .toLowerCase();

    const phoneMatches = Boolean(
      customerPhone &&
        savedPhone &&
        customerPhone.replace(/\D/g, "") ===
          savedPhone.replace(/\D/g, "")
    );

    const emailMatches = Boolean(
      customerEmail &&
        savedEmail &&
        customerEmail === savedEmail
    );

    if (!phoneMatches && !emailMatches) {
      return jsonError(
        "Customer details did not match this booking.",
        403
      );
    }

    // 4. Find existing cancellation request.
    const {
      data: existingRequest,
      error: existingError,
    } = await supabase
      .from("booking_cancellation_requests")
      .select(
        "id,booking_id,booking_number,customer_name,status,refund_status,refund_method,requested_at,updated_at"
      )
      .eq("booking_id", bookingId)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(
        "[CANCEL] Existing request lookup failed:",
        existingError
      );

      return jsonError(
        "Could not check existing cancellation requests.",
        500
      );
    }

    // 5. Existing request: save or update its refund details.
    // Do not create a duplicate cancellation request.
    if (existingRequest) {
      const existingStatus = String(
        existingRequest.status ?? ""
      ).toLowerCase();

      if (
        [
          "approved",
          "cancelled",
          "canceled",
          "rejected",
          "completed",
        ].includes(existingStatus)
      ) {
        return NextResponse.json({
          success: true,
          existing: true,
          requestId: existingRequest.id,
          bookingId: existingRequest.booking_id,
          bookingNumber: existingRequest.booking_number,
          status: existingRequest.status,
          message:
            "An existing cancellation request has already been reviewed. No new request was created.",
        });
      }

      const refundDetails = {
        request_id: existingRequest.id,
        booking_id: booking.id,
        refund_method: refundMethod,
        refund_account_holder_name:
          refundMethod === "bank"
            ? refundAccountHolderName
            : null,
        refund_bank_name:
          refundMethod === "bank"
            ? refundBankName
            : null,
        refund_account_number:
          refundMethod === "bank"
            ? refundAccountNumber
            : null,
        refund_ifsc_code:
          refundMethod === "bank"
            ? refundIfscCode
            : null,
        refund_upi_id:
          refundMethod === "upi"
            ? refundUpiId
            : null,
      };

      const {
        data: existingRefund,
        error: refundLookupError,
      } = await supabase
        .from("booking_cancellation_refund_details")
        .select("request_id")
        .eq("request_id", existingRequest.id)
        .maybeSingle();

      if (refundLookupError) {
        console.error(
          "[CANCEL] Refund details lookup failed:",
          refundLookupError
        );

        return jsonError(
          "Could not check saved refund details.",
          500
        );
      }

      if (existingRefund) {
        const { error: refundUpdateError } =
          await supabase
            .from("booking_cancellation_refund_details")
            .update(refundDetails)
            .eq("request_id", existingRequest.id);

        if (refundUpdateError) {
          console.error(
            "[CANCEL] Refund details update failed:",
            refundUpdateError
          );

          return jsonError(
            "Could not update refund details.",
            500
          );
        }
      } else {
        const { error: refundInsertError } =
          await supabase
            .from("booking_cancellation_refund_details")
            .insert(refundDetails);

        if (refundInsertError) {
          console.error(
            "[CANCEL] Refund details insert failed:",
            refundInsertError
          );

          return jsonError(
            "Could not save refund details.",
            500
          );
        }
      }

      const { error: parentUpdateError } =
        await supabase
          .from("booking_cancellation_requests")
          .update({
            refund_method: refundMethod,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRequest.id);

      if (parentUpdateError) {
        console.error(
          "[CANCEL] Request refund method update failed:",
          parentUpdateError
        );

        return jsonError(
          "Refund method could not be saved.",
          500
        );
      }

      return NextResponse.json({
        success: true,
        existing: true,
        requestId: existingRequest.id,
        bookingId: existingRequest.booking_id,
        bookingNumber: existingRequest.booking_number,
        status: existingRequest.status,
        refundMethod,
        message:
          "Existing cancellation request found. Refund details have been saved for admin review.",
      });
    }

    // 6. Validate booking status for a new request.
    const currentStatus = String(
      booking.booking_status ?? ""
    ).toLowerCase();

    if (
      ["cancelled", "canceled"].includes(currentStatus)
    ) {
      return jsonError(
        "This booking is already cancelled.",
        409
      );
    }

    if (
      [
        "completed",
        "complete",
        "work_completed",
        "rejected",
      ].includes(currentStatus)
    ) {
      return jsonError(
        "This booking can no longer be cancelled online.",
        409
      );
    }

    // 7. Enforce the six-hour cutoff for new requests.
    const workStart = getWorkStart(
      booking.booking_date,
      booking.booking_time
    );

    if (!workStart) {
      return jsonError(
        "Scheduled work date or time is missing. Contact Workkerz support.",
        409
      );
    }

    if (
      Date.now() >=
      workStart.getTime() - 6 * 60 * 60 * 1000
    ) {
      return jsonError(
        "Cancellation requests must be submitted at least 6 hours before scheduled work.",
        409
      );
    }

    const bookingNumber = String(
      booking.booking_number ??
        booking.booking_id ??
        booking.id
    );

    const customerName = String(
      booking.customer_name ?? "Customer"
    );

    // 8. Create the cancellation request.
    // Your actual schema has both "reason" and "cancellation_reason".
    const { data: savedRequest, error: insertError } =
      await supabase
        .from("booking_cancellation_requests")
        .insert({
          booking_id: booking.id,
          booking_number: bookingNumber,
          customer_name: customerName,
          customer_phone: savedPhone || customerPhone || null,
          customer_email: savedEmail || customerEmail || null,
          reason,
          cancellation_reason: reason,
          refund_method: refundMethod,
          status: "requested",
          refund_status: "pending",
          requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          "id,booking_id,booking_number,status,refund_method,refund_status,requested_at"
        )
        .single();

    if (insertError) {
      console.error(
        "[CANCEL] Request insert failed:",
        insertError
      );

      return jsonError(
        "Cancellation request could not be saved.",
        500
      );
    }

    // 9. Save sensitive refund details in the separate table.
    const { error: refundInsertError } =
      await supabase
        .from("booking_cancellation_refund_details")
        .insert({
          request_id: savedRequest.id,
          booking_id: booking.id,
          refund_method: refundMethod,
          refund_account_holder_name:
            refundMethod === "bank"
              ? refundAccountHolderName
              : null,
          refund_bank_name:
            refundMethod === "bank"
              ? refundBankName
              : null,
          refund_account_number:
            refundMethod === "bank"
              ? refundAccountNumber
              : null,
          refund_ifsc_code:
            refundMethod === "bank"
              ? refundIfscCode
              : null,
          refund_upi_id:
            refundMethod === "upi"
              ? refundUpiId
              : null,
        });

    if (refundInsertError) {
      console.error(
        "[CANCEL] Refund details insert failed:",
        refundInsertError
      );

      // Roll back the parent request if refund details could not be saved.
      const { error: rollbackError } = await supabase
        .from("booking_cancellation_requests")
        .delete()
        .eq("id", savedRequest.id);

      if (rollbackError) {
        console.error(
          "[CANCEL] Request rollback failed:",
          rollbackError
        );
      }

      return jsonError(
        "Refund details could not be saved. Please try again.",
        500
      );
    }

    // 10. The booking is NOT cancelled and no refund is issued here.
    return NextResponse.json({
      success: true,
      existing: false,
      requestId: savedRequest.id,
      bookingId: savedRequest.booking_id,
      bookingNumber: savedRequest.booking_number,
      status: savedRequest.status,
      refundStatus: savedRequest.refund_status,
      refundMethod: savedRequest.refund_method,
      requestedAt: savedRequest.requested_at,
      message:
        "Cancellation request saved. It is awaiting admin review; the booking has not been cancelled.",
    });
  } catch (error) {
    console.error(
      "[CANCEL] Unexpected error:",
      error
    );

    return jsonError(
      "Cancellation request failed. Please try again.",
      500
    );
  }
}
