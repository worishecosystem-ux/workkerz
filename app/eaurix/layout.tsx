"use client";

import { usePathname } from "next/navigation";
import type { Metadata } from "next";
import { PlatformProvider } from "../components/context/PlatformContext";
import { MobileNavbarProvider } from "../components/context/MobileNavbarContext";
import MobileBottomBar from "./components/MobileBottomBar";
import HomePlatformToggle from "./components/HomePlatformToggle";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideBottomBar =
    pathname.startsWith("/eaurix/product/") ||
    pathname.startsWith("/eaurix/checkout") ||
    pathname.startsWith("/eaurix/order-placed") ||
    pathname.startsWith("/eaurix/confirmed");

  return (
    <PlatformProvider>
      <MobileNavbarProvider>
        <main className="min-h-screen md:pb-0 bg-linear-to-br from-sky-100 via-sky-150 to-cyan-100">
          <HomePlatformToggle />
          {children}
        </main>

        {!hideBottomBar && <MobileBottomBar />}
      </MobileNavbarProvider>
    </PlatformProvider>
  );
}
