"use client";

import DownloadApps from "./DownloadApps";
import { usePlatform } from "./context/PlatformContext";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import WorkCategories from "./WorkCategories";

import PlatformToggle from "./PlatformToggle";
export default function HomeBanner() {
  const { platform, setPlatform } = usePlatform();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const isEaurix = platform === "eaurix";
  const [mounted, setMounted] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsApp(Capacitor.isNativePlatform());
  }, []);

  return (
    <section
      className={`w-full bg-linear-to-br from-[#fbfbfb] to-[#eff3f9] text-white ${isApp ? "pt-1 pb-2" : "py-10"
        }`}
    >
      {/* TOGGLE */}
      <div
        className="
    fixed
    inset-x-0
    top-0
    z-50
    flex
    justify-center
    bg-linear-to-br
    from-[#fbfbfb]
    to-[#eff3f9]
    pt-6]
  "
      >
        <div className="w-full max-w-screen-2xl">
          <PlatformToggle isApp={isApp} />
        </div>
      </div>
      {!isEaurix && (
        <div className="px-5 sm:px-6 lg:px-8 pt-38">
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
