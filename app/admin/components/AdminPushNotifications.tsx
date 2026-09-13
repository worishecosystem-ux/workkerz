"use client";

import { useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

import {
  PushNotifications,
  Token,
  PushNotificationSchema,
} from "@capacitor/push-notifications";

import {
  LocalNotifications,
  ActionPerformed,
  LocalNotificationSchema,
} from "@capacitor/local-notifications";

/* =========================================================
   CONSTANTS
========================================================= */

const ADMIN_CHANNEL_ID = "workkerz_admin_high";

const ADMIN_CHANNEL_NAME =
  "Workkerz Admin Alerts";

const ADMIN_CHANNEL_DESCRIPTION =
  "New bookings, orders and worker requests";

const ADMIN_BOOKING_ACTION_TYPE =
  "workkerz_booking_actions";

const DEFAULT_ICON = "ic_launcher";

/* =========================================================
   SOUND
========================================================= */

const getSoundForType = (
  type?: string,
) => {
  switch (type) {
    case "order":
      return "order";

    case "worker_request":
      return "worker_request";

    case "booking":
    default:
      return "booking";
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AdminPushNotifications() {
  const lastNotificationRef =
    useRef<string>("");

  const setupStartedRef =
    useRef(false);

  /* =======================================================
     AUDIO
  ======================================================= */

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const notificationBufferRef =
    useRef<AudioBuffer | null>(null);

  const audioUnlockedRef =
    useRef(false);

  const audioLoadingRef =
    useRef(false);

  const audioSourceRef =
    useRef<AudioBufferSourceNode | null>(null);

  /* =======================================================
     LOAD AUDIO
  ======================================================= */

  const loadNotificationSound =
    useCallback(async () => {
      if (
        typeof window === "undefined"
      ) {
        return false;
      }

      if (
        notificationBufferRef.current
      ) {
        return true;
      }

      if (audioLoadingRef.current) {
        return false;
      }

      audioLoadingRef.current = true;

      try {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioContextClass) {
          console.error(
            "WEB AUDIO API NOT SUPPORTED",
          );

          return false;
        }

        if (
          !audioContextRef.current
        ) {
          audioContextRef.current =
            new AudioContextClass();
        }

        const response =
          await fetch(
            "/sounds/notification.mp3",
            {
              cache: "force-cache",
            },
          );

        if (!response.ok) {
          throw new Error(
            `Audio HTTP ${response.status}`,
          );
        }

        const arrayBuffer =
          await response.arrayBuffer();

        const audioBuffer =
          await audioContextRef.current.decodeAudioData(
            arrayBuffer,
          );

        notificationBufferRef.current =
          audioBuffer;

        console.log(
          "ADMIN NOTIFICATION AUDIO LOADED",
          {
            duration:
              audioBuffer.duration,
          },
        );

        return true;
      } catch (error) {
        console.error(
          "ADMIN NOTIFICATION AUDIO LOAD ERROR:",
          error,
        );

        return false;
      } finally {
        audioLoadingRef.current =
          false;
      }
    }, []);

  /* =======================================================
     UNLOCK AUDIO
  ======================================================= */

  const unlockNotificationAudio =
    useCallback(async () => {
      if (
        typeof window === "undefined"
      ) {
        return false;
      }

      try {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioContextClass) {
          return false;
        }

        if (
          !audioContextRef.current
        ) {
          audioContextRef.current =
            new AudioContextClass();
        }

        const context =
          audioContextRef.current;

        if (
          context.state !== "running"
        ) {
          await context.resume();
        }

        const loaded =
          await loadNotificationSound();

        if (!loaded) {
          return false;
        }

        if (
          context.state === "running"
        ) {
          audioUnlockedRef.current =
            true;

          console.log(
            "ADMIN AUDIO UNLOCKED",
          );

          return true;
        }

        return false;
      } catch (error) {
        console.error(
          "ADMIN AUDIO UNLOCK ERROR:",
          error,
        );

        return false;
      }
    }, [
      loadNotificationSound,
    ]);

  /* =======================================================
     START LOOPING SOUND
  ======================================================= */

  const playNotificationSoundLoop =
    useCallback(async () => {
      try {
        const unlocked =
          audioUnlockedRef.current ||
          (await unlockNotificationAudio());

        if (!unlocked) {
          console.warn(
            "ADMIN AUDIO NOT UNLOCKED",
          );

          return;
        }

        const context =
          audioContextRef.current;

        const buffer =
          notificationBufferRef.current;

        if (!context || !buffer) {
          return;
        }

        if (
          context.state !== "running"
        ) {
          await context.resume();
        }

        /* Stop previous sound */

        try {
          audioSourceRef.current?.stop();
        } catch {}

        const source =
          context.createBufferSource();

        source.buffer = buffer;

        /*
         * IMPORTANT:
         * Sound keeps playing until
         * ACCEPT / REJECT.
         */

        source.loop = true;

        source.connect(
          context.destination,
        );

        source.start(0);

        audioSourceRef.current =
          source;

        console.log(
          "================================",
        );

        console.log(
          "ADMIN BOOKING SOUND STARTED",
        );

        console.log(
          "================================",
        );
      } catch (error) {
        console.error(
          "ADMIN SOUND PLAY ERROR:",
          error,
        );
      }
    }, [
      unlockNotificationAudio,
    ]);

  /* =======================================================
     STOP SOUND
  ======================================================= */

  const stopNotificationSound =
    useCallback(() => {
      try {
        if (
          audioSourceRef.current
        ) {
          audioSourceRef.current.stop();
        }
      } catch {}

      audioSourceRef.current =
        null;

      console.log(
        "ADMIN BOOKING SOUND STOPPED",
      );
    }, []);

  /* =======================================================
     FIRST USER INTERACTION
  ======================================================= */

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const handleInteraction =
      async () => {
        if (
          audioUnlockedRef.current
        ) {
          return;
        }

        await unlockNotificationAudio();
      };

    window.addEventListener(
      "pointerdown",
      handleInteraction,
    );

    window.addEventListener(
      "touchstart",
      handleInteraction,
    );

    window.addEventListener(
      "keydown",
      handleInteraction,
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handleInteraction,
      );

      window.removeEventListener(
        "touchstart",
        handleInteraction,
      );

      window.removeEventListener(
        "keydown",
        handleInteraction,
      );
    };
  }, [
    unlockNotificationAudio,
  ]);

  /* =======================================================
     SAVE FCM TOKEN
  ======================================================= */

  const saveToken = useCallback(
    async (token: string) => {
      try {
        const response =
          await fetch(
            "/api/admin/push-token",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                token,
              }),
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          console.error(
            "ADMIN FCM TOKEN SAVE FAILED:",
            result,
          );

          return;
        }

        console.log(
          "ADMIN FCM TOKEN SAVED:",
          result,
        );
      } catch (error) {
        console.error(
          "ADMIN FCM TOKEN API ERROR:",
          error,
        );
      }
    },
    [],
  );

  /* =======================================================
     REGISTER NOTIFICATION ACTIONS
  ======================================================= */

  const registerNotificationActions =
    useCallback(async () => {
      try {
        await LocalNotifications.registerActionTypes(
          {
            types: [
              {
                id:
                  ADMIN_BOOKING_ACTION_TYPE,

                actions: [
                  {
                    id: "accept",

                    title: "ACCEPT",

                    foreground: true,
                  },

                  {
                    id: "reject",

                    title: "REJECT",

                    destructive: true,

                    foreground: true,
                  },
                ],
              },
            ],
          },
        );

        console.log(
          "ADMIN NOTIFICATION ACTIONS REGISTERED",
        );
      } catch (error) {
        console.error(
          "ADMIN NOTIFICATION ACTION REGISTER ERROR:",
          error,
        );
      }
    }, []);

  /* =======================================================
     CREATE CHANNEL
  ======================================================= */

  const createNotificationChannel =
    useCallback(async () => {
      try {
        await LocalNotifications.createChannel(
          {
            id: ADMIN_CHANNEL_ID,

            name:
              ADMIN_CHANNEL_NAME,

            description:
              ADMIN_CHANNEL_DESCRIPTION,

            importance: 5,

            visibility: 1,

            sound: "booking",

            vibration: true,

            lights: true,
          },
        );

        console.log(
          "ADMIN CHANNEL CREATED:",
          ADMIN_CHANNEL_ID,
        );
      } catch (error) {
        console.error(
          "ADMIN CHANNEL CREATE ERROR:",
          error,
        );
      }
    }, []);

  /* =======================================================
     LOCAL PERMISSION
  ======================================================= */

  const requestLocalPermission =
    useCallback(async () => {
      try {
        const permission =
          await LocalNotifications.checkPermissions();

        console.log(
          "ADMIN LOCAL PERMISSION:",
          permission.display,
        );

        if (
          permission.display !==
          "granted"
        ) {
          const result =
            await LocalNotifications.requestPermissions();

          console.log(
            "ADMIN LOCAL PERMISSION RESULT:",
            result.display,
          );

          if (
            result.display !==
            "granted"
          ) {
            console.warn(
              "ADMIN LOCAL NOTIFICATION PERMISSION DENIED",
            );

            return false;
          }
        }

        return true;
      } catch (error) {
        console.error(
          "ADMIN LOCAL PERMISSION ERROR:",
          error,
        );

        return false;
      }
    }, []);

  /* =======================================================
     SHOW FOREGROUND NOTIFICATION
  ======================================================= */

  const showForegroundNotification =
    useCallback(
      async (
        notification: PushNotificationSchema,
      ) => {
        try {
          const data =
            notification.data || {};

          const type =
            typeof data.type === "string"
              ? data.type
              : "booking";

          const notificationId =
            typeof data.notification_id ===
            "string"
              ? data.notification_id
              : typeof data.booking_id ===
                  "string"
                ? data.booking_id
                : typeof data.order_id ===
                    "string"
                  ? data.order_id
                  : typeof data.worker_request_id ===
                      "string"
                    ? data.worker_request_id
                    : `${type}-${Date.now()}`;

          /* =================================================
             DUPLICATE
          ================================================= */

          if (
            lastNotificationRef.current ===
            notificationId
          ) {
            console.log(
              "ADMIN DUPLICATE PUSH IGNORED:",
              notificationId,
            );

            return;
          }

          lastNotificationRef.current =
            notificationId;

          /* =================================================
             USER NAME
          ================================================= */

          const userName =
            typeof data.user_name ===
            "string"
              ? data.user_name
              : typeof data.customer_name ===
                  "string"
                ? data.customer_name
                : typeof data.name ===
                    "string"
                  ? data.name
                  : "";

          /* =================================================
             SERVICE
          ================================================= */

          const serviceName =
            typeof data.service_name ===
            "string"
              ? data.service_name
              : typeof data.service ===
                  "string"
                ? data.service
                : "";

          /* =================================================
             TITLE
          ================================================= */

          const title =
            type === "booking" &&
            userName
              ? `New Booking • ${userName}`
              : typeof data.title ===
                    "string" &&
                  data.title.trim()
                ? data.title
                : notification.title ||
                  "Workkerz";

          /* =================================================
             BODY
          ================================================= */

          const body =
            type === "booking"
              ? serviceName
                ? `${serviceName} booking received`
                : typeof data.body ===
                      "string" &&
                    data.body.trim()
                  ? data.body
                  : notification.body ||
                    "New booking received."
              : typeof data.body ===
                    "string" &&
                  data.body.trim()
                ? data.body
                : notification.body ||
                  "You have a new notification.";

          const sound =
            getSoundForType(type);

          /* =================================================
             START LOOP SOUND
          ================================================= */

          if (
            type === "booking"
          ) {
            await playNotificationSoundLoop();
          }

          /* =================================================
             LOCAL ID
          ================================================= */

          const localId =
            Math.floor(
              Date.now() %
                2147483647,
            );

          /* =================================================
             LOCAL NOTIFICATION
          ================================================= */

          const localNotification:
            LocalNotificationSchema =
            {
              id: localId,

              title,

              body,

              smallIcon:
                DEFAULT_ICON,

              channelId:
                ADMIN_CHANNEL_ID,

              sound,

              actionTypeId:
                type === "booking"
                  ? ADMIN_BOOKING_ACTION_TYPE
                  : undefined,

              extra: {
                ...data,

                type,

                notification_id:
                  notificationId,

                title,

                body,

                user_name:
                  userName,

                service_name:
                  serviceName,

                booking_id:
                  typeof data.booking_id ===
                  "string"
                    ? data.booking_id
                    : "",

                order_id:
                  typeof data.order_id ===
                  "string"
                    ? data.order_id
                    : "",

                worker_request_id:
                  typeof data.worker_request_id ===
                  "string"
                    ? data.worker_request_id
                    : "",

                action_url:
                  typeof data.action_url ===
                  "string"
                    ? data.action_url
                    : `/admin?booking=${
                        typeof data.booking_id ===
                        "string"
                          ? data.booking_id
                          : ""
                      }`,
              },

              schedule: {
                at: new Date(
                  Date.now() + 100,
                ),
              },

              autoCancel: true,

              ongoing: false,

              silent: false,
            };

          console.log(
            "================================",
          );

          console.log(
            "ADMIN SHOWING NOTIFICATION",
          );

          console.log(
            localNotification,
          );

          console.log(
            "================================",
          );

          await LocalNotifications.schedule(
            {
              notifications: [
                localNotification,
              ],
            },
          );

          /* =================================================
             SEND TO CUSTOM ADMIN UI
          ================================================= */

          if (
            typeof window !==
            "undefined"
          ) {
            window.dispatchEvent(
              new CustomEvent(
                "workkerz:incoming-notification",
                {
                  detail: {
                    ...data,

                    type,

                    notification_id:
                      notificationId,

                    title,

                    body,

                    user_name:
                      userName,

                    service_name:
                      serviceName,

                    booking_id:
                      typeof data.booking_id ===
                      "string"
                        ? data.booking_id
                        : "",
                  },
                },
              ),
            );
          }

          console.log(
            "ADMIN FOREGROUND NOTIFICATION DISPLAYED",
          );
        } catch (error) {
          console.error(
            "ADMIN FOREGROUND NOTIFICATION ERROR:",
            error,
          );
        }
      },
      [
        playNotificationSoundLoop,
      ],
    );

  /* =======================================================
     SETUP PUSH
  ======================================================= */

  useEffect(() => {
    if (
      !Capacitor.isNativePlatform()
    ) {
      return;
    }

    if (setupStartedRef.current) {
      return;
    }

    setupStartedRef.current =
      true;

    let registrationListener:
      | {
          remove: () => Promise<void>;
        }
      | undefined;

    let registrationErrorListener:
      | {
          remove: () => Promise<void>;
        }
      | undefined;

    let pushReceivedListener:
      | {
          remove: () => Promise<void>;
        }
      | undefined;

    let pushActionListener:
      | {
          remove: () => Promise<void>;
        }
      | undefined;

    let localActionListener:
      | {
          remove: () => Promise<void>;
        }
      | undefined;

    const setupPush =
      async () => {
        try {
          /* ===============================================
             LOCAL PERMISSION
          =============================================== */

          const localPermission =
            await requestLocalPermission();

          if (
            !localPermission
          ) {
            console.warn(
              "ADMIN LOCAL NOTIFICATION PERMISSION NOT GRANTED",
            );
          }

          /* ===============================================
             ACTIONS
          =============================================== */

          await registerNotificationActions();

          /* ===============================================
             CHANNEL
          =============================================== */

          await createNotificationChannel();

          /* ===============================================
             FCM PERMISSION
          =============================================== */

          const pushPermission =
            await PushNotifications.checkPermissions();

          console.log(
            "ADMIN FCM PERMISSION:",
            pushPermission.receive,
          );

          if (
            pushPermission.receive !==
            "granted"
          ) {
            const result =
              await PushNotifications.requestPermissions();

            console.log(
              "ADMIN FCM PERMISSION RESULT:",
              result.receive,
            );

            if (
              result.receive !==
              "granted"
            ) {
              console.warn(
                "ADMIN FCM PUSH PERMISSION DENIED",
              );

              return;
            }
          }

          /* ===============================================
             FCM RECEIVED
          =============================================== */

          pushReceivedListener =
            await PushNotifications.addListener(
              "pushNotificationReceived",
              async (
                notification: PushNotificationSchema,
              ) => {
                console.log(
                  "================================",
                );

                console.log(
                  "ADMIN FCM PUSH RECEIVED",
                );

                console.log(
                  "TITLE:",
                  notification.title,
                );

                console.log(
                  "BODY:",
                  notification.body,
                );

                console.log(
                  "DATA:",
                  notification.data,
                );

                console.log(
                  "================================",
                );

                await showForegroundNotification(
                  notification,
                );
              },
            );

          /* ===============================================
             FCM ACTION
          =============================================== */

          pushActionListener =
            await PushNotifications.addListener(
              "pushNotificationActionPerformed",
              (
                result,
              ) => {
                console.log(
                  "ADMIN FCM ACTION:",
                  result,
                );

                const data =
                  result.notification
                    ?.data || {};

                const bookingId =
                  typeof data.booking_id ===
                  "string"
                    ? data.booking_id
                    : "";

                const actionUrl =
                  bookingId
                    ? `/admin?booking=${bookingId}`
                    : typeof data.action_url ===
                        "string"
                      ? data.action_url
                      : "";

                if (
                  actionUrl &&
                  typeof window !==
                    "undefined"
                ) {
                  window.location.href =
                    actionUrl;
                }
              },
            );

          /* ===============================================
             LOCAL ACTION
          =============================================== */

          localActionListener =
            await LocalNotifications.addListener(
              "localNotificationActionPerformed",
              async (
                result: ActionPerformed,
              ) => {
                console.log(
                  "================================",
                );

                console.log(
                  "ADMIN LOCAL ACTION",
                );

                console.log(
                  "ACTION:",
                  result.actionId,
                );

                console.log(
                  "NOTIFICATION:",
                  result.notification,
                );

                console.log(
                  "================================",
                );

                const extra =
                  result.notification
                    ?.extra || {};

                const bookingId =
                  typeof extra.booking_id ===
                  "string"
                    ? extra.booking_id
                    : "";

                const actionId =
                  result.actionId;

                /* =========================================
                   STOP SOUND FIRST
                ========================================= */

                stopNotificationSound();

                /* =========================================
                   ACCEPT
                ========================================= */

                if (
                  actionId === "accept"
                ) {
                  console.log(
                    "ADMIN ACCEPT:",
                    bookingId,
                  );

                  if (
                    bookingId
                  ) {
                    try {
                      await fetch(
                        "/api/admin/bookings/action",
                        {
                          method: "POST",

                          headers: {
                            "Content-Type":
                              "application/json",
                          },

                          body: JSON.stringify(
                            {
                              booking_id:
                                bookingId,

                              action:
                                "accept",

                              notification_id:
                                typeof extra.notification_id ===
                                "string"
                                  ? extra.notification_id
                                  : "",
                            },
                          ),
                        },
                      );
                    } catch (error) {
                      console.error(
                        "ACCEPT ERROR:",
                        error,
                      );
                    }

                    try {
                      await LocalNotifications.cancel(
                        {
                          notifications: [
                            {
                              id:
                                result
                                  .notification
                                  .id,
                            },
                          ],
                        },
                      );
                    } catch {}

                    window.location.href =
                      `/admin?booking=${bookingId}`;
                  }

                  return;
                }

                /* =========================================
                   REJECT
                ========================================= */

                if (
                  actionId === "reject"
                ) {
                  console.log(
                    "ADMIN REJECT:",
                    bookingId,
                  );

                  if (
                    bookingId
                  ) {
                    try {
                      await fetch(
                        "/api/admin/bookings/action",
                        {
                          method: "POST",

                          headers: {
                            "Content-Type":
                              "application/json",
                          },

                          body: JSON.stringify(
                            {
                              booking_id:
                                bookingId,

                              action:
                                "reject",

                              notification_id:
                                typeof extra.notification_id ===
                                "string"
                                  ? extra.notification_id
                                  : "",
                            },
                          ),
                        },
                      );
                    } catch (error) {
                      console.error(
                        "REJECT ERROR:",
                        error,
                      );
                    }

                    try {
                      await LocalNotifications.cancel(
                        {
                          notifications: [
                            {
                              id:
                                result
                                  .notification
                                  .id,
                            },
                          ],
                        },
                      );
                    } catch {}

                    window.location.href =
                      `/admin?booking=${bookingId}`;
                  }

                  return;
                }

                /* =========================================
                   NORMAL TAP
                ========================================= */

                if (
                  bookingId
                ) {
                  window.location.href =
                    `/admin?booking=${bookingId}`;

                  return;
                }

                const actionUrl =
                  typeof extra.action_url ===
                  "string"
                    ? extra.action_url
                    : "";

                if (
                  actionUrl
                ) {
                  window.location.href =
                    actionUrl;
                }
              },
            );

          /* ===============================================
             REGISTRATION
          =============================================== */

          registrationListener =
            await PushNotifications.addListener(
              "registration",
              async (
                token: Token,
              ) => {
                console.log(
                  "ADMIN FCM TOKEN:",
                  token.value,
                );

                await saveToken(
                  token.value,
                );
              },
            );

          /* ===============================================
             REGISTRATION ERROR
          =============================================== */

          registrationErrorListener =
            await PushNotifications.addListener(
              "registrationError",
              (
                error,
              ) => {
                console.error(
                  "ADMIN FCM REGISTRATION ERROR:",
                  error,
                );
              },
            );

          /* ===============================================
             REGISTER
          =============================================== */

          await PushNotifications.register();

          console.log(
            "ADMIN FCM REGISTRATION REQUESTED",
          );
        } catch (error) {
          console.error(
            "ADMIN PUSH SETUP ERROR:",
            error,
          );
        }
      };

    setupPush();

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      registrationListener
        ?.remove()
        .catch(() => {});

      registrationErrorListener
        ?.remove()
        .catch(() => {});

      pushReceivedListener
        ?.remove()
        .catch(() => {});

      pushActionListener
        ?.remove()
        .catch(() => {});

      localActionListener
        ?.remove()
        .catch(() => {});

      stopNotificationSound();
    };
  }, [
    createNotificationChannel,
    registerNotificationActions,
    requestLocalPermission,
    saveToken,
    showForegroundNotification,
    stopNotificationSound,
  ]);

  return null;
}