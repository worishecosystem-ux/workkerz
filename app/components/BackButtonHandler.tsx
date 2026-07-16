"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { usePathname, useRouter } from "next/navigation";
import { Toast } from "@capacitor/toast";
import { useRef } from "react";

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
    if (
      !Capacitor.isNativePlatform() ||
      Capacitor.getPlatform() !== "android"
    ) {
      return;
    }

    let listener: Awaited<ReturnType<typeof App.addListener>> | undefined;

    const setup = async () => {
      listener = await App.addListener("backButton", async () => {
        if (showForm) {
          onFormBack();
          return;
        }

        if (showSelector) {
          onSelectorBack();
          return;
        }

        // Home page
        if (pathname === "/") {
          const now = Date.now();

          if (now - lastBackPress.current < 2000) {
            App.exitApp();
            return;
          }

          lastBackPress.current = now;

          await Toast.show({
            text: "Press back again to exit",
            duration: "short",
          });

          return;
        }

        // Dashboard par pehle previous page par jao
        if (pathname === "/dashboard") {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
          return;
        }

        // Baaki sab pages
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      });
    };

    setup();

    return () => {
      listener?.remove();
    };
  }, [pathname, router, showForm, showSelector, onFormBack, onSelectorBack]);

  return null;
}
