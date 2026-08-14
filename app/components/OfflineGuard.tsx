"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflineGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOffline, setIsOffline] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    if (!native) {
      return;
    }

    const updateNetwork = () => {
      setIsOffline(!navigator.onLine);
    };

    updateNetwork();

    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, []);

  if (isNative && isOffline) {
    return (
      <main className="fixed inset-0 z-[99999] flex min-h-dvh items-center justify-center bg-white px-6">
        <div className="flex w-full max-w-sm flex-col items-center text-center">

          <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <WifiOff
                size={32}
                strokeWidth={2}
                className="text-emerald-600"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            No Internet Connection
          </h1>

          <p className="mt-3 max-w-xs text-sm leading-6 text-gray-500">
            Your internet connection seems to be offline.
            Please check your Wi-Fi or mobile data and try again.
          </p>

          <button
            type="button"
            onClick={() => {
              if (navigator.onLine) {
                setIsOffline(false);
              } else {
                window.location.reload();
              }
            }}
            className="mt-7 flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm active:scale-[0.98]"
          >
            <RefreshCw size={18} />
            Try Again
          </button>

          <p className="mt-5 text-xs text-gray-400">
            Workkerz
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
