"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "./Navbar";
import Footer from "./Footer";
import { usePlatform } from "./context/PlatformContext";

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setPlatform } = usePlatform();

  useEffect(() => {
    if (pathname.startsWith("/eaurix")) {
      setPlatform("eaurix");
    } else {
      setPlatform("workkerz");
    }
  }, [pathname, setPlatform]);

  // Pages where Navbar/Footer should be hidden
  const hideLayout =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/favorites");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideLayout && <Navbar />}

      <main className="flex-1">{children}</main>

      {!hideLayout && <Footer />}
    </div>
  );
}