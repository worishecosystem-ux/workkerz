"use client";

import {
  Check,
  ChevronDown,
  Layers3,
} from "lucide-react";
import { useState } from "react";

type Device = "desktop" | "tablet" | "mobile";

type Categories = Record<
  string,
  {
    readonly subcategories: Record<
      string,
      readonly string[]
    >;
  }
>;

type Props = {
  category: string;
  subcategory: string;
  setSubcategory: (value: string) => void;
  categories: Categories;
  device: Device;
};

export default function SubcategorySection({
  category,
  subcategory,
  setSubcategory,
  categories,
  device,
}: Props) {
  const [open, setOpen] = useState(false);

  const subcategories =
    category && categories[category]
      ? Object.keys(
          categories[category].subcategories
        )
      : [];

  const isMobile = device === "mobile";

  // Category change hone par invalid
  // subcategory automatically clear
  if (
    subcategory &&
    !subcategories.includes(subcategory)
  ) {
    setSubcategory("");
  }

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
          Worker Subcategory
        </h2>

        <p className="mt-1 text-xs text-[#6B7280]">
          Select a subcategory
        </p>
      </div>

      {!category ? (
        <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#FAFAFA] px-4 py-4 text-center">
          <Layers3
            size={20}
            className="mx-auto mb-2 text-[#9CA3AF]"
          />

          <p className="text-xs text-[#6B7280]">
            Select a category first
          </p>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={[
              "flex w-full items-center",
              "rounded-xl border",
              "border-[#E5E7EB]",
              "bg-white text-left",
              open
                ? "border-[#FF5C39] ring-2 ring-orange-100"
                : "",
              isMobile
                ? "h-11 px-3"
                : "h-12 px-4",
            ].join(" ")}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1ED]">
              <Layers3
                size={17}
                className="text-[#FF5C39]"
              />
            </div>

            <span
              className={[
                "ml-3 flex-1 truncate text-sm",
                subcategory
                  ? "font-semibold text-[#111827]"
                  : "text-[#9CA3AF]",
              ].join(" ")}
            >
              {subcategory ||
                "Select subcategory"}
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
            <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-xl">
              {subcategories.map((item) => {
                const active =
                  subcategory === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSubcategory(item);
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full items-center",
                      "px-4 py-3 text-left",
                      active
                        ? "bg-[#FFF5F2]"
                        : "hover:bg-[#F8FAFC]",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-8 w-8 shrink-0",
                        "items-center justify-center",
                        "rounded-lg",
                        active
                          ? "bg-[#FF5C39] text-white"
                          : "bg-[#F3F4F6] text-[#64748B]",
                      ].join(" ")}
                    >
                      <Layers3 size={16} />
                    </div>

                    <span
                      className={[
                        "ml-3 flex-1 text-sm",
                        active
                          ? "font-bold text-[#FF5C39]"
                          : "font-medium text-[#374151]",
                      ].join(" ")}
                    >
                      {item}
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
      )}
    </section>
  );
}