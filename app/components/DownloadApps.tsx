"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

const apps = [
  {
    logo: "/workkerzapp.png",
    name: "Workkerz",
    desc: "For Customers",
    link: "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    logo: "/aurixapp.png",
    name: "E-Aurix",
    desc: "For Buying & Selling",
    link: "#",
  },
  {
    logo: "/Zevrooapp.png",
    name: "Zevroo Partner",
    desc: "For Riders",
    link: "#",
  },
];

export default function DownloadAppsBar() {
  const [mounted, setMounted] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsApp(Capacitor.isNativePlatform());
  }, []);

  if (!mounted || isApp) return null;

  return (
    <section className="mt-6 px-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {apps.map((app, i) => (
          <a
            key={i}
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="
              bg-white/10
              backdrop-blur-md
              border border-white/10
              rounded-xl
              p-2
              flex items-center gap-2
              hover:bg-white/15
              transition-all
            "
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white p-1 shrink-0">
              <img
                src={app.logo}
                alt={app.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <h4 className="text-white text-[11px] md:text-sm font-semibold truncate">
                {app.name}
              </h4>

              <p className="text-[9px] md:text-xs text-gray-300 truncate">
                {app.desc}
              </p>
            </div>
          </a>
        ))}

        <a
          href="https://play.google.com/store/apps/details?id=com.workkerz.app"
          target="_blank"
          rel="noopener noreferrer"
          className="
            bg-linear-to-r
            from-[#FF5C39]
            to-[#FF7A5C]
            text-white
            rounded-xl
            p-2
            flex items-center justify-center
            text-[11px] md:text-sm
            font-semibold
            hover:scale-[1.02]
            transition-all
          "
        >
          🚀 Download App
        </a>
      </div>
    </section>
  );
}