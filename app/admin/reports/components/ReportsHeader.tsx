"use client";

import { Bug, RefreshCw, Activity } from "lucide-react";

interface Props {
  total: number;
  onRefresh: () => void;
  refreshing?: boolean;
}

export default function ReportsHeader({
  total,
  onRefresh,
  refreshing = false,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
      {/* Background Glow */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-20 left-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <Bug size={34} />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Reports Dashboard</h1>

              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                LIVE
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-slate-300">
              Monitor customer complaints, bug reports, payment issues and
              platform activity.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
            <span className="text-xs uppercase text-slate-300">
              Total Reports : {total}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-emerald-300">
            <Activity size={16} />

            <span className="text-sm font-medium">System Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
