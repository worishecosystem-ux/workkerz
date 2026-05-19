"use client";
import { useState, useEffect, useRef } from "react";
import { Suspense } from "react";
import { useSearchParams,useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  X,
  Hammer,
  Droplets,
  Zap,
  Car,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { serviceCategories, type ServiceCategory } from "@/app/data/workers";
import { useAdmin } from "@/app/components/context/AdminContext";
import { WorkerCard } from "@/app/components/WorkerCard";

const categoryIcons: Record<string, React.ElementType> = {
  Labour: Hammer,

  Driver: Car,

  Mechanic: Zap,

  Washer: Droplets,

  "Computer Operator": Zap,

  "Office Worker": Hammer,

  "Home Services": Droplets,

  Restaurant: Star,

  "Home Contractor": Hammer,

  Factory: Zap,

  Roads: Hammer,
};

const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "reviews", label: "Most Reviewed" },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get("category") || "",
  );
  const [sortBy, setSortBy] = useState("rating");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxRate, setMaxRate] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const { workers } = useAdmin();
  const filterRef = useRef<HTMLDivElement | null>(null);

  const categoryScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollCategories = (direction: "left" | "right") => {
    if (!categoryScrollRef.current) return;

    categoryScrollRef.current.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);

    const newParams = new URLSearchParams(searchParams.toString());

    if (cat) {
      newParams.set("category", cat);
    } else {
      newParams.delete("category");
    }

    router.push(`/browse?${newParams.toString()}`);
  };

  const filteredWorkers = (workers ?? [])
    .filter((w) => {
      if (activeCategory && w.category !== activeCategory) return false;
      if (availableOnly && !w.available) return false;
      if (w.hourlyRate > maxRate) return false;
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
      if (sortBy === "price_asc") return a.hourlyRate - b.hourlyRate;
      if (sortBy === "price_desc") return b.hourlyRate - a.hourlyRate;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return 0;
    });

  const currentSort = sortOptions.find((s) => s.value === sortBy);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Page Header */}
      <div className="bg-[#0F172A] pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1
            className="text-white mb-2"
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Find Professionals
          </h1>
          <p className="text-gray-400 text-sm">
            {filteredWorkers.length} workers available
            {activeCategory ? ` in ${activeCategory}` : ""}
          </p>

          {/* Search */}
          <div className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, skill, or specialty..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent w-full outline-none text-white placeholder-gray-400 text-sm"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                className="bg-transparent outline-none text-white placeholder-gray-400 text-sm w-28"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Category Tabs */}
        <div className="relative mb-6">
          {/* LEFT ARROW */}
          <button
            onClick={() => scrollCategories("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-[#64748B] hover:bg-[#FF5C39] hover:text-white hover:border-[#FF5C39] transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={() => scrollCategories("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-[#64748B] hover:bg-[#FF5C39] hover:text-white hover:border-[#FF5C39] transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* SCROLL AREA */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide px-12 pb-2 scroll-smooth"
          >
            {/* ALL SERVICES */}
            <button
              onClick={() => handleCategoryChange("")}
              className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all border ${
                activeCategory === ""
                  ? "bg-[#0F172A] text-white border-transparent shadow-lg"
                  : "bg-white text-[#475569] border-gray-200 hover:border-[#FF5C39] hover:bg-orange-50 hover:text-[#FF5C39]"
              }`}
              style={{ fontWeight: 600 }}
            >
              All Services
            </button>

            {/* CATEGORY BUTTONS */}
            {serviceCategories.map((cat) => {
              const Icon = categoryIcons[cat.id] || Hammer;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all border ${
                    activeCategory === cat.id
                      ? "text-white border-transparent shadow-lg scale-[1.02]"
                      : "bg-white text-[#475569] border-gray-200 hover:border-[#FF5C39] hover:bg-orange-50 hover:text-[#FF5C39]"
                  }`}
                  style={{
                    fontWeight: 600,

                    backgroundColor:
                      activeCategory === cat.id ? cat.color : undefined,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar Filters */}
          <aside
            className={`xl:w-85 2xl:w-95 shrink-0 ${
              showFilters ? "block" : "hidden xl:block"
            }`}
          >
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
                        Hourly Budget
                      </h4>

                      <p className="mt-1 text-xs text-[#64748B]">
                        Maximum rate you want to pay
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FFF1EC] px-3 py-2 text-[#FF5C39]">
                      <span className="text-lg" style={{ fontWeight: 800 }}>
                        ₹{maxRate}
                      </span>
                      <span className="text-xs">/hr</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-5">
                    <input
                      type="range"
                      min={30}
                      max={5000}
                      value={maxRate}
                      onChange={(e) => setMaxRate(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#FF5C39]"
                    />

                    <div className="mt-3 flex justify-between text-xs text-[#94A3B8]">
                      <span>₹30</span>
                      <span>₹5000</span>
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
                      setMaxRate(150);
                      setActiveCategory("");
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

          {/* Results */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-[#64748B] text-sm">
                <span style={{ fontWeight: 600, color: "#0F172A" }}>
                  {filteredWorkers.length}
                </span>{" "}
                workers found
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 text-sm text-[#475569] bg-white border border-gray-200 px-4 py-2 rounded-lg"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 text-sm text-[#475569] bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <span
                      className="text-[#0F172A]"
                      style={{ fontWeight: 500 }}
                    >
                      {currentSort?.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                            sortBy === opt.value
                              ? "text-[#FF5C39] bg-orange-50"
                              : "text-[#475569]"
                          }`}
                          style={{
                            fontWeight: sortBy === opt.value ? 600 : 400,
                          }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredWorkers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
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
                    setActiveCategory("");
                    setQuery("");
                    setAvailableOnly(false);
                    setMaxRate(150);
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
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}