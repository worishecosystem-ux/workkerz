import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFirebaseMessaging } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/* =====================================================
   SUPABASE ADMIN CLIENT
===================================================== */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing"
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/* =====================================================
   GET
===================================================== */

export async function GET(
  request: NextRequest
) {
  try {
    const supabase =
      getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "[Notifications GET] Error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        notifications: data || [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[Notifications GET] Exception:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load notifications.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   POST
   CREATE + SEND FCM
===================================================== */

export async function POST(
  request: NextRequest
) {
  try {
    /* =================================================
       AUTHORIZATION
    ================================================= */

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (!authorization) {
      return NextResponse.json(
        {
          error:
            "Authorization token is required.",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authorization.replace(
        /^Bearer\s+/i,
        ""
      ).trim();

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Invalid authorization token.",
        },
        {
          status: 401,
        }
      );
    }

    /* =================================================
       SUPABASE ADMIN
    ================================================= */

    const supabase =
      getSupabaseAdmin();

    /* =================================================
       VERIFY SESSION
    ================================================= */

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      userError ||
      !user
    ) {
      console.error(
        "[Notifications POST] Auth error:",
        userError
      );

      return NextResponse.json(
        {
          error:
            "Invalid or expired session.",
        },
        {
          status: 401,
        }
      );
    }

    /* =================================================
       READ BODY
    ================================================= */

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
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================================
       VALUES
    ================================================= */

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "system";

    const image_url =
      typeof body.image_url === "string" &&
      body.image_url.trim()
        ? body.image_url.trim()
        : null;

    const icon =
      typeof body.icon === "string" &&
      body.icon.trim()
        ? body.icon.trim()
        : "📢";

    const action_url =
      typeof body.action_url === "string" &&
      body.action_url.trim()
        ? body.action_url.trim()
        : null;

    const booking_id =
      typeof body.booking_id === "string" &&
      body.booking_id.trim()
        ? body.booking_id.trim()
        : null;

    const user_id =
      typeof body.user_id === "string" &&
      body.user_id.trim()
        ? body.user_id.trim()
        : null;

    const is_global =
      body.is_global === true;

    /* =================================================
       VALIDATION
    ================================================= */

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Notification title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Notification message is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !is_global &&
      !user_id
    ) {
      return NextResponse.json(
        {
          error:
            "A user must be selected for a user notification.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================================
       TARGET USER EMAIL
    ================================================= */

    let customer_email:
      | string
      | null = null;

    if (user_id) {
      const {
        data: authUser,
        error:
          authUserError,
      } =
        await supabase.auth.admin.getUserById(
          user_id
        );

      if (
        authUserError ||
        !authUser?.user
      ) {
        console.error(
          "[Notifications POST] Target user error:",
          authUserError
        );

        return NextResponse.json(
          {
            error:
              "Selected user could not be found.",

            details:
              authUserError?.message,
          },
          {
            status: 400,
          }
        );
      }

      customer_email =
        authUser.user.email ||
        null;
    }

    /* =================================================
       CREATE DATABASE NOTIFICATION
    ================================================= */

    const notification = {
      title,

      message,

      type,

      image_url,

      icon,

      action_url,

      booking_id,

      user_id:
        is_global
          ? null
          : user_id,

      customer_email,

      is_global,

      is_read: false,
    };

    console.log(
      "[Notifications POST] Creating notification:",
      {
        ...notification,
        created_by: user.id,
      }
    );

    const {
      data,
      error,
    } =
      await supabase
        .from("notifications")
        .insert(
          notification
        )
        .select("*")
        .single();

    if (error) {
      console.error(
        "[Notifications POST] INSERT error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to create notification.",

          details:
            error.details,

          hint:
            error.hint,

          code:
            error.code,
        },
        {
          status: 500,
        }
      );
    }

    /* =================================================
       FCM VARIABLES
    ================================================= */

    let pushSent = 0;
    let pushFailed = 0;
    let pushTargetCount = 0;

    /* =================================================
       SEND FCM
    ================================================= */

    try {
      /* ===============================================
         FIND ANDROID TOKENS
      =============================================== */

      let tokenQuery =
        supabase
          .from("device_tokens")
          .select(
            "fcm_token,user_id,email,platform"
          )
          .not(
            "fcm_token",
            "is",
            null
          );

      /* ===============================================
         GLOBAL
      =============================================== */

      if (is_global) {
        tokenQuery =
          tokenQuery.eq(
            "platform",
            "android"
          );
      }

      /* ===============================================
         SPECIFIC USER
      =============================================== */

      else {
        tokenQuery =
          tokenQuery
            .eq(
              "user_id",
              user_id
            )
            .eq(
              "platform",
              "android"
            );
      }

      const {
        data: deviceRows,
        error:
          deviceTokenError,
      } =
        await tokenQuery;

      if (
        deviceTokenError
      ) {
        console.error(
          "[FCM] device_tokens lookup error:",
          deviceTokenError
        );
      } else {
        /* =============================================
           UNIQUE TOKENS
        ============================================= */

        const tokens =
          Array.from(
            new Set(
              (deviceRows || [])
                .map(
                  (
                    row
                  ) =>
                    row.fcm_token
                )
                .filter(
                  (
                    value
                  ): value is string =>
                    typeof value ===
                      "string" &&
                    value.trim()
                      .length > 0
                )
            )
          );

        pushTargetCount =
          tokens.length;

        console.log(
          `[FCM] Sending to ${tokens.length} device(s).`
        );

        /* =============================================
           NO DEVICE
        ============================================= */

        if (
          tokens.length === 0
        ) {
          console.log(
            "[FCM] No Android device tokens found."
          );
        }

        /* =============================================
           SEND
        ============================================= */

        else {
          const messaging =
            getFirebaseMessaging();

          /* =========================================
             DATA PAYLOAD
             
             IMPORTANT:
             Only DATA is sent.
             
             Android WorkkerzFirebaseMessagingService
             will create the notification UI.
          ========================================= */

          const dataPayload: Record<
            string,
            string
          > = {
            title,

            body:
              message,

            type,

            icon,

            notification_id:
              String(
                data?.id ||
                  ""
              ),
          };

          if (
            image_url
          ) {
            dataPayload.image_url =
              image_url;
          }

          if (
            action_url
          ) {
            dataPayload.action_url =
              action_url;
          }

          if (
            booking_id
          ) {
            dataPayload.booking_id =
              booking_id;
          }

          console.log(
            "[FCM] Data payload:",
            dataPayload
          );

          /* =========================================
             MAX 500 TOKENS PER MULTICAST
          ========================================= */

          for (
            let i = 0;
            i < tokens.length;
            i += 500
          ) {
            const batch =
              tokens.slice(
                i,
                i + 500
              );

            console.log(
              `[FCM] Sending batch ${
                Math.floor(
                  i / 500
                ) + 1
              }`
            );

            /* =======================================
               SEND DATA-ONLY MESSAGE
            ======================================= */

            const response =
              await messaging.sendEachForMulticast(
                {
                  tokens:
                    batch,

                  data:
                    dataPayload,

                  android: {
                    priority:
                      "high",
                  },
                }
              );

            pushSent +=
              response.successCount;

            pushFailed +=
              response.failureCount;

            console.log(
              "[FCM] Batch result:",
              {
                success:
                  response.successCount,

                failed:
                  response.failureCount,
              }
            );

            /* =======================================
               PROCESS FAILURES
            ======================================= */

            for (
              let index = 0;
              index <
              response.responses.length;
              index++
            ) {
              const result =
                response
                  .responses[
                  index
                ];

              if (
                result.success
              ) {
                continue;
              }

              const failedToken =
                batch[index];

              const errorCode =
                result.error
                  ?.code;

              const errorMessage =
                result.error
                  ?.message;

              console.error(
                "[FCM] Failed token:",
                {
                  token:
                    failedToken,

                  code:
                    errorCode,

                  error:
                    errorMessage,
                }
              );

              /* =====================================
                 INVALID TOKEN DETECTION
              ===================================== */

              const invalidToken =
                errorCode ===
                  "messaging/registration-token-not-registered" ||
                errorMessage?.includes(
                  "Requested entity was not found"
                ) ||
                errorMessage?.includes(
                  "registration token is not a valid FCM registration token"
                ) ||
                errorMessage?.includes(
                  "NotRegistered"
                );

              /* =====================================
                 DELETE INVALID TOKEN
              ===================================== */

              if (
                invalidToken
              ) {
                console.log(
                  "[FCM] Removing invalid token from database..."
                );

                const {
                  error:
                    deleteTokenError,
                } =
                  await supabase
                    .from(
                      "device_tokens"
                    )
                    .delete()
                    .eq(
                      "fcm_token",
                      failedToken
                    );

                if (
                  deleteTokenError
                ) {
                  console.error(
                    "[FCM] Failed to delete invalid token:",
                    deleteTokenError
                  );
                } else {
                  console.log(
                    "[FCM] Invalid token deleted successfully."
                  );
                }
              }
            }
          }
        }
      }
    } catch (
      pushError
    ) {
      console.error(
        "[FCM] Push send error:",
        pushError
      );
    }

    /* =================================================
       SUCCESS RESPONSE
    ================================================= */

    return NextResponse.json(
      {
        success: true,

        message:
          "Notification created and push processed.",

        notification:
          data,

        push: {
          targetCount:
            pushTargetCount,

          sent:
            pushSent,

          failed:
            pushFailed,
        },
      },
      {
        status: 201,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "[Notifications POST] Exception:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send notification.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   DELETE
===================================================== */

export async function DELETE(
  request: NextRequest
) {
  try {
    /* =================================================
       AUTHORIZATION
    ================================================= */

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (!authorization) {
      return NextResponse.json(
        {
          error:
            "Authorization token is required.",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authorization.replace(
        /^Bearer\s+/i,
        ""
      ).trim();

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Invalid authorization token.",
        },
        {
          status: 401,
        }
      );
    }

    /* =================================================
       SUPABASE ADMIN
    ================================================= */

    const supabase =
      getSupabaseAdmin();

    /* =================================================
       VERIFY USER
    ================================================= */

    const {
      data: {
        user,
      },
      error:
        authError,
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired session.",
        },
        {
          status: 401,
        }
      );
    }

    /* =================================================
       BODY
    ================================================= */

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
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Notification ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================================
       DELETE NOTIFICATION
    ================================================= */

    const {
      error,
    } =
      await supabase
        .from("notifications")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      console.error(
        "[Notifications DELETE] Error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message,

          details:
            error.details,

          hint:
            error.hint,

          code:
            error.code,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        message:
          "Notification deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "[Notifications DELETE] Exception:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete notification.",
      },
      {
        status: 500,
      }
    );
  }
}