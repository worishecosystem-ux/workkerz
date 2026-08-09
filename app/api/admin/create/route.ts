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

// =====================================================
// TYPES
// =====================================================

type AccountRole = "admin" | "super_admin";

type AdminRole =
  | "worker_admin"
  | "order_admin"
  | "shop_admin"
  | "booking_admin"
  | "support_admin"
  | "finance_admin"
  | "verification_admin";

// =====================================================
// VALID ROLES
// =====================================================

const VALID_ACCOUNT_ROLES: AccountRole[] = [
  "admin",
  "super_admin",
];

const VALID_ADMIN_ROLES: AdminRole[] = [
  "worker_admin",
  "order_admin",
  "shop_admin",
  "booking_admin",
  "support_admin",
  "finance_admin",
  "verification_admin",
];

// =====================================================
// POST /api/admin/create
// =====================================================

export async function POST(request: NextRequest) {
  let createdUserId: string | null = null;

  try {
    // ===================================================
    // READ REQUEST
    // ===================================================

    const body = await request.json();

    const {
      full_name,
      email,
      password,
      role,
      admin_roles,
    } = body;

    // ===================================================
    // BASIC VALIDATION
    // ===================================================

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

    // ===================================================
    // NAME VALIDATION
    // ===================================================

    const normalizedName =
      String(full_name).trim();

    if (normalizedName.length < 2) {
      return NextResponse.json(
        {
          error: "Please enter a valid name.",
        },
        { status: 400 },
      );
    }

    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    const normalizedEmail =
      String(email).trim().toLowerCase();

    if (
      !normalizedEmail ||
      !normalizedEmail.includes("@")
    ) {
      return NextResponse.json(
        {
          error: "Please enter a valid email.",
        },
        { status: 400 },
      );
    }

    // ===================================================
    // PASSWORD VALIDATION
    // ===================================================

    if (
      typeof password !== "string" ||
      password.length < 8
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    // ===================================================
    // ACCOUNT ROLE VALIDATION
    // ===================================================

    if (
      !VALID_ACCOUNT_ROLES.includes(
        role as AccountRole,
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid account role.",
        },
        { status: 400 },
      );
    }

    const accountRole =
      role as AccountRole;

    // ===================================================
    // DEPARTMENT VALIDATION
    // ===================================================

    if (!Array.isArray(admin_roles)) {
      return NextResponse.json(
        {
          error:
            "At least one admin department is required.",
        },
        { status: 400 },
      );
    }

    if (admin_roles.length === 0) {
      return NextResponse.json(
        {
          error:
            "Select at least one department.",
        },
        { status: 400 },
      );
    }

    // ===================================================
    // REMOVE DUPLICATE DEPARTMENTS
    // ===================================================

    const uniqueAdminRoles = [
      ...new Set(
        admin_roles.map(
          (item: unknown) => String(item),
        ),
      ),
    ] as AdminRole[];

    // ===================================================
    // VALIDATE DEPARTMENT NAMES
    // ===================================================

    const invalidRoles =
      uniqueAdminRoles.filter(
        (item) =>
          !VALID_ADMIN_ROLES.includes(item),
      );

    if (invalidRoles.length > 0) {
      return NextResponse.json(
        {
          error:
            `Invalid admin department: ${invalidRoles.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // ===================================================
    // CREATE AUTH USER
    // ===================================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error(
        "Supabase Auth create error:",
        authError,
      );

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

    const adminId =
      authData.user.id;

    createdUserId = adminId;

    // ===================================================
    // CREATE ADMIN PROFILE
    // ===================================================

    const {
      error: profileError,
    } = await supabaseAdmin
      .from("admin_profiles")
      .insert({
        id: adminId,
        full_name: normalizedName,
        email: normalizedEmail,

        // Account role:
        // admin / super_admin
        role: accountRole,

        is_active: true,
      });

    if (profileError) {
      console.error(
        "Admin profile creation error:",
        profileError,
      );

      // Rollback Auth user
      await supabaseAdmin.auth.admin.deleteUser(
        adminId,
      );

      createdUserId = null;

      return NextResponse.json(
        {
          error: profileError.message,
        },
        { status: 500 },
      );
    }

    // ===================================================
    // FIND DEPARTMENT ROLES
    // ===================================================

    const {
      data: adminRoles,
      error: roleError,
    } = await supabaseAdmin
      .from("admin_roles")
      .select(
        "id, name, label",
      )
      .in(
        "name",
        uniqueAdminRoles,
      );

    if (roleError) {
      console.error(
        "Admin roles lookup error:",
        roleError,
      );

      // Rollback profile
      await supabaseAdmin
        .from("admin_profiles")
        .delete()
        .eq("id", adminId);

      // Rollback Auth user
      await supabaseAdmin.auth.admin.deleteUser(
        adminId,
      );

      createdUserId = null;

      return NextResponse.json(
        {
          error:
            roleError.message,
        },
        { status: 500 },
      );
    }

    // ===================================================
    // CHECK ALL DEPARTMENTS EXIST
    // ===================================================

    if (
      !adminRoles ||
      adminRoles.length !==
        uniqueAdminRoles.length
    ) {
      const foundRoles =
        new Set(
          (adminRoles || []).map(
            (item) => item.name,
          ),
        );

      const missingRoles =
        uniqueAdminRoles.filter(
          (item) =>
            !foundRoles.has(item),
        );

      console.error(
        "Missing admin roles:",
        missingRoles,
      );

      // Rollback profile
      await supabaseAdmin
        .from("admin_profiles")
        .delete()
        .eq("id", adminId);

      // Rollback Auth user
      await supabaseAdmin.auth.admin.deleteUser(
        adminId,
      );

      createdUserId = null;

      return NextResponse.json(
        {
          error:
            `Selected admin department(s) do not exist: ${missingRoles.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // ===================================================
    // CREATE ROLE ASSIGNMENTS
    // ===================================================

    const assignments =
      adminRoles.map(
        (adminRole) => ({
          admin_id: adminId,
          role_id: adminRole.id,
        }),
      );

    const {
      error: assignmentError,
    } = await supabaseAdmin
      .from(
        "admin_role_assignments",
      )
      .insert(assignments);

    if (assignmentError) {
      console.error(
        "Admin role assignment error:",
        assignmentError,
      );

      // -----------------------------------------------
      // ROLLBACK ROLE ASSIGNMENTS
      // -----------------------------------------------

      await supabaseAdmin
        .from(
          "admin_role_assignments",
        )
        .delete()
        .eq(
          "admin_id",
          adminId,
        );

      // -----------------------------------------------
      // ROLLBACK PROFILE
      // -----------------------------------------------

      await supabaseAdmin
        .from("admin_profiles")
        .delete()
        .eq("id", adminId);

      // -----------------------------------------------
      // ROLLBACK AUTH
      // -----------------------------------------------

      await supabaseAdmin.auth.admin.deleteUser(
        adminId,
      );

      createdUserId = null;

      return NextResponse.json(
        {
          error:
            assignmentError.message,
        },
        { status: 500 },
      );
    }

    // ===================================================
    // SUCCESS
    // ===================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Admin created successfully.",

        admin: {
          id: adminId,

          full_name:
            normalizedName,

          email:
            normalizedEmail,

          // Account role
          role:
            accountRole,

          // Department roles
          admin_roles:
            uniqueAdminRoles,

          is_active: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // ===================================================
    // UNEXPECTED ERROR
    // ===================================================

    console.error(
      "Create admin error:",
      error,
    );

    // ===================================================
    // EMERGENCY ROLLBACK
    // ===================================================

    if (createdUserId) {
      try {
        await supabaseAdmin
          .from(
            "admin_role_assignments",
          )
          .delete()
          .eq(
            "admin_id",
            createdUserId,
          );

        await supabaseAdmin
          .from("admin_profiles")
          .delete()
          .eq(
            "id",
            createdUserId,
          );

        await supabaseAdmin.auth.admin.deleteUser(
          createdUserId,
        );
      } catch (rollbackError) {
        console.error(
          "Admin rollback error:",
          rollbackError,
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating admin.",
      },
      { status: 500 },
    );
  }
}