import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

type AdminRole = {
  id: string;
  name: string;
  label: string | null;
  description: string | null;
  is_active: boolean;
};

type AdminRoleAssignment = {
  role_id: string;
  admin_roles:
    | AdminRole
    | AdminRole[]
    | null;
};

export async function GET(
  request: NextRequest,
) {
  try {
    // =====================================================
    // GET ACCESS TOKEN
    // =====================================================

    const authorization =
      request.headers.get(
        "authorization",
      );

    if (!authorization) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const token =
      authorization.replace(
        /^Bearer\s+/i,
        "",
      ).trim();

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =====================================================
    // VERIFY AUTH USER
    // =====================================================

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        token,
      );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Invalid session.",
        },
        {
          status: 401,
        },
      );
    }

    // =====================================================
    // GET ADMIN PROFILE
    // =====================================================

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
        "Admin profile error:",
        adminError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load admin profile.",
        },
        {
          status: 500,
        },
      );
    }

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Admin profile not found.",
        },
        {
          status: 403,
        },
      );
    }

    // =====================================================
    // CHECK ACTIVE
    // =====================================================

    if (!admin.is_active) {
      return NextResponse.json(
        {
          error:
            "Admin account is disabled.",
        },
        {
          status: 403,
        },
      );
    }

    // =====================================================
    // SUPER ADMIN
    // =====================================================

    if (
      admin.role ===
      "super_admin"
    ) {
      return NextResponse.json(
        {
          admin,
          assignedRoles: [],
          isSuperAdmin: true,
        },
        {
          status: 200,
        },
      );
    }

    // =====================================================
    // GET ASSIGNED ROLES
    // =====================================================

    const {
      data: rawAssignments,
      error: assignmentError,
    } =
      await supabaseAdmin
        .from(
          "admin_role_assignments",
        )
        .select(
          `
            role_id,
            admin_roles (
              id,
              name,
              label,
              description,
              is_active
            )
          `,
        )
        .eq(
          "admin_id",
          user.id,
        );

    if (assignmentError) {
      console.error(
        "Admin roles error:",
        assignmentError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load admin roles.",
        },
        {
          status: 500,
        },
      );
    }

    // =====================================================
    // TYPE SUPABASE NESTED RESULT
    // =====================================================

    const assignments =
      (rawAssignments ??
        []) as unknown as AdminRoleAssignment[];

    // =====================================================
    // FORMAT ROLES
    // =====================================================

    const assignedRoles =
      assignments
        .flatMap(
          (assignment) => {
            if (
              Array.isArray(
                assignment.admin_roles,
              )
            ) {
              return assignment.admin_roles;
            }

            if (
              assignment.admin_roles
            ) {
              return [
                assignment.admin_roles,
              ];
            }

            return [];
          },
        )
        .filter(
          (role) =>
            role.is_active,
        );

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        admin,
        assignedRoles,
        isSuperAdmin: false,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Admin me API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}