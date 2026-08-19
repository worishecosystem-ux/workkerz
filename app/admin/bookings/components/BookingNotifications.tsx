"use client";

import {
  BellRing,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import type { BookingNotification } from "../types/booking";

type Props = {
  notifications: BookingNotification[];

  onSelect: (
    notification: BookingNotification
  ) => void;

  onClear: () => void;
};

/* =========================================================
   NOTIFICATION SOUND
   FILE:
   public/sounds/notification.mp3
========================================================= */

const NOTIFICATION_SOUND =
  "/sounds/notification.mp3";

/* =========================================================
   AUDIO REFS
========================================================= */

let notificationAudio:
  | HTMLAudioElement
  | null = null;

let audioUnlocked = false;

/* =========================================================
   GET AUDIO
========================================================= */

function getNotificationAudio() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!notificationAudio) {
    notificationAudio = new Audio(
      NOTIFICATION_SOUND
    );

    notificationAudio.preload = "auto";
    notificationAudio.volume = 1;
  }

  return notificationAudio;
}

/* =========================================================
   PRELOAD AUDIO
========================================================= */

function preloadNotificationSound() {
  try {
    const audio =
      getNotificationAudio();

    if (!audio) {
      return;
    }

    audio.load();
  } catch (error) {
    console.warn(
      "Notification audio preload failed:",
      error
    );
  }
}

/* =========================================================
   UNLOCK AUDIO
========================================================= */

function unlockNotificationAudio() {
  try {
    const audio =
      getNotificationAudio();

    if (!audio) {
      return;
    }

    /*
     * Browser autoplay unlock.
     *
     * We briefly play and immediately pause
     * after a real user interaction.
     */

    audio.volume = 0;

    const promise = audio.play();

    if (promise) {
      promise
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;

          audioUnlocked = true;

          console.log(
            "NOTIFICATION AUDIO UNLOCKED"
          );
        })
        .catch(() => {
          audio.volume = 1;
        });
    }
  } catch (error) {
    console.warn(
      "Notification audio unlock failed:",
      error
    );
  }
}

/* =========================================================
   PLAY NOTIFICATION SOUND
========================================================= */

function playNotificationSound() {
  try {
    const audio =
      getNotificationAudio();

    if (!audio) {
      console.warn(
        "Notification audio not available"
      );

      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;

    const promise = audio.play();

    if (promise !== undefined) {
      promise
        .then(() => {
          console.log(
            "NOTIFICATION SOUND PLAYED"
          );
        })
        .catch((error) => {
          console.warn(
            "Notification sound blocked:",
            error
          );

          /*
           * If browser has not unlocked audio yet,
           * remember this state.
           */
          audioUnlocked = false;
        });
    }
  } catch (error) {
    console.warn(
      "Notification sound unavailable:",
      error
    );
  }
}

/* =========================================================
   MESSAGE HELPERS
========================================================= */

function getCustomer(
  message: string
) {
  const parts =
    message.split(" • ");

  return (
    parts[0] ||
    "Customer"
  );
}

function getService(
  message: string
) {
  const parts =
    message.split(" • ");

  return (
    parts[1] ||
    "Worker service"
  );
}

function getBookingId(
  message: string
) {
  const parts =
    message.split(" • ");

  return parts[2] || "";
}

/* =========================================================
   FLOATING NOTIFICATION
========================================================= */

function FloatingNotification({
  notification,
  onSelect,
  onClose,
}: {
  notification: BookingNotification;

  onSelect: () => void;

  onClose: () => void;
}) {
  /*
   * IMPORTANT:
   * Hooks MUST be called before any conditional return.
   */

  const handleClose =
    useCallback(() => {
      onClose();
    }, [onClose]);

  /*
   * AUTO CLOSE
   */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        handleClose();
      }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [handleClose]);

  /*
   * This component should only receive NEW
   * notifications, but keep this guard as
   * an additional safety check.
   */

  if (
    notification.type !== "new"
  ) {
    return null;
  }

  const customer =
    getCustomer(
      notification.message
    );

  const service =
    getService(
      notification.message
    );

  const bookingId =
    getBookingId(
      notification.message
    );

  return (
    <div
      className="
        pointer-events-auto
        relative
        w-[calc(100vw-24px)]
        max-w-[390px]
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-[0_18px_60px_rgba(15,23,42,0.22)]
        animate-in
        slide-in-from-right-8
        fade-in
        duration-300
      "
    >
      {/* =====================================================
          LEFT ACCENT
      ===================================================== */}

      <div
        className="
          absolute
          left-0
          top-0
          h-full
          w-1
          bg-orange-500
        "
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">

          {/* =================================================
              ICON
          ================================================= */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-orange-50
              text-orange-600
            "
          >
            <BellRing
              className="h-5 w-5"
              strokeWidth={2.3}
            />
          </div>

          {/* =================================================
              MAIN
          ================================================= */}

          <button
            type="button"
            onClick={onSelect}
            className="
              min-w-0
              flex-1
              text-left
              outline-none
            "
          >

            {/* BADGE */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-2
              "
            >
              <span
                className="
                  rounded-full
                  bg-orange-50
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  tracking-wide
                  text-orange-700
                "
              >
                NEW BOOKING
              </span>

              <span
                className="
                  text-[9px]
                  font-bold
                  text-slate-400
                "
              >
                Now
              </span>
            </div>

            {/* TITLE */}

            <p
              className="
                mt-2
                text-[13px]
                font-black
                text-slate-950
              "
            >
              {notification.title}
            </p>

            {/* CUSTOMER */}

            <div
              className="
                mt-2
                flex
                min-w-0
                items-center
                gap-1.5
              "
            >
              <UserRound
                className="
                  h-3
                  w-3
                  shrink-0
                  text-slate-400
                "
              />

              <span
                className="
                  truncate
                  text-[10px]
                  font-bold
                  text-slate-600
                "
              >
                {customer}
              </span>
            </div>

            {/* SERVICE */}

            <div
              className="
                mt-1
                flex
                min-w-0
                items-center
                gap-1.5
              "
            >
              <Wrench
                className="
                  h-3
                  w-3
                  shrink-0
                  text-slate-400
                "
              />

              <span
                className="
                  truncate
                  text-[10px]
                  text-slate-500
                "
              >
                {service}
              </span>
            </div>

            {/* BOOKING ID */}

            {bookingId && (
              <div className="mt-2">
                <span
                  className="
                    text-[9px]
                    font-bold
                    text-slate-400
                  "
                >
                  {bookingId}
                </span>
              </div>
            )}

            {/* CTA */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-[9px]
                  font-black
                  text-orange-600
                "
              >
                Tap to view booking
              </span>

              <span
                className="
                  text-[9px]
                  font-bold
                  text-slate-300
                "
              >
                →
              </span>
            </div>
          </button>

          {/* =================================================
              CLOSE
          ================================================= */}

          <button
            type="button"
            onClick={handleClose}
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <div className="h-[3px] bg-slate-100">
        <div
          className="
            h-full
            w-full
            origin-left
            bg-orange-500
            animate-[notification-progress_6s_linear_forwards]
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function BookingNotifications({
  notifications,
  onSelect,
  onClear,
}: Props) {
  /*
   * Prevent sound during initial page load.
   */

  const initialized =
    useRef(false);

  /*
   * Notification IDs that already
   * played sound.
   */

  const playedNotificationIds =
    useRef<Set<string>>(
      new Set()
    );

  /*
   * =======================================================
   * AUDIO UNLOCK
   * =======================================================
   *
   * Browser requires user interaction before
   * allowing audio in many cases.
   */

  useEffect(() => {
    preloadNotificationSound();

    const unlock = () => {
      if (!audioUnlocked) {
        unlockNotificationAudio();
      }
    };

    window.addEventListener(
      "pointerdown",
      unlock,
      {
        passive: true,
        once: true,
      }
    );

    window.addEventListener(
      "touchstart",
      unlock,
      {
        passive: true,
        once: true,
      }
    );

    window.addEventListener(
      "keydown",
      unlock,
      {
        once: true,
      }
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        unlock
      );

      window.removeEventListener(
        "touchstart",
        unlock
      );

      window.removeEventListener(
        "keydown",
        unlock
      );
    };
  }, []);

  /* =======================================================
     ONLY NEW ORDERS
  ======================================================= */

  const newOrderNotifications =
    notifications.filter(
      (notification) =>
        notification.type ===
        "new"
    );

  /* =======================================================
     DETECT NEW ORDER
  ======================================================= */

  useEffect(() => {
    /*
     * No new booking.
     */

    if (
      newOrderNotifications.length ===
      0
    ) {
      return;
    }

    /*
     * INITIAL PAGE LOAD
     *
     * Existing notifications should NOT
     * trigger sound.
     */

    if (!initialized.current) {
      initialized.current = true;

      newOrderNotifications.forEach(
        (notification) => {
          playedNotificationIds.current.add(
            notification.id
          );
        }
      );

      return;
    }

    /*
     * Find only notifications that
     * have not played yet.
     */

    const freshOrders =
      newOrderNotifications.filter(
        (notification) =>
          !playedNotificationIds.current.has(
            notification.id
          )
      );

    if (
      freshOrders.length ===
      0
    ) {
      return;
    }

    /*
     * Mark as played BEFORE playing
     * so React re-render doesn't
     * trigger duplicate sound.
     */

    freshOrders.forEach(
      (notification) => {
        playedNotificationIds.current.add(
          notification.id
        );
      }
    );

    /*
     * PLAY SOUND.
     *
     * Only NEW booking.
     */

    playNotificationSound();

    console.log(
      "NEW BOOKING SOUND:",
      freshOrders.map(
        (item) =>
          item.bookingId
      )
    );
  }, [
    newOrderNotifications,
  ]);

  /* =======================================================
     UNREAD NEW ORDERS
  ======================================================= */

  const unreadNewOrders =
    newOrderNotifications.filter(
      (notification) =>
        !notification.read
    );

  /* =======================================================
     CLOSE FLOATING NOTIFICATION
  ======================================================= */

  function closeFloatingNotification() {
    /*
     * Existing parent API has only onClear(),
     * so use it here.
     */

    if (
      unreadNewOrders.length ===
      0
    ) {
      return;
    }

    onClear();
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          NEW ORDER FLOATING NOTIFICATION

          ONLY NEW BOOKING
      =================================================== */}

      {unreadNewOrders.length >
        0 && (
        <div
          className="
            pointer-events-none
            fixed
            right-3
            top-3
            z-[10000]
            flex
            flex-col
            gap-3
            sm:right-5
            sm:top-5
          "
        >
          {unreadNewOrders
            .slice(0, 1)
            .map(
              (
                notification
              ) => (
                <FloatingNotification
                  key={
                    notification.id
                  }
                  notification={
                    notification
                  }
                  onSelect={() =>
                    onSelect(
                      notification
                    )
                  }
                  onClose={
                    closeFloatingNotification
                  }
                />
              )
            )}
        </div>
      )}
    </>
  );
}