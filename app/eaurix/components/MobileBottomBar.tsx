"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Package,
  User,
  Bell,
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

import { supabase } from "@/lib/supabase";
import { usePlatform } from "../../components/context/PlatformContext";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { cart } = usePlatform();

  const cartCount = cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const hideBottomBar =
    pathname.startsWith("/eaurix/cart");

  // --------------------------
  // Mounted
  // --------------------------

  useEffect(() => {
    setMounted(true);
  }, []);

  // --------------------------
  // Scroll
  // --------------------------

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      // Top pe hamesha show
      if (currentY < 50) {
        setVisible(true);
      } else if (currentY > lastScrollY) {
        // Scroll Down
        setVisible(false);
      } else {
        // Scroll Up
        setVisible(true);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, [lastScrollY]);

  // --------------------------
  // Load User
  // --------------------------

  useEffect(() => {
    const loadUser = async () => {
      const { data } =
        await supabase.auth.getUser();

      setUser(data.user);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () =>
      subscription.unsubscribe();
  }, []);

  // --------------------------
  // Notifications
  // --------------------------

  useEffect(() => {
    let active = true;

    const loadUnreadNotifications =
      async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser =
          session?.user;

        if (!currentUser) {
          if (active) {
            setUnreadCount(0);
          }

          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("notifications")
          .select("id")
          .eq("is_read", false)
          .or(
            `user_id.eq.${currentUser.id},is_global.eq.true`
          );

        if (error) {
          console.error(
            "Unread notifications error:",
            error
          );

          return;
        }

        if (active) {
          setUnreadCount(
            data?.length ?? 0
          );
        }
      };

    loadUnreadNotifications();

    // Auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setUnreadCount(0);
          return;
        }

        loadUnreadNotifications();
      }
    );

    // Realtime notifications
    const channel = supabase
      .channel(
        "mobile-bottom-notifications"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadUnreadNotifications();
        }
      )
      .subscribe();

    return () => {
      active = false;
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // --------------------------
  // Keyboard
  // --------------------------

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let showListener: any;
    let hideListener: any;

    const setupKeyboard = async () => {
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
    };

    setupKeyboard();

    return () => {
      showListener?.remove?.();
      hideListener?.remove?.();
    };
  }, []);

  // --------------------------
  // User
  // --------------------------

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Profile";

  // --------------------------
  // Tabs
  // --------------------------

  type Tab = {
    label: string;
    href: string;
    icon: any;
    badge?: number;
  };

  const tabs: Tab[] = [
    {
      label: "Home",
      href: "/eaurix",
      icon: Home,
    },
    {
      label: "Cart",
      href: "/eaurix/cart",
      icon: ShoppingCart,
      badge: cartCount,
    },
    {
      label: "Orders",
      href: "/bookings?tab=orders",
      icon: Package,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    {
      label: user ? displayName : "Profile",
      href: "/dashboard",
      icon: User,
    },
  ];

  // --------------------------
  // Hide on Cart
  // --------------------------

  if (hideBottomBar) {
    return null;
  }

  // --------------------------
  // Render
  // --------------------------

  return (
    <nav
      className={`
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-gray-200
        bg-white/95
        backdrop-blur-md
        shadow-lg
        transition-transform
        duration-300
        ${
          keyboardOpen
            ? "hidden"
            : visible
              ? "translate-y-0"
              : "translate-y-full"
        }
      `}
    >
      <div
        className="
          flex
          h-20
          pb-[env(safe-area-inset-bottom)]
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active =
            tab.href === "/eaurix"
              ? pathname === "/eaurix"
              : tab.href ===
                  "/bookings?tab=orders"
                ? pathname === "/bookings"
                : pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                relative
                flex
                flex-1
                flex-col
                items-center
                justify-center
                gap-1
                py-1
                ${
                  active
                    ? "text-sky-600"
                    : "text-gray-500"
                }
              `}
            >
              {/* Profile Avatar */}
              {tab.href === "/dashboard" ? (
                avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className={`
                      h-7
                      w-7
                      rounded-full
                      border
                      object-cover
                      ${
                        active
                          ? "border-sky-500"
                          : "border-gray-300"
                      }
                    `}
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
                      border
                      bg-sky-100
                      text-sm
                      font-semibold
                      text-sky-600
                      ${
                        active
                          ? "border-sky-500"
                          : "border-gray-300"
                      }
                    `}
                  >
                    {displayName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )
              ) : (
                /* Normal Icon */
                <div className="relative">
                  <Icon
                    className={`
                      h-6
                      w-6
                      ${
                        active
                          ? "stroke-[2.5]"
                          : "stroke-[2]"
                      }
                    `}
                  />

                  {/* Badge */}
                  {mounted &&
                    tab.badge !==
                      undefined &&
                    tab.badge > 0 && (
                      <span
                        className="
                          absolute
                          -right-2
                          -top-2
                          flex
                          h-5
                          min-w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-red-500
                          px-1
                          text-[9px]
                          font-bold
                          leading-none
                          text-white
                          ring-2
                          ring-white
                        "
                      >
                        {tab.badge > 99
                          ? "99+"
                          : tab.badge}
                      </span>
                    )}
                </div>
              )}

              <span
                className="
                  max-w-20
                  truncate
                  text-[10px]
                  font-semibold

                  sm:text-[11px]
                "
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}