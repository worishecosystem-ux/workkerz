"use client";

export default function WorkerCardSkeleton() {
  return (
    <div className="w-full h-85 animate-pulse rounded-3xl border border-gray-200 bg-white p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 min-h-18">
        <div className="h-22 w-18 shrink-0 rounded-2xl bg-slate-200" />

        <div className="flex-1 min-w-0">
          <div className="h-5 w-36 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-28 rounded bg-slate-200" />
          <div className="mt-3 h-6 w-24 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Rating + Location */}
      <div className="mt-5 flex items-center gap-4">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-4 flex-1 rounded bg-slate-200" />
      </div>

      {/* Skills */}
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="h-7 w-16 rounded-full bg-slate-200" />
        <div className="h-7 w-20 rounded-full bg-slate-200" />
        <div className="h-7 w-14 rounded-full bg-slate-200" />
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-100 pt-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="h-5 w-24 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-20 rounded bg-slate-200" />
          </div>

          <div className="h-10 w-32 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}