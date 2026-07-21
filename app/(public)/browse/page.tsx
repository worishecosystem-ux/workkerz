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
const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home className="w-4 h-4 text-orange-500" />;

    case "office":
      return <Building2 className="w-4 h-4 text-blue-500" />;

    default:
      return <MapPin className="w-4 h-4 text-gray-500" />;
  }
};

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
  const filteredWorkers = (workers ?? [])
    .filter((w) => {
      if (
        activeCategory &&
        activeCategory !== serviceCategories[0]?.id &&
        w.category !== activeCategory
      )
        return false;
      if (availableOnly && !w.available) return false;
      if (w.startingPrice > maxPrice) return false;
      if (
        query &&
        !w.name.toLowerCase().includes(query.toLowerCase()) &&
        !w.specialty.toLowerCase().includes(query.toLowerCase()) &&
        !w.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_asc") return a.startingPrice - b.startingPrice;

      if (sortBy === "price_desc") return b.startingPrice - a.startingPrice;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
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
  const currentSort = sortOptions.find((s) => s.value === sortBy);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Page Header */}
      <div className="fixed inset-x-0 top-0 z-999 border-b border-emerald-700 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600 pt-2 pb-4">
        <div className="max-w-7xl mx-auto px-4 mt-10">
          {/* Search */}
          <div className="relative mnp w-full max-w-2xl">
            {/* Search Bar */}

            <div
              className="
      flex items-center
      h-14
      rounded-2xl
      bg-white
      border border-gray-200
      px-4
      shadow-lg
      transition-all
      focus-within:border-sky-500
      focus-within:ring-4
      focus-within:ring-sky-100
    "
            >
              <Search className="w-5 h-5 text-gray-400 mr-3" />

              <input
                type="text"
                placeholder="Search workers, skills or specialty..."
                value={query}
                onFocus={() => {
                  setShowMobileNavbar(false);
                  setShowSuggestions(true);
                }}
                onBlur={() => {
                  setShowMobileNavbar(true);
                }}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="flex-1 outline-none text-gray-800 placeholder:text-gray-400"
              />

              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setShowSuggestions(false);
                    setShowMobileNavbar(true);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Smart Suggestions */}
            {!query && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {smartSuggestions.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setQuery(item.label);
                      setShowSuggestions(true);
                    }}
                    className="
          group inline-flex items-center gap-1
          h-7 px-2.5
          rounded-full
          bg-orange-50
          border border-orange-200
          text-[11px] font-medium text-orange-700
          hover:bg-orange-500
          hover:border-orange-500
          hover:text-white
          active:scale-95
          transition-all duration-200
        "
                  >
                    <span className="text-xs leading-none group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>

                    <span className="leading-none whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {/* Dropdown */}

            {showSuggestions && suggestions.length > 0 && (
              <div
                className="
        absolute top-16 left-0 right-0
        bg-white
        rounded-2xl
        shadow-2xl
        border
        overflow-hidden
        z-50
      "
              >
                <div className="flex items-center justify-between px-5 py-2 border-b bg-gray-50">
                  <span className="font-semibold text-gray-800">Workers</span>

                  <span className="text-sm text-gray-500">
                    {suggestions.length} found
                  </span>
                </div>

                <div className="max-h-70 overflow-y-auto">
                  {suggestions.map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => {
                        router.push(`/workers/${worker.id}`);
                        setShowSuggestions(false);
                      }}
                      className="
        w-full
        flex
        items-center
        gap-3
        px-6
        py-2
        hover:bg-sky-50
        active:bg-sky-100
        transition
        border-b
        border-gray-100
        last:border-0
      "
                    >
                      {/* Worker Image */}
                      <img
                        src={worker.photo || "/worker-placeholder.png"}
                        alt={worker.name}
                        className="w-10 h-10 rounded-full object-contain-content shrink-0"
                      />

                      {/* Name + Specialty */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 px-2">
                          <h3 className="text-sm font-semibold text-lime-500 truncate">
                            {worker.name}
                          </h3>

                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {worker.specialty}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-48 pb-2">
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

              {/* Body */}
              <div className="space-y-8 p-6">
                {/* Availability */}
                <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className="text-sm text-[#0F172A]"
                        style={{ fontWeight: 700 }}
                      >
                        Available Now
                      </h4>

                      <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                        Show workers ready to start immediately
                      </p>
                    </div>

                    <button
                      onClick={() => setAvailableOnly(!availableOnly)}
                      className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
                        availableOnly
                          ? "bg-[#FF5C39] shadow-lg shadow-orange-200"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                          availableOnly ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Max Rate */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4
                        className="text-sm text-[#0F172A]"
                        style={{ fontWeight: 700 }}
                      >
                        Starting Price
                      </h4>

                      <p className="mt-1 text-xs text-[#64748B]">
                        Maximum rate you want to pay
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FFF1EC] px-3 py-2 text-[#FF5C39]">
                      <div className="text-lg font-extrabold">₹{maxPrice}</div>

                      <div className="text-[10px] uppercase tracking-wide">
                        Max Price
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-5">
                    <input
                      type="range"
                      min={100}
                      max={10000}
                      step={100}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                    />

                    <div className="mt-3 flex justify-between text-xs text-[#94A3B8]">
                      <span>₹100</span>
                      <span>₹10,000+</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <div className="mb-4">
                    <h4
                      className="text-sm text-[#0F172A]"
                      style={{ fontWeight: 700 }}
                    >
                      Minimum Rating
                    </h4>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Hire highly rated professionals
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[4, 4.5, 4.8].map((r) => (
                      <button
                        key={r}
                        className="group rounded-2xl border border-gray-200 bg-white px-3 py-4 transition-all duration-200 hover:border-[#FF5C39] hover:bg-[#FFF7F4]"
                      >
                        <div className="flex flex-col items-center">
                          <Star className="mb-1 h-4 w-4 fill-[#FDBA74] text-[#FDBA74]" />

                          <span
                            className="text-sm text-[#0F172A] group-hover:text-[#FF5C39]"
                            style={{ fontWeight: 700 }}
                          >
                            {r}+
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <div className="mb-4">
                    <h4
                      className="text-sm text-[#0F172A]"
                      style={{ fontWeight: 700 }}
                    >
                      Experience Level
                    </h4>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Choose workers by expertise
                    </p>
                  </div>

                  <div className="space-y-3">
                    {["Any", "2+ years", "5+ years", "10+ years"].map((exp) => (
                      <label
                        key={exp}
                        className="group flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-[#FAFAFA] px-4 py-3 transition-all hover:border-[#FF5C39] hover:bg-[#FFF7F4]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 transition-colors group-hover:border-[#FF5C39]">
                            <div className="h-2 w-2 rounded-full bg-[#FF5C39] opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>

                          <span
                            className="text-sm text-[#334155]"
                            style={{ fontWeight: 500 }}
                          >
                            {exp}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-6">
                  <button
                    onClick={() => {
                      setAvailableOnly(false);
                      setMaxPrice(5000);
                      router.push("/browse");
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm text-[#475569] transition-all hover:border-[#FF5C39] hover:bg-[#FFF7F4] hover:text-[#FF5C39]"
                    style={{ fontWeight: 700 }}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
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
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-1">
              {/* Result Count */}
              <div className="flex items-center gap-2">
                <div className="h-9 px-3.5 rounded-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-600 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-slate-400/30">
                  {filteredWorkers.length} Workers
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden h-8 px-3 rounded-full bg-white border border-orange-200 text-orange-600 text-xs font-medium flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filter
                </button>

                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="h-8 px-3 rounded-full bg-[#F8FAFC] border border-gray-200 text-xs font-medium text-gray-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    {currentSort?.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-20">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition ${
                            sortBy === opt.value
                              ? "bg-orange-50 text-orange-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

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
