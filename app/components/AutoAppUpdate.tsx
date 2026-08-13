"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import {
  AppUpdate,
  AppUpdateAvailability,
} from "@capawesome/capacitor-app-update";

export default function AutoAppUpdate() {
  const checkingRef = useRef(false);

  useEffect(() => {
    if (checkingRef.current) return;
    checkingRef.current = true;

    const checkForUpdate = async () => {
      // Only Android native app
      if (!Capacitor.isNativePlatform()) return;
      if (Capacitor.getPlatform() !== "android") return;

      try {
        const updateInfo = await AppUpdate.getAppUpdateInfo();

        const updateAvailable =
          updateInfo.updateAvailability ===
          AppUpdateAvailability.UPDATE_AVAILABLE;

        if (!updateAvailable) return;

        console.log("Workkerz update available:", {
          currentVersion: updateInfo.currentVersionName,
          currentBuild: updateInfo.currentVersionCode,
          availableVersion: updateInfo.availableVersionName,
          availableBuild: updateInfo.availableVersionCode,
          immediateAllowed: updateInfo.immediateUpdateAllowed,
        });

        // Preferred: force/update immediately when Play allows it
        if (updateInfo.immediateUpdateAllowed) {
          await AppUpdate.performImmediateUpdate();
          return;
        }

        // Fallback: open Workkerz Play Store page
        await AppUpdate.openAppStore();
      } catch (error) {
        console.warn("Workkerz auto-update check failed:", error);
      }
    };

    // Let the app UI/native startup finish first
    const timer = window.setTimeout(() => {
      checkForUpdate();
    }, 1500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}