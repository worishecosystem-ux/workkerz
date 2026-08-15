"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function AutoAppUpdate() {
  useEffect(() => {
    let mounted = true;

    const checkForUpdate = async () => {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      if (Capacitor.getPlatform() !== "android") {
        return;
      }

      try {
        const { AppUpdate } = await import(
          "@capawesome/capacitor-app-update"
        );

        if (!mounted) return;

        const result = await AppUpdate.getAppUpdateInfo();

        console.log(
          "[AutoUpdate] Update info:",
          result
        );

        /*
         * 1 = UPDATE_NOT_AVAILABLE
         * 2 = UPDATE_AVAILABLE
         */

        if (result.updateAvailability === 2) {
          console.log(
            "[AutoUpdate] Update available."
          );

          try {
            if (result.immediateUpdateAllowed) {
              await AppUpdate.performImmediateUpdate();
              return;
            }

            if (result.flexibleUpdateAllowed) {
              await AppUpdate.startFlexibleUpdate();
              return;
            }

            await AppUpdate.openAppStore();
            return;
          } catch (updateError) {
            const message =
              updateError instanceof Error
                ? updateError.message
                : String(updateError);

            if (
              message.includes("-10") ||
              message.includes("ERROR_APP_NOT_OWNED") ||
              message.includes("not owned by any user")
            ) {
              console.info(
                "[AutoUpdate] Skipped: app is not Play Store owned."
              );
            } else {
              console.error(
                "[AutoUpdate] Update failed:",
                updateError
              );
            }
          }
        } else {
          console.log(
            "[AutoUpdate] App is up to date."
          );
        }
      } catch (error) {
        console.error(
          "[AutoUpdate] Check failed:",
          error
        );
      }
    };

    void checkForUpdate();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}