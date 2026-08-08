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

async function getAuthorizedAdmin(
  request: NextRequest,
) {
  const authorization =
    request.headers.get("authorization");

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
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    console.error(
      "Auth error:",
      userError,
    );

    return {
      error: "Invalid session.",
      status: 401,
    };
  }

  const {
    data: admin,
    error: adminError,
  } = await supabaseAdmin
    .from("admin_profiles")
    .select(
      "id, full_name, email, role, is_active",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error(
      "Admin profile error:",
      adminError,
    );

    return {
      error:
        "Unable to verify admin account.",
      status: 500,
    };
  }

  if (!admin) {
    return {
      error: "Admin access required.",
      status: 403,
    };
  }

  if (!admin.is_active) {
    return {
      error:
        "Your admin account is disabled.",
      status: 403,
    };
  }

  // Super Admin
  if (admin.role === "super_admin") {
    return {
      admin,
    };
  }

  // Worker Admin
  const {
    data: workerRole,
    error: workerRoleError,
  } = await supabaseAdmin
    .from("admin_role_assignments")
    .select(
      `
        role_id,
        admin_roles!inner (
          name,
          is_active
        )
      `,
    )
    .eq("admin_id", user.id)
    .eq(
      "admin_roles.name",
      "worker_admin",
    )
    .eq(
      "admin_roles.is_active",
      true,
    )
    .maybeSingle();

  if (workerRoleError) {
    console.error(
      "Worker role error:",
      workerRoleError,
    );

    return {
      error:
        "Unable to verify worker permissions.",
      status: 500,
    };
  }

  if (!workerRole) {
    return {
      error:
        "You do not have permission to manage workers.",
      status: 403,
    };
  }

  return {
    admin,
  };
}

/* =====================================================
   GET WORKERS
   /api/admin/workers
===================================================== */

export async function GET(
  request: NextRequest,
) {
  try {
    /* AUTH */

    const authorization =
      await getAuthorizedAdmin(request);

    if ("error" in authorization) {
      return NextResponse.json(
        {
          error: authorization.error,
        },
        {
          status: authorization.status,
        },
      );
    }

    /* QUERY */

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams
        .get("search")
        ?.trim() || "";

    const requestedLimit = Number(
      searchParams.get("limit") || "100",
    );

    const limit = Math.min(
      Math.max(
        Number.isFinite(requestedLimit)
          ? requestedLimit
          : 100,
        1,
      ),
      100,
    );

    /* QUERY WORKERS */

    let query = supabaseAdmin
      .from("workers")
      .select("*", {
        count: "exact",
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(limit);

    /* SEARCH */

    if (search) {
      const safeSearch =
        search.replace(/[%(),]/g, "");

      query = query.or(
        [
          `full_name.ilike.%${safeSearch}%`,
          `name.ilike.%${safeSearch}%`,
          `phone.ilike.%${safeSearch}%`,
          `email.ilike.%${safeSearch}%`,
        ].join(","),
      );
    }

    const {
      data: workers,
      error: workersError,
      count,
    } = await query;

    if (workersError) {
      console.error(
        "Workers query error:",
        workersError,
      );

      return NextResponse.json(
        {
          error:
            workersError.message ||
            "Unable to load workers.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        workers: workers ?? [],
        total: count ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Workers GET API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading workers.",
      },
      { status: 500 },
    );
  }
}