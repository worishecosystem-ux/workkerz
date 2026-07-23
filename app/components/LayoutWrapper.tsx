"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import Footer from "./Footer";
import MobileAppNavbar from "./MobileAppNavbar";
import { usePlatform } from "./context/PlatformContext";
import { useMobileNavbar } from "./context/MobileNavbarContext";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showBottomBar, setShowBottomBar] = useState(true);
  const { setPlatform } = usePlatform();
  const { showMobileNavbar } = useMobileNavbar();

  const [mounted, setMounted] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    if (!isApp || pathname !== "/") return;

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Top par hamesha show
      if (currentScrollY < 20) {
        setShowBottomBar(true);
      }
      // Down scroll -> hide
      else if (currentScrollY > lastScrollY + 5) {
        setShowBottomBar(false);
      }
      // Up scroll -> show
      else if (currentScrollY < lastScrollY - 5) {
        setShowBottomBar(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isApp, pathname]);
  useEffect(() => {
    setPlatform(pathname.startsWith("/eaurix") ? "eaurix" : "workkerz");
  }, [pathname, setPlatform]);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();

    setMounted(true);
    setIsApp(native);

    // Website par sirf Home ko Coming Soon par redirect karo
    if (!native && pathname === "/") {
      router.replace("/coming-soon");
    }
  }, [pathname, router]);

  // Redirect hone tak kuch render mat karo
  if (!mounted || (!isApp && pathname === "/")) {
    return null;
  }

  // Website Footer sirf in pages par
  const showWebsiteFooter =
    pathname === "/coming-soon" || pathname === "/privacy-policy";

  // Mobile Navbar sirf Home page par
  const showHomeNavbar = isApp && showMobileNavbar && pathname === "/";

  return (
    <div className="min-h-dvh flex flex-col bg-white overflow-x-hidden">
      <main
        className={`flex-1 overflow-x-hidden ${
          showHomeNavbar ? "pb-[calc(80px+env(safe-area-inset-bottom))]" : ""
        }`}
      >
        {children}
      </main>

      {/* Website Footer */}
      {!isApp && showWebsiteFooter && <Footer />}

      {/* Mobile App Navbar (Only Home) */}
      {showHomeNavbar && (
        <div
          className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-in-out ${
            showBottomBar
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <MobileAppNavbar />
        </div>
      )}
    </div>
  );
}
