"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Store,
  CalendarCheck,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import DashboardTab from "./components/dashboard/DashboardTab";
import WorkersTab from "./components/workers/WorkersTab";
import OrdersTab from "./components/OrdersTab";
import ShopsTab from "./components/ShopsTab";
import BookingsTab from "./components/BookingsTab";
import AdminsTab from "./components/AdminsTab";
import NewOrderNotification from "./components/orders/NewOrderNotification";

import {
  canAccessModule,
  type AdminModule,
  type AdminRole,
  type AdminSubRole,
} from "./lib/adminPermissions";

/* =====================================================
   TYPES
===================================================== */

type AdminProfile = {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
};

type AssignedRole = {
  id: number;
  name: AdminSubRole;
  label: string;
  description?: string | null;
  is_active: boolean;
};

type AdminMeResponse = {
  admin: AdminProfile;
  assignedRoles: AssignedRole[];
  isSuperAdmin: boolean;
};

type NotificationOrder = {
  id: string | number;
  status?: string | null;
  created_at?: string | null;
  order_number?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  total_amount?: number | string | null;
  total?: number | string | null;
  amount?: number | string | null;
  [key: string]: any;
};

type NotificationAction =
  | "view"
  | "accept"
  | "reject"
  | null;

/* =====================================================
   NOTIFICATION REMOVE STATUSES
===================================================== */

const NOTIFICATION_REMOVE_STATUSES = [
  "accepted",
  "confirmed",
  "approved",
  "rejected",
  "cancelled",
  "canceled",
];

/* =====================================================
   NAVIGATION
===================================================== */

const NAVIGATION: {
  id: AdminModule;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "workers",
    label: "Workers",
    icon: Users,
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    id: "shops",
    label: "Shops",
    icon: Store,
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
  },
  {
    id: "admins",
    label: "Admins",
    icon: ShieldCheck,
  },
];

/* =====================================================
   COMPONENT
===================================================== */

export default function AdminPanel() {
  /* ===================================================
     ADMIN
  =================================================== */

  const [admin, setAdmin] =
    useState<AdminProfile | null>(null);

  const [assignedRoles, setAssignedRoles] =
    useState<AdminSubRole[]>([]);

  const [isSuperAdmin, setIsSuperAdmin] =
    useState(false);

  /* ===================================================
     NAVIGATION
  =================================================== */

  const [activeTab, setActiveTab] =
    useState<AdminModule>("dashboard");

  /* ===================================================
     MOBILE SIDEBAR
  =================================================== */

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  /* ===================================================
     PAGE
  =================================================== */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ===================================================
     NOTIFICATIONS
  =================================================== */

  const [
    notificationOrders,
    setNotificationOrders,
  ] = useState<NotificationOrder[]>([]);

  const notificationOrdersRef =
    useRef<NotificationOrder[]>([]);

  /* ===================================================
     NOTIFICATION ACTION
  =================================================== */

  const [
    notificationOrderToView,
    setNotificationOrderToView,
  ] = useState<NotificationOrder | null>(null);

  const [
    notificationAction,
    setNotificationAction,
  ] = useState<NotificationAction>(null);

  const [
    notificationOpenKey,
    setNotificationOpenKey,
  ] = useState(0);

  /* ===================================================
     AUDIO
  =================================================== */

  const notificationAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioUnlockedRef =
    useRef(false);

  /* ===================================================
     REALTIME
  =================================================== */

  const orderChannelRef =
    useRef<ReturnType<typeof supabase.channel> | null>(
      null,
    );

  const realtimeStartedRef =
    useRef(false);

  /* ===================================================
     SYNC NOTIFICATION REF
  =================================================== */

  useEffect(() => {
    notificationOrdersRef.current =
      notificationOrders;
  }, [notificationOrders]);

  /* ===================================================
     CLOSE MOBILE DRAWER ON TAB CHANGE
  =================================================== */

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [activeTab]);

  /* ===================================================
     ESC CLOSE MOBILE DRAWER
  =================================================== */

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [mobileSidebarOpen]);

  /* ===================================================
     PREVENT BODY SCROLL WHEN DRAWER OPEN
  =================================================== */

  useEffect(() => {
    if (!mobileSidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  /* ===================================================
     LOAD ADMIN
  =================================================== */

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (!session?.access_token) {
          setError(
            "Your admin session has expired.",
          );

          return;
        }

        const response = await fetch(
          "/api/admin/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          },
        );

        const data:
          | AdminMeResponse
          | { error: string } =
          await response.json();

        if (!mounted) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            "error" in data
              ? data.error
              : "Unable to load admin profile.",
          );
        }

        if (!("admin" in data)) {
          throw new Error(
            "Invalid admin response.",
          );
        }

        setAdmin(data.admin);

        setIsSuperAdmin(
          Boolean(data.isSuperAdmin),
        );

        const roleNames: AdminSubRole[] =
          Array.isArray(
            data.assignedRoles,
          )
            ? data.assignedRoles
                .map(
                  (role) => role.name,
                )
                .filter(Boolean)
            : [];

        setAssignedRoles(roleNames);

        /*
         * Super admin starts on dashboard.
         */
        if (data.isSuperAdmin) {
          setActiveTab("dashboard");
          return;
        }

        /*
         * Find first module this admin can access.
         */
        const firstAllowedTabs: AdminModule[] =
          [
            "dashboard",
            "workers",
            "orders",
            "shops",
            "bookings",
          ];

        const firstAllowed =
          firstAllowedTabs.find(
            (module) =>
              canAccessModule(
                data.admin.role,
                roleNames,
                module,
              ),
          );

        if (firstAllowed) {
          setActiveTab(
            firstAllowed,
          );
        }
      } catch (err) {
        console.error(
          "[Admin] Load error:",
          err,
        );

        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admin.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================================================
     REALTIME AUTH
  =================================================== */

  useEffect(() => {
    let mounted = true;

    const syncRealtimeAuth =
      async () => {
        try {
          const {
            data: { session },
          } =
            await supabase.auth.getSession();

          if (!mounted) {
            return;
          }

          if (session?.access_token) {
            supabase.realtime.setAuth(
              session.access_token,
            );
          }
        } catch (err) {
          console.error(
            "[Realtime] Auth error:",
            err,
          );
        }
      };

    syncRealtimeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          "[Auth] Event:",
          event,
        );

        if (session?.access_token) {
          supabase.realtime.setAuth(
            session.access_token,
          );
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ===================================================
     AUDIO INITIALIZATION
  =================================================== */

  useEffect(() => {
    const audio = new Audio(
      "/sounds/new-order.mp3",
    );

    audio.preload = "auto";
    audio.volume = 1;

    notificationAudioRef.current =
      audio;

    const unlockAudio =
      async () => {
        if (audioUnlockedRef.current) {
          return;
        }

        try {
          audio.muted = true;
          audio.currentTime = 0;

          await audio.play();

          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;

          audioUnlockedRef.current =
            true;

          console.log(
            "[Audio] Unlocked",
          );
        } catch {
          console.log(
            "[Audio] Waiting for user interaction.",
          );
        }

        window.removeEventListener(
          "click",
          unlockAudio,
        );

        window.removeEventListener(
          "keydown",
          unlockAudio,
        );

        window.removeEventListener(
          "touchstart",
          unlockAudio,
        );
      };

    window.addEventListener(
      "click",
      unlockAudio,
    );

    window.addEventListener(
      "keydown",
      unlockAudio,
    );

    window.addEventListener(
      "touchstart",
      unlockAudio,
    );

    return () => {
      window.removeEventListener(
        "click",
        unlockAudio,
      );

      window.removeEventListener(
        "keydown",
        unlockAudio,
      );

      window.removeEventListener(
        "touchstart",
        unlockAudio,
      );

      audio.pause();

      notificationAudioRef.current =
        null;

      audioUnlockedRef.current =
        false;
    };
  }, []);

  /* ===================================================
     PLAY NEW ORDER SOUND
  =================================================== */

  const playNewOrderSound =
    useCallback(async () => {
      const audio =
        notificationAudioRef.current;

      if (
        !audio ||
        !audioUnlockedRef.current
      ) {
        return;
      }

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
        audio.muted = false;

        await audio.play();
      } catch (err) {
        console.warn(
          "[Audio] Notification sound unavailable:",
          err,
        );
      }
    }, []);

  /* ===================================================
     CHECK REMOVE STATUS
  =================================================== */

  const shouldRemoveNotification =
    useCallback(
      (
        status:
          | string
          | null
          | undefined,
      ) => {
        const normalized =
          String(status ?? "")
            .trim()
            .toLowerCase();

        return NOTIFICATION_REMOVE_STATUSES.includes(
          normalized,
        );
      },
      [],
    );

  /* ===================================================
     ADD NOTIFICATION
  =================================================== */

  const addOrderNotification =
    useCallback(
      (order: NotificationOrder) => {
        if (
          order?.id === undefined ||
          order?.id === null
        ) {
          return;
        }

        const orderId =
          String(order.id);

        /*
         * Do not show notifications for
         * already completed orders.
         */
        if (
          shouldRemoveNotification(
            order.status,
          )
        ) {
          return;
        }

        /*
         * Prevent duplicate notifications.
         */
        const exists =
          notificationOrdersRef.current.some(
            (item) =>
              String(item.id) ===
              orderId,
          );

        if (exists) {
          return;
        }

        const nextNotifications = [
          order,
          ...notificationOrdersRef.current,
        ];

        notificationOrdersRef.current =
          nextNotifications;

        setNotificationOrders(
          nextNotifications,
        );

        console.log(
          "[Notification] Added:",
          orderId,
        );
      },
      [shouldRemoveNotification],
    );

  /* ===================================================
     REMOVE NOTIFICATION
  =================================================== */

  const removeOrderNotification =
    useCallback(
      (
        orderId: string | number,
      ) => {
        const id = String(orderId);

        const nextNotifications =
          notificationOrdersRef.current.filter(
            (order) =>
              String(order.id) !== id,
          );

        notificationOrdersRef.current =
          nextNotifications;

        setNotificationOrders(
          nextNotifications,
        );

        setNotificationOrderToView(
          (current) => {
            if (
              current &&
              String(current.id) ===
                id
            ) {
              return null;
            }

            return current;
          },
        );

        console.log(
          "[Notification] Removed:",
          id,
        );
      },
      [],
    );

  /* ===================================================
     VIEW ORDER
  =================================================== */

  const handleNotificationView =
    useCallback(
      (order: NotificationOrder) => {
        if (
          order?.id === undefined ||
          order?.id === null
        ) {
          return;
        }

        console.log(
          "[Notification] VIEW:",
          order.id,
        );

        setNotificationOrderToView(
          order,
        );

        setNotificationAction(
          "view",
        );

        setNotificationOpenKey(
          (previous) =>
            previous + 1,
        );

        /*
         * Only switches to Orders
         * when user clicks View.
         */
        setActiveTab("orders");
      },
      [],
    );

  /* ===================================================
     ACCEPT ORDER
  =================================================== */

  const handleNotificationAccept =
    useCallback(
      (order: NotificationOrder) => {
        if (
          order?.id === undefined ||
          order?.id === null
        ) {
          return;
        }

        console.log(
          "[Notification] ACCEPT:",
          order.id,
        );

        setNotificationOrderToView(
          order,
        );

        setNotificationAction(
          "accept",
        );

        setNotificationOpenKey(
          (previous) =>
            previous + 1,
        );

        /*
         * Only switches to Orders
         * when user clicks Accept.
         */
        setActiveTab("orders");
      },
      [],
    );

  /* ===================================================
     REJECT ORDER
  =================================================== */

  const handleNotificationReject =
    useCallback(
      (order: NotificationOrder) => {
        if (
          order?.id === undefined ||
          order?.id === null
        ) {
          return;
        }

        console.log(
          "[Notification] REJECT:",
          order.id,
        );

        setNotificationOrderToView(
          order,
        );

        setNotificationAction(
          "reject",
        );

        setNotificationOpenKey(
          (previous) =>
            previous + 1,
        );

        /*
         * Only switches to Orders
         * when user clicks Reject.
         */
        setActiveTab("orders");
      },
      [],
    );

  /* ===================================================
     CLOSE NOTIFICATION
  =================================================== */

  const handleNotificationClose =
    useCallback(
      (orderId: string | number) => {
        removeOrderNotification(
          orderId,
        );
      },
      [removeOrderNotification],
    );

  /* ===================================================
     ACCESS
  =================================================== */

  const hasAccess = (
    module: AdminModule,
  ) => {
    if (!admin) {
      return false;
    }

    if (isSuperAdmin) {
      return true;
    }

    /*
     * Normal admins cannot access
     * Admin Management.
     */
    if (module === "admins") {
      return false;
    }

    return canAccessModule(
      admin.role,
      assignedRoles,
      module,
    );
  };

  /* ===================================================
     REALTIME ORDERS
  =================================================== */

  useEffect(() => {
    /*
     * Do not start realtime before
     * admin authentication is ready.
     */
    if (
      loading ||
      !admin ||
      !hasAccess("orders")
    ) {
      return;
    }

    let cancelled = false;

    const setupOrderRealtime =
      async () => {
        try {
          /*
           * Prevent duplicate channels.
           */
          if (
            realtimeStartedRef.current
          ) {
            return;
          }

          const {
            data: { session },
            error: sessionError,
          } =
            await supabase.auth.getSession();

          if (
            sessionError ||
            !session?.access_token
          ) {
            console.error(
              "[Realtime] No valid session.",
              sessionError,
            );

            return;
          }

          if (cancelled) {
            return;
          }

          /*
           * Authenticate Supabase Realtime.
           */
          supabase.realtime.setAuth(
            session.access_token,
          );

          /*
           * Remove any old channel.
           */
          if (
            orderChannelRef.current
          ) {
            await supabase.removeChannel(
              orderChannelRef.current,
            );

            orderChannelRef.current =
              null;
          }

          if (cancelled) {
            return;
          }

          realtimeStartedRef.current =
            true;

          const channel =
            supabase
              .channel(
                "admin-orders-realtime",
              )

              /* =========================================
                 INSERT
              ========================================= */

              .on(
                "postgres_changes",
                {
                  event: "INSERT",
                  schema: "public",
                  table: "orders",
                },
                async (payload) => {
                  if (cancelled) {
                    return;
                  }

                  const order =
                    payload.new as NotificationOrder;

                  console.log(
                    "[Realtime] NEW ORDER:",
                    order,
                  );

                  /*
                   * Add compact notification.
                   */
                  addOrderNotification(
                    order,
                  );

                  /*
                   * Play sound.
                   */
                  await playNewOrderSound();
                },
              )

              /* =========================================
                 UPDATE
              ========================================= */

              .on(
                "postgres_changes",
                {
                  event: "UPDATE",
                  schema: "public",
                  table: "orders",
                },
                (payload) => {
                  if (cancelled) {
                    return;
                  }

                  const order =
                    payload.new as NotificationOrder;

                  console.log(
                    "[Realtime] ORDER UPDATE:",
                    order,
                  );

                  /*
                   * Remove notification when
                   * order is no longer pending.
                   */
                  if (
                    shouldRemoveNotification(
                      order.status,
                    )
                  ) {
                    removeOrderNotification(
                      order.id,
                    );
                  }
                },
              );

          orderChannelRef.current =
            channel;

          /* =============================================
             SUBSCRIBE
          ============================================= */

          channel.subscribe(
            (
              status,
              realtimeError,
            ) => {
              console.log(
                "[Realtime] STATUS:",
                status,
              );

              if (
                status ===
                "SUBSCRIBED"
              ) {
                console.log(
                  "[Realtime] CONNECTED",
                );
              }

              if (
                status ===
                "CHANNEL_ERROR"
              ) {
                console.error(
                  "[Realtime] CHANNEL_ERROR:",
                  realtimeError,
                );

                realtimeStartedRef.current =
                  false;
              }

              if (
                status ===
                "TIMED_OUT"
              ) {
                console.error(
                  "[Realtime] TIMED_OUT:",
                  realtimeError,
                );

                realtimeStartedRef.current =
                  false;
              }

              if (
                status === "CLOSED"
              ) {
                realtimeStartedRef.current =
                  false;
              }
            },
          );
        } catch (err) {
          console.error(
            "[Realtime] Setup failed:",
            err,
          );

          realtimeStartedRef.current =
            false;
        }
      };

    setupOrderRealtime();

    return () => {
      cancelled = true;

      const channel =
        orderChannelRef.current;

      if (channel) {
        supabase.removeChannel(
          channel,
        );

        orderChannelRef.current =
          null;
      }

      realtimeStartedRef.current =
        false;
    };
  }, [
    loading,
    admin,
    assignedRoles,
    isSuperAdmin,
    addOrderNotification,
    removeOrderNotification,
    playNewOrderSound,
    shouldRemoveNotification,
  ]);

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#F8FAFC]
          px-4
        "
      >
        <div className="flex flex-col items-center">
          <Loader2
            className="
              h-8
              w-8
              animate-spin
              text-[#FF5C39]
            "
          />

          <p
            className="
              mt-3
              text-sm
              text-[#64748B]
            "
          >
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error || !admin) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#F8FAFC]
          px-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-2xl
            border
            border-gray-100
            bg-white
            p-6
            text-center
            shadow-sm
            sm:p-7
          "
        >
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-red-50
            "
          >
            <AlertCircle
              className="
                h-6
                w-6
                text-red-500
              "
            />
          </div>

          <h1
            className="
              mt-4
              text-lg
              font-black
              text-[#0F172A]
            "
          >
            Unable to load Admin Panel
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-[#64748B]
            "
          >
            {error ||
              "Admin profile could not be found."}
          </p>
        </div>
      </div>
    );
  }

  /* ===================================================
     VISIBLE NAVIGATION
  =================================================== */

  const visibleNavigation =
    NAVIGATION.filter((item) =>
      hasAccess(item.id),
    );

  const currentNavigation =
    visibleNavigation.find(
      (item) =>
        item.id === activeTab,
    );

  /* ===================================================
     MOBILE TAB CHANGE
  =================================================== */

  const handleMobileTabChange = (
    tab: AdminModule,
  ) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div
      className="
        min-h-screen
        w-full
        bg-[#F8FAFC]
      "
    >
      {/* =================================================
          NEW ORDER NOTIFICATIONS
      ================================================= */}

      {notificationOrders.length > 0 && (
        <div
          className="
            fixed
            right-3
            top-3
            z-[100]
            flex
            w-[calc(100%-1.5rem)]
            max-w-[380px]
            flex-col
            gap-2
            sm:right-5
            sm:top-5
          "
        >
          {notificationOrders.map(
            (order) => (
              <NewOrderNotification
                key={String(order.id)}
                order={order}
                onClose={() => {
                  handleNotificationClose(
                    order.id,
                  );
                }}
                onView={() => {
                  handleNotificationView(
                    order,
                  );
                }}
                onAccept={() => {
                  handleNotificationAccept(
                    order,
                  );
                }}
                onReject={() => {
                  handleNotificationReject(
                    order,
                  );
                }}
              />
            ),
          )}
        </div>
      )}

      {/* =================================================
          MOBILE TOP BAR
      ================================================= */}

      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-40
          flex
          h-16
          items-center
          justify-between
          border-b
          border-gray-100
          bg-white
          px-3
          sm:px-5
          lg:hidden
        "
      >
        {/* BRAND */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-orange-50
            "
          >
            <ShieldCheck
              className="
                h-4
                w-4
                text-[#FF5C39]
              "
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-black
                text-[#0F172A]
              "
            >
              Workkerz
            </p>

            <p
              className="
                truncate
                text-[10px]
                text-[#94A3B8]
              "
            >
              Admin Panel
            </p>
          </div>
        </div>

        {/* CURRENT PAGE */}

        <div
          className="
            hidden
            min-w-0
            flex-1
            justify-center
            px-4
            sm:flex
          "
        >
          <div className="min-w-0">
            <p
              className="
                truncate
                text-xs
                font-bold
                text-[#64748B]
              "
            >
              {currentNavigation?.label ||
                "Dashboard"}
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div
          className="
            flex
            items-center
            gap-2
            sm:gap-3
          "
        >
          {/* ADMIN INFO */}

          <div
            className="
              hidden
              text-right
              sm:block
            "
          >
            <p
              className="
                max-w-[150px]
                truncate
                text-xs
                font-bold
                text-[#0F172A]
              "
            >
              {admin.full_name}
            </p>

            <p
              className="
                text-[10px]
                text-[#64748B]
              "
            >
              {isSuperAdmin
                ? "Super Admin"
                : "Admin"}
            </p>
          </div>

          {/* ADMIN ICON */}

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-orange-50
            "
          >
            <ShieldCheck
              className="
                h-4
                w-4
                text-[#FF5C39]
              "
            />
          </div>

          {/* MENU */}

          <button
            type="button"
            aria-label="Open admin menu"
            onClick={() =>
              setMobileSidebarOpen(true)
            }
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#F8FAFC]
              text-[#0F172A]
              transition
              hover:bg-gray-100
              active:scale-95
            "
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileSidebarOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/40
            backdrop-blur-[2px]
            lg:hidden
          "
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* =================================================
          MOBILE DRAWER
      ================================================= */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-[60]
          flex
          w-[min(86vw,320px)]
          flex-col
          border-r
          border-gray-100
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          lg:hidden

          ${
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* DRAWER HEADER */}

        <div
          className="
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-100
            px-4
          "
        >
          <div>
            <p
              className="
                text-base
                font-black
                text-[#0F172A]
              "
            >
              Workkerz
            </p>

            <p
              className="
                text-[10px]
                text-[#94A3B8]
              "
            >
              Admin Panel
            </p>
          </div>

          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-[#F8FAFC]
              text-[#64748B]
              transition
              hover:bg-gray-100
              hover:text-[#0F172A]
              active:scale-95
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ADMIN PROFILE */}

        <div className="shrink-0 px-3 pt-3">
          <div
            className="
              rounded-xl
              border
              border-gray-100
              bg-[#F8FAFC]
              p-3
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-orange-50
                "
              >
                <ShieldCheck
                  className="
                    h-5
                    w-5
                    text-[#FF5C39]
                  "
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate
                    text-sm
                    font-bold
                    text-[#0F172A]
                  "
                >
                  {admin.full_name}
                </p>

                <p
                  className="
                    truncate
                    text-xs
                    text-[#64748B]
                  "
                >
                  {admin.email}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <span
                className={
                  isSuperAdmin
                    ? `
                      inline-flex
                      rounded-full
                      bg-purple-50
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-purple-700
                    `
                    : `
                      inline-flex
                      rounded-full
                      bg-blue-50
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-blue-700
                    `
                }
              >
                {isSuperAdmin
                  ? "Super Admin"
                  : "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}

        <nav
          className="
            flex-1
            overflow-y-auto
            overscroll-contain
            px-3
            py-4
          "
        >
          <div className="space-y-1">
            {visibleNavigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const isActive =
                  activeTab ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleMobileTabChange(
                        item.id,
                      )
                    }
                    className={`
                      flex
                      min-h-[44px]
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      text-sm
                      transition-all
                      active:scale-[0.98]

                      ${
                        isActive
                          ? "bg-[#FF5C39] text-white shadow-sm"
                          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />

                    <span
                      className="
                        min-w-0
                        flex-1
                        truncate
                        font-semibold
                      "
                    >
                      {item.label}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </nav>
      </aside>

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-64
          flex-col
          border-r
          border-gray-100
          bg-white
          lg:flex
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            h-20
            shrink-0
            items-center
            border-b
            border-gray-100
            px-5
            lg:px-6
          "
        >
          <div className="min-w-0">
            <h1
              className="
                truncate
                text-xl
                font-black
                text-[#0F172A]
              "
            >
              Workkerz
            </h1>

            <p
              className="
                truncate
                text-xs
                text-[#94A3B8]
              "
            >
              Admin Panel
            </p>
          </div>
        </div>

        {/* ADMIN PROFILE */}

        <div
          className="
            shrink-0
            px-3
            pt-3
            sm:px-4
            sm:pt-4
          "
        >
          <div
            className="
              rounded-xl
              border
              border-gray-100
              bg-[#F8FAFC]
              p-3
            "
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-orange-50
                "
              >
                <ShieldCheck
                  className="
                    h-4
                    w-4
                    text-[#FF5C39]
                  "
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate
                    text-xs
                    font-bold
                    text-[#0F172A]
                    sm:text-sm
                  "
                >
                  {admin.full_name}
                </p>

                <p
                  className="
                    truncate
                    text-[10px]
                    text-[#64748B]
                    sm:text-xs
                  "
                >
                  {admin.email}
                </p>
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <span
                className={
                  isSuperAdmin
                    ? `
                      inline-flex
                      rounded-full
                      bg-purple-50
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      text-purple-700
                      sm:px-2.5
                      sm:text-[11px]
                    `
                    : `
                      inline-flex
                      rounded-full
                      bg-blue-50
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      text-blue-700
                      sm:px-2.5
                      sm:text-[11px]
                    `
                }
              >
                {isSuperAdmin
                  ? "Super Admin"
                  : "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}

        <nav
          className="
            flex-1
            overflow-y-auto
            overscroll-contain
            px-3
            py-3
            sm:p-4
          "
        >
          <div className="space-y-1">
            {visibleNavigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const isActive =
                  activeTab ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        item.id,
                      )
                    }
                    className={`
                      flex
                      min-h-[42px]
                      w-full
                      items-center
                      gap-2.5
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      transition-all
                      active:scale-[0.98]
                      sm:gap-3
                      sm:px-4
                      sm:py-3
                      sm:text-sm

                      ${
                        isActive
                          ? "bg-[#FF5C39] text-white shadow-sm"
                          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                      }
                    `}
                  >
                    <Icon
                      className="
                        h-4
                        w-4
                        shrink-0
                        sm:h-5
                        sm:w-5
                      "
                    />

                    <span
                      className="
                        min-w-0
                        flex-1
                        truncate
                        font-semibold
                      "
                    >
                      {item.label}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </nav>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          min-h-screen
          w-full
          bg-[#F8FAFC]
          lg:ml-64
          lg:w-[calc(100%-16rem)]
        "
      >
        {/* MOBILE TOP BAR SPACE */}

        <div className="h-16 lg:hidden" />

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activeTab ===
          "dashboard" &&
          hasAccess(
            "dashboard",
          ) && (
            <DashboardTab />
          )}

        {/* =================================================
            WORKERS
        ================================================= */}

        {activeTab ===
          "workers" &&
          hasAccess(
            "workers",
          ) && (
            <WorkersTab />
          )}

        {/* =================================================
            ORDERS
        ================================================= */}

        {activeTab ===
          "orders" &&
          hasAccess(
            "orders",
          ) && (
            <OrdersTab
              notificationOrder={
                notificationOrderToView
              }
              notificationAction={
                notificationAction
              }
              notificationOpenKey={
                notificationOpenKey
              }
              onNotificationHandled={() => {
                setNotificationOrderToView(
                  null,
                );

                setNotificationAction(
                  null,
                );
              }}
              onNotificationStatusChanged={(
                orderId,
              ) => {
                removeOrderNotification(
                  orderId,
                );
              }}
            />
          )}

        {/* =================================================
            SHOPS
        ================================================= */}

        {activeTab ===
          "shops" &&
          hasAccess(
            "shops",
          ) && (
            <ShopsTab />
          )}

        {/* =================================================
            BOOKINGS
        ================================================= */}

        {activeTab ===
          "bookings" &&
          hasAccess(
            "bookings",
          ) && (
            <BookingsTab />
          )}

        {/* =================================================
            ADMINS
        ================================================= */}

        {activeTab ===
          "admins" &&
          hasAccess(
            "admins",
          ) && (
            <AdminsTab />
          )}
      </main>
    </div>
  );
}