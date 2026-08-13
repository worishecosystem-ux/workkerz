"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

export default function MobileComingSoonRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (pathname === "/coming-soon") {
      router.replace("/");
    }
  }, [pathname, router]);

  if (
    Capacitor.isNativePlatform() &&
    pathname === "/coming-soon"
  ) {
    return null;
  }

  return <>{children}</>;
}