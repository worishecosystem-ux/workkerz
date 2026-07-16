"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import Footer from "./Footer";
import MobileAppNavbar from "./MobileAppNavbar";
import { usePlatform } from "./context/PlatformContext";
import { useMobileNavbar } from "./context/MobileNavbarContext";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setPlatform } = usePlatform();
  const { showMobileNavbar } = useMobileNavbar();

  const [mounted, setMounted] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    setPlatform(pathname.startsWith("/eaurix") ? "eaurix" : "workkerz");
  }, [pathname, setPlatform]);

  useEffect(() => {
    setMounted(true);
    setIsApp(Capacitor.isNativePlatform());
  }, []);
  
  const hideLayout =
   
    pathname.startsWith("/login") ||
    pathname.startsWith("/favorites");

  const hideMobileNavbar =
    pathname.startsWith("/workers/") ||
    pathname.startsWith("/book/") ||
    pathname.startsWith("/confirmation");
    

  if (!mounted) {
    return (
      <div className="min-h-dvh flex flex-col bg-white overflow-x-hidden">
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white overflow-x-hidden">
      {/* Desktop Navbar */}
      {!hideLayout && !isApp && <Navbar />}

      {/* Main Content */}
      <main
        className={`flex-1 overflow-x-hidden ${
          isApp && showMobileNavbar && !hideMobileNavbar
            ? "pb-[calc(80px+env(safe-area-inset-bottom))]"
            : ""
        }`}
      >
        {children}
      </main>

      {/* Desktop Footer */}
      {!hideLayout && !isApp && <Footer />}

      {/* Mobile App Bottom Navbar */}
      {!hideLayout && !hideMobileNavbar && isApp && showMobileNavbar && (
        <div className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]">
          <MobileAppNavbar />
        </div>
      )}
    </div>
  );
}
