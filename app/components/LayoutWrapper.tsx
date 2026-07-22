"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import Footer from "./Footer";
import MobileAppNavbar from "./MobileAppNavbar";
import { usePlatform } from "./context/PlatformContext";
import { useMobileNavbar } from "./context/MobileNavbarContext";

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
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
    const native = Capacitor.isNativePlatform();

    setMounted(true);
    setIsApp(native);

    // Website par sirf Coming Soon aur Privacy Policy allow karo
    if (
      !native &&
      pathname !== "/coming-soon" &&
      pathname !== "/privacy-policy"
    ) {
      router.replace("/coming-soon");
    }
  }, [pathname, router]);

  // Redirect hone tak kuch render mat karo
  if (
    !mounted ||
    (!isApp &&
      pathname !== "/coming-soon" &&
      pathname !== "/privacy-policy")
  ) {
    return null;
  }

  const showLayout =
    pathname === "/coming-soon" || pathname === "/privacy-policy";

  return (
    <div className="min-h-dvh flex flex-col bg-white overflow-x-hidden">
      <main
        className={`flex-1 overflow-x-hidden ${
          isApp && showMobileNavbar
            ? "pb-[calc(80px+env(safe-area-inset-bottom))]"
            : ""
        }`}
      >
        {children}
      </main>

      {/* Website Footer */}
      {showLayout && !isApp && <Footer />}

      {/* Mobile App Navbar */}
      {showLayout && isApp && showMobileNavbar && (
        <div className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]">
          <MobileAppNavbar />
        </div>
      )}
    </div>
  );
}