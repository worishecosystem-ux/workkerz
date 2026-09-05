"use client";

import { useState } from "react";
import {
  Brush,
  Car,
  Check,
  ChefHat,
  Droplets,
  Hammer,
  HardHat,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  SprayCan,
  SquareStack,
  Users,
  Wrench,
  Zap,
  X,
} from "lucide-react";

import type { WorkerGroup } from "@/app/components/ProjectWorkerGroups";

interface RequestStep2Props {
  projectName: string;
  setProjectName: (value: string) => void;
  projectType: string;
  setProjectType: (value: string) => void;
  workerGroups: WorkerGroup[];
  setWorkerGroups: (value: WorkerGroup[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const workerTypes = [
  "Labour",
  "Driver",
  "Mechanic",
  "Painter",
  "Washer",
  "Office Worker",
  "Home Services",
  "Home Contractor",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Construction",
  "Mason",
  "Tile Mason",
  "Bar Bender",
  "Welder",
  "Helper",
  "Factory",
  "Restaurant",
  "Salon & Beauty",
  "Security",
  "Event Services",
  "Cleaner / Sweeper",
  "Daily-Wage / Skilled Trades",
  "Tiles & Marble Contractor",
  "Mason / Bricklayer",
  "AC Technician",
  "Cook / Kitchen Helper",
  "Pest Control Service",
  "Car Wash Services",
];

const popularCategories = [
  ["Cleaner / Sweeper", Sparkles, "text-purple-500"],
  ["Daily-Wage / Skilled Trades", HardHat, "text-orange-400"],
  ["Painter", Brush, "text-pink-500"],
  ["Tiles & Marble Contractor", SquareStack, "text-purple-500"],
  ["Mason / Bricklayer", Hammer, "text-amber-700"],
  ["Plumber", Droplets, "text-sky-500"],
  ["AC Technician", Wrench, "text-cyan-500"],
  ["Electrician", Zap, "text-orange-500"],
  ["Cook / Kitchen Helper", ChefHat, "text-red-500"],
  ["Car Wash Services", Car, "text-sky-500"],
  ["Pest Control Service", SprayCan, "text-pink-500"],
  ["Security", ShieldCheck, "text-slate-500"],
] as const;

function getIcon(category: string) {
  if (category.includes("Cleaner")) return Sparkles;
  if (category.includes("Painter")) return Brush;
  if (category.includes("Plumber")) return Droplets;
  if (category.includes("Electrician")) return Zap;
  if (category.includes("Mason")) return Hammer;
  if (category.includes("Tile")) return SquareStack;
  if (category.includes("AC")) return Wrench;
  if (category.includes("Cook")) return ChefHat;
  if (category.includes("Car Wash")) return Car;
  if (category.includes("Pest")) return SprayCan;
  if (category.includes("Security")) return ShieldCheck;
  if (category.includes("Mechanic")) return Wrench;
  if (category.includes("Carpenter")) return Hammer;

  return HardHat;
}

function getColor(category: string) {
  if (
    category.includes("Cleaner") ||
    category.includes("Painter") ||
    category.includes("Pest")
  ) {
    return "text-pink-500";
  }

  if (
    category.includes("Plumber") ||
    category.includes("Car Wash")
  ) {
    return "text-sky-500";
  }

  if (category.includes("Electrician")) return "text-orange-500";
  if (category.includes("AC")) return "text-cyan-500";
  if (category.includes("Mason")) return "text-amber-700";

  return "text-slate-500";
}

export default function RequestStep2({
  projectName,
  setProjectName,
  projectType,
  setProjectType,
  workerGroups,
  setWorkerGroups,
}: RequestStep2Props) {
  const [quantityCategory, setQuantityCategory] =
    useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);

  const getQuantity = (category: string) =>
    Number(
      workerGroups.find(
        (item) => item.category === category,
      )?.workers_required || 0,
    );

  const openQuantity = (category: string) => {
    const existing = getQuantity(category);

    setQuantity(existing > 0 ? existing : 1);
    setQuantityCategory(category);
  };

  const saveQuantity = () => {
    if (!quantityCategory) return;

    const cleanQuantity = Math.max(
      1,
      Math.min(999, Number(quantity) || 1),
    );

    const exists = workerGroups.some(
      (item) => item.category === quantityCategory,
    );

    if (exists) {
      setWorkerGroups(
        workerGroups.map((item) =>
          item.category === quantityCategory
            ? {
                ...item,
                workers_required: cleanQuantity,
              }
            : item,
        ),
      );
    } else {
      setWorkerGroups([
        ...workerGroups,
        {
          id: `${Date.now()}-${quantityCategory}`,
          category: quantityCategory,
          workers_required: cleanQuantity,
        },
      ]);
    }

    setQuantityCategory(null);
  };

  const removeCategory = (category: string) => {
    setWorkerGroups(
      workerGroups.filter(
        (item) => item.category !== category,
      ),
    );
  };

  const totalWorkers = workerGroups.reduce(
    (sum, item) =>
      sum +
      Math.max(
        0,
        Number(item.workers_required) || 0,
      ),
    0,
  );

  const QuantityIcon = quantityCategory
    ? getIcon(quantityCategory)
    : HardHat;

  return (
    <>
      {/* =====================================================
          STEP 2 FORM
          ONLY THIS AREA SCROLLS
      ===================================================== */}

      <section
        className="
        relative
        mx-auto
        flex
        w-full
        max-w-[520px]
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-[0_8px_30px_rgba(0,0,0,0.06)]

        h-[calc(100dvh-185px)]
        min-h-[430px]
        max-h-[680px]

        sm:h-[calc(96dvh-185px)]
        sm:min-h-[480px]
        sm:max-h-[650px]
      "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0 border-b border-gray-100 bg-white px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <HardHat className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-black leading-tight tracking-tight text-gray-950">
                Work Categories
              </h1>

              <p className="text-[9px] leading-3 text-gray-500">
                Select workers and required quantity.
              </p>
            </div>

            {workerGroups.length > 0 && (
              <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black text-emerald-600">
                {totalWorkers} workers
              </span>
            )}
          </div>
        </div>

        {/* =================================================
            SCROLL AREA
        ================================================= */}

        <div
          className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          scroll-smooth
          px-3
          pb-30
          pt-3
          [scrollbar-width:thin]
          [-webkit-overflow-scrolling:touch]
        "
        >
          <div className="space-y-2.5">
            {/* =================================================
                PROJECT NAME
            ================================================= */}

            <div>
              <label className="text-[9px] font-bold leading-none text-gray-700">
                Project Name
              </label>

              <div className="mt-1 flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10">
                <HardHat className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                <input
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(event.target.value)
                  }
                  placeholder="e.g. House Construction"
                  maxLength={100}
                  className="ml-2 min-w-0 w-full bg-transparent text-[10px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* =================================================
                PROJECT TYPE
            ================================================= */}

            <div>
              <label className="text-[9px] font-bold leading-none text-gray-700">
                Project Type
              </label>

              <div className="mt-1 grid grid-cols-3 gap-1.5">
                {[
                  "Construction",
                  "Renovation",
                  "Commercial",
                  "Residential",
                  "Industrial",
                  "Other",
                ].map((type) => {
                  const active = projectType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setProjectType(type)
                      }
                      className={`h-8 rounded-lg border px-1 text-[8px] font-black transition active:scale-[0.97] ${
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                SELECTED WORKERS
            ================================================= */}

            {workerGroups.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[9px] font-bold leading-none text-gray-700">
                    Selected Workers
                  </label>

                  <button
                    type="button"
                    onClick={() => setWorkerGroups([])}
                    className="text-[8px] font-bold text-gray-400 active:scale-95"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-1.5">
                  {workerGroups.map((item) => {
                    const Icon = getIcon(item.category);

                    const itemQuantity = Math.max(
                      1,
                      Number(item.workers_required) || 1,
                    );

                    return (
                      <div
                        key={item.id}
                        className="flex min-h-10 items-center rounded-lg border border-emerald-100 bg-emerald-50/60 px-2"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white">
                          <Icon
                            className={`h-4 w-4 ${getColor(
                              item.category,
                            )}`}
                          />
                        </div>

                        <div className="ml-2 min-w-0 flex-1">
                          <p className="truncate text-[9px] font-black text-gray-800">
                            {item.category}
                          </p>

                          <p className="text-[8px] font-medium text-emerald-600">
                            {itemQuantity}{" "}
                            {itemQuantity === 1
                              ? "Worker"
                              : "Workers"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openQuantity(item.category)
                          }
                          className="mr-1 rounded-md bg-white px-2 py-1 text-[8px] font-black text-emerald-600 shadow-sm"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeCategory(item.category)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 active:scale-90"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================
                POPULAR CATEGORIES
            ================================================= */}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[9px] font-bold leading-none text-gray-700">
                  Popular Categories
                </label>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {popularCategories.map(
                  ([name, Icon, color]) => {
                    const selected =
                      getQuantity(name) > 0;

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          openQuantity(name)
                        }
                        className={`relative flex h-[76px] flex-col items-center justify-center rounded-lg border px-1 text-center transition active:scale-[0.97] ${
                          selected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {selected && (
                          <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-500 px-0.5 text-[7px] font-black text-white">
                            {getQuantity(name)}
                          </span>
                        )}

                        <Icon
                          className={`h-6 w-6 stroke-[1.5] ${color}`}
                        />

                        <span className="mt-1 line-clamp-2 text-[7.5px] font-bold leading-[10px] text-gray-700">
                          {name}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* =================================================
                ALL CATEGORIES
            ================================================= */}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[9px] font-bold leading-none text-gray-700">
                  All Categories
                </label>

                {totalWorkers > 0 && (
                  <span className="text-[8px] font-bold text-emerald-600">
                    {totalWorkers} total
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {workerTypes.map((category) => {
                  const selected =
                    getQuantity(category) > 0;

                  const Icon = getIcon(category);

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        openQuantity(category)
                      }
                      className={`flex h-9 items-center rounded-lg border px-2 text-left transition active:scale-[0.98] ${
                        selected
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${getColor(
                          category,
                        )}`}
                      />

                      <span className="ml-1.5 min-w-0 flex-1 truncate text-[9px] font-bold text-gray-700">
                        {category}
                      </span>

                      {selected ? (
                        <span className="ml-1 flex h-4 min-w-4 shrink-0 items-center justify-center rounded bg-emerald-500 px-0.5 text-[7px] font-black text-white">
                          {getQuantity(category)}
                        </span>
                      ) : (
                        <span className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 bg-white">
                          <Plus className="h-2.5 w-2.5 text-gray-400" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EXTRA BOTTOM SPACE */}
            <div className="h-10 shrink-0" />
          </div>
        </div>
      </section>

      {/* =====================================================
          QUANTITY POPUP
      ===================================================== */}

      {quantityCategory && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
          onClick={() => setQuantityCategory(null)}
        >
          <div
            className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* POPUP HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <QuantityIcon
                    className={`h-4 w-4 ${getColor(
                      quantityCategory,
                    )}`}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.1em] text-emerald-600">
                    Worker Requirement
                  </p>

                  <h3 className="truncate text-[12px] font-black text-gray-900">
                    {quantityCategory}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setQuantityCategory(null)
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 active:scale-90"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* PREVIEW */}

            <div className="px-3 pt-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <QuantityIcon
                      className={`h-7 w-7 ${getColor(
                        quantityCategory,
                      )}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-gray-800">
                      {quantityCategory}
                    </p>

                    <p className="mt-0.5 text-[8px] font-medium text-gray-500">
                      Required workers
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg bg-white p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) =>
                          Math.max(
                            1,
                            value - 1,
                          ),
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-700 active:scale-90"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <span className="w-6 text-center text-sm font-black text-gray-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) =>
                          Math.min(
                            999,
                            value + 1,
                          ),
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white active:scale-90"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* WORKER PREVIEW */}

              <div className="mt-2.5 flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />

                  <span className="text-[9px] font-bold text-gray-600">
                    Worker Preview
                  </span>
                </div>

                <span className="text-[9px] font-black text-emerald-600">
                  {quantity}{" "}
                  {quantity === 1
                    ? "Worker"
                    : "Workers"}
                </span>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex gap-2 px-3 py-3">
              <button
                type="button"
                onClick={() =>
                  setQuantityCategory(null)
                }
                className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 text-[10px] font-black text-gray-600 active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveQuantity}
                className="h-9 flex-[1.5] rounded-lg bg-emerald-600 text-[10px] font-black text-white active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Add {quantity}{" "}
                  {quantity === 1
                    ? "Worker"
                    : "Workers"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}