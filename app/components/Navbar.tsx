"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Menu,
  X,
  Briefcase,
  Bell,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { usePlatform } from "./context/PlatformContext";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { platform, setPlatform, cartCount } = usePlatform();

  const isEaurix = platform === "eaurix";

  const workkezLinks = [
  { label: "Book Workers", href: "/browse" },
  { label: "Buy Material", href: "/eaurix/shop" },
  { label: "Quick Service", href: "/quick-services" },
  { label: "Become Worker", href: "/become-worker" },
  { label: "Become Seller", href: "/become-seller" },
];

  const eaurixLinks = [
    { label: "Shop All", href: "/eaurix/shop" },
    { label: "Masonry", href: "/eaurix/shop?category=masonry" },
    { label: "Plumbing", href: "/eaurix/shop?category=plumbing" },
    { label: "Electrical", href: "/eaurix/shop?category=electrical" },
    { label: "Tools", href: "/eaurix/shop?category=tools" },
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
      className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm transition-colors duration-300"
      style={{
        backgroundColor: isEaurix ? "#ffffff" : "#ffffff",
        borderColor: isEaurix ? "rgba(14,165,233,0.2)" : "#F1F5F9",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
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

        {/* Platform Toggle — centered */}
        <div
          className="hidden md:flex items-center p-1 rounded-xl border"
          style={{
            backgroundColor: isEaurix ? "rgba(14,165,233,0.1)" : "#F8FAFC",
            borderColor: isEaurix ? "rgba(14,165,233,0.25)" : "#E2E8F0",
          }}
        >
          {/* Workkerz */}
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
            <img
              src="/workkerzapp.png"
              alt="Workkerz"
              className="w-6 h-6 rounded-full object-cover"
            />
            Workkerz
          </button>

          {/* E-Aurix */}
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
            <img
              src="/aurixapp.png"
              alt="E-Aurix"
              className="w-6 h-6 rounded-full object-cover"
            />
            E-Aurix
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                color: isEaurix
                  ? pathname === link.href
                    ? "#38BDF8"
                    : "#94A3B8"
                  : pathname === link.href
                    ? "#FF5C39"
                    : "#475569",
                backgroundColor:
                  pathname === link.href
                    ? isEaurix
                      ? "rgba(14,165,233,0.1)"
                      : "#FFF5F3"
                    : "transparent",
                fontWeight: pathname === link.href ? 600 : 400,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isEaurix ? (
            <>
              <Link
                href="/eaurix/cart"
                className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{
                  color: "#94A3B8",
                  backgroundColor: "rgba(14,165,233,0.1)",
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white rounded-full flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: "#0EA5E9", fontWeight: 800 }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
              <button
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: "#94A3B8", fontWeight: 500 }}
              >
                Sign In
              </button>
              <Link
                href="/eaurix/shop"
                className="text-sm text-white px-5 py-2 rounded-lg transition-colors shadow-lg shadow-sky-900/30"
                style={{ fontWeight: 600, backgroundColor: "#0EA5E9" }}
              >
                Shop Now
              </Link>
            </>
          ) : (
            <>
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5C39] rounded-full" />
              </button>
              <Link
                href="/login"
                className="text-sm text-[#475569] hover:text-[#0F172A] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/browse"
                className="text-sm text-white bg-[#FF5C39] hover:bg-[#e54e2e] px-5 py-2 rounded-lg transition-colors"
                style={{ fontWeight: 600 }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger + cart */}
        {/* MOBILE RIGHT SECTION */}
        <div className="flex items-center gap-2 md:hidden">
          {/* MOBILE TOGGLE OUTSIDE */}
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
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-center text-[#475569] border border-gray-200 px-4 py-2.5 rounded-lg"
                >
                  Sign In
                </Link>
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
