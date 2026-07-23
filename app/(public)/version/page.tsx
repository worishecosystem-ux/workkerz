"use client";

import { useEffect, useState } from "react";
import { App } from "@capacitor/app";
import {
  AppUpdate,
  AppUpdateAvailability,
} from "@capawesome/capacitor-app-update";
import { supabase } from "@/lib/supabase";
import {
  Info,
  Smartphone,
  Calendar,
  ShieldCheck,
} from "lucide-react";

export default function VersionPage() {

  const [latestVersion, setLatestVersion] = useState("-");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [releaseDate, setReleaseDate] = useState("-");
  const [latestBuild, setLatestBuild] = useState("-");
  const [appInfo, setAppInfo] = useState({
    name: "Workkerz",
    version: "-",
    build: "-",
  });
  const handleUpdate = async () => {
    try {
      const updateInfo = await AppUpdate.getAppUpdateInfo();

      if (updateInfo.immediateUpdateAllowed) {
        await AppUpdate.performImmediateUpdate();
        return;
      }

      if (updateInfo.flexibleUpdateAllowed) {
        await AppUpdate.startFlexibleUpdate();
        return;
      }

      await AppUpdate.openAppStore();
    } catch (error) {
      console.error("Unable to start update:", error);

      try {
        await AppUpdate.openAppStore();
      } catch (e) {
        console.error(e);
      }
    }
  };
  useEffect(() => {
    const loadAppInfo = async () => {
  try {
    const info = await App.getInfo();

    setAppInfo({
      name: info.name,
      version: info.version,
      build: info.build,
    });

    const { data } = await supabase
      .from("app_versions")
      .select("*")
      .eq("platform", "android")
      .single();

    if (data) {
      setLatestVersion(data.latest_version);
      setLatestBuild(String(data.latest_build));
      setReleaseDate(data.release_date);
    }


    try {
      const updateInfo = await AppUpdate.getAppUpdateInfo();

      setUpdateAvailable(
        updateInfo.updateAvailability ===
          AppUpdateAvailability.UPDATE_AVAILABLE
      );
    } catch (error) {
      console.warn("Play Store update unavailable:", error);

      setUpdateAvailable(false);
    }

    setLoading(false);
  } catch (error) {
    console.error(error);
    setLoading(false);
  }
};

    loadAppInfo();

  }, []);
  if (loading) {
    return (
      
        <section className="space-y-3 px-4 py-5">
          {[...Array(7)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-200" />

                <div className="flex-1">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="mt-2 h-5 w-36 rounded bg-slate-300" />
                </div>
              </div>
            </div>
          ))}

          {/* Button Skeleton */}
          <div className="h-12 rounded-2xl bg-slate-300" />
        </section>
    );
  }

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
        {/* Latest Build */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2">
              <Info className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Latest Build
              </p>

              <p className="font-semibold text-slate-900">
                {latestBuild}
              </p>
            </div>
          </div>
        </div>
        {/* Latest Version */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2">
              <Info className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                previous Version
              </p>

              <p className="font-semibold text-slate-900">
                {latestVersion}
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
                {releaseDate}
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

              <p
                className={`font-semibold ${updateAvailable
                  ? "text-red-600"
                  : "text-emerald-600"
                  }`}
              >
                {updateAvailable
                  ? "Update Available"
                  : "You're using the latest version"}
              </p>
            </div>
          </div>
        </div>
        {updateAvailable && (
          <button
            onClick={handleUpdate}
            className="w-full rounded-2xl bg-emerald-600 py-3 text-center font-semibold text-white transition active:scale-[0.98]"
          >
            Update Now
          </button>
        )}

      </section>
    </main>
  );
}