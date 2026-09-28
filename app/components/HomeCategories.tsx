"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowRight,
  Check,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  X,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import HomeHero from "@/app/components/HomeHero";
import PropertyComingSoon from "./PropertyComingSoon";

import {
  getWorkers,
  serviceCategories,
  type Worker,
} from "@/app/data/workers";

/* =========================================
   SEARCH DROPDOWN
========================================= */

function SearchDropdown({
  workers,
  search,
  selectedLocation,
  onClose,
}: {
  workers: Worker[];
  search: string;
  selectedLocation: string;
  onClose: () => void;
}) {
  const query = search.trim().toLowerCase();

  const locationFilteredWorkers = workers.filter((worker) => {
    if (!selectedLocation) {
      return true;
    }

    return (
      worker.labourChauk?.trim().toLowerCase() ===
      selectedLocation.trim().toLowerCase()
    );
  });

  const matchingWorkers = locationFilteredWorkers.filter((worker) => {
    const searchableText = [
      worker.name,
      worker.category,
      worker.subcategory,
      worker.specialty,
      worker.location,
      worker.labourChauk,
      ...(worker.services || []),
      ...(worker.skills || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  const matchingCategories = serviceCategories.filter((category) => {
    if (category.id === "all") {
      return false;
    }

    const categoryText = [
      category.id,
      category.label,
      category.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return categoryText.includes(query);
  });

  const uniqueWorkers = Array.from(
    new Map(matchingWorkers.map((worker) => [worker.id, worker])).values(),
  ).slice(0, 8);

  const hasResults =
    matchingCategories.length > 0 || uniqueWorkers.length > 0;

  return (
    <div className="absolute left-0 right-0 top-full z-100 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {!hasResults ? (
        <div className="px-4 py-8 text-center">
          <Search className="mx-auto h-6 w-6 text-gray-300" />

          <p className="mt-2 text-sm font-bold text-gray-700">
            No workers found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Try another worker, service or category
          </p>
        </div>
      ) : (
        <div className="max-h-105 overflow-y-auto">
          {/* SERVICES */}

          {matchingCategories.length > 0 && (
            <div className="border-b border-gray-100 p-2">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Services
              </p>

              {matchingCategories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`/browse?category=${encodeURIComponent(category.id)}${
                    selectedLocation
                      ? `&labourChauk=${encodeURIComponent(selectedLocation)}`
                      : ""
                  }`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-emerald-50"
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.label}
                        fill
                        sizes="36px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm">
                        👷
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {category.label}
                    </p>

                    <p className="truncate text-[10px] text-gray-400">
                      {category.description}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                </Link>
              ))}
            </div>
          )}

          {/* WORKERS */}

          {uniqueWorkers.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Workers
                </p>

                <span className="text-[10px] font-semibold text-emerald-600">
                  {uniqueWorkers.length} results
                </span>
              </div>

              {uniqueWorkers.map((worker) => (
                <Link
                  key={worker.id}
                  href={`/workers/${worker.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-emerald-50"
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {worker.photo ? (
                      <Image
                        src={worker.photo}
                        alt={worker.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-base">
                        👷
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {worker.name}
                    </p>

                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[11px] font-medium text-gray-500">
                        {worker.category}
                      </span>

                      {worker.subcategory && (
                        <>
                          <span className="shrink-0 text-gray-300">•</span>

                          <span className="truncate text-[10px] text-gray-400">
                            {worker.subcategory}
                          </span>
                        </>
                      )}
                    </div>

                    {worker.labourChauk && (
                      <div className="mt-0.5 flex min-w-0 items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 shrink-0 text-emerald-500" />

                        <span className="truncate text-[10px] text-gray-400">
                          {worker.labourChauk}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />

                      <span className="text-[10px] font-semibold text-gray-600">
                        {worker.rating > 0
                          ? worker.rating.toFixed(1)
                          : "New"}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] font-extrabold text-emerald-600">
                      ₹{worker.fullDayPrice || worker.startingPrice || 0}
                    </p>

                    <p className="text-[8px] text-gray-400">/day</p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================
   HOME CATEGORIES
========================================= */

export default function HomeCategories() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [openWorkerRequest, setOpenWorkerRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  /* =========================================
     LOCATIONS FROM WORKERS DATA
  ========================================= */

  const locations = useMemo(() => {
    return Array.from(
      new Set(
        workers
          .map((worker) => worker.labourChauk?.trim())
          .filter((location): location is string => Boolean(location)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [workers]);

  /* =========================================
     REQUEST SUCCESS
  ========================================= */

  useEffect(() => {
    function handleRequestSuccess() {
      setRequestSuccess(true);
      setOpenWorkerRequest(false);

      window.setTimeout(() => {
        setRequestSuccess(false);
      }, 8000);
    }

    window.addEventListener(
      "workkerz-request-success",
      handleRequestSuccess,
    );

    return () => {
      window.removeEventListener(
        "workkerz-request-success",
        handleRequestSuccess,
      );
    };
  }, []);

  /* =========================================
     LOAD WORKERS
  ========================================= */

  useEffect(() => {
    let mounted = true;

    async function loadWorkers() {
      try {
        const data = await getWorkers(100);

        if (mounted) {
          setWorkers(data);
        }
      } catch (error) {
        console.error("GET HOME WORKERS ERROR:", error);
      } finally {
        if (mounted) {
          setLoadingWorkers(false);
        }
      }
    }

    loadWorkers();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================
     OUTSIDE CLICK
  ========================================= */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (locationRef.current && !locationRef.current.contains(target)) {
        setLocationOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================
     FILTER WORKERS
  ========================================= */

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workers.filter((worker) => {
      const workerLocation = worker.labourChauk?.trim().toLowerCase();

      const matchesLocation =
        !selectedLocation ||
        workerLocation === selectedLocation.trim().toLowerCase();

      if (!matchesLocation) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        worker.name,
        worker.category,
        worker.subcategory,
        worker.specialty,
        worker.location,
        worker.labourChauk,
        ...(worker.services || []),
        ...(worker.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [workers, selectedLocation, search]);

  /* =========================================
     SORT CATEGORIES
  ========================================= */

  const categories = useMemo(() => {
    return [...serviceCategories]
      .filter((category) => category.id !== "all")
      .sort((a, b) => {
        const aCount = filteredWorkers.filter(
          (worker) => worker.category === a.id,
        ).length;

        const bCount = filteredWorkers.filter(
          (worker) => worker.category === b.id,
        ).length;

        if (aCount === 0 && bCount > 0) {
          return 1;
        }

        if (aCount > 0 && bCount === 0) {
          return -1;
        }

        return bCount - aCount;
      });
  }, [filteredWorkers]);

  /* =========================================
     FEATURED
  ========================================= */

  const featured = categories.filter(
    (category) => category.featured,
  );

  const remaining = categories.filter(
    (category) => !category.featured,
  );

  /* =========================================
     LOCATION
  ========================================= */

  function handleLocationSelect(location: string) {
    setSelectedLocation(location);
    setLocationOpen(false);
  }

  function clearLocation() {
    setSelectedLocation("");
    setLocationOpen(false);
  }

  /* =========================================
     SEARCH
  ========================================= */

  function handleSearchChange(value: string) {
    setSearch(value);
    setSearchOpen(Boolean(value.trim()));
  }

  function clearSearch() {
    setSearch("");
    setSearchOpen(false);
  }

  /* =========================================
     REQUEST
  ========================================= */

  function openRequestForm() {
    setRequestSuccess(false);
    setOpenWorkerRequest(true);
  }

  function closeRequestForm() {
    setOpenWorkerRequest(false);
  }

  /* =========================================
     UI
  ========================================= */

  return (
    <>
      <HomeHero
        openRequest={openWorkerRequest}
        onRequestClose={closeRequestForm}
      />

      <section className="bg-[#f7f8f6] py-5 sm:py-8 lg:py-10">
        <div className="mx-auto mt-20 max-w-7xl px-3 sm:mt-24 sm:px-5 lg:px-8">
          {/* SUCCESS */}

          {requestSuccess && (
            <div className="mb-3 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-gray-900">
                    Request submitted successfully
                  </p>

                  <p className="text-[9px] text-gray-500">
                    Workkerz team will contact you soon.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRequestSuccess(false)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================
              COMPACT WORKKERZ HERO
          ========================================= */}

          <div className="mb-2 sm:mb-4">
            <div className="relative min-h-[105px] overflow-hidden sm:min-h-[135px] lg:min-h-[155px]">
              {/* LEFT CONTENT */}

              <div className="relative z-10 max-w-[260px] pt-1 sm:max-w-[360px] sm:pt-2 lg:max-w-[500px]">
                <div className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-emerald-800 sm:mb-2 sm:px-2.5 sm:py-1 sm:text-[9px] lg:text-[10px]">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  WORKKERZ SERVICES
                </div>

                <h2 className="text-[22px] font-black leading-none tracking-tight text-slate-950 sm:text-[28px] lg:text-[36px]">
                  Worker <span className="text-emerald-600">Chahiye?</span>
                </h2>

                <p className="mt-2 max-w-[230px] text-[8px] font-medium leading-3.5 text-slate-700 sm:max-w-[300px] sm:text-[10px] sm:leading-4 lg:max-w-[400px] lg:text-[13px] lg:leading-5">
                  Aapko kis kaam ke liye worker chahiye, batayein
                  <br />
                  hum aapko sahi worker dhoondhne mein help karenge.
                </p>
              </div>

              {/* WORKER IMAGE */}

              <div className="pointer-events-none absolute -right-2 -top-3 h-[125px] w-[150px] sm:right-0 sm:h-[145px] sm:w-[190px] lg:h-[160px] lg:w-[220px]">
                <div className="absolute right-3 top-2 h-[90px] w-[90px] rounded-full bg-emerald-50 sm:h-[110px] sm:w-[110px] lg:h-[125px] lg:w-[125px]" />

                <Image
                  src="/categories/worker-service.png"
                  alt="Workkerz worker"
                  fill
                  priority
                  className="object-contain object-bottom-right"
                  sizes="(max-width: 640px) 150px, (max-width: 1024px) 190px, 220px"
                />
              </div>
            </div>

            {/* =========================================
                COMPACT REQUEST CARD
            ========================================= */}

            <div className="relative z-20 overflow-hidden rounded-[14px] border border-emerald-600/60 bg-white shadow-[0_2px_12px_rgba(16,185,129,0.05)] sm:rounded-[16px]">
              {/* MAIN ROW */}

              <div className="flex items-center gap-2 px-2 py-2 sm:gap-2.5 sm:px-3 sm:py-2.5 lg:gap-4 lg:px-5 lg:py-3">
                {/* ICON */}

                <div className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-[44px] sm:w-[44px] lg:h-[55px] lg:w-[55px]">
                  <UserRound className="h-5 w-5 stroke-[1.8] sm:h-6 sm:w-6 lg:h-7 lg:w-7" />

                  <div className="absolute bottom-[-1px] right-[-1px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-600 sm:h-4 sm:w-4">
                    <Check className="h-2 w-2 text-white sm:h-2.5 sm:w-2.5" />
                  </div>
                </div>

                {/* TEXT */}

                <div className="min-w-0 flex-1">
                  <h3 className="text-[12px] font-black leading-tight text-gray-950 sm:text-[14px] lg:text-[17px]">
                    Need a Worker?
                  </h3>

                  <p className="mt-0.5 line-clamp-1 text-[8px] leading-3 text-gray-600 sm:text-[9px] sm:leading-3.5 lg:text-[11px]">
                    Apni requirement bhejiye, sahi worker se connect ho jaiye.
                  </p>
                </div>

                {/* REQUEST BUTTON */}

                <button
                  type="button"
                  onClick={openRequestForm}
                  disabled={requestSuccess}
                  className={[
                    "group flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 text-[8px] font-extrabold text-white shadow-sm transition-all duration-200 sm:h-10 sm:gap-1.5 sm:px-2.5 sm:text-[9px] lg:h-12 lg:w-[230px] lg:gap-2 lg:rounded-xl lg:px-4 lg:text-[13px]",
                    requestSuccess
                      ? "cursor-default bg-emerald-500"
                      : "hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]",
                  ].join(" ")}
                >
                  {requestSuccess ? (
                    <>
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />

                      <span className="whitespace-nowrap">
                        Submitted
                      </span>
                    </>
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />

                      <span className="whitespace-nowrap">
                        Request Worker
                      </span>

                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* TRUST ROW */}

              <div className="mx-2 border-t border-gray-100 sm:mx-3">
                <div className="grid grid-cols-3">
                  {/* VERIFIED */}

                  <div className="flex min-w-0 items-center justify-center gap-1 px-1 py-1.5 sm:gap-1.5 sm:py-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-6 sm:w-6">
                      <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </div>

                    <span className="truncate text-[7px] font-semibold text-gray-700 sm:text-[8px] lg:text-[10px]">
                      Verified Workers
                    </span>
                  </div>

                  {/* TRUSTED */}

                  <div className="flex min-w-0 items-center justify-center gap-1 border-x border-gray-100 px-1 py-1.5 sm:gap-1.5 sm:py-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-6 sm:w-6">
                      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </div>

                    <span className="truncate text-[7px] font-semibold text-gray-700 sm:text-[8px] lg:text-[10px]">
                      Trusted Workers
                    </span>
                  </div>

                  {/* SAFE */}

                  <div className="flex min-w-0 items-center justify-center gap-1 px-1 py-1.5 sm:gap-1.5 sm:py-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-6 sm:w-6">
                      <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </div>

                    <span className="truncate text-[7px] font-semibold text-gray-700 sm:text-[8px] lg:text-[10px]">
                      Safe & Reliable
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================
                PROPERTY BUY / RENT — COMING SOON
            ========================================= */}

            <div className="mt-3 sm:mt-4">
              <PropertyComingSoon />
            </div>
          </div>

          {/* =========================================
              POPULAR SERVICES
          ========================================= */}

          <div className="mb-6">
            <div className="mb-2.5">
              <h3 className="text-[16px] font-extrabold text-gray-950 sm:text-[19px]">
                Popular services
              </h3>

              <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                Most booked workers
                {selectedLocation ? ` at ${selectedLocation}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:gap-4">
              {featured.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  workers={filteredWorkers}
                  loading={loadingWorkers}
                  selectedLocation={selectedLocation}
                  featured
                />
              ))}
            </div>
          </div>

          {/* =========================================
              ALL SERVICES
          ========================================= */}

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-extrabold text-gray-950 sm:text-[19px]">
                  All services
                </h3>

                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                  Choose the service you need
                </p>
              </div>

              <span className="text-[9px] font-semibold text-gray-400 sm:text-xs">
                {categories.length} services
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {remaining.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  workers={filteredWorkers}
                  loading={loadingWorkers}
                  selectedLocation={selectedLocation}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================
   COMPACT CATEGORY CARD
========================================= */

function CategoryCard({
  category,
  workers,
  loading,
  selectedLocation,
  featured = false,
}: {
  category: (typeof serviceCategories)[number];
  workers: Worker[];
  loading: boolean;
  selectedLocation: string;
  featured?: boolean;
}) {
  const categoryWorkers = workers.filter(
    (worker) => worker.category === category.id,
  );

  const location =
    selectedLocation ||
    categoryWorkers[0]?.labourChauk ||
    "Near you";

  return (
    <Link
      href={`/browse?category=${encodeURIComponent(category.id)}${
        selectedLocation
          ? `&labourChauk=${encodeURIComponent(selectedLocation)}`
          : ""
      }`}
      className="group block"
    >
      <div
        className={[
          "relative overflow-hidden rounded-[13px] border border-gray-100 bg-white",
          "transition-all duration-200",
          "hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md",
          featured
            ? "min-h-[190px] sm:min-h-[215px]"
            : "min-h-[165px] sm:min-h-[195px]",
        ].join(" ")}
      >
        {/* IMAGE */}

        <div
          className={[
            "relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-lime-50",
            featured
              ? "h-[95px] sm:h-[110px]"
              : "h-[82px] sm:h-[100px]",
          ].join(" ")}
        >
          <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-emerald-100/50" />

          <div className="absolute -bottom-7 -left-6 h-16 w-16 rounded-full bg-lime-100/40" />

          {category.image ? (
            <Image
              src={category.image}
              alt={category.label}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="relative z-10 object-contain p-2 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl">
              👷
            </div>
          )}

          {/* POPULAR */}

          {featured && (
            <div className="absolute left-2 top-2 z-20 rounded-full bg-white/90 px-2 py-0.5 text-[7px] font-extrabold uppercase tracking-wide text-emerald-700 shadow-sm backdrop-blur">
              Popular
            </div>
          )}
        </div>

        {/* CONTENT */}

        <div className="px-2 py-2 sm:px-2.5 sm:py-2.5">
          {/* TITLE */}

          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-[11px] font-extrabold leading-tight text-gray-950 sm:text-[13px]">
                {category.label}
              </h4>

              <p className="mt-0.5 line-clamp-1 text-[8px] leading-3 text-gray-500 sm:text-[10px]">
                {category.description}
              </p>
            </div>

            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-50 transition group-hover:bg-emerald-600 group-hover:text-white sm:h-6 sm:w-6">
              <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </div>
          </div>

          {/* LOCATION */}

          <div className="mt-1.5 flex items-center justify-between border-t border-gray-100 pt-1.5">
            <div className="flex min-w-0 items-center gap-1">
              <MapPin className="h-2.5 w-2.5 shrink-0 text-emerald-600 sm:h-3 sm:w-3" />

              <span
                className="truncate text-[7.5px] font-semibold text-gray-400 sm:text-[9px]"
                title={location}
              >
                {location}
              </span>
            </div>

            <span className="shrink-0 text-[7.5px] font-bold text-emerald-600 sm:text-[9px]">
              Explore
            </span>
          </div>

          {/* WORKER LIST */}

          {!loading && categoryWorkers.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {categoryWorkers.slice(0, 2).map((worker) => (
                <div
                  key={worker.id}
                  className="flex items-center gap-1.5 rounded-md bg-gray-50 px-1.5 py-1"
                >
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:h-6 sm:w-6">
                    {worker.photo ? (
                      <Image
                        src={worker.photo}
                        alt={worker.name}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[7px]">
                        👷
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[7.5px] font-bold leading-tight text-gray-800 sm:text-[9px]">
                      {worker.name}
                    </p>

                    <div className="flex items-center gap-0.5">
                      <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />

                      <span className="text-[7px] text-gray-500 sm:text-[8px]">
                        {worker.rating > 0
                          ? worker.rating.toFixed(1)
                          : "New"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[8px] font-extrabold leading-tight text-emerald-600 sm:text-[9px]">
                      ₹{worker.fullDayPrice || worker.startingPrice || 0}
                    </p>

                    <p className="text-[6px] text-gray-400 sm:text-[7px]">
                      /day
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NO WORKERS */}

          {!loading && categoryWorkers.length === 0 && (
            <p className="mt-1 text-[7px] text-gray-400 sm:text-[8px]">
              {selectedLocation
                ? "No workers at this location"
                : "Available nearby"}
            </p>
          )}

          {/* LOADING */}

          {loading && (
            <div className="mt-1.5">
              <div className="h-6 animate-pulse rounded-md bg-gray-100" />
            </div>
          )}

          {/* FOOTER */}

          <div className="mt-1.5 flex items-center justify-between border-t border-gray-100 pt-1.5">
            <span className="truncate text-[7px] font-semibold text-gray-400 sm:text-[8px]">
              {categoryWorkers.length > 0
                ? `${categoryWorkers.length} workers nearby`
                : "Available nearby"}
            </span>

            <span className="shrink-0 text-[7px] font-bold text-emerald-600 sm:text-[8px]">
              Explore
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}