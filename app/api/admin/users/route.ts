import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Supabase server environment variables are missing.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data,
      error,
    } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (error) {
      console.error(
        "Supabase admin users error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    const users = (data?.users || []).map(
      (user) => ({
        id: user.id,
        email: user.email || "",
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User",
        avatar:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null,
        created_at:
          user.created_at || null,
      })
    );

    return NextResponse.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error(
      "Admin users API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load users.",
      },
      { status: 500 }
    );
  }
}