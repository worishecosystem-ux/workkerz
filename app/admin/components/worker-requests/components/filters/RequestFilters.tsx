"use client";

import type {
  RequestFilter,
  RequestSort,
} from "../../types";

import RequestSearch from "./RequestSearch";
import RequestSortSelect from "./RequestSort";
import RequestFilterTabs from "./RequestFilterTabs";

type Props = {
  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  activeFilter: RequestFilter;

  onFilterChange: (
    filter: RequestFilter,
  ) => void;

  sort: RequestSort;

  onSortChange: (
    sort: RequestSort,
  ) => void;

  pendingCount: number;

  acceptedCount: number;

  rejectedCount: number;

  completedCount: number;

  cancelledCount: number;
};

export default function RequestFilters({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sort,
  onSortChange,
  pendingCount,
  acceptedCount,
  rejectedCount,
  completedCount,
  cancelledCount,
}: Props) {
  return (
    <section className="mb-4 md:mb-5">
      {/* =================================================
          SEARCH + SORT
      ================================================= */}

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <RequestSearch
            value={search}
            onChange={onSearchChange}
          />
        </div>

        <div className="w-full sm:w-[190px] md:w-[210px]">
          <RequestSortSelect
            value={sort}
            onChange={onSortChange}
          />
        </div>
      </div>

      {/* =================================================
          FILTER TABS
      ================================================= */}

      <div className="mt-3">
        <RequestFilterTabs
          active={activeFilter}
          onChange={onFilterChange}
          pendingCount={pendingCount}
          acceptedCount={acceptedCount}
          rejectedCount={rejectedCount}
          completedCount={completedCount}
          cancelledCount={cancelledCount}
        />
      </div>
    </section>
  );
}