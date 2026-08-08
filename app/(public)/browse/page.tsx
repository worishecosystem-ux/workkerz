"use client";
import { useState, useEffect, useRef } from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MobileFilterSheet from "@/app/components/MobileFilterSheet";
import WorkCategories from "@/app/components/WorkCategories";
import { FeaturedWorkerSmallCard } from "@/app/components/FeaturedWorkerSmallCard";
import { useMobileNavbar } from "@/app/components/context/MobileNavbarContext";
import { supabase } from "@/lib/supabase";
import BrowseSkeleton from "./component/BrowseSkeleton";
import WorkerCardSkeleton from "@/app/components/WorkerCardSkeleton";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Star,
  MapPin,
  Pencil,
  Home,
  Building2,
  Navigation,
} from "lucide-react";
import { serviceCategories, type ServiceCategory } from "@/app/data/workers";
import { useAdmin } from "@/app/components/context/AdminContext";
import { WorkerCard } from "@/app/components/WorkerCard";

const smartSuggestions = [
  { label: "Electrician", icon: "⚡" },
  { label: "Plumber", icon: "🚰" },
  { label: "Carpenter", icon: "🪚" },
  { label: "Painter", icon: "🎨" },
  { label: "Mason", icon: "🧱" },
  { label: "Welder", icon: "🔥" },
  { label: "Labour", icon: "👷" },
  { label: "Cleaner", icon: "🧹" },
];
const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Starting Price: Low to High" },
  { value: "price_desc", label: "Starting Price: High to Low" },
  { value: "reviews", label: "Most Reviewed" },
];


function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const activeCategory =
    searchParams.get("category") || serviceCategories[0]?.id;
  const [sortBy, setSortBy] = useState("rating");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { workers, loading } = useAdmin();
  const { setShowMobileNavbar } = useMobileNavbar();
  const [minExperience, setMinExperience] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
const filteredWorkers = (workers ?? [])
  .filter((w) => {
    // =====================================================
    // CATEGORY
    // =====================================================

    if (
      activeCategory &&
      activeCategory !== serviceCategories[0]?.id &&
      w.category.trim().toLowerCase() !==
        activeCategory.trim().toLowerCase()
    ) {
      return false;
    }

    // =====================================================
    // LABOUR CHAUK LOCATION
    // =====================================================

    if (selectedLocation) {
      const workerLabourChauk = String(
        (w as any).labour_chauk ||
          (w as any).labourChauk ||
          "",
      )
        .trim()
        .toLowerCase();

      if (
        workerLabourChauk !==
        selectedLocation.trim().toLowerCase()
      ) {
        return false;
      }
    }

    // =====================================================
    // AVAILABILITY
    // =====================================================

    if (availableOnly && !w.available) {
      return false;
    }

    // =====================================================
    // PRICE
    // =====================================================

    if (w.startingPrice > maxPrice) {
      return false;
    }

    // =====================================================
    // SEARCH
    // =====================================================

    if (query) {
      const searchQuery =
        query.trim().toLowerCase();

      const matchesName =
        w.name
          ?.toLowerCase()
          .includes(searchQuery);

      const matchesSpecialty =
        w.specialty
          ?.toLowerCase()
          .includes(searchQuery);

      const matchesSkills =
        Array.isArray(w.skills) &&
        w.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(searchQuery),
        );

      const matchesLabourChauk =
        String(
          (w as any).labour_chauk ||
            (w as any).labourChauk ||
            "",
        )
          .toLowerCase()
          .includes(searchQuery);

      if (
        !matchesName &&
        !matchesSpecialty &&
        !matchesSkills &&
        !matchesLabourChauk
      ) {
        return false;
      }
    }

    return true;
  })
  .sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }

    if (sortBy === "price_asc") {
      return (
        a.startingPrice -
        b.startingPrice
      );
    }

    if (sortBy === "price_desc") {
      return (
        b.startingPrice -
        a.startingPrice
      );
    }

    if (sortBy === "reviews") {
      return (
        b.reviewCount -
        a.reviewCount
      );
    }

    return 0;
  });

  const suggestions =
    query.trim() === ""
      ? []
      : (workers ?? [])
          .filter((worker) => {
            const q = query.toLowerCase();

            return (
              worker.name.toLowerCase().includes(q) ||
              worker.category.toLowerCase().includes(q) ||
              worker.specialty.toLowerCase().includes(q) ||
              worker.skills.some((s) => s.toLowerCase().includes(q))
            );
          })
          .slice(0, 6);
  const locations = Array.from(
  new Set(
    (workers ?? [])
      .map((worker) => {
        const w = worker as any;

        return (
          w.labour_chauk ||
          w.labourChauk ||
          ""
        );
      })
      .filter(Boolean)
      .map((location) =>
        String(location).trim(),
      )
      .filter(Boolean),
  ),
).sort((a, b) =>
  a.localeCompare(b),
);
  const currentSort = sortOptions.find((s) => s.value === sortBy);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Page Header */}
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-50 border-b border-emerald-700/30 bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-700 shadow-lg">
        <div className="mx-auto max-w-7xl px-3 pb-3 pt-12 sm:px-5">
          {/* SEARCH */}
          <div className="relative mt-3 mb-2">
            <div
              className="
          flex h-12 items-center gap-3
          rounded-2xl
          bg-white
          px-3.5
          shadow-xl
          ring-1 ring-black/5
          transition
          focus-within:ring-2
          focus-within:ring-emerald-300
        "
            >
              <Search className="h-5 w-5 shrink-0 text-slate-400" />

              <input
                type="text"
                placeholder="Search workers, skills or services..."
                value={query}
                onFocus={() => {
                  setShowMobileNavbar(false);
                  setShowSuggestions(true);
                }}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />

              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setShowSuggestions(false);
                    setShowMobileNavbar(true);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"
                >
                  <X className="h-3.5 w-3.5 text-slate-500" />
                </button>
              )}

              <button
                onClick={() => setShowFilters(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* SEARCH SUGGESTIONS */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <span className="text-xs font-bold text-slate-800">
                    Workers
                  </span>

                  <span className="text-[10px] text-slate-400">
                    {suggestions.length} found
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {suggestions.map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => {
                        router.push(`/workers/${worker.id}`);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-emerald-50 last:border-0"
                    >
                      <img
                        src={worker.photo || "/worker-placeholder.png"}
                        alt={worker.name}
                        className="h-10 w-10 shrink-0 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {worker.name}
                        </p>

                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {worker.specialty}
                        </p>
                      </div>

                      <ChevronDown className="-rotate-90 h-4 w-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* TOP ROW */}
          <div className="flex h-10 items-center justify-between">
            {/* LOCATION */}
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex min-w-0 items-center gap-2 text-left"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <MapPin className="h-4 w-4 text-white" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-medium text-emerald-200">
                  Your location
                </p>

                <div className="flex max-w-45 items-center gap-1">
                  <span className="truncate text-xs font-bold text-white">
                    {selectedLocation || "Select location"}
                  </span>

                  <ChevronDown
                    className={`h-3 w-3 shrink-0 text-emerald-200 transition-transform ${
                      locationOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              <div className="hidden rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-100 sm:block">
                {filteredWorkers.length} workers nearby
              </div>

              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <Navigation className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
          {/* QUICK SUGGESTIONS */}
          {!query && (
            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              {smartSuggestions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setQuery(item.label);
                    setShowSuggestions(true);
                  }}
                  className="
              flex shrink-0 items-center gap-1.5
              rounded-full
              border border-white/10
              bg-white/10
              px-3 py-1.5
              text-[10px]
              font-semibold
              text-white
              backdrop-blur
              transition
              hover:bg-white/20
              active:scale-95
            "
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LOCATION DROPDOWN */}
        {locationOpen && (
          <div className="absolute left-3 right-3 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl sm:left-auto sm:right-5 sm:w-80">
            <button
              onClick={() => {
                setSelectedLocation("");
                setLocationOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm ${
                selectedLocation === ""
                  ? "bg-emerald-50 font-bold text-emerald-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Navigation className="h-4 w-4" />
              All Locations
            </button>

            <div className="max-h-60 overflow-y-auto border-t border-slate-100">
              {locations.length > 0 ? (
                locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      setSelectedLocation(location);
                      setLocationOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm ${
                      selectedLocation.toLowerCase() === location.toLowerCase()
                        ? "bg-emerald-50 font-bold text-emerald-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{location}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-5 text-center text-xs text-slate-400">
                  No locations available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="px-4  pb-2">
        <div className="mb-2">
          <WorkCategories />
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar Filters */}
          <aside className="hidden xl:block xl:w-85 2xl:w-95 shrink-0">
            <div className="sticky top-24 overflow-hidden rounded-4xl border border-white/60 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              {/* Header */}
              <div className="border-b border-gray-100 bg-linear-to-r from-[#FF5C39] via-[#ff744f] to-[#ff8d70] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-[1.15rem]"
                      style={{ fontWeight: 800, letterSpacing: "-0.03em" }}
                    >
                      Smart Filters
                    </h3>
                    <p className="mt-1 text-sm text-white/80">
                      Find the perfect worker instantly
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                </div>
              </div>
              {/* Location */}

              {/* Body */}
            </div>
          </aside>
          <MobileFilterSheet
            open={showFilters}
            onClose={() => setShowFilters(false)}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            minExperience={minExperience}
            setMinExperience={setMinExperience}
          />
          {/* Results */}
          <div className="flex-1">
            {/* Worker Grid */}
            {filteredWorkers.length > 0 ? (
              <>
                {/* Mobile App */}
                <div className="grid grid-cols-2 gap-3 md:hidden">
                  {filteredWorkers.map((worker) => (
                    <FeaturedWorkerSmallCard key={worker.id} worker={worker} />
                  ))}
                </div>

                {/* Website / Tablet / Desktop */}
                <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-5">
                  {loading
                    ? Array.from({ length: 9 }).map((_, i) => (
                        <WorkerCardSkeleton key={i} />
                      ))
                    : filteredWorkers.map((worker) => (
                        <WorkerCard key={worker.id} worker={worker} />
                      ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-[#0F172A] mb-2" style={{ fontWeight: 600 }}>
                  No workers found
                </h3>
                <p className="text-[#64748B] text-sm">
                  Try adjusting your filters or search query.
                </p>
                <button
                  onClick={() => {
                    setAvailableOnly(false);
                    setMaxPrice(5000);
                    setQuery("");
                    router.push("/browse");
                  }}
                  className="mt-4 text-sm text-[#FF5C39] underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <BrowseContent />
    </Suspense>
  );
}
