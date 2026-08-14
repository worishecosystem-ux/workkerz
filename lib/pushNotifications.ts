"use client";

import { Capacitor } from "@capacitor/core";

import {
  PushNotifications,
  type Token,
  type PushNotificationSchema,
  type ActionPerformed,
} from "@capacitor/push-notifications";

import { supabase } from "@/lib/supabase";

let initialized = false;
let currentFCMToken: string | null = null;
let authListenerRegistered = false;

/* =====================================================
   INITIALIZE
===================================================== */

export async function initPushNotifications() {
  if (Capacitor.getPlatform() !== "android") {
    console.log("[Push] Not Android. Skipping.");
    return;
  }

  if (initialized) {
    console.log("[Push] Already initialized.");

    if (currentFCMToken) {
      await saveDeviceToken(currentFCMToken);
    }

    return;
  }

  initialized = true;

  try {
    console.log(
      "[Push] Initializing Android push..."
    );

    /* =================================================
       AUTH LISTENER
    ================================================= */

    if (!authListenerRegistered) {
      authListenerRegistered = true;

      supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log(
            "[Push] Auth state:",
            event
          );

          if (
            event === "SIGNED_IN" &&
            session?.user?.id &&
            currentFCMToken
          ) {
            /*
             * Don't perform Supabase network calls
             * directly inside the auth callback.
             */

            setTimeout(() => {
              void saveDeviceToken(
                currentFCMToken!
              );
            }, 0);
          }
        }
      );
    }

    /* =================================================
       PERMISSION
    ================================================= */

    const permission =
      await PushNotifications.requestPermissions();

    console.log(
      "[Push] Permission:",
      JSON.stringify(permission)
    );

    if (
      permission.receive !== "granted"
    ) {
      console.warn(
        "[Push] Notification permission denied."
      );

      return;
    }

    /* =================================================
       REGISTRATION
    ================================================= */

    await PushNotifications.addListener(
      "registration",
      async (token: Token) => {
        const cleanToken =
          token.value?.trim();

        console.log(
          "[Push] ================================="
        );

        console.log(
          "[Push] NEW FCM TOKEN:"
        );

        console.log(
          cleanToken
        );

        console.log(
          "[Push] ================================="
        );

        if (!cleanToken) {
          console.warn(
            "[Push] Empty FCM token."
          );

          return;
        }

        currentFCMToken =
          cleanToken;

        await saveDeviceToken(
          cleanToken
        );
      }
    );

    /* =================================================
       REGISTRATION ERROR
    ================================================= */

    await PushNotifications.addListener(
      "registrationError",
      (error) => {
        console.error(
          "[Push] Registration error:",
          JSON.stringify(
            error,
            null,
            2
          )
        );
      }
    );

    /* =================================================
       RECEIVED
    ================================================= */

    await PushNotifications.addListener(
      "pushNotificationReceived",
      (
        notification: PushNotificationSchema
      ) => {
        console.log(
          "[Push] Notification received:"
        );

        console.log(
          JSON.stringify(
            notification,
            null,
            2
          )
        );
      }
    );

    /* =================================================
       CLICK
    ================================================= */

    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (
        action: ActionPerformed
      ) => {
        console.log(
          "[Push] Notification clicked:"
        );

        console.log(
          JSON.stringify(
            action,
            null,
            2
          )
        );
      }
    );

    /* =================================================
       REGISTER
    ================================================= */

    await PushNotifications.register();

    console.log(
      "[Push] Android push registered."
    );
  } catch (error) {
    console.error(
      "[Push] Initialization error:",
      error
    );

    initialized = false;
  }
}

/* =====================================================
   SAVE TOKEN
===================================================== */

async function saveDeviceToken(
  fcmToken: string
) {
  try {
    const cleanToken =
      fcmToken.trim();

    if (!cleanToken) {
      return;
    }

    currentFCMToken =
      cleanToken;

    /* =================================================
       SESSION
    ================================================= */

    const {
      data,
      error,
    } =
      await supabase.auth.getSession();

    if (error) {
      console.error(
        "[Push] Session error:",
        error
      );

      return;
    }

    const session =
      data.session;

    if (!session?.user?.id) {
      console.warn(
        "[Push] User not logged in. Token stored temporarily."
      );

      return;
    }

    const userId =
      session.user.id;

    const email =
      session.user.email
        ?.trim()
        .toLowerCase() ||
      null;

    console.log(
      "[Push] Saving token for user:",
      userId
    );

    /* =================================================
       REMOVE TOKEN FROM OTHER USERS
    ================================================= */

    const {
      error:
        duplicateError,
    } =
      await supabase
        .from("device_tokens")
        .delete()
        .eq(
          "fcm_token",
          cleanToken
        )
        .neq(
          "user_id",
          userId
        );

    if (duplicateError) {
      console.warn(
        "[Push] Duplicate token cleanup warning:",
        duplicateError
      );
    }

    /* =================================================
       SAVE
    ================================================= */

    const {
      error: upsertError,
    } =
      await supabase
        .from("device_tokens")
        .upsert(
          {
            user_id:
              userId,

            email,

            fcm_token:
              cleanToken,

            platform:
              "android",

            updated_at:
              new Date().toISOString(),
          },
          email
            ? {
                onConflict:
                  "email",
              }
            : {
                onConflict:
                  "fcm_token",
              }
        );

    if (upsertError) {
      console.error(
        "[Push] Token upsert error:",
        JSON.stringify(
          upsertError,
          null,
          2
        )
      );

      return;
    }

    console.log(
      "[Push] FCM token saved successfully."
    );
  } catch (error) {
    console.error(
      "[Push] Token save exception:",
      error
    );
  }
}

/* =====================================================
   PUBLIC SAVE AFTER LOGIN
===================================================== */

export async function saveCurrentFCMToken(
  fcmToken?: string
) {
  const token =
    fcmToken?.trim() ||
    currentFCMToken;

  if (!token) {
    console.warn(
      "[Push] No FCM token available."
    );

    return;
  }

  currentFCMToken =
    token;

  await saveDeviceToken(
    token
  );
}