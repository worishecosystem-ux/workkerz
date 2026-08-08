"use client";

import Image from "next/image";
import {
  MapPin,
  Search,
  UserRound,
  Wrench,
  Truck,
  ChevronRight,
  Star,
} from "lucide-react";

export default function MobileAppMockup() {
  return (
    <div className="relative flex items-center justify-center perspective-[1400px]">
      {/* Glow */}
      <div className="absolute h-105 w-75 rounded-full bg-green-400/20 blur-[90px]" />

      {/* 3D PHONE */}
      <div
        className="
          relative
          h-155
          w-76.25
          rotate-y-[-12deg]
          rotate-x-[3deg]
          rounded-[42px]
          border-[7px]
          border-slate-800
          bg-slate-900
          p-1.75
          shadow-[35px_35px_60px_rgba(0,0,0,0.30)]
          transition-transform
          duration-700
          hover:rotate-y-[-5deg]
          hover:rotate-x-[0deg]
        "
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* PHONE SIDE DEPTH */}
        <div
          className="
            absolute
            -right-3.75
            top-8.75
            h-136.25
            w-3.75
            rounded-r-[18px]
            bg-slate-700
          "
          style={{
            transform: "translateZ(-5px)",
          }}
        />

        {/* SCREEN */}
        <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-[#f7f8f5]">
          {/* STATUS BAR */}
          <div className="flex h-8 items-center justify-between bg-white px-5 text-[10px] font-semibold text-slate-600">
            <span>9:41</span>

            <div className="flex items-center gap-1">
              <span>●●●</span>
              <span>▮</span>
            </div>
          </div>

          {/* APP HEADER */}
          <div className="bg-white px-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                {/* LOGO */}
                <Image
                  src="/WORKKERZ (1).png"
                  alt="Workkerz"
                  width={105}
                  height={35}
                  className="h-7 w-auto object-contain object-left"
                  priority
                />

                {/* LOCATION */}
                <div className="mt-1.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-green-600" />

                  <span className="text-[10px] font-bold text-slate-800">
                    Your Location
                  </span>
                </div>
              </div>

              {/* PROFILE */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                <UserRound className="h-4 w-4 text-green-600" />
              </div>
            </div>

            {/* SEARCH */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-400" />

              <span className="text-[11px] text-slate-400">
                Search workers or materials
              </span>
            </div>
          </div>

          {/* CONTENT */}
          <div className="px-4 py-4">
            {/* GREETING */}
            <div>
              <p className="text-[10px] font-medium text-slate-400">WORKKERZ</p>

              <h2 className="mt-1 text-lg font-black text-slate-900">
                What do you need?
              </h2>
            </div>

            {/* MAIN ACTIONS */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* WORKER */}
              <div className="rounded-2xl bg-green-600 p-3 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Wrench className="h-4 w-4" />
                </div>

                <p className="mt-5 text-xs font-black">Find a Worker</p>

                <p className="mt-1 text-[9px] text-green-100">
                  Skilled professionals
                </p>
              </div>

              {/* MATERIAL */}
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <Truck className="h-4 w-4 text-emerald-600" />
                </div>

                <p className="mt-5 text-xs font-black text-slate-900">
                  Materials
                </p>

                <p className="mt-1 text-[9px] text-slate-400">E-Aurix</p>
              </div>
            </div>

            {/* POPULAR */}
            <div className="mt-5 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900">
                Popular Services
              </h3>

              <span className="text-[9px] font-bold text-green-600">
                View all
              </span>
            </div>

            {/* SERVICE ROW */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                ["Electrician", "⚡"],
                ["Plumber", "🔧"],
                ["Painter", "🎨"],
                ["Mason", "🧱"],
              ].map(([name, icon]) => (
                <div
                  key={name}
                  className="rounded-xl bg-white p-2 text-center shadow-sm"
                >
                  <div className="text-lg">{icon}</div>

                  <p className="mt-1 truncate text-[8px] font-bold text-slate-600">
                    {name}
                  </p>
                </div>
              ))}
            </div>

            {/* FEATURED */}
            <div className="mt-5 flex items-center justify-between">
              <h3 className="text-xs font-black">Nearby Professionals</h3>

              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-green-100" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold">
                    Verified Professional
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Electrician • Nearby
                  </p>

                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />

                    <span className="text-[8px] font-bold">4.8</span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </div>

          {/* BOTTOM NAV */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-600" />

                <p className="mt-1 text-[8px] font-bold text-green-600">Home</p>
              </div>

              <div className="text-center text-slate-400">
                <Wrench className="mx-auto h-3.5 w-3.5" />

                <p className="mt-1 text-[8px]">Workers</p>
              </div>

              <div className="text-center text-slate-400">
                <Truck className="mx-auto h-3.5 w-3.5" />

                <p className="mt-1 text-[8px]">Materials</p>
              </div>

              <div className="text-center text-slate-400">
                <UserRound className="mx-auto h-3.5 w-3.5" />

                <p className="mt-1 text-[8px]">Profile</p>
              </div>
            </div>
          </div>

          {/* HOME INDICATOR */}
          <div className="absolute bottom-1 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-slate-900/70" />
        </div>
      </div>

      {/* FLOATING CARD — LEFT */}
      <div
        className="
          absolute
          -left-10
          top-28
          hidden
          rounded-2xl
          border
          border-slate-100
          bg-white
          p-3
          shadow-xl
          sm:block
        "
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
            <UsersIcon />
          </div>

          <div>
            <p className="text-[9px] text-slate-400">Workers</p>

            <p className="text-xs font-black">Find nearby</p>
          </div>
        </div>
      </div>

      {/* FLOATING CARD — RIGHT */}
      <div
        className="
          absolute
          -right-8
          bottom-32
          hidden
          rounded-2xl
          border
          border-slate-100
          bg-white
          p-3
          shadow-xl
          sm:block
        "
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Truck className="h-4 w-4 text-emerald-600" />
          </div>

          <div>
            <p className="text-[9px] text-slate-400">E-Aurix</p>

            <p className="text-xs font-black">Materials</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-green-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
