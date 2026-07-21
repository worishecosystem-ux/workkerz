"use client";

import { Inbox } from "lucide-react";

export default function EmptyReports() {
  return (
    <div className="rounded-3xl border border-dashed bg-white py-20 text-center">

      <Inbox
        className="mx-auto mb-5 text-slate-400"
        size={50}
      />

      <h2 className="text-xl font-semibold">
        No Reports Found
      </h2>

      <p className="mt-2 text-slate-500">
        Reports submitted by users will appear here.
      </p>

    </div>
  );
}