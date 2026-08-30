"use client";

type Props = {
  mobile?: boolean;
  count?: number;
};

export default function RequestSkeleton({
  mobile = false,
  count = 4,
}: Props) {
  return (
    <div
      className={
        mobile
          ? "space-y-2.5"
          : "space-y-3"
      }
    >
      {Array.from({
        length: count,
      }).map((_, index) => (
        <SkeletonCard
          key={index}
          mobile={mobile}
        />
      ))}
    </div>
  );
}

/* =========================================================
   SKELETON CARD
========================================================= */

function SkeletonCard({
  mobile,
}: {
  mobile: boolean;
}) {
  return (
    <div
      className={`
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm
        ${
          mobile
            ? "p-3"
            : "p-4 lg:p-5"
        }
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start gap-2.5">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-100 md:h-11 md:w-11" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="h-3.5 w-40 animate-pulse rounded bg-gray-100" />

              <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>

      {/* =================================================
          META
      ================================================= */}

      <div className="mt-3 grid grid-cols-2 gap-1.5 md:flex md:gap-3">
        <SkeletonChip />

        <SkeletonChip />

        <SkeletonChip />

        {!mobile && (
          <SkeletonChip />
        )}
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-lg bg-gray-200" />

          <div>
            <div className="h-2.5 w-28 animate-pulse rounded bg-gray-200" />

            <div className="mt-1.5 h-2 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        <div className="h-6 w-16 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* =================================================
          REASON
      ================================================= */}

      <div className="mt-2.5 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-lg bg-gray-200" />

          <div>
            <div className="h-2.5 w-20 animate-pulse rounded bg-gray-200" />

            <div className="mt-1.5 h-2 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="h-2.5 w-full animate-pulse rounded bg-gray-100" />

          <div className="h-2.5 w-4/5 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      {/* =================================================
          VIEW
      ================================================= */}

      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
        <div className="h-2.5 w-40 animate-pulse rounded bg-gray-100" />

        <div className="h-3.5 w-3.5 animate-pulse rounded bg-gray-100" />
      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="h-9 animate-pulse rounded-xl bg-gray-100" />

        <div className="h-9 animate-pulse rounded-xl bg-gray-100" />

        <div className="h-9 animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

/* =========================================================
   SKELETON CHIP
========================================================= */

function SkeletonChip() {
  return (
    <div className="flex h-8 min-w-0 items-center gap-1.5 rounded-lg bg-gray-50 px-2">
      <div className="h-3 w-3 shrink-0 animate-pulse rounded bg-gray-200" />

      <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100" />
    </div>
  );
}