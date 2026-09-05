"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Search,
  Calendar,
  Bell,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

/* =====================================================
   TYPES
===================================================== */

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    avatar_url?: string | null;
    picture?: string | null;
    full_name?: string | null;
    name?: string | null;
    display_name?: string | null;
  };
};

type NotificationRow = {
  id: string;
  user_id: string | null;
  is_global: boolean;
  is_read: boolean;
};
  
/* =====================================================
   COMPONENT
===================================================== */

export default function MobileAppNavbar() {
  const pathname = usePathname();

  /* ===================================================
     STATE
  =================================================== */

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [keyboardOpen, setKeyboardOpen] =
    useState(false);

  const [isNative, setIsNative] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  /* ===================================================
     NATIVE PLATFORM
  =================================================== */

  useEffect(() => {
    setIsNative(
      Capacitor.isNativePlatform()
    );
  }, []);

  /* ===================================================
     AUTH USER
  =================================================== */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            "Mobile navbar user error:",
            error
          );

          return;
        }

        if (!mounted) {
          return;
        }

        setUser(
          data.user as AuthUser | null
        );
      } catch (error) {
        console.error(
          "Mobile navbar user error:",
          error
        );
      }
    };

    void loadUser();

    const {
      data: authData,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) {
            return;
          }

          setUser(
            session?.user
              ? (session.user as AuthUser)
              : null
          );
        }
      );

    return () => {
      mounted = false;
      authData.subscription.unsubscribe();
    };
  }, []);

  /* ===================================================
     UNREAD NOTIFICATIONS
  =================================================== */

  const loadUnreadCount =
    useCallback(async () => {
      try {
        /*
         * No logged-in user
         */

        if (!user?.id) {
          setUnreadCount(0);
          return;
        }

        /*
         * Get user-specific + global notifications.
         */

        const {
          data,
          error,
        } = await supabase
          .from("notifications")
          .select(
            "id,user_id,is_global,is_read"
          )
          .or(
            `user_id.eq.${user.id},is_global.eq.true`
          )
          .eq("is_read", false);

        if (error) {
          console.error(
            "Unread notification count error:",
            error
          );

          return;
        }

        setUnreadCount(
          Array.isArray(data)
            ? data.length
            : 0
        );
      } catch (error) {
        console.error(
          "Unread notification count error:",
          error
        );
      }
    }, [user?.id]);

  /* ===================================================
     LOAD UNREAD COUNT
  =================================================== */

  useEffect(() => {
    void loadUnreadCount();
  }, [loadUnreadCount]);

  /* ===================================================
     NOTIFICATION REALTIME
     
     IMPORTANT:
     .on() MUST COME BEFORE .subscribe()
  =================================================== */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let active = true;

    const channelName =
      `workkerz-mobile-navbar-${user.id}`;

    const channel =
      supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
          },
          () => {
            if (!active) {
              return;
            }

            void loadUnreadCount();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
          },
          () => {
            if (!active) {
              return;
            }

            void loadUnreadCount();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notifications",
          },
          () => {
            if (!active) {
              return;
            }

            void loadUnreadCount();
          }
        )
        .subscribe((status) => {
          if (
            status === "CHANNEL_ERROR"
          ) {
            console.error(
              "Notification realtime channel error."
            );
          }
        });

    return () => {
      active = false;

      void supabase.removeChannel(
        channel
      );
    };
  }, [
    user?.id,
    loadUnreadCount,
  ]);

  /* ===================================================
     KEYBOARD
  =================================================== */

  useEffect(() => {
    if (
      !Capacitor.isNativePlatform()
    ) {
      return;
    }

    let showListener:
      | { remove: () => void }
      | undefined;

    let hideListener:
      | { remove: () => void }
      | undefined;

    const setupKeyboard =
      async () => {
        try {
          showListener =
            await Keyboard.addListener(
              "keyboardDidShow",
              () => {
                setKeyboardOpen(true);
              }
            );

          hideListener =
            await Keyboard.addListener(
              "keyboardDidHide",
              () => {
                setKeyboardOpen(false);
              }
            );
        } catch (error) {
          console.error(
            "Keyboard listener error:",
            error
          );
        }
      };

    void setupKeyboard();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  /* ===================================================
     USER DATA
  =================================================== */

  const avatar =
    user?.user_metadata
      ?.avatar_url ||
    user?.user_metadata
      ?.picture ||
    null;

  const displayName =
    user?.user_metadata
      ?.full_name ||
    user?.user_metadata
      ?.name ||
    user?.user_metadata
      ?.display_name ||
    user?.email
      ?.split("@")[0] ||
    "Profile";

  /* ===================================================
     ROUTE ACTIVE
  =================================================== */

  const isRouteActive = (
    href: string
  ) => {
    const cleanHref =
      href.split("?")[0];

    if (cleanHref === "/") {
      return pathname === "/";
    }

    return (
      pathname === cleanHref ||
      pathname.startsWith(
        `${cleanHref}/`
      )
    );
  };

  const isNotificationsActive =
    pathname ===
      "/notifications" ||
    pathname.startsWith(
      "/notifications/"
    );

  const isProfileActive =
    pathname === "/dashboard" ||
    pathname.startsWith(
      "/dashboard/"
    );

  /* ===================================================
     HIDE WHEN KEYBOARD OPEN
  =================================================== */

  if (keyboardOpen) {
    return null;
  }

  /* ===================================================
     NAVIGATION
  =================================================== */

  const navigationItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Browse",
      href: "/browse",
      icon: Search,
    },
    {
      label: "Track",
      href:
        "/bookings?tab=bookings",
      icon: Calendar,
    },
  ];

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <>
      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

      <nav
        aria-label="Main navigation"
        className={`
          fixed
          bottom-0
          left-0
          right-0
          z-[9999]
          w-full
          border-t
          border-gray-200
          bg-white
          shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
          ${
            isNative
              ? "native-app-navbar"
              : ""
          }
        `}
        style={{
          paddingBottom:
            "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className="
            flex
            h-[68px]
            w-full
            items-stretch

            sm:h-[72px]

            md:h-[76px]
          "
        >

          {/* =================================================
              HOME / BROWSE / TRACK
          ================================================= */}

          {navigationItems.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isRouteActive(
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`
                    relative
                    flex
                    h-full
                    min-w-0
                    flex-1
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    px-1
                    transition-all
                    duration-150
                    active:scale-95

                    sm:gap-1.5

                    ${
                      active
                        ? "text-[#FF5C39]"
                        : "text-gray-500"
                    }
                  `}
                >
                  {active && (
                    <span
                      className="
                        absolute
                        left-1/2
                        top-0
                        h-[3px]
                        w-8
                        -translate-x-1/2
                        rounded-b-full
                        bg-[#FF5C39]

                        sm:w-10

                        md:w-12
                      "
                    />
                  )}

                  <Icon
                    aria-hidden="true"
                    className={`
                      h-[22px]
                      w-[22px]

                      sm:h-[24px]
                      sm:w-[24px]

                      md:h-[26px]
                      md:w-[26px]

                      ${
                        active
                          ? "stroke-[2.4]"
                          : "stroke-[1.8]"
                      }
                    `}
                  />

                  <span
                    className={`
                      max-w-[90%]
                      truncate
                      text-[10px]
                      font-semibold
                      leading-none

                      sm:text-[11px]

                      md:text-[12px]

                      ${
                        active
                          ? "text-[#FF5C39]"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <Link
            href="/notifications"
            aria-current={
              isNotificationsActive
                ? "page"
                : undefined
            }
            className={`
              relative
              flex
              h-full
              min-w-0
              flex-1
              flex-col
              items-center
              justify-center
              gap-1
              px-1
              transition-all
              duration-150
              active:scale-95

              sm:gap-1.5

              ${
                isNotificationsActive
                  ? "text-[#FF5C39]"
                  : "text-gray-500"
              }
            `}
          >
            {/* ACTIVE INDICATOR */}

            {isNotificationsActive && (
              <span
                className="
                  absolute
                  left-1/2
                  top-0
                  h-[3px]
                  w-8
                  -translate-x-1/2
                  rounded-b-full
                  bg-[#FF5C39]

                  sm:w-10

                  md:w-12
                "
              />
            )}

            {/* ICON */}

            <div
              className="
                relative
                flex
                h-[24px]
                w-[24px]
                items-center
                justify-center

                sm:h-[26px]
                sm:w-[26px]

                md:h-[28px]
                md:w-[28px]
              "
            >
              <Bell
                aria-hidden="true"
                className={`
                  h-[21px]
                  w-[21px]

                  sm:h-[23px]
                  sm:w-[23px]

                  md:h-[25px]
                  md:w-[25px]

                  ${
                    isNotificationsActive
                      ? "stroke-[2.4]"
                      : "stroke-[1.8]"
                  }
                `}
              />

              {/* UNREAD BADGE */}

              {unreadCount >
                0 && (
                <span
                  className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    h-[16px]
                    min-w-[16px]
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-white
                    bg-red-500
                    px-1
                    text-[8px]
                    font-black
                    leading-none
                    text-white
                  "
                >
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </div>

            {/* LABEL */}

            <span
              className={`
                max-w-[90%]
                truncate
                text-[10px]
                font-semibold
                leading-none

                sm:text-[11px]

                md:text-[12px]

                ${
                  isNotificationsActive
                    ? "text-[#FF5C39]"
                    : "text-gray-500"
                }
              `}
            >
              Notifications
            </span>
          </Link>

          {/* =================================================
              PROFILE
          ================================================= */}

          <Link
            href="/dashboard"
            aria-current={
              isProfileActive
                ? "page"
                : undefined
            }
            className={`
              relative
              flex
              h-full
              min-w-0
              flex-1
              flex-col
              items-center
              justify-center
              gap-1
              px-1
              transition-all
              duration-150
              active:scale-95

              sm:gap-1.5

              ${
                isProfileActive
                  ? "text-[#FF5C39]"
                  : "text-gray-500"
              }
            `}
          >
            {/* ACTIVE INDICATOR */}

            {isProfileActive && (
              <span
                className="
                  absolute
                  left-1/2
                  top-0
                  h-[3px]
                  w-8
                  -translate-x-1/2
                  rounded-b-full
                  bg-[#FF5C39]

                  sm:w-10

                  md:w-12
                "
              />
            )}

            {/* PROFILE */}

            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className={`
                  h-7
                  w-7
                  rounded-full
                  border-2
                  object-cover

                  sm:h-8
                  sm:w-8

                  md:h-9
                  md:w-9

                  ${
                    isProfileActive
                      ? "border-[#FF5C39] shadow-sm"
                      : "border-gray-300"
                  }
                `}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className={`
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  bg-orange-100
                  text-xs
                  font-bold
                  text-orange-600

                  sm:h-8
                  sm:w-8

                  md:h-9
                  md:w-9

                  ${
                    isProfileActive
                      ? "border-[#FF5C39]"
                      : "border-gray-300"
                  }
                `}
              >
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            {/* LABEL */}

            <span
              className={`
                max-w-[90%]
                truncate
                text-[10px]
                font-semibold
                leading-none

                sm:text-[11px]

                md:text-[12px]

                ${
                  isProfileActive
                    ? "text-[#FF5C39]"
                    : "text-gray-500"
                }
              `}
            >
              Profile
            </span>
          </Link>
        </div>
      </nav>

      {/* =================================================
          CONTENT SPACER
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          h-[76px]
          w-full

          sm:h-[80px]

          md:h-[84px]
        "
      />
    </>
  );
}