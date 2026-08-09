import { NextResponse } from "next/server";
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

type AdminRoleRecord = {
  id: string;
  name: string;
  is_active: boolean;
};

type AdminRoleAssignment = {
  admin_id: string;
  role_id: string;
  admin_roles:
    | AdminRoleRecord
    | AdminRoleRecord[]
    | null;
};

export async function GET() {
  try {
    // =====================================================
    // LOAD ADMINS
    // =====================================================

    const {
      data: admins,
      error: adminsError,
    } = await supabaseAdmin
      .from("admin_profiles")
      .select(
        `
          id,
          full_name,
          email,
          role,
          is_active,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      });

    if (adminsError) {
      console.error(
        "Admin profiles error:",
        adminsError,
      );

      return NextResponse.json(
        {
          error:
            adminsError.message ||
            "Unable to load admin accounts.",
        },
        {
          status: 500,
        },
      );
    }

    // =====================================================
    // LOAD ROLE ASSIGNMENTS
    // =====================================================

    const {
      data: rawAssignments,
      error: assignmentsError,
    } = await supabaseAdmin
      .from("admin_role_assignments")
      .select(
        `
          admin_id,
          role_id,
          admin_roles (
            id,
            name,
            is_active
          )
        `,
      );

    if (assignmentsError) {
      console.error(
        "Admin role assignments error:",
        assignmentsError,
      );

      return NextResponse.json(
        {
          error:
            assignmentsError.message ||
            "Unable to load admin roles.",
        },
        {
          status: 500,
        },
      );
    }

    // =====================================================
    // CAST SUPABASE NESTED RESULT
    // =====================================================

    const assignments =
      (rawAssignments ??
        []) as unknown as AdminRoleAssignment[];

    // =====================================================
    // FORMAT ADMINS
    // =====================================================

    const formattedAdmins =
      (admins ?? []).map((admin) => {
        const assignment =
          assignments.find(
            (item) =>
              item.admin_id ===
              admin.id,
          );

        let adminRole:
          | string
          | undefined;

        if (
          Array.isArray(
            assignment?.admin_roles,
          )
        ) {
          adminRole =
            assignment.admin_roles[0]
              ?.name;
        } else {
          adminRole =
            assignment?.admin_roles?.name;
        }

        return {
          id: admin.id,

          full_name:
            admin.full_name,

          email:
            admin.email,

          role:
            admin.role,

          admin_role:
            adminRole,

          is_active:
            admin.is_active,

          created_at:
            admin.created_at,
        };
      });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        admins: formattedAdmins,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Admin list API error:",
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