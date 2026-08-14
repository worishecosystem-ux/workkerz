"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Inbox,
  LogIn,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

import NotificationCard from "./components/NotificationCard";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  image_url: string | null;
  customer_email: string | null;
  is_global: boolean;
  is_read: boolean;
  created_at: string;
  user_id: string | null;
  body: string | null;
  icon: string | null;
  action_url: string | null;
  booking_id: string | null;
};

const tabs = [
  { label: "All", value: "all" },
  { label: "Bookings", value: "booking" },
  { label: "Work", value: "work" },
  { label: "Payments", value: "payment" },
  { label: "Offers", value: "offer" },
  { label: "System", value: "system" },
];

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  // =====================================================
  // NATIVE
  // =====================================================

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user ?? null;

        if (!user) {
          setLoggedIn(false);
          setNotifications([]);
          return;
        }

        setLoggedIn(true);

        const {
          data,
          error: notificationError,
        } = await supabase
          .from("notifications")
          .select(`
            id,
            title,
            message,
            type,
            image_url,
            customer_email,
            is_global,
            is_read,
            created_at,
            user_id,
            body,
            icon,
            action_url,
            booking_id
          `)
          .or(
            `user_id.eq.${user.id},is_global.eq.true`
          )
          .order("created_at", {
            ascending: false,
          });

        if (notificationError) {
          console.error(
            "Notifications query error:",
            notificationError
          );

          setError(
            "Unable to load notifications."
          );

          return;
        }

        setNotifications(
          (data || []) as Notification[]
        );
      } catch (err) {
        console.error(
          "Notifications loading error:",
          err
        );

        setError(
          "Unable to load notifications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // =====================================================
  // AUTH STATE
  // =====================================================

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setLoggedIn(true);
          loadNotifications(false);
        } else {
          setLoggedIn(false);
          setNotifications([]);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadNotifications]);

  // =====================================================
  // REALTIME
  // =====================================================

  useEffect(() => {
    const channel = supabase
      .channel(
        "workkerz-user-notifications-page"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadNotifications(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  // =====================================================
  // ANDROID BACK
  // =====================================================

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listener:
      | {
          remove: () => void;
        }
      | undefined;

    const setupBackButton = async () => {
      listener = await App.addListener(
        "backButton",
        () => {
          router.back();
        }
      );
    };

    setupBackButton();

    return () => {
      listener?.remove();
    };
  }, [router]);

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;
  }, [notifications]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.type === activeTab
    );
  }, [notifications, activeTab]);

  // =====================================================
  // MARK SINGLE READ
  // =====================================================

  const markAsRead = async (
    notification: Notification
  ) => {
    if (notification.is_read) {
      if (notification.action_url) {
        router.push(
          notification.action_url
        );
      }

      return;
    }

    const {
      error: updateError,
    } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notification.id);

    if (updateError) {
      console.error(
        "Mark notification read error:",
        updateError
      );

      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              is_read: true,
            }
          : item
      )
    );

    if (notification.action_url) {
      router.push(
        notification.action_url
      );
    }
  };

  // =====================================================
  // MARK ALL READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user ?? null;

      if (!user) {
        setLoggedIn(false);
        return;
      }

      const unreadIds = notifications
        .filter(
          (notification) =>
            !notification.is_read &&
            notification.user_id === user.id
        )
        .map(
          (notification) =>
            notification.id
        );

      if (!unreadIds.length) {
        return;
      }

      const {
        error: updateError,
      } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .in("id", unreadIds);

      if (updateError) {
        console.error(
          "Mark all read error:",
          updateError
        );

        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          unreadIds.includes(
            notification.id
          )
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Mark all read error:",
        err
      );
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    router.back();
  };

  // =====================================================
  // AUTH LOADING
  // =====================================================

  if (loggedIn === null && loading) {
    return (
      <main
        className="
          min-h-screen
          bg-[#f7f8f7]
        "
        style={{
          paddingTop: isNative
            ? "env(safe-area-inset-top)"
            : "0px",
        }}
      >
        <div className="animate-pulse">
          <div className="h-[58px] border-b border-gray-100 bg-white" />

          <div className="h-[48px] border-b border-gray-100 bg-white" />

          <div className="bg-white">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="
                    flex
                    gap-3
                    border-b
                    border-gray-100
                    px-3
                    py-4
                    sm:px-5
                  "
                >
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-200 sm:h-14 sm:w-14" />

                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="h-3 w-full rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // LOGIN
  // =====================================================

  if (!loading && loggedIn === false) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#f7f8f7]
          px-5
        "
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
          paddingBottom:
            "env(safe-area-inset-bottom)",
        }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-3xl
              bg-green-50
            "
          >
            <Bell
              size={34}
              className="text-green-600"
            />
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-950">
            Notifications
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Please login to view your
            Workkerz notifications.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/login")
            }
            className="
              mt-6
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-green-600
              px-6
              py-3
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-green-600/20
              active:scale-95
            "
          >
            <LogIn size={17} />
            Login
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <main
      className="
        min-h-screen
        bg-[#f7f8f7]
        pt-[106px]

        sm:pt-[110px]

        md:pt-[116px]
      "
      style={{
        paddingBottom:
          "max(76px, calc(76px + env(safe-area-inset-bottom)))",
      }}
    >
      {/* =================================================
          FIXED HEADER
      ================================================== */}

      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-[100]
          border-b
          border-gray-100
          bg-white
        "
        style={{
          paddingTop: isNative
            ? "env(safe-area-inset-top)"
            : "0px",
        }}
      >
        <div
          className="
            mx-auto
            flex
            h-[58px]
            w-full
            max-w-5xl
            items-center
            justify-between
            px-3

            sm:h-[62px]
            sm:px-5

            md:h-[68px]
            md:px-6
          "
        >
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                text-gray-800
                active:bg-gray-100
                active:scale-95

                md:h-10
                md:w-10
              "
            >
              <ArrowLeft
                size={20}
                strokeWidth={2.2}
              />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="
                    truncate
                    text-[17px]
                    font-bold
                    tracking-tight
                    text-gray-950

                    sm:text-[18px]

                    md:text-[19px]
                  "
                >
                  Notifications
                </h1>

                {unreadCount > 0 && (
                  <span
                    className="
                      flex
                      h-5
                      min-w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-green-600
                      px-1.5
                      text-[9px]
                      font-bold
                      text-white
                    "
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </div>

              <p
                className="
                  hidden
                  text-[10px]
                  text-gray-400
                  sm:block
                "
              >
                Stay updated with Workkerz
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() =>
                loadNotifications(false)
              }
              disabled={refreshing}
              aria-label="Refresh notifications"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-gray-500
                active:bg-gray-100
                active:scale-95
                disabled:opacity-50

                md:h-10
                md:w-10
              "
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="
                  flex
                  h-9
                  items-center
                  gap-1.5
                  rounded-full
                  px-2.5
                  text-[10px]
                  font-bold
                  text-green-700
                  active:bg-green-50
                  active:scale-95

                  sm:px-3
                  sm:text-[11px]

                  md:h-10
                  md:px-4
                  md:text-xs
                "
              >
                <CheckCheck size={15} />

                <span className="hidden sm:inline">
                  Mark all as read
                </span>

                <span className="sm:hidden">
                  Read all
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =================================================
          FIXED TABS
      ================================================== */}

      <div
        className="
          fixed
          left-0
          right-0
          top-[58px]
          z-[90]
          border-b
          border-gray-100
          bg-white

          sm:top-[62px]

          md:top-[68px]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-5xl
            overflow-x-auto
            scrollbar-none
          "
        >
          <div
            className="
              flex
              min-w-max
              px-2

              sm:px-4

              md:justify-center
            "
          >
            {tabs.map((tab) => {
              const active =
                activeTab ===
                tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.value
                    )
                  }
                  className={`
                    relative
                    shrink-0
                    px-4
                    py-3
                    text-[11px]
                    font-semibold
                    transition

                    sm:px-5
                    sm:text-[12px]

                    md:px-6
                    md:text-[13px]

                    ${
                      active
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  `}
                >
                  {tab.label}

                  {active && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-3
                        right-3
                        h-[2px]
                        rounded-full
                        bg-green-600

                        sm:left-4
                        sm:right-4
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-5xl

          sm:px-4
          sm:py-4

          md:px-6
          md:py-5
        "
      >
        {/* ERROR */}

        {error && (
          <div
            className="
              mx-2
              mb-3
              flex
              items-center
              justify-between
              gap-3
              rounded-xl
              border
              border-red-100
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700

              sm:mx-0
            "
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                loadNotifications(true)
              }
              className="
                shrink-0
                rounded-lg
                bg-white
                px-3
                py-2
                text-xs
                font-bold
                text-red-700
                shadow-sm
              "
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (
          <div
            className="
              overflow-hidden
              border-y
              border-gray-100
              bg-white

              sm:rounded-2xl
              sm:border
            "
          >
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="
                    flex
                    gap-3
                    border-b
                    border-gray-100
                    px-3
                    py-4
                    last:border-b-0

                    sm:px-5
                  "
                >
                  <div
                    className="
                      h-12
                      w-12
                      shrink-0
                      animate-pulse
                      rounded-xl
                      bg-gray-200

                      sm:h-14
                      sm:w-14
                    "
                  />

                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />

                    <div className="h-3 w-full animate-pulse rounded bg-gray-200" />

                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !error &&
          filteredNotifications.length ===
            0 && (
            <div
              className="
                flex
                min-h-[55vh]
                items-center
                justify-center
                px-5
              "
            >
              <div className="max-w-sm text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-green-50
                  "
                >
                  <Inbox
                    size={28}
                    className="text-green-600"
                  />
                </div>

                <h2
                  className="
                    mt-4
                    text-base
                    font-bold
                    text-gray-900
                  "
                >
                  No notifications
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-gray-500
                  "
                >
                  You&apos;re all caught up.
                  New Workkerz updates will
                  appear here.
                </p>
              </div>
            </div>
          )}

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        {!loading &&
          filteredNotifications.length >
            0 && (
            <div
              className="
                overflow-hidden
                border-y
                border-gray-100
                bg-white

                sm:rounded-2xl
                sm:border
                sm:shadow-[0_2px_12px_rgba(0,0,0,0.04)]

                md:rounded-3xl
              "
            >
              {filteredNotifications.map(
                (notification) => (
                  <NotificationCard
                    key={notification.id}
                    title={
                      notification.title
                    }
                    message={
                      notification.message
                    }
                    type={
                      notification.type
                    }
                    image_url={
                      notification.image_url
                    }
                    icon={
                      notification.icon
                    }
                    is_read={
                      notification.is_read
                    }
                    created_at={
                      notification.created_at
                    }
                    onClick={() =>
                      markAsRead(
                        notification
                      )
                    }
                  />
                )
              )}
            </div>
          )}
      </div>
    </main>
  );
}