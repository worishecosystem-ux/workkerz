
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

interface RazorpayPayment {
  id: string;
  amount: number;
  currency?: string;
  status?: string;
  captured?: boolean;
  method?: string;
}

interface RazorpayResponse {
  items?: RazorpayPayment[];
}

function normalizeMethod(method?: string) {
  const value = (method || "other").toLowerCase().trim();

  if (["upi", "card", "netbanking", "wallet", "emi", "paylater"].includes(value)) {
    return value;
  }

  return "other";
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

    // 3. Razorpay credentials are server-side only
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[Finance Payment Breakdown] Razorpay credentials missing");

      return json(
        { success: false, error: "Razorpay credentials are not configured" },
        500,
      );
    }

    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const totals = new Map<
      string,
      { method: string; count: number; amountPaise: number }
    >();

    let fetchedCount = 0;
    let capturedCount = 0;
    let capturedAmountPaise = 0;
    let skip = 0;
    const pageSize = 100;
    const maxRecords = 10000;

    // 4. Fetch Razorpay payments in pages
    while (skip < maxRecords) {
      const params = new URLSearchParams({
        count: String(pageSize),
        skip: String(skip),
      });

      const response = await fetch(
        `https://api.razorpay.com/v1/payments?${params.toString()}`,
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

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "[Razorpay Payment Breakdown] API failed:",
          response.status,
          errorText.slice(0, 500),
        );

        return json(
          {
            success: false,
            error: "Unable to fetch payment data from Razorpay",
          },
          502,
        );
      }

      const result = (await response.json()) as RazorpayResponse;
      const payments = result.items ?? [];

      fetchedCount += payments.length;

      for (const payment of payments) {
        // This breakdown reports captured INR payments only.
        if (
          payment.status !== "captured" &&
          payment.captured !== true
        ) {
          continue;
        }

        if ((payment.currency || "INR").toUpperCase() !== "INR") {
          continue;
        }

        const amountPaise = Number(payment.amount);

        if (!Number.isFinite(amountPaise) || amountPaise < 0) {
          continue;
        }

        const method = normalizeMethod(payment.method);
        const current = totals.get(method) ?? {
          method,
          count: 0,
          amountPaise: 0,
        };

        current.count += 1;
        current.amountPaise += amountPaise;

        totals.set(method, current);

        capturedCount += 1;
        capturedAmountPaise += amountPaise;
      }

      if (payments.length < pageSize) {
        break;
      }

      skip += payments.length;
    }

    const breakdown = Array.from(totals.values())
      .map((item) => ({
        method: item.method,
        count: item.count,
        amount: item.amountPaise / 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    return json({
      success: true,
      source: "razorpay",
      currency: "INR",
      data: breakdown,
      totals: {
        fetchedPayments: fetchedCount,
        capturedTransactions: capturedCount,
        capturedAmount: capturedAmountPaise / 100,
      },
      limitReached: fetchedCount >= maxRecords,
    });
  } catch (error) {
    console.error("[Finance Payment Breakdown API]", error);

    return json(
      { success: false, error: "Unable to load payment breakdown" },
      500,
    );
  }
}