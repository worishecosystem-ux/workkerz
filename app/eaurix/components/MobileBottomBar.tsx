"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Package, User } from "lucide-react";
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

  const [user, setUser] = useState<any>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // --------------------------
  // Load User
  // --------------------------
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --------------------------
  // Keyboard
  // --------------------------
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let showListener: any;
    let hideListener: any;

    const setupKeyboard = async () => {
      showListener = await Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardOpen(true);
      });

      hideListener = await Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardOpen(false);
      });
    };

    setupKeyboard();

    return () => {
      showListener?.remove?.();
      hideListener?.remove?.();
    };
  }, []);

  const avatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Profile";

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
      label: user ? displayName : "Profile",
      href: "/dashboard",
      icon: User,
    },
  ];

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        border-t border-gray-200
        bg-white/95 backdrop-blur-md
        shadow-lg transition-all duration-300
        ${keyboardOpen ? "hidden" : "block"}
      `}
    >
      <div className="grid h-20 grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active =
            pathname === tab.href ||
            pathname.startsWith(tab.href + "/") ||
            (tab.href.includes("?tab=orders") &&
              pathname === "/bookings");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-sky-600" : "text-gray-500"
                }`}
            >
              {tab.href === "/dashboard" ? (
                avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className={`h-7 w-7 rounded-full border object-cover ${active ? "border-sky-500" : "border-gray-300"
                      }`}
                  />
                ) : (
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border bg-sky-100 text-sm font-semibold text-sky-600 ${active ? "border-sky-500" : "border-gray-300"
                      }`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )
              ) : (
                <div className="relative">
                  <Icon className="h-6 w-6" />

                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </div>
              )}

              <span className="max-w-16 truncate text-[11px] font-semibold">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}