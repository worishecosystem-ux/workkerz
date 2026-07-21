"use client";

export default function ReportsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Header */}

      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">

        <div className="h-8 w-64 rounded-lg bg-slate-200" />

        <div className="mt-4 h-4 w-96 rounded bg-slate-200" />

      </div>

      {/* Stats */}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">

              <div>

                <div className="h-4 w-24 rounded bg-slate-200" />

                <div className="mt-4 h-8 w-16 rounded bg-slate-200" />

                <div className="mt-4 h-3 w-20 rounded bg-slate-200" />

              </div>

              <div className="h-14 w-14 rounded-2xl bg-slate-200" />

            </div>
          </div>
        ))}

      </div>

      {/* Filters */}

      <div className="mt-6 animate-pulse rounded-3xl border bg-white p-6">

        <div className="flex flex-col gap-4 lg:flex-row">

          <div className="h-12 flex-1 rounded-2xl bg-slate-200" />

          <div className="h-12 w-40 rounded-2xl bg-slate-200" />

          <div className="h-12 w-40 rounded-2xl bg-slate-200" />

          <div className="h-12 w-32 rounded-2xl bg-slate-200" />

          <div className="h-12 w-36 rounded-2xl bg-slate-200" />

        </div>

      </div>

      {/* Table */}

      <div className="mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm">

        {/* Table Header */}

        <div className="grid grid-cols-8 border-b bg-slate-50 p-5">

          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-20 rounded bg-slate-200"
            />
          ))}

        </div>

        {/* Rows */}

        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-8 items-center border-b p-5 animate-pulse"
          >

            <div className="h-14 w-14 rounded-xl bg-slate-200" />

            <div>
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-24 rounded bg-slate-200" />
            </div>

            <div className="h-4 w-24 rounded bg-slate-200" />

            <div className="h-8 w-20 rounded-full bg-slate-200" />

            <div className="h-8 w-28 rounded-xl bg-slate-200" />

            <div>
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-24 rounded bg-slate-200" />
            </div>

            <div className="h-4 w-24 rounded bg-slate-200" />

            <div className="flex justify-end">

              <div className="h-10 w-10 rounded-xl bg-slate-200" />

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}