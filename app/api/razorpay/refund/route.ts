
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

type RefundRequestBody = {
  transactionId?: string;
  refundAmount?: number | string | null;
  refundReason?: string;
  cancellationRequestId?: string;
};

type RazorpayRefundResponse = {
  id: string;
  status: string;
  amount?: number;
};

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate admin.
    const authorization = req.headers.get("authorization");
    const token = authorization
      ?.match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid session." },
        { status: 401 }
      );
    }

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Admin lookup failed:", adminError.message);
      return NextResponse.json(
        { success: false, message: "Unable to verify admin." },
        { status: 500 }
      );
    }

    if (
      !admin ||
      !admin.is_active ||
      !["admin", "super_admin"].includes(String(admin.role))
    ) {
      return NextResponse.json(
        { success: false, message: "Admin access denied." },
        { status: 403 }
      );
    }

    // 2. Validate request.
    let body: RefundRequestBody;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const transactionId =
      typeof body.transactionId === "string"
        ? body.transactionId.trim()
        : "";

    const cancellationRequestId =
      typeof body.cancellationRequestId === "string"
        ? body.cancellationRequestId.trim()
        : "";

    const refundReason =
      typeof body.refundReason === "string" && body.refundReason.trim()
        ? body.refundReason.trim().slice(0, 500)
        : "Customer refund";

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: "Transaction ID is required." },
        { status: 400 }
      );
    }

    // 3. Fetch transaction.
    const { data: transaction, error: transactionError } =
      await supabaseAdmin
        .from("financial_transactions")
        .select("*")
        .eq("id", transactionId)
        .maybeSingle();

    if (transactionError) {
      console.error("Transaction lookup failed:", transactionError.message);
      return NextResponse.json(
        { success: false, message: "Unable to load transaction." },
        { status: 500 }
      );
    }

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Financial transaction not found." },
        { status: 404 }
      );
    }

    if (
      !["paid", "partially_refunded"].includes(
        String(transaction.status)
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Transaction is not eligible for a refund." },
        { status: 400 }
      );
    }

    if (!transaction.razorpay_payment_id) {
      return NextResponse.json(
        { success: false, message: "Razorpay payment ID not found." },
        { status: 400 }
      );
    }

    // 4. Verify approved booking cancellation.
    if (transaction.source_type === "booking") {
      if (!cancellationRequestId) {
        return NextResponse.json(
          {
            success: false,
            message: "Cancellation request ID is required for booking refunds.",
          },
          { status: 400 }
        );
      }

      const { data: cancellation, error: cancellationError } =
        await supabaseAdmin
          .from("booking_cancellation_requests")
          .select("id, booking_id, status, admin_reviewed_by")
          .eq("id", cancellationRequestId)
          .eq("booking_id", transaction.source_id)
          .maybeSingle();

      if (cancellationError) {
        console.error("Cancellation lookup failed:", cancellationError.message);
        return NextResponse.json(
          { success: false, message: "Unable to verify cancellation." },
          { status: 500 }
        );
      }

      if (!cancellation || cancellation.status !== "approved") {
        return NextResponse.json(
          {
            success: false,
            message: "Cancellation request has not been approved.",
          },
          { status: 409 }
        );
      }

      if (!cancellation.admin_reviewed_by) {
        return NextResponse.json(
          {
            success: false,
            message: "Admin approval record is incomplete.",
          },
          { status: 409 }
        );
      }

      const { data: existingRefund, error: existingRefundError } =
        await supabaseAdmin
          .from("refunds")
          .select("id, status, razorpay_refund_id")
          .eq("cancellation_request_id", cancellationRequestId)
          .maybeSingle();

      if (existingRefundError) {
        console.error("Refund lookup failed:", existingRefundError.message);
        return NextResponse.json(
          { success: false, message: "Unable to verify refund history." },
          { status: 500 }
        );
      }

      if (existingRefund) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A refund record already exists. Check its status before retrying.",
            refundStatus: existingRefund.status,
            refundId: existingRefund.razorpay_refund_id,
          },
          { status: 409 }
        );
      }
    }

    // 5. Verify captured payment and amount.
    const payment = await razorpay.payments.fetch(
      transaction.razorpay_payment_id
    );

    if (payment.status !== "captured") {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay payment is not captured.",
          paymentStatus: payment.status,
        },
        { status: 400 }
      );
    }

    const originalAmount = Number(transaction.amount);
    const capturedAmount = Number(payment.amount) / 100;
    const alreadyRefunded = Number(transaction.refund_amount || 0);

    if (
      !Number.isFinite(originalAmount) ||
      originalAmount <= 0 ||
      !Number.isFinite(capturedAmount) ||
      capturedAmount <= 0 ||
      Math.abs(capturedAmount - originalAmount) > 0.01
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Captured amount does not match the transaction amount. Manual review is required.",
        },
        { status: 409 }
      );
    }

    if (
      !Number.isFinite(alreadyRefunded) ||
      alreadyRefunded < 0 ||
      alreadyRefunded > capturedAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Stored refund amount is invalid. Manual review is required.",
        },
        { status: 409 }
      );
    }

    const refundableAmount =
      Math.round((capturedAmount - alreadyRefunded) * 100) / 100;

    if (refundableAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No refundable balance remains.",
          refundableAmount: 0,
        },
        { status: 409 }
      );
    }

    const requestedRefund =
      body.refundAmount == null
        ? refundableAmount
        : Number(body.refundAmount);

    if (
      !Number.isFinite(requestedRefund) ||
      requestedRefund <= 0 ||
      requestedRefund > refundableAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid refund amount.",
          refundableAmount,
        },
        { status: 400 }
      );
    }

    const requestedRefundPaise = Math.round(requestedRefund * 100);

    if (
      Math.abs(requestedRefundPaise / 100 - requestedRefund) > 0.001
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Refund amount can have at most two decimal places.",
        },
        { status: 400 }
      );
    }

    // 6. Reserve refund record for booking cancellations.
    const now = new Date().toISOString();
    const refundNumber =
      `REF-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    let refundRecordId: string | null = null;

    if (transaction.source_type === "booking") {
      const { data: insertedRefund, error: insertError } =
        await supabaseAdmin
          .from("refunds")
          .insert({
            refund_number: refundNumber,
            financial_transaction_id: transaction.id,
            cancellation_request_id: cancellationRequestId,
            approved_by: user.id,
            approved_at: now,
            source_type: transaction.source_type,
            source_id: transaction.source_id,
            customer_id: transaction.customer_id,
            customer_name: transaction.customer_name,
            customer_email: transaction.customer_email,
            original_amount: capturedAmount,
            refund_amount: requestedRefund,
            reason: refundReason,
            status: "processing",
            razorpay_payment_id: transaction.razorpay_payment_id,
            requested_at: now,
            created_at: now,
            updated_at: now,
            metadata: {
              transaction_number: transaction.transaction_number,
              cancellation_request_id: cancellationRequestId,
              initiated_by: user.id,
            },
          })
          .select("id")
          .single();

      if (insertError || !insertedRefund) {
        console.error("Refund reservation failed:", insertError?.message);
        return NextResponse.json(
          {
            success: false,
            message: "Could not reserve refund processing. No refund was initiated.",
          },
          { status: 409 }
        );
      }

      refundRecordId = insertedRefund.id;

      const { error: cancellationUpdateError } =
        await supabaseAdmin
          .from("booking_cancellation_requests")
          .update({
            refund_status: "processing",
            refund_initiated_at: now,
            updated_at: now,
          })
          .eq("id", cancellationRequestId)
          .eq("status", "approved");

      if (cancellationUpdateError) {
        console.error(
          "Cancellation status update failed:",
          cancellationUpdateError.message
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Refund reserved but cancellation status update failed. Reconcile before retrying.",
            refundRecordId,
          },
          { status: 500 }
        );
      }
    }

    // 7. Initiate Razorpay refund.
    // Some Razorpay SDK typings incorrectly declare this method as void.
    // Convert the response to unknown, then validate its runtime shape.
    let rawRefundResponse: unknown;

    try {
      rawRefundResponse = await razorpay.payments.refund(
        transaction.razorpay_payment_id,
        {
          amount: requestedRefundPaise,
          notes: {
            reason: refundReason,
            source_type: String(transaction.source_type || ""),
            source_id: String(transaction.source_id || ""),
            cancellation_request_id: cancellationRequestId,
            initiated_by: user.id,
          },
        }
      ) as unknown;
    } catch (providerError) {
      console.error("Razorpay refund result uncertain:", providerError);

      if (refundRecordId) {
        const { error: pendingUpdateError } = await supabaseAdmin
          .from("refunds")
          .update({
            failure_reason:
              "Razorpay response was unsuccessful or uncertain. Reconcile before retrying.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", refundRecordId);

        if (pendingUpdateError) {
          console.error(
            "Failed to update uncertain refund record:",
            pendingUpdateError.message
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay did not confirm the refund. Check Razorpay Dashboard and reconcile before retrying.",
          refundRecordId,
        },
        { status: 502 }
      );
    }

    const refund =
      rawRefundResponse as RazorpayRefundResponse | null;

    if (
      !refund ||
      typeof refund.id !== "string" ||
      !refund.id ||
      typeof refund.status !== "string" ||
      !refund.status
    ) {
      console.error(
        "Unexpected Razorpay refund response:",
        rawRefundResponse
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Refund response could not be verified. Check Razorpay Dashboard before retrying.",
          refundRecordId,
        },
        { status: 502 }
      );
    }

    // 8. Save refund result and transaction totals.
    const totalRefunded =
      Math.round((alreadyRefunded + requestedRefund) * 100) / 100;

    const isFullyRefunded =
      totalRefunded >= capturedAmount - 0.01;

    const financialStatus = isFullyRefunded
      ? "refunded"
      : "partially_refunded";

    const processedAt =
      refund.status === "processed"
        ? new Date().toISOString()
        : null;

    const updatedAt = new Date().toISOString();

    const { error: financialError } = await supabaseAdmin
      .from("financial_transactions")
      .update({
        status: financialStatus,
        refund_amount: totalRefunded,
        refund_reason: refundReason,
        refund_status: refund.status,
        razorpay_refund_id: refund.id,
        refunded_at: processedAt,
        updated_at: updatedAt,
      })
      .eq("id", transaction.id);

    if (financialError) {
      console.error(
        "Financial transaction update failed:",
        financialError.message
      );
    }

    let refundUpdateError: { message: string } | null = null;
    let cancellationFinalError: { message: string } | null = null;

    if (refundRecordId) {
      const { error } = await supabaseAdmin
        .from("refunds")
        .update({
          status: refund.status === "processed" ? "processed" : "processing",
          razorpay_refund_id: refund.id,
          razorpay_status: refund.status,
          processed_at: processedAt,
          updated_at: updatedAt,
        })
        .eq("id", refundRecordId);

      refundUpdateError = error;

      if (error) {
        console.error("Refund record update failed:", error.message);
      }

      const { error: cancellationFinalUpdateError } =
        await supabaseAdmin
          .from("booking_cancellation_requests")
          .update({
            refund_status: refund.status,
            razorpay_refund_id: refund.id,
            ...(processedAt ? { refund_processed_at: processedAt } : {}),
            updated_at: updatedAt,
          })
          .eq("id", cancellationRequestId);

      cancellationFinalError = cancellationFinalUpdateError;

      if (cancellationFinalUpdateError) {
        console.error(
          "Cancellation final update failed:",
          cancellationFinalUpdateError.message
        );
      }
    }

    if (
      financialError ||
      refundUpdateError ||
      cancellationFinalError
    ) {
      return NextResponse.json(
        {
          success: false,
          refundSubmitted: true,
          message:
            "Razorpay accepted the refund, but a database update failed. Reconciliation is required; do not retry blindly.",
          refundId: refund.id,
          refundRecordId,
          razorpayStatus: refund.status,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refundSubmitted: true,
      refundProcessed: refund.status === "processed",
      refundId: refund.id,
      refundRecordId,
      refundNumber: refundRecordId ? refundNumber : null,
      refundedAmount: requestedRefund,
      totalRefunded,
      remainingRefundable: Math.max(0, capturedAmount - totalRefunded),
      status: financialStatus,
      razorpayStatus: refund.status,
    });
  } catch (error) {
    console.error("RAZORPAY REFUND ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Refund request failed. Check server logs and Razorpay Dashboard before retrying.",
      },
      { status: 500 }
    );
  }
}
