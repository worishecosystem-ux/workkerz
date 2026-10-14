
"use client";

import { LoaderCircle } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle
          className="h-9 w-9 animate-spin text-blue-600"
          aria-hidden="true"
        />

        <h2 className="text-base font-semibold text-gray-900">
          Loading work request
        </h2>

        <p className="text-sm text-gray-500">
          Please wait while we fetch the request details.
        </p>
      </div>
    </div>
  );
}
