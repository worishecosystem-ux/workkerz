"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { useMemo } from "react";

export type WorkerRequirement = {
  id: string;
  workerType: "Company" | "Contractor" | "Individual";
  category: string;
  workersRequired: number;
};

type WorkerRequirementBuilderProps = {
  value: WorkerRequirement[];
  onChange: (requirements: WorkerRequirement[]) => void;
};

const WORKER_TYPES = [
  {
    id: "Individual",
    label: "Individual",
    description: "Single professional worker",
  },
  {
    id: "Contractor",
    label: "Contractor",
    description: "Contractor / team",
  },
  {
    id: "Company",
    label: "Company",
    description: "Company / agency",
  },
] as const;

const WORKER_CATEGORIES = [
  "Labour",
  "Mistry",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "Welder",
  "Mechanic",
  "Driver",
  "Tiles Worker",
  "Shuttering Worker",
  "Bar Bender",
  "AC Technician",
  "Mason",
  "Helper",
  "Security Guard",
  "Cleaner",
  "Other",
];

export default function WorkerRequirementBuilder({
  value,
  onChange,
}: WorkerRequirementBuilderProps) {
  const totalWorkers = useMemo(
    () =>
      value.reduce(
        (total, requirement) =>
          total + Math.max(1, Number(requirement.workersRequired) || 1),
        0,
      ),
    [value],
  );

  function createRequirement(): WorkerRequirement {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      workerType: "Individual",
      category: "Labour",
      workersRequired: 1,
    };
  }

  function addRequirement() {
    onChange([...value, createRequirement()]);
  }

  function removeRequirement(id: string) {
    if (value.length === 1) {
      return;
    }

    onChange(value.filter((item) => item.id !== id));
  }

  function updateRequirement(
    id: string,
    field: keyof WorkerRequirement,
    fieldValue: string | number,
  ) {
    onChange(
      value.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: fieldValue,
            }
          : item,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {/* HEADER */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-gray-950">
              Worker Requirements
            </h3>

            <p className="text-[10px] text-gray-500">
              Add one or more types of workers
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1">
          <span className="text-[10px] font-extrabold text-emerald-700">
            {totalWorkers} workers
          </span>
        </div>
      </div>

      {/* REQUIREMENTS */}

      <div className="space-y-2.5">
        {value.map((requirement, index) => (
          <div
            key={requirement.id}
            className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3"
          >
            {/* ROW HEADER */}

            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Worker {index + 1}
              </p>

              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRequirement(requirement.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove worker requirement"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* WORKER TYPE */}

            <div className="mb-2.5">
              <p className="mb-1.5 text-[10px] font-bold text-gray-500">
                Worker type
              </p>

              <div className="grid grid-cols-3 gap-1.5">
                {WORKER_TYPES.map((type) => {
                  const selected = requirement.workerType === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        updateRequirement(
                          requirement.id,
                          "workerType",
                          type.id,
                        )
                      }
                      className={[
                        "rounded-xl border px-2 py-2 text-left transition",
                        selected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 bg-white hover:border-emerald-200",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-[10px] font-extrabold",
                          selected
                            ? "text-emerald-700"
                            : "text-gray-800",
                        ].join(" ")}
                      >
                        {type.label}
                      </p>

                      <p className="mt-0.5 line-clamp-1 text-[8px] text-gray-400">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY + COUNT */}

            <div className="grid grid-cols-[1fr_90px] gap-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-gray-500">
                  Worker / Skill
                </label>

                <select
                  value={requirement.category}
                  onChange={(event) =>
                    updateRequirement(
                      requirement.id,
                      "category",
                      event.target.value,
                    )
                  }
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
                  value={requirement.workersRequired}
                  onChange={(event) => {
                    const number = Math.max(
                      1,
                      Number(event.target.value) || 1,
                    );

                    updateRequirement(
                      requirement.id,
                      "workersRequired",
                      number,
                    );
                  }}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-center text-xs font-extrabold text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MORE */}

      <button
        type="button"
        onClick={addRequirement}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 text-xs font-extrabold text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50"
      >
        <Plus className="h-4 w-4" />
        Add More Worker
      </button>

      {/* SUMMARY */}

      {value.length > 1 && (
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {value.map((requirement) => (
              <span
                key={requirement.id}
                className="text-[9px] font-semibold text-gray-500"
              >
                {requirement.workersRequired} × {requirement.category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}