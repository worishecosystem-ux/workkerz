
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin session
    const authorization = request.headers.get("authorization");
    const token = authorization
      ?.match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim();

    if (!token) {
      return json(
        {
          success: false,
          error: "Authentication required. Please log in again.",
        },
        401
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return json(
        {
          success: false,
          error: "Invalid or expired admin session.",
        },
        401
      );
    }

    // 2. Verify admin permissions
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error(
        "[Worker Request Refunds] Admin verification error:",
        adminError.message
      );

      return json(
        {
          success: false,
          error: "Unable to verify admin permissions.",
        },
        500
      );
    }

    const role = String(admin?.role ?? "").toLowerCase();

    if (
      !admin ||
      admin.is_active !== true ||
      !["admin", "super_admin", "finance_admin"].includes(role)
    ) {
      return json(
        {
          success: false,
          error: "You do not have permission to access Finance.",
        },
        403
      );
    }

    // 3. Fetch all worker requests that have a cancellation status.
    // Includes pending, approved and rejected requests.
    const { data, error } = await supabaseAdmin
      .from("worker_requests")
      .select(`
        id,
        worker_name,
        category,
        location,
        work_date,
        start_time,
        duration,
        budget,
        requirement,
        status,
        requester_type,
        requester_name,
        requester_mobile,
        requester_email,
        company_name,
        project_name,
        cancellation_status,
        cancellation_reason,
        cancellation_details,
        cancellation_requested_at,
        cancellation_reviewed_at,
        cancellation_reviewed_by,
        cancellation_admin_note,
        refund_status,
        refund_amount,
        booking_charge_amount,
        payment_status,
        razorpay_payment_id,
        razorpay_refund_id,
        refund_initiated_at,
        refund_completed_at,
        created_at
      `)
      .not("cancellation_status", "is", null)
      .order("cancellation_requested_at", {
        ascending: false,
        nullsFirst: false,
      });

    if (error) {
      console.error(
        "[Worker Request Refunds] Database query error:",
        error.message
      );

      return json(
        {
          success: false,
          error: `Failed to fetch cancellation requests: ${error.message}`,
        },
        500
      );
    }

    // 4. Map existing database records without inventing payment details.
    const workerRequestCancellations = (data ?? []).map((row) => ({
      ...row,
      razorpay_payment_id: row.razorpay_payment_id ?? null,
      transaction_id: null,
      payment_method: null,
    }));

    return json({
      success: true,
      workerRequestCancellations,
      count: workerRequestCancellations.length,
    });
  } catch (error) {
    console.error(
      "[Worker Request Refunds] Unexpected error:",
      error
    );

    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error while fetching cancellation requests.",
      },
      500
    );
  }
}
