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
  MapPin,
  Phone,
  BriefcaseBusiness,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import WorkerDrawer from "./WorkerDrawer";
import EditWorkerModal from "./EditWorkerModal";
import WorkerOnboardForm from "./WorkerOnboardForm";

import { supabase } from "@/lib/supabase";
import type { Worker, PricingType } from "@/app/data/workers";

type WorkersTabProps = {
  onFormOpenChange?: (open: boolean) => void;
};

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
   NORMALIZE WORKER
===================================================== */

function normalizeWorker(row: ApiWorker): Worker {
  return {
    id: row.id,

    workerCode: row.workerCode ?? row.worker_code ?? "",

    name: row.name ?? "",
    phone: row.phone ?? "",

    category: row.category ?? "",
    subcategory: row.subcategory ?? "",
    specialty: row.specialty ?? "",

    services: Array.isArray(row.services) ? row.services : [],

    pricingType: pricingValue(row.pricingType ?? row.pricing_type),

    startingPrice: numberValue(row.startingPrice ?? row.starting_price),

    halfDayPrice: numberValue(row.halfDayPrice ?? row.half_day_price),

    fullDayPrice: numberValue(row.fullDayPrice ?? row.full_day_price),

    monthlyPrice: numberValue(row.monthlyPrice ?? row.monthly_price),

    visitCharge: numberValue(row.visitCharge ?? row.visit_charge),

    rating: numberValue(row.rating),

    reviewCount: Number(row.reviewCount ?? row.review_count ?? 0),

    location: row.location ?? "",

    labourChauk: row.labourChauk ?? row.labour_chauk ?? "",

    available: row.available ?? true,

    yearsExperience: Number(row.yearsExperience ?? row.years_experience ?? 0),

    completedJobs: Number(row.completedJobs ?? row.completed_jobs ?? 0),

    bio: row.bio ?? "",

    skills: Array.isArray(row.skills) ? row.skills : [],

    photo: row.photo ?? "",

    responseTime: row.responseTime ?? row.response_time ?? "Within 1 hour",

    certifications: Array.isArray(row.certifications) ? row.certifications : [],

    createdAt: row.createdAt ?? row.created_at ?? "",
  };
}

/* =====================================================
   COMPONENT
===================================================== */

export default function WorkersTab({ onFormOpenChange }: WorkersTabProps) {
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

  const [selectedCategory, setSelectedCategory] = useState("All");

  /* =====================================================
     ADMIN ROLE
  ===================================================== */

  const loadAdminRole = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

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

      setWorkers(apiWorkers.map(normalizeWorker));
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
     CATEGORIES
  ===================================================== */

  const categories = useMemo(() => {
    const unique = new Set<string>();

    workers.forEach((worker) => {
      const category = worker.category?.trim();

      if (category) {
        unique.add(category);
      }
    });

    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
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
     FILTER
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

  const getWorkerName = (worker: Worker) => worker.name || "Unnamed Worker";

  const getPhone = (worker: Worker) => worker.phone || "—";

  const getCategory = (worker: Worker) => worker.category || "—";

  const getSpecialty = (worker: Worker) => worker.specialty || "—";

  const getLocation = (worker: Worker) => worker.location || "—";

  const getRating = (worker: Worker) => Number(worker.rating || 0).toFixed(1);

  const isWorkerActive = (worker: Worker) => worker.available === true;

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
     DELETE
  ===================================================== */

  const deleteWorker = async (worker: Worker) => {
    const confirmed = window.confirm(
      `Delete ${getWorkerName(worker)}? This action cannot be undone.`,
    );

    if (!confirmed) return;

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
     TOGGLE STATUS
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
        onBack={() => {
          setShowOnboardForm(false);
          onFormOpenChange?.(false);
        }}
        onCreated={() => {
          setShowOnboardForm(false);
          onFormOpenChange?.(false);
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

      <header className="fixed inset-x-0  z-40 border-b border-gray-100 bg-white sm:top-0">
        <div className="flex h-24 items-center justify-between  px-3 pt-18 pb-8  sm:h-20 sm:px-6 sm:pt-0 lg:px-8 sm:pb-2">
          {/* LEFT */}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="shrink-0 text-lg font-black leading-none text-[#0F172A] sm:text-2xl">
                Workers
              </h1>

              {selectedCategory !== "All" && (
                <>
                  <span className="shrink-0 text-sm text-[#CBD5E1]">/</span>

                  <span className="min-w-0 max-w-32.5 truncate rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold leading-none text-[#FF5C39] sm:max-w-[180px] sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm">
                    {selectedCategory}
                  </span>
                </>
              )}
            </div>

            <p className="mt-1.5 truncate text-[10px] leading-tight text-[#64748B] sm:text-sm">
              {selectedCategory === "All"
                ? "Manage all Workkerz workers and their profiles."
                : `Manage ${selectedCategory} workers and their profiles.`}
            </p>
          </div>

          {/* ADD WORKER */}
          <button
            type="button"
            onClick={() => {
              setShowOnboardForm(true);
              onFormOpenChange?.(true);
            }}
            className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C39] px-3 text-[11px] font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-[#e54e2e] sm:h-11 sm:gap-2 sm:rounded-xl sm:px-5 sm:text-sm"
          >
            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Add Worker</span>
          </button>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="p-2.5 pt-28 sm:p-5 sm:pt-20 lg:p-8 lg:pt-25">
        {/* ERROR */}

        {error && (
          <div className="mb-3 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="text-xs text-red-600 sm:text-sm">{error}</p>

            <button
              type="button"
              onClick={() => loadWorkers(true)}
              className="self-start text-xs font-bold text-red-700 hover:underline sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-4 lg:grid-cols-4 lg:gap-5">
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

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:rounded-2xl">
          {/* TOOLBAR */}

          <div className="border-b border-gray-100 bg-white">
            <div className="flex flex-col gap-2.5 p-2.5 sm:gap-3 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              {/* SEARCH */}

              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search worker, phone, specialty..."
                  className="h-10 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-9 pr-10 text-xs text-[#0F172A] outline-none transition focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:h-11 sm:pl-10 sm:text-sm"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#94A3B8] hover:bg-gray-100"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* ACTIONS */}

              <div className="flex w-full items-center gap-2 lg:w-auto">
                <button
                  type="button"
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] sm:h-11 sm:flex-none sm:px-4 sm:text-sm"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>

                <button
                  type="button"
                  onClick={() => loadWorkers(true)}
                  disabled={refreshing}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-[#F8FAFC] disabled:opacity-50 sm:h-11 sm:w-11"
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

            <div className="relative overflow-hidden">
              <div className="overflow-x-auto px-2.5 pb-2.5 scrollbar-none sm:px-5 sm:pb-4">
                <div className="flex w-max min-w-full items-center gap-1.5 sm:gap-2">
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
                        className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold transition sm:h-10 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm ${
                          active
                            ? "bg-[#FF5C39] text-white shadow-sm"
                            : "border border-gray-200 bg-white text-[#64748B] hover:border-orange-200 hover:bg-orange-50 hover:text-[#FF5C39]"
                        }`}
                      >
                        <span>{category}</span>

                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-black sm:rounded-lg sm:px-2 sm:text-[11px] ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-[#F1F5F9] text-[#64748B]"
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
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-4">
              <Loader2 className="h-7 w-7 animate-spin text-[#FF5C39]" />

              <p className="mt-3 text-sm text-[#64748B]">Loading workers...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
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
                  className="mt-4 rounded-xl bg-[#FF5C39] px-4 py-2 text-xs font-bold text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden overflow-x-auto lg:block">
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
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <WorkerAvatar worker={worker} size="md" />

                              <div className="min-w-0">
                                <p className="max-w-[190px] truncate text-sm font-bold text-[#0F172A]">
                                  {getWorkerName(worker)}
                                </p>

                                <p className="max-w-[190px] truncate text-xs text-[#64748B]">
                                  {getSpecialty(worker)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-[#334155]">
                            {getPhone(worker)}
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-[#334155]">
                              {getCategory(worker)}
                            </p>

                            {worker.subcategory && (
                              <p className="mt-1 text-xs text-[#94A3B8]">
                                {worker.subcategory}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <p className="max-w-[180px] truncate text-sm text-[#334155]">
                              {getLocation(worker)}
                            </p>

                            {worker.labourChauk && (
                              <p className="mt-1 max-w-[180px] truncate text-xs text-[#94A3B8]">
                                Chauk: {worker.labourChauk}
                              </p>
                            )}
                          </td>

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

                          <td className="px-6 py-4">
                            <WorkerStatus active={active} />
                          </td>

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

              {/* =================================================
                  MOBILE + TABLET
              ================================================= */}

              <div className="divide-y divide-gray-100 lg:hidden">
                {filteredWorkers.map((worker) => {
                  const active = isWorkerActive(worker);

                  return (
                    <div key={worker.id} className="p-2.5 sm:p-4">
                      <div className="rounded-xl border border-gray-100 bg-white p-2.5 transition hover:border-gray-200 hover:shadow-sm sm:rounded-2xl sm:p-4">
                        {/* TOP */}

                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <WorkerAvatar worker={worker} size="lg" />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-bold text-[#0F172A] sm:text-base">
                                  {getWorkerName(worker)}
                                </h3>

                                <p className="mt-0.5 truncate text-[11px] text-[#64748B] sm:text-xs">
                                  {getSpecialty(worker)}
                                </p>
                              </div>

                              <WorkerStatus active={active} compact />
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-1">
                              <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-[#FF5C39] sm:px-2 sm:py-1 sm:text-[11px]">
                                {getCategory(worker)}
                              </span>

                              {worker.subcategory && (
                                <span className="max-w-[130px] truncate rounded-md bg-gray-50 px-1.5 py-0.5 text-[9px] font-medium text-[#64748B] sm:max-w-[150px] sm:px-2 sm:py-1 sm:text-[11px]">
                                  {worker.subcategory}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* INFO */}

                        <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-gray-100 pt-2.5 sm:mt-3 sm:grid-cols-4 sm:gap-2 sm:pt-3">
                          <MobileInfo
                            icon={Phone}
                            label="Phone"
                            value={getPhone(worker)}
                          />

                          <MobileInfo
                            icon={MapPin}
                            label="Location"
                            value={getLocation(worker)}
                          />

                          <MobileInfo
                            icon={Star}
                            label="Rating"
                            value={`${getRating(
                              worker,
                            )} (${worker.reviewCount ?? 0})`}
                            rating
                          />

                          <MobileInfo
                            icon={BriefcaseBusiness}
                            label="Jobs"
                            value={String(worker.completedJobs ?? 0)}
                          />
                        </div>

                        {/* BOTTOM */}

                        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 sm:mt-3 sm:pt-3">
                          <div className="min-w-0">
                            <p className="truncate text-[10px] text-[#94A3B8] sm:text-xs">
                              {worker.labourChauk
                                ? `Chauk: ${worker.labourChauk}`
                                : `Worker ID: ${worker.workerCode || "—"}`}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedWorker(worker)}
                              className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 px-2 text-[11px] font-semibold text-[#64748B] transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#FF5C39] sm:h-10 sm:gap-1.5 sm:px-3 sm:text-xs"
                            >
                              <Eye className="h-3.5 w-3.5" />

                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActionError("");
                                setActionWorker(worker);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-[#64748B] transition hover:border-gray-300 hover:bg-gray-50 sm:h-10 sm:w-10"
                              title="More actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* FOOTER */}

          {!loading && filteredWorkers.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-gray-100 bg-[#FAFAFA] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3">
              <p className="text-[10px] font-medium text-[#64748B] sm:text-xs">
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
                <p className="truncate text-[10px] text-[#94A3B8] sm:text-xs">
                  Search:{" "}
                  <span className="font-semibold text-[#64748B]">
                    "{search}"
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* =====================================================
          ACTION MENU
      ===================================================== */}

      {actionWorker && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close actions"
            onClick={() => setActionWorker(null)}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
          />

          {/* DESKTOP */}

          <div className="absolute right-4 top-20 hidden w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl sm:block lg:right-8">
            <ActionMenuContent
              worker={actionWorker}
              isSuperAdmin={isSuperAdmin}
              actionLoading={actionLoading}
              actionError={actionError}
              onEdit={() => {
                setEditWorker(actionWorker);
                setActionWorker(null);
                setActionError("");
              }}
              onToggle={() => toggleWorkerStatus(actionWorker)}
              onDelete={() => deleteWorker(actionWorker)}
            />
          </div>

          {/* MOBILE BOTTOM SHEET */}

          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-gray-100 bg-white p-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-2xl sm:hidden">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />

            <ActionMenuContent
              worker={actionWorker}
              isSuperAdmin={isSuperAdmin}
              actionLoading={actionLoading}
              actionError={actionError}
              mobile
              onEdit={() => {
                setEditWorker(actionWorker);
                setActionWorker(null);
                setActionError("");
              }}
              onToggle={() => toggleWorkerStatus(actionWorker)}
              onDelete={() => deleteWorker(actionWorker)}
              onCancel={() => setActionWorker(null)}
            />
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
   WORKER AVATAR
===================================================== */

function WorkerAvatar({
  worker,
  size = "md",
}: {
  worker: Worker;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-11 w-11 sm:h-14 sm:w-14" : "h-11 w-11";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-orange-50 ${sizeClass}`}
    >
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
  );
}

/* =====================================================
   WORKER STATUS
===================================================== */

function WorkerStatus({
  active,
  compact = false,
}: {
  active: boolean;
  compact?: boolean;
}) {
  return active ? (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 font-bold text-emerald-700 ${
        compact ? "px-2 py-1 text-[9px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Available
    </span>
  ) : (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 font-bold text-gray-600 ${
        compact ? "px-2 py-1 text-[9px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Unavailable
    </span>
  );
}

/* =====================================================
   MOBILE INFO
===================================================== */

function MobileInfo({
  icon: Icon,
  label,
  value,
  rating = false,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  rating?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-[#F8FAFC] px-1.5 py-1.5 sm:px-2 sm:py-2">
      <div className="flex items-center gap-1">
        <Icon
          className={`h-3 w-3 shrink-0 ${
            rating ? "text-amber-500" : "text-[#94A3B8]"
          }`}
        />

        <span className="truncate text-[8px] font-semibold uppercase tracking-wide text-[#94A3B8] sm:text-[9px]">
          {label}
        </span>
      </div>

      <p className="mt-0.5 truncate text-[10px] font-bold text-[#334155] sm:mt-1 sm:text-[11px]">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   ACTION MENU
===================================================== */

function ActionMenuContent({
  worker,
  isSuperAdmin,
  actionLoading,
  actionError,
  mobile = false,
  onEdit,
  onToggle,
  onDelete,
  onCancel,
}: {
  worker: Worker;
  isSuperAdmin: boolean;
  actionLoading: boolean;
  actionError: string;
  mobile?: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onCancel?: () => void;
}) {
  const active = worker.available === true;

  return (
    <>
      {/* HEADER */}

      <div
        className={`border-b border-gray-100 px-3 ${
          mobile ? "pb-3 pt-1" : "py-3"
        }`}
      >
        <p className="truncate text-sm font-bold text-[#0F172A]">
          {worker.name || "Unnamed Worker"}
        </p>

        <p className="mt-1 text-xs text-[#64748B]">Worker actions</p>
      </div>

      {/* EDIT */}

      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#F8FAFC]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          <Pencil className="h-4 w-4 text-[#64748B]" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Edit Worker</p>

          <p className="text-xs text-[#94A3B8]">Update worker information</p>
        </div>
      </button>

      {/* STATUS */}

      <button
        type="button"
        disabled={actionLoading}
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#F8FAFC] disabled:opacity-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          <Power className="h-4 w-4 text-[#64748B]" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#0F172A]">
            {active ? "Make Unavailable" : "Make Available"}
          </p>

          <p className="text-xs text-[#94A3B8]">
            {active ? "Stop new bookings" : "Allow new bookings"}
          </p>
        </div>
      </button>

      {/* DELETE */}

      {isSuperAdmin && (
        <>
          <div className="my-1 border-t border-gray-100" />

          <button
            type="button"
            disabled={actionLoading}
            onClick={onDelete}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50 disabled:opacity-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>

            <div>
              <p className="text-sm font-semibold text-red-600">
                Delete Worker
              </p>

              <p className="text-xs text-red-400">Permanently remove worker</p>
            </div>
          </button>
        </>
      )}

      {/* ERROR */}

      {actionError && (
        <div className="mx-2 mb-2 mt-1 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
          <p className="text-xs text-red-600">{actionError}</p>
        </div>
      )}

      {/* LOADING */}

      {actionLoading && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#64748B]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating...
        </div>
      )}

      {/* CANCEL */}

      {mobile && (
        <button
          type="button"
          disabled={actionLoading}
          onClick={onCancel}
          className="mt-1 w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-[#475569] disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </>
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
    <div className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-medium text-[#64748B] sm:text-sm">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-black text-[#0F172A] sm:mt-2 sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 sm:h-11 sm:w-11 sm:rounded-xl">
          <Icon className="h-3.5 w-3.5 text-[#FF5C39] sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
}
