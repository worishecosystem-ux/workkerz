"use client";

import {
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Pencil,
  Power,
  Trash2,
  Star,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import WorkerDrawer from "./WorkerDrawer";
import EditWorkerModal from "./EditWorkerModal";
import WorkerOnboardForm from "./WorkerOnboardForm";

import { supabase } from "@/lib/supabase";

import type { Worker, PricingType } from "@/app/data/workers";

/* =====================================================
   API WORKER TYPE
===================================================== */

type ApiWorker = {
  id: string;
  worker_code?: string | null;
  workerCode?: string | null;
  name?: string | null;
  phone?: string | null;

  category?: string | null;
  subcategory?: string | null;
  specialty?: string | null;

  services?: string[] | null;

  pricing_type?: string | null;
  pricingType?: PricingType | null;

  starting_price?: number | string | null;
  startingPrice?: number | string | null;

  half_day_price?: number | string | null;
  halfDayPrice?: number | string | null;

  full_day_price?: number | string | null;
  fullDayPrice?: number | string | null;

  monthly_price?: number | string | null;
  monthlyPrice?: number | string | null;

  visit_charge?: number | string | null;
  visitCharge?: number | string | null;

  rating?: number | string | null;

  review_count?: number | null;
  reviewCount?: number | null;

  location?: string | null;

  labour_chauk?: string | null;
  labourChauk?: string | null;

  available?: boolean | null;

  years_experience?: number | null;
  yearsExperience?: number | null;

  completed_jobs?: number | null;
  completedJobs?: number | null;

  bio?: string | null;

  skills?: string[] | null;

  photo?: string | null;

  response_time?: string | null;
  responseTime?: string | null;

  certifications?: string[] | null;

  created_at?: string | null;
  createdAt?: string | null;
};

/* =====================================================
   HELPERS
===================================================== */

function numberValue(value: number | string | null | undefined): number {
  return Number(value ?? 0) || 0;
}

function pricingValue(value: string | null | undefined): PricingType {
  switch (value) {
    case "per_job":
    case "daily":
    case "monthly":
    case "per_service":
    case "visit_charge":
    case "custom":
      return value;

    default:
      return "custom";
  }
}

/* =====================================================
   NORMALIZE API WORKER
===================================================== */

function normalizeWorker(
  row: ApiWorker,
): Worker {
  const labourChauk =
    row.labourChauk ??
    row.labour_chauk ??
    "";

  const workerCode =
    row.workerCode ??
    row.worker_code ??
    "";

  return {
    id: row.id,

    workerCode,

    name: row.name ?? "",
    phone: row.phone ?? "",

    category:
      row.category ?? "",

    subcategory:
      row.subcategory ?? "",

    specialty:
      row.specialty ?? "",

    services:
      Array.isArray(row.services)
        ? row.services
        : [],

    pricingType:
      pricingValue(
        row.pricingType ??
          row.pricing_type,
      ),

    startingPrice:
      numberValue(
        row.startingPrice ??
          row.starting_price,
      ),

    halfDayPrice:
      numberValue(
        row.halfDayPrice ??
          row.half_day_price,
      ),

    fullDayPrice:
      numberValue(
        row.fullDayPrice ??
          row.full_day_price,
      ),

    monthlyPrice:
      numberValue(
        row.monthlyPrice ??
          row.monthly_price,
      ),

    visitCharge:
      numberValue(
        row.visitCharge ??
          row.visit_charge,
      ),

    rating:
      numberValue(
        row.rating,
      ),

    reviewCount:
      Number(
        row.reviewCount ??
          row.review_count ??
          0,
      ),

    location:
      row.location ?? "",

    labourChauk,

    available:
      row.available ?? true,

    yearsExperience:
      Number(
        row.yearsExperience ??
          row.years_experience ??
          0,
      ),

    completedJobs:
      Number(
        row.completedJobs ??
          row.completed_jobs ??
          0,
      ),

    bio:
      row.bio ?? "",

    skills:
      Array.isArray(row.skills)
        ? row.skills
        : [],

    photo:
      row.photo ?? "",

    responseTime:
      row.responseTime ??
      row.response_time ??
      "Within 1 hour",

    certifications:
      Array.isArray(
        row.certifications,
      )
        ? row.certifications
        : [],

    createdAt:
      row.createdAt ??
      row.created_at ??
      "",
  };
}

/* =====================================================
   COMPONENT
===================================================== */

export default function WorkersTab() {
  /* =====================================================
     STATE
  ===================================================== */

  const [workers, setWorkers] = useState<Worker[]>([]);

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const [editWorker, setEditWorker] = useState<Worker | null>(null);

  const [actionWorker, setActionWorker] = useState<Worker | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [showOnboardForm, setShowOnboardForm] = useState(false);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  /*
   * Category tab
   *
   * "All" = all workers
   */

  const [selectedCategory, setSelectedCategory] = useState("All");

  /* =====================================================
     ADMIN ROLE
  ===================================================== */

  const loadAdminRole = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response = await fetch("/api/admin/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },

        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuperAdmin(data.isSuperAdmin === true);
      }
    } catch (error) {
      console.error("Admin role error:", error);
    }
  };

  /* =====================================================
     LOAD WORKERS
  ===================================================== */

  const loadWorkers = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Your admin session has expired.");

        return;
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      /*
       * Current API limit
       */

      params.set("limit", "100");

      const response = await fetch(`/api/admin/workers?${params.toString()}`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },

        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load workers.");
      }

      const apiWorkers: ApiWorker[] = Array.isArray(data.workers)
        ? data.workers
        : [];

      const normalizedWorkers = apiWorkers.map(normalizeWorker);

      console.log("ADMIN WORKERS:", normalizedWorkers);

      console.log(
        "LABOUR CHAUK VALUES:",
        normalizedWorkers.map((worker) => ({
          id: worker.id,
          name: worker.name,
          labourChauk: worker.labourChauk,
        })),
      );

      setWorkers(normalizedWorkers);
    } catch (error) {
      console.error("Load workers error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to load workers.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadAdminRole();
    loadWorkers();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWorkers();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* =====================================================
     CATEGORY LIST
  ===================================================== */

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();

    workers.forEach((worker) => {
      const category = worker.category?.trim();

      if (category) {
        uniqueCategories.add(category);
      }
    });

    return [
      "All",
      ...Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b)),
    ];
  }, [workers]);

  /* =====================================================
     CATEGORY COUNTS
  ===================================================== */

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    workers.forEach((worker) => {
      const category = worker.category?.trim() || "Other";

      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }, [workers]);

  /* =====================================================
     FILTERED WORKERS
  ===================================================== */

  const filteredWorkers = useMemo(() => {
    if (selectedCategory === "All") {
      return workers;
    }

    return workers.filter(
      (worker) =>
        worker.category?.trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase(),
    );
  }, [workers, selectedCategory]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const getWorkerName = (worker: Worker) => {
    return worker.name || "Unnamed Worker";
  };

  const getPhone = (worker: Worker) => {
    return worker.phone || "—";
  };

  const getCategory = (worker: Worker) => {
    return worker.category || "—";
  };

  const getSpecialty = (worker: Worker) => {
    return worker.specialty || "—";
  };

  const getLocation = (worker: Worker) => {
    return worker.location || "—";
  };

  const getRating = (worker: Worker) => {
    return Number(worker.rating || 0).toFixed(1);
  };

  const isWorkerActive = (worker: Worker) => {
    return worker.available === true;
  };

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const source =
      selectedCategory === "All"
        ? workers
        : workers.filter(
            (worker) =>
              worker.category?.trim().toLowerCase() ===
              selectedCategory.trim().toLowerCase(),
          );

    const total = source.length;

    const active = source.filter((worker) => worker.available === true).length;

    const inactive = total - active;

    const today = new Date();

    const newWorkers = source.filter((worker) => {
      if (!worker.createdAt) {
        return false;
      }

      const created = new Date(worker.createdAt);

      return (
        created.getFullYear() === today.getFullYear() &&
        created.getMonth() === today.getMonth() &&
        created.getDate() === today.getDate()
      );
    }).length;

    return {
      total,
      active,
      inactive,
      newWorkers,
    };
  }, [workers, selectedCategory]);

  /* =====================================================
     DELETE WORKER
  ===================================================== */

  const deleteWorker = async (worker: Worker) => {
    const confirmed = window.confirm(
      `Delete ${getWorkerName(worker)}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Your admin session has expired.");
      }

      const response = await fetch(`/api/admin/workers/${worker.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete worker.");
      }

      setActionWorker(null);

      await loadWorkers(true);
    } catch (error) {
      console.error("Delete worker error:", error);

      setActionError(
        error instanceof Error ? error.message : "Unable to delete worker.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     TOGGLE AVAILABILITY
  ===================================================== */

  const toggleWorkerStatus = async (worker: Worker) => {
    try {
      setActionLoading(true);
      setActionError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Your admin session has expired.");
      }

      const nextAvailable = !worker.available;

      const response = await fetch(`/api/admin/workers/${worker.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          available: nextAvailable,
        }),
      });

      const responseText = await response.text();

      let data: {
        error?: string;
        message?: string;
        worker?: ApiWorker;
      } = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        console.error("API returned non-JSON response:", responseText);

        throw new Error(
          `API error (${response.status}). The server returned an invalid response.`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to update worker availability.",
        );
      }

      setActionWorker(null);

      await loadWorkers(true);
    } catch (error) {
      console.error("Worker availability error:", error);

      setActionError(
        error instanceof Error ? error.message : "Unable to update worker.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     ONBOARD FORM
  ===================================================== */

  if (showOnboardForm) {
    return (
      <WorkerOnboardForm
        onBack={() => setShowOnboardForm(false)}
        onCreated={() => {
          setShowOnboardForm(false);

          loadWorkers(true);
        }}
      />
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex h-20 items-center justify-between border-b border-gray-100 bg-white px-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#0F172A]">Workers</h1>

            {selectedCategory !== "All" && (
              <>
                <span className="text-[#CBD5E1]">/</span>

                <span className="rounded-lg bg-orange-50 px-3 py-1 text-sm font-bold text-[#FF5C39]">
                  {selectedCategory}
                </span>
              </>
            )}
          </div>

          <p className="mt-1 text-sm text-[#64748B]">
            {selectedCategory === "All"
              ? "Manage all Workkerz workers and their profiles."
              : `Manage ${selectedCategory} workers and their profiles.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowOnboardForm(true)}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#FF5C39] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#e54e2e]"
        >
          <UserPlus className="h-4 w-4" />
          Add Worker
        </button>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-8">
        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => loadWorkers(true)}
              className="text-xs font-bold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-4 gap-5">
          <WorkerStat label="Total Workers" value={stats.total} icon={Users} />

          <WorkerStat
            label="Available"
            value={stats.active}
            icon={CheckCircle2}
          />

          <WorkerStat
            label="Unavailable"
            value={stats.inactive}
            icon={XCircle}
          />

          <WorkerStat
            label="New Today"
            value={stats.newWorkers}
            icon={UserPlus}
          />
        </div>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="border-b border-gray-100 bg-white">
            {/* TOP TOOLBAR */}

            <div className="flex items-center justify-between gap-4 p-5">
              {/* SEARCH */}

              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search worker, phone, specialty..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-10 text-sm text-[#0F172A] outline-none transition focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#94A3B8] hover:bg-gray-100 hover:text-[#334155]"
                    title="Clear search"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* ACTIONS */}

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="hidden h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] sm:flex"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>

                <button
                  type="button"
                  onClick={() => loadWorkers(true)}
                  disabled={refreshing}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-[#F8FAFC] disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`h-4 w-4 text-[#64748B] ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* =================================================
                CATEGORY TABS
            ================================================= */}

            <div className="overflow-x-auto px-5 pb-4">
              <div className="flex min-w-max items-center gap-2">
                {categories.map((category) => {
                  const active = selectedCategory === category;

                  const count =
                    category === "All"
                      ? workers.length
                      : categoryCounts[category] || 0;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`group flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
                        active
                          ? "bg-[#FF5C39] text-white shadow-sm"
                          : "border border-gray-200 bg-white text-[#64748B] hover:border-orange-200 hover:bg-orange-50 hover:text-[#FF5C39]"
                      }`}
                    >
                      <span>{category}</span>

                      <span
                        className={`rounded-lg px-2 py-0.5 text-[11px] font-black ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#F1F5F9] text-[#64748B] group-hover:bg-orange-100 group-hover:text-[#FF5C39]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex h-80 flex-col items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#FF5C39]" />

              <p className="mt-3 text-sm text-[#64748B]">Loading workers...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================= */

            <div className="flex h-80 flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                <Users className="h-7 w-7 text-[#FF5C39]" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
                {selectedCategory === "All"
                  ? "No workers found"
                  : `No ${selectedCategory} workers found`}
              </h3>

              <p className="mt-1 max-w-sm text-xs text-[#94A3B8]">
                {search
                  ? `No workers match "${search}". Try a different search.`
                  : selectedCategory === "All"
                    ? "Add your first worker to get started."
                    : `There are currently no workers in the ${selectedCategory} category.`}
              </p>

              {(search || selectedCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");

                    setSelectedCategory("All");
                  }}
                  className="mt-4 rounded-xl bg-[#FF5C39] px-4 py-2 text-xs font-bold text-white hover:bg-[#e54e2e]"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            /* =================================================
               TABLE
            ================================================= */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="bg-[#F8FAFC] text-left">
                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Worker
                    </th>

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Contact
                    </th>

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Category
                    </th>

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Location
                    </th>

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Rating
                    </th>

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-bold text-[#64748B]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredWorkers.map((worker) => {
                    const active = isWorkerActive(worker);

                    return (
                      <tr
                        key={worker.id}
                        className="transition hover:bg-[#FAFAFA]"
                      >
                        {/* =================================================
                              WORKER
                          ================================================= */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-orange-50">
                              {worker.photo ? (
                                <img
                                  src={worker.photo}
                                  alt={worker.name || "Worker"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Users className="h-5 w-5 text-[#FF5C39]" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#0F172A]">
                                {getWorkerName(worker)}
                              </p>

                              <p className="truncate text-xs text-[#64748B]">
                                {getSpecialty(worker)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* =================================================
                              CONTACT
                          ================================================= */}

                        <td className="px-6 py-4">
                          <p className="text-sm text-[#334155]">
                            {getPhone(worker)}
                          </p>
                        </td>

                        {/* =================================================
                              CATEGORY
                          ================================================= */}

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-[#334155]">
                              {getCategory(worker)}
                            </p>

                            {worker.subcategory && (
                              <p className="mt-1 text-xs text-[#94A3B8]">
                                {worker.subcategory}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* =================================================
                              LOCATION
                          ================================================= */}

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-[#334155]">
                              {getLocation(worker)}
                            </p>

                            {worker.labourChauk && (
                              <p className="mt-1 max-w-[180px] truncate text-xs text-[#94A3B8]">
                                Chauk: {worker.labourChauk}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* =================================================
                              RATING
                          ================================================= */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 fill-current text-amber-500" />

                            <span className="text-sm font-semibold text-[#334155]">
                              {getRating(worker)}
                            </span>

                            <span className="text-xs text-[#94A3B8]">
                              ({worker.reviewCount ?? 0})
                            </span>
                          </div>
                        </td>

                        {/* =================================================
                              STATUS
                          ================================================= */}

                        <td className="px-6 py-4">
                          {active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                              Unavailable
                            </span>
                          )}
                        </td>

                        {/* =================================================
                              ACTION
                          ================================================= */}

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedWorker(worker)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                              title="View worker"
                            >
                              <Eye className="h-4 w-4 text-[#64748B]" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActionError("");

                                setActionWorker(worker);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                              title="Worker actions"
                            >
                              <MoreHorizontal className="h-4 w-4 text-[#64748B]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          {!loading && filteredWorkers.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-[#FAFAFA] px-6 py-3">
              <p className="text-xs font-medium text-[#64748B]">
                Showing{" "}
                <span className="font-bold text-[#334155]">
                  {filteredWorkers.length}
                </span>{" "}
                worker
                {filteredWorkers.length !== 1 ? "s" : ""}
                {selectedCategory !== "All" && (
                  <>
                    {" "}
                    in{" "}
                    <span className="font-bold text-[#FF5C39]">
                      {selectedCategory}
                    </span>
                  </>
                )}
              </p>

              {search && (
                <p className="text-xs text-[#94A3B8]">
                  Search:{" "}
                  <span className="font-semibold text-[#64748B]">
                    "{search}"
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ACTION MENU
      ===================================================== */}

      {actionWorker && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close actions"
            onClick={() => setActionWorker(null)}
            className="absolute inset-0 bg-black/20"
          />

          <div className="absolute right-8 top-24 w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
            {/* HEADER */}

            <div className="border-b border-gray-100 px-3 py-3">
              <p className="text-sm font-bold text-[#0F172A]">
                {getWorkerName(actionWorker)}
              </p>

              <p className="mt-1 text-xs text-[#64748B]">Worker actions</p>
            </div>

            {/* =================================================
                EDIT
            ================================================= */}

            <button
              type="button"
              onClick={() => {
                console.log("OPENING EDIT WORKER:", actionWorker);

                console.log("EDIT LABOUR CHAUK:", actionWorker.labourChauk);

                setEditWorker(actionWorker);

                setActionWorker(null);

                setActionError("");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#F8FAFC]"
            >
              <Pencil className="h-4 w-4 text-[#64748B]" />

              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Edit Worker
                </p>

                <p className="text-xs text-[#94A3B8]">
                  Update worker information
                </p>
              </div>
            </button>

            {/* =================================================
                AVAILABILITY
            ================================================= */}

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => toggleWorkerStatus(actionWorker)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              <Power className="h-4 w-4 text-[#64748B]" />

              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  {isWorkerActive(actionWorker)
                    ? "Make Unavailable"
                    : "Make Available"}
                </p>

                <p className="text-xs text-[#94A3B8]">
                  {isWorkerActive(actionWorker)
                    ? "Stop new bookings"
                    : "Allow new bookings"}
                </p>
              </div>
            </button>

            {/* =================================================
                DELETE
            ================================================= */}

            {isSuperAdmin && (
              <>
                <div className="my-1 border-t border-gray-100" />

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => deleteWorker(actionWorker)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />

                  <div>
                    <p className="text-sm font-semibold text-red-600">
                      Delete Worker
                    </p>

                    <p className="text-xs text-red-400">
                      Permanently remove worker
                    </p>
                  </div>
                </button>
              </>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {actionError && (
              <div className="mx-2 mb-2 mt-1 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                <p className="text-xs text-red-600">{actionError}</p>
              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {actionLoading && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#64748B]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating...
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          WORKER DRAWER
      ===================================================== */}

      <WorkerDrawer
        worker={selectedWorker}
        onClose={() => setSelectedWorker(null)}
      />

      {/* =====================================================
          EDIT WORKER
      ===================================================== */}

      <EditWorkerModal
        worker={editWorker}
        onClose={() => setEditWorker(null)}
        onUpdated={(updatedWorker) => {
          console.log("WORKER UPDATED:", updatedWorker);

          console.log("UPDATED LABOUR CHAUK:", updatedWorker.labourChauk);

          setWorkers((current) =>
            current.map((worker) =>
              worker.id === updatedWorker.id ? updatedWorker : worker,
            ),
          );

          setEditWorker(null);
        }}
      />
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function WorkerStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#64748B]">{label}</p>

          <p className="mt-2 text-3xl font-black text-[#0F172A]">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
          <Icon className="h-5 w-5 text-[#FF5C39]" />
        </div>
      </div>
    </div>
  );
}
