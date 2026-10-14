
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function normalizeMethod(method: unknown): string | null {
  if (typeof method !== "string" || !method.trim()) return null;

  const value = method.trim().toLowerCase();

  const labels: Record<string, string> = {
    upi: "UPI",
    card: "Card",
    netbanking: "Netbanking",
    wallet: "Wallet",
    emi: "EMI",
    paylater: "Pay Later",
    nach: "NACH",
  };

  return labels[value] ?? value;
}

async function fetchRazorpayPayment(paymentId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("[Razorpay] Server credentials are missing");
    return null;
  }

  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    return null;
  }

  try {
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString(
      "base64",
    );

    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      console.error(
        "[Razorpay] Payment fetch failed:",
        response.status,
      );
      return null;
    }

    const payment = await response.json();

    if (payment.id !== paymentId) {
      return null;
    }

    return {
      method: normalizeMethod(payment.method),
      status: payment.status ?? null,
      payment_id: payment.id,
      order_id: payment.order_id ?? null,
      amount: payment.amount ?? null,
      currency: payment.currency ?? null,
    };
  } catch (error) {
    console.error(
      "[Razorpay] Payment fetch error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authenticate admin
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!token) {
      return json(
        { success: false, error: "Authentication required" },
        401,
      );
    }

    const { data: auth, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !auth.user) {
      return json(
        { success: false, error: "Invalid or expired session" },
        401,
      );
    }

    // 2. Verify finance permission
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (adminError) {
      return json(
        { success: false, error: "Admin verification failed" },
        500,
      );
    }

    if (
      !admin ||
      admin.is_active !== true ||
      !["super_admin", "finance_admin"].includes(
        String(admin.role ?? "").toLowerCase(),
      )
    ) {
      return json(
        { success: false, error: "Finance access denied" },
        403,
      );
    }

    // 3. Validate transaction ID
    const { id } = await context.params;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return json(
        { success: false, error: "Invalid transaction ID" },
        400,
      );
    }

    // 4. Fetch transaction from Supabase
    const { data: transaction, error } = await supabaseAdmin
      .from("financial_transactions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[Finance Transaction Details]", error.message);

      return json(
        { success: false, error: "Unable to fetch transaction" },
        500,
      );
    }

    if (!transaction) {
      return json(
        { success: false, error: "Transaction not found" },
        404,
      );
    }

    // 5. Fetch actual payment method from Razorpay
    const razorpayPaymentId =
      typeof transaction.razorpay_payment_id === "string"
        ? transaction.razorpay_payment_id
        : "";

    const razorpayPayment = razorpayPaymentId
      ? await fetchRazorpayPayment(razorpayPaymentId)
      : null;

    // Keep database method as fallback
    const databaseMethod = normalizeMethod(transaction.payment_method);

    const enrichedTransaction = {
      ...transaction,
      payment_method:
        razorpayPayment?.method ?? databaseMethod ?? "Unavailable",
      razorpay_payment_status: razorpayPayment?.status ?? null,
      razorpay_payment_method_source: razorpayPayment
        ? "razorpay"
        : databaseMethod
          ? "database_fallback"
          : "unavailable",
    };

    // 6. Fetch related refunds
    const { data: refunds, error: refundError } = await supabaseAdmin
      .from("refunds")
      .select("*")
      .eq("financial_transaction_id", id)
      .order("created_at", { ascending: false });

    if (refundError) {
      console.error("[Finance Related Refunds]", refundError.message);

      return json(
        { success: false, error: "Unable to fetch related refunds" },
        500,
      );
    }

    return json({
      success: true,
      data: {
        transaction: enrichedTransaction,
        refunds: refunds ?? [],
      },
    });
  } catch (error) {
    console.error("[Finance Transaction Details API]", error);

    return json(
      { success: false, error: "Internal server error" },
      500,
    );
  }
}