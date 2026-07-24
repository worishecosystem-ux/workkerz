"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  price: number;
}

interface ProductSearchProps {
  products: Product[];
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

export default function ProductSearch({
  products,
  search,
  setSearch,
  className = "",
}: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return [];

    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [products, search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-2xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />

        <input
          value={search}
          type="search"
          enterKeyHint="search"
          placeholder="Search products..."
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur(); // keyboard hide
            }
          }}
          className="h-12 w-full bg-transparent pl-11 pr-11 text-sm text-white placeholder:text-slate-300 outline-none"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && search.trim() && (
        <div className="absolute left-0 right-0 top-full z-100 mt-2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          {filtered.length ? (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSearch("");
                  setOpen(false);
                  router.push(`/eaurix/product/${item.id}`);
                }}
                className="flex w-full items-center gap-3 border-b border-slate-800 px-3 py-3 text-left transition hover:bg-slate-800"
              >
                <div className="h-10 w-10 overflow-hidden rounded-xl bg-white">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {item.name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {item.brand}
                  </p>
                </div>

                <span className="text-sm font-bold text-emerald-400">
                  ₹{item.price}
                </span>
              </button>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-slate-400">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
