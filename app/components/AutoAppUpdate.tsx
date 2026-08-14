"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function AutoAppUpdate() {
  useEffect(() => {
    let mounted = true;

    const checkForUpdate = async () => {
      /*
       * Only run inside native Android app.
       */

      if (!Capacitor.isNativePlatform()) {
        return;
      }

      /*
       * Android only.
       */

      if (Capacitor.getPlatform() !== "android") {
        return;
      }

      try {
        /*
         * Import dynamically so web build does not
         * try to load the native Google Play module.
         */

        const { AppUpdate } = await import(
          "@capawesome/capacitor-app-update"
        );

        if (!mounted) {
          return;
        }

        const result =
          await AppUpdate.getAppUpdateInfo();

        console.log(
          "Workkerz app update info:",
          result
        );

        /*
         * If no update is available, simply stop.
         */

        if (
          !result.updateAvailability ||
          result.updateAvailability === 1
        ) {
          return;
        }

        /*
         * Start update only when Play Store
         * reports an available update.
         */

        if (
          result.updateAvailability === 2 ||
          result.updateAvailability === 3
        ) {
          try {
            await AppUpdate.performImmediateUpdate();
          } catch (updateError) {
            const message =
              updateError instanceof Error
                ? updateError.message
                : String(updateError);

            /*
             * -10 means the app was not installed
             * from Google Play.
             *
             * Do not show this as a real app error
             * during local development.
             */

            if (
              message.includes("-10") ||
              message.includes(
                "ERROR_APP_NOT_OWNED"
              ) ||
              message.includes(
                "not owned by any user"
              )
            ) {
              console.info(
                "Workkerz update skipped: app was not installed from Google Play."
              );

              return;
            }

            console.error(
              "Workkerz app update failed:",
              updateError
            );
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        /*
         * Ignore Play Store ownership error.
         */

        if (
          message.includes("-10") ||
          message.includes(
            "ERROR_APP_NOT_OWNED"
          ) ||
          message.includes(
            "not owned by any user"
          )
        ) {
          console.info(
            "Workkerz auto-update unavailable for this installation."
          );

          return;
        }

        console.error(
          "Workkerz auto-update check failed:",
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