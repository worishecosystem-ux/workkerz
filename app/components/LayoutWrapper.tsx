"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "./Navbar";
import Footer from "./Footer";
import { usePlatform } from "./context/PlatformContext";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setPlatform } = usePlatform();

  // ✅ Auto-sync platform with URL (same as your React Router logic)
  useEffect(() => {
    if (pathname.startsWith("/eaurix")) {
      setPlatform("eaurix");
    } else {
      setPlatform("workkerz");
    }
  }, [pathname, setPlatform]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}