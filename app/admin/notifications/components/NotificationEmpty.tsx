"use client";

import { Inbox } from "lucide-react";

export default function NotificationEmpty() {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
          <Inbox size={28} />
        </div>

        <h3 className="mt-4 text-base font-bold text-gray-900">
          No notifications found
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Create your first notification
          to get started.
        </p>
      </div>
    </div>
  );
}