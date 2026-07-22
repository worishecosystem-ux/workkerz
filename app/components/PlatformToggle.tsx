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
        <div className="flex w-full flex-wrap items-center justify-center gap-2 px-3 mt-12 mb-2">
          <button
            onClick={() => handleToggle("workkerz")}
            className={`flex items-center gap-2 px-10 h-12 rounded-xl border transition-all duration-300 ${
              !isEaurix
                ? "bg-[#FFF7ED] border-[#FF5C39] shadow-lg"
                : "bg-white border-slate-700"
            }`}
          >
            <img src="/workkerzapp.png" className="w-8 h-8" alt="Workkerz" />

            <span
              className={`text-sm font-bold ${
                !isEaurix ? "text-[#FF5C39]" : "text-slate-700"
              }`}
            >
              Workkerz
            </span>
          </button>

          <button
            onClick={() => handleToggle("eaurix")}
            className={`flex items-center gap-2 px-10 h-12 rounded-xl border transition-all duration-300 ${
              isEaurix
                ? "bg-[#F0F9FF] border-[#0EA5E9] shadow-lg"
                : "bg-white border-slate-200"
            }`}
          >
            <img src="/aurixapp.png" className="w-8 h-8" alt="E-Aurix" />

            <span
              className={`text-sm font-bold ${
                isEaurix ? "text-[#0EA5E9]" : "text-slate-700"
              }`}
            >
              E-Aurix
            </span>
          </button>
        </div>
        <div className="w-full max-w-100 px-5 rounded-xl pb-2">
          <AddressCard 
            onOverlayChange={setHideCart}/>
        </div>
      </>
    );
  }

  return (
    <div className="flex md:hidden justify-center px-4 mb-2">
      <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-xl mt-10">
        <button
          onClick={() => handleToggle("workkerz")}
          className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${
            !isEaurix ? "bg-white text-[#0F172A] shadow-lg" : "text-white/70"
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
          className={`h-11 px-4 rounded-full flex items-center gap-2 transition-all duration-300 ${
            isEaurix ? "bg-[#0EA5E9] text-white shadow-lg" : "text-white/70"
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
