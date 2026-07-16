"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import {
  Menu,
  X,
  Briefcase,
  Bell,
  ShoppingCart,
  Heart,
  Zap,
  Calendar,
  LogIn,
  CreditCard,
  Package,
} from "lucide-react";
import { usePlatform } from "./context/PlatformContext";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { platform, setPlatform, cartCount } = usePlatform();
  const { user } = useAuth();
  const isEaurix = platform === "eaurix";

  const workkezLinks = [
    {
      label: "Favorites",
      href: "/favorites",
      icon: Heart,
    },
    {
      label: "Quick Service",
      href: "/quick-services",
      icon: Zap,
    },
    {
      label: "Bookings",
      href: "/bookings",
      icon: Calendar,
    },
  ];

  const eaurixLinks = [
    {
      label: "Add to Cart",
      href: "/eaurix/cart",
      icon: ShoppingCart,
    },
    {
      label: "Buy Now",
      href: "/eaurix/shop",
      icon: CreditCard,
    },
    {
      label: "Orders",
      href: "/eaurix/orders",
      icon: Package,
    },
    {
      label: "Sign In",
      href: "/login",
      icon: LogIn,
    },
  ];

  const navLinks = isEaurix ? eaurixLinks : workkezLinks;

  const handleToggle = (p: "workkerz" | "eaurix") => {
    setPlatform(p);
    if (p === "eaurix") router.push("/eaurix");
    else router.push("/");
    setMobileOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm transition-colors duration-300 mt-30"
      style={{
        backgroundColor: isEaurix ? "#ffffff" : "#ffffff",
        borderColor: isEaurix ? "rgba(14,165,233,0.2)" : "#F1F5F9",
      }}
    >
      <div className="max-w-360 mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-28 h-8 sm:w-36 sm:h-10 md:w-44 md:h-12 overflow-hidden">
            <img
              src="/WORKKERZ (1).png"
              alt="Workkerz Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>
        {/* Platform Toggle — centered */}{" "}
        <div
          className="hidden md:flex items-center p-1 rounded-xl border"
          style={{
            backgroundColor: isEaurix ? "rgba(14,165,233,0.1)" : "#F8FAFC",
            borderColor: isEaurix ? "rgba(14,165,233,0.25)" : "#E2E8F0",
          }}
        >
          {" "}
          {/* Workkerz */}{" "}
          <button
            onClick={() => handleToggle("workkerz")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all duration-200"
            style={{
              fontWeight: 700,
              backgroundColor: !isEaurix ? "#FF5C39" : "transparent",
              color: !isEaurix ? "#ffffff" : "#94A3B8",
              boxShadow: !isEaurix ? "0 2px 8px rgba(255,92,57,0.35)" : "none",
            }}
          >
            {" "}
            <img
              src="/workkerzapp.png"
              alt="Workkerz"
              className="w-6 h-6 rounded-full object-cover"
            />{" "}
            Workkerz{" "}
          </button>{" "}
          {/* E-Aurix */}{" "}
          <button
            onClick={() => handleToggle("eaurix")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all duration-200"
            style={{
              fontWeight: 700,
              backgroundColor: isEaurix ? "#0EA5E9" : "transparent",
              color: isEaurix ? "#FF5C39" : "#94A3B8",
              boxShadow: isEaurix ? "0 2px 8px rgba(14,165,233,0.4)" : "none",
            }}
          >
            {" "}
            <img
              src="/aurixapp.png"
              alt="E-Aurix"
              className="w-6 h-6 rounded-full object-cover"
            />{" "}
            E-Aurix{" "}
          </button>{" "}
        </div>
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center gap-2 min-w-162.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`
          group flex items-center gap-2
          px-4 py-2.5 rounded-xl
          text-sm font-semibold
          transition-all duration-300
          ${
            isActive
              ? isEaurix
                ? "bg-sky-50 text-sky-600 shadow-sm"
                : "bg-orange-50 text-[#FF5C39] shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
        `}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />

                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:bg-slate-100 px-3 py-2 rounded-xl transition"
            >
              <img
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="User"
                className="w-10 h-10 rounded-full border object-cover"
              />

              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">
                  {user.user_metadata?.full_name}
                </p>

                <p className="text-xs text-slate-500">Dashboard</p>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#FF5C39] text-white"
            >
              Sign In
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {/* MOBILE PLATFORM TOGGLE */}
          <div className="hidden md:hidden sm:flex items-center bg-[#F8FAFC] border border-gray-200 rounded-full p-1 shadow-sm">
            {/* WORKKERZ */}
            <button
              onClick={() => handleToggle("workkerz")}
              className={`h-10 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${
                !isEaurix
                  ? "bg-[#0F172A] text-white shadow-md"
                  : "text-[#64748B]"
              }`}
            >
              <img
                src="/workkerzapp.png"
                alt="Workkerz"
                className="w-5 h-5 rounded-full object-cover"
              />

              <span className="text-[12px] font-bold whitespace-nowrap">
                Workkerz
              </span>
            </button>

            {/* E-AURIX */}
            <button
              onClick={() => handleToggle("eaurix")}
              className={`h-10 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${
                isEaurix
                  ? "bg-[#0EA5E9] text-white shadow-md"
                  : "text-[#64748B]"
              }`}
            >
              <img
                src="/aurixapp.png"
                alt="E-Aurix"
                className="w-5 h-5 rounded-full object-cover"
              />

              <span className="text-[12px] font-bold whitespace-nowrap">
                E-Aurix
              </span>
            </button>
          </div>

          {user ? (
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-full overflow-hidden border border-slate-200"
            >
              <img
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          )}
          {/* CART */}
          {isEaurix && (
            <Link
              href="/eaurix/cart"
              className="relative w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ color: "#94A3B8" }}
            >
              <ShoppingCart className="w-5 h-5" />

              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center text-[10px]"
                  style={{ fontWeight: 800 }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* MENU BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: isEaurix ? "#94A3B8" : "#6B7280" }}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-6 py-4 space-y-1"
          style={{
            backgroundColor: isEaurix ? "#0C1A2E" : "#ffffff",
            borderColor: isEaurix ? "rgba(14,165,233,0.15)" : "#F1F5F9",
          }}
        >
          {/* Mobile Platform Toggle */}
          <div
            className="flex items-center p-1 rounded-xl border mb-4"
            style={{
              borderColor: isEaurix ? "rgba(14,165,233,0.25)" : "#E2E8F0",
              backgroundColor: isEaurix ? "rgba(14,165,233,0.08)" : "#F8FAFC",
            }}
          >
            <button
              onClick={() => handleToggle("workkerz")}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all"
              style={{
                fontWeight: 700,
                backgroundColor: !isEaurix ? "#FF5C39" : "transparent",
                color: !isEaurix ? "#fff" : "#94A3B8",
              }}
            >
              <Briefcase className="w-3.5 h-3.5" /> Workkerz
            </button>
            <button
              onClick={() => handleToggle("eaurix")}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all"
              style={{
                fontWeight: 700,
                backgroundColor: isEaurix ? "#0EA5E9" : "transparent",
                color: isEaurix ? "#fff" : "#94A3B8",
              }}
            >
              <Zap className="w-3.5 h-3.5" /> E-Aurix
            </button>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: isEaurix ? "#94A3B8" : "#475569" }}
            >
              {link.label}
            </Link>
          ))}
          <div
            className="pt-3 border-t flex flex-col gap-2"
            style={{
              borderColor: isEaurix ? "rgba(14,165,233,0.15)" : "#F1F5F9",
            }}
          >
            {isEaurix ? (
              <>
                <button
                  className="text-sm text-center py-2.5 rounded-lg"
                  style={{ color: "#94A3B8" }}
                >
                  Sign In
                </button>
                <Link
                  href="/eaurix/shop"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-center text-white py-2.5 rounded-lg"
                  style={{ fontWeight: 600, backgroundColor: "#0EA5E9" }}
                >
                  Shop Now
                </Link>
              </>
            ) : (
              <>
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 border rounded-xl p-3"
                  >
                    <img
                      src={
                        user.user_metadata?.avatar_url || "/default-avatar.png"
                      }
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />

                    <div>
                      <p className="font-semibold">
                        {user.user_metadata?.full_name}
                      </p>

                      <p className="text-xs text-slate-500">Open Dashboard</p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm text-center border px-4 py-2.5 rounded-lg"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  href="/browse"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-center text-white bg-[#FF5C39] px-4 py-2.5 rounded-lg"
                  style={{ fontWeight: 600 }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
