"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePlatform } from "./context/PlatformContext";

export default function PlatformSwipe() {
  const router = useRouter();
  const pathname = usePathname();
  const { setPlatform } = usePlatform();

  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const navigationLock = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      /*
       * Don't start another swipe while navigating.
       */
      if (navigationLock.current) return;

      const touch = e.touches[0];

      startX.current = touch.clientX;
      startY.current = touch.clientY;
      tracking.current = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!tracking.current) return;

      tracking.current = false;

      if (navigationLock.current) return;

      if (e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];

      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      /*
       * Reset touch values
       */
      startX.current = 0;
      startY.current = 0;

      /*
       * Ignore small movements
       */
      if (absX < 80) return;

      /*
       * Ignore vertical scrolling
       */
      if (absY >= absX) return;

      /*
       * ======================================================
       * WORKKERZ → E-AURIX
       * LEFT SWIPE
       * ======================================================
       */

      if (pathname === "/" && deltaX < 0) {
        navigationLock.current = true;

        setPlatform("eaurix");

        router.replace("/eaurix");

        setTimeout(() => {
          navigationLock.current = false;
        }, 700);

        return;
      }

      /*
       * ======================================================
       * E-AURIX → WORKKERZ
       * RIGHT SWIPE
       * ======================================================
       */

      if (pathname === "/eaurix" && deltaX > 0) {
        navigationLock.current = true;

        setPlatform("workkerz");

        /*
         * replace is important here.
         *
         * push("/") creates browser history:
         *
         * / → /eaurix → /
         *
         * which can make back navigation behave incorrectly.
         *
         * replace("/") changes the current route instead.
         */
        router.replace("/");

        setTimeout(() => {
          navigationLock.current = false;
        }, 700);

        return;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    window.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pathname, router, setPlatform]);

  return null;
}