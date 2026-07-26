"use client";

export default function EAurixHomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#F0F9FF] animate-pulse">
      {/* Shop Live */}
      <div className="px-4 pt-3">
        <div className="h-16 rounded-2xl bg-white" />
      </div>

      {/* Featured Products */}
      <div className="mt-4 px-4">
        <div className="mb-3 h-6 w-40 rounded-lg bg-slate-200" />

        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-42.5 rounded-2xl bg-white p-3 shadow-sm"
            >
              <div className="h-28 rounded-xl bg-slate-200" />

              <div className="mt-3 space-y-2">
                <div className="h-4 w-4/5 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-200" />

                <div className="mt-3 flex items-center justify-between">
                  <div className="h-5 w-16 rounded bg-slate-200" />
                  <div className="h-8 w-8 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 px-4">
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-white" />
              <div className="mt-2 h-3 w-12 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 px-4 pb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <div className="aspect-square bg-slate-200" />

            <div className="space-y-2 p-3">
              <div className="h-4 w-4/5 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />

              <div className="flex items-center justify-between pt-2">
                <div className="h-5 w-16 rounded bg-slate-200" />
                <div className="h-9 w-9 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}