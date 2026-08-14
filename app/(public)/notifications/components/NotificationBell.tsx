"use client";

import {
  Bell,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

type Props = {
  unreadCount: number;
  onClick?: () => void;
};

export default function NotificationBell({
  unreadCount,
  onClick,
}: Props) {
  /* =====================================================
     REALTIME NOTIFICATION LISTENER
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    /*
     * IMPORTANT:
     *
     * .on() MUST come before .subscribe()
     *
     * Wrong:
     *
     * channel.subscribe();
     * channel.on(...);
     *
     * Correct:
     *
     * channel.on(...);
     * channel.subscribe();
     */

    const channel = supabase
      .channel(
        "workkerz-user-notifications-bell"
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async () => {
          if (!mounted) {
            return;
          }

          /*
           * Notification page already handles
           * fetching the complete notification list.
           *
           * Dispatch an event so other user-side
           * notification components can refresh.
           */

          window.dispatchEvent(
            new CustomEvent(
              "workkerz-notification-created"
            )
          );
        }
      )
      .subscribe(
        (status) => {
          if (
            status ===
            "SUBSCRIBED"
          ) {
            console.log(
              "[NotificationBell] Realtime connected"
            );
          }

          if (
            status ===
            "CHANNEL_ERROR"
          ) {
            console.warn(
              "[NotificationBell] Realtime channel error"
            );
          }

          if (
            status ===
            "TIMED_OUT"
          ) {
            console.warn(
              "[NotificationBell] Realtime connection timed out"
            );
          }
        }
      );

    return () => {
      mounted = false;

      /*
       * Properly remove the channel
       * when component unmounts.
       */

      void supabase.removeChannel(
        channel
      );
    };
  }, []);

  /* =====================================================
     BELL
  ===================================================== */

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Notifications"
      className="
        relative
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        text-gray-700
        transition
        hover:bg-gray-100
        active:scale-95
      "
    >
      <Bell
        size={20}
        strokeWidth={2}
      />

      {unreadCount > 0 && (
        <span
          className="
            absolute
            right-[5px]
            top-[4px]
            flex
            h-[17px]
            min-w-[17px]
            items-center
            justify-center
            rounded-full
            bg-green-600
            px-1
            text-[8px]
            font-black
            leading-none
            text-white
            ring-2
            ring-white
          "
        >
          {unreadCount > 99
            ? "99+"
            : unreadCount}
        </span>
      )}
    </button>
  );
}