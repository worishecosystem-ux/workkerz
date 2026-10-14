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

    // 2. Verify admin permission
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

    // 3. Validate refund ID
    const { id } = await context.params;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return json(
        { success: false, error: "Invalid refund ID" },
        400
      );
    }

    // 4. Validate rejection reason
    let body: { reason?: unknown };

    try {
      body = await request.json();
    } catch {
      return json(
        { success: false, error: "Valid JSON body is required" },
        400
      );
    }

    const reason =
      typeof body.reason === "string" ? body.reason.trim() : "";

    if (!reason || reason.length > 1000) {
      return json(
        {
          success: false,
          error: "Rejection reason is required (maximum 1000 characters)",
        },
        400
      );
    }

    // 5. Confirm request is still awaiting approval
    const { data: refund, error: fetchError } = await supabaseAdmin
      .from("refunds")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return json(
        { success: false, error: "Unable to load refund request" },
        500
      );
    }

    if (!refund) {
      return json(
        { success: false, error: "Refund request not found" },
        404
      );
    }

    if (refund.status !== "requested") {
      return json(
        {
          success: false,
          error: `Cannot reject refund with status "${refund.status}"`,
        },
        409
      );
    }

    // 6. Update only if still requested
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("refunds")
      .update({
        status: "cancelled",
        notes: reason,
      })
      .eq("id", id)
      .eq("status", "requested")
      .select("id, status, notes, customer_email")
      .maybeSingle();

    if (updateError) {
      console.error("[Refund Rejection]", updateError.message);

      return json(
        { success: false, error: "Unable to reject refund request" },
        500
      );
    }

    if (!updated) {
      return json(
        {
          success: false,
          error: "Request was already updated. Refresh and retry.",
        },
        409
      );
    }

    return json({
      success: true,
      message: "Refund request rejected",
      data: updated,
    });
  } catch (error) {
    console.error("[Refund Rejection API]", error);

    return json(
      { success: false, error: "Internal server error" },
      500
    );
  }
}
