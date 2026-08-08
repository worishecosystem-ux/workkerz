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

export default function AdminPanel() {
  // =====================================================
  // ADMIN
  // =====================================================

  const [admin, setAdmin] =
    useState<AdminProfile | null>(null);

  const [assignedRoles, setAssignedRoles] =
    useState<AdminSubRole[]>([]);

  const [isSuperAdmin, setIsSuperAdmin] =
    useState(false);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const [activeTab, setActiveTab] =
    useState<AdminModule>("dashboard");

  // =====================================================
  // PAGE STATE
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // NEW ORDER NOTIFICATION
  // =====================================================

  const [notificationOrder, setNotificationOrder] =
    useState<any>(null);

  // =====================================================
  // AUDIO
  // =====================================================

  const notificationAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioUnlockedRef =
    useRef(false);

  // =====================================================
  // REALTIME CHANNEL
  // =====================================================

  const orderChannelRef =
    useRef<ReturnType<typeof supabase.channel> | null>(
      null,
    );

  const realtimeStartedRef =
    useRef(false);

  // =====================================================
  // LOAD CURRENT ADMIN
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

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
              Authorization:
                `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          },
        );

        const data:
          | AdminMeResponse
          | { error: string } =
          await response.json();

        if (!mounted) return;

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
          data.isSuperAdmin,
        );

        setAssignedRoles(
          data.assignedRoles.map(
            (role) => role.name,
          ),
        );

        // =================================================
        // DEFAULT TAB
        // =================================================

        if (data.isSuperAdmin) {
          setActiveTab("dashboard");
          return;
        }

        const firstAllowedTab: AdminModule[] =
          [
            "dashboard",
            "workers",
            "orders",
            "shops",
            "bookings",
            "admins",
          ];

        const firstAllowed =
          firstAllowedTab.find(
            (module) =>
              canAccessModule(
                data.admin.role,
                data.assignedRoles.map(
                  (role) => role.name,
                ),
                module,
              ),
          );

        if (firstAllowed) {
          setActiveTab(firstAllowed);
        }
      } catch (error) {
        console.error(
          "Load admin error:",
          error,
        );

        if (!mounted) return;

        setError(
          error instanceof Error
            ? error.message
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

  // =====================================================
  // INITIALIZE NOTIFICATION AUDIO
  // =====================================================

  useEffect(() => {
    const audio =
      new Audio("/sounds/new-order.mp3");

    audio.preload = "auto";
    audio.volume = 1;

    notificationAudioRef.current =
      audio;

    const unlockAudio = async () => {
      try {
        if (audioUnlockedRef.current) {
          return;
        }

        /*
         * Browser autoplay policy:
         * play muted once after user interaction.
         */
        audio.muted = true;

        await audio.play();

        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;

        audioUnlockedRef.current = true;

        console.log(
          "🔊 Notification sound unlocked.",
        );
      } catch (error) {
        console.log(
          "Audio unlock waiting for user interaction.",
          error,
        );
      }
    };

    window.addEventListener(
      "click",
      unlockAudio,
      { once: true },
    );

    window.addEventListener(
      "keydown",
      unlockAudio,
      { once: true },
    );

    window.addEventListener(
      "touchstart",
      unlockAudio,
      { once: true },
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

  // =====================================================
  // PLAY NEW ORDER SOUND
  // =====================================================

  const playNewOrderSound =
    useCallback(async () => {
      const audio =
        notificationAudioRef.current;

      if (!audio) {
        console.log(
          "Notification audio is not initialized.",
        );

        return;
      }

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
        audio.muted = false;

        await audio.play();

        console.log(
          "🔊 New order notification sound played.",
        );
      } catch (error) {
        console.error(
          "Unable to play notification sound:",
          error,
        );

        /*
         * Browser may block autoplay if the admin
         * has not interacted with the page yet.
         */
        if (
          error instanceof DOMException &&
          error.name === "NotAllowedError"
        ) {
          console.log(
            "Browser blocked autoplay. User interaction is required.",
          );
        }
      }
    }, []);

  // =====================================================
  // REALTIME NEW ORDER LISTENER
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const setupOrderRealtime =
      async () => {
        try {
          // ------------------------------------------------
          // PREVENT DUPLICATE SUBSCRIPTION
          // ------------------------------------------------

          if (realtimeStartedRef.current) {
            console.log(
              "Order realtime already started.",
            );

            return;
          }

          realtimeStartedRef.current =
            true;

          // ------------------------------------------------
          // CHECK SESSION
          // ------------------------------------------------

          const {
            data: { session },
          } =
            await supabase.auth.getSession();

          if (cancelled) {
            realtimeStartedRef.current =
              false;

            return;
          }

          if (!session?.access_token) {
            console.log(
              "No admin session for order realtime.",
            );

            realtimeStartedRef.current =
              false;

            return;
          }

          // ------------------------------------------------
          // REMOVE OLD CHANNEL
          // ------------------------------------------------

          if (
            orderChannelRef.current
          ) {
            console.log(
              "Removing old order realtime channel...",
            );

            await supabase.removeChannel(
              orderChannelRef.current,
            );

            orderChannelRef.current =
              null;
          }

          if (cancelled) {
            realtimeStartedRef.current =
              false;

            return;
          }

          // ------------------------------------------------
          // UNIQUE CHANNEL NAME
          // ------------------------------------------------

          const channelName =
            `admin-new-orders-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

          console.log(
            "Creating order realtime channel:",
            channelName,
          );

          // ------------------------------------------------
          // CREATE CHANNEL
          // ------------------------------------------------

          const channel =
            supabase.channel(
              channelName,
            );

          // ------------------------------------------------
          // ADD CALLBACK BEFORE SUBSCRIBE
          // ------------------------------------------------

          channel.on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "orders",
            },
            async (payload) => {
              console.log(
                "🔔 NEW ORDER RECEIVED:",
                payload.new,
              );

              if (cancelled) {
                return;
              }

              // --------------------------------------------
              // SHOW GLOBAL NOTIFICATION
              // --------------------------------------------

              setNotificationOrder(
                payload.new,
              );

              // --------------------------------------------
              // PLAY SOUND
              // --------------------------------------------

              await playNewOrderSound();
            },
          );

          // ------------------------------------------------
          // SAVE CHANNEL REF
          // ------------------------------------------------

          orderChannelRef.current =
            channel;

          // ------------------------------------------------
          // SUBSCRIBE
          // ------------------------------------------------

          channel.subscribe(
            (status) => {
              console.log(
                "Admin order realtime status:",
                status,
              );

              if (
                status === "SUBSCRIBED"
              ) {
                console.log(
                  "✅ Admin order realtime connected.",
                );
              }

              if (
                status === "CHANNEL_ERROR"
              ) {
                console.error(
                  "❌ Admin order realtime channel error.",
                );
              }

              if (
                status === "TIMED_OUT"
              ) {
                console.error(
                  "⏱️ Admin order realtime timed out.",
                );
              }

              if (
                status === "CLOSED"
              ) {
                console.log(
                  "Admin order realtime closed.",
                );
              }
            },
          );
        } catch (error) {
          console.error(
            "Order realtime setup error:",
            error,
          );

          realtimeStartedRef.current =
            false;
        }
      };

    setupOrderRealtime();

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      cancelled = true;

      const channel =
        orderChannelRef.current;

      if (channel) {
        console.log(
          "Cleaning up order realtime channel...",
        );

        supabase.removeChannel(
          channel,
        );

        orderChannelRef.current =
          null;
      }

      realtimeStartedRef.current =
        false;
    };
  }, [playNewOrderSound]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigation: {
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

  // =====================================================
  // ACCESS CHECK
  // =====================================================

  const hasAccess = (
    module: AdminModule,
  ) => {
    if (!admin) {
      return false;
    }

    if (isSuperAdmin) {
      return true;
    }

    if (module === "admins") {
      return false;
    }

    return canAccessModule(
      admin.role,
      assignedRoles,
      module,
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF5C39]" />

          <p className="mt-3 text-sm text-[#64748B]">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h1 className="mt-4 text-lg font-black text-[#0F172A]">
            Unable to load Admin Panel
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            {error ||
              "Admin profile could not be found."}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // FILTER NAVIGATION
  // =====================================================

  const visibleNavigation =
    navigation.filter((item) =>
      hasAccess(item.id),
    );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* ================================================= */}
      {/* GLOBAL NEW ORDER NOTIFICATION */}
      {/* ================================================= */}

      <NewOrderNotification
        order={notificationOrder}
        onClose={() => {
          setNotificationOrder(
            null,
          );
        }}
        onView={() => {
          setNotificationOrder(
            null,
          );

          setActiveTab("orders");
        }}
      />

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="fixed bottom-0 left-0 top-0 w-64 border-r border-gray-100 bg-white">

        {/* BRAND */}

        <div className="flex h-20 items-center border-b border-gray-100 px-6">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">
              Workkerz
            </h1>

            <p className="text-xs text-[#94A3B8]">
              Admin Panel
            </p>
          </div>
        </div>

        {/* ADMIN INFO */}

        <div className="px-4 pt-4">
          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
                <ShieldCheck className="h-4 w-4 text-[#FF5C39]" />
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold text-[#0F172A]">
                  {admin.full_name}
                </p>

                <p className="truncate text-xs text-[#64748B]">
                  {admin.email}
                </p>

              </div>

            </div>

            <div className="mt-3">

              <span
                className={
                  isSuperAdmin
                    ? "inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700"
                    : "inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700"
                }
              >
                {isSuperAdmin
                  ? "Super Admin"
                  : "Admin"}
              </span>

            </div>

          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="space-y-1 p-4">

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
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    transition-all
                    ${
                      isActive
                        ? "bg-[#FF5C39] text-white"
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />

                  <span className="font-semibold">
                    {item.label}
                  </span>
                </button>
              );
            },
          )}

        </nav>

      </aside>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="ml-64 min-h-screen flex-1">

        {activeTab ===
          "dashboard" &&
          hasAccess("dashboard") && (
            <DashboardTab />
          )}

        {activeTab ===
          "workers" &&
          hasAccess("workers") && (
            <WorkersTab />
          )}

        {activeTab ===
          "orders" &&
          hasAccess("orders") && (
            <OrdersTab
              notificationOrder={
                notificationOrder
              }
              onNotificationHandled={() => {
                setNotificationOrder(
                  null,
                );
              }}
            />
          )}

        {activeTab ===
          "shops" &&
          hasAccess("shops") && (
            <ShopsTab />
          )}

        {activeTab ===
          "bookings" &&
          hasAccess("bookings") && (
            <BookingsTab />
          )}

        {activeTab ===
          "admins" &&
          hasAccess("admins") && (
            <AdminsTab />
          )}

      </main>
    </div>
  );
}