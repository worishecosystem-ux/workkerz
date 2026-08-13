"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { useMemo } from "react";

export type WorkerGroup = {
  id: string;
  category: string;
  workers_required: number;
};

type ProjectWorkerGroupsProps = {
  value: WorkerGroup[];
  onChange: (groups: WorkerGroup[]) => void;
};

const WORKER_CATEGORIES = [
  "Labour",
  "Mistry",
  "Painter",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Welder",
  "Tiles Worker",
  "Shuttering Worker",
  "Bar Bender",
  "Helper",
  "Mason",
  "Mechanic",
  "Driver",
  "AC Technician",
  "Security Guard",
  "Cleaner",
  "Other",
];

function createWorkerGroup(): WorkerGroup {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    category: "Labour",
    workers_required: 1,
  };
}

export default function ProjectWorkerGroups({
  value,
  onChange,
}: ProjectWorkerGroupsProps) {
  const totalWorkers = useMemo(() => {
    return value.reduce(
      (total, group) =>
        total + Math.max(1, Number(group.workers_required) || 1),
      0,
    );
  }, [value]);

  function addGroup() {
    onChange([...value, createWorkerGroup()]);
  }

  function removeGroup(id: string) {
    if (value.length === 1) {
      return;
    }

    onChange(value.filter((group) => group.id !== id));
  }

  function updateCategory(id: string, category: string) {
    onChange(
      value.map((group) =>
        group.id === id
          ? {
              ...group,
              category,
            }
          : group,
      ),
    );
  }

  function updateCount(id: string, count: number) {
    onChange(
      value.map((group) =>
        group.id === id
          ? {
              ...group,
              workers_required: Math.max(1, count || 1),
            }
          : group,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {/* HEADER */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-gray-950">
              Worker Requirements
            </h3>

            <p className="text-[10px] text-gray-500">
              Add workers required for this project
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1">
          <span className="text-[10px] font-extrabold text-emerald-700">
            {totalWorkers} Workers
          </span>
        </div>
      </div>

      {/* GROUPS */}

      <div className="space-y-2.5">
        {value.map((group, index) => (
          <div
            key={group.id}
            className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3"
          >
            {/* GROUP HEADER */}

            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                Worker Group {index + 1}
              </span>

              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove worker group"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* CATEGORY + COUNT */}

            <div className="grid grid-cols-[1fr_85px] gap-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-gray-500">
                  Worker
                </label>

                <select
                  value={group.category}
                  onChange={(event) =>
                    updateCategory(group.id, event.target.value)
                  }
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  {WORKER_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-gray-500">
                  Quantity
                </label>

                <input
                  type="number"
                  min={1}
                  max={999}
                  value={group.workers_required}
                  onChange={(event) =>
                    updateCount(
                      group.id,
                      Number(event.target.value),
                    )
                  }
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-2 text-center text-sm font-extrabold text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* SMALL SUMMARY */}

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] text-gray-400">
                Required workers
              </span>

              <span className="text-[10px] font-extrabold text-emerald-600">
                {group.category} × {group.workers_required}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MORE */}

      <button
        type="button"
        onClick={addGroup}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 text-xs font-extrabold text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50"
      >
        <Plus className="h-4 w-4" />
        Add More Worker Group
      </button>

      {/* SUMMARY */}

      {value.length > 1 && (
        <div className="rounded-xl border border-gray-100 bg-white px-3 py-2.5">
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {value.map((group) => (
              <span
                key={group.id}
                className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-600"
              >
                {group.category} × {group.workers_required}
              </span>
            ))}
          </div>

          <div className="mt-2 border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-500">
                Total Workers
              </span>

              <span className="text-sm font-black text-emerald-600">
                {totalWorkers}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}