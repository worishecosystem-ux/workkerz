"use client";

import { useEffect } from "react";
import { initPushNotifications } from "@/lib/pushNotifications";

export default function PushNotificationInitializer() {
  useEffect(() => {
    console.log("[PushInit] component mounted");

    void initPushNotifications();
  }, []);

  return null;
}
