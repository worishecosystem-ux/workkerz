"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Phone,
  User,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

export type WorkerRequest = {
  id: string;

  workers_required: number;

  location: string;

  category: string;

  work_date: string;

  start_time?: string | null;

  duration?: string | null;

  budget?: number | null;

  requirement?: string | null;

  status: string;

  source?: string | null;

  created_at: string;

  full_address?: string | null;

  locality?: string | null;

  district?: string | null;

  state?: string | null;

  pincode?: string | null;

  requester_type?: string | null;

  requester_name?: string | null;

  requester_mobile?: string | null;

  requester_email?: string | null;

  company_name?: string | null;

  gstin?: string | null;

  requester_address?: string | null;

  requester_user_id?: string | null;

  project_name?: string | null;

  project_type?: string | null;

  total_workers?: number | null;

  requirements?: Array<{
    category: string;
    workers_required: number;
  }> | null;
};

type Props = {
  onRequestCountChange?: (
    count: number,
  ) => void;

  realtimeRequest?: WorkerRequest | null;
};

/* =========================================================
   STATUS STYLE
========================================================= */

const statusStyle: Record<
  string,
  string
> = {
  pending:
    "bg-amber-50 text-amber-700",

  accepted:
    "bg-emerald-50 text-emerald-700",

  rejected:
    "bg-red-50 text-red-700",

  completed:
    "bg-blue-50 text-blue-700",

  cancelled:
    "bg-gray-100 text-gray-600",
};

/* =========================================================
   TIMELINE
========================================================= */

const timelineSteps = [
  {
    key: "pending",
    label: "Request Submitted",
    short: "Submitted",
  },
  {
    key: "review",
    label: "Under Review",
    short: "Review",
  },
  {
    key: "accepted",
    label: "Request Accepted",
    short: "Accepted",
  },
  {
    key: "completed",
    label: "Work Completed",
    short: "Completed",
  },
];

function getTimelineState(
  status: string,
) {
  const normalized =
    status.toLowerCase();

  if (normalized === "rejected") {
    return {
      currentIndex: 2,
      rejected: true,
    };
  }

  if (normalized === "cancelled") {
    return {
      currentIndex: 1,
      rejected: false,
    };
  }

  if (normalized === "completed") {
    return {
      currentIndex: 3,
      rejected: false,
    };
  }

  if (normalized === "accepted") {
    return {
      currentIndex: 2,
      rejected: false,
    };
  }

  return {
    currentIndex: 1,
    rejected: false,
  };
}

/* =========================================================
   DESKTOP / TABLET TIMELINE
========================================================= */

function RequestTimeline({
  status,
}: {
  status: string;
}) {
  const {
    currentIndex,
    rejected,
  } = getTimelineState(status);

  return (
    <div className="w-full">
      {/* DESKTOP / TABLET */}

      <div className="hidden sm:block">
        <div className="relative px-5 pt-2">
          {/* LINE */}

          <div className="absolute left-[12.5%] right-[12.5%] top-[18px] h-0.5 bg-gray-200" />

          <div
            className={[
              "absolute left-[12.5%] top-[18px] h-0.5 transition-all duration-500",
              rejected
                ? "w-[37.5%] bg-red-400"
                : currentIndex === 0
                  ? "w-0"
                  : currentIndex === 1
                    ? "w-[12.5%] bg-emerald-500"
                    : currentIndex === 2
                      ? "w-[37.5%] bg-emerald-500"
                      : "w-[75%] bg-emerald-500",
            ].join(" ")}
          />

          <div className="relative grid grid-cols-4">
            {timelineSteps.map(
              (step, index) => {
                const isDone =
                  index <
                  currentIndex;

                const isCurrent =
                  index ===
                  currentIndex;

                const isRejected =
                  rejected &&
                  index === 2;

                return (
                  <div
                    key={step.key}
                    className="flex min-w-0 flex-col items-center"
                  >
                    <div
                      className={[
                        "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white transition-all duration-300",
                        isRejected
                          ? "border-red-500 bg-red-50 text-red-600"
                          : isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : isCurrent
                              ? "border-emerald-500 bg-white text-emerald-600 ring-4 ring-emerald-50"
                              : "border-gray-200 text-gray-300",
                      ].join(" ")}
                    >
                      {isRejected ? (
                        <X className="h-4 w-4" />
                      ) : isDone ? (
                        <Check className="h-4 w-4" />
                      ) : index === 0 ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : index === 1 ? (
                        <Clock3 className="h-4 w-4" />
                      ) : index === 2 ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>

                    <p
                      className={[
                        "mt-2 text-center text-[10px] font-bold",
                        isRejected
                          ? "text-red-600"
                          : isDone ||
                              isCurrent
                            ? "text-gray-900"
                            : "text-gray-400",
                      ].join(" ")}
                    >
                      {isRejected
                        ? "Request Rejected"
                        : step.label}
                    </p>

                    <p
                      className={[
                        "mt-0.5 text-[9px]",
                        isRejected
                          ? "text-red-400"
                          : "text-gray-400",
                      ].join(" ")}
                    >
                      {isRejected
                        ? "Not accepted"
                        : index <
                            currentIndex
                          ? "Completed"
                          : isCurrent
                            ? "Current"
                            : "Waiting"}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* MOBILE */}

      <div className="sm:hidden">
        <div className="relative">
          <div className="absolute bottom-5 left-[15px] top-5 w-0.5 bg-gray-200" />

          <div
            className={[
              "absolute left-[15px] top-5 w-0.5 transition-all duration-500",
              rejected
                ? "h-[42%] bg-red-400"
                : currentIndex === 0
                  ? "h-0"
                  : currentIndex === 1
                    ? "h-[25%] bg-emerald-500"
                    : currentIndex === 2
                      ? "h-[58%] bg-emerald-500"
                      : "bottom-5 h-auto bg-emerald-500",
            ].join(" ")}
          />

          <div className="relative space-y-5">
            {timelineSteps.map(
              (step, index) => {
                const isDone =
                  index <
                  currentIndex;

                const isCurrent =
                  index ===
                  currentIndex;

                const isRejected =
                  rejected &&
                  index === 2;

                return (
                  <div
                    key={step.key}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={[
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                        isRejected
                          ? "border-red-500 bg-red-50 text-red-600"
                          : isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : isCurrent
                              ? "border-emerald-500 text-emerald-600 ring-4 ring-emerald-50"
                              : "border-gray-200 text-gray-300",
                      ].join(" ")}
                    >
                      {isRejected ? (
                        <X className="h-3.5 w-3.5" />
                      ) : isDone ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : index === 0 ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : index === 1 ? (
                        <Clock3 className="h-3.5 w-3.5" />
                      ) : index === 2 ? (
                        <Users className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <p
                        className={[
                          "text-xs font-black",
                          isRejected
                            ? "text-red-600"
                            : isDone ||
                                isCurrent
                              ? "text-gray-900"
                              : "text-gray-400",
                        ].join(" ")}
                      >
                        {isRejected
                          ? "Request Rejected"
                          : step.label}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {isRejected
                          ? "This request was rejected"
                          : index <
                              currentIndex
                            ? "Completed"
                            : isCurrent
                              ? "Currently here"
                              : "Waiting for next step"}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WORKER GROUPS
========================================================= */

function WorkerGroups({
  request,
}: {
  request: WorkerRequest;
}) {
  const groups =
    Array.isArray(
      request.requirements,
    )
      ? request.requirements
      : [];

  if (groups.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black text-[#0F172A]">
          Worker Groups
        </h3>

        <span className="text-[10px] font-bold text-gray-400">
          {groups.length} groups
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {groups.map(
          (group, index) => (
            <div
              key={`${group.category}-${index}`}
              className="
                flex items-center
                justify-between
                rounded-xl
                border border-gray-100
                bg-gray-50
                px-3 py-2.5
              "
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-gray-900">
                    {group.category}
                  </p>

                  <p className="text-[9px] text-gray-400">
                    Worker group
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-emerald-700 shadow-sm">
                ×{" "}
                {group.workers_required}
              </span>
            </div>
          ),
        )}
      </div>

      <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2">
        <p className="text-[10px] font-bold text-emerald-700">
          Total Workers:{" "}
          {request.workers_required}
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function WorkerRequestsTab({
  onRequestCountChange,
  realtimeRequest,
}: Props) {
  const [requests, setRequests] =
    useState<WorkerRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selected, setSelected] =
    useState<WorkerRequest | null>(
      null,
    );

  const [updating, setUpdating] =
    useState<string | null>(null);

  /* =======================================================
     LOAD REQUESTS
  ======================================================= */

  const loadRequests =
    useCallback(async () => {
      try {
        setLoading(true);

        const {
          data,
          error,
        } = await supabase
          .from("worker_requests")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        const rows =
          (data ?? []) as WorkerRequest[];

        setRequests(rows);
      } catch (error) {
        console.error(
          "[Worker Requests]",
          error,
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /* =======================================================
     REALTIME
  ======================================================= */

  useEffect(() => {
    if (!realtimeRequest) {
      return;
    }

    setRequests((prev) => {
      const exists = prev.some(
        (item) =>
          String(item.id) ===
          String(
            realtimeRequest.id,
          ),
      );

      if (exists) {
        return prev.map((item) =>
          String(item.id) ===
          String(
            realtimeRequest.id,
          )
            ? realtimeRequest
            : item,
        );
      }

      return [
        realtimeRequest,
        ...prev,
      ];
    });
  }, [realtimeRequest]);

  /* =======================================================
     PENDING COUNT
  ======================================================= */

  const pendingCount = useMemo(() => {
    return requests.filter(
      (item) =>
        String(
          item.status ?? "",
        ).toLowerCase() ===
        "pending",
    ).length;
  }, [requests]);

  useEffect(() => {
    onRequestCountChange?.(
      pendingCount,
    );
  }, [
    pendingCount,
    onRequestCountChange,
  ]);

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (
    id: string,
    status:
      | "accepted"
      | "rejected",
  ) => {
    try {
      setUpdating(id);

      const {
        data,
        error,
      } = await supabase
        .from("worker_requests")
        .update({
          status,
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Worker request was not updated.",
        );
      }

      const updated =
        data as WorkerRequest;

      setRequests((prev) =>
        prev.map((item) =>
          String(item.id) ===
          String(id)
            ? updated
            : item,
        ),
      );

      setSelected((prev) =>
        prev &&
        String(prev.id) ===
          String(id)
          ? updated
          : prev,
      );
    } catch (error) {
      console.error(
        "[Worker Request Status]",
        error,
      );
    } finally {
      setUpdating(null);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-7">
        <div className="animate-pulse">
          <div className="h-7 w-48 rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-72 rounded bg-gray-100" />

          <div className="mt-6 space-y-3">
            {[
              1,
              2,
              3,
              4,
            ].map((item) => (
              <div
                key={item}
                className="h-36 rounded-2xl border border-gray-100 bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-5 lg:p-7">
      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-black text-[#0F172A] sm:text-2xl">
              Worker Requests
            </h1>

            {pendingCount > 0 && (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#FF5C39] sm:text-xs">
                {pendingCount} Pending
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
            Manage customer requests
            for workers.
          </p>
        </div>
      </div>

      {/* EMPTY */}

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
            <Users className="h-6 w-6 text-[#FF5C39]" />
          </div>

          <h2 className="mt-4 text-base font-bold text-[#0F172A]">
            No Worker Requests
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            New worker requests
            will appear here
            automatically.
          </p>
        </div>
      ) : (
        /* REQUEST LIST */

        <div className="space-y-3">
          {requests.map(
            (request) => {
              const status =
                String(
                  request.status ??
                    "pending",
                ).toLowerCase();

              return (
                <div
                  key={request.id}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border border-gray-100
                    bg-white
                    shadow-sm
                    transition
                    hover:border-gray-200
                  "
                >
                  {/* REQUEST SUMMARY */}

                  <div className="p-3.5 sm:p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setSelected(
                            request,
                          )
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 sm:h-11 sm:w-11">
                            <Users className="h-5 w-5 text-[#FF5C39]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-bold text-[#0F172A]">
                                {request.project_name ||
                                  request.category ||
                                  "Worker Request"}
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                                  statusStyle[
                                    status
                                  ] ??
                                  "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                              {request.requester_name ||
                                "Customer"}
                            </p>

                            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-[#64748B] sm:mt-3 sm:text-xs">
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />

                                {
                                  request.workers_required
                                }{" "}
                                Worker
                                {request.workers_required !==
                                1
                                  ? "s"
                                  : ""}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />

                                {
                                  request.location
                                }
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />

                                {
                                  request.work_date
                                }
                              </span>

                              {request.start_time && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock3 className="h-3.5 w-3.5" />

                                  {
                                    request.start_time
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelected(
                              request,
                            )
                          }
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-[#475569] hover:bg-gray-50 sm:flex-none"
                        >
                          View
                        </button>

                        {status ===
                          "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={
                                updating ===
                                request.id
                              }
                              onClick={() =>
                                updateStatus(
                                  request.id,
                                  "rejected",
                                )
                              }
                              className="flex-1 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50 sm:flex-none"
                            >
                              Reject
                            </button>

                            <button
                              type="button"
                              disabled={
                                updating ===
                                request.id
                              }
                              onClick={() =>
                                updateStatus(
                                  request.id,
                                  "accepted",
                                )
                              }
                              className="flex min-w-[76px] flex-1 items-center justify-center rounded-xl bg-[#FF5C39] px-3 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 sm:flex-none"
                            >
                              {updating ===
                              request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Accept"
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QUICK TIMELINE */}

                  <div className="border-t border-gray-100 bg-gray-50/60 px-3 py-4 sm:px-5 sm:py-5">
                    <RequestTimeline
                      status={status}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* =====================================================
          DETAIL DRAWER
      ===================================================== */}

      {selected && (
        <>
          <div
            onClick={() =>
              setSelected(null)
            }
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]"
          />

          <div
            className="
              fixed inset-y-0 right-0
              z-[80]
              w-full
              max-w-lg
              overflow-y-auto
              bg-white
              shadow-2xl
            "
          >
            {/* DRAWER HEADER */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <p className="text-base font-black text-[#0F172A] sm:text-lg">
                  Request Details
                </p>

                <p className="truncate text-[10px] text-[#94A3B8] sm:text-xs">
                  {selected.project_name ||
                    selected.category}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* DRAWER CONTENT */}

            <div className="space-y-5 p-4 sm:p-5">
              {/* TIMELINE */}

              <section className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-[#0F172A]">
                    Request Timeline
                  </h3>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                      statusStyle[
                        String(
                          selected.status ??
                            "pending",
                        ).toLowerCase()
                      ] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selected.status ||
                      "pending"}
                  </span>
                </div>

                <RequestTimeline
                  status={
                    String(
                      selected.status ??
                        "pending",
                    ).toLowerCase()
                  }
                />
              </section>

              {/* PROJECT */}

              {(selected.project_name ||
                selected.project_type) && (
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <h3 className="text-sm font-black text-[#0F172A]">
                    Project
                  </h3>

                  <div className="mt-3 grid grid-cols-2 gap-4">
                    {selected.project_name && (
                      <Info
                        icon={
                          <span className="text-[9px] font-black">
                            PR
                          </span>
                        }
                        label="Project"
                        value={
                          selected.project_name
                        }
                      />
                    )}

                    {selected.project_type && (
                      <Info
                        icon={
                          <span className="text-[9px] font-black">
                            TYPE
                          </span>
                        }
                        label="Type"
                        value={
                          selected.project_type
                        }
                      />
                    )}
                  </div>
                </section>
              )}

              {/* WORK DETAILS */}

              <section className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-4">
                <h3 className="text-sm font-black text-[#0F172A]">
                  Work Details
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Info
                    icon={<Users />}
                    label="Workers"
                    value={String(
                      selected.workers_required,
                    )}
                  />

                  <Info
                    icon={<User />}
                    label="Category"
                    value={
                      selected.category
                    }
                  />

                  <Info
                    icon={<CalendarDays />}
                    label="Work Date"
                    value={
                      selected.work_date
                    }
                  />

                  <Info
                    icon={<Clock3 />}
                    label="Start Time"
                    value={
                      selected.start_time ||
                      "Not specified"
                    }
                  />

                  <Info
                    icon={<MapPin />}
                    label="Location"
                    value={
                      selected.location
                    }
                  />

                  <Info
                    icon={
                      <span className="text-sm font-bold">
                        ₹
                      </span>
                    }
                    label="Budget"
                    value={
                      selected.budget !=
                      null
                        ? `₹${selected.budget}`
                        : "Not specified"
                    }
                  />
                </div>

                {selected.duration && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <Info
                      icon={<Clock3 />}
                      label="Duration"
                      value={
                        selected.duration
                      }
                    />
                  </div>
                )}
              </section>

              {/* WORKER GROUPS */}

              <WorkerGroups
                request={selected}
              />

              {/* REQUIREMENT */}

              {selected.requirement && (
                <section>
                  <h3 className="text-sm font-black text-[#0F172A]">
                    Requirement
                  </h3>

                  <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm leading-6 text-[#475569]">
                    {
                      selected.requirement
                    }
                  </p>
                </section>
              )}

              {/* REQUESTER */}

              <section>
                <h3 className="text-sm font-black text-[#0F172A]">
                  Requester
                </h3>

                <div className="mt-3 space-y-3 rounded-2xl border border-gray-100 p-4">
                  <Info
                    icon={<User />}
                    label="Name"
                    value={
                      selected.requester_name ||
                      "—"
                    }
                  />

                  <Info
                    icon={<Phone />}
                    label="Mobile"
                    value={
                      selected.requester_mobile ||
                      "—"
                    }
                  />

                  <Info
                    icon={
                      <span className="text-xs">
                        @
                      </span>
                    }
                    label="Email"
                    value={
                      selected.requester_email ||
                      "—"
                    }
                  />

                  {selected.requester_type && (
                    <Info
                      icon={
                        <span className="text-[9px] font-bold">
                          TYPE
                        </span>
                      }
                      label="Requester Type"
                      value={
                        selected.requester_type
                      }
                    />
                  )}

                  {selected.company_name && (
                    <Info
                      icon={
                        <span className="text-xs">
                          CO
                        </span>
                      }
                      label="Company"
                      value={
                        selected.company_name
                      }
                    />
                  )}

                  {selected.gstin && (
                    <Info
                      icon={
                        <span className="text-xs">
                          GST
                        </span>
                      }
                      label="GSTIN"
                      value={
                        selected.gstin
                      }
                    />
                  )}
                </div>
              </section>

              {/* ADDRESS */}

              <section>
                <h3 className="text-sm font-black text-[#0F172A]">
                  Address
                </h3>

                <div className="mt-3 rounded-2xl border border-gray-100 p-4 text-sm leading-6 text-[#475569]">
                  {selected.full_address ||
                    selected.requester_address ||
                    [
                      selected.locality,
                      selected.district,
                      selected.state,
                      selected.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                    "Address not available"}
                </div>
              </section>

              {/* SOURCE / CREATED */}

              <section className="grid grid-cols-2 gap-3">
                <Info
                  icon={
                    <span className="text-[9px] font-bold">
                      SRC
                    </span>
                  }
                  label="Source"
                  value={
                    selected.source ||
                    "—"
                  }
                />

                <Info
                  icon={<CalendarDays />}
                  label="Created"
                  value={
                    selected.created_at
                      ? new Date(
                          selected.created_at,
                        ).toLocaleString(
                          "en-IN",
                        )
                      : "—"
                  }
                />
              </section>

              {/* ACTION */}

              {String(
                selected.status ??
                  "",
              ).toLowerCase() ===
                "pending" && (
                <div className="sticky bottom-0 flex gap-2 border-t border-gray-100 bg-white py-3">
                  <button
                    type="button"
                    disabled={
                      updating ===
                      selected.id
                    }
                    onClick={() =>
                      updateStatus(
                        selected.id,
                        "rejected",
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={
                      updating ===
                      selected.id
                    }
                    onClick={() =>
                      updateStatus(
                        selected.id,
                        "accepted",
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF5C39] py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {updating ===
                    selected.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Accept Request
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   INFO
========================================================= */

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>

        <span className="truncate">
          {label}
        </span>
      </div>

      <p className="mt-1 break-words text-sm font-semibold text-[#0F172A]">
        {value}
      </p>
    </div>
  );
}