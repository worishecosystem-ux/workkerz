"use client";

import { X } from "lucide-react";

interface Category {
  id: string | null;
  name: string;
  image: string;
}

interface CategoriesDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategory: string | null;
  setActiveCategory: (id: string | null) => void;
}

export default function CategoriesDrawer({
  open,
  onClose,
  categories,
  activeCategory,
  setActiveCategory,
}: CategoriesDrawerProps) {
  const handleSelect = (id: string | null) => {
    setActiveCategory(id);

    // Close after state update
    requestAnimationFrame(() => {
      onClose();
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[82vh] rounded-t-[28px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Categories
            </h2>
            <p className="text-xs text-slate-500">
              Select material category
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition active:scale-95"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        {/* Categories */}
        <div className="overflow-y-auto px-3 pb-24">
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => {
              const active =
                activeCategory === cat.id ||
                (activeCategory === null && cat.id === null);

              return (
                <button
                  type="button"
                  key={cat.id ?? "all"}
                  onClick={() => handleSelect(cat.id)}
                  className={`relative flex flex-col items-center rounded-xl border p-2 transition-all active:scale-95 ${
                    active
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {/* Active Indicator */}
                  {active && (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  )}

                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                      active
                        ? "bg-linear-to-br from-emerald-500 to-teal-500"
                        : "bg-slate-100"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      draggable={false}
                      className="h-7 w-7 object-contain select-none"
                    />
                  </div>

                  {/* Name */}
                  <span
                    className={`mt-2 line-clamp-2 text-center text-[11px] font-medium leading-tight ${
                      active ? "text-emerald-700" : "text-slate-700"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}