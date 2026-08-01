"use client";
import { useState } from "react";
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
  const handleToggle = (p: "workkerz" | "eaurix") => {
    setPlatform(p);
    router.push(p === "eaurix" ? "/eaurix" : "/");
  };

  if (isApp) {
    return (
      <>
        <div className="flex w-full items-center justify-center gap-2 px-3 pt-12 pb-2">
  <button
    onClick={() => handleToggle("workkerz")}
    className={`flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-xl border transition-all duration-300 ${
      !isEaurix
        ? "bg-[#FFF7ED] border-[#FF5C39] shadow-lg"
        : "bg-white border-slate-300"
    }`}
  >
    <img
      src="/workkerzapp.png"
      alt="Workkerz"
      className="h-7 w-7 shrink-0"
    />

    <span
      className={`truncate text-sm font-bold ${
        !isEaurix ? "text-[#FF5C39]" : "text-slate-700"
      }`}
    >
      Workkerz
    </span>
  </button>

  <button
    onClick={() => handleToggle("eaurix")}
    className={`flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-xl border transition-all duration-300 ${
      isEaurix
        ? "bg-[#F0F9FF] border-[#0EA5E9] shadow-lg"
        : "bg-white border-slate-300"
    }`}
  >
    <img
      src="/aurixapp.png"
      alt="E-Aurix"
      className="h-7 w-7 flex-shrink-0"
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

        <div className="mx-auto w-full max-w-90 px-4 pb-2">
          <AddressCard onOverlayChange={setHideCart} />
        </div>
      </>
    );
  }

  return (
    <div className="flex md:hidden justify-center px-4 mb-2">
      <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-xl mt-10">
        <button
          onClick={() => handleToggle("workkerz")}
          className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${!isEaurix ? "bg-white text-[#0F172A] shadow-lg" : "text-white/70"
            }`}
        >
          <img
            src="/workkerzapp.png"
            className="w-6 h-6 rounded-full"
            alt="Workkerz"
          />

          <span className="text-[13px] font-black">Workkerz</span>
        </button>

        <button
          onClick={() => handleToggle("eaurix")}
          className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${isEaurix ? "bg-[#0EA5E9] text-white shadow-lg" : "text-white/70"
            }`}
        >
          <img
            src="/aurixapp.png"
            className="w-6 h-6 rounded-full"
            alt="E-Aurix"
          />

          <span className="text-[13px] font-black">E-Aurix</span>
        </button>
      </div>
    </div>
  );
}
