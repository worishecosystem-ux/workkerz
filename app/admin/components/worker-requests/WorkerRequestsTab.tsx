"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowRight,
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

export type DeviceType = "mobile" | "tablet" | "desktop";

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
  device: DeviceType;
  onRequestCountChange?: (count: number) => void;
  realtimeRequest?: WorkerRequest | null;
};

type StatusType = "accepted" | "rejected";

/* =========================================================
   COLORS
========================================================= */

const ORANGE = "#FF5C39";
const DARK = "#172033";

/* =========================================================
   STATUS
========================================================= */

const statusStyle: Record<string, string> = {
  pending: "bg-orange-50 text-[#FF5C39] border-orange-100",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
  completed: "bg-blue-50 text-blue-700 border-blue-100",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

function normalizeStatus(status?: string) {
  return String(status || "pending").toLowerCase();
}

/* =========================================================
   TIMELINE
========================================================= */

const timelineSteps = [
  {
    key: "submitted",
    label: "Request Submitted",
    icon: CheckCircle2,
  },
  {
    key: "review",
    label: "Under Review",
    icon: Clock3,
  },
  {
    key: "accepted",
    label: "Request Accepted",
    icon: Users,
  },
  {
    key: "completed",
    label: "Work Completed",
    icon: CheckCircle2,
  },
];

function getTimelineState(status: string) {
  const normalized = normalizeStatus(status);

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
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
  large = false,
}: {
  status: string;
  large?: boolean;
}) {
  const normalized = normalizeStatus(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-bold capitalize ${
        large ? "text-xs" : "text-[10px]"
      } ${
        statusStyle[normalized] ||
        "border-gray-100 bg-gray-50 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          normalized === "pending"
            ? "bg-[#FF5C39]"
            : normalized === "accepted"
              ? "bg-emerald-500"
              : normalized === "rejected"
                ? "bg-red-500"
                : normalized === "completed"
                  ? "bg-blue-500"
                  : "bg-gray-400"
        }`}
      />
      {normalized}
    </span>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function Info({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      <p
        className={`mt-1 break-words text-sm font-bold ${
          highlight ? "text-[#FF5C39]" : "text-[#172033]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   DESKTOP TIMELINE
========================================================= */

function DesktopRequestTimeline({
  status,
}: {
  status: string;
}) {
  const { currentIndex, rejected } =
    getTimelineState(status);

  return (
    <div className="relative px-2 pt-1">
      <div className="absolute left-[12.5%] right-[12.5%] top-[20px] h-[3px] rounded-full bg-gray-200" />

      <div
        className={`absolute left-[12.5%] top-[20px] h-[3px] rounded-full transition-all duration-500 ${
          rejected ? "bg-red-400" : "bg-emerald-500"
        }`}
        style={{
          width:
            currentIndex === 0
              ? "0%"
              : currentIndex === 1
                ? "12.5%"
                : currentIndex === 2
                  ? "37.5%"
                  : "75%",
        }}
      />

      <div className="relative grid grid-cols-4">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const done = index < currentIndex;
          const current = index === currentIndex;
          const rejectedStep =
            rejected && index === 2;

          return (
            <div
              key={step.key}
              className="flex min-w-0 flex-col items-center"
            >
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] bg-white shadow-sm transition-all ${
                  rejectedStep
                    ? "border-red-500 bg-red-50 text-red-600"
                    : done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : current
                        ? "border-[#FF5C39] text-[#FF5C39] ring-4 ring-orange-50"
                        : "border-gray-200 text-gray-300"
                }`}
              >
                {rejectedStep ? (
                  <X className="h-4 w-4" />
                ) : done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <p
                className={`mt-2 text-center text-[10px] font-black ${
                  rejectedStep
                    ? "text-red-600"
                    : done || current
                      ? "text-[#172033]"
                      : "text-gray-400"
                }`}
              >
                {rejectedStep
                  ? "Request Rejected"
                  : step.label}
              </p>

              <p className="mt-0.5 text-[9px] text-gray-400">
                {rejectedStep
                  ? "Not accepted"
                  : done
                    ? "Completed"
                    : current
                      ? "Current"
                      : "Waiting"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE TIMELINE
========================================================= */

function MobileRequestTimeline({
  status,
}: {
  status: string;
}) {
  const { currentIndex, rejected } =
    getTimelineState(status);

  return (
    <div className="relative">
      <div className="absolute bottom-5 left-[15px] top-5 w-[2px] rounded-full bg-gray-200" />

      <div
        className={`absolute left-[15px] top-5 w-[2px] rounded-full ${
          rejected
            ? "bg-red-400"
            : "bg-emerald-500"
        }`}
        style={{
          height:
            currentIndex === 0
              ? "0%"
              : currentIndex === 1
                ? "25%"
                : currentIndex === 2
                  ? "58%"
                  : "calc(100% - 40px)",
        }}
      />

      <div className="relative space-y-5">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const done = index < currentIndex;
          const current = index === currentIndex;
          const rejectedStep =
            rejected && index === 2;

          return (
            <div
              key={step.key}
              className="flex items-start gap-3"
            >
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2px] bg-white ${
                  rejectedStep
                    ? "border-red-500 bg-red-50 text-red-600"
                    : done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : current
                        ? "border-[#FF5C39] text-[#FF5C39] ring-4 ring-orange-50"
                        : "border-gray-200 text-gray-300"
                }`}
              >
                {rejectedStep ? (
                  <X className="h-3.5 w-3.5" />
                ) : done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>

              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-xs font-black ${
                    rejectedStep
                      ? "text-red-600"
                      : done || current
                        ? "text-[#172033]"
                        : "text-gray-400"
                  }`}
                >
                  {rejectedStep
                    ? "Request Rejected"
                    : step.label}
                </p>

                <p className="mt-0.5 text-[10px] text-gray-400">
                  {rejectedStep
                    ? "This request was rejected"
                    : done
                      ? "Completed"
                      : current
                        ? "Currently here"
                        : "Waiting for next step"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   WORKER GROUPS
========================================================= */

function WorkerGroups({
  request,
  mobile = false,
}: {
  request: WorkerRequest;
  mobile?: boolean;
}) {
  const groups = Array.isArray(request.requirements)
    ? request.requirements
    : [];

  if (!groups.length) return null;

  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <h3
          className={
            mobile
              ? "text-xs font-black text-[#172033]"
              : "text-sm font-black text-[#172033]"
          }
        >
          Worker Groups
        </h3>

        <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-500">
          {groups.length} groups
        </span>
      </div>

      <div
        className={
          mobile
            ? "space-y-2"
            : "grid gap-2 sm:grid-cols-2"
        }
      >
        {groups.map((group, index) => (
          <div
            key={`${group.category}-${index}`}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5C39]">
                <Users className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-black text-[#172033]">
                  {group.category}
                </p>
                <p className="text-[9px] text-gray-400">
                  Worker group
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-black text-[#172033]">
              × {group.workers_required}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
        <span className="text-[10px] font-bold text-emerald-700">
          Total Workers
        </span>

        <span className="text-sm font-black text-emerald-700">
          {request.workers_required}
        </span>
      </div>
    </section>
  );
}

/* =========================================================
   REQUESTER DETAILS
========================================================= */

function RequesterDetails({
  request,
  mobile = false,
}: {
  request: WorkerRequest;
  mobile?: boolean;
}) {
  return (
    <section>
      <h3
        className={
          mobile
            ? "text-xs font-black text-[#172033]"
            : "text-sm font-black text-[#172033]"
        }
      >
        Requester Details
      </h3>

      <div className="mt-2.5 space-y-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <Info
          icon={<User />}
          label="Name"
          value={request.requester_name || "—"}
        />

        <Info
          icon={<Phone />}
          label="Mobile"
          value={request.requester_mobile || "—"}
        />

        <Info
          icon={<span className="text-xs">@</span>}
          label="Email"
          value={request.requester_email || "—"}
        />

        {request.requester_type && (
          <Info
            icon={
              <span className="text-[8px] font-black">
                TYPE
              </span>
            }
            label="Requester Type"
            value={request.requester_type}
          />
        )}

        {request.company_name && (
          <Info
            icon={
              <span className="text-xs font-black">
                CO
              </span>
            }
            label="Company"
            value={request.company_name}
          />
        )}

        {request.gstin && (
          <Info
            icon={
              <span className="text-xs font-black">
                GST
              </span>
            }
            label="GSTIN"
            value={request.gstin}
          />
        )}
      </div>
    </section>
  );
}

/* =========================================================
   ADDRESS
========================================================= */

function AddressDetails({
  request,
  mobile = false,
}: {
  request: WorkerRequest;
  mobile?: boolean;
}) {
  const address =
    request.full_address ||
    request.requester_address ||
    [
      request.locality,
      request.district,
      request.state,
      request.pincode,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Address not available";

  return (
    <section>
      <h3
        className={
          mobile
            ? "text-xs font-black text-[#172033]"
            : "text-sm font-black text-[#172033]"
        }
      >
        Work Address
      </h3>

      <div className="mt-2.5 flex gap-2.5 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5C39]">
          <MapPin className="h-4 w-4" />
        </div>

        <p className="text-xs leading-5 text-[#475569]">
          {address}
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   SOURCE
========================================================= */

function SourceDetails({
  request,
}: {
  request: WorkerRequest;
  mobile?: boolean;
}) {
  return (
    <section className="grid grid-cols-2 gap-3">
      <Info
        icon={
          <span className="text-[8px] font-black">
            SRC
          </span>
        }
        label="Source"
        value={request.source || "—"}
      />

      <Info
        icon={<CalendarDays />}
        label="Created"
        value={
          request.created_at
            ? new Date(
                request.created_at,
              ).toLocaleString("en-IN")
            : "—"
        }
      />
    </section>
  );
}

/* =========================================================
   DETAIL CONTENT
========================================================= */

function DetailContent({
  selected,
  mobile = false,
}: {
  selected: WorkerRequest;
  mobile?: boolean;
}) {
  return (
    <div className="space-y-4">
      {(selected.project_name ||
        selected.project_type) && (
        <section className="rounded-2xl border border-orange-100 bg-orange-50/50 p-3.5">
          <h3
            className={
              mobile
                ? "text-xs font-black text-[#172033]"
                : "text-sm font-black text-[#172033]"
            }
          >
            Project
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-4">
            {selected.project_name && (
              <Info
                icon={
                  <span className="text-[8px] font-black">
                    PR
                  </span>
                }
                label="Project"
                value={selected.project_name}
              />
            )}

            {selected.project_type && (
              <Info
                icon={
                  <span className="text-[8px] font-black">
                    TYPE
                  </span>
                }
                label="Type"
                value={selected.project_type}
              />
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3
            className={
              mobile
                ? "text-xs font-black text-[#172033]"
                : "text-sm font-black text-[#172033]"
            }
          >
            Work Details
          </h3>

          <span className="rounded-lg bg-orange-50 px-2 py-1 text-[9px] font-bold text-[#FF5C39]">
            {selected.category}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Info
            icon={<Users />}
            label="Workers"
            value={String(selected.workers_required)}
            highlight
          />

          <Info
            icon={<User />}
            label="Category"
            value={selected.category}
          />

          <Info
            icon={<CalendarDays />}
            label="Work Date"
            value={selected.work_date}
          />

          <Info
            icon={<Clock3 />}
            label="Start Time"
            value={selected.start_time || "Not specified"}
          />

          <Info
            icon={<MapPin />}
            label="Location"
            value={selected.location}
          />

          <Info
            icon={
              <span className="text-sm font-black">
                ₹
              </span>
            }
            label="Budget"
            value={
              selected.budget != null
                ? `₹${selected.budget}`
                : "Not specified"
            }
            highlight
          />
        </div>

        {selected.duration && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <Info
              icon={<Clock3 />}
              label="Duration"
              value={selected.duration}
            />
          </div>
        )}
      </section>

      <WorkerGroups
        request={selected}
        mobile={mobile}
      />

      {selected.requirement && (
        <section>
          <h3
            className={
              mobile
                ? "text-xs font-black text-[#172033]"
                : "text-sm font-black text-[#172033]"
            }
          >
            Requirement
          </h3>

          <div className="mt-2.5 rounded-2xl border border-gray-100 bg-white p-3.5 text-xs leading-5 text-[#475569] shadow-sm">
            {selected.requirement}
          </div>
        </section>
      )}

      <RequesterDetails
        request={selected}
        mobile={mobile}
      />

      <AddressDetails
        request={selected}
        mobile={mobile}
      />

      <SourceDetails
        request={selected}
        mobile={mobile}
      />
    </div>
  );
}

/* =========================================================
   ACTION BUTTONS
========================================================= */

function RequestActions({
  request,
  updating,
  onView,
  onUpdate,
  mobile = false,
}: {
  request: WorkerRequest;
  updating: string | null;
  onView: () => void;
  onUpdate: (
    id: string,
    status: StatusType,
  ) => void;
  mobile?: boolean;
}) {
  const status = normalizeStatus(request.status);
  const busy = updating === request.id;

  if (status !== "pending") {
    return (
      <button
        type="button"
        onClick={onView}
        className={
          mobile
            ? "flex h-9 items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 text-[10px] font-bold text-gray-600"
            : "flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
        }
      >
        View Details
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div
      className={
        mobile
          ? "grid grid-cols-3 gap-1.5"
          : "flex items-center gap-2"
      }
    >
      <button
        type="button"
        onClick={onView}
        className={
          mobile
            ? "rounded-lg border border-gray-200 bg-white py-2 text-[10px] font-bold text-gray-600"
            : "rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
        }
      >
        View
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={() =>
          onUpdate(request.id, "rejected")
        }
        className={
          mobile
            ? "rounded-lg bg-red-50 py-2 text-[10px] font-bold text-red-600 disabled:opacity-50"
            : "rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 disabled:opacity-50"
        }
      >
        Reject
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={() =>
          onUpdate(request.id, "accepted")
        }
        className={
          mobile
            ? "flex items-center justify-center rounded-lg bg-[#FF5C39] py-2 text-[10px] font-bold text-white disabled:opacity-50"
            : "flex min-w-[90px] items-center justify-center gap-1.5 rounded-xl bg-[#FF5C39] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-orange-100 transition hover:bg-[#f45130] disabled:opacity-50"
        }
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <Check className="h-3.5 w-3.5" />
            Accept
          </>
        )}
      </button>
    </div>
  );
}

/* =========================================================
   DESKTOP CARD
========================================================= */

function DesktopRequestCard({
  request,
  updating,
  onView,
  onUpdate,
}: {
  request: WorkerRequest;
  updating: string | null;
  onView: (request: WorkerRequest) => void;
  onUpdate: (
    id: string,
    status: StatusType,
  ) => void;
}) {
  const status = normalizeStatus(request.status);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-[1px] hover:border-gray-200 hover:shadow-md">
      <div className="p-4 lg:p-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onView(request)}
            className="flex min-w-0 flex-1 items-start gap-3.5 text-left"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5C39]">
              <Users className="h-5 w-5" />

              {status === "pending" && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#FF5C39]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-black text-[#172033] lg:text-base">
                  {request.project_name ||
                    request.category ||
                    "Worker Request"}
                </h3>

                <StatusBadge status={status} />
              </div>

              <p className="mt-1 text-xs font-medium text-[#64748B]">
                {request.requester_name || "Customer"}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-[#64748B]">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#94A3B8]" />
                  {request.workers_required} Worker
                  {request.workers_required !== 1
                    ? "s"
                    : ""}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#94A3B8]" />
                  {request.location}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-[#94A3B8]" />
                  {request.work_date}
                </span>

                {request.start_time && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {request.start_time}
                  </span>
                )}
              </div>
            </div>
          </button>

          <RequestActions
            request={request}
            updating={updating}
            onView={() => onView(request)}
            onUpdate={onUpdate}
          />
        </div>
      </div>

      <div className="border-t border-gray-100 bg-[#FAFAFA] px-5 py-5">
        <DesktopRequestTimeline status={status} />
      </div>
    </article>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function MobileRequestCard({
  request,
  updating,
  onView,
  onUpdate,
}: {
  request: WorkerRequest;
  updating: string | null;
  onView: (request: WorkerRequest) => void;
  onUpdate: (
    id: string,
    status: StatusType,
  ) => void;
}) {
  const status = normalizeStatus(request.status);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onView(request)}
        className="block w-full p-3.5 text-left"
      >
        <div className="flex items-start gap-2.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5C39]">
            <Users className="h-4.5 w-4.5" />

            {status === "pending" && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-[#FF5C39]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-xs font-black text-[#172033]">
                  {request.project_name ||
                    request.category ||
                    "Worker Request"}
                </h3>

                <p className="mt-0.5 truncate text-[10px] font-medium text-[#64748B]">
                  {request.requester_name || "Customer"}
                </p>
              </div>

              <StatusBadge status={status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2 py-1.5">
                <Users className="h-3 w-3 shrink-0 text-gray-400" />
                <span className="truncate text-[9px] font-bold text-gray-600">
                  {request.workers_required} Worker
                  {request.workers_required !== 1
                    ? "s"
                    : ""}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2 py-1.5">
                <CalendarDays className="h-3 w-3 shrink-0 text-gray-400" />
                <span className="truncate text-[9px] font-bold text-gray-600">
                  {request.work_date}
                </span>
              </div>

              <div className="col-span-2 flex min-w-0 items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2 py-1.5">
                <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                <span className="truncate text-[9px] font-bold text-gray-600">
                  {request.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </button>

      <div className="border-t border-gray-100 bg-[#FAFAFA] p-2.5">
        <RequestActions
          request={request}
          updating={updating}
          onView={() => onView(request)}
          onUpdate={onUpdate}
          mobile
        />
      </div>

      <div className="border-t border-gray-100 bg-[#FAFAFA] p-3">
        <MobileRequestTimeline status={status} />
      </div>
    </article>
  );
}

/* =========================================================
   DESKTOP DRAWER
========================================================= */

function DesktopDetailDrawer({
  selected,
  updating,
  onClose,
  onUpdate,
}: {
  selected: WorkerRequest;
  updating: string | null;
  onClose: () => void;
  onUpdate: (
    id: string,
    status: StatusType,
  ) => void;
}) {
  const status = normalizeStatus(selected.status);

  return (
    <>
      <button
        type="button"
        aria-label="Close request details"
        onClick={onClose}
        className="fixed inset-0 z-[70] cursor-default bg-black/40 backdrop-blur-[2px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] hidden w-full max-w-xl overflow-y-auto bg-[#F8FAFC] shadow-2xl sm:block">
        <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5C39]">
                <Users className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-base font-black text-[#172033]">
                  Request Details
                </p>

                <p className="truncate text-[10px] font-medium text-[#94A3B8]">
                  {selected.project_name ||
                    selected.category ||
                    "Worker Request"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5 pb-24">
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#172033]">
                  Request Timeline
                </p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  Track request progress
                </p>
              </div>

              <StatusBadge status={status} large />
            </div>

            <DesktopRequestTimeline status={status} />
          </section>

          <DetailContent selected={selected} />
        </div>

        {status === "pending" && (
          <div className="sticky bottom-0 z-30 border-t border-gray-100 bg-white/95 p-4 backdrop-blur">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={updating === selected.id}
                onClick={() =>
                  onUpdate(selected.id, "rejected")
                }
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 py-3 text-xs font-bold text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Reject
              </button>

              <button
                type="button"
                disabled={updating === selected.id}
                onClick={() =>
                  onUpdate(selected.id, "accepted")
                }
                className="flex flex-[1.5] items-center justify-center gap-1.5 rounded-xl bg-[#FF5C39] py-3 text-xs font-black text-white shadow-sm shadow-orange-100 disabled:opacity-50"
              >
                {updating === selected.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Accept Request
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* =========================================================
   MOBILE DRAWER
========================================================= */

function MobileDetailDrawer({
  selected,
  updating,
  onClose,
  onUpdate,
}: {
  selected: WorkerRequest;
  updating: string | null;
  onClose: () => void;
  onUpdate: (
    id: string,
    status: StatusType,
  ) => void;
}) {
  const status = normalizeStatus(selected.status);

  return (
    <div className="fixed inset-0 z-[80] bg-white sm:hidden">
      <div className="flex h-full flex-col bg-[#F8FAFC]">
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5C39]">
              <Users className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black text-[#172033]">
                Request Details
              </p>

              <p className="truncate text-[9px] font-medium text-gray-400">
                {selected.project_name ||
                  selected.category ||
                  "Worker Request"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-3 pb-24">
          <div className="space-y-3">
            <section className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-[#172033]">
                    Request Timeline
                  </p>
                  <p className="mt-0.5 text-[9px] text-gray-400">
                    Track request progress
                  </p>
                </div>

                <StatusBadge status={status} />
              </div>

              <MobileRequestTimeline status={status} />
            </section>

            <DetailContent
              selected={selected}
              mobile
            />
          </div>
        </main>

        {status === "pending" && (
          <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white p-3">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={updating === selected.id}
                onClick={() =>
                  onUpdate(selected.id, "rejected")
                }
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-red-100 bg-red-50 py-3 text-xs font-bold text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Reject
              </button>

              <button
                type="button"
                disabled={updating === selected.id}
                onClick={() =>
                  onUpdate(selected.id, "accepted")
                }
                className="flex flex-[1.5] items-center justify-center gap-1 rounded-xl bg-[#FF5C39] py-3 text-xs font-black text-white disabled:opacity-50"
              >
                {updating === selected.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Accept Request
                  </>
                )}
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WorkerRequestsTab({
  device,
  onRequestCountChange,
  realtimeRequest,
}: Props) {
  const [requests, setRequests] = useState<
    WorkerRequest[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [selected, setSelected] =
    useState<WorkerRequest | null>(null);

  const [updating, setUpdating] =
    useState<string | null>(null);

  const isMobile = device === "mobile";

  /* =======================================================
     LOAD
  ======================================================= */

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("worker_requests")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setRequests(
        (data ?? []) as WorkerRequest[],
      );
    } catch (error) {
      console.error(
        "[Worker Requests]",
        error,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /* =======================================================
     REALTIME
  ======================================================= */

  useEffect(() => {
    if (!realtimeRequest) return;

    setRequests((prev) => {
      const exists = prev.some(
        (item) =>
          String(item.id) ===
          String(realtimeRequest.id),
      );

      if (exists) {
        return prev.map((item) =>
          String(item.id) ===
          String(realtimeRequest.id)
            ? realtimeRequest
            : item,
        );
      }

      return [realtimeRequest, ...prev];
    });
  }, [realtimeRequest]);

  /* =======================================================
     PENDING COUNT
  ======================================================= */

  const pendingCount = useMemo(
    () =>
      requests.filter(
        (item) =>
          normalizeStatus(item.status) ===
          "pending",
      ).length,
    [requests],
  );

  useEffect(() => {
    onRequestCountChange?.(pendingCount);
  }, [
    pendingCount,
    onRequestCountChange,
  ]);

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (
    id: string,
    status: StatusType,
  ) => {
    try {
      setUpdating(id);

      const { data, error } = await supabase
        .from("worker_requests")
        .update({ status })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "Worker request was not updated.",
        );
      }

      const updated =
        data as WorkerRequest;

      setRequests((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? updated
            : item,
        ),
      );

      setSelected((prev) =>
        prev &&
        String(prev.id) === String(id)
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
      <div
        className={
          isMobile
            ? "min-h-screen bg-[#F8FAFC] p-3"
            : "min-h-screen bg-[#F8FAFC] p-5 lg:p-7"
        }
      >
        <div className="animate-pulse">
          <div className="h-7 w-44 rounded-lg bg-gray-200" />

          <div className="mt-2 h-3.5 w-64 rounded bg-gray-100" />

          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={
                  isMobile
                    ? "h-48 rounded-2xl bg-white"
                    : "h-40 rounded-2xl bg-white"
                }
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
    <div
      className={
        isMobile
          ? "min-h-screen bg-[#F8FAFC] p-3"
          : "min-h-screen bg-[#F8FAFC] p-5 lg:p-7"
      }
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className={
          isMobile
            ? "mb-4"
            : "mb-6 flex items-center justify-between"
        }
      >
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={
                isMobile
                  ? "text-lg font-black text-[#172033]"
                  : "text-2xl font-black text-[#172033]"
              }
            >
              Worker Requests
            </h1>

            {pendingCount > 0 && (
              <span
                className={
                  isMobile
                    ? "rounded-full bg-orange-50 px-2 py-1 text-[9px] font-black text-[#FF5C39]"
                    : "rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-[#FF5C39]"
                }
              >
                {pendingCount} Pending
              </span>
            )}
          </div>

          <p
            className={
              isMobile
                ? "mt-1 text-[10px] font-medium text-[#64748B]"
                : "mt-1 text-sm font-medium text-[#64748B]"
            }
          >
            Manage customer requests for workers
          </p>
        </div>

        {!isMobile && pendingCount > 0 && (
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#FF5C39]">
              Action Required
            </p>
            <p className="mt-0.5 text-sm font-black text-[#172033]">
              {pendingCount} request
              {pendingCount !== 1 ? "s" : ""} waiting
            </p>
          </div>
        )}
      </div>

      {/* ===================================================
          EMPTY
      =================================================== */}

      {requests.length === 0 ? (
        <div
          className={
            isMobile
              ? "rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm"
              : "rounded-2xl border border-gray-100 bg-white p-14 text-center shadow-sm"
          }
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5C39]">
            <Users className="h-6 w-6" />
          </div>

          <h2
            className={
              isMobile
                ? "mt-3 text-sm font-black text-[#172033]"
                : "mt-4 text-base font-black text-[#172033]"
            }
          >
            No Worker Requests
          </h2>

          <p
            className={
              isMobile
                ? "mt-1 text-xs text-[#64748B]"
                : "mt-1 text-sm text-[#64748B]"
            }
          >
            New worker requests will appear here
            automatically.
          </p>
        </div>
      ) : (
        <div
          className={
            isMobile
              ? "space-y-2.5"
              : "space-y-3"
          }
        >
          {requests.map((request) =>
            isMobile ? (
              <MobileRequestCard
                key={request.id}
                request={request}
                updating={updating}
                onView={setSelected}
                onUpdate={updateStatus}
              />
            ) : (
              <DesktopRequestCard
                key={request.id}
                request={request}
                updating={updating}
                onView={setSelected}
                onUpdate={updateStatus}
              />
            ),
          )}
        </div>
      )}

      {/* ===================================================
          DETAIL
      =================================================== */}

      {selected &&
        (isMobile ? (
          <MobileDetailDrawer
            selected={selected}
            updating={updating}
            onClose={() => setSelected(null)}
            onUpdate={updateStatus}
          />
        ) : (
          <DesktopDetailDrawer
            selected={selected}
            updating={updating}
            onClose={() => setSelected(null)}
            onUpdate={updateStatus}
          />
        ))}
    </div>
  );
}