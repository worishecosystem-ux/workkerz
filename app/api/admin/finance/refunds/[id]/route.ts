import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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
        401
      );
    }

    const { data: auth, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !auth.user) {
      return json(
        { success: false, error: "Invalid or expired session" },
        401
      );
    }

    // 2. Check finance access
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (adminError) {
      return json(
        { success: false, error: "Admin verification failed" },
        500
      );
    }

    if (
      !admin ||
      admin.is_active !== true ||
      !["super_admin", "finance_admin"].includes(
        String(admin.role ?? "").toLowerCase()
      )
    ) {
      return json(
        { success: false, error: "Finance access denied" },
        403
      );
    }

    // 3. Validate refund UUID
    const { id } = await context.params;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return json(
        { success: false, error: "Invalid refund ID" },
        400
      );
    }

    // 4. Fetch refund
    const { data: refund, error } = await supabaseAdmin
      .from("refunds")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[Finance Refund Details]", error.message);

      return json(
        { success: false, error: "Unable to fetch refund" },
        500
      );
    }

    if (!refund) {
      return json(
        { success: false, error: "Refund not found" },
        404
      );
    }

    // 5. Fetch related transaction if linked
    let transaction = null;

    if (refund.financial_transaction_id) {
      const { data, error: transactionError } = await supabaseAdmin
        .from("financial_transactions")
        .select(
          "id, transaction_number, amount, currency, status, payment_method, razorpay_order_id, razorpay_payment_id, razorpay_refund_id, paid_at, created_at"
        )
        .eq("id", refund.financial_transaction_id)
        .maybeSingle();

      if (transactionError) {
        console.error(
          "[Finance Refund Transaction]",
          transactionError.message
        );

        return json(
          { success: false, error: "Unable to fetch related transaction" },
          500
        );
      }

      transaction = data;
    }

    return json({
      success: true,
      data: {
        refund,
        transaction,
      },
    });
  } catch (error) {
    console.error("[Finance Refund Details API]", error);

    return json(
      { success: false, error: "Internal server error" },
      500
    );
  }
}