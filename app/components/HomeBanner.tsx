"use client";

import DownloadApps from "./DownloadApps";
import { usePlatform } from "./context/PlatformContext";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import WorkCategories from "./WorkCategories";
import AddressCard from "@/app/components/address/AddressCard";

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
  const [mounted, setMounted] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsApp(Capacitor.isNativePlatform());
  }, []);

  return (
    <section
      className={`w-full bg-linear-to-br from-[#fbfbfb] to-[#eff3f9] text-white ${
        isApp ? "pt-1 pb-2" : "py-10"
      }`}
    >
      {/* TOGGLE */}
      {mounted && (
        <>
          {/* MOBILE APP */}
          {isApp ? (
           <div className="flex w-full flex-wrap items-center justify-center gap-2 px-3 sm:px-4 mt-12 sm:mt-10 lg:mt-10 mb-2">
              <button
                onClick={() => handleToggle("workkerz")}
                className={`flex items-center gap-2 px-10 h-12 rounded-xl border transition-all duration-300 ${
                  !isEaurix
                    ? "bg-[#FFF7ED] border-[#FF5C39] shadow-lg"
                    : "bg-white border-slate-200"
                }`}
              >
                <img
                  src="/workkerzapp.png"
                  alt="Workkerz"
                  className="w-8 h-8 object-contain"
                />

                <span
                  className={`text-sm font-bold ${
                    !isEaurix ? "text-[#FF5C39]" : "text-slate-700"
                  }`}
                >
                  Workkerz
                </span>
              </button>

              <button
                onClick={() => handleToggle("eaurix")}
                className={`flex items-center gap-2 px-10 h-12 rounded-xl border transition-all duration-300 ${
                  isEaurix
                    ? "bg-[#F0F9FF] border-[#0EA5E9] shadow-lg"
                    : "bg-white border-slate-200"
                }`}
              >
                <img
                  src="/aurixapp.png"
                  alt="E-Aurix"
                  className="w-8 h-8 object-contain"
                />

                <span
                  className={`text-sm font-bold ${
                    isEaurix ? "text-[#0EA5E9]" : "text-slate-700"
                  }`}
                >
                  E-Aurix
                </span>
              </button>
            </div>
          ) : (
            /* WEBSITE - OLD DESIGN */
            <div className="flex md:hidden justify-center px-4 mb-2">
              <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-xl mt-10">
                <button
                  onClick={() => handleToggle("workkerz")}
                  className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${
                    !isEaurix
                      ? "bg-white text-[#0F172A] shadow-lg"
                      : "text-white/70"
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

                <button
                  onClick={() => handleToggle("eaurix")}
                  className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${
                    isEaurix
                      ? "bg-[#0EA5E9] text-white shadow-lg"
                      : "text-white/70"
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
          )}
        </>
      )}
      <div className="w-full max-w-100 px-5 rounded-xl">
        <AddressCard />
      </div>
      {!isEaurix && (
        <div className="px-5 sm:px-6 lg:px-8 py-1">
          <WorkCategories />
        </div>
      )}
      {/* Highlight */}
      {mounted && !isApp && (
        <div className="mt-3 flex justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  📱
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Mobile Apps Coming Soon
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DownloadApps />
    </section>
  );
}
