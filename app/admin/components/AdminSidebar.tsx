"use client";

import { useEffect, useState } from "react";
import { Briefcase, Sparkles, Lock, User } from "lucide-react";

import Link from "next/link";

// LOGIN IDS
const ADMIN_ID = "admin";
const ADMIN_PASS = "1234";

export default function AdminSidebar({
  tab,
  setTab,
  sidebarItems,
}: any) {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

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
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-[#07132B] flex items-center justify-center p-5 overflow-hidden">
        <div className="relative z-10 w-full max-w-md bg-white rounded-[38px] p-8 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.35)] border border-white/20">
          {/* LOGO */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-[30px] bg-linear-to-br from-[#FF5C39] to-[#0EA5E9] flex items-center justify-center shadow-lg">
              <Briefcase className="w-11 h-11 text-white" />
            </div>

            <h1 className="text-4xl font-black text-[#0F172A] mt-6 leading-none">
              Admin Login
            </h1>

            <p className="text-sm text-[#64748B] mt-3">
              Workkerz + E-Aurix Panel
            </p>
          </div>

          {/* ADMIN ID */}
          <div className="mb-5">
            <div className="text-sm font-bold text-[#0F172A] mb-2">
              Admin ID
            </div>

            <div className="relative">
              <User className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter admin ID"
                className="w-full h-14 rounded-2xl border border-gray-200 bg-[#F8FAFC] pl-12 pr-4 text-sm outline-none transition-all focus:border-[#FF5C39] focus:bg-white"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-7">
            <div className="text-sm font-bold text-[#0F172A] mb-2">
              Password
            </div>

            <div className="relative">
              <Lock className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-14 rounded-2xl border border-gray-200 bg-[#F8FAFC] pl-12 pr-4 text-sm outline-none transition-all focus:border-[#FF5C39] focus:bg-white"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            className="w-full h-14 rounded-2xl bg-[#0F172A] hover:bg-black active:scale-[0.98] text-white text-sm font-black transition-all shadow-lg"
          >
            Login to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  // SIDEBAR
  return (
    <aside className="w-56 bg-[#0F172A] flex flex-col shrink-0 fixed left-0 top-0 bottom-0 z-40">
      {/* LOGO */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-[#FF5C39] to-[#0EA5E9] rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>

          <div>
            <div className="text-white text-sm" style={{ fontWeight: 800 }}>
              Admin Panel
            </div>

            <div
              className="text-slate-500 text-[10px]"
              style={{ fontWeight: 500 }}
            >
              Workkerz + E-Aurix
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item: any) => {
          const Icon = item.icon;

          const active = tab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              style={{
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />

              <span className="flex-1">{item.label}</span>

              {item.badge !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-slate-400"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* LINKS */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Briefcase className="w-4 h-4" />
          <span>Workkerz</span>
        </Link>

        <Link
          href="/eaurix"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>E-Aurix</span>
        </Link>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 mt-3 h-11 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-black transition-all"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
