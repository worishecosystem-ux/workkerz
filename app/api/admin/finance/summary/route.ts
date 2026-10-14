
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BOOKING_CHARGE = 49;

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate admin
    const header = request.headers.get("authorization");
    const token = header?.startsWith("Bearer ")
      ? header.slice(7).trim()
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
        { success: false, error: "Invalid admin session" },
        401
      );
    }

    // 2. Verify finance permissions
    const { data: admin, error: adminError } =
      await supabaseAdmin
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

    // 3. Date filters
    const params = request.nextUrl.searchParams;
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");

    let query = supabaseAdmin
      .from("financial_transactions")
      .select(
        "id, amount, platform_fee, gateway_fee, net_amount, refund_amount, status, payment_method, transaction_type, paid_at, created_at"
      );

    if (
      startDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(startDate)
    ) {
      query = query.gte(
        "created_at",
        `${startDate}T00:00:00.000Z`
      );
    }

    if (
      endDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      const nextDay = new Date(`${endDate}T00:00:00.000Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      query = query.lt("created_at", nextDay.toISOString());
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) {
      console.error("[Finance Summary]", error.message);

      return json(
        { success: false, error: "Unable to fetch finance data" },
        500
      );
    }

    const rows = data ?? [];

    const amount = (value: unknown): number => {
      const n = Number(value ?? 0);
      return Number.isFinite(n) ? n : 0;
    };

    const statusOf = (status: string | null) =>
      String(status ?? "").toLowerCase().trim();

    // 4. Only payment transactions
    const payments = rows.filter(
      (row) =>
        String(row.transaction_type ?? "").toLowerCase() ===
        "payment"
    );

    // Only successful payments count as collected payments.
    const paid = payments.filter(
      (row) => statusOf(row.status) === "paid"
    );

    const pending = payments.filter((row) =>
      ["pending", "created", "processing"].includes(
        statusOf(row.status)
      )
    );

    const failed = payments.filter(
      (row) => statusOf(row.status) === "failed"
    );

    const refunded = payments.filter((row) =>
      ["refunded", "partially_refunded"].includes(
        statusOf(row.status)
      )
    );

    const sum = (
      items: typeof rows,
      field:
        | "amount"
        | "platform_fee"
        | "gateway_fee"
        | "net_amount"
        | "refund_amount"
    ) =>
      items.reduce(
        (total, row) => total + amount(row[field]),
        0
      );

    // 5. Finance totals
    const totalCollected = sum(paid, "amount");

    // Company earns a fixed ₹49 per successful payment record.
    const companyEarnings = paid.length * BOOKING_CHARGE;

    const workerEarnings = sum(paid, "net_amount");
    const gatewayFees = sum(paid, "gateway_fee");
    const refundedAmount = sum(refunded, "refund_amount");

    // 6. Last 7 days: collection, company earnings and refunds
    const daily = new Map<
      string,
      {
        date: string;
        collection: number;
        earnings: number;
        refunds: number;
        successfulBookings: number;
      }
    >();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - i);

      const key = date.toISOString().slice(0, 10);

      daily.set(key, {
        date: key,
        collection: 0,
        earnings: 0,
        refunds: 0,
        successfulBookings: 0,
      });
    }

    for (const row of paid) {
      const date = String(
        row.paid_at || row.created_at || ""
      ).slice(0, 10);

      const item = daily.get(date);

      if (!item) continue;

      item.collection += amount(row.amount);
      item.earnings += BOOKING_CHARGE;
      item.successfulBookings += 1;
    }

    for (const row of refunded) {
      const date = String(
        row.created_at || ""
      ).slice(0, 10);

      const item = daily.get(date);

      if (item) {
        item.refunds += amount(row.refund_amount);
      }
    }

    // 7. Payment method breakdown from successful payments only
    const methods = new Map<
      string,
      { method: string; amount: number; count: number }
    >();

    for (const row of paid) {
      const method = row.payment_method || "Unknown";

      const current = methods.get(method) ?? {
        method,
        amount: 0,
        count: 0,
      };

      current.amount += amount(row.amount);
      current.count += 1;

      methods.set(method, current);
    }

    // 8. Response
    return json({
      success: true,
      data: {
        summary: {
          totalCollected,
          companyEarnings,
          workerEarnings,
          gatewayFees,
          pendingAmount: sum(pending, "amount"),
          failedAmount: sum(failed, "amount"),
          refundedAmount,

          totalTransactions: rows.length,
          successfulTransactions: paid.length,
          pendingTransactions: pending.length,
          failedTransactions: failed.length,
          refundedTransactions: refunded.length,

          bookingCharge: BOOKING_CHARGE,
        },

        chart: Array.from(daily.values()),

        paymentBreakdown: Array.from(methods.values()),
      },
    });
  } catch (error) {
    console.error("[Finance Summary API]", error);

    return json(
      { success: false, error: "Internal server error" },
      500
    );
  }
}
