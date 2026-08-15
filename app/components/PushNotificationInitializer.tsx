"use client";

import { useEffect } from "react";
import { initPushNotifications } from "@/lib/pushNotifications";

export default function PushNotificationInitializer() {
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        if (!mounted) return;

        console.log("[PushInit] Starting push initialization...");

        await initPushNotifications();

        console.log("[PushInit] Push initialization completed.");
      } catch (error) {
        console.error(
          "[PushInit] Push initialization failed:",
          error
        );
      }
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
