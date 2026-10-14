
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

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (adminError) {
      console.error("[Cancellation Requests] Admin check:", adminError.message);
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

    const { data: requests, error: requestsError } = await supabaseAdmin
      .from("booking_cancellation_requests")
      .select("*")
      .order("requested_at", { ascending: false });

    if (requestsError) {
      console.error(
        "[Cancellation Requests] Fetch error:",
        requestsError.message,
      );
      return json(
        { success: false, error: "Unable to fetch cancellation requests" },
        500,
      );
    }

    const requestRows = requests ?? [];
    const requestIds = requestRows.map((row) => row.id);

    let details: Array<Record<string, unknown>> = [];

    if (requestIds.length > 0) {
      const { data: refundDetails, error: detailsError } =
        await supabaseAdmin
          .from("booking_cancellation_refund_details")
          .select(
            "request_id, booking_id, refund_method, refund_bank_name, refund_account_holder_name, refund_account_number, refund_ifsc_code, refund_upi_id, created_at",
          )
          .in("request_id", requestIds);

      if (detailsError) {
        console.error(
          "[Cancellation Requests] Refund details error:",
          detailsError.message,
        );

        return json(
          { success: false, error: "Unable to fetch refund verification details" },
          500,
        );
      }

      details = (refundDetails ?? []) as Array<Record<string, unknown>>;
    }

    const detailsByRequestId = new Map(
      details.map((detail) => [String(detail.request_id), detail]),
    );

    const data = requestRows.map((row) => ({
      ...row,
      refund_details: detailsByRequestId.get(String(row.id)) ?? null,
    }));

    return json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("[Cancellation Requests API]", error);

    return json(
      { success: false, error: "Internal server error" },
      500,
    );
  }
}
