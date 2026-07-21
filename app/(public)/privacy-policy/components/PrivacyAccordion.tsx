"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import PrivacySection from "./PrivacySection";
import chaptersData from "../data";

type Chapter = (typeof chaptersData)[number];

interface PrivacyAccordionProps {
  chapters: Chapter[];
}

export default function PrivacyAccordion({ chapters }: PrivacyAccordionProps) {
  const [openChapter, setOpenChapter] = useState(chapters[0]?.id ?? "");

  return (
    <div className="space-y-3">
      {chapters.map((chapter) => {
        const isOpen = openChapter === chapter.id;

        return (
          <div
            key={chapter.id}
            className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
              isOpen
                ? "border-emerald-500 shadow-lg shadow-emerald-100"
                : "border-slate-200 shadow-sm"
            }`}
          >
            <button
              onClick={() => setOpenChapter(isOpen ? "" : chapter.id)}
              className="w-full"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                      isOpen
                        ? "bg-linear-to-br from-emerald-500 to-green-600 text-white"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 text-left">
                    <h2 className="mt-1 truncate text-sm font-semibold text-slate-900">
                      {chapter.title}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">Tap to view</p>
                  </div>
                </div>

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                    isOpen
                      ? "rotate-180 bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                  <PrivacySection chapter={chapter} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
