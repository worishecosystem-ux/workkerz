import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/* =========================================================
   AUTHENTICATE ADMIN
========================================================= */

async function getAuthenticatedAdmin(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      console.error("[Trash PIN Set] Authorization header missing");
      return null;
    }

    const match = authorization.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      console.error("[Trash PIN Set] Invalid authorization format");
      return null;
    }

    const token = match[1].trim();

    if (!token) {
      return null;
    }

    /* =====================================================
       VERIFY SUPABASE USER
    ===================================================== */

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError) {
      console.error(
        "[Trash PIN Set] Auth user error:",
        userError,
      );
      return null;
    }

    if (!user) {
      console.error("[Trash PIN Set] Auth user not found");
      return null;
    }

    /* =====================================================
       GET ADMIN PROFILE

       IMPORTANT:
       admin_profiles.auth_user_id DOES NOT EXIST.

       Your database uses:

       admin_profiles.id = auth.users.id
    ===================================================== */

    const {
      data: admin,
      error: adminError,
    } = await supabaseAdmin
      .from("admin_profiles")
      .select(`
        id,
        full_name,
        email,
        role,
        is_active
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error(
        "[Trash PIN Set] Admin profile error:",
        adminError,
      );
      return null;
    }

    if (!admin) {
      console.error(
        "[Trash PIN Set] Admin profile not found:",
        user.id,
      );
      return null;
    }

    if (!admin.is_active) {
      console.error(
        "[Trash PIN Set] Admin account inactive",
      );
      return null;
    }

    return admin;
  } catch (error) {
    console.error(
      "[Trash PIN Set] Authentication exception:",
      error,
    );

    return null;
  }
}

/* =========================================================
   POST — SET / UPDATE TRASH PIN
========================================================= */

export async function POST(request: NextRequest) {
  try {
    /* =====================================================
       1. AUTHENTICATE ADMIN
    ===================================================== */

    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /* =====================================================
       2. SUPER ADMIN ONLY
    ===================================================== */

    if (admin.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only Super Admin can set or change the Trash PIN.",
        },
        {
          status: 403,
        },
      );
    }

    /* =====================================================
       3. READ BODY
    ===================================================== */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const pin =
      typeof body === "object" &&
      body !== null &&
      "pin" in body
        ? String(
            (body as { pin?: unknown }).pin ?? "",
          ).trim()
        : "";

    /* =====================================================
       4. EXACTLY 4 DIGITS
    ===================================================== */

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          error: "Trash PIN must be exactly 4 digits.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       5. HASH PIN
    ===================================================== */

    const pinHash = await bcrypt.hash(pin, 12);

    /* =====================================================
       6. CHECK EXISTING SETTING
    ===================================================== */

    const {
      data: existing,
      error: existingError,
    } = await supabaseAdmin
      .from("admin_security_settings")
      .select("id, setting_key")
      .eq("setting_key", "trash_pin")
      .maybeSingle();

    if (existingError) {
      console.error(
        "[Trash PIN Set] Existing setting error:",
        existingError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to access security settings.",
        },
        {
          status: 500,
        },
      );
    }

    /* =====================================================
       7. UPDATE EXISTING PIN
    ===================================================== */

    if (existing) {
      const { error: updateError } =
        await supabaseAdmin
          .from("admin_security_settings")
          .update({
            pin_hash: pinHash,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

      if (updateError) {
        console.error(
          "[Trash PIN Set] Update error:",
          updateError,
        );

        return NextResponse.json(
          {
            success: false,
            error: "Unable to update Trash PIN.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json(
        {
          success: true,
          configured: true,
          message: "Trash PIN changed successfully.",
        },
        {
          status: 200,
        },
      );
    }

    /* =====================================================
       8. CREATE NEW PIN
    ===================================================== */

    const { error: insertError } =
      await supabaseAdmin
        .from("admin_security_settings")
        .insert({
          setting_key: "trash_pin",
          pin_hash: pinHash,
          updated_at: new Date().toISOString(),
        });

    if (insertError) {
      console.error(
        "[Trash PIN Set] Insert error:",
        insertError,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to save Trash PIN.",
        },
        {
          status: 500,
        },
      );
    }

    /* =====================================================
       9. SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        configured: true,
        message: "Trash PIN set successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[Trash PIN Set] Unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to set Trash PIN.",
      },
      {
        status: 500,
      },
    );
  }
}