import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function verifyAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return { error: "Authentication required", status: 401 as const };
  }

  const { data: auth, error: authError } =
    await supabaseAdmin.auth.getUser(token);

  if (authError || !auth.user) {
    return { error: "Invalid or expired session", status: 401 as const };
  }

  const { data: admin, error } = await supabaseAdmin
    .from("admin_profiles")
    .select("id, role, is_active")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) {
    return { error: "Unable to verify admin", status: 500 as const };
  }

  if (
    !admin ||
    admin.is_active !== true ||
    !["super_admin", "finance_admin"].includes(
      String(admin.role ?? "").toLowerCase()
    )
  ) {
    return { error: "Finance access denied", status: 403 as const };
  }

  return { userId: auth.user.id };
}

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyAdmin(request);

    if ("error" in verified) {
      return json(
        { success: false, error: verified.error },
        verified.status
      );
    }

    const page = Math.max(
      1,
      Number(request.nextUrl.searchParams.get("page") ?? 1) || 1
    );
    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number(request.nextUrl.searchParams.get("pageSize") ?? 20) || 20
      )
    );

    const { data, error, count } = await supabaseAdmin
      .from("notifications")
      .select(
        "id, title, message, type, customer_email, booking_id, action_url, is_read, created_at, created_by",
        { count: "exact" }
      )
      .eq("is_global", false)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error("[Finance Notifications GET]", error.message);
      return json(
        { success: false, error: "Unable to load notifications" },
        500
      );
    }

    return json({
      success: true,
      data: {
        notifications: data ?? [],
        total: count ?? 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("[Finance Notifications GET]", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const verified = await verifyAdmin(request);

    if ("error" in verified) {
      return json(
        { success: false, error: verified.error },
        verified.status
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "Invalid JSON body" }, 400);
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const customerEmail =
      typeof body.customer_email === "string"
        ? body.customer_email.trim()
        : null;
    const bookingId =
      typeof body.booking_id === "string" ? body.booking_id : null;
    const actionUrl =
      typeof body.action_url === "string" ? body.action_url : "/";

    if (!title || !message || title.length > 150 || message.length > 2000) {
      return json(
        { success: false, error: "Valid title and message are required" },
        400
      );
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        title,
        message,
        type: "system",
        customer_email: customerEmail || null,
        booking_id: bookingId,
        action_url: actionUrl,
        is_global: false,
        is_read: false,
        created_by: verified.userId,
      })
      .select(
        "id, title, message, type, customer_email, booking_id, action_url, is_read, created_at"
      )
      .single();

    if (error) {
      console.error("[Finance Notifications POST]", error.message);
      return json(
        { success: false, error: "Unable to create notification" },
        500
      );
    }

    return json({ success: true, data }, 201);
  } catch (error) {
    console.error("[Finance Notifications POST]", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}