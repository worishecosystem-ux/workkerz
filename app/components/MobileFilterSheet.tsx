"use client";

import { X } from "lucide-react";

const experienceOptions = [
  { label: "Any", value: 0 },
  { label: "2+ Years", value: 2 },
  { label: "5+ Years", value: 5 },
  { label: "10+ Years", value: 10 },
];

export default function MobileFilterSheet({
  open,
  onClose,
  availableOnly,
  setAvailableOnly,
  maxPrice,
  setMaxPrice,
  minExperience,
  setMinExperience,
}: any) {
  if (!open) return null;

  const resetFilters = () => {
    setAvailableOnly(false);
    setMaxPrice(10000);
    setMinExperience(0);
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
      />

      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 pb-4">
          <h2 className="text-lg font-bold">Filters</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5 pb-28">
          {/* Available */}
          <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
            <div>
              <h3 className="font-semibold">Available Now</h3>
              <p className="text-xs text-gray-500">
                Show only available workers
              </p>
            </div>

            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`relative h-7 w-14 rounded-full transition ${
                availableOnly ? "bg-[#FF5C39]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  availableOnly ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Max Price */}
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Maximum Price</h3>

              <span className="rounded-lg bg-orange-100 px-3 py-1 font-bold text-[#FF5C39]">
                ₹{maxPrice.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#FF5C39]"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>₹100</span>
              <span>₹10,000+</span>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="mb-3 font-semibold">Experience</h3>

            <div className="grid grid-cols-2 gap-3">
              {experienceOptions.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setMinExperience(item.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    minExperience === item.value
                      ? "border-[#FF5C39] bg-orange-50 text-[#FF5C39]"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
          <div className="flex gap-3">
            <button
              onClick={resetFilters}
              className="flex-1 rounded-xl border border-gray-300 py-3 font-semibold"
            >
              Reset
            </button>

            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-[#FF5C39] py-3 font-semibold text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}