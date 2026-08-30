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

async function getAuthenticatedAdmin(
  request: NextRequest,
) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization) {
      console.error(
        "[Trash PIN Verify] Authorization header missing",
      );

      return null;
    }

    const match =
      authorization.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      console.error(
        "[Trash PIN Verify] Invalid authorization format",
      );

      return null;
    }

    const token = match[1].trim();

    if (!token) {
      return null;
    }

    /* =====================================================
       VERIFY SUPABASE AUTH USER
    ===================================================== */

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        token,
      );

    if (userError) {
      console.error(
        "[Trash PIN Verify] Auth user error:",
        userError,
      );

      return null;
    }

    if (!user) {
      console.error(
        "[Trash PIN Verify] Auth user not found",
      );

      return null;
    }

    /* =====================================================
       GET ADMIN PROFILE

       IMPORTANT:
       admin_profiles.id = Supabase Auth user.id
    ===================================================== */

    const {
      data: admin,
      error: adminError,
    } =
      await supabaseAdmin
        .from("admin_profiles")
        .select(
          `
            id,
            full_name,
            email,
            role,
            is_active
          `,
        )
        .eq("id", user.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        "[Trash PIN Verify] Admin profile error:",
        adminError,
      );

      return null;
    }

    if (!admin) {
      console.error(
        "[Trash PIN Verify] Admin profile not found:",
        user.id,
      );

      return null;
    }

    if (!admin.is_active) {
      console.error(
        "[Trash PIN Verify] Admin account inactive",
      );

      return null;
    }

    return admin;
  } catch (error) {
    console.error(
      "[Trash PIN Verify] Authentication exception:",
      error,
    );

    return null;
  }
}

/* =========================================================
   POST — VERIFY TRASH PIN
========================================================= */

export async function POST(
  request: NextRequest,
) {
  try {
    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const admin =
      await getAuthenticatedAdmin(
        request,
      );

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
       BODY
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
            (body as { pin?: unknown }).pin ??
              "",
          ).trim()
        : "";

    /* =====================================================
       VALIDATE PIN
    ===================================================== */

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Enter a valid 4–6 digit PIN.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       GET TRASH PIN HASH
    ===================================================== */

    const {
      data,
      error: pinError,
    } =
      await supabaseAdmin
        .from(
          "admin_security_settings",
        )
        .select("pin_hash")
        .eq(
          "setting_key",
          "trash_pin",
        )
        .maybeSingle();

    if (pinError) {
      console.error(
        "[Trash PIN Verify] PIN settings error:",
        pinError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify Trash PIN.",
        },
        {
          status: 500,
        },
      );
    }

    /* =====================================================
       PIN NOT CONFIGURED
    ===================================================== */

    if (!data?.pin_hash) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          error:
            "Trash PIN has not been configured by Super Admin.",
        },
        {
          status: 403,
        },
      );
    }

    /* =====================================================
       COMPARE PIN
    ===================================================== */

    const valid =
      await bcrypt.compare(
        pin,
        data.pin_hash,
      );

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          configured: true,
          error:
            "Incorrect Trash PIN.",
        },
        {
          status: 401,
        },
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        configured: true,
        message:
          "Trash PIN verified.",
        admin: {
          id: admin.id,
          role: admin.role,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "[Trash PIN Verify] Unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to verify Trash PIN.",
      },
      {
        status: 500,
      },
    );
  }
}