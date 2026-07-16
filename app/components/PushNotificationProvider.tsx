"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { initPushNotifications } from "@/lib/pushNotifications";

export default function PushNotificationProvider() {
  useEffect(() => {
    if (Capacitor.getPlatform() === "android") {
      initPushNotifications();
    }
  }, []);

  return null;
}