import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
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

    // 2. Check admin permissions
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (adminError) {
      return json(
        { success: false, error: "Unable to verify admin" },
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

    // 3. Read query parameters
    const params = request.nextUrl.searchParams;
    const search = (params.get("search") ?? "").trim().slice(0, 100);
    const status = params.get("status") ?? "";
    const method = params.get("method") ?? "";
    const startDate = params.get("startDate") ?? "";
    const endDate = params.get("endDate") ?? "";

    const page = Math.max(
      1,
      Math.min(100000, Number(params.get("page") ?? 1) || 1)
    );

    const pageSize = Math.max(
      1,
      Math.min(100, Number(params.get("pageSize") ?? 20) || 20)
    );

    const allowedStatuses = [
      "pending",
      "created",
      "processing",
      "paid",
      "failed",
      "refund_requested",
      "refunded",
      "partially_refunded",
      "cancelled",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return json(
        { success: false, error: "Invalid transaction status" },
        400
      );
    }

    const allowedMethods = ["upi", "card", "netbanking", "wallet", "unknown"];

    if (method && !allowedMethods.includes(method.toLowerCase())) {
      return json(
        { success: false, error: "Invalid payment method" },
        400
      );
    }

    // 4. Fetch transactions
    const columns = [
      "id",
      "transaction_number",
      "source_type",
      "source_id",
      "customer_name",
      "customer_email",
      "customer_phone",
      "worker_id",
      "worker_email",
      "amount",
      "currency",
      "platform_fee",
      "gateway_fee",
      "gst_amount",
      "net_amount",
      "transaction_type",
      "status",
      "payment_method",
      "razorpay_order_id",
      "razorpay_payment_id",
      "razorpay_refund_id",
      "refund_amount",
      "refund_reason",
      "refund_status",
      "paid_at",
      "created_at",
      "metadata",
    ].join(",");

    let query = supabaseAdmin
      .from("financial_transactions")
      .select(columns, { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (method) {
      if (method.toLowerCase() === "unknown") {
        query = query.is("payment_method", null);
      } else {
        query = query.ilike("payment_method", method);
      }
    }

    if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      query = query.gte(
        "created_at",
        `${startDate}T00:00:00.000Z`
      );
    }

    if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      const nextDay = new Date(`${endDate}T00:00:00.000Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      query = query.lt("created_at", nextDay.toISOString());
    }

    // Search transaction and payment identifiers
    if (search) {
      const escaped = search.replace(/[,%()]/g, "");
      if (escaped) {
        query = query.or(
          [
            `transaction_number.ilike.%${escaped}%`,
            `customer_name.ilike.%${escaped}%`,
            `customer_email.ilike.%${escaped}%`,
            `razorpay_order_id.ilike.%${escaped}%`,
            `razorpay_payment_id.ilike.%${escaped}%`,
          ].join(",")
        );
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("[Finance Transactions]", error.message);

      return json(
        { success: false, error: "Unable to load transactions" },
        500
      );
    }

    const total = count ?? 0;

    return json({
      success: true,
      data: {
        transactions: data ?? [],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[Finance Transactions API]", error);

    return json(
      { success: false, error: "Internal server error" },
      500
    );
  }
}