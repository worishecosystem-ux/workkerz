"use client";

import { useEffect, useState } from "react";
import { App } from "@capacitor/app";
import {
  Info,
  Smartphone,
  Calendar,
  ShieldCheck,
} from "lucide-react";

export default function VersionPage() {
  const [appInfo, setAppInfo] = useState({
    name: "Workkerz",
    version: "-",
    build: "-",
  });

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        const info = await App.getInfo();

        setAppInfo({
          name: info.name,
          version: info.version,
          build: info.build,
        });
      } catch (error) {
        console.error("Unable to load app info:", error);
      }
    };

    loadAppInfo();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-600 px-4 pt-14">
        <div className="pb-5">
          <h1 className="text-xl font-bold text-white">
            App Version
          </h1>

          <p className="mt-2 text-sm text-emerald-50">
            Information about your installed Workkerz app.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-3 px-4 py-5">

        {/* App Name */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <Smartphone className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Application
              </p>

              <p className="font-semibold text-slate-900">
                {appInfo.name}
              </p>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2">
              <Info className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Version
              </p>

              <p className="font-semibold text-slate-900">
                {appInfo.version}
              </p>
            </div>
          </div>
        </div>

        {/* Build Number */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2">
              <Info className="h-5 w-5 text-indigo-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Build Number
              </p>

              <p className="font-semibold text-slate-900">
                {appInfo.build}
              </p>
            </div>
          </div>
        </div>

        {/* Release Date */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Release Date
              </p>

              <p className="font-semibold text-slate-900">
                19 July 2026
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Status
              </p>

              <p className="font-semibold text-emerald-600">
                You're using the latest version
              </p>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}