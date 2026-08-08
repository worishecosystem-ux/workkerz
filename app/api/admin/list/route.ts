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

export async function GET() {
  try {
    const {
      data: admins,
      error,
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

    if (error) {
      console.error(
        "Admin list error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load admin accounts.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        admins: admins ?? [],
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
          "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}