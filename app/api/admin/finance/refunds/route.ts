
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
    // 1. Authenticate logged-in admin
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

    // 2. Verify admin permissions
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (adminError) {
      console.error("[Finance Refunds] Admin check:", adminError.message);

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

    // 3. Fetch refunds
    const { data: refunds, error } = await supabaseAdmin
      .from("refunds")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Finance Refunds] Database error:", error.message);

      return json(
        { success: false, error: "Unable to fetch refunds" },
        500,
      );
    }

    // Always return an array inside data
    return json({
      success: true,
      data: Array.isArray(refunds) ? refunds : [],
    });
  } catch (error) {
    console.error("[Finance Refunds API]", error);

    return json(
      { success: false, error: "Internal server error" },
      500,
    );
  }
}
