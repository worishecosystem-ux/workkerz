"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";

type BackHandler = (() => boolean) | null;

interface ContextType {
  handler: BackHandler;
  setHandler: (handler: BackHandler) => void;
}

const BackButtonContext = createContext<ContextType | null>(null);

export function BackButtonProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [handler, setHandler] = useState<BackHandler>(null);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    let lastBackPress = 0;

    const listener = App.addListener("backButton", async ({ canGoBack }) => {
      // Custom page handler
      if (handler) {
        const handled = handler();
        if (handled) return;
      }

      // Browser history
      if (canGoBack) {
        window.history.back();
        return;
      }

      // Double press to exit
      const now = Date.now();

      if (now - lastBackPress < 2000) {
        App.exitApp();
      } else {
        lastBackPress = now;

        await Toast.show({
          text: "Press back again to exit",
          duration: "short",
        });
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [handler]);

  return (
    <BackButtonContext.Provider
      value={{
        handler,
        setHandler,
      }}
    >
      {children}
    </BackButtonContext.Provider>
  );
}

export function useBackButton() {
  const context = useContext(BackButtonContext);

  if (!context) {
    throw new Error("useBackButton must be used inside BackButtonProvider");
  }

  return context;
}