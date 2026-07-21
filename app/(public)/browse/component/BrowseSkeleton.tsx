"use client";

function WorkerCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border bg-white p-4">
      <div className="h-44 rounded-2xl bg-slate-200" />

      <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />

      <div className="mt-4 flex gap-2">
        <div className="h-8 w-20 rounded-full bg-slate-200" />
        <div className="h-8 w-20 rounded-full bg-slate-200" />
      </div>

      <div className="mt-5 h-10 rounded-xl bg-slate-200" />
    </div>
  );
}

export default function BrowseSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="h-14 animate-pulse rounded-2xl bg-slate-200" />

          <div className="mt-3 flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-20 animate-pulse rounded-full bg-slate-200"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Categories */}
        <div className="mb-5 flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
              <div className="mt-2 h-3 w-14 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Workers */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <WorkerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}