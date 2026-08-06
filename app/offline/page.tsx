"use client";

import { RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <WifiOff className="mb-5 h-20 w-20 text-red-500" />

      <h1 className="text-2xl font-bold">
        No Internet Connection
      </h1>

      <p className="mt-3 text-gray-500">
        Please check your internet connection.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-8 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
      >
        <RefreshCw className="mr-2 inline h-4 w-4" />
        Retry
      </button>
    </div>
  );
}