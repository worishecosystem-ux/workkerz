"use client";

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
      className={`w-full bg-linear-to-br from-[#fbfbfb] to-[#eff3f9] text-white ${
        isApp ? "pt-1 pb-2" : "py-10"
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
    </section>
  );
}
