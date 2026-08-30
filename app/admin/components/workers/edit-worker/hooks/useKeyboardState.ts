"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

export default function useKeyboardState() {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let mounted = true;

    const setupKeyboardListeners = async () => {
      const showListener = await Keyboard.addListener(
        "keyboardWillShow",
        () => {
          if (mounted) {
            setKeyboardOpen(true);
          }
        },
      );

      const hideListener = await Keyboard.addListener(
        "keyboardWillHide",
        () => {
          if (mounted) {
            setKeyboardOpen(false);
          }
        },
      );

      return () => {
        showListener.remove();
        hideListener.remove();
      };
    };

    let cleanup: (() => void) | undefined;

    setupKeyboardListeners().then((removeListeners) => {
      cleanup = removeListeners;
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  return keyboardOpen;
}