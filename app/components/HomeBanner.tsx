"use client";

import WorkerLive from "./WorkerLive";
import DownloadApps from "./DownloadApps";

import MaterialMarketplace from "./MaterialMarketplace";
import { usePlatform } from "./context/PlatformContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeBanner() {
  const { platform, setPlatform } = usePlatform();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const isEaurix = platform === "eaurix";

  const handleToggle = (p: "workkerz" | "eaurix") => {
    setPlatform(p);
    if (p === "eaurix") router.push("/eaurix");
    else router.push("/");
    setMobileOpen(false);
  };

  return (
    <section className="w-full bg-linear-to-br from-[#0F172A] to-[#1E293B] text-white py-14">
      {/* MOBILE TOGGLE BUTTON */}
      <div className="flex md:hidden justify-center px-4 mb-6">
        <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-xl mt-5">
          {/* WORKKERZ */}
          <button
            onClick={() => handleToggle("workkerz")}
            className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${
              !isEaurix ? "bg-white text-[#0F172A] shadow-lg" : "text-white/70"
            }`}
          >
            <img
              src="/workkerzapp.png"
              alt="Workkerz"
              className="w-6 h-6 rounded-full object-cover"
            />

            <span className="text-[13px] font-black whitespace-nowrap">
              Workkerz
            </span>
          </button>

          {/* E-AURIX */}
          <button
            onClick={() => handleToggle("eaurix")}
            className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${
              isEaurix ? "bg-[#0EA5E9] text-white shadow-lg" : "text-white/70"
            }`}
          >
            <img
              src="/aurixapp.png"
              alt="E-Aurix"
              className="w-6 h-6 rounded-full object-cover"
            />

            <span className="text-[13px] font-black whitespace-nowrap">
              E-Aurix
            </span>
          </button>
        </div>
      </div>

      {/* ✅ ONLY Worker Live (ShopLive removed) */}
      {!isEaurix && (
        <div className="mb-6 mt-8">
          <WorkerLive />
        </div>
      )}

      {/* Hero */}
      <div className="text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold">
          {!isEaurix
            ? "Find Skilled & Labour Workers Near You"
            : "Smart Local Commerce Platform"}
        </h1>

        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
          {!isEaurix
            ? "Book trusted workers for daily tasks, repairs and services."
            : "Buy and sell hardware, tools and local products easily."}
        </p>
      </div>

      {/* Highlight */}
      <div className="mt-8 flex justify-center">
        <div className="relative overflow-hidden rounded-2xl px-6 py-4 bg-linear-to-r from-yellow-400 via-amber-300 to-orange-400 shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-white blur-2xl"></div>

          <div className="relative flex items-center gap-3">
            <span className="text-xl">🚀</span>

            <div className="text-left">
              <p className="text-black font-bold text-sm sm:text-base tracking-wide">
                Mobile Apps Coming Soon
              </p>

              <p className="text-black/70 text-xs sm:text-sm">
                Android & iOS launch in progress
              </p>
            </div>

            <span className="ml-2 bg-black text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              NEW
            </span>
          </div>
        </div>
      </div>

      <DownloadApps />
    </section>
  );
}
