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

/* =====================================================
   TYPES
===================================================== */

type AccountRole =
  | "admin"
  | "super_admin";

const ADMIN_ROLES = [
  "worker_admin",
  "order_admin",
  "shop_admin",
  "booking_admin",
  "support_admin",
  "finance_admin",
  "verification_admin",
] as const;

type AdminRole =
  (typeof ADMIN_ROLES)[number];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =====================================================
   AUTHORIZATION
===================================================== */

async function authorizeSuperAdmin(
  request: NextRequest,
) {
  const authorization =
    request.headers.get(
      "authorization",
    );

  if (!authorization) {
    return {
      error: "Unauthorized.",
      status: 401,
    };
  }

  const token = authorization
    .replace(/^Bearer\s+/i, "")
    .trim();

  if (!token) {
    return {
      error: "Unauthorized.",
      status: 401,
    };
  }

  const {
    data: { user },
    error: authError,
  } =
    await supabaseAdmin.auth.getUser(
      token,
    );

  if (authError || !user) {
    return {
      error: "Invalid session.",
      status: 401,
    };
  }

  const {
    data: admin,
    error: adminError,
  } =
    await supabaseAdmin
      .from("admin_profiles")
      .select(
        "id, full_name, email, role, is_active",
      )
      .eq("id", user.id)
      .maybeSingle();

  if (adminError) {
    console.error(
      "Admin authorization error:",
      adminError,
    );

    return {
      error:
        "Unable to verify admin.",
      status: 500,
    };
  }

  if (!admin) {
    return {
      error:
        "Admin profile not found.",
      status: 403,
    };
  }

  if (!admin.is_active) {
    return {
      error:
        "Admin account is disabled.",
      status: 403,
    };
  }

  if (
    admin.role !==
    "super_admin"
  ) {
    return {
      error:
        "Only Super Admin can manage admin accounts.",
      status: 403,
    };
  }

  return {
    admin,
    user,
  };
}

/* =====================================================
   GET TARGET ADMIN
===================================================== */

async function getTargetAdmin(
  id: string,
) {
  const {
    data: admin,
    error,
  } =
    await supabaseAdmin
      .from("admin_profiles")
      .select(
        "id, full_name, email, role, is_active, created_at",
      )
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return admin;
}

/* =====================================================
   GET ADMIN ROLES
===================================================== */

async function getAdminRoles(
  adminId: string,
) {
  const {
    data,
    error,
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
        adminId,
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const roles: AdminRole[] = [];

  for (const assignment of
    data ?? []) {
    const role =
      assignment.admin_roles;

    if (
      role &&
      typeof role === "object" &&
      "name" in role &&
      typeof role.name ===
        "string" &&
      ADMIN_ROLES.includes(
        role.name as AdminRole,
      )
    ) {
      roles.push(
        role.name as AdminRole,
      );
    }
  }

  return Array.from(
    new Set(roles),
  );
}

/* =====================================================
   BUILD ADMIN RESPONSE
===================================================== */

async function buildAdminResponse(
  admin: {
    id: string;
    full_name: string;
    email: string;
    role: AccountRole;
    is_active: boolean;
    created_at?: string;
  },
) {
  const admin_roles =
    await getAdminRoles(
      admin.id,
    );

  return {
    ...admin,
    admin_roles,
  };
}

/* =====================================================
   PATCH ADMIN
===================================================== */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    /* -----------------------------------------------
       AUTH
    ----------------------------------------------- */

    const authorization =
      await authorizeSuperAdmin(
        request,
      );

    if (
      "error" in
      authorization
    ) {
      return NextResponse.json(
        {
          error:
            authorization.error,
        },
        {
          status:
            authorization.status,
        },
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Admin ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* -----------------------------------------------
       BODY
    ----------------------------------------------- */

    let body: Record<
      string,
      unknown
    >;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON request.",
        },
        {
          status: 400,
        },
      );
    }

    console.log(
      "PATCH ADMIN ID:",
      id,
    );

    console.log(
      "PATCH ADMIN BODY:",
      body,
    );

    /* -----------------------------------------------
       TARGET ADMIN
    ----------------------------------------------- */

    const targetAdmin =
      await getTargetAdmin(
        id,
      );

    if (!targetAdmin) {
      return NextResponse.json(
        {
          error:
            "Admin account not found.",
        },
        {
          status: 404,
        },
      );
    }

    /* -----------------------------------------------
       PREVENT SELF DEACTIVATION
    ----------------------------------------------- */

    if (
      id ===
      authorization.admin.id &&
      body.is_active === false
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot deactivate your own Super Admin account.",
        },
        {
          status: 400,
        },
      );
    }

    /* -----------------------------------------------
       PREVENT SELF DEMOTION
    ----------------------------------------------- */

    if (
      id ===
        authorization.admin.id &&
      body.role === "admin"
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot remove your own Super Admin access.",
        },
        {
          status: 400,
        },
      );
    }

    /* =================================================
       UPDATE ACCOUNT ROLE
    ================================================= */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "role",
      )
    ) {
      const role =
        body.role;

      if (
        role !== "admin" &&
        role !==
          "super_admin"
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid account role.",
          },
          {
            status: 400,
          },
        );
      }

      const {
        error,
      } =
        await supabaseAdmin
          .from(
            "admin_profiles",
          )
          .update({
            role,
          })
          .eq(
            "id",
            id,
          );

      if (error) {
        console.error(
          "Account role update error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              error.message,
          },
          {
            status: 500,
          },
        );
      }
    }

    /* =================================================
       UPDATE ACTIVE STATUS
    ================================================= */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "is_active",
      )
    ) {
      if (
        typeof body.is_active !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "is_active must be true or false.",
          },
          {
            status: 400,
          },
        );
      }

      const {
        error,
      } =
        await supabaseAdmin
          .from(
            "admin_profiles",
          )
          .update({
            is_active:
              body.is_active,
          })
          .eq(
            "id",
            id,
          );

      if (error) {
        console.error(
          "Status update error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              error.message,
          },
          {
            status: 500,
          },
        );
      }
    }

    /* =================================================
       UPDATE MULTIPLE DEPARTMENT ROLES
    ================================================= */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "admin_roles",
      )
    ) {
      const requestedRoles =
        body.admin_roles;

      if (
        !Array.isArray(
          requestedRoles,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "admin_roles must be an array.",
          },
          {
            status: 400,
          },
        );
      }

      /* ---------------------------------------------
         CLEAN + UNIQUE
      --------------------------------------------- */

      const uniqueRoles =
        Array.from(
          new Set(
            requestedRoles,
          ),
        );

      /* ---------------------------------------------
         VALIDATE ROLE NAMES
      --------------------------------------------- */

      const invalidRoles =
        uniqueRoles.filter(
          (role) =>
            typeof role !==
              "string" ||
            !ADMIN_ROLES.includes(
              role as AdminRole,
            ),
        );

      if (
        invalidRoles.length >
        0
      ) {
        return NextResponse.json(
          {
            error:
              `Invalid department role(s): ${invalidRoles.join(
                ", ",
              )}`,
          },
          {
            status: 400,
          },
        );
      }

      /*
       * If target is already Super Admin,
       * department roles are not necessary.
       *
       * We allow the assignments to be
       * cleared but don't require them.
       */

      /* ---------------------------------------------
         DELETE CURRENT ASSIGNMENTS
      --------------------------------------------- */

      const {
        error:
          deleteError,
      } =
        await supabaseAdmin
          .from(
            "admin_role_assignments",
          )
          .delete()
          .eq(
            "admin_id",
            id,
          );

      if (deleteError) {
        console.error(
          "Delete old role assignments error:",
          deleteError,
        );

        return NextResponse.json(
          {
            error:
              deleteError.message,
          },
          {
            status: 500,
          },
        );
      }

      /* ---------------------------------------------
         NO ROLES
      --------------------------------------------- */

      if (
        uniqueRoles.length ===
        0
      ) {
        console.log(
          "All department roles removed for:",
          id,
        );
      } else {
        /* -------------------------------------------
           GET ROLE IDS
        ------------------------------------------- */

        const {
          data: roles,
          error:
            rolesError,
        } =
          await supabaseAdmin
            .from(
              "admin_roles",
            )
            .select(
              "id, name, is_active",
            )
            .in(
              "name",
              uniqueRoles,
            );

        if (rolesError) {
          console.error(
            "Role lookup error:",
            rolesError,
          );

          return NextResponse.json(
            {
              error:
                rolesError.message,
            },
            {
              status: 500,
            },
          );
        }

        /* -------------------------------------------
           CHECK MISSING ROLES
        ------------------------------------------- */

        const foundRoles =
          (roles ?? []).map(
            (role) =>
              role.name,
          );

        const missingRoles =
          uniqueRoles.filter(
            (role) =>
              !foundRoles.includes(
                role,
              ),
          );

        if (
          missingRoles.length >
          0
        ) {
          return NextResponse.json(
            {
              error:
                `Roles not found: ${missingRoles.join(
                  ", ",
                )}`,
            },
            {
              status: 404,
            },
          );
        }

        /* -------------------------------------------
           CHECK DISABLED ROLES
        ------------------------------------------- */

        const inactiveRoles =
          (roles ?? []).filter(
            (role) =>
              !role.is_active,
          );

        if (
          inactiveRoles.length >
          0
        ) {
          return NextResponse.json(
            {
              error:
                `These roles are disabled: ${inactiveRoles
                  .map(
                    (role) =>
                      role.name,
                  )
                  .join(", ")}`,
            },
            {
              status: 400,
            },
          );
        }

        /* -------------------------------------------
           CREATE ASSIGNMENTS
        ------------------------------------------- */

        const assignments =
          (roles ?? []).map(
            (role) => ({
              admin_id: id,
              role_id:
                role.id,
            }),
          );

        if (
          assignments.length >
          0
        ) {
          const {
            error:
              insertError,
          } =
            await supabaseAdmin
              .from(
                "admin_role_assignments",
              )
              .insert(
                assignments,
              );

          if (insertError) {
            console.error(
              "Insert role assignments error:",
              insertError,
            );

            return NextResponse.json(
              {
                error:
                  insertError.message,
              },
              {
                status: 500,
              },
            );
          }
        }
      }
    }

    /* =================================================
       CHECK VALID CHANGES
    ================================================= */

    const hasChanges =
      Object.prototype.hasOwnProperty.call(
        body,
        "role",
      ) ||
      Object.prototype.hasOwnProperty.call(
        body,
        "is_active",
      ) ||
      Object.prototype.hasOwnProperty.call(
        body,
        "admin_roles",
      );

    if (!hasChanges) {
      return NextResponse.json(
        {
          error:
            "No valid changes provided.",
        },
        {
          status: 400,
        },
      );
    }

    /* =================================================
       RETURN UPDATED ADMIN
    ================================================= */

    const updatedBase =
      await getTargetAdmin(
        id,
      );

    if (!updatedBase) {
      return NextResponse.json(
        {
          error:
            "Admin account no longer exists.",
        },
        {
          status: 404,
        },
      );
    }

    const updatedAdmin =
      await buildAdminResponse(
        updatedBase,
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Admin updated successfully.",

        admin:
          updatedAdmin,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PATCH ADMIN ERROR:",
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

/* =====================================================
   DELETE ADMIN
===================================================== */

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    /* -----------------------------------------------
       AUTH
    ----------------------------------------------- */

    const authorization =
      await authorizeSuperAdmin(
        request,
      );

    if (
      "error" in
      authorization
    ) {
      return NextResponse.json(
        {
          error:
            authorization.error,
        },
        {
          status:
            authorization.status,
        },
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Admin ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* -----------------------------------------------
       PREVENT SELF DELETE
    ----------------------------------------------- */

    if (
      id ===
      authorization.admin.id
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot delete your own Super Admin account.",
        },
        {
          status: 400,
        },
      );
    }

    /* -----------------------------------------------
       TARGET
    ----------------------------------------------- */

    const targetAdmin =
      await getTargetAdmin(
        id,
      );

    if (!targetAdmin) {
      return NextResponse.json(
        {
          error:
            "Admin account not found.",
        },
        {
          status: 404,
        },
      );
    }

    /* -----------------------------------------------
       DELETE ROLE ASSIGNMENTS
    ----------------------------------------------- */

    const {
      error:
        assignmentDeleteError,
    } =
      await supabaseAdmin
        .from(
          "admin_role_assignments",
        )
        .delete()
        .eq(
          "admin_id",
          id,
        );

    if (
      assignmentDeleteError
    ) {
      console.error(
        "Delete role assignments error:",
        assignmentDeleteError,
      );

      return NextResponse.json(
        {
          error:
            assignmentDeleteError.message,
        },
        {
          status: 500,
        },
      );
    }

    /* -----------------------------------------------
       DELETE ADMIN PROFILE
    ----------------------------------------------- */

    const {
      error:
        profileDeleteError,
    } =
      await supabaseAdmin
        .from(
          "admin_profiles",
        )
        .delete()
        .eq(
          "id",
          id,
        );

    if (
      profileDeleteError
    ) {
      console.error(
        "Delete admin profile error:",
        profileDeleteError,
      );

      return NextResponse.json(
        {
          error:
            profileDeleteError.message,
        },
        {
          status: 500,
        },
      );
    }

    /* -----------------------------------------------
       DELETE AUTH USER
    ----------------------------------------------- */

    const {
      error:
        authDeleteError,
    } =
      await supabaseAdmin.auth.admin.deleteUser(
        id,
      );

    if (authDeleteError) {
      console.error(
        "Delete auth user error:",
        authDeleteError,
      );

      return NextResponse.json(
        {
          error:
            authDeleteError.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Admin account deleted successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "DELETE ADMIN ERROR:",
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