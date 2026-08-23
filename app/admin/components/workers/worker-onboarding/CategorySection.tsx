"use client";

import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

type Device = "desktop" | "tablet" | "mobile";

type CategoryData = {
  readonly subcategories: Record<
    string,
    readonly string[]
  >;
};

type Categories = Record<
  string,
  CategoryData
>;

type Props = {
  category: string;
  setCategory: (value: string) => void;
  categories: Categories;
  device: Device;
};

export default function CategorySection({
  category,
  setCategory,
  categories,
  device,
}: Props) {
  const [open, setOpen] = useState(false);

  const names = Object.keys(categories);

  const isMobile = device === "mobile";
  const isTablet = device === "tablet";

  return (
    <section
      className={[
        "rounded-2xl border border-[#E5E7EB]",
        "bg-white shadow-sm",
        isMobile ? "p-3" : "p-5",
      ].join(" ")}
    >
      <div className="mb-4">
        <h2
          className={[
            "font-bold text-[#111827]",
            isMobile ? "text-base" : "text-lg",
          ].join(" ")}
        >
          Worker Category
        </h2>

        <p className="mt-1 text-xs text-[#6B7280]">
          Select the worker's main category
        </p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={[
            "flex w-full items-center rounded-xl",
            "border border-[#E5E7EB] bg-white",
            "text-left",
            open
              ? "border-[#FF5C39] ring-2 ring-orange-100"
              : "",
            isMobile
              ? "h-11 px-3"
              : isTablet
                ? "h-12 px-4"
                : "h-11 px-4",
          ].join(" ")}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1ED]">
            <BriefcaseBusiness
              size={17}
              className="text-[#FF5C39]"
            />
          </div>

          <span
            className={[
              "ml-3 flex-1 truncate text-sm",
              category
                ? "font-semibold text-[#111827]"
                : "text-[#9CA3AF]",
            ].join(" ")}
          >
            {category || "Select category"}
          </span>

          <ChevronDown
            size={18}
            className={[
              "text-[#6B7280] transition-transform",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 z-40 mt-2 max-h-72 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-xl">
            {names.map((name) => {
              const active = category === name;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setCategory(name);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center px-4 py-3 text-left",
                    active
                      ? "bg-[#FFF5F2]"
                      : "hover:bg-[#F8FAFC]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      active
                        ? "bg-[#FF5C39] text-white"
                        : "bg-[#F3F4F6] text-[#64748B]",
                    ].join(" ")}
                  >
                    <BriefcaseBusiness size={17} />
                  </div>

                  <span
                    className={[
                      "ml-3 flex-1 text-sm",
                      active
                        ? "font-bold text-[#FF5C39]"
                        : "font-medium text-[#374151]",
                    ].join(" ")}
                  >
                    {name}
                  </span>

                  {active && (
                    <Check
                      size={18}
                      className="text-[#FF5C39]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}