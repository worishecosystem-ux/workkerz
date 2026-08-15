"use client";

import {
  BriefcaseBusiness,
  ChevronDown,
  Minus,
  Plus,
  Users,
} from "lucide-react";

import type { WorkerGroup } from "@/app/components/ProjectWorkerGroups";

interface RequestStep2Props {
  projectName: string;
  setProjectName: (value: string) => void;

  projectType: string;
  setProjectType: (value: string) => void;

  workerGroups: WorkerGroup[];
  setWorkerGroups: (
    value: WorkerGroup[],
  ) => void;

  onNext: () => void;
  onBack: () => void;
}

/* =========================================================
   WORKER TYPES
========================================================= */

const workerTypes = [
  "Labour",
  "Mason",
  "Painter",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Welder",
  "Tile Mason",
  "Bar Bender",
  "Helper",
];

/* =========================================================
   PROJECT TYPES
========================================================= */

const projectTypes = [
  "Construction",
  "House Work",
  "Commercial",
  "Factory",
  "Road Work",
  "Renovation",
  "Other",
];

/* =========================================================
   COMPONENT
========================================================= */

export default function RequestStep2({
  projectName,
  setProjectName,

  projectType,
  setProjectType,

  workerGroups,
  setWorkerGroups,

  onNext,
  onBack,
}: RequestStep2Props) {
  /* =======================================================
     TOTAL WORKERS
  ======================================================= */

  const totalWorkers =
    workerGroups.reduce(
      (total, group) =>
        total +
        Math.max(
          0,
          Number(
            group.workers_required,
          ) || 0,
        ),
      0,
    );

  /* =======================================================
     GET QUANTITY
  ======================================================= */

  function getQuantity(
    category: string,
  ) {
    const group =
      workerGroups.find(
        (item) =>
          item.category ===
          category,
      );

    return group
      ? Number(
          group.workers_required,
        ) || 0
      : 0;
  }

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  function updateQuantity(
    category: string,
    quantity: number,
  ) {
    const safeQuantity =
      Math.max(
        0,
        Math.min(
          100,
          quantity,
        ),
      );

    const existing =
      workerGroups.find(
        (group) =>
          group.category ===
          category,
      );

    /* REMOVE WHEN ZERO */

    if (safeQuantity === 0) {
      setWorkerGroups(
        workerGroups.filter(
          (group) =>
            group.category !==
            category,
        ),
      );

      return;
    }

    /* UPDATE EXISTING */

    if (existing) {
      setWorkerGroups(
        workerGroups.map(
          (group) =>
            group.category ===
            category
              ? {
                  ...group,
                  workers_required:
                    safeQuantity,
                }
              : group,
        ),
      );

      return;
    }

    /* ADD NEW */

    setWorkerGroups([
      ...workerGroups,
      {
        id: `${Date.now()}-${category}`,
        category,
        workers_required:
          safeQuantity,
      },
    ]);
  }

  /* =======================================================
     ADD WORKER
  ======================================================= */

  function addWorkerType(
    category: string,
  ) {
    if (
      getQuantity(category) >
      0
    ) {
      return;
    }

    updateQuantity(
      category,
      1,
    );
  }

  /* =======================================================
     REMOVE WORKER TYPE
  ======================================================= */

  function removeWorkerType(
    category: string,
  ) {
    updateQuantity(
      category,
      0,
    );
  }

  /* =======================================================
     SELECTED TYPES
  ======================================================= */

  const selectedTypes =
    workerTypes.filter(
      (category) =>
        getQuantity(category) >
        0,
    );

  const availableTypes =
    workerTypes.filter(
      (category) =>
        getQuantity(category) ===
        0,
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-[0_10px_40px_rgba(0,0,0,0.05)]
      "
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          border-b
          border-gray-100
          px-4
          py-4
          sm:px-5
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-emerald-600
            "
          >
            <Users className="h-5 w-5" />
          </div>

          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-emerald-600
              "
            >
              Step 2
            </p>

            <h1
              className="
                mt-0.5
                text-base
                font-black
                tracking-tight
                text-gray-950
              "
            >
              Workers Required
            </h1>

            <p
              className="
                mt-0.5
                text-[10px]
                leading-4
                text-gray-500
              "
            >
              Select workers and set the required quantity.
            </p>
          </div>

        </div>
      </div>

      {/* ===================================================
          PROJECT DETAILS
      =================================================== */}

      <div className="space-y-4 p-4 sm:p-5">

        <div>
          <label
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-bold
              text-gray-700
            "
          >
            <BriefcaseBusiness className="h-3.5 w-3.5 text-emerald-600" />

            Project Name

            <span className="text-red-500">
              *
            </span>
          </label>

          <div
            className="
              mt-1.5
              flex
              h-11
              items-center
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-3
              transition

              focus-within:border-emerald-500
              focus-within:bg-white
              focus-within:ring-2
              focus-within:ring-emerald-500/10
            "
          >
            <input
              value={
                projectName
              }
              onChange={(event) =>
                setProjectName(
                  event.target.value,
                )
              }
              placeholder="e.g. House Construction"
              autoComplete="off"
              className="
                min-w-0
                w-full
                bg-transparent
                text-xs
                font-medium
                text-gray-900
                outline-none
                placeholder:text-gray-400
              "
            />
          </div>
        </div>

        {/* =================================================
            PROJECT TYPE
        ================================================= */}

        <div>
          <label
            className="
              text-[10px]
              font-bold
              text-gray-700
            "
          >
            Project Type
            <span className="ml-0.5 text-red-500">
              *
            </span>
          </label>

          <div className="relative mt-1.5">

            <select
              value={
                projectType
              }
              onChange={(event) =>
                setProjectType(
                  event.target.value,
                )
              }
              className="
                h-11
                w-full
                appearance-none
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-3
                pr-9
                text-xs
                font-semibold
                text-gray-800
                outline-none

                focus:border-emerald-500
                focus:bg-white
              "
            >
              {projectTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ),
              )}
            </select>

            <ChevronDown
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-gray-400
              "
            />

          </div>
        </div>

        {/* =================================================
            TOTAL WORKERS
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-emerald-100
            bg-emerald-50/70
            px-3
            py-3
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-wide
                text-emerald-600
              "
            >
              Total Workers
            </p>

            <p className="mt-0.5 text-xs font-bold text-gray-600">
              Workers required for this project
            </p>
          </div>

          <div
            className="
              flex
              h-10
              min-w-10
              items-center
              justify-center
              rounded-xl
              bg-white
              px-3
              text-lg
              font-black
              text-emerald-700
              shadow-sm
            "
          >
            {totalWorkers}
          </div>
        </div>

        {/* =================================================
            SELECTED WORKERS
        ================================================= */}

        <div>

          <div className="mb-2 flex items-center justify-between">

            <label
              className="
                text-[10px]
                font-black
                text-gray-800
              "
            >
              Select Workers
            </label>

            <span
              className="
                text-[9px]
                font-medium
                text-gray-400
              "
            >
              Use + / − to adjust
            </span>

          </div>

          <div className="space-y-2">

            {selectedTypes.length ===
              0 && (
              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-gray-200
                  bg-gray-50
                  px-4
                  py-5
                  text-center
                "
              >
                <Users className="mx-auto h-6 w-6 text-gray-300" />

                <p className="mt-1.5 text-[10px] font-bold text-gray-500">
                  No worker selected
                </p>

                <p className="mt-0.5 text-[9px] text-gray-400">
                  Add a worker type below
                </p>
              </div>
            )}

            {selectedTypes.map(
              (category) => {
                const quantity =
                  getQuantity(
                    category,
                  );

                return (
                  <WorkerRow
                    key={
                      category
                    }
                    category={
                      category
                    }
                    quantity={
                      quantity
                    }
                    onDecrease={() =>
                      updateQuantity(
                        category,
                        quantity -
                          1,
                      )
                    }
                    onIncrease={() =>
                      updateQuantity(
                        category,
                        quantity +
                          1,
                      )
                    }
                    onRemove={() =>
                      removeWorkerType(
                        category,
                      )
                    }
                  />
                );
              },
            )}

          </div>
        </div>

        {/* =================================================
            ADD WORKER TYPE
        ================================================= */}

        {availableTypes.length >
          0 && (
          <div>

            <p
              className="
                mb-2
                text-[10px]
                font-black
                text-gray-700
              "
            >
              + Add Worker Type
            </p>

            <div className="flex flex-wrap gap-1.5">

              {availableTypes.map(
                (category) => (
                  <button
                    key={
                      category
                    }
                    type="button"
                    onClick={() =>
                      addWorkerType(
                        category,
                      )
                    }
                    className="
                      rounded-lg
                      border
                      border-gray-200
                      bg-gray-50
                      px-2.5
                      py-2
                      text-[9px]
                      font-bold
                      text-gray-600
                      transition

                      hover:border-emerald-300
                      hover:bg-emerald-50
                      hover:text-emerald-700

                      active:scale-95
                    "
                  >
                    + {category}
                  </button>
                ),
              )}

            </div>

          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        {selectedTypes.length >
          0 && (
          <div
            className="
              rounded-xl
              border
              border-gray-100
              bg-gray-50
              px-3
              py-3
            "
          >
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Requirement Summary
            </p>

            <p
              className="
                mt-1
                text-[11px]
                font-bold
                leading-5
                text-gray-700
              "
            >
              {selectedTypes
                .map(
                  (category) =>
                    `${category} × ${getQuantity(category)}`,
                )
                .join(", ")}
            </p>
          </div>
        )}

      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div
        className="
          border-t
          border-gray-100
          px-4
          py-3
          sm:px-5
        "
      >
        <p
          className="
            text-center
            text-[9px]
            font-medium
            text-gray-400
          "
        >
          You can add multiple worker types to one request.
        </p>
      </div>

    </section>
  );
}

/* =========================================================
   WORKER ROW
========================================================= */

function WorkerRow({
  category,
  quantity,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  category: string;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="
        flex
        min-h-[58px]
        items-center
        gap-2.5
        rounded-xl
        border
        border-gray-200
        bg-white
        px-3
        py-2
        shadow-sm
      "
    >
      {/* ICON */}

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-emerald-50
          text-emerald-600
        "
      >
        <Users className="h-4 w-4" />
      </div>

      {/* NAME */}

      <div className="min-w-0 flex-1">

        <p
          className="
            truncate
            text-xs
            font-black
            text-gray-900
          "
        >
          {category}
        </p>

        <p
          className="
            mt-0.5
            text-[8px]
            font-medium
            text-gray-400
          "
        >
          Workers required
        </p>

      </div>

      {/* QUANTITY */}

      <div
        className="
          flex
          h-9
          items-center
          overflow-hidden
          rounded-lg
          border
          border-gray-200
          bg-gray-50
        "
      >

        <button
          type="button"
          onClick={
            onDecrease
          }
          disabled={
            quantity <= 1
          }
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            text-gray-500
            transition

            hover:bg-gray-100
            hover:text-gray-800

            active:scale-95

            disabled:cursor-not-allowed
            disabled:opacity-30
          "
          aria-label={`Decrease ${category}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div
          className="
            flex
            h-9
            min-w-9
            items-center
            justify-center
            border-x
            border-gray-200
            bg-white
            px-2
            text-xs
            font-black
            text-gray-900
          "
        >
          {quantity}
        </div>

        <button
          type="button"
          onClick={
            onIncrease
          }
          disabled={
            quantity >= 100
          }
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            text-emerald-600
            transition

            hover:bg-emerald-50

            active:scale-95

            disabled:cursor-not-allowed
            disabled:opacity-30
          "
          aria-label={`Increase ${category}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

      </div>

      {/* REMOVE */}

      <button
        type="button"
        onClick={
          onRemove
        }
        className="
          hidden
          text-[9px]
          font-bold
          text-red-400
          hover:text-red-600
          sm:block
        "
      >
        Remove
      </button>

    </div>
  );
}