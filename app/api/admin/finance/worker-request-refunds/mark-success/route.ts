
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers
      .get("authorization")
      ?.match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim();

    if (!token) {
      return json({ success: false, error: "Authentication required." }, 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return json({ success: false, error: "Invalid admin session." }, 401);
    }

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (
      adminError ||
      !admin ||
      admin.is_active !== true ||
      !["admin", "super_admin", "finance_admin"].includes(
        String(admin.role ?? "").toLowerCase()
      )
    ) {
      return json({ success: false, error: "Finance admin permission required." }, 403);
    }

    const body = await request.json();
    const requestId =
      typeof body.requestId === "string" ? body.requestId.trim() : "";

    if (!requestId) {
      return json({ success: false, error: "Worker request ID is required." }, 400);
    }

    const { data: workerRequest, error: lookupError } = await supabaseAdmin
      .from("worker_requests")
      .select("id, refund_status, razorpay_refund_id")
      .eq("id", requestId)
      .maybeSingle();

    if (lookupError) {
      console.error("[Refund Success] Lookup error:", lookupError.message);
      return json({ success: false, error: "Unable to find refund record." }, 500);
    }

    if (!workerRequest) {
      return json({ success: false, error: "Worker request not found." }, 404);
    }

    if (!workerRequest.razorpay_refund_id) {
      return json(
        {
          success: false,
          error: "Razorpay refund ID is missing. Verify the refund before marking it successful.",
        },
        409
      );
    }

    if (String(workerRequest.refund_status ?? "").toLowerCase() === "refunded") {
      return json({ success: true, message: "Refund already marked successful." });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("worker_requests")
      .update({
        refund_status: "refunded",
        refund_completed_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select("id, refund_status, refund_completed_at, razorpay_refund_id")
      .maybeSingle();

    if (updateError || !updated) {
      console.error("[Refund Success] Update error:", updateError?.message);
      return json({ success: false, error: "Failed to update refund status." }, 500);
    }

    return json({
      success: true,
      message: "Refund status updated.",
      refund: updated,
    });
  } catch (error) {
    console.error("[Refund Success] Unexpected error:", error);

    return json(
      {
        success: false,
        error: "Internal server error while updating refund status.",
      },
      500
    );
  }
}
