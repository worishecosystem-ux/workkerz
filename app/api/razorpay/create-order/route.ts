
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type SourceType =
  | "booking"
  | "worker_request"
  | "e_aurix"
  | "subscription"
  | "other";

interface CreateOrderBody {
  sourceType: SourceType;
  sourceId: string;
  amount: number | string;
  customerId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  workerId?: string | null;
  workerEmail?: string | null;
  vendorId?: string | null;
  vendorName?: string | null;
  itemName?: string | null;
  category?: string | null;
  description?: string | null;
  quantity?: number | string | null;
  metadata?: Record<string, any> | null;
}

function jsonError(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json(
    { success: false, message, ...extra },
    { status },
  );
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function POST(req: NextRequest) {
  let razorpayOrderId: string | null = null;

  try {
    // 1. Environment validation
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return jsonError("Razorpay credentials are not configured.", 500);
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return jsonError("Supabase server configuration is missing.", 500);
    }

    // 2. Parse body
    let body: CreateOrderBody;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.");
    }

    if (!isPlainObject(body)) {
      return jsonError("Invalid request body.");
    }

    const {
      sourceType,
      sourceId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      workerId,
      workerEmail,
      vendorId,
      vendorName,
      itemName,
      category,
      description,
      quantity,
    } = body;

    const allowedSourceTypes: SourceType[] = [
      "booking",
      "worker_request",
      "e_aurix",
      "subscription",
      "other",
    ];

    if (!allowedSourceTypes.includes(sourceType)) {
      return jsonError("Invalid sourceType.");
    }

    if (
      typeof sourceId !== "string" ||
      !sourceId.trim() ||
      sourceId.length > 100
    ) {
      return jsonError("Valid sourceId is required.");
    }

    const metadata: Record<string, any> = isPlainObject(body.metadata)
      ? { ...body.metadata }
      : {};

    // 3. Existing booking draft validation
    if (sourceType === "booking") {
      const draft = metadata.bookingDraft;

      if (
        !isPlainObject(draft) ||
        typeof metadata.draftId !== "string" ||
        metadata.draftId !== sourceId
      ) {
        return jsonError(
          "Booking draft is missing or its ID does not match.",
        );
      }

      const requiredFields = [
        "worker_id",
        "customer_name",
        "customer_phone",
        "customer_email",
        "booking_date",
        "booking_time",
        "booking_type",
        "service_type",
      ];

      const missingFields = requiredFields.filter((field) => {
        const value = draft[field];
        return (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        );
      });

      if (missingFields.length) {
        return jsonError("Booking details are incomplete.", 400, {
          missingFields,
        });
      }
    }

    // 4. Worker Request draft validation
    // Request is not inserted into worker_requests until
    // payment verification succeeds in the next integration step.
    if (sourceType === "worker_request") {
      const draft = metadata.workerRequestDraft;

      if (
        !isPlainObject(draft) ||
        typeof metadata.draftId !== "string" ||
        !metadata.draftId.trim() ||
        metadata.draftId !== sourceId
      ) {
        return jsonError(
          "Worker Request draft is required and its ID must match sourceId.",
        );
      }

      const requiredFields = [
        "workers_required",
        "location",
        "category",
        "work_date",
      ];

      const missingFields = requiredFields.filter((field) => {
        const value = draft[field];

        return (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        );
      });

      if (missingFields.length) {
        return jsonError(
          "Worker Request details are incomplete.",
          400,
          { missingFields },
        );
      }

      const workersRequired = Number(draft.workers_required);

      if (
        !Number.isInteger(workersRequired) ||
        workersRequired < 1 ||
        workersRequired > 10000
      ) {
        return jsonError("Invalid number of workers required.");
      }

      if (
        typeof draft.location !== "string" ||
        !draft.location.trim() ||
        typeof draft.category !== "string" ||
        !draft.category.trim()
      ) {
        return jsonError("Valid work location and category are required.");
      }

      // The client cannot change the Worker Request booking charge.
      metadata.bookingChargeType = "worker_request";
      metadata.bookingChargeAmount = 49;
      metadata.currency = "INR";
    }

    // 5. Amount calculation
    // Both booking types use the existing fixed ₹49 charge.
    const amountInRupees =
      sourceType === "booking" || sourceType === "worker_request"
        ? 49
        : Number(body.amount);

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return jsonError("Invalid payment amount.");
    }

    const amountInPaise = Math.round(amountInRupees * 100);

    if (amountInPaise < 100) {
      return jsonError("Minimum payment amount is ₹1.");
    }

    // 6. Create Razorpay order
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt =
      `WK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const isDraftPayment =
      sourceType === "booking" ||
      sourceType === "worker_request";

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        source_type: sourceType,
        source_id: isDraftPayment
          ? `draft:${sourceId}`
          : sourceId,
        item_name:
          itemName ||
          (sourceType === "worker_request"
            ? "Workkerz Worker Request Booking Charge"
            : sourceType === "booking"
              ? "Workkerz Booking Charge"
              : "Workkerz Payment"),
      },
    });

    if (!razorpayOrder?.id) {
      return jsonError("Razorpay order ID was not returned.", 500);
    }

    razorpayOrderId = razorpayOrder.id;

    // 7. Prepare Finance transaction
    const parsedQuantity = Number(quantity);

    const transactionQuantity =
      Number.isFinite(parsedQuantity) && parsedQuantity > 0
        ? Math.floor(parsedQuantity)
        : 1;

    // Draft requests do not exist in worker_requests yet.
    // Do not store a draft UUID as a real request foreign key.
    const databaseSourceId = isDraftPayment
      ? null
      : isUuid(sourceId)
        ? sourceId
        : null;

    const financialTransaction = {
      transaction_number:
        `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,

      source_type: sourceType,
      source_id: databaseSourceId,

      customer_id: isUuid(customerId) ? customerId : null,
      customer_email: customerEmail || null,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,

      worker_id: isUuid(workerId) ? workerId : null,
      worker_email: workerEmail || null,

      vendor_id: isUuid(vendorId) ? vendorId : null,
      vendor_name: vendorName || null,

      amount: amountInRupees,
      currency: "INR",
      platform_fee: 0,
      gateway_fee: 0,
      gst_amount: 0,
      net_amount: amountInRupees,

      transaction_type: "payment",
      status: "created",
      payment_method: null,

      razorpay_order_id: razorpayOrder.id,
      razorpay_payment_id: null,
      razorpay_signature: null,

      razorpay_refund_id: null,
      refund_amount: 0,
      refund_reason: null,
      refund_status: null,

      item_name:
        itemName ||
        (sourceType === "worker_request"
          ? "Worker Request Booking Charge"
          : sourceType === "booking"
            ? "Workkerz Booking Charge"
            : "Workkerz Payment"),

      category: category || null,
      description: description || null,
      quantity: transactionQuantity,

      // Keep the draft available for verification and later insertion.
      metadata: {
        ...metadata,
        sourceId,
        draftId: isDraftPayment ? sourceId : metadata.draftId || null,
      },

      paid_at: null,
      refunded_at: null,
    };

    const { data: transaction, error: transactionError } =
      await supabaseAdmin
        .from("financial_transactions")
        .insert(financialTransaction)
        .select("id, transaction_number, razorpay_order_id")
        .single();

    if (transactionError || !transaction?.id) {
      console.error("FINANCIAL TRANSACTION INSERT ERROR:", {
        message: transactionError?.message,
        code: transactionError?.code,
        details: transactionError?.details,
        orderId: razorpayOrder.id,
        sourceType,
      });

      return NextResponse.json(
        {
          success: false,
          code: "FINANCIAL_TRANSACTION_INSERT_FAILED",
          message:
            "The Razorpay order was created, but Finance could not save its transaction. Check the order before retrying.",
          razorpayOrderId: razorpayOrder.id,
          databaseError: transactionError?.message,
        },
        { status: 500 },
      );
    }

    console.log("RAZORPAY ORDER READY:", {
      orderId: razorpayOrder.id,
      transactionId: transaction.id,
      sourceType,
      sourceId,
      amount: amountInRupees,
    });

    return NextResponse.json({
      success: true,
      keyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      transactionId: transaction.id,
      transactionNumber: transaction.transaction_number,
      sourceType,
      sourceId,
    });
  } catch (error: any) {
    console.error("CREATE ORDER GLOBAL ERROR:", {
      message: error?.message,
      statusCode: error?.statusCode,
      orderId: razorpayOrderId,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error?.error?.description ||
          error?.message ||
          "Internal server error.",
      },
      { status: Number(error?.statusCode) || 500 },
    );
  }
}
