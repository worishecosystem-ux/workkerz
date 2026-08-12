"use client";

import Image from "next/image";
import { FormEvent, ReactNode, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  Minus,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { serviceCategories } from "@/app/data/workers";

const locations = [
  "Bhopal",
  "Gwalior",
  "Indore",
  "Jabalpur",
  "Bilaspur",
  "Raipur",
  "Other",
];

const states = [
  "Madhya Pradesh",
  "Chhattisgarh",
  "Rajasthan",
  "Maharashtra",
  "Uttar Pradesh",
  "Other",
];

const districtsByState: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Bhopal",
    "Gwalior",
    "Indore",
    "Jabalpur",
    "Ujjain",
    "Sagar",
    "Other",
  ],
  Chhattisgarh: [
    "Bilaspur",
    "Raipur",
    "Durg",
    "Korba",
    "Rajnandgaon",
    "Other",
  ],
  Rajasthan: ["Jaipur", "Kota", "Udaipur", "Jodhpur", "Other"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Other"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Other"],
  Other: ["Other"],
};

const durations = [
  "Few Hours",
  "1 Day",
  "2 Days",
  "3 Days",
  "1 Week",
  "1 Month",
];

const categoryImages: Record<string, string> = {
  Labour: "/categories/workkerz/Labour.png",
  Driver: "/categories/workkerz/Driver.png",
  Mechanic: "/categories/workkerz/Mechanic.png",
  Painter: "/categories/workkerz/painter.png",
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

export default function HomeHero() {
  const [requestOpen, setRequestOpen] = useState(false);

  const [workerCount, setWorkerCount] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [categorySearch, setCategorySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const [fullAddress, setFullAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [workDate, setWorkDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1 Day");
  const [budget, setBudget] = useState("");
  const [requirement, setRequirement] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  const categories = useMemo(() => serviceCategories, []);

  const selectedCategoryLabel = useMemo(() => {
    const category = categories.find(
      (item) => item.id === selectedCategory,
    );

    return category?.label || "Select Category";
  }, [categories, selectedCategory]);

  const availableDistricts = useMemo(() => {
    return districtsByState[state] || [];
  }, [state]);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();

    return categories
      .filter((category) => category.id !== "all")
      .filter(
        (category) =>
          !search ||
          category.label.toLowerCase().includes(search),
      );
  }, [categories, categorySearch]);

  const filteredLocations = useMemo(() => {
    const search = locationSearch.trim().toLowerCase();

    return locations.filter(
      (location) =>
        !search ||
        location.toLowerCase().includes(search),
    );
  }, [locationSearch]);

  const today = new Date()
    .toISOString()
    .split("T")[0];

  /* =====================================================
     WORKERS
  ===================================================== */

  const increaseWorkers = () => {
    setWorkerCount((count) =>
      Math.min(count + 1, 50),
    );
  };

  const decreaseWorkers = () => {
    setWorkerCount((count) =>
      Math.max(count - 1, 1),
    );
  };

  /* =====================================================
     OPEN / CLOSE
  ===================================================== */

  const openRequest = () => {
    setSubmitted(false);
    setError("");
    setRequestOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setRequestOpen(false);
    setError("");
    setCategoryOpen(false);
    setLocationOpen(false);
  };

  /* =====================================================
     RESET
  ===================================================== */

  const resetForm = () => {
    setSubmitted(false);

    setWorkerCount(1);

    setSelectedLocation("");
    setSelectedCategory("all");

    setCategorySearch("");
    setLocationSearch("");

    setCategoryOpen(false);
    setLocationOpen(false);

    setFullAddress("");
    setLocality("");
    setDistrict("");
    setState("");
    setPincode("");

    setWorkDate("");
    setStartTime("");
    setDuration("1 Day");
    setBudget("");
    setRequirement("");

    setError("");
  };

  /* =====================================================
     STATE
  ===================================================== */

  const handleStateChange = (
    value: string,
  ) => {
    setState(value);
    setDistrict("");
  };

  /* =====================================================
     PINCODE
  ===================================================== */

  const handlePincodeChange = (
    value: string,
  ) => {
    setPincode(
      value.replace(/\D/g, "").slice(0, 6),
    );
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    if (!selectedLocation) {
      return "Please select your work location.";
    }

    if (selectedCategory === "all") {
      return "Please select a work category.";
    }

    if (!fullAddress.trim()) {
      return "Please enter your full work address.";
    }

    if (!locality.trim()) {
      return "Please enter your area / locality.";
    }

    if (!state) {
      return "Please select your state.";
    }

    if (!district) {
      return "Please select your district.";
    }

    if (pincode.length !== 6) {
      return "Please enter a valid 6-digit pincode.";
    }

    if (!workDate) {
      return "Please select your work date.";
    }

    if (!requirement.trim()) {
      return "Please enter your work requirement.";
    }

    return "";
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (
    event?: FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();

    if (submitting) return;

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const { error: insertError } =
        await supabase
          .from("worker_requests")
          .insert({
            workers_required: workerCount,
            location: selectedLocation,
            category: selectedCategory,

            full_address: fullAddress.trim(),
            locality: locality.trim(),
            district,
            state,
            pincode,

            work_date: workDate,
            start_time: startTime || null,

            duration,

            budget: budget
              ? Number(budget)
              : null,

            requirement:
              requirement.trim(),

            status: "pending",
            source: "home",
          });

      if (insertError) {
        console.error(
          "Worker request insert error:",
          insertError,
        );

        setError(
          "Request submit nahi ho payi. Please try again.",
        );

        return;
      }

      /*
       * IMPORTANT:
       * Modal close hoga.
       * Success Home page par dikhega.
       */

      setSubmitted(true);
      setRequestOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Worker request error:",
        err,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* =====================================================
          HOME HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

          <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-green-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">
                Workkerz Worker Request
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Worker Chahiye?
              <span className="text-emerald-600">
                {" "}
                Request Karo.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Apni worker requirement submit
              karein. Workkerz team suitable
              workers arrange karne ke liye
              aapse contact karegi.
            </p>

            <button
              type="button"
              onClick={openRequest}
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              {submitted
                ? "Submit Another Request"
                : "Request Worker"}

              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <TrustBadge
                icon={
                  <ShieldCheck className="h-4 w-4" />
                }
                text="Verified Workers"
              />

              <TrustBadge
                icon={
                  <Users className="h-4 w-4" />
                }
                text="Team Support"
              />

              <TrustBadge
                icon={
                  <CheckCircle2 className="h-4 w-4" />
                }
                text="No Advance Payment"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUCCESS ON HOME PAGE
      ===================================================== */}

      {submitted && (
        <SuccessScreen
          workerCount={workerCount}
          selectedCategoryLabel={
            selectedCategoryLabel
          }
          selectedLocation={
            selectedLocation
          }
          duration={duration}
          fullAddress={fullAddress}
          locality={locality}
          district={district}
          state={state}
          pincode={pincode}
          onReset={() => {
            resetForm();
            setRequestOpen(true);
          }}
          onClose={resetForm}
        />
      )}

      {/* =====================================================
          FULL SCREEN REQUEST MODAL
      ===================================================== */}

      {requestOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeModal();
            }
          }}
        >
          <div className="flex h-dvh w-full items-center justify-center">
            <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f7faf8] lg:h-[96vh] lg:max-w-6xl lg:rounded-[24px] lg:border lg:border-white/20 lg:shadow-2xl">
              {/* =================================================
                  HEADER
              ================================================= */}

              <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-2.5 pt-[max(10px,env(safe-area-inset-top))] sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600">
                    <Users className="h-4 w-4 text-white" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-600">
                      Workkerz
                    </p>

                    <h2 className="truncate text-sm font-black text-gray-950">
                      Request Worker
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  aria-label="Close request form"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              {/* =================================================
                  FORM SCROLL
              ================================================= */}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="mx-auto w-full max-w-5xl px-3 py-3 pb-6 sm:px-5 sm:py-5"
                >
                  {/* FORM TITLE */}

                  <div className="mb-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <span className="text-[8px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        Worker Request
                      </span>
                    </div>

                    <h1 className="mt-2 text-xl font-black tracking-tight text-gray-950 sm:text-2xl">
                      Apni requirement submit
                      karein
                    </h1>

                    <p className="mt-1 text-[11px] leading-4 text-gray-500">
                      Complete details dene se
                      suitable worker arrange karna
                      easy hota hai.
                    </p>
                  </div>

                  <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.05)]">
                    {/* =================================================
                        SECTION 01
                    ================================================= */}

                    <FormSection
                      number="01"
                      title="Worker Requirement"
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        {/* WORKER COUNT */}

                        <div>
                          <FieldLabel
                            icon={
                              <Users className="h-3.5 w-3.5" />
                            }
                            label="Workers Required"
                          />

                          <div className="mt-1.5 flex h-11 items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-1.5">
                            <button
                              type="button"
                              onClick={
                                decreaseWorkers
                              }
                              disabled={
                                workerCount <= 1
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm transition hover:bg-gray-100 disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <div className="flex items-center justify-center">
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={
                                  workerCount
                                }
                                onChange={(
                                  event,
                                ) => {
                                  const value =
                                    event.target
                                      .value;

                                  if (!value) {
                                    setWorkerCount(
                                      1,
                                    );
                                    return;
                                  }

                                  const number =
                                    Number(
                                      value,
                                    );

                                  if (
                                    !Number.isNaN(
                                      number,
                                    )
                                  ) {
                                    setWorkerCount(
                                      Math.min(
                                        Math.max(
                                          number,
                                          1,
                                        ),
                                        50,
                                      ),
                                    );
                                  }
                                }}
                                inputMode="numeric"
                                enterKeyHint="next"
                                aria-label="Number of workers"
                                className="w-12 bg-transparent text-center text-base font-black text-gray-950 outline-none"
                              />

                              <span className="text-[10px] text-gray-500">
                                Worker
                                {workerCount >
                                1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={
                                increaseWorkers
                              }
                              disabled={
                                workerCount >=
                                50
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-30"
                            >
                              <span className="text-lg leading-none">
                                +
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* LOCATION */}

                        <div className="relative">
                          <FieldLabel
                            icon={
                              <MapPin className="h-3.5 w-3.5" />
                            }
                            label="Work Location"
                            required
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setLocationOpen(
                                (open) =>
                                  !open,
                              );

                              setCategoryOpen(
                                false,
                              );

                              setLocationSearch(
                                "",
                              );
                            }}
                            className={`mt-1.5 flex h-11 w-full items-center gap-2 rounded-xl border px-3 text-left transition ${
                              locationOpen
                                ? "border-emerald-500 bg-emerald-50/30"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />

                            <span
                              className={`min-w-0 flex-1 truncate text-xs font-bold ${
                                selectedLocation
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {selectedLocation ||
                                "Search / select location"}
                            </span>

                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-gray-400 transition ${
                                locationOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          {locationOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                              <div className="border-b border-gray-100 p-2">
                                <div className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5">
                                  <Search className="h-3.5 w-3.5 text-gray-400" />

                                  <input
                                    autoFocus
                                    value={
                                      locationSearch
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      setLocationSearch(
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    placeholder="Search location..."
                                    inputMode="search"
                                    enterKeyHint="done"
                                    className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                                  />
                                </div>
                              </div>

                              <div className="max-h-44 overflow-y-auto p-1.5">
                                {filteredLocations.length >
                                0 ? (
                                  filteredLocations.map(
                                    (
                                      location,
                                    ) => (
                                      <button
                                        key={
                                          location
                                        }
                                        type="button"
                                        onClick={() => {
                                          setSelectedLocation(
                                            location,
                                          );

                                          setLocationOpen(
                                            false,
                                          );

                                          setLocationSearch(
                                            "",
                                          );
                                        }}
                                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                                          selectedLocation ===
                                          location
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                      >
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />

                                        <span className="truncate text-xs font-bold">
                                          {
                                            location
                                          }
                                        </span>

                                        {selectedLocation ===
                                          location && (
                                          <Check className="ml-auto h-3.5 w-3.5" />
                                        )}
                                      </button>
                                    ),
                                  )
                                ) : (
                                  <p className="px-3 py-4 text-center text-xs text-gray-400">
                                    No location found
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* CATEGORY */}

                        <div className="relative md:col-span-2">
                          <FieldLabel
                            icon={
                              <Users className="h-3.5 w-3.5" />
                            }
                            label="Work Category"
                            required
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setCategoryOpen(
                                (open) =>
                                  !open,
                              );

                              setLocationOpen(
                                false,
                              );

                              setCategorySearch(
                                "",
                              );
                            }}
                            className={`mt-1.5 flex h-11 w-full items-center gap-2 rounded-xl border px-3 text-left transition ${
                              categoryOpen
                                ? "border-emerald-500 bg-emerald-50/30"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                              {selectedCategory !==
                                "all" &&
                              categoryImages[
                                selectedCategoryLabel
                              ] ? (
                                <Image
                                  src={
                                    categoryImages[
                                      selectedCategoryLabel
                                    ]
                                  }
                                  alt={
                                    selectedCategoryLabel
                                  }
                                  fill
                                  sizes="28px"
                                  className="object-contain p-0.5"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                              )}
                            </div>

                            <span
                              className={`min-w-0 flex-1 truncate text-xs font-bold ${
                                selectedCategory ===
                                "all"
                                  ? "text-gray-400"
                                  : "text-gray-900"
                              }`}
                            >
                              {selectedCategory ===
                              "all"
                                ? "Search / select category"
                                : selectedCategoryLabel}
                            </span>

                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-gray-400 transition ${
                                categoryOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          {categoryOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                              <div className="border-b border-gray-100 p-2">
                                <div className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5">
                                  <Search className="h-3.5 w-3.5 text-gray-400" />

                                  <input
                                    autoFocus
                                    value={
                                      categorySearch
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      setCategorySearch(
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    placeholder="Search all categories..."
                                    inputMode="search"
                                    enterKeyHint="done"
                                    className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                                  />

                                  {categorySearch && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCategorySearch(
                                          "",
                                        )
                                      }
                                      className="text-gray-400"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="max-h-56 overflow-y-auto p-1.5">
                                {filteredCategories.length >
                                0 ? (
                                  filteredCategories.map(
                                    (
                                      category,
                                    ) => {
                                      const selected =
                                        selectedCategory ===
                                        category.id;

                                      const imageSrc =
                                        categoryImages[
                                          category.label
                                        ];

                                      return (
                                        <button
                                          key={
                                            category.id
                                          }
                                          type="button"
                                          onClick={() => {
                                            setSelectedCategory(
                                              category.id,
                                            );

                                            setCategoryOpen(
                                              false,
                                            );

                                            setCategorySearch(
                                              "",
                                            );
                                          }}
                                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition ${
                                            selected
                                              ? "bg-emerald-50"
                                              : "hover:bg-gray-50"
                                          }`}
                                        >
                                          <div
                                            className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
                                              selected
                                                ? "bg-emerald-100"
                                                : "bg-gray-100"
                                            }`}
                                          >
                                            {imageSrc ? (
                                              <Image
                                                src={
                                                  imageSrc
                                                }
                                                alt={
                                                  category.label
                                                }
                                                fill
                                                sizes="32px"
                                                className="object-contain p-0.5"
                                              />
                                            ) : (
                                              <span className="text-[10px] font-black text-gray-500">
                                                {category.label
                                                  .charAt(
                                                    0,
                                                  )
                                                  .toUpperCase()}
                                              </span>
                                            )}
                                          </div>

                                          <span
                                            className={`min-w-0 flex-1 truncate text-xs font-bold ${
                                              selected
                                                ? "text-emerald-700"
                                                : "text-gray-800"
                                            }`}
                                          >
                                            {
                                              category.label
                                            }
                                          </span>

                                          <span
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                              selected
                                                ? "bg-emerald-600 text-white"
                                                : "bg-gray-100 text-transparent"
                                            }`}
                                          >
                                            <Check className="h-3 w-3" />
                                          </span>
                                        </button>
                                      );
                                    },
                                  )
                                ) : (
                                  <p className="px-3 py-4 text-center text-xs text-gray-400">
                                    No category found
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormSection>

                    {/* =================================================
                        SECTION 02 ADDRESS
                    ================================================= */}

                    <FormSection
                      number="02"
                      title="Work Address"
                    >
                      <div className="grid gap-2.5">
                        <InputField
                          label="Full Address"
                          required
                          placeholder="House / Plot, Street, Building, Landmark"
                          value={fullAddress}
                          onChange={(event) =>
                            setFullAddress(
                              event.target.value,
                            )
                          }
                          enterKeyHint="next"
                        />

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <InputField
                            label="Area / Locality"
                            required
                            placeholder="e.g. Thatipur"
                            value={locality}
                            onChange={(event) =>
                              setLocality(
                                event.target.value,
                              )
                            }
                            enterKeyHint="next"
                          />

                          <SelectField
                            label="State"
                            required
                            value={state}
                            onChange={(event) =>
                              handleStateChange(
                                event.target.value,
                              )
                            }
                            options={states}
                            placeholder="Select state"
                          />

                          <SelectField
                            label="District"
                            required
                            value={district}
                            onChange={(event) =>
                              setDistrict(
                                event.target.value,
                              )
                            }
                            options={
                              availableDistricts
                            }
                            placeholder={
                              state
                                ? "Select district"
                                : "Select state first"
                            }
                            disabled={!state}
                          />

                          <InputField
                            label="Pincode"
                            required
                            placeholder="6-digit pincode"
                            value={pincode}
                            onChange={(event) =>
                              handlePincodeChange(
                                event.target.value,
                              )
                            }
                            inputMode="numeric"
                            maxLength={6}
                            enterKeyHint="next"
                          />
                        </div>

                        {(fullAddress ||
                          locality ||
                          district ||
                          state ||
                          pincode) && (
                          <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

                            <div className="min-w-0">
                              <p className="text-[8px] font-black uppercase tracking-wide text-emerald-600">
                                Address Preview
                              </p>

                              {fullAddress && (
                                <p className="mt-0.5 truncate text-[11px] font-bold text-gray-800">
                                  {
                                    fullAddress
                                  }
                                </p>
                              )}

                              <p className="text-[10px] text-gray-500">
                                {[
                                  locality,
                                  district,
                                  state,
                                ]
                                  .filter(
                                    Boolean,
                                  )
                                  .join(", ")}

                                {pincode &&
                                  ` - ${pincode}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormSection>

                    {/* =================================================
                        SECTION 03 SCHEDULE
                    ================================================= */}

                    <FormSection
                      number="03"
                      title="Work Schedule"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <CompactDateTime
                          icon={
                            <CalendarDays className="h-4 w-4" />
                          }
                          label="Work Date"
                          required
                        >
                          <input
                            type="date"
                            min={today}
                            value={workDate}
                            onChange={(event) =>
                              setWorkDate(
                                event.target
                                  .value,
                              )
                            }
                            enterKeyHint="next"
                            className="mt-0.5 w-full bg-transparent text-xs font-black text-gray-900 outline-none"
                          />
                        </CompactDateTime>

                        <CompactDateTime
                          icon={
                            <Clock3 className="h-4 w-4" />
                          }
                          label="Start Time"
                        >
                          <input
                            type="time"
                            value={startTime}
                            onChange={(event) =>
                              setStartTime(
                                event.target
                                  .value,
                              )
                            }
                            enterKeyHint="next"
                            className="mt-0.5 w-full bg-transparent text-xs font-black text-gray-900 outline-none"
                          />
                        </CompactDateTime>
                      </div>

                      <div className="mt-3">
                        <FieldLabel label="Work Duration" />

                        <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                          {durations.map(
                            (item) => {
                              const active =
                                duration ===
                                item;

                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() =>
                                    setDuration(
                                      item,
                                    )
                                  }
                                  className={`h-9 rounded-lg border px-2 text-[10px] font-black transition ${
                                    active
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50"
                                  }`}
                                >
                                  {item}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </FormSection>

                    {/* =================================================
                        SECTION 04 DETAILS
                    ================================================= */}

                    <FormSection
                      number="04"
                      title="Budget & Work Details"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <InputField
                          label="Approx Budget"
                          placeholder="e.g. 1500"
                          value={budget}
                          onChange={(event) =>
                            setBudget(
                              event.target.value,
                            )
                          }
                          inputMode="numeric"
                          enterKeyHint="next"
                          prefix="₹"
                        />

                        <div>
                          <FieldLabel
                            label="Work Requirement"
                            required
                          />

                          <textarea
                            value={requirement}
                            onChange={(event) =>
                              setRequirement(
                                event.target
                                  .value,
                              )
                            }
                            rows={3}
                            placeholder="Example: 3 labour chahiye construction site ke liye..."
                            enterKeyHint="done"
                            className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-50"
                          />
                        </div>
                      </div>
                    </FormSection>

                    {/* ERROR */}

                    {error && (
                      <div className="mx-3 mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 sm:mx-5">
                        <p className="text-[11px] font-bold text-red-600">
                          {error}
                        </p>
                      </div>
                    )}

                    {/* =================================================
                        STICKY SUBMIT
                    ================================================= */}

                    <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 p-2.5 backdrop-blur-md sm:p-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Worker Request
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[9px] font-medium text-gray-400">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        No advance payment required
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   FORM SECTION
========================================================= */

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-gray-100 p-3.5 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[9px] font-black text-emerald-600">
          {number}
        </div>

        <h2 className="text-sm font-black text-gray-950">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  icon,
  label,
  required = false,
}: {
  icon?: ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {icon && (
        <span className="text-emerald-600">
          {icon}
        </span>
      )}

      <label className="text-[10px] font-bold text-gray-700">
        {label}

        {required && (
          <span className="ml-0.5 text-red-500">
            *
          </span>
        )}
      </label>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  required,
  placeholder,
  value,
  onChange,
  inputMode,
  maxLength,
  prefix,
  enterKeyHint,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  prefix?: string;
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
}) {
  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
      />

      <div className="mt-1.5 flex h-10 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-50">
        {prefix && (
          <span className="mr-1.5 text-sm font-black text-gray-500">
            {prefix}
          </span>
        )}

        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          enterKeyHint={enterKeyHint}
          className="min-w-0 w-full bg-transparent text-xs font-medium text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
      />

      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 pr-8 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

/* =========================================================
   DATE / TIME
========================================================= */

function CompactDateTime({
  icon,
  label,
  required,
  children,
}: {
  icon: ReactNode;
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-wide text-gray-400">
              {label}
            </span>

            {required && (
              <span className="text-[9px] text-red-500">
                *
              </span>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TRUST
========================================================= */

function TrustBadge({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-gray-500">
      <span className="text-emerald-600">
        {icon}
      </span>

      <span className="text-[10px] font-semibold">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   SUCCESS
========================================================= */

function SuccessScreen({
  workerCount,
  selectedCategoryLabel,
  selectedLocation,
  duration,
  fullAddress,
  locality,
  district,
  state,
  pincode,
  onReset,
  onClose,
}: {
  workerCount: number;
  selectedCategoryLabel: string;
  selectedLocation: string;
  duration: string;
  fullAddress: string;
  locality: string;
  district: string;
  state: string;
  pincode: string;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <section className="bg-[#f7faf8] px-3 py-5 sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_15px_60px_rgba(0,0,0,0.08)]">
        {/* SUCCESS HEADER */}

        <div className="bg-emerald-600 px-4 py-6 text-center text-white sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <p className="mt-3 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-100">
            Request Submitted
          </p>

          <h2 className="mt-1 text-xl font-black sm:text-2xl">
            Worker request received
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-emerald-50">
            Aapki requirement Workkerz team ko
            receive ho gayi hai. Team availability
            check karke aapse contact karegi.
          </p>
        </div>

        {/* SUMMARY */}

        <div className="p-3.5 sm:p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryItem
              label="Workers"
              value={`${workerCount}`}
            />

            <SummaryItem
              label="Category"
              value={selectedCategoryLabel}
            />

            <SummaryItem
              label="Location"
              value={selectedLocation}
            />

            <SummaryItem
              label="Duration"
              value={duration}
            />
          </div>

          {/* ADDRESS */}

          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-wide text-gray-400">
                  Work Address
                </p>

                <p className="mt-0.5 text-xs font-bold leading-5 text-gray-800">
                  {fullAddress}
                </p>

                <p className="text-[10px] leading-4 text-gray-500">
                  {locality},{" "}
                  {district},{" "}
                  {state} - {pincode}
                </p>
              </div>
            </div>
          </div>

          {/* PAYMENT */}

          <div className="mt-3 flex gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

            <div>
              <p className="text-[11px] font-bold text-emerald-800">
                No advance payment required
              </p>

              <p className="mt-0.5 text-[10px] leading-4 text-emerald-700">
                Request submit karne ke liye koi
                advance payment required nahi hai.
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onReset}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-950 text-xs font-bold text-white transition hover:bg-emerald-600"
            >
              Submit Another Request

              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
      <p className="text-[8px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[10px] font-black text-gray-800">
        {value}
      </p>
    </div>
  );
}