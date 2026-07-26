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
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[65vh] rounded-t-3xl bg-white transition-transform duration-300 ${
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
            <h2 className="text-lg font-bold text-slate-900">Categories</h2>
            <p className="text-xs text-slate-500">Select material category</p>
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
        <div className="overflow-y-auto px-3 pb-2">
          <div className="grid grid-cols-5 gap-2">
            {categories.slice(6).map((cat) => {
              const active =
                activeCategory === cat.id ||
                (activeCategory === null && cat.id === null);

              return (
                <button
                  type="button"
                  key={cat.id ?? "all"}
                  onClick={() => handleSelect(cat.id)}
                  className="flex flex-col items-center gap-1.5 py-2 transition active:scale-95"
                >
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                      active
                        ? "border-slate-900 bg-slate-900 shadow-md"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      draggable={false}
                      className={`h-6 w-6 object-contain select-none ${
                        active ? "brightness-0 invert" : ""
                      }`}
                    />

                    {active && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <span
                    className={`max-w-15 truncate text-center text-[10px] font-medium ${
                      active ? "text-slate-900" : "text-slate-600"
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
 