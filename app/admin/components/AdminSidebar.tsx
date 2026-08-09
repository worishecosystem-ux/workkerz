"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Sparkles,
  Lock,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import Link from "next/link";

// LOGIN IDS
const ADMIN_ID = "admin";
const ADMIN_PASS = "1234";

type AdminSidebarProps = {
  tab: string;
  setTab: (tab: string) => void;
  sidebarItems: any[];
};

export default function AdminSidebar({
  tab,
  setTab,
  sidebarItems,
}: AdminSidebarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // CHECK LOGIN
  useEffect(() => {
    const savedLogin = localStorage.getItem("workkerz-admin-login");

    if (savedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // LOGIN
  const handleLogin = () => {
    if (adminId === ADMIN_ID && password === ADMIN_PASS) {
      localStorage.setItem("workkerz-admin-login", "true");
      setIsLoggedIn(true);
    } else {
      alert("Invalid ID or Password");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("workkerz-admin-login");
    setIsLoggedIn(false);
    setMobileOpen(false);
  };

  // CHANGE TAB
  const handleTabChange = (id: string) => {
    setTab(id);
    setMobileOpen(false);
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-[430px]">
          {/* LOGIN CARD */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-slate-200/60 p-5 sm:p-7 md:p-8">
            {/* LOGO */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg">
                <Briefcase className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] mt-5 sm:mt-6 leading-none">
                Admin Login
              </h1>

              <p className="text-xs sm:text-sm text-[#64748B] mt-3">
                Workkerz + E-Aurix Panel
              </p>
            </div>

            {/* ADMIN ID */}
            <div className="mt-7 sm:mt-8 mb-5">
              <label className="block text-sm font-bold text-[#0F172A] mb-2">
                Admin ID
              </label>

              <div className="relative">
                <User className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />

                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter admin ID"
                  autoComplete="username"
                  className="
                    w-full
                    h-13 sm:h-14
                    rounded-2xl
                    border border-gray-200
                    bg-[#F8FAFC]
                    pl-12 pr-4
                    text-sm
                    text-[#0F172A]
                    outline-none
                    transition-all
                    focus:border-[#FF5C39]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#FF5C39]/10
                  "
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-6 sm:mb-7">
              <label className="block text-sm font-bold text-[#0F172A] mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                  className="
                    w-full
                    h-13 sm:h-14
                    rounded-2xl
                    border border-gray-200
                    bg-[#F8FAFC]
                    pl-12 pr-4
                    text-sm
                    text-[#0F172A]
                    outline-none
                    transition-all
                    focus:border-[#FF5C39]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#FF5C39]/10
                  "
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleLogin}
              className="
                w-full
                h-13 sm:h-14
                rounded-2xl
                bg-[#0F172A]
                hover:bg-black
                active:scale-[0.98]
                text-white
                text-sm
                font-black
                transition-all
                shadow-lg
                shadow-slate-900/15
              "
            >
              Login to Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SIDEBAR CONTENT
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="px-4 sm:px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {/* LOGO */}
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="text-white text-sm font-extrabold truncate">
              Admin Panel
            </div>

            <div className="text-slate-500 text-[10px] font-medium truncate">
              Workkerz + E-Aurix
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overscroll-contain">
        {sidebarItems.map((item: any) => {
          const Icon = item.icon;
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-sm
                transition-all
                text-left
                ${
                  active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
              style={{
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />

              <span className="flex-1 min-w-0 truncate">
                {item.label}
              </span>

              {item.badge !== undefined && (
                <span
                  className={`
                    shrink-0
                    text-[11px]
                    px-1.5
                    py-0.5
                    min-w-5
                    text-center
                    rounded-full
                    ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-slate-400"
                    }
                  `}
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* BOTTOM LINKS */}
      <div className="p-3 border-t border-white/10 space-y-1 shrink-0">
        {/* WORKKERZ */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="
            flex
            items-center
            gap-3
            px-3
            py-3
            rounded-xl
            text-sm
            text-slate-400
            hover:text-white
            hover:bg-white/5
            transition-all
          "
        >
          <Briefcase className="w-[18px] h-[18px] shrink-0" />
          <span>Workkerz</span>
        </Link>

        {/* E-AURIX */}
        <Link
          href="/eaurix"
          onClick={() => setMobileOpen(false)}
          className="
            flex
            items-center
            gap-3
            px-3
            py-3
            rounded-xl
            text-sm
            text-slate-400
            hover:text-white
            hover:bg-white/5
            transition-all
          "
        >
          <Sparkles className="w-[18px] h-[18px] shrink-0" />
          <span>E-Aurix</span>
        </Link>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            mt-3
            h-11
            rounded-2xl
            bg-rose-500
            hover:bg-rose-600
            active:scale-[0.98]
            text-white
            text-sm
            font-black
            transition-all
          "
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ========================================= */}
      {/* DESKTOP SIDEBAR                           */}
      {/* ========================================= */}
      <aside
        className="
          hidden
          lg:flex
          fixed
          left-0
          top-0
          bottom-0
          z-40
          w-[260px]
          xl:w-[280px]
          bg-[#0B1220]
          border-r
          border-white/5
          flex-col
        "
      >
        <SidebarContent />
      </aside>

      {/* ========================================= */}
      {/* MOBILE / TABLET TOP BAR                   */}
      {/* ========================================= */}
      <header
        className="
          lg:hidden
          fixed
          top-0
          left-0
          right-0
          z-40
          h-16
          bg-[#0B1220]
          border-b
          border-white/10
          flex
          items-center
          justify-between
          px-3
          sm:px-4
        "
      >
        {/* BRAND */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0">
            <div className="text-white text-sm font-extrabold truncate">
              Admin Panel
            </div>

            <div className="text-slate-500 text-[9px] truncate">
              Workkerz + E-Aurix
            </div>
          </div>
        </div>

        {/* MENU */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin menu"
          className="
            w-10
            h-10
            rounded-xl
            bg-white/10
            hover:bg-white/15
            active:scale-95
            flex
            items-center
            justify-center
            text-white
            transition-all
          "
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ========================================= */}
      {/* MOBILE OVERLAY                            */}
      {/* ========================================= */}
      {mobileOpen && (
        <div
          className="
            lg:hidden
            fixed
            inset-0
            z-50
            bg-black/60
            backdrop-blur-[2px]
          "
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ========================================= */}
      {/* MOBILE DRAWER                             */}
      {/* ========================================= */}
      <aside
        className={`
          lg:hidden
          fixed
          top-0
          left-0
          bottom-0
          z-[60]
          w-[min(86vw,320px)]
          bg-[#0B1220]
          border-r
          border-white/10
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close admin menu"
          className="
            absolute
            top-4
            right-4
            z-10
            w-9
            h-9
            rounded-xl
            bg-white/10
            hover:bg-white/15
            flex
            items-center
            justify-center
            text-slate-300
            hover:text-white
            transition-all
          "
        >
          <X className="w-5 h-5" />
        </button>

        <SidebarContent />
      </aside>
    </>
  );
}