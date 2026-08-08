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

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import WorkerDrawer from "./WorkerDrawer";
import EditWorkerModal from "./EditWorkerModal";
import WorkerOnboardForm from "./WorkerOnboardForm";

import { supabase } from "@/lib/supabase";

import type {
  Worker,
  PricingType,
} from "@/app/data/workers";

/* =====================================================
   API WORKER TYPE
===================================================== */

type ApiWorker = {
  id: string;

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

  /*
   * SUPPORT BOTH
   *
   * Database/API:
   * labour_chauk
   *
   * Frontend:
   * labourChauk
   */
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

function numberValue(
  value: number | string | null | undefined,
): number {
  return Number(value ?? 0) || 0;
}

function pricingValue(
  value:
    | string
    | null
    | undefined,
): PricingType {
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
  /*
   * IMPORTANT
   *
   * Labour Chauk can arrive as either:
   *
   * row.labour_chauk
   * row.labourChauk
   *
   * Always convert it to:
   *
   * worker.labourChauk
   */
  const labourChauk =
    row.labourChauk ??
    row.labour_chauk ??
    "";

  return {
    id: row.id,

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
      numberValue(row.rating),

    reviewCount:
      Number(
        row.reviewCount ??
          row.review_count ??
          0,
      ),

    location:
      row.location ?? "",

    /*
     * THIS IS THE IMPORTANT FIX
     */
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
  // =====================================================
  // STATE
  // =====================================================

  const [workers, setWorkers] =
    useState<Worker[]>([]);

  const [selectedWorker, setSelectedWorker] =
    useState<Worker | null>(null);

  const [editWorker, setEditWorker] =
    useState<Worker | null>(null);

  const [actionWorker, setActionWorker] =
    useState<Worker | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [showOnboardForm, setShowOnboardForm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [isSuperAdmin, setIsSuperAdmin] =
    useState(false);

  // =====================================================
  // ADMIN ROLE
  // =====================================================

  const loadAdminRole = async () => {
    try {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response =
        await fetch(
          "/api/admin/me",
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache: "no-store",
          },
        );

      const data =
        await response.json();

      if (response.ok) {
        setIsSuperAdmin(
          data.isSuperAdmin === true,
        );
      }
    } catch (error) {
      console.error(
        "Admin role error:",
        error,
      );
    }
  };

  // =====================================================
  // LOAD WORKERS
  // =====================================================

  const loadWorkers = async (
    showRefresh = false,
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(
          "Your admin session has expired.",
        );
        return;
      }

      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim(),
        );
      }

      params.set(
        "limit",
        "100",
      );

      const response =
        await fetch(
          `/api/admin/workers?${params.toString()}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache: "no-store",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load workers.",
        );
      }

      /*
       * =================================================
       * IMPORTANT FIX
       * =================================================
       *
       * API can return:
       *
       * labour_chauk
       *
       * or:
       *
       * labourChauk
       *
       * normalizeWorker() converts both to:
       *
       * labourChauk
       */

      const apiWorkers: ApiWorker[] =
        Array.isArray(data.workers)
          ? data.workers
          : [];

      const normalizedWorkers =
        apiWorkers.map(
          normalizeWorker,
        );

      /*
       * Debug
       */
      console.log(
        "ADMIN WORKERS:",
        normalizedWorkers,
      );

      console.log(
        "LABOUR CHAUK VALUES:",
        normalizedWorkers.map(
          (worker) => ({
            id: worker.id,
            name: worker.name,
            labourChauk:
              worker.labourChauk,
          }),
        ),
      );

      setWorkers(
        normalizedWorkers,
      );
    } catch (error) {
      console.error(
        "Load workers error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load workers.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadAdminRole();
    loadWorkers();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadWorkers();
      }, 400);

    return () =>
      clearTimeout(timer);
  }, [search]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getWorkerName = (
    worker: Worker,
  ) => {
    return (
      worker.name ||
      "Unnamed Worker"
    );
  };

  const getPhone = (
    worker: Worker,
  ) => {
    return (
      worker.phone ||
      "—"
    );
  };

  const getCategory = (
    worker: Worker,
  ) => {
    return (
      worker.category ||
      "—"
    );
  };

  const getSpecialty = (
    worker: Worker,
  ) => {
    return (
      worker.specialty ||
      "—"
    );
  };

  const getLocation = (
    worker: Worker,
  ) => {
    return (
      worker.location ||
      "—"
    );
  };

  const getRating = (
    worker: Worker,
  ) => {
    return Number(
      worker.rating || 0,
    ).toFixed(1);
  };

  const isWorkerActive = (
    worker: Worker,
  ) => {
    return worker.available === true;
  };

  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {
    const total =
      workers.length;

    const active =
      workers.filter(
        (worker) =>
          worker.available === true,
      ).length;

    const inactive =
      total - active;

    const today =
      new Date();

    const newWorkers =
      workers.filter(
        (worker) => {
          if (!worker.createdAt) {
            return false;
          }

          const created =
            new Date(
              worker.createdAt,
            );

          return (
            created.getFullYear() ===
              today.getFullYear() &&
            created.getMonth() ===
              today.getMonth() &&
            created.getDate() ===
              today.getDate()
          );
        },
      ).length;

    return {
      total,
      active,
      inactive,
      newWorkers,
    };
  }, [workers]);

  // =====================================================
  // DELETE WORKER
  // =====================================================

  const deleteWorker = async (
    worker: Worker,
  ) => {
    const confirmed =
      window.confirm(
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
      } =
        await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired.",
        );
      }

      const response =
        await fetch(
          `/api/admin/workers/${worker.id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete worker.",
        );
      }

      setActionWorker(null);

      await loadWorkers(true);
    } catch (error) {
      console.error(
        "Delete worker error:",
        error,
      );

      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to delete worker.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // TOGGLE AVAILABILITY
  // =====================================================

  const toggleWorkerStatus = async (
    worker: Worker,
  ) => {
    try {
      setActionLoading(true);
      setActionError("");

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired.",
        );
      }

      const nextAvailable =
        !worker.available;

      const response =
        await fetch(
          `/api/admin/workers/${worker.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              available:
                nextAvailable,
            }),
          },
        );

      const responseText =
        await response.text();

      let data: {
        error?: string;
        message?: string;
        worker?: ApiWorker;
      } = {};

      try {
        data = responseText
          ? JSON.parse(
              responseText,
            )
          : {};
      } catch {
        console.error(
          "API returned non-JSON response:",
          responseText,
        );

        throw new Error(
          `API error (${response.status}). The server returned an invalid response.`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to update worker availability.",
        );
      }

      setActionWorker(null);

      await loadWorkers(true);
    } catch (error) {
      console.error(
        "Worker availability error:",
        error,
      );

      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to update worker.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // ONBOARD FORM
  // =====================================================

  if (showOnboardForm) {
    return (
      <WorkerOnboardForm
        onBack={() =>
          setShowOnboardForm(false)
        }
        onCreated={() => {
          setShowOnboardForm(false);

          loadWorkers(true);
        }}
      />
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="flex h-20 items-center justify-between border-b border-gray-100 bg-white px-8">

        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">
            Workers
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage Workkerz workers and their profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowOnboardForm(true)
          }
          className="flex h-11 items-center gap-2 rounded-xl bg-[#FF5C39] px-5 text-sm font-bold text-white hover:bg-[#e54e2e]"
        >
          <UserPlus className="h-4 w-4" />

          Add Worker
        </button>

      </header>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="p-8">

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadWorkers(true)
              }
              className="text-xs font-bold text-red-700 hover:underline"
            >
              Try again
            </button>

          </div>
        )}

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="mb-6 grid grid-cols-4 gap-5">

          <WorkerStat
            label="Total Workers"
            value={stats.total}
            icon={Users}
          />

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

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">

          {/* TOOLBAR */}

          <div className="flex items-center justify-between border-b border-gray-100 p-5">

            <div className="relative w-80">

              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search workers..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
              />

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <SlidersHorizontal className="h-4 w-4" />

                Filters
              </button>

              <button
                type="button"
                onClick={() =>
                  loadWorkers(true)
                }
                disabled={refreshing}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 text-[#64748B] ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading ? (
            <div className="flex h-80 flex-col items-center justify-center">

              <Loader2 className="h-7 w-7 animate-spin text-[#FF5C39]" />

              <p className="mt-3 text-sm text-[#64748B]">
                Loading workers...
              </p>

            </div>
          ) : workers.length === 0 ? (

            /* ================================================= */
            /* EMPTY */
            /* ================================================= */

            <div className="flex h-80 flex-col items-center justify-center text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">

                <Users className="h-7 w-7 text-[#FF5C39]" />

              </div>

              <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
                No workers found
              </h3>

              <p className="mt-1 text-xs text-[#94A3B8]">
                Try changing your search or add a worker.
              </p>

            </div>

          ) : (

            /* ================================================= */
            /* TABLE */
            /* ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full">

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

                  {workers.map(
                    (worker) => {
                      const active =
                        isWorkerActive(
                          worker,
                        );

                      return (
                        <tr
                          key={worker.id}
                          className="transition hover:bg-[#FAFAFA]"
                        >

                          {/* WORKER */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-orange-50">

                                {worker.photo ? (
                                  <img
                                    src={
                                      worker.photo
                                    }
                                    alt={
                                      worker.name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Users className="h-5 w-5 text-[#FF5C39]" />
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-[#0F172A]">
                                  {
                                    worker.name
                                  }
                                </p>

                                <p className="truncate text-xs text-[#64748B]">
                                  {
                                    getSpecialty(
                                      worker,
                                    )
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td className="px-6 py-4">

                            <p className="text-sm text-[#334155]">
                              {
                                getPhone(
                                  worker,
                                )
                              }
                            </p>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-6 py-4">

                            <div>

                              <p className="text-sm font-semibold text-[#334155]">
                                {
                                  getCategory(
                                    worker,
                                  )
                                }
                              </p>

                              {worker.subcategory && (
                                <p className="mt-1 text-xs text-[#94A3B8]">
                                  {
                                    worker.subcategory
                                  }
                                </p>
                              )}

                            </div>

                          </td>

                          {/* LOCATION */}

                          <td className="px-6 py-4">

                            <div>

                              <p className="text-sm text-[#334155]">
                                {
                                  getLocation(
                                    worker,
                                  )
                                }
                              </p>

                              {worker.labourChauk && (
                                <p className="mt-1 text-xs text-[#94A3B8]">
                                  {
                                    worker.labourChauk
                                  }
                                </p>
                              )}

                            </div>

                          </td>

                          {/* RATING */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-1.5">

                              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />

                              <span className="text-sm font-semibold text-[#334155]">
                                {
                                  getRating(
                                    worker,
                                  )
                                }
                              </span>

                              <span className="text-xs text-[#94A3B8]">
                                (
                                {
                                  worker.reviewCount
                                }
                                )
                              </span>

                            </div>

                          </td>

                          {/* STATUS */}

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

                          {/* ACTION */}

                          <td className="px-6 py-4">

                            <div className="flex items-center justify-end gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedWorker(
                                    worker,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                                title="View worker"
                              >
                                <Eye className="h-4 w-4 text-[#64748B]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActionError(
                                    "",
                                  );

                                  setActionWorker(
                                    worker,
                                  );
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
                    },
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* ACTION MENU */}
      {/* ================================================= */}

      {actionWorker && (
        <div className="fixed inset-0 z-40">

          <button
            type="button"
            aria-label="Close actions"
            onClick={() =>
              setActionWorker(null)
            }
            className="absolute inset-0 bg-black/20"
          />

          <div className="absolute right-8 top-24 w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">

            <div className="border-b border-gray-100 px-3 py-3">

              <p className="text-sm font-bold text-[#0F172A]">
                {
                  getWorkerName(
                    actionWorker,
                  )
                }
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Worker actions
              </p>

            </div>

            {/* EDIT */}

            <button
              type="button"
              onClick={() => {
                console.log(
                  "OPENING EDIT WORKER:",
                  actionWorker,
                );

                console.log(
                  "EDIT LABOUR CHAUK:",
                  actionWorker.labourChauk,
                );

                setEditWorker(
                  actionWorker,
                );

                setActionWorker(
                  null,
                );

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

            {/* AVAILABILITY */}

            <button
              type="button"
              disabled={actionLoading}
              onClick={() =>
                toggleWorkerStatus(
                  actionWorker,
                )
              }
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#F8FAFC] disabled:opacity-50"
            >

              <Power className="h-4 w-4 text-[#64748B]" />

              <div>

                <p className="text-sm font-semibold text-[#0F172A]">
                  {isWorkerActive(
                    actionWorker,
                  )
                    ? "Make Unavailable"
                    : "Make Available"}
                </p>

                <p className="text-xs text-[#94A3B8]">
                  {isWorkerActive(
                    actionWorker,
                  )
                    ? "Stop new bookings"
                    : "Allow new bookings"}
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
                  onClick={() =>
                    deleteWorker(
                      actionWorker,
                    )
                  }
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

            {/* ERROR */}

            {actionError && (
              <div className="mx-2 mb-2 mt-1 rounded-lg border border-red-100 bg-red-50 px-3 py-2">

                <p className="text-xs text-red-600">
                  {actionError}
                </p>

              </div>
            )}

            {/* LOADING */}

            {actionLoading && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#64748B]">

                <Loader2 className="h-3.5 w-3.5 animate-spin" />

                Updating...

              </div>
            )}

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* WORKER DRAWER */}
      {/* ================================================= */}

      <WorkerDrawer
        worker={selectedWorker}
        onClose={() =>
          setSelectedWorker(null)
        }
      />

      {/* ================================================= */}
      {/* EDIT WORKER */}
      {/* ================================================= */}

      <EditWorkerModal
        worker={editWorker}
        onClose={() =>
          setEditWorker(null)
        }
        onUpdated={(updatedWorker) => {
          /*
           * IMPORTANT
           *
           * updateWorker() returns the mapped
           * Worker object where:
           *
           * labour_chauk -> labourChauk
           */

          console.log(
            "WORKER UPDATED:",
            updatedWorker,
          );

          console.log(
            "UPDATED LABOUR CHAUK:",
            updatedWorker.labourChauk,
          );

          setWorkers(
            (current) =>
              current.map(
                (worker) =>
                  worker.id ===
                  updatedWorker.id
                    ? updatedWorker
                    : worker,
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
    <div className="rounded-2xl border border-gray-100 bg-white p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-[#64748B]">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-[#0F172A]">
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">

          <Icon className="h-5 w-5 text-[#FF5C39]" />

        </div>

      </div>

    </div>
  );
}