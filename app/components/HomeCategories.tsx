"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Grid2X2,
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

import { getWorkers, serviceCategories, type Worker } from "@/app/data/workers";

import { supabase } from "@/lib/supabase";

/* =========================================
   CATEGORY IMAGES
========================================= */

const categoryImages: Record<string, string> = {
  Labour: "/categories/workkerz/Labour.png",
  Driver: "/categories/workkerz/Driver.png",
  Mechanic: "/categories/workkerz/Mechanic.png",
  Painter: "/categories/workkerz/Painter.png",
  Washer: "/categories/workkerz/Washer.png",

  "Office Worker": "/categories/workkerz/Office worker.png",

  "Home Services": "/categories/workkerz/House service.png",

  Restaurant: "/categories/workkerz/Restaurant.png",

  "Home Contractor": "/categories/workkerz/Home contractor.png",

  Factory: "/categories/workkerz/Factory worker.png",

  "Salon & Beauty": "/categories/workkerz/Salon and beauty.png",

  Construction: "/categories/workkerz/Constructionworker.png",

  Security: "/categories/workkerz/Security.png",

  "Event Services": "/categories/workkerz/Events.png",
};

/* =========================================
   DESCRIPTIONS
========================================= */

const descriptions: Record<string, string> = {
  Labour: "Daily wage & general workers",
  Driver: "Drivers for every requirement",
  Mechanic: "Vehicle repair & maintenance",
  Painter: "Home, wall & commercial painting",
  Washer: "Cleaning & washing professionals",

  "Office Worker": "Reliable office professionals",

  "Home Services": "Get household work done",

  Restaurant: "Restaurant & kitchen workers",

  "Home Contractor": "Trusted home contractors",

  Factory: "Factory & industrial workers",

  "Salon & Beauty": "Beauty & personal care",

  Construction: "Skilled construction workers",

  Security: "Security & guarding services",

  "Event Services": "Workers for events & functions",
};

/* =========================================
   FEATURED
========================================= */

const featuredCategories = ["Labour", "Driver", "Mechanic", "Painter"];

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
      descriptions[category.id],
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return categoryText.includes(query);
  });

  const uniqueWorkers = Array.from(
    new Map(matchingWorkers.map((worker) => [worker.id, worker])).values(),
  ).slice(0, 8);

  const hasResults = matchingCategories.length > 0 || uniqueWorkers.length > 0;

  return (
    <div
      className="
        absolute left-0 right-0 top-full z-100 mt-2
        overflow-hidden
        rounded-2xl
        border border-gray-200
        bg-white
        shadow-2xl
      "
    >
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
              <p
                className="
                  px-3 py-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-400
                "
              >
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
                  className="
                      flex items-center gap-3
                      rounded-xl
                      px-3 py-2.5
                      transition
                      hover:bg-emerald-50
                    "
                >
                  <div
                    className="
                        relative h-9 w-9
                        shrink-0
                        overflow-hidden
                        rounded-lg
                        bg-emerald-50
                      "
                  >
                    {categoryImages[category.id] ? (
                      <Image
                        src={categoryImages[category.id]}
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
                      {descriptions[category.id] || "Find trusted workers"}
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
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-gray-400
                  "
                >
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
  className="
    flex items-center gap-3
    rounded-xl
    px-3 py-2.5
    transition
    hover:bg-emerald-50
  "
>
                  <div
                    className="
                        relative h-11 w-11
                        shrink-0
                        overflow-hidden
                        rounded-full
                        bg-gray-100
                      "
                  >
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
                        {worker.rating > 0 ? worker.rating.toFixed(1) : "New"}
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

  const [loadingLocations, setLoadingLocations] = useState(true);

  const [locations, setLocations] = useState<string[]>([]);

  const [selectedLocation, setSelectedLocation] = useState("");

  const [locationOpen, setLocationOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);

  /* =========================================
     REQUEST FORM
  ========================================= */

  const [openWorkerRequest, setOpenWorkerRequest] = useState(false);

  const [requestSuccess, setRequestSuccess] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  /* =========================================
     REQUEST SUCCESS LISTENER
  ========================================= */

  useEffect(() => {
    function handleRequestSuccess() {
      setRequestSuccess(true);

      setOpenWorkerRequest(false);

      /*
       * Keep "Request Submitted" state visible
       * for 8 seconds.
       */
      window.setTimeout(() => {
        setRequestSuccess(false);
      }, 8000);
    }

    window.addEventListener("workkerz-request-success", handleRequestSuccess);

    return () => {
      window.removeEventListener(
        "workkerz-request-success",
        handleRequestSuccess,
      );
    };
  }, []);

  /* =========================================
     LOAD LOCATIONS
  ========================================= */

  useEffect(() => {
    let mounted = true;

    async function loadLocations() {
      try {
        const { data, error } = await supabase
          .from("workers")
          .select("labour_chauk")
          .not("labour_chauk", "is", null);

        if (error) {
          console.error("GET LOCATIONS ERROR:", error.message);

          return;
        }

        if (!mounted) {
          return;
        }

        const uniqueLocations = Array.from(
          new Set(
            (data ?? [])
              .map((row) => row.labour_chauk?.trim())
              .filter((location): location is string => Boolean(location)),
          ),
        ).sort((a, b) => a.localeCompare(b));

        setLocations(uniqueLocations);
      } catch (error) {
        console.error("GET LOCATIONS ERROR:", error);
      } finally {
        if (mounted) {
          setLoadingLocations(false);
        }
      }
    }

    loadLocations();

    return () => {
      mounted = false;
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
     WORKERS AVAILABLE FIRST
  ========================================= */

  const categories = useMemo(() => {
    return serviceCategories
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

  const featured = categories.filter((category) =>
    featuredCategories.includes(category.id),
  );

  const remaining = categories.filter(
    (category) => !featuredCategories.includes(category.id),
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
    /*
     * If previous request was completed,
     * clicking Request Worker starts a
     * fresh request again.
     */
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
      {/* =====================================
          HERO / REQUEST FORM
      ===================================== */}

      <HomeHero
        openRequest={openWorkerRequest}
        onRequestClose={closeRequestForm}
      />

      {/* =====================================
          SERVICES SECTION
      ===================================== */}

      <section className="bg-[#f7f8f6] py-8 sm:py-12 lg:py-16">
        <div className="mx-auto mt-25 max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* =================================
              SUCCESS MESSAGE
          ================================= */}

          {requestSuccess && (
            <div
              className="
                mb-6
                overflow-hidden
                rounded-2xl
                border border-emerald-200
                bg-white
                shadow-sm
              "
            >
              <div
                className="
                  flex items-center gap-3
                  px-4 py-3.5
                  sm:px-5
                "
              >
                <div
                  className="
                    flex h-10 w-10
                    shrink-0
                    items-center justify-center
                    rounded-full
                    bg-emerald-100
                  "
                >
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-gray-900">
                    Request submitted successfully
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Workkerz team will contact you soon.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRequestSuccess(false)}
                  className="
                    flex h-7 w-7
                    shrink-0
                    items-center justify-center
                    rounded-full
                    text-gray-400
                    transition
                    hover:bg-gray-100
                    hover:text-gray-700
                  "
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* =================================
              HEADER
          ================================= */}

          <div className="mb-4 sm:mb-8">
            {/* HERO */}
            <div className="relative min-h-38 overflow-hidden sm:min-h-57.5 lg:min-h-66.25">
              {/* LEFT CONTENT */}
              <div className="relative z-10 max-w-140 pt-1 sm:pt-2">
                {/* BADGE */}
                <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 sm:mb-3 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px] lg:px-4 lg:py-2 lg:text-[11px]">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                  WORKKERZ SERVICES
                </div>
                {/* HEADING */}
                <h2 className="translate-y-2 text-[24px] font-black leading-none tracking-tight text-slate-950 sm:translate-y-5 sm:text-[34px] lg:translate-y-6 lg:text-5xl lg:text-[48px] lg:leading-[1.05]">
                  Worker <span className="text-emerald-600">Chahiye?</span>
                </h2>

                {/* DESCRIPTION */}
                <p className="mt-3 max-w-51.25 translate-y-3 text-[9px] font-medium leading-4 text-slate-700 sm:mt-4 sm:max-w-[320px] sm:translate-y-5 sm:text-[13px] sm:leading-5 lg:mt-5 lg:max-w-[500px] lg:translate-y-6 lg:text-xl lg:leading-8">
                  Aapko kis kaam ke liye worker chahiye, batayein
                  <br />
                  hum aapko sahi worker dhoondhne mein help karenge.
                </p>
              </div>

              {/* WORKER IMAGE */}
              <div className="pointer-events-none absolute -right-3.75 -top-8 h-47.5 w-55 sm:right-0 sm:h-58.75 sm:w-[320px] lg:h-66.25 lg:w-[390px]">
                <div className="absolute right-4  h-38.75 w-38.75 rounded-full bg-emerald-50 sm:right-6 sm:top-3 sm:h-[200px] sm:w-[200px] lg:right-8 lg:h-57.5 lg:w-[230px]" />

                <Image
                  src="/categories/worker-service.png"
                  alt="Workkerz worker"
                  fill
                  priority
                  className="object-contain object-bottom-right"
                  sizes="(max-width: 640px) 220px, (max-width: 1024px) 300px, 390px"
                />
              </div>
            </div>

            {/* REQUEST WORKER CARD */}
            <div className="relative z-20 overflow-hidden rounded-[18px] border border-emerald-700/70 bg-white shadow-[0_3px_18px_rgba(16,185,129,0.06)] sm:rounded-[20px] lg:rounded-[24px]">
              {/* MAIN REQUEST AREA */}
              <div className="flex items-center gap-2.5 px-2.5 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:gap-5 lg:px-7 lg:py-5">
                {/* WORKER ICON */}
                <div className="relative flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-[62px] sm:w-[62px] lg:h-[92px] lg:w-[92px]">
                  <UserRound className="h-7 w-7 stroke-[1.8] sm:h-8 sm:w-8 lg:h-11 lg:w-11" />

                  <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-600 sm:h-5 sm:w-5 lg:h-7 lg:w-7">
                    <Check className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                  </div>
                </div>

                {/* TEXT */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-black leading-tight text-gray-950 sm:text-[16px] lg:text-2xl">
                    Need a Worker?
                  </h3>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-600 sm:text-[11px] sm:leading-5 lg:mt-1.5 lg:max-w-[360px] lg:text-base lg:leading-6">
                    Apni requirement bhejiye, sahi worker se connect ho jaiye.
                  </p>
                </div>

                {/* REQUEST BUTTON */}
                <button
                  type="button"
                  onClick={openRequestForm}
                  disabled={requestSuccess}
                  className={[
                    "group flex h-11 shrink-0 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[10px] font-extrabold text-white shadow-sm transition-all duration-200 sm:h-[50px] sm:gap-1.5 sm:rounded-xl sm:px-3 sm:text-[11px] lg:h-[82px] lg:w-[440px] lg:gap-3 lg:rounded-2xl lg:px-6 lg:text-lg",
                    requestSuccess
                      ? "cursor-default bg-emerald-500"
                      : "hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98]",
                  ].join(" ")}
                >
                  {requestSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-6 lg:w-6" />
                      <span className="whitespace-nowrap">Submitted</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 stroke-[1.8] sm:h-5 sm:w-5 lg:h-7 lg:w-7" />
                      <span className="whitespace-nowrap">Request Worker</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 sm:h-5 sm:w-5 lg:h-7 lg:w-7" />
                    </>
                  )}
                </button>
              </div>

              {/* TRUST BAR */}
              <div className="mx-2.5 border-t border-gray-100 sm:mx-4 lg:mx-7">
                <div className="grid grid-cols-3">
                  {/* VERIFIED */}
                  <div className="flex min-w-0 items-center justify-center gap-1 px-1 py-2.5 sm:gap-1.5 sm:py-3 lg:gap-3 lg:py-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-7 sm:w-7 lg:h-9 lg:w-9">
                      <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-5 lg:w-5" />
                    </div>

                    <span className="text-[8px] font-semibold leading-3 text-gray-800 sm:text-[9px] lg:text-sm lg:leading-normal">
                      Verified
                      <span className="hidden lg:inline"> Workers</span>
                    </span>
                  </div>

                  {/* TRUSTED */}
                  <div className="flex min-w-0 items-center justify-center gap-1 border-x border-gray-100 px-1 py-2.5 sm:gap-1.5 sm:py-3 lg:gap-3 lg:py-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-7 sm:w-7 lg:h-9 lg:w-9">
                      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-5 lg:w-5" />
                    </div>

                    <span className="text-[8px] font-semibold leading-3 text-gray-800 sm:text-[9px] lg:text-sm lg:leading-normal">
                      Trusted
                      <span className="hidden sm:inline"> by Thousands</span>
                      <span className="sm:hidden"> Trusted</span>
                    </span>
                  </div>

                  {/* SAFE */}
                  <div className="flex min-w-0 items-center justify-center gap-1 px-1 py-2.5 sm:gap-1.5 sm:py-3 lg:gap-3 lg:py-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:h-7 sm:w-7 lg:h-9 lg:w-9">
                      <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-5 lg:w-5" />
                    </div>

                    <span className="text-[8px] font-semibold leading-3 text-gray-800 sm:text-[9px] lg:text-sm lg:leading-normal">
                      Safe
                      <span className="hidden lg:inline"> & Reliable</span>
                      <span className="lg:hidden"> & Reliable</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================
              SEARCH
          ================================= */}
          {/* QUICK ACTIONS + SEARCH */}
          <div className="relative z-40 mb-5 grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* VIEW ALL */}
            <Link
              href="/browse"
              className="group flex h-11 items-center justify-between rounded-xl border border-gray-200 bg-white px-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:h-12 sm:rounded-2xl sm:px-4"
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 sm:h-8 sm:w-8">
                  <Grid2X2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

                <span className="truncate text-[10px] font-bold text-slate-900 sm:text-xs">
                  View All Workers
                </span>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* LOCATION */}
            <div ref={locationRef} className="relative">
              <button
                type="button"
                onClick={() => setLocationOpen((value) => !value)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:h-12 sm:rounded-2xl sm:px-4"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 sm:h-8 sm:w-8">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[9px]">
                      Location
                    </p>

                    <p className="truncate text-[10px] font-bold text-gray-900 sm:text-xs">
                      {selectedLocation || "Near You"}
                    </p>
                  </div>
                </div>

                {selectedLocation ? (
                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      clearLocation();
                    }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </span>
                ) : (
                  <ChevronDown
                    className={[
                      "h-4 w-4 shrink-0 text-gray-400 transition",
                      locationOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                )}
              </button>

              {/* LOCATION DROPDOWN */}
              {locationOpen && (
                <div className="absolute right-0 top-full z-[100] mt-2 w-[230px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl sm:w-[270px]">
                  <button
                    type="button"
                    onClick={clearLocation}
                    className={[
                      "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition",
                      !selectedLocation
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <MapPin className="h-4 w-4 shrink-0" />

                    <div className="min-w-0">
                      <p className="text-xs font-bold">Near You</p>
                      <p className="text-[9px] text-gray-400">
                        Show workers from all locations
                      </p>
                    </div>
                  </button>

                  {loadingLocations && (
                    <div className="border-t border-gray-100 px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
                        <span className="text-[10px] text-gray-400">
                          Loading...
                        </span>
                      </div>
                    </div>
                  )}

                  {!loadingLocations && locations.length > 0 && (
                    <div className="mt-1 max-h-56 overflow-y-auto border-t border-gray-100 pt-1">
                      {locations.map((location) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => handleLocationSelect(location)}
                          className={[
                            "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition",
                            selectedLocation === location
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-gray-700 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

                          <span className="truncate text-xs font-semibold">
                            {location}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEARCH BAR */}
            <div ref={searchRef} className="relative col-span-2">
              <div
                className={[
                  "flex h-11 items-center gap-2 rounded-xl border bg-white px-3 shadow-sm transition sm:h-12 sm:rounded-2xl sm:px-4",
                  searchOpen
                    ? "border-emerald-300 ring-2 ring-emerald-100"
                    : "border-gray-200",
                ].join(" ")}
              >
                <Search className="h-4 w-4 shrink-0 text-gray-400 sm:h-5 sm:w-5" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  onFocus={() => {
                    if (search.trim()) {
                      setSearchOpen(true);
                    }
                  }}
                  placeholder="Search worker, category or service..."
                  className="w-full min-w-0 bg-transparent text-xs font-medium text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {searchOpen && search.trim() && (
                <SearchDropdown
                  workers={workers}
                  search={search}
                  selectedLocation={selectedLocation}
                  onClose={() => setSearchOpen(false)}
                />
              )}
            </div>
          </div>
          {/* =================================
              SELECTED LOCATION
          ================================= */}

          {selectedLocation && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 sm:px-4 sm:py-2.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" />

                <p className="truncate text-[10px] font-semibold text-gray-800 sm:text-xs">
                  {selectedLocation}
                </p>
              </div>

              <span className="ml-2 shrink-0 text-[9px] font-bold text-emerald-700 sm:text-xs">
                {filteredWorkers.length} workers
              </span>
            </div>
          )}

          {/* =================================
              POPULAR
          ================================= */}

          <div className="mb-10">
            <div className="mb-4">
              <h3 className="text-lg font-extrabold text-gray-950 sm:text-xl">
                Popular services
              </h3>

              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Most booked workers
                {selectedLocation ? ` at ${selectedLocation}` : ""}
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-4
                sm:gap-4
                lg:gap-5
              "
            >
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

          {/* =================================
              ALL SERVICES
          ================================= */}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-950 sm:text-xl">
                  All services
                </h3>

                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Choose the service you need
                </p>
              </div>

              <span className="text-xs font-semibold text-gray-400">
                {categories.length} services
              </span>
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                lg:grid-cols-4
              "
            >
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
   CATEGORY CARD
========================================= */

function CategoryCard({
  category,
  workers,
  loading,
  selectedLocation,
  featured = false,
}: {
  category: {
    id: string;
    label: string;
  };

  workers: Worker[];

  loading: boolean;

  selectedLocation: string;

  featured?: boolean;
}) {
  const image = categoryImages[category.id];

  const categoryWorkers = workers.filter(
    (worker) => worker.category === category.id,
  );

  const location =
    selectedLocation || categoryWorkers[0]?.labourChauk || "Near you";

  return (
    <Link
      href={`/browse?category=${encodeURIComponent(category.id)}${
        selectedLocation
          ? `&labourChauk=${encodeURIComponent(selectedLocation)}`
          : ""
      }`}
      className="group"
    >
      <div
        className={[
          "relative overflow-hidden rounded-2xl border bg-white transition-all duration-300",
          "hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/40",
          featured
            ? "min-h-57.5 border-gray-100 sm:min-h-65"
            : "min-h-47.5 border-gray-100 sm:min-h-53.75",
        ].join(" ")}
      >
        {/* IMAGE */}

        <div
          className={[
            "relative overflow-hidden bg-linear-to-br from-emerald-50 via-white to-lime-50",
            featured ? "h-36.25 sm:h-41.25" : "h-28.75 sm:h-33.75",
          ].join(" ")}
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/60" />

          <div className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-lime-100/50" />

          {image ? (
            <Image
              src={image}
              alt={category.label}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="
                relative z-10
                object-contain
                p-3
                transition
                duration-500
                group-hover:scale-110
              "
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">
              👷
            </div>
          )}

          {featured && (
            <div
              className="
                absolute left-3 top-3 z-20
                rounded-full
                bg-white/90
                px-2.5 py-1
                text-[9px]
                font-extrabold
                uppercase
                tracking-wide
                text-emerald-700
                shadow-sm
                backdrop-blur
              "
            >
              Popular
            </div>
          )}
        </div>

        {/* CONTENT */}

        <div className="p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-extrabold text-gray-950 sm:text-base">
                {category.label}
              </h4>

              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-gray-500 sm:text-xs">
                {descriptions[category.id] ||
                  "Find trusted professionals near you"}
              </p>
            </div>

            <div
              className="
                mt-0.5
                flex h-7 w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gray-50
                transition
                group-hover:bg-emerald-600
                group-hover:text-white
              "
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* LOCATION */}

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />

              <span
                className="truncate text-[10px] font-semibold text-gray-400"
                title={location}
              >
                {location}
              </span>
            </div>

            <span className="shrink-0 text-[10px] font-bold text-emerald-600">
              Explore
            </span>
          </div>

          {/* WORKER LIST */}

          {!loading && categoryWorkers.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {categoryWorkers.slice(0, 3).map((worker) => (
                <div
                  key={worker.id}
                  className="
                          flex items-center gap-2
                          rounded-lg
                          bg-gray-50
                          px-2 py-1.5
                        "
                >
                  <div
                    className="
                            relative h-7 w-7
                            shrink-0
                            overflow-hidden
                            rounded-full
                            bg-gray-200
                          "
                  >
                    {worker.photo ? (
                      <Image
                        src={worker.photo}
                        alt={worker.name}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px]">
                        👷
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold text-gray-800">
                      {worker.name}
                    </p>

                    <div className="flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />

                      <span className="text-[9px] text-gray-500">
                        {worker.rating > 0 ? worker.rating.toFixed(1) : "New"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-extrabold text-emerald-600">
                      ₹{worker.fullDayPrice || worker.startingPrice || 0}
                    </p>

                    <p className="text-[8px] text-gray-400">/day</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NO WORKERS */}

          {!loading && categoryWorkers.length === 0 && (
            <p className="mt-2 text-[9px] text-gray-400">
              {selectedLocation
                ? "No workers available at this location"
                : "Available nearby"}
            </p>
          )}

          {/* LOADING */}

          {loading && (
            <div className="mt-2.5 space-y-1.5">
              <div className="h-9 animate-pulse rounded-lg bg-gray-100" />

              <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
            </div>
          )}

          {/* FOOTER */}

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
            <span className="text-[10px] font-semibold text-gray-400">
              {categoryWorkers.length > 0
                ? `${categoryWorkers.length} workers nearby`
                : "Available nearby"}
            </span>

            <span className="text-[10px] font-bold text-emerald-600">
              Explore
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
