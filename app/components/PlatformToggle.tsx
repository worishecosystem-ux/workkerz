"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatform } from "./context/PlatformContext";
import AddressCard from "@/app/components/address/AddressCard";

type Props = {
  isApp: boolean;
};

export default function PlatformToggle({ isApp }: Props) {
  const router = useRouter();
  const { platform, setPlatform } = usePlatform();

  const isEaurix = platform === "eaurix";
  const [hideCart, setHideCart] = useState(false);

  /* =========================================================
     SWIPE STATE
  ========================================================= */

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchCurrentX = useRef(0);
  const isSwiping = useRef(false);

  /* =========================================================
     PLATFORM TOGGLE
  ========================================================= */

  const handleToggle = (p: "workkerz" | "eaurix") => {
    if (p === platform) return;

    setPlatform(p);

    router.push(p === "eaurix" ? "/eaurix" : "/");
  };

  /* =========================================================
     TOUCH START
  ========================================================= */

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isApp) return;

    const touch = e.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchCurrentX.current = touch.clientX;
    isSwiping.current = false;
  };

  /* =========================================================
     TOUCH MOVE
  ========================================================= */

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isApp) return;

    const touch = e.touches[0];

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchCurrentX.current = touch.clientX;

    /*
     * Only detect horizontal movement.
     * Normal vertical page scrolling will continue normally.
     */
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
    }
  };

  /* =========================================================
     TOUCH END
  ========================================================= */

  const handleTouchEnd = () => {
    if (!isApp) return;

    const deltaX = touchCurrentX.current - touchStartX.current;

    const SWIPE_THRESHOLD = 70;

    if (!isSwiping.current) {
      resetTouch();
      return;
    }

    /*
     * LEFT SWIPE
     *
     * Workkerz
     *     ↓
     * E-Aurix
     */
    if (deltaX < -SWIPE_THRESHOLD && !isEaurix) {
      handleToggle("eaurix");
    }

    /*
     * RIGHT SWIPE
     *
     * E-Aurix
     *     ↓
     * Workkerz
     */
    if (deltaX > SWIPE_THRESHOLD && isEaurix) {
      handleToggle("workkerz");
    }

    resetTouch();
  };

  /* =========================================================
     RESET TOUCH
  ========================================================= */

  const resetTouch = () => {
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchCurrentX.current = 0;
    isSwiping.current = false;
  };

  /* =========================================================
     APP VERSION
  ========================================================= */

  if (isApp) {
    return (
      <div
        className="w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* =====================================================
            PLATFORM SWITCH
        ===================================================== */}

        <div className="flex w-full items-center justify-center gap-2 px-3 pt-12 pb-2">
          {/* ===================================================
              WORKKERZ
          =================================================== */}

          <button
            type="button"
            onClick={() => handleToggle("workkerz")}
            className={`flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-xl border transition-all duration-300 active:scale-[0.97] ${
              !isEaurix
                ? "bg-[#FFF7ED] border-[#FF5C39] shadow-lg"
                : "bg-white border-slate-300"
            }`}
          >
            <img
              src="/workkerzapp.png"
              alt="Workkerz"
              className="h-7 w-7 shrink-0 object-contain"
            />

            <span
              className={`truncate text-sm font-bold ${
                !isEaurix ? "text-[#FF5C39]" : "text-slate-700"
              }`}
            >
              Workkerz
            </span>
          </button>

          {/* ===================================================
              E-AURIX
          =================================================== */}

          <button
            type="button"
            onClick={() => handleToggle("eaurix")}
            className={`flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-xl border transition-all duration-300 active:scale-[0.97] ${
              isEaurix
                ? "bg-[#F0F9FF] border-[#0EA5E9] shadow-lg"
                : "bg-white border-slate-300"
            }`}
          >
            <img
              src="/aurixapp.png"
              alt="E-Aurix"
              className="h-7 w-7 shrink-0 object-contain"
            />

            <span
              className={`truncate text-sm font-bold ${
                isEaurix ? "text-[#0EA5E9]" : "text-slate-700"
              }`}
            >
              E-Aurix
            </span>
          </button>
        </div>

        {/* =====================================================
            ADDRESS CARD
        ===================================================== */}

        <div className="w-full px-3 sm:px-4 pb-2">
          <AddressCard onOverlayChange={setHideCart} />
        </div>
      </div>
    );
  }

  /* =========================================================
     WEB / MOBILE BROWSER VERSION
  ========================================================= */

  return (
    <div className="flex md:hidden justify-center px-4 mb-2">
      <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-xl mt-10">
        {/* ===================================================
            WORKKERZ
        =================================================== */}

        <button
          type="button"
          onClick={() => handleToggle("workkerz")}
          className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 active:scale-[0.97] ${
            !isEaurix
              ? "bg-white text-[#0F172A] shadow-lg"
              : "text-white/70"
          }`}
        >
          <img
            src="/workkerzapp.png"
            className="w-6 h-6 rounded-full object-contain"
            alt="Workkerz"
          />

          <span className="text-[13px] font-black">Workkerz</span>
        </button>

        {/* ===================================================
            E-AURIX
        =================================================== */}

        <button
          type="button"
          onClick={() => handleToggle("eaurix")}
          className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 active:scale-[0.97] ${
            isEaurix
              ? "bg-[#0EA5E9] text-white shadow-lg"
              : "text-white/70"
          }`}
        >
          <img
            src="/aurixapp.png"
            className="w-6 h-6 rounded-full object-contain"
            alt="E-Aurix"
          />

          <span className="text-[13px] font-black">E-Aurix</span>
        </button>
      </div>
    </div>
  );
}