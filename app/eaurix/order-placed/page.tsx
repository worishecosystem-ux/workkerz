"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { usePlatform } from "@/app/components/context/PlatformContext";
export default function OrderPlacedPage() {
  const router = useRouter();
const { clearCart } = usePlatform();

useEffect(() => {
  clearCart();

  const timer = setTimeout(() => {
    router.replace("/eaurix/confirmed");
  }, 3000);

  return () => clearTimeout(timer);
}, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-emerald-50 via-white to-sky-50 px-6">

      {/* Background Blur */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative w-full max-w-md rounded-4xl border border-white/60 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl">

        {/* Animated Circle */}
        <div className="relative mx-auto h-36 w-36">

          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-30" />

          <div className="absolute inset-3 rounded-full border-2 border-emerald-300" />

          <div className="absolute inset-6 flex items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-green-600 shadow-xl">

            <CheckCircle2 className="h-16 w-16 text-white" />

          </div>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold text-slate-900">
          Order Placed
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your order has been received successfully.
          <br />
          We are preparing it for confirmation.
        </p>

        {/* Status Card */}

        <div className="mt-8 rounded-2xl bg-emerald-50 p-4">

          <div className="flex items-center justify-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow">

              <PackageCheck className="h-6 w-6 text-emerald-600" />

            </div>

            <div className="text-left">

              <p className="text-sm font-semibold text-slate-900">
                Processing Order
              </p>

              <p className="text-xs text-slate-500">
                Please wait a few seconds...
              </p>

            </div>

          </div>
        </div>

        {/* Progress */}

        <div className="mt-8">

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">

            <div className="h-full w-full animate-[loading_3s_linear_forwards] rounded-full bg-linear-to-r from-emerald-500 to-green-600" />

          </div>

          <p className="mt-4 text-xs tracking-wide text-slate-400 uppercase">
            Redirecting...
          </p>

        </div>

      </div>

    </div>
  );
}