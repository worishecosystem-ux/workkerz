import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function getAuthenticatedAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return null;
  }

  const { data: admin, error: adminError } =
    await supabaseAdmin
      .from("admin_profiles")
      .select("id, auth_user_id, full_name, email, role, is_active")
      .eq("auth_user_id", user.id)
      .maybeSingle();

  if (adminError || !admin || !admin.is_active) {
    return null;
  }

  return admin;
}

/* =========================================================
   GET — CHECK PIN STATUS
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("admin_security_settings")
      .select("id, setting_key, pin_hash, updated_at")
      .eq("setting_key", "trash_pin")
      .maybeSingle();

    if (error) {
      console.error("[Trash PIN GET]", error);

      return NextResponse.json(
        {
          error: "Unable to load Trash PIN settings.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      configured: Boolean(data?.pin_hash),
      updated_at: data?.updated_at ?? null,
    });
  } catch (error) {
    console.error("[Trash PIN GET]", error);

    return NextResponse.json(
      {
        error: "Unable to load Trash PIN settings.",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   POST — SET / CHANGE PIN
   ONLY SUPER ADMIN
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    /* SUPER ADMIN ONLY */

    if (admin.role !== "super_admin") {
      return NextResponse.json(
        {
          error:
            "Only Super Admin can manage the Trash PIN.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const pin = String(body?.pin ?? "").trim();

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        {
          error:
            "Trash PIN must contain 4 to 6 digits.",
        },
        { status: 400 },
      );
    }

    /* HASH PIN */

    const pinHash = await bcrypt.hash(pin, 12);

    /* SAVE */

    const { data, error } = await supabaseAdmin
      .from("admin_security_settings")
      .upsert(
        {
          setting_key: "trash_pin",
          pin_hash: pinHash,
          updated_by: admin.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "setting_key",
        },
      )
      .select(
        "id, setting_key, updated_by, updated_at",
      )
      .single();

    if (error) {
      console.error("[Trash PIN POST]", error);

      return NextResponse.json(
        {
          error: "Unable to save Trash PIN.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Trash PIN saved successfully.",
      setting: data,
    });
  } catch (error) {
    console.error("[Trash PIN POST]", error);

    return NextResponse.json(
      {
        error: "Unable to save Trash PIN.",
      },
      { status: 500 },
    );
  }
}