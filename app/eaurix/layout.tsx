import type { Metadata } from "next";
import { PlatformProvider } from "../components/context/PlatformContext";
import { MobileNavbarProvider } from "../components/context/MobileNavbarContext";
import MobileBottomBar from "./components/MobileBottomBar";
import HomePlatformToggle from "./components/HomePlatformToggle";

export const metadata: Metadata = {
  // ...same metadata
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlatformProvider>
      <MobileNavbarProvider>
        <main className="min-h-screen pb-20 md:pb-0">
          <HomePlatformToggle />
          {children}
        </main>

        <MobileBottomBar />
      </MobileNavbarProvider>
    </PlatformProvider>
  );
}