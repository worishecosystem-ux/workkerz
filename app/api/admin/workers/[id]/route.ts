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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =====================================================
   ADMIN AUTH
===================================================== */

async function authorizeAdmin(request: NextRequest) {
  const authorization = request.headers.get(
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
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
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
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error(
      "Admin profile error:",
      adminError,
    );

    return {
      error: "Unable to verify admin.",
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
      error: "Admin account is disabled.",
      status: 403,
    };
  }

  /* SUPER ADMIN */

  if (admin.role === "super_admin") {
    return {
      admin,
    };
  }

  /* WORKER ADMIN */

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

  if (workerRoleError || !workerRole) {
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
   PATCH WORKER
===================================================== */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    /* AUTH */

    const authorization =
      await authorizeAdmin(request);

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

    /* WORKER ID */

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Worker ID is required.",
        },
        { status: 400 },
      );
    }

    /* BODY */

    const body = await request.json();

    console.log(
      "PATCH WORKER ID:",
      id,
    );

    console.log(
      "PATCH WORKER BODY:",
      body,
    );

    /* =================================================
       AVAILABILITY UPDATE
    ================================================= */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "available",
      )
    ) {
      if (
        typeof body.available !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "available must be true or false.",
          },
          { status: 400 },
        );
      }

      const {
        data: worker,
        error,
      } = await supabaseAdmin
        .from("workers")
        .update({
          available: body.available,
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error(
          "Availability update error:",
          error,
        );

        return NextResponse.json(
          {
            error: error.message,
          },
          { status: 500 },
        );
      }

      if (!worker) {
        return NextResponse.json(
          {
            error: "Worker not found.",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message:
            body.available
              ? "Worker is now available."
              : "Worker is now unavailable.",
          worker,
        },
        { status: 200 },
      );
    }

    /* =================================================
       GENERAL WORKER UPDATE
    ================================================= */

    const allowedFields = [
      "full_name",
      "name",
      "email",
      "phone",
      "mobile",
      "category",
      "profession",
      "subcategory",
      "specialty",
      "location",
      "city",
      "labourChauk",
      "labour_chauk",
      "is_active",
      "status",
      "yearsExperience",
      "years_experience",
      "completedJobs",
      "completed_jobs",
      "bio",
      "photo",
      "responseTime",
      "response_time",
      "rating",
      "reviewCount",
      "review_count",
      "pricingType",
      "pricing_type",
      "startingPrice",
      "starting_price",
      "halfDayPrice",
      "half_day_price",
      "fullDayPrice",
      "full_day_price",
      "monthlyPrice",
      "monthly_price",
      "visitCharge",
      "visit_charge",
      "services",
      "skills",
      "certifications",
    ];

    const updates: Record<
      string,
      unknown
    > = {};

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          body,
          field,
        )
      ) {
        updates[field] = body[field];
      }
    }

    if (
      Object.keys(updates).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid fields to update.",
        },
        { status: 400 },
      );
    }

    const {
      data: worker,
      error,
    } = await supabaseAdmin
      .from("workers")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error(
        "Worker update error:",
        error,
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 },
      );
    }

    if (!worker) {
      return NextResponse.json(
        {
          error: "Worker not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Worker updated successfully.",
        worker,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "PATCH WORKER ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}

/* =====================================================
   DELETE WORKER
===================================================== */

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const authorization =
      await authorizeAdmin(request);

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

    if (
      authorization.admin.role !==
      "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Only Super Admin can delete workers.",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Worker ID is required.",
        },
        { status: 400 },
      );
    }

    const {
      data: worker,
      error: workerError,
    } = await supabaseAdmin
      .from("workers")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (workerError) {
      return NextResponse.json(
        {
          error:
            workerError.message,
        },
        { status: 500 },
      );
    }

    if (!worker) {
      return NextResponse.json(
        {
          error: "Worker not found.",
        },
        { status: 404 },
      );
    }

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from("workers")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        {
          error:
            deleteError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Worker deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "DELETE WORKER ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status: 500 },
    );
  }
}