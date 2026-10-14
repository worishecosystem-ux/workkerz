import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!token) {
      return json({ success: false, error: "Authentication required" }, 401);
    }

    const { data: auth, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !auth.user) {
      return json({ success: false, error: "Invalid or expired session" }, 401);
    }

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (adminError) {
      return json({ success: false, error: "Admin verification failed" }, 500);
    }

    if (
      !admin ||
      admin.is_active !== true ||
      !["super_admin", "finance_admin"].includes(
        String(admin.role ?? "").toLowerCase()
      )
    ) {
      return json({ success: false, error: "Finance access denied" }, 403);
    }

    const { id } = await context.params;
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return json({ success: false, error: "Invalid refund ID" }, 400);
    }

    const { data: refund, error: refundError } = await supabaseAdmin
      .from("refunds")
      .select("id, status, approved_at, approved_by")
      .eq("id", id)
      .maybeSingle();

    if (refundError) {
      return json({ success: false, error: "Unable to load refund" }, 500);
    }

    if (!refund) {
      return json({ success: false, error: "Refund not found" }, 404);
    }

    if (refund.status !== "requested") {
      return json(
        {
          success: false,
          error: `Cannot approve refund with status "${refund.status}"`,
        },
        409
      );
    }

    const now = new Date().toISOString();

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("refunds")
      .update({
        approved_by: auth.user.id,
        approved_at: now,
        status: "processing",
      })
      .eq("id", id)
      .eq("status", "requested")
      .select("id, status, approved_by, approved_at")
      .maybeSingle();

    if (updateError) {
      console.error("[Refund Approval]", updateError.message);
      return json({ success: false, error: "Unable to approve refund" }, 500);
    }

    if (!updated) {
      return json(
        { success: false, error: "Refund was already updated; refresh and retry" },
        409
      );
    }

    return json({
      success: true,
      message: "Refund approved for processing",
      data: updated,
      nextStep: "Razorpay refund processing is not performed by this route.",
    });
  } catch (error) {
    console.error("[Refund Approval API]", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}