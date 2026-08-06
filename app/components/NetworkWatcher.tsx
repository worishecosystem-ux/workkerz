"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";

export default function NetworkWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const checkNetwork = async () => {
      const status = await Network.getStatus();

      if (!status.connected && pathname !== "/offline") {
        router.replace("/offline");
      }

      if (status.connected && pathname === "/offline") {
        router.replace("/");
      }
    };

    checkNetwork();

    const listener = Network.addListener(
      "networkStatusChange",
      ({ connected }) => {
        if (!connected && pathname !== "/offline") {
          router.replace("/offline");
        }

        if (connected && pathname === "/offline") {
          router.replace("/");
        }
      }
    );

    return () => {
      listener.then((l) => l.remove());
    };
  }, [pathname, router]);

  return null;
}