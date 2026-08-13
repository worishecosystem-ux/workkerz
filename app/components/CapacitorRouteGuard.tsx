"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

export default function CapacitorRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCapacitor, setIsCapacitor] = useState<boolean | null>(null);

  useEffect(() => {
    setIsCapacitor(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    if (isCapacitor && pathname === "/coming-soon") {
      router.replace("/");
    }
  }, [isCapacitor, pathname, router]);

  if (isCapacitor === null) {
    return null;
  }

  if (isCapacitor && pathname === "/coming-soon") {
    return null;
  }

  return <>{children}</>;
}