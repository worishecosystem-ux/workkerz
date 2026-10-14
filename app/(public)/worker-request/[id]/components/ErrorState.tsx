
"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onBack: () => void;
}

export default function ErrorState({
  message,
  onRetry,
  onBack,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle
            className="h-7 w-7 text-red-600"
            aria-hidden="true"
          />
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          Unable to load work request
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {message}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
