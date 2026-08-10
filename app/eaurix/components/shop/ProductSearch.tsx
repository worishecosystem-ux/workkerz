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

  const wrapperRef = useRef<HTMLDivElement | null>(null);

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

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
    >
      {/* =================================================
          SEARCH BOX
      ================================================= */}

      <div
        className="
          flex
          h-9
          w-full
          items-center
          rounded-lg
          border
          border-slate-200
          bg-slate-50
          transition
          focus-within:border-emerald-400
          focus-within:bg-white
          focus-within:ring-2
          focus-within:ring-emerald-50
        "
      >
        {/* Search Icon */}

        <Search
          className="
            ml-3
            h-4
            w-4
            shrink-0
            text-slate-400
          "
          strokeWidth={2}
        />

        {/* Input */}

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
              e.currentTarget.blur();
            }
          }}
          className="
            h-full
            min-w-0
            flex-1
            bg-transparent
            px-2
            text-[12px]
            font-medium
            text-slate-800
            outline-none
            placeholder:text-slate-400
          "
        />

        {/* Clear */}

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setOpen(false);
            }}
            className="
              mr-2
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              text-slate-400
              active:bg-slate-200
            "
          >
            <X
              className="h-3.5 w-3.5"
              strokeWidth={2.2}
            />
          </button>
        )}
      </div>

      {/* =================================================
          SEARCH RESULTS
      ================================================= */}

      {open && search.trim() && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-100
            mt-1
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-lg
          "
        >
          {filtered.length ? (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSearch("");
                  setOpen(false);

                  router.push(
                    `/eaurix/product/${item.id}`,
                  );
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  border-b
                  border-slate-100
                  px-2.5
                  py-2
                  text-left
                  active:bg-slate-50
                "
              >
                {/* Product Image */}

                <div
                  className="
                    h-9
                    w-9
                    shrink-0
                    overflow-hidden
                    rounded-lg
                    bg-slate-50
                  "
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="
                        h-full
                        w-full
                        object-contain
                      "
                    />
                  )}
                </div>

                {/* Product Info */}

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate
                      text-[11px]
                      font-semibold
                      text-slate-800
                    "
                  >
                    {item.name}
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[10px]
                      text-slate-400
                    "
                  >
                    {item.brand}
                  </p>
                </div>

                {/* Price */}

                <span
                  className="
                    shrink-0
                    text-[11px]
                    font-bold
                    text-emerald-600
                  "
                >
                  ₹{item.price}
                </span>
              </button>
            ))
          ) : (
            <div
              className="
                px-3
                py-5
                text-center
                text-[11px]
                text-slate-400
              "
            >
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}