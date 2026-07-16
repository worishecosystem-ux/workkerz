"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, User, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

export default function MobileAppNavbar() {
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // --------------------------
  // Logged in User
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
  // Keyboard Detect
  // --------------------------

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let showListener: any;
    let hideListener: any;

    const setupKeyboard = async () => {
      try {
        showListener = await Keyboard.addListener("keyboardDidShow", () => {
          setKeyboardOpen(true);
        });

        hideListener = await Keyboard.addListener("keyboardDidHide", () => {
          setKeyboardOpen(false);
        });
      } catch (err) {
        console.log("Keyboard plugin unavailable:", err);
      }
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
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Profile";

  const tabs = [
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
      label: "Track Status",
      href: "/bookings",
      icon: Calendar,
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
        fixed
        bottom-0
        left-0
        right-0
        z-50
        bg-white/95
        backdrop-blur-md
        border-t
        border-gray-200
        shadow-lg
        transition-all
        duration-300
        ${keyboardOpen ? "hidden" : "block"}
      `}
    >
      <div className="grid grid-cols-4 h-20 ">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex
                flex-col
                items-center
                justify-center
                gap-1
                transition-all
                ${active ? "text-[#FF5C39]" : "text-gray-500"}
              `}
            >
              {tab.href === "/dashboard" ? (
                avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    className={`
        w-6
        h-6
        rounded-full
        object-cover
        border
        ${active ? "border-[#FF5C39]" : "border-gray-300"}
      `}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className={`
        w-8
        h-8
        rounded-full
        flex
        items-center
        justify-center
        bg-orange-100
        text-orange-600
        font-semibold
        text-sm
        border-2
        ${active ? "border-[#FF5C39]" : "border-gray-300"}
      `}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )
              ) : (
                <Icon className="w-6 h-6" />
              )}

              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
