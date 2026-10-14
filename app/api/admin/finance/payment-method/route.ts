
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RazorpayErrorResponse = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    field?: string;
    source?: string;
    step?: string;
    metadata?: Record<string, unknown>;
  };
  message?: string;
};

type RazorpayCard = {
  last4?: string | null;
  network?: string | null;
  type?: string | null;
  issuer?: string | null;
  name?: string | null;
  international?: boolean | null;
};

type RazorpayPayment = {
  id?: string;
  entity?: string;
  method?: string;
  status?: string;
  currency?: string;
  amount?: number;
  captured?: boolean;
  bank?: string | null;
  wallet?: string | null;
  vpa?: string | null;
  card?: RazorpayCard | null;
};

function jsonError(
  message: string,
  status: number,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...extra,
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function jsonSuccess(data: Record<string, unknown>) {
  return NextResponse.json(
    { success: true, ...data },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function getBearerToken(request: NextRequest): string {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the current user.
    const token = getBearerToken(request);

    if (!token) {
      return jsonError("Authentication required.", 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return jsonError(
        "Your session is invalid or expired. Sign in again.",
        401,
      );
    }

    // 2. Verify finance-admin permissions.
    const { data: admin, error: adminError } =
      await supabaseAdmin
        .from("admin_profiles")
        .select("id, role, is_active")
        .eq("id", user.id)
        .maybeSingle();

    if (adminError) {
      console.error("Admin profile lookup failed:", {
        code: adminError.code,
        message: adminError.message,
      });

      return jsonError(
        "Unable to verify admin permissions.",
        500,
      );
    }

    const allowedRoles = ["super_admin", "finance_admin"];

    if (
      !admin ||
      admin.is_active !== true ||
      !allowedRoles.includes(
        String(admin.role).toLowerCase(),
      )
    ) {
      return jsonError(
        "Finance admin access required.",
        403,
      );
    }

    // 3. Validate the request body.
    const body = await request.json().catch(() => null);

    const transactionId =
      typeof body?.transactionId === "string"
        ? body.transactionId.trim()
        : "";

    const razorpayPaymentId =
      typeof body?.razorpayPaymentId === "string"
        ? body.razorpayPaymentId.trim()
        : "";

    if (!transactionId) {
      return jsonError("Transaction ID is required.", 400);
    }

    if (!razorpayPaymentId) {
      return jsonError(
        "Razorpay payment ID is required.",
        400,
      );
    }

    if (
      transactionId.length > 100 ||
      !/^[a-zA-Z0-9_-]+$/.test(transactionId)
    ) {
      return jsonError(
        "Invalid transaction ID format.",
        400,
      );
    }

    if (!/^pay_[a-zA-Z0-9]+$/.test(razorpayPaymentId)) {
      return jsonError(
        "Invalid Razorpay Payment ID. Use a pay_ ID, not an Order ID.",
        400,
      );
    }

    // 4. Verify the transaction and its stored payment ID.
    const { data: transaction, error: transactionError } =
      await supabaseAdmin
        .from("financial_transactions")
        .select("id, razorpay_payment_id, payment_method")
        .eq("id", transactionId)
        .maybeSingle();

    if (transactionError) {
      console.error("Transaction lookup failed:", {
        code: transactionError.code,
        message: transactionError.message,
      });

      return jsonError(
        "Unable to verify the transaction in the database.",
        500,
      );
    }

    if (!transaction) {
      return jsonError("Transaction not found.", 404);
    }

    if (
      transaction.razorpay_payment_id !== razorpayPaymentId
    ) {
      return jsonError(
        "The supplied Razorpay Payment ID does not match this transaction.",
        403,
      );
    }

    // 5. Validate server-side Razorpay credentials.
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error(
        "Razorpay server credentials are not configured.",
      );

      return jsonError(
        "Razorpay server configuration is incomplete.",
        500,
      );
    }

    // 6. Retrieve the actual payment from Razorpay.
    let razorpayResponse: Response;

    try {
      const credentials = Buffer.from(
        `${keyId}:${keySecret}`,
      ).toString("base64");

      razorpayResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(
          razorpayPaymentId,
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        },
      );
    } catch (error) {
      const isTimeout =
        error instanceof Error &&
        (error.name === "TimeoutError" ||
          error.name === "AbortError");

      console.error("Razorpay connection failed:", {
        type: isTimeout ? "timeout" : "network_error",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });

      return jsonError(
        isTimeout
          ? "Razorpay request timed out. Please retry."
          : "Unable to connect to Razorpay. Please retry.",
        isTimeout ? 504 : 502,
        { retryable: true },
      );
    }

    // 7. Handle errors returned by Razorpay.
    if (!razorpayResponse.ok) {
      const rawError = await razorpayResponse.text();

      let razorpayError: RazorpayErrorResponse = {};

      try {
        razorpayError = JSON.parse(
          rawError,
        ) as RazorpayErrorResponse;
      } catch {
        // Razorpay returned a non-JSON error.
      }

      const code = razorpayError.error?.code ?? null;
      const description =
        razorpayError.error?.description ??
        razorpayError.error?.reason ??
        razorpayError.message ??
        "";

      console.error("Razorpay payment lookup failed:", {
        status: razorpayResponse.status,
        code,
        description,
        paymentId: razorpayPaymentId,
        keyMode: keyId.startsWith("rzp_test_")
          ? "test"
          : keyId.startsWith("rzp_live_")
            ? "live"
            : "unknown",
      });

      if (razorpayResponse.status === 400) {
        return jsonError(
          description ||
            "Razorpay rejected the payment lookup request.",
          502,
          { code, upstreamStatus: 400 },
        );
      }

      if (razorpayResponse.status === 401) {
        return jsonError(
          "Razorpay rejected the API credentials. Check the key ID and secret.",
          502,
          { code, upstreamStatus: 401 },
        );
      }

      if (razorpayResponse.status === 403) {
        return jsonError(
          "Razorpay denied access to this payment.",
          502,
          { code, upstreamStatus: 403 },
        );
      }

      if (razorpayResponse.status === 404) {
        return jsonError(
          "Payment not found in Razorpay. Verify the Payment ID and ensure Test/Live mode matches the original payment.",
          404,
          {
            code,
            upstreamStatus: 404,
            retryable: false,
          },
        );
      }

      if (razorpayResponse.status === 429) {
        return jsonError(
          "Razorpay rate limit reached. Please retry later.",
          503,
          { code, upstreamStatus: 429, retryable: true },
        );
      }

      return jsonError(
        description ||
          `Razorpay returned HTTP ${razorpayResponse.status}.`,
        502,
        {
          code,
          upstreamStatus: razorpayResponse.status,
        },
      );
    }

    // 8. Validate the successful Razorpay response.
    const payment =
      (await razorpayResponse.json()) as RazorpayPayment;

    if (
      payment.id !== razorpayPaymentId ||
      typeof payment.method !== "string" ||
      !payment.method
    ) {
      console.error("Invalid Razorpay payment response:", {
        idMatches: payment.id === razorpayPaymentId,
        methodPresent: Boolean(payment.method),
      });

      return jsonError(
        "Razorpay did not return a valid payment method.",
        502,
      );
    }

    // 9. Return payment metadata without exposing credentials
    // or full card details.
    return jsonSuccess({
      payment_method: payment.method,
      source: "razorpay",
      payment: {
        id: payment.id,
        method: payment.method,
        status: payment.status ?? null,
        currency: payment.currency ?? null,
        amount: payment.amount ?? null,
        captured: payment.captured ?? null,
        vpa: payment.vpa ?? null,
        bank: payment.bank ?? null,
        wallet: payment.wallet ?? null,
        card: payment.card
          ? {
              last4: payment.card.last4 ?? null,
              network: payment.card.network ?? null,
              type: payment.card.type ?? null,
              issuer: payment.card.issuer ?? null,
              name: payment.card.name ?? null,
              international:
                payment.card.international ?? null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Payment details API error:", {
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });

    return jsonError("Internal server error.", 500);
  }
}
