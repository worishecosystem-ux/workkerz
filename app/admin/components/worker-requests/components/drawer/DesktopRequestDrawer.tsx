"use client";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  MapPin,
  Users,
  X,
} from "lucide-react";

import type { StatusType, WorkerRequest } from "../../types";
import {
  getRequestTitle,
  normalizeStatus,
} from "../../utils/requestHelpers";

import RequestStatusBadge from "../card/RequestStatusBadge";
import RequestTimeline from "../timeline/RequestTimeline";

import ProjectCard from "../details/ProjectCard";
import RequesterCard from "../details/RequesterCard";
import SourceCard from "../details/SourceCard";
import WorkDetailsCard from "../details/WorkDetailsCard";
import WorkLocationCard from "../details/WorkLocationCard";
import WorkerGroupsCard from "../details/WorkerGroupsCard";

type Props = {
  request: WorkerRequest;
  updating?: string | null;
  onClose: () => void;
  onUpdate: (id: string, status: StatusType) => void;
};

export default function DesktopRequestDrawer({
  request,
  updating = null,
  onClose,
  onUpdate,
}: Props) {
  const status = normalizeStatus(request.status);
  const isUpdating = updating === request.id;

  const isPending = status === "pending";
  const isUnderReview = status === "under_review";
  const isAccepted = status === "accepted";
  const isCompleted = status === "completed";
  const isRejected = status === "rejected";
  const isCancelled = status === "cancelled";

  const title = getRequestTitle(request);
  const customer =
    request.requester_name ||
    request.company_name ||
    "Customer";

  const location =
    request.location ||
    request.locality ||
    "Location not specified";

  const date =
    request.work_date ||
    "Date not specified";

  const time =
    request.start_time ||
    "Time not specified";

  const workers =
    request.workers_required || 0;

  const update = (nextStatus: StatusType) => {
    if (!isUpdating) {
      onUpdate(request.id, nextStatus);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close booking details"
        onClick={onClose}
        className="fixed inset-0 z-[70] cursor-default bg-black/30 backdrop-blur-[2px]"
      />

      {/* DETAIL PAGE */}
      <aside className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#F8F8F8]">
        {/* HEADER */}
        <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 lg:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-[#1C1C1C] md:text-base">
                Booking Details
              </h1>

              <RequestStatusBadge
                status={status}
                size="sm"
                showIcon
              />
            </div>

            <p className="mt-0.5 truncate text-[8px] font-medium text-[#828282]">
              {title}
              <span className="mx-1 text-[#D1D5DB]">•</span>
              {customer}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-3 pb-8 lg:px-7 lg:py-4">
            {/* SUMMARY */}
            <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
                    Worker Booking
                  </p>

                  <h2 className="mt-0.5 truncate text-sm font-extrabold text-[#1C1C1C]">
                    {title}
                  </h2>

                  <p className="mt-0.5 truncate text-[9px] font-medium text-[#828282]">
                    {customer}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[#FFF1EC] px-2.5 py-1.5">
                  <Users className="h-3.5 w-3.5 text-[#E23744]" />

                  <span className="text-[10px] font-extrabold text-[#E23744]">
                    {workers}
                  </span>

                  <span className="hidden text-[8px] font-bold text-[#E23744] sm:inline">
                    Workers
                  </span>
                </div>
              </div>

              {/* QUICK INFO */}
              <div className="grid grid-cols-2 border-t border-gray-50 sm:grid-cols-4">
                <QuickInfo
                  icon={<CalendarDays />}
                  label="Date"
                  value={date}
                />

                <QuickInfo
                  icon={<Clock3 />}
                  label="Time"
                  value={time}
                />

                <QuickInfo
                  icon={<MapPin />}
                  label="Location"
                  value={location}
                />

                <QuickInfo
                  icon={<IndianRupee />}
                  label="Budget"
                  value={
                    request.budget != null
                      ? `₹${Number(request.budget).toLocaleString("en-IN")}`
                      : "Not specified"
                  }
                />
              </div>
            </section>

            {/* TIMELINE */}
            <section className="mt-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold text-[#1C1C1C]">
                    Booking Timeline
                  </p>

                  <p className="mt-0.5 text-[8px] font-medium text-[#828282]">
                    Track booking progress
                  </p>
                </div>

                <RequestStatusBadge
                  status={status}
                  size="sm"
                />
              </div>

              <RequestTimeline status={status} />
            </section>

            {/* DETAILS GRID */}
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-7">
                <ProjectCard
                  request={request}
                  compact
                />
              </div>

              <div className="min-w-0 lg:col-span-5">
                <RequesterCard
                  request={request}
                  compact
                />
              </div>

              <div className="min-w-0 lg:col-span-7">
                <WorkDetailsCard
                  request={request}
                  compact
                />
              </div>

              <div className="min-w-0 lg:col-span-5">
                <SourceCard
                  request={request}
                  compact
                />
              </div>

              <div className="min-w-0 lg:col-span-7">
                <WorkLocationCard
                  request={request}
                  compact
                />
              </div>

              <div className="min-w-0 lg:col-span-5">
                <WorkerGroupsCard
                  request={request}
                  compact
                />
              </div>
            </div>

            {/* STATUS */}
            {isPending && (
              <StatusMessage
                type="pending"
                title="Action Required"
                message="Review this request and move it to Under Review before confirming the booking."
              />
            )}

            {isUnderReview && (
              <StatusMessage
                type="review"
                title="Under Review"
                message="This request is currently under review. Confirm the booking after verifying the details."
              />
            )}

            {isAccepted && (
              <StatusMessage
                type="success"
                title="Booking Confirmed"
                message="This request has been accepted and is ready for work."
              />
            )}

            {isCompleted && (
              <StatusMessage
                type="success"
                title="Work Completed"
                message="This booking has been completed successfully."
              />
            )}

            {isRejected && (
              <StatusMessage
                type="danger"
                title="Request Rejected"
                message="This worker request was rejected."
              />
            )}

            {isCancelled && (
              <StatusMessage
                type="neutral"
                title="Request Cancelled"
                message="This booking has been cancelled."
              />
            )}
          </div>
        </main>

        {/* ACTION BAR */}
        {(isPending || isUnderReview || isAccepted) && (
          <footer className="shrink-0 border-t border-gray-100 bg-white px-4 py-2.5 lg:px-7">
            <div className="mx-auto flex w-full max-w-[1180px] justify-end gap-2">
              {/* PENDING → UNDER REVIEW */}
              {isPending && (
                <>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => update("rejected")}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-4 text-[9px] font-extrabold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}

                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => update("under_review")}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#E23744] px-5 text-[9px] font-extrabold text-white shadow-sm transition hover:bg-[#D92F3C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Clock3 className="h-3.5 w-3.5" />
                    )}

                    Move to Under Review
                  </button>
                </>
              )}

              {/* UNDER REVIEW → ACCEPTED */}
              {isUnderReview && (
                <>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => update("rejected")}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-4 text-[9px] font-extrabold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}

                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => update("accepted")}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-5 text-[9px] font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}

                    Confirm Booking
                  </button>
                </>
              )}

              {/* ACCEPTED → COMPLETED */}
              {isAccepted && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => update("completed")}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-5 text-[9px] font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}

                  Mark Work Completed
                </button>
              )}
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}

/* =========================================================
   QUICK INFO
========================================================= */

function QuickInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 border-b border-r border-gray-50 px-3 py-2.5 sm:border-b-0 last:border-r-0">
      <span className="shrink-0 text-[#94A3B8] [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[7px] font-bold uppercase tracking-wide text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[9px] font-extrabold text-[#1C1C1C]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS MESSAGE
========================================================= */

function StatusMessage({
  type,
  title,
  message,
}: {
  type:
    | "pending"
    | "review"
    | "success"
    | "danger"
    | "neutral";
  title: string;
  message: string;
}) {
  const styles = {
    pending: {
      wrapper: "border-orange-100 bg-orange-50",
      title: "text-orange-700",
      text: "text-orange-600",
      icon: "bg-orange-500",
    },
    review: {
      wrapper: "border-amber-100 bg-amber-50",
      title: "text-amber-700",
      text: "text-amber-600",
      icon: "bg-amber-500",
    },
    success: {
      wrapper: "border-emerald-100 bg-emerald-50",
      title: "text-emerald-700",
      text: "text-emerald-600",
      icon: "bg-emerald-500",
    },
    danger: {
      wrapper: "border-red-100 bg-red-50",
      title: "text-red-700",
      text: "text-red-600",
      icon: "bg-red-500",
    },
    neutral: {
      wrapper: "border-gray-200 bg-gray-50",
      title: "text-gray-700",
      text: "text-gray-500",
      icon: "bg-gray-400",
    },
  };

  const style = styles[type];

  return (
    <section
      className={`mt-3 rounded-xl border px-4 py-3 ${style.wrapper}`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white ${style.icon}`}
        >
          {type === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : type === "review" ? (
            <Clock3 className="h-3.5 w-3.5" />
          ) : type === "danger" ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <Clock3 className="h-3.5 w-3.5" />
          )}
        </div>

        <div>
          <p
            className={`text-[10px] font-extrabold ${style.title}`}
          >
            {title}
          </p>

          <p
            className={`mt-0.5 text-[8px] leading-4 ${style.text}`}
          >
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}