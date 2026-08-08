import { NextRequest, NextResponse } from "next/server";
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

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const {
      full_name,
      email,
      password,
      role,
    } = body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !full_name ||
      !email ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        {
          error:
            "Name, email, password and role are required.",
        },
        { status: 400 },
      );
    }

    if (
      ![
        "worker_admin",
        "order_admin",
        "shop_admin",
        "booking_admin",
      ].includes(role)
    ) {
      return NextResponse.json(
        {
          error: "Invalid admin role.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // CREATE AUTH USER
    // =====================================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        {
          error: authError.message,
        },
        { status: 400 },
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error:
            "Unable to create admin user.",
        },
        { status: 500 },
      );
    }

    const adminId = authData.user.id;

    // =====================================================
    // CREATE ADMIN PROFILE
    // =====================================================

    const {
      error: profileError,
    } = await supabaseAdmin
      .from("admin_profiles")
      .insert({
        id: adminId,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        role: "admin",
        is_active: true,
      });

    if (profileError) {
      // Rollback Auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(
        adminId,
      );

      return NextResponse.json(
        {
          error: profileError.message,
        },
        { status: 500 },
      );
    }

    // =====================================================
    // FIND ROLE
    // =====================================================

    const {
      data: adminRole,
      error: roleError,
    } = await supabaseAdmin
      .from("admin_roles")
      .select("id, name, label")
      .eq("name", role)
      .maybeSingle();

    if (roleError || !adminRole) {
      // Rollback profile + auth user
      await supabaseAdmin
        .from("admin_profiles")
        .delete()
        .eq("id", adminId);

      await supabaseAdmin.auth.admin.deleteUser(
        adminId,
      );

      return NextResponse.json(
        {
          error:
            "Selected admin role does not exist.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // ASSIGN ROLE
    // =====================================================

    const {
      error: assignmentError,
    } = await supabaseAdmin
      .from("admin_role_assignments")
      .insert({
        admin_id: adminId,
        role_id: adminRole.id,
      });

    if (assignmentError) {
      // Rollback everything
      await supabaseAdmin
        .from("admin_profiles")
        .delete()
        .eq("id", adminId);

      await supabaseAdmin.auth.admin.deleteUser(
        adminId,
      );

      return NextResponse.json(
        {
          error:
            assignmentError.message,
        },
        { status: 500 },
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: adminId,
          full_name: full_name.trim(),
          email: email.trim().toLowerCase(),
          role,
          is_active: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create admin error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating admin.",
      },
      { status: 500 },
    );
  }
}