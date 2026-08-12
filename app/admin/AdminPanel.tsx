"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
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

type NotificationAction = "view" | "accept" | "reject" | null;

const REMOVE = [
  "accepted",
  "confirmed",
  "approved",
  "rejected",
  "cancelled",
  "canceled",
];

const NAV: {
  id: AdminModule;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "workers", label: "Workers", icon: Users },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "shops", label: "Shops", icon: Store },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "admins", label: "Admins", icon: ShieldCheck },
];

export default function AdminPanel() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [roles, setRoles] = useState<AdminSubRole[]>([]);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [tab, setTab] = useState<AdminModule>("dashboard");
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [android, setAndroid] = useState(false);

  const [notifications, setNotifications] = useState<NotificationOrder[]>([]);
  const notificationsRef = useRef<NotificationOrder[]>([]);
  const [viewOrder, setViewOrder] = useState<NotificationOrder | null>(null);
  const [action, setAction] = useState<NotificationAction>(null);
  const [openKey, setOpenKey] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const realtimeStarted = useRef(false);
  const [workerFormOpen, setWorkerFormOpen] = useState(false);
  const [shopProfileOpen, setShopProfileOpen] = useState(false);
  const hasAccess = useCallback(
    (module: AdminModule) =>
      !!admin &&
      (superAdmin ||
        (module !== "admins" && canAccessModule(admin.role, roles, module))),
    [admin, roles, superAdmin],
  );

  const removeNotification = useCallback((id: string | number) => {
    const next = notificationsRef.current.filter(
      (x) => String(x.id) !== String(id),
    );
    notificationsRef.current = next;
    setNotifications(next);
    setViewOrder((x) => (x && String(x.id) === String(id) ? null : x));
  }, []);

  const addNotification = useCallback((order: NotificationOrder) => {
    if (
      order?.id == null ||
      REMOVE.includes(
        String(order.status ?? "")
          .trim()
          .toLowerCase(),
      ) ||
      notificationsRef.current.some((x) => String(x.id) === String(order.id))
    )
      return;

    const next = [order, ...notificationsRef.current];
    notificationsRef.current = next;
    setNotifications(next);
  }, []);

  const openOrder = useCallback(
    (order: NotificationOrder, type: NotificationAction) => {
      if (order?.id == null) return;
      setViewOrder(order);
      setAction(type);
      setOpenKey((x) => x + 1);
      setTab("orders");
      setDrawer(false);
    },
    [],
  );

  useEffect(() => {
    setAndroid(
      Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android",
    );
  }, []);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    setDrawer(false);
  }, [tab]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!session?.access_token) {
          setError("Your admin session has expired.");
          return;
        }

        const res = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });

        const data: AdminMeResponse | { error: string } = await res.json();
        if (!mounted) return;

        if (!res.ok)
          throw new Error(
            "error" in data ? data.error : "Unable to load admin profile.",
          );
        if (!("admin" in data)) throw new Error("Invalid admin response.");

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
            ] as AdminModule[]
          ).find((x) => canAccessModule(data.admin.role, roleNames, x));
          if (first) setTab(first);
        }
      } catch (e) {
        console.error("[Admin]", e);
        if (mounted)
          setError(e instanceof Error ? e.message : "Unable to load admin.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const auth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted && session?.access_token)
        supabase.realtime.setAuth(session.access_token);
    };

    auth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.access_token)
        supabase.realtime.setAuth(session.access_token);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const audio = new Audio("/sounds/new-order.mp3");
    audio.preload = "auto";
    audio.volume = 1;
    audioRef.current = audio;

    const unlock = async () => {
      if (audioUnlocked.current) return;
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

    ["click", "touchstart", "keydown"].forEach((e) =>
      window.addEventListener(e, unlock),
    );

    return () => {
      ["click", "touchstart", "keydown"].forEach((e) =>
        window.removeEventListener(e, unlock),
      );
      audio.pause();
      audioRef.current = null;
      audioUnlocked.current = false;
    };
  }, []);

  const playSound = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audioUnlocked.current) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      await audio.play();
    } catch {}
  }, []);

  useEffect(() => {
    if (!android) return;

    let listener: any;

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
        if (canGoBack) window.history.back();
      });
    })();

    return () => {
      listener?.remove();
    };
  }, [android, drawer, viewOrder, tab, hasAccess]);

  useEffect(() => {
    if (loading || !admin || !hasAccess("orders")) return;

    let cancelled = false;

    (async () => {
      try {
        if (realtimeStarted.current) return;

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token || cancelled) return;

        supabase.realtime.setAuth(session.access_token);

        if (channelRef.current)
          await supabase.removeChannel(channelRef.current);

        realtimeStarted.current = true;

        const channel = supabase
          .channel("admin-orders-realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "orders" },
            async (payload) => {
              if (cancelled) return;
              addNotification(payload.new as NotificationOrder);
              await playSound();
            },
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "orders" },
            (payload) => {
              if (cancelled) return;
              const order = payload.new as NotificationOrder;
              if (REMOVE.includes(String(order.status ?? "").toLowerCase()))
                removeNotification(order.id);
            },
          );

        channelRef.current = channel;

        channel.subscribe((status) => {
          if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status))
            realtimeStarted.current = false;
        });
      } catch (e) {
        console.error("[Realtime]", e);
        realtimeStarted.current = false;
      }
    })();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
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

  if (loading)
    return (
      <div className="min-h-screen animate-pulse bg-[#F8FAFC]">
        <div className="hidden fixed inset-y-0 left-0 w-64 border-r border-gray-100 bg-white p-4 lg:block">
          <div className="h-8 w-32 rounded-lg bg-gray-200" />
          <div className="mt-8 h-16 rounded-xl bg-gray-100" />
          <div className="mt-6 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-11 rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>

        <div className="lg:ml-64">
          <header className="h-16 border-b border-gray-100 bg-white px-4 lg:h-20">
            <div className="flex h-full items-center justify-between">
              <div>
                <div className="h-5 w-28 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
              </div>
              <div className="h-9 w-9 rounded-full bg-gray-200" />
            </div>
          </header>

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

        <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-gray-100 bg-white lg:hidden" />
      </div>
    );

  if (error || !admin)
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

  const visible = NAV.filter((x) => hasAccess(x.id));
  const current = visible.find((x) => x.id === tab);

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
            ? `flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
                active ? "text-[#FF5C39]" : "text-[#94A3B8]"
              }`
            : `flex min-h-10.5 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                active
                  ? "bg-[#FF5C39] text-white shadow-sm"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`
        }
      >
        <div
          className={
            mobile
              ? `flex h-8 w-12 items-center justify-center rounded-2xl ${
                  active ? "bg-orange-50" : ""
                }`
              : ""
          }
        >
          <Icon className={mobile ? "h-5 w-5" : "h-5 w-5"} />
        </div>
        <span>
          {mobile
            ? item.label === "Dashboard"
              ? "Home"
              : item.label
            : item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC]">
      {notifications.length > 0 && (
        <div className="fixed right-3 top-3 z-100 flex w-[calc(100%-1.5rem)] max-w-95 flex-col gap-2 pt-10 sm:right-5 sm:top-5">
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

      {/* ANDROID HEADER */}
      {android && !shopProfileOpen && (
        <header className="fixed left-0 right-0 top-0 z-40 border-b border-gray-100 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 pt-2">
            <div>
              <p className="text-base font-black text-[#0F172A]">Workkerz</p>
              <p className="text-[10px] text-[#94A3B8]">Admin</p>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={() => openOrder(notifications[0], "view")}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-[#FF5C39]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5C39] px-1 text-[9px] font-bold text-white">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                </button>
              )}

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
                <ShieldCheck className="h-4 w-4 text-[#FF5C39]" />
              </div>

              <button
                onClick={() => setDrawer(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* NORMAL MOBILE HEADER */}
      {!android && !shopProfileOpen && (
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
              <p className="max-w-37.5 truncate text-xs font-bold">
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
              onClick={() => setDrawer(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC]"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}

      {/* DRAWER */}
      {drawer && (
        <div
          onClick={() => setDrawer(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-60 flex w-[min(86vw,320px)] pt-10 flex-col border-r border-gray-100 bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          drawer ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-4 pt-2">
          <div>
            <p className="text-base font-black text-[#0F172A]">Workkerz</p>
            <p className="text-[10px] text-[#94A3B8]">Admin Panel</p>
          </div>

          <button
            onClick={() => setDrawer(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 pt-3">
          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                <ShieldCheck className="h-5 w-5 text-[#FF5C39]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{admin.full_name}</p>
                <p className="truncate text-xs text-[#64748B]">{admin.email}</p>
              </div>
            </div>

            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                superAdmin
                  ? "bg-purple-50 text-purple-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {superAdmin ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">{visible.map((x) => navButton(x))}</div>
        </nav>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-gray-100 px-6">
          <div>
            <h1 className="text-xl font-black text-[#0F172A]">Workkerz</h1>
            <p className="text-xs text-[#94A3B8]">Admin Panel</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
                <ShieldCheck className="h-4 w-4 text-[#FF5C39]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{admin.full_name}</p>
                <p className="truncate text-xs text-[#64748B]">{admin.email}</p>
              </div>
            </div>

            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                superAdmin
                  ? "bg-purple-50 text-purple-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {superAdmin ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">{visible.map((x) => navButton(x))}</div>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="min-h-screen w-full bg-[#F8FAFC] pb-20 lg:ml-64 lg:w-[calc(100%-16rem)] lg:pb-0">
        {!shopProfileOpen &&
          (android ? (
            <div className="h-14.5 lg:hidden" />
          ) : (
            <div className="h-16 lg:hidden" />
          ))}

        {tab === "dashboard" && hasAccess("dashboard") && <DashboardTab />}

        {tab === "workers" && hasAccess("workers") && (
          <WorkersTab onFormOpenChange={setWorkerFormOpen} />
        )}

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

        {tab === "shops" && hasAccess("shops") && (
          <ShopsTab onShopProfileChange={setShopProfileOpen} />
        )}

        {tab === "bookings" && hasAccess("bookings") && <BookingsTab />}

        {tab === "admins" && hasAccess("admins") && <AdminsTab />}
      </main>

      {/* ANDROID BOTTOM NAV */}
      {android && !workerFormOpen && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid h-16 max-w-md grid-cols-5">
            {(["dashboard", "workers", "orders", "bookings"] as AdminModule[])
              .map((id) => visible.find((x) => x.id === id))
              .filter(Boolean)
              .map((x) => navButton(x!, true))}

            <button
              onClick={() => setDrawer(true)}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-[#94A3B8]"
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
