
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { getFirebaseMessaging } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

type JsonObject = Record<string, unknown>;

function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function isObject(value: unknown): value is JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (!razorpaySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  }

  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", razorpaySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

function fail(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      paymentVerified: false,
      message,
    },
    { status },
  );
}

function getBookingNumber(value: unknown): string {
  if (typeof value !== "string") return "";

  const number = value.trim();

  return /^WRK-\d{6}-\d{3}$/.test(number) ? number : "";
}

function getString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const result = value.trim();
  return result || null;
}

function getNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/**
 * Sends a data-only FCM message to active Workkerz Admin Android devices.
 * Push failure must not reverse an already verified payment.
 */
async function sendAdminBookingAlert(params: {
  supabaseAdmin: ReturnType<typeof getAdminClient>;
  bookingId: string;
  bookingNumber: string;
  booking: JsonObject;
}) {
  const { supabaseAdmin, bookingId, bookingNumber, booking } = params;

  try {
    const { data: adminRows, error: tokenError } = await supabaseAdmin
      .from("admin_push_tokens")
      .select("token, platform, app_id, is_active")
      .eq("platform", "android")
      .eq("app_id", "com.workkerz.admin")
      .eq("is_active", true);

    if (tokenError) {
      console.error("[ADMIN FCM] Token lookup failed:", tokenError);
      return;
    }

    const tokens = [
      ...new Set(
        (adminRows ?? [])
          .map((row) => row.token)
          .filter(
            (token): token is string =>
              typeof token === "string" && token.trim().length > 0,
          ),
      ),
    ];

    if (tokens.length === 0) {
      console.warn("[ADMIN FCM] No active admin tokens.");
      return;
    }

    const address = [
      booking.house_no,
      booking.address,
      booking.landmark,
      booking.city,
      booking.state,
    ]
      .filter(
        (value) => typeof value === "string" && value.trim().length > 0,
      )
      .join(", ");

    const title = "New Booking Confirmed";
    const message = `${String(
      booking.customer_name || "Customer",
    )} booked ${String(booking.service_type || "Work Service")}.`;

    const dataPayload: Record<string, string> = {
      title,
      body: message,
      type: "booking",
      icon: "booking",
      booking_id: bookingId,
      booking_number: bookingNumber,
      customer_name: String(booking.customer_name || "Customer"),
      customer_phone: String(booking.customer_phone || ""),
      service: String(booking.service_type || "Work Service"),
      location: address || "Address not provided",
      booking_time: `${String(booking.booking_date || "")} ${String(
        booking.booking_time || "",
      )}`.trim(),
      amount: String(booking.grand_total ?? booking.total_cost ?? 0),
      action_url: `/admin/bookings?booking=${bookingId}`,
      show_actions: "true",
    };

    const messaging = getFirebaseMessaging();

    let successCount = 0;
    let failureCount = 0;

    for (let index = 0; index < tokens.length; index += 500) {
      const batch = tokens.slice(index, index + 500);

      const result = await messaging.sendEachForMulticast({
        tokens: batch,
        data: dataPayload,
        android: {
          priority: "high",
        },
      });

      successCount += result.successCount;
      failureCount += result.failureCount;

      result.responses.forEach((response, responseIndex) => {
        if (!response.success) {
          console.error("[ADMIN FCM] Device send failed:", {
            tokenIndex: index + responseIndex,
            errorCode: response.error?.code,
            error: response.error?.message,
          });
        }
      });
    }

    console.log("[ADMIN FCM] Booking alert processed:", {
      bookingId,
      bookingNumber,
      targetCount: tokens.length,
      successCount,
      failureCount,
    });
  } catch (error: unknown) {
    console.error("[ADMIN FCM] Booking alert exception:", error);
  }
}

/**
 * Worker Request:
 * The request is created only after server-side Razorpay signature
 * verification. razorpay_order_id is used for retry/idempotency lookup.
 */
async function handleWorkerRequestPayment(params: {
  supabaseAdmin: ReturnType<typeof getAdminClient>;
  transaction: JsonObject;
  orderId: string;
  paymentId: string;
  signature: string;
  paidAt: string;
}) {
  const {
    supabaseAdmin,
    transaction,
    orderId,
    paymentId,
    signature,
    paidAt,
  } = params;

  const metadata = isObject(transaction.metadata)
    ? transaction.metadata
    : {};

  const draft = metadata.workerRequestDraft;

  if (!isObject(draft)) {
    console.error("WORKER REQUEST DRAFT NOT FOUND:", {
      transactionId: transaction.id,
      orderId,
    });

    return fail(
      "Worker Request draft was not found. Contact support; do not pay again.",
      400,
    );
  }

  if (
    !Number.isInteger(Number(draft.workers_required)) ||
    Number(draft.workers_required) < 1 ||
    Number(draft.workers_required) > 10000 ||
    !getString(draft.location) ||
    !getString(draft.category) ||
    !getString(draft.work_date)
  ) {
    return fail("Worker Request details are incomplete or invalid.", 400);
  }

  // If the transaction is already linked, return the existing request.
  if (
    transaction.status === "paid" &&
    isUuid(transaction.source_id)
  ) {
    const { data: linkedRequest, error: linkedLookupError } =
      await supabaseAdmin
        .from("worker_requests")
        .select("id, payment_status, status")
        .eq("id", transaction.source_id)
        .maybeSingle();

    if (linkedLookupError) {
      console.error("LINKED WORKER REQUEST LOOKUP ERROR:", linkedLookupError);
      return fail("Could not retrieve the saved Worker Request.", 500);
    }

    if (linkedRequest) {
      return NextResponse.json({
        success: true,
        paymentVerified: true,
        message: "Worker Request payment was already verified.",
        transactionId: transaction.id,
        workerRequestId: linkedRequest.id,
        paymentStatus: linkedRequest.payment_status,
        status: linkedRequest.status,
        sourceType: "worker_request",
        razorpayPaymentId: paymentId,
      });
    }
  }

  // Look up by Razorpay order ID to recover from a previous partial failure.
  const { data: existingRequest, error: existingRequestError } =
    await supabaseAdmin
      .from("worker_requests")
      .select("id")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

  if (existingRequestError) {
    console.error("WORKER REQUEST LOOKUP ERROR:", existingRequestError);
    return fail("Could not check for an existing Worker Request.", 500);
  }

  let workerRequestId: string | undefined = existingRequest?.id;

  if (!workerRequestId) {
    const workersRequired = Number(draft.workers_required);

    const requestPayload = {
      project_name: getString(draft.project_name),
      project_type: getString(draft.project_type),

      workers_required: workersRequired,
      total_workers: Math.max(
        0,
        getNumber(draft.total_workers, workersRequired),
      ),

      category: getString(draft.category),
      requirements: Array.isArray(draft.requirements)
        ? draft.requirements
        : [],

      location: getString(draft.location),

      requester_type: getString(draft.requester_type),
      requester_name: getString(draft.requester_name),
      requester_mobile: getString(draft.requester_mobile),
      requester_email: getString(draft.requester_email),
      company_name: getString(draft.company_name),
      gstin: getString(draft.gstin),
      requester_address: getString(draft.requester_address),

      requester_user_id: isUuid(draft.requester_user_id)
        ? draft.requester_user_id
        : null,

      full_address: getString(draft.full_address),
      locality: getString(draft.locality),
      district: getString(draft.district),
      state: getString(draft.state),
      pincode: getString(draft.pincode),

      work_date: getString(draft.work_date),
      start_time: getString(draft.start_time),
      duration: getString(draft.duration),
      budget: draft.budget ?? null,
      requirement: getString(draft.requirement),

      status: "pending",
      source: "home",
      is_deleted: false,

      booking_charge_amount: 49,
      payment_status: "paid",
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,

      cancellation_status: "none",
      refund_status: "not_initiated",
    };

    const { data: newRequest, error: insertError } = await supabaseAdmin
      .from("worker_requests")
      .insert(requestPayload)
      .select("id")
      .maybeSingle();

    if (insertError || !newRequest?.id) {
      // A concurrent retry may have inserted the same order already.
      if (insertError?.code === "23505") {
        const { data: duplicateRequest, error: duplicateError } =
          await supabaseAdmin
            .from("worker_requests")
            .select("id")
            .eq("razorpay_order_id", orderId)
            .maybeSingle();

        if (duplicateError || !duplicateRequest?.id) {
          console.error("WORKER REQUEST DUPLICATE LOOKUP ERROR:", {
            duplicateError,
            orderId,
          });

          return fail(
            "Payment is verified, but the Worker Request could not be confirmed. Contact support; do not pay again.",
            500,
          );
        }

        workerRequestId = duplicateRequest.id;
      } else {
        console.error("WORKER REQUEST INSERT ERROR:", {
          message: insertError?.message,
          code: insertError?.code,
          details: insertError?.details,
          orderId,
        });

        return NextResponse.json(
          {
            success: false,
            paymentVerified: true,
            paymentSignatureValid: true,
            message:
              "Payment is verified, but the Worker Request could not be saved. Do not pay again; contact support.",
          },
          { status: 500 },
        );
      }
    } else {
      workerRequestId = newRequest.id;
    }
  }

  if (!workerRequestId) {
    return fail(
      "Payment is verified, but the Worker Request ID is missing.",
      500,
    );
  }

  // Ensure retries leave the request linked to the verified payment.
  const { error: requestUpdateError } = await supabaseAdmin
    .from("worker_requests")
    .update({
      booking_charge_amount: 49,
      payment_status: "paid",
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
    })
    .eq("id", workerRequestId);

  if (requestUpdateError) {
    console.error("WORKER REQUEST PAYMENT UPDATE ERROR:", {
      message: requestUpdateError.message,
      workerRequestId,
      orderId,
    });

    return NextResponse.json(
      {
        success: false,
        paymentVerified: true,
        paymentSignatureValid: true,
        workerRequestId,
        message:
          "Payment is verified and the request exists, but its payment status update failed. Do not pay again; contact support.",
      },
      { status: 500 },
    );
  }

  // Link the Finance transaction to the actual worker_requests.id.
  const updatedMetadata: JsonObject = {
    ...metadata,
    workerRequestId,
    paymentVerifiedAt: paidAt,
  };

  const { data: updatedTransaction, error: transactionUpdateError } =
    await supabaseAdmin
      .from("financial_transactions")
      .update({
        source_id: workerRequestId,
        status: "paid",
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        paid_at: paidAt,
        metadata: updatedMetadata,
      })
      .eq("id", transaction.id)
      .eq("razorpay_order_id", orderId)
      .select("id, transaction_number")
      .single();

  if (transactionUpdateError || !updatedTransaction) {
    console.error("WORKER REQUEST FINANCE UPDATE ERROR:", {
      message: transactionUpdateError?.message,
      workerRequestId,
      orderId,
    });

    return NextResponse.json(
      {
        success: false,
        paymentVerified: true,
        paymentSignatureValid: true,
        workerRequestId,
        message:
          "Payment is verified and the request exists, but Finance could not be updated. Do not pay again; retry verification or contact support.",
      },
      { status: 500 },
    );
  }

  console.log("WORKER REQUEST PAYMENT VERIFIED:", {
    workerRequestId,
    transactionId: updatedTransaction.id,
    orderId,
    paymentId,
  });

  return NextResponse.json({
    success: true,
    paymentVerified: true,
    message: "Worker Request payment verified successfully.",
    transactionId: updatedTransaction.id,
    transactionNumber: updatedTransaction.transaction_number,
    workerRequestId,
    sourceType: "worker_request",
    sourceId: workerRequestId,
    status: "pending",
    paymentStatus: "paid",
    amount: 49,
    razorpayPaymentId: paymentId,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const orderId =
      typeof body.razorpay_order_id === "string"
        ? body.razorpay_order_id.trim()
        : "";

    const paymentId =
      typeof body.razorpay_payment_id === "string"
        ? body.razorpay_payment_id.trim()
        : "";

    const signature =
      typeof body.razorpay_signature === "string"
        ? body.razorpay_signature.trim()
        : "";

    if (!orderId || !paymentId || !signature) {
      return fail("Missing Razorpay payment details.");
    }

    const supabaseAdmin = getAdminClient();

    // 1. Find the financial transaction associated with this order.
    const { data: transaction, error: transactionError } =
      await supabaseAdmin
        .from("financial_transactions")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

    if (transactionError) {
      console.error("TRANSACTION LOOKUP ERROR:", transactionError);
      return fail("Could not look up the financial transaction.", 500);
    }

    if (!transaction) {
      return fail("Financial transaction not found for this order.", 404);
    }

    // 2. Verify the Razorpay signature server-side.
    if (!verifySignature(orderId, paymentId, signature)) {
      return fail("Razorpay signature verification failed.");
    }

    const sourceType = transaction.source_type;
    const paidAt = new Date().toISOString();

    if (
      transaction.razorpay_payment_id &&
      transaction.razorpay_payment_id !== paymentId
    ) {
      return fail(
        "This order is already linked to another payment.",
        409,
      );
    }

    // 3. Existing booking payment flow.
    if (sourceType === "booking") {
      const metadata = isObject(transaction.metadata)
        ? transaction.metadata
        : {};

      const bookingDraft = metadata.bookingDraft;

      if (!isObject(bookingDraft)) {
        console.error("BOOKING DRAFT NOT FOUND:", {
          transactionId: transaction.id,
        });

        return fail(
          "Booking draft was not found. Contact support before retrying.",
          400,
        );
      }

      const bookingNumber = getBookingNumber(bookingDraft.booking_id);

      if (!bookingNumber) {
        return fail(
          "Booking reference is missing or invalid. Contact support.",
          400,
        );
      }

      // Idempotency: return an already linked booking on retry.
      if (
        transaction.status === "paid" &&
        isUuid(transaction.source_id)
      ) {
        const { data: linkedBooking, error: linkedBookingError } =
          await supabaseAdmin
            .from("bookings")
            .select("id, booking_id")
            .eq("id", transaction.source_id)
            .maybeSingle();

        if (linkedBookingError) {
          console.error("LINKED BOOKING LOOKUP ERROR:", linkedBookingError);
          return fail("Could not retrieve the confirmed booking.", 500);
        }

        if (linkedBooking) {
          return NextResponse.json({
            success: true,
            paymentVerified: true,
            transactionId: transaction.id,
            transactionNumber: transaction.transaction_number,
            status: "paid",
            sourceType: "booking",
            sourceId: linkedBooking.id,
            bookingId: linkedBooking.id,
            bookingNumber: linkedBooking.booking_id,
            razorpayPaymentId: paymentId,
          });
        }
      }

      // Remove draft-only fields before inserting into bookings.
      const {
        id: _draftRowId,
        created_at: _draftCreatedAt,
        updated_at: _draftUpdatedAt,
        payment_id: _draftPaymentId,
        payment_status: _draftPaymentStatus,
        booking_status: _draftBookingStatus,
        ...bookingFields
      } = bookingDraft;

      const bookingPayload: JsonObject = {
        ...bookingFields,
        booking_id: bookingNumber,
        payment_status: "paid",
        payment_id: paymentId,
        booking_status: "confirmed",
      };

      // Check if an earlier verification attempt already created the booking.
      const { data: existingBooking, error: existingBookingError } =
        await supabaseAdmin
          .from("bookings")
          .select(
            "id, booking_id, worker_id, customer_email, booking_date, booking_time",
          )
          .eq("booking_id", bookingNumber)
          .maybeSingle();

      if (existingBookingError) {
        console.error("EXISTING BOOKING LOOKUP ERROR:", existingBookingError);
        return fail("Could not check for an existing booking.", 500);
      }

      let bookingId: string;
      let savedBookingNumber: string;
      let createdNow = false;

      if (existingBooking) {
        const matchesDraft =
          existingBooking.worker_id === bookingFields.worker_id &&
          existingBooking.customer_email === bookingFields.customer_email &&
          existingBooking.booking_date === bookingFields.booking_date &&
          existingBooking.booking_time === bookingFields.booking_time;

        if (!matchesDraft) {
          console.error("BOOKING REFERENCE CONFLICT:", {
            transactionId: transaction.id,
            bookingNumber,
            existingBookingId: existingBooking.id,
          });

          return fail(
            "This booking reference belongs to another booking. Contact support.",
            409,
          );
        }

        bookingId = existingBooking.id;
        savedBookingNumber = existingBooking.booking_id;
      } else {
        const { data: newBooking, error: bookingError } =
          await supabaseAdmin
            .from("bookings")
            .insert(bookingPayload)
            .select("id, booking_id")
            .single();

        if (bookingError || !newBooking) {
          console.error("BOOKING INSERT AFTER PAYMENT ERROR:", {
            transactionId: transaction.id,
            bookingNumber,
            error: bookingError,
          });

          return NextResponse.json(
            {
              success: false,
              paymentVerified: false,
              paymentSignatureValid: true,
              message:
                "Payment signature is valid, but booking creation failed. Do not pay again; contact support.",
            },
            { status: 500 },
          );
        }

        bookingId = newBooking.id;
        savedBookingNumber = newBooking.booking_id;
        createdNow = true;
      }

      // Link the transaction to the actual bookings.id UUID.
      const updatedMetadata: JsonObject = {
        ...metadata,
        bookingId,
        bookingNumber: savedBookingNumber,
        paymentVerifiedAt: paidAt,
      };

      const { data: updatedTransaction, error: updateError } =
        await supabaseAdmin
          .from("financial_transactions")
          .update({
            source_id: bookingId,
            status: "paid",
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            paid_at: paidAt,
            metadata: updatedMetadata,
          })
          .eq("id", transaction.id)
          .eq("razorpay_order_id", orderId)
          .select("id, transaction_number")
          .single();

      if (updateError || !updatedTransaction) {
        console.error("BOOKING CREATED BUT TRANSACTION UPDATE FAILED:", {
          bookingId,
          transactionId: transaction.id,
          error: updateError,
        });

        return NextResponse.json(
          {
            success: false,
            paymentVerified: false,
            paymentSignatureValid: true,
            bookingCreated: true,
            bookingId,
            bookingNumber: savedBookingNumber,
            message:
              "Booking exists, but its financial transaction update failed. Do not pay again; contact support.",
          },
          { status: 500 },
        );
      }

      if (createdNow) {
        await sendAdminBookingAlert({
          supabaseAdmin,
          bookingId,
          bookingNumber: savedBookingNumber,
          booking: bookingFields,
        });
      }

      console.log("BOOKING PAYMENT VERIFIED:", {
        bookingId,
        bookingNumber: savedBookingNumber,
        transactionId: updatedTransaction.id,
        orderId,
        paymentId,
      });

      return NextResponse.json({
        success: true,
        paymentVerified: true,
        transactionId: updatedTransaction.id,
        transactionNumber: updatedTransaction.transaction_number,
        status: "paid",
        sourceType: "booking",
        sourceId: bookingId,
        bookingId,
        bookingNumber: savedBookingNumber,
        razorpayPaymentId: paymentId,
      });
    }

    // 4. Worker Request draft flow.
    // This MUST run before source_id UUID validation because draft orders
    // intentionally have financial_transactions.source_id = null.
    if (sourceType === "worker_request") {
      return await handleWorkerRequestPayment({
        supabaseAdmin,
        transaction: transaction as JsonObject,
        orderId,
        paymentId,
        signature,
        paidAt,
      });
    }

    // 5. Other payment types must already have a real database UUID.
    const sourceId = transaction.source_id;

    if (!isUuid(sourceId)) {
      console.error("INVALID PAYMENT SOURCE ID:", {
        sourceType,
        sourceId,
        transactionId: transaction.id,
      });

      return fail("Invalid or unsupported payment source.", 400);
    }

    // 6. Existing E-Aurix payment flow.
    if (sourceType === "e_aurix") {
      const { data, error } = await supabaseAdmin
        .from("e_aurix_orders")
        .update({
          payment_status: "paid",
          payment_id: paymentId,
          order_status: "confirmed",
        })
        .eq("id", sourceId)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        console.error("E-AURIX PAYMENT UPDATE ERROR:", error);
        return fail(
          "Payment was verified, but the E-Aurix order could not be updated.",
          500,
        );
      }
    } else {
      return fail("Invalid or unsupported payment source.", 400);
    }

    // 7. Update the Finance transaction for non-booking, non-draft payments.
    const {
      data: updatedTransaction,
      error: financialUpdateError,
    } = await supabaseAdmin
      .from("financial_transactions")
      .update({
        status: "paid",
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        paid_at: paidAt,
      })
      .eq("id", transaction.id)
      .eq("razorpay_order_id", orderId)
      .select("id, transaction_number")
      .single();

    if (financialUpdateError || !updatedTransaction) {
      console.error("FINANCIAL TRANSACTION UPDATE ERROR:", {
        transactionId: transaction.id,
        error: financialUpdateError,
      });

      return fail(
        "Payment was verified, but the financial transaction could not be updated.",
        500,
      );
    }

    return NextResponse.json({
      success: true,
      paymentVerified: true,
      transactionId: updatedTransaction.id,
      transactionNumber: updatedTransaction.transaction_number,
      status: "paid",
      sourceType,
      sourceId,
      razorpayPaymentId: paymentId,
    });
  } catch (error: unknown) {
    console.error("RAZORPAY VERIFY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        paymentVerified: false,
        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      { status: 500 },
    );
  }
}