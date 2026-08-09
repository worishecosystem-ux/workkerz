"use client";

import { useEffect, useRef } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Toast } from "@capacitor/toast";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  showForm?: boolean;
  showSelector?: boolean;
  onFormBack?: () => void;
  onSelectorBack?: () => void;
}

export default function BackButtonHandler({
  showForm = false,
  showSelector = false,
  onFormBack = () => {},
  onSelectorBack = () => {},
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const lastBackPress = useRef(0);

  useEffect(() => {
    // ==================================================
    // BROWSER CHECK
    // ==================================================

    if (typeof window === "undefined") {
      return;
    }

    // ==================================================
    // ADMIN PANEL
    // ==================================================

    // Admin panel is web/admin functionality.
    // Never register the Android back button here.
    if (pathname.startsWith("/admin")) {
      return;
    }

    // ==================================================
    // ONLY RUN INSIDE NATIVE ANDROID APP
    // ==================================================

    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();

    if (!isNative || platform !== "android") {
      return;
    }

    let listener:
      | Awaited<ReturnType<typeof App.addListener>>
      | null = null;

    let mounted = true;

    // ==================================================
    // SETUP ANDROID BACK BUTTON
    // ==================================================

    const setup = async () => {
      try {
        listener = await App.addListener(
          "backButton",
          async () => {
            if (!mounted) {
              return;
            }

            try {
              // ========================================
              // 1. FORM OPEN
              // ========================================

              if (showForm) {
                onFormBack();
                return;
              }

              // ========================================
              // 2. SELECTOR OPEN
              // ========================================

              if (showSelector) {
                onSelectorBack();
                return;
              }

              // ========================================
              // 3. HOME PAGE
              // ========================================

              if (pathname === "/") {
                const now = Date.now();

                // Double back within 2 seconds
                if (
                  now - lastBackPress.current <
                  2000
                ) {
                  await App.exitApp();
                  return;
                }

                lastBackPress.current = now;

                await Toast.show({
                  text: "Press back again to exit",
                  duration: "short",
                });

                return;
              }

              // ========================================
              // 4. DASHBOARD
              // ========================================

              if (pathname === "/dashboard") {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }

                return;
              }

              // ========================================
              // 5. OTHER PAGES
              // ========================================

              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            } catch (error) {
              console.error(
                "Android back button handler error:",
                error,
              );
            }
          },
        );
      } catch (error) {
        console.error(
          "Unable to register Android back button listener:",
          error,
        );
      }
    };

    setup();

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
      mounted = false;

      if (listener) {
        listener
          .remove()
          .catch((error) => {
            console.error(
              "Unable to remove Android back button listener:",
              error,
            );
          });

        listener = null;
      }
    };
  }, [
    pathname,
    router,
    showForm,
    showSelector,
    onFormBack,
    onSelectorBack,
  ]);

  return null;
}