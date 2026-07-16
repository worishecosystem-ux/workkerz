import { NextRequest, NextResponse } from "next/server";
import { messaging } from "@/lib/firebaseAdmin";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { title, body, image } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and body are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("device_tokens")
      .select("fcm_token");

    if (error) {
      console.error("Supabase Error:", error);

      return NextResponse.json(
        {
          success: false,
          error,
        },
        { status: 500 }
      );
    }

    const tokens =
      data
        ?.map((item) => item.fcm_token)
        .filter(Boolean) || [];

    if (!tokens.length) {
      return NextResponse.json({
        success: false,
        message: "No device tokens found.",
      });
    }

    console.log("====================================");
    console.log("TOKENS");
    console.log(tokens);
    console.log("====================================");

   const response = await messaging.sendEachForMulticast({
  tokens,

  data: {
    title,
    body,
    image: image || "",
    type: "general",
    click_action: "OPEN_APP",
  },

  android: {
    priority: "high",
  },

  apns: {
    payload: {
      aps: {
        contentAvailable: true,
      },
    },
  },
});

    console.log("====================================");
    console.log("FCM RESPONSE");
    console.log(JSON.stringify(response.responses, null, 2));
    console.log("====================================");

    response.responses.forEach((item, index) => {
      if (!item.success) {
        console.error(
          `Token ${index} Failed`,
          item.error?.code,
          item.error?.message
        );
      }
    });

    return NextResponse.json({
      success: true,
      total: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    });
  } catch (err: any) {
    console.error("API ERROR");
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: err.stack,
      },
      {
        status: 500,
      }
    );
  }
}