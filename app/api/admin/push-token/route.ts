import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token = String(body?.token || "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "FCM token is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("admin_push_tokens")
      .upsert(
        {
          token,
          platform: "android",
          app_id: "com.workkerz.admin",
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token" }
      )
      .select("id, token, platform, app_id, is_active")
      .single();

    if (error) {
      console.error("ADMIN PUSH TOKEN SAVE ERROR:", error);

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("ADMIN PUSH TOKEN API ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 500 }
    );
  }
}
