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
   ADMIN AUTHORIZATION
===================================================== */

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
    .select(`
      role_id,
      admin_roles!inner (
        name,
        is_active
      )
    `)
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
   GET /api/admin/workers
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

    /* WORKERS QUERY */

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
        search.replace(
          /[%(),]/g,
          "",
        );

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
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        workers: workers ?? [],
        total: count ?? 0,
      },
      {
        status: 200,
      },
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
      {
        status: 500,
      },
    );
  }
}

/* =====================================================
   CREATE WORKER
   POST /api/admin/workers
===================================================== */

export async function POST(
  request: NextRequest,
) {
  try {
    /* =================================================
       AUTH
    ================================================= */

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

    /* =================================================
       REQUEST BODY
    ================================================= */

    let body: Record<
      string,
      unknown
    >;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        },
      );
    }

    console.log(
      "[Workers POST] Body:",
      body,
    );

    /* =================================================
       HELPERS
    ================================================= */

    const stringValue = (
      value: unknown,
    ) => {
      if (
        typeof value !== "string"
      ) {
        return "";
      }

      return value.trim();
    };

    const nullableString = (
      value: unknown,
    ) => {
      const result =
        stringValue(value);

      return result || null;
    };

    const numberValue = (
      value: unknown,
    ) => {
      const number = Number(value);

      if (
        !Number.isFinite(number) ||
        number < 0
      ) {
        return 0;
      }

      return number;
    };

    const arrayValue = (
      value: unknown,
    ): string[] => {
      if (!Array.isArray(value)) {
        return [];
      }

      return value
        .map((item) =>
          String(item).trim(),
        )
        .filter(Boolean);
    };

    /* =================================================
       REQUIRED FIELDS
    ================================================= */

    const name =
      stringValue(body.name);

    const phone =
      stringValue(body.phone);

    const category =
      stringValue(body.category);

    const subcategory =
      stringValue(
        body.subcategory,
      );

    const specialty =
      stringValue(body.specialty);

    const location =
      stringValue(body.location);

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Worker name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error:
            "Phone number is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          error:
            "Enter valid 10 digit mobile number.",
        },
        {
          status: 400,
        },
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Worker category is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!subcategory) {
      return NextResponse.json(
        {
          error:
            "Worker subcategory is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!specialty) {
      return NextResponse.json(
        {
          error:
            "Specialty is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!location) {
      return NextResponse.json(
        {
          error:
            "Location is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* =================================================
       PAYLOAD
    ================================================= */

    const workerPayload = {
      name,

      phone,

      category,

      subcategory,

      specialty,

      location,

      labour_chauk:
        nullableString(
          body.labour_chauk,
        ),

      years_experience:
        numberValue(
          body.years_experience,
        ),

      bio:
        nullableString(
          body.bio,
        ),

      response_time:
        nullableString(
          body.response_time,
        ),

      skills:
        arrayValue(
          body.skills,
        ),

      services:
        arrayValue(
          body.services,
        ),

      certifications:
        arrayValue(
          body.certifications,
        ),

      pricing_type:
        stringValue(
          body.pricing_type,
        ) || "custom",

      starting_price:
        numberValue(
          body.starting_price,
        ),

      half_day_price:
        numberValue(
          body.half_day_price,
        ),

      full_day_price:
        numberValue(
          body.full_day_price,
        ),

      monthly_price:
        numberValue(
          body.monthly_price,
        ),

      visit_charge:
        numberValue(
          body.visit_charge,
        ),

      available:
        typeof body.available ===
        "boolean"
          ? body.available
          : true,

      photo:
        nullableString(
          body.photo,
        ),
    };

    console.log(
      "[Workers POST] Payload:",
      workerPayload,
    );

    /* =================================================
       INSERT
    ================================================= */

    const {
      data: worker,
      error: workerError,
    } = await supabaseAdmin
      .from("workers")
      .insert(workerPayload)
      .select("*")
      .single();

    if (workerError) {
      console.error(
        "[Workers POST] Supabase error:",
        workerError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            workerError.message ||
            "Unable to create worker.",
          code:
            workerError.code || null,
          details:
            workerError.details || null,
          hint:
            workerError.hint || null,
        },
        {
          status: 500,
        },
      );
    }

    /* =================================================
       SUCCESS
    ================================================= */

    return NextResponse.json(
      {
        success: true,
        message:
          "Worker created successfully.",
        worker,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "[Workers POST] API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating worker.",
      },
      {
        status: 500,
      },
    );
  }
}