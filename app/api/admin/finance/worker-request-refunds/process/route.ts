
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type RequestBody = {
  requestId?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function normalizeRefundStatus(status: string) {
  const value = String(status ?? "").toLowerCase();

  if (value === "processed") return "refunded";
  if (value === "failed") return "failed";
  if (["created", "pending", "processing"].includes(value)) {
    return "processing";
  }

  return value || "processing";
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers
      .get("authorization")
      ?.match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim();

    if (!token) {
      return jsonError("Authentication required.", 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return jsonError("Invalid session.", 401);
    }

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Admin lookup failed:", adminError.message);
      return jsonError("Unable to verify admin.", 500);
    }

    if (
      !admin ||
      !admin.is_active ||
      !["admin", "super_admin", "finance_admin"].includes(
        String(admin.role ?? "").toLowerCase()
      )
    ) {
      return jsonError("Admin access denied.", 403);
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return jsonError("Razorpay is not configured on the server.", 500);
    }

    const body = (await req.json()) as RequestBody;
    const requestId =
      typeof body.requestId === "string" ? body.requestId.trim() : "";

    if (!requestId) {
      return jsonError("Worker request ID is required.", 400);
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { data: requestRow, error: requestError } = await supabaseAdmin
      .from("worker_requests")
      .select(
        "id, cancellation_status, refund_status, refund_amount, booking_charge_amount, payment_status, razorpay_payment_id, razorpay_refund_id, refund_completed_at"
      )
      .eq("id", requestId)
      .maybeSingle();

    if (requestError) {
      console.error("Worker request lookup failed:", requestError.message);
      return jsonError("Unable to load the worker request.", 500);
    }

    if (!requestRow) {
      return jsonError("Worker request not found.", 404);
    }

    const cancellationStatus = String(
      requestRow.cancellation_status ?? ""
    ).toLowerCase();

    if (!["approved", "cancelled", "canceled"].includes(cancellationStatus)) {
      return jsonError(
        "Approve the cancellation before processing its refund.",
        409
      );
    }

    // If a refund ID already exists, check that refund instead of creating another.
    if (requestRow.razorpay_refund_id) {
      let existingRefund;

      try {
        existingRefund = await razorpay.refunds.fetch(
          requestRow.razorpay_refund_id
        );
      } catch (providerError) {
        console.error("Existing refund lookup failed:", providerError);
        return jsonError(
          "Unable to verify the existing refund. Check Razorpay Dashboard before retrying.",
          502
        );
      }

      const providerStatus = String(
        existingRefund.status ?? ""
      ).toLowerCase();

      const mappedStatus = normalizeRefundStatus(providerStatus);

      const completedAt =
        providerStatus === "processed"
          ? requestRow.refund_completed_at || new Date().toISOString()
          : null;

      const { error: syncError } = await supabaseAdmin
        .from("worker_requests")
        .update({
          refund_status: mappedStatus,
          razorpay_refund_id: existingRefund.id,
          ...(completedAt ? { refund_completed_at: completedAt } : {}),
        })
        .eq("id", requestId);

      if (syncError) {
        console.error("Refund status sync failed:", syncError.message);
        return jsonError(
          "Razorpay refund was found, but its status could not be saved.",
          500
        );
      }

      return NextResponse.json({
        success: true,
        refundSubmitted: true,
        refundProcessed: providerStatus === "processed",
        refundId: existingRefund.id,
        razorpayStatus: providerStatus,
        status: mappedStatus,
      });
    }

    const paymentId = String(
      requestRow.razorpay_payment_id ?? ""
    ).trim();

    if (!paymentId) {
      return jsonError(
        "Razorpay Payment ID is missing. Link the correct captured payment before processing a refund.",
        400
      );
    }

    let payment;

    try {
      payment = await razorpay.payments.fetch(paymentId);
    } catch (providerError) {
      console.error("Payment verification failed:", providerError);
      return jsonError(
        "Could not verify this Razorpay payment. Check the payment ID and Dashboard.",
        502
      );
    }

    if (payment.status !== "captured") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment is not captured. No refund was initiated.",
          paymentStatus: payment.status,
        },
        { status: 409 }
      );
    }

    const capturedAmount = Number(payment.amount) / 100;

    const amountValue =
      requestRow.refund_amount ?? requestRow.booking_charge_amount;

    const refundAmount = Number(amountValue);

    if (
      amountValue == null ||
      !Number.isFinite(refundAmount) ||
      refundAmount <= 0 ||
      !Number.isFinite(capturedAmount) ||
      capturedAmount <= 0 ||
      refundAmount > capturedAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid refund amount is required and cannot exceed the captured payment amount.",
          capturedAmount,
          refundAmount: amountValue,
        },
        { status: 400 }
      );
    }

    // If this call times out, reconcile in Razorpay Dashboard before retrying.
    let refund;

    try {
      refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(refundAmount * 100),
        notes: {
          source_type: "worker_request",
          worker_request_id: requestId,
          initiated_by: user.id,
          refund_reason: "Worker request cancellation",
        },
      });
    } catch (providerError) {
      console.error("Razorpay refund response uncertain:", providerError);
      return jsonError(
        "Razorpay did not confirm the refund response. Check Razorpay Dashboard before retrying to avoid a duplicate refund.",
        502
      );
    }

    const providerStatus = String(refund.status ?? "").toLowerCase();
    const mappedStatus = normalizeRefundStatus(providerStatus);
    const completedAt =
      providerStatus === "processed" ? new Date().toISOString() : null;

    const { error: updateError } = await supabaseAdmin
      .from("worker_requests")
      .update({
        razorpay_refund_id: refund.id,
        refund_status: mappedStatus,
        refund_amount: refundAmount,
        ...(completedAt ? { refund_completed_at: completedAt } : {}),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Worker request refund update failed:", updateError.message);

      return NextResponse.json(
        {
          success: false,
          refundSubmitted: true,
          refundId: refund.id,
          razorpayStatus: providerStatus,
          message:
            "Razorpay accepted the refund, but the database update failed. Do not retry; reconcile this refund ID in Razorpay Dashboard.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refundSubmitted: true,
      refundProcessed: providerStatus === "processed",
      refundId: refund.id,
      razorpayStatus: providerStatus,
      status: mappedStatus,
      refundedAmount: refundAmount,
    });
  } catch (error) {
    console.error("Worker request refund processing error:", error);

    return jsonError(
      "Refund request failed. Check server logs and Razorpay Dashboard before retrying.",
      500
    );
  }
}
