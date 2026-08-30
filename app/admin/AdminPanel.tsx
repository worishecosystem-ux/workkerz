"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import MarketingTab from "./components/MarketingTab";
import WorkerRequestsTab from "./components/worker-requests/WorkerRequestsTab";

import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Store,
  CalendarCheck,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Menu,
  Megaphone,
  ChevronLeft,
  ChevronRight,
   UsersRound
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

/* =========================================================
   ADMIN TYPES
========================================================= */

type AdminProfile = {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  avatar_url?: string | null;
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

/* =========================================================
   ORDER NOTIFICATION
========================================================= */

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

type NotificationAction = "view" | "accept" | "reject" | null;

/* =========================================================
   REMOVED ORDER STATUSES
========================================================= */

const REMOVE = [
  "accepted",
  "confirmed",
  "approved",
  "rejected",
  "cancelled",
  "canceled",
];

/* =========================================================
   NAVIGATION
========================================================= */

const NAV: {
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
    icon: User,
  },
  {
    id: "worker-requests",
    label: "Worker Requests",
    icon: UsersRound,
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
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
  },
  {
    id: "admins",
    label: "Admins",
    icon: ShieldCheck,
  },
];

/* =========================================================
   MAIN
========================================================= */

export default function AdminPanel() {
  /* =======================================================
     ADMIN
  ======================================================= */

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  const [roles, setRoles] = useState<AdminSubRole[]>([]);

  const [superAdmin, setSuperAdmin] = useState(false);

  /* =======================================================
     TAB
  ======================================================= */

  const [tab, setTab] = useState<AdminModule>("dashboard");

  /* =======================================================
     UI
  ======================================================= */

  const [drawer, setDrawer] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     PLATFORM DETECTION
  ======================================================= */

  const [isAndroidApp, setIsAndroidApp] = useState(false);

  const [isBrowser, setIsBrowser] = useState(false);

  /* =======================================================
     KEYBOARD
  ======================================================= */

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [notifications, setNotifications] = useState<NotificationOrder[]>([]);

  const notificationsRef = useRef<NotificationOrder[]>([]);

  const [viewOrder, setViewOrder] = useState<NotificationOrder | null>(null);

  const [action, setAction] = useState<NotificationAction>(null);

  const [openKey, setOpenKey] = useState(0);

  /* =======================================================
     AUDIO
  ======================================================= */

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUnlocked = useRef(false);

  /* =======================================================
     REALTIME
  ======================================================= */

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const realtimeStarted = useRef(false);

  /* =======================================================
     WORKER FORM
  ======================================================= */

  const [workerFormOpen, setWorkerFormOpen] = useState(false);

  /* =======================================================
     PLATFORM DETECTION
  ======================================================= */

  useEffect(() => {
    const native = Capacitor.isNativePlatform();

    const platform = native ? Capacitor.getPlatform() : "web";

    const androidApp = native && platform === "android";

    setIsAndroidApp(androidApp);

    setIsBrowser(!native);
  }, []);

  /* =======================================================
     ACCESS
  ======================================================= */

  const hasAccess = useCallback(
    (module: AdminModule) =>
      !!admin &&
      (superAdmin ||
        (module !== "admins" && canAccessModule(admin.role, roles, module))),
    [admin, roles, superAdmin],
  );

  /* =======================================================
     NOTIFICATION REF
  ======================================================= */

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  /* =======================================================
     REMOVE NOTIFICATION
  ======================================================= */

  const removeNotification = useCallback((id: string | number) => {
    const next = notificationsRef.current.filter(
      (x) => String(x.id) !== String(id),
    );

    notificationsRef.current = next;

    setNotifications(next);

    setViewOrder((current) =>
      current && String(current.id) === String(id) ? null : current,
    );
  }, []);

  /* =======================================================
     ADD NOTIFICATION
  ======================================================= */

  const addNotification = useCallback((order: NotificationOrder) => {
    if (order?.id == null) {
      return;
    }

    const status = String(order.status ?? "")
      .trim()
      .toLowerCase();

    if (REMOVE.includes(status)) {
      return;
    }

    const exists = notificationsRef.current.some(
      (x) => String(x.id) === String(order.id),
    );

    if (exists) {
      return;
    }

    const next = [order, ...notificationsRef.current];

    notificationsRef.current = next;

    setNotifications(next);
  }, []);

  /* =======================================================
     OPEN ORDER
  ======================================================= */

  const openOrder = useCallback(
    (order: NotificationOrder, type: NotificationAction) => {
      if (order?.id == null) {
        return;
      }

      setViewOrder(order);

      setAction(type);

      setOpenKey((value) => value + 1);

      setTab("orders");

      setDrawer(false);
    },
    [],
  );

  /* =======================================================
     KEYBOARD DETECTION
     ANDROID ONLY
  ======================================================= */

  useEffect(() => {
    if (!isAndroidApp) {
      setKeyboardOpen(false);

      return;
    }

    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    let lastKeyboardState = false;

    const checkKeyboard = () => {
      const windowHeight = window.innerHeight;

      const viewportHeight = viewport.height;

      const heightDifference = windowHeight - viewportHeight;

      const isKeyboardOpen = heightDifference > 120;

      if (isKeyboardOpen !== lastKeyboardState) {
        lastKeyboardState = isKeyboardOpen;

        setKeyboardOpen(isKeyboardOpen);
      }
    };

    checkKeyboard();

    viewport.addEventListener("resize", checkKeyboard);

    viewport.addEventListener("scroll", checkKeyboard);

    window.addEventListener("resize", checkKeyboard);

    return () => {
      viewport.removeEventListener("resize", checkKeyboard);

      viewport.removeEventListener("scroll", checkKeyboard);

      window.removeEventListener("resize", checkKeyboard);
    };
  }, [isAndroidApp]);

  /* =======================================================
     CLOSE DRAWER ON TAB CHANGE
  ======================================================= */

  useEffect(() => {
    setDrawer(false);
  }, [tab]);

  /* =======================================================
     BODY SCROLL
  ======================================================= */

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  /* =======================================================
     LOAD ADMIN
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    (async () => {
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
          setError("Your admin session has expired.");

          return;
        }

        const res = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const data: AdminMeResponse | { error: string } = await res.json();

        if (!mounted) {
          return;
        }

        if (!res.ok) {
          throw new Error(
            "error" in data ? data.error : "Unable to load admin profile.",
          );
        }

        if (!("admin" in data)) {
          throw new Error("Invalid admin response.");
        }

        const roleNames = Array.isArray(data.assignedRoles)
          ? data.assignedRoles.map((x) => x.name).filter(Boolean)
          : [];

        setAdmin(data.admin);

        setSuperAdmin(!!data.isSuperAdmin);

        setRoles(roleNames);

        if (data.isSuperAdmin) {
          setTab("dashboard");
        } else {
          const first = (
            [
              "dashboard",
              "workers",
              "orders",
              "shops",
              "bookings",
              "marketing",
            ] as AdminModule[]
          ).find((x) => canAccessModule(data.admin.role, roleNames, x));

          if (first) {
            setTab(first);
          }
        }
      } catch (e) {
        console.error("[Admin]", e);

        if (mounted) {
          setError(e instanceof Error ? e.message : "Unable to load admin.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     AUTH / REALTIME AUTH
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const auth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted && session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
    };

    void auth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
    });

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     NOTIFICATION SOUND
  ======================================================= */

  useEffect(() => {
    const audio = new Audio("/sounds/new-order.mp3");

    audio.preload = "auto";

    audio.volume = 1;

    audioRef.current = audio;

    const unlock = async () => {
      if (audioUnlocked.current) {
        return;
      }

      try {
        audio.muted = true;

        await audio.play();

        audio.pause();

        audio.currentTime = 0;

        audio.muted = false;

        audioUnlocked.current = true;
      } catch {}

      window.removeEventListener("click", unlock);

      window.removeEventListener("touchstart", unlock);

      window.removeEventListener("keydown", unlock);
    };

    ["click", "touchstart", "keydown"].forEach((event) =>
      window.addEventListener(event, unlock),
    );

    return () => {
      ["click", "touchstart", "keydown"].forEach((event) =>
        window.removeEventListener(event, unlock),
      );

      audio.pause();

      audioRef.current = null;

      audioUnlocked.current = false;
    };
  }, []);

  /* =======================================================
     PLAY SOUND
  ======================================================= */

  const playSound = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !audioUnlocked.current) {
      return;
    }

    try {
      audio.pause();

      audio.currentTime = 0;

      await audio.play();
    } catch {}
  }, []);

  /* =======================================================
     ANDROID BACK BUTTON
  ======================================================= */

  useEffect(() => {
    if (!isAndroidApp) {
      return;
    }

    let listener:
      | {
          remove: () => void;
        }
      | undefined;

    (async () => {
      listener = await App.addListener("backButton", ({ canGoBack }) => {
        if (drawer) {
          setDrawer(false);

          return;
        }

        if (viewOrder) {
          setViewOrder(null);

          setAction(null);

          return;
        }

        if (tab !== "dashboard" && hasAccess("dashboard")) {
          setTab("dashboard");

          return;
        }

        if (canGoBack) {
          window.history.back();
        }
      });
    })();

    return () => {
      listener?.remove();
    };
  }, [isAndroidApp, drawer, viewOrder, tab, hasAccess]);

  /* =======================================================
     ORDERS REALTIME
  ======================================================= */

  useEffect(() => {
    if (loading || !admin || !hasAccess("orders")) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        if (realtimeStarted.current) {
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token || cancelled) {
          return;
        }

        supabase.realtime.setAuth(session.access_token);

        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
        }

        realtimeStarted.current = true;

        const channel = supabase
          .channel("admin-orders-realtime")
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

              addNotification(payload.new as NotificationOrder);

              await playSound();
            },
          )
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

              const order = payload.new as NotificationOrder;

              if (REMOVE.includes(String(order.status ?? "").toLowerCase())) {
                removeNotification(order.id);
              }
            },
          );

        channelRef.current = channel;

        channel.subscribe((status) => {
          if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
            realtimeStarted.current = false;
          }
        });
      } catch (e) {
        console.error("[Realtime]", e);

        realtimeStarted.current = false;
      }
    })();

    return () => {
      cancelled = true;

      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);

        channelRef.current = null;
      }

      realtimeStarted.current = false;
    };
  }, [
    loading,
    admin,
    roles,
    superAdmin,
    hasAccess,
    addNotification,
    playSound,
    removeNotification,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen animate-pulse bg-[#F8FAFC]">
        {isBrowser && (
          <div
            className={`
              fixed
              inset-y-0
              left-0
              hidden
              border-r
              border-gray-100
              bg-white
              p-4
              lg:block
              transition-[width]
              duration-300
              ${sidebarCollapsed ? "w-[76px]" : "w-64"}
            `}
          >
            <div
              className={
                sidebarCollapsed
                  ? "mx-auto h-10 w-10 rounded-xl bg-gray-200"
                  : "h-8 w-32 rounded-lg bg-gray-200"
              }
            />

            <div className="mt-8 h-16 rounded-xl bg-gray-100" />

            <div className="mt-6 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-11 rounded-xl bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        <div
          className={`
            transition-[margin-left,width]
            duration-300
            ease-in-out
            ${
              isBrowser
                ? sidebarCollapsed
                  ? "lg:ml-[76px] lg:w-[calc(100%-76px)]"
                  : "lg:ml-64 lg:w-[calc(100%-16rem)]"
                : "w-full"
            }
          `}
        >
          {isBrowser && (
            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
              <div className="h-5 w-28 rounded bg-gray-200" />

              <div className="h-9 w-9 rounded-full bg-gray-200" />
            </header>
          )}

          <main className="space-y-5 p-4 sm:p-6 lg:p-7">
            <div>
              <div className="h-7 w-40 rounded-lg bg-gray-200" />

              <div className="mt-2 h-4 w-56 rounded bg-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 bg-white p-4"
                >
                  <div className="h-9 w-9 rounded-xl bg-gray-100" />

                  <div className="mt-4 h-6 w-20 rounded bg-gray-200" />

                  <div className="mt-2 h-3 w-28 rounded bg-gray-100" />
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 bg-white p-5"
                >
                  <div className="h-5 w-32 rounded bg-gray-200" />

                  <div className="mt-5 space-y-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gray-100" />

                        <div className="flex-1">
                          <div className="h-3 w-32 rounded bg-gray-200" />

                          <div className="mt-2 h-2.5 w-20 rounded bg-gray-100" />
                        </div>

                        <div className="h-6 w-14 rounded-full bg-gray-100" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-64 rounded-2xl border border-gray-100 bg-white p-5">
              <div className="h-5 w-36 rounded bg-gray-200" />

              <div className="mt-6 h-44 rounded-xl bg-gray-100" />
            </div>
          </main>
        </div>

        {isAndroidApp && !keyboardOpen && (
          <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-gray-100 bg-white" />
        )}
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h1 className="mt-4 text-lg font-black text-[#0F172A]">
            Unable to load Admin Panel
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            {error || "Admin profile could not be found."}
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     VISIBLE NAVIGATION
  ======================================================= */

  const visible = NAV.filter((item) => hasAccess(item.id));

  /* =======================================================
     NAV BUTTON
  ======================================================= */

  const navButton = (item: (typeof NAV)[number], mobile = false) => {
    const Icon = item.icon;

    const active = tab === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          setTab(item.id);

          setDrawer(false);
        }}
        className={
          mobile
            ? `
              flex
              min-w-0
              flex-1
              flex-col
              items-center
              justify-center
              gap-0.5
              px-0.5
              text-[9px]
              font-semibold
              leading-none
              ${active ? "text-[#FF5C39]" : "text-[#94A3B8]"}
            `
            : `
              flex
              min-h-10
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2
              text-left
              text-sm
              font-semibold
              ${
                active
                  ? "bg-[#FF5C39] text-white shadow-sm"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }
            `
        }
      >
        {mobile ? (
          <>
            <div
              className={`
                flex
                h-7
                w-11
                items-center
                justify-center
                rounded-xl
                ${active ? "bg-orange-50" : ""}
              `}
            >
              <Icon className="h-[18px] w-[18px]" />
            </div>

            <span className="truncate">
              {item.label === "Dashboard" ? "Home" : item.label}
            </span>
          </>
        ) : (
          <>
            <Icon className="h-5 w-5 shrink-0" />

            <span className="truncate">{item.label}</span>
          </>
        )}
      </button>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC]">
      {/* =================================================
          NEW ORDER NOTIFICATIONS
      ================================================= */}

      {notifications.length > 0 && (
        <div className="fixed right-3 top-3 z-[100] flex w-[calc(100%-1.5rem)] max-w-[380px] flex-col gap-2 pt-10 sm:right-5 sm:top-5">
          {notifications.map((order) => (
            <NewOrderNotification
              key={String(order.id)}
              order={order}
              onClose={() => removeNotification(order.id)}
              onView={() => openOrder(order, "view")}
              onAccept={() => openOrder(order, "accept")}
              onReject={() => openOrder(order, "reject")}
            />
          ))}
        </div>
      )}

      {/* =================================================
          BROWSER MOBILE HEADER
          ONLY WEB
      ================================================= */}

      {isBrowser && (
        <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
              <ShieldCheck className="h-4 w-4 text-[#FF5C39]" />
            </div>

            <div>
              <p className="text-sm font-black text-[#0F172A]">Workkerz</p>

              <p className="text-[10px] text-[#94A3B8]">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="max-w-[150px] truncate text-xs font-bold">
                {admin.full_name}
              </p>

              <p className="text-[10px] text-[#64748B]">
                {superAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
              <ShieldCheck className="h-4 w-4 text-[#FF5C39]" />
            </div>

            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC]"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}

      {/* =================================================
          DRAWER BACKDROP
      ================================================= */}

      {drawer && isBrowser && (
        <div
          onClick={() => setDrawer(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* =================================================
          MOBILE DRAWER
      ================================================= */}

      <aside
        className={`
          fixed
          inset-x-0
          bottom-0
          z-[60]
          flex
          h-[50dvh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-[24px]
          border-t
          border-slate-200
          bg-[#F8FAFC]
          shadow-[0_-15px_40px_rgba(15,23,42,0.15)]
          transition-transform
          duration-300
          ease-out
          lg:hidden
          ${drawer ? "translate-y-0" : "pointer-events-none translate-y-full"}
        `}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
              <ShieldCheck className="h-5 w-5 text-[#FF5C39]" />

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-slate-900">
                {admin.full_name}
              </p>

              <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-400">
                {admin.email}
              </p>
            </div>

            <span
              className={`
                shrink-0
                rounded-lg
                px-2
                py-1
                text-[8px]
                font-bold
                ${
                  superAdmin
                    ? "bg-purple-50 text-purple-600"
                    : "bg-blue-50 text-blue-600"
                }
              `}
            >
              {superAdmin ? "SUPER" : "ADMIN"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDrawer(false)}
            aria-label="Close menu"
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 active:scale-95"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            {visible.map((item) => navButton(item))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
          <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[10px] font-semibold text-slate-500">
              System operational
            </span>
          </div>
        </div>
      </aside>

      {/* =================================================
          DESKTOP SIDEBAR — WEBSITE ONLY
      ================================================= */}

      {isBrowser && (
        <aside
          className={`
      fixed
      inset-y-0
      left-0
      z-40
      hidden
      flex-col
      border-r
      border-gray-100
      bg-white
      transition-[width]
      duration-300
      ease-in-out
      lg:flex
      ${sidebarCollapsed ? "w-19" : "w-64"}
    `}
        >
          {/* =====================================================
        HEADER
    ===================================================== */}

          <div
            className={`
        flex
        h-20
        shrink-0
        items-center
        border-b
        border-gray-100
        transition-all
        duration-300
        ${sidebarCollapsed ? "justify-center px-2" : "px-5"}
      `}
          >
            {sidebarCollapsed ? (
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <img
                  src="/icon.jpeg"
                  alt="Workkerz"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <img
                    src="/icon.jpeg"
                    alt="Workkerz"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-black text-[#0F172A]">
                    Workkerz
                  </h1>

                  <p className="text-xs text-[#94A3B8]">Admin Panel</p>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================
        ADMIN PROFILE
    ===================================================== */}

          <div
            className={`
    shrink-0
    transition-all
    duration-300
    ${sidebarCollapsed ? "px-2 pt-4" : "px-4 pt-4"}
  `}
          >
            {sidebarCollapsed ? (
              <div
                className="flex justify-center"
                title={`${admin.full_name} • ${
                  superAdmin ? "Super Admin" : "Admin"
                }`}
              >
                {admin.avatar_url ? (
                  <img
                    src={admin.avatar_url}
                    alt={admin.full_name}
                    className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-sm font-black text-[#64748B]">
                    {admin.full_name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-3">
                <div className="flex items-center gap-3">
                  {admin.avatar_url ? (
                    <img
                      src={admin.avatar_url}
                      alt={admin.full_name}
                      className="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-black text-[#64748B]">
                      {admin.full_name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#0F172A]">
                      {admin.full_name}
                    </p>

                    <p className="truncate text-xs text-[#64748B]">
                      {admin.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`
          mt-3
          inline-flex
          rounded-full
          px-2.5
          py-1
          text-[10px]
          font-bold
          ${
            superAdmin
              ? "bg-purple-50 text-purple-700"
              : "bg-blue-50 text-blue-700"
          }
        `}
                >
                  {superAdmin ? "Super Admin" : "Admin"}
                </span>
              </div>
            )}
          </div>

          {/* =====================================================
    NAVIGATION
===================================================== */}

          <nav
            className={`
    flex-1
    overflow-y-auto
    transition-all
    duration-300
    ${sidebarCollapsed ? "p-2" : "px-4 py-3"}
  `}
          >
            <div className="space-y-1">
              {visible.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setDrawer(false);
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                    aria-label={item.label}
                    className={`
            group
            flex
            min-h-10
            w-full
            items-center
            border-0
            bg-transparent
            outline-none
            transition-all
            duration-200
            ${
              sidebarCollapsed
                ? "justify-center px-2"
                : "justify-start gap-3 px-3 py-2"
            }
          `}
                  >
                    <Icon
                      className={`
              h-5
              w-5
              shrink-0
              transition-all
              duration-200
              ${
                active
                  ? "scale-110 text-[#FF5C39]"
                  : "text-[#64748B] group-hover:text-[#FF5C39]"
              }
            `}
                    />

                    {!sidebarCollapsed && (
                      <span
                        className={`
                min-w-0
                flex-1
                truncate
                text-left
                text-sm
                font-semibold
                transition-colors
                duration-200
                ${
                  active
                    ? "text-[#FF5C39]"
                    : "text-[#64748B] group-hover:text-[#0F172A]"
                }
              `}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
          {/* =====================================================
        COLLAPSE / EXPAND ARROW
    ===================================================== */}

          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="
        absolute
        -right-3
        top-[76px]
        z-50
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-full
        border
        border-gray-200
        bg-white
        text-[#64748B]
        shadow-md
        transition-all
        duration-200
        hover:scale-105
        hover:bg-gray-50
        hover:text-[#FF5C39]
        active:scale-95
      "
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </aside>
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className={`
          min-h-screen
          bg-[#F8FAFC]
          transition-[margin-left,width]
          duration-300
          ease-in-out
          ${
            isAndroidApp
              ? "w-full pb-[calc(60px+env(safe-area-inset-bottom))]"
              : sidebarCollapsed
                ? "lg:ml-[76px] lg:w-[calc(100%-76px)] lg:pb-0"
                : "lg:ml-64 lg:w-[calc(100%-16rem)] lg:pb-0"
          }
        `}
      >
        {/* =================================================
            WEB MOBILE HEADER SPACE
        ================================================= */}

        {isBrowser && <div className="h-16 lg:hidden" />}

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {tab === "dashboard" && hasAccess("dashboard") && (
          <DashboardTab
            onNavigate={(nextTab) => {
              const target = nextTab as AdminModule;

              if (hasAccess(target)) {
                setTab(target);

                setDrawer(false);
              }
            }}
          />
        )}

        {/* =================================================
            WORKERS
        ================================================= */}

        {tab === "workers" && hasAccess("workers") && (
          <WorkersTab onFormOpenChange={setWorkerFormOpen} />
        )}

        {/* =================================================
            WORKER REQUESTS
        ================================================= */}

        {tab === "worker-requests" && hasAccess("worker-requests") && (
          <WorkerRequestsTab device={isAndroidApp ? "mobile" : "desktop"} />
        )}

        {/* =================================================
            ORDERS
        ================================================= */}

        {tab === "orders" && hasAccess("orders") && (
          <OrdersTab
            notificationOrder={viewOrder}
            notificationAction={action}
            notificationOpenKey={openKey}
            onNotificationHandled={() => {
              setViewOrder(null);

              setAction(null);
            }}
            onNotificationStatusChanged={removeNotification}
          />
        )}

        {/* =================================================
            SHOPS
        ================================================= */}

        {tab === "shops" && hasAccess("shops") && <ShopsTab />}

        {/* =================================================
            BOOKINGS
        ================================================= */}

        {tab === "bookings" && hasAccess("bookings") && <BookingsTab />}

        {/* =================================================
            MARKETING
        ================================================= */}

        {tab === "marketing" && hasAccess("marketing") && <MarketingTab />}

        {/* =================================================
            ADMINS
        ================================================= */}

        {tab === "admins" && hasAccess("admins") && <AdminsTab />}
      </main>

      {/* =================================================
          ANDROID APP BOTTOM NAV
          ONLY NATIVE ANDROID
      ================================================= */}

      {isAndroidApp && !workerFormOpen && !keyboardOpen && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:max-lg:inset-x-6 md:max-lg:bottom-3 md:max-lg:rounded-2xl md:max-lg:border md:max-lg:shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
          <div className="grid h-15 w-full grid-cols-5 px-1 md:max-lg:px-8">
            {(["dashboard", "workers", "orders", "bookings"] as AdminModule[])
              .map((id) => visible.find((item) => item.id === id))
              .filter(Boolean)
              .map((item) => navButton(item!, true))}

            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-[#94A3B8]"
            >
              <div className="flex h-8 w-12 items-center justify-center rounded-2xl">
                <Menu className="h-5 w-5" />
              </div>

              <span>More</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
