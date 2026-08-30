"use client";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IndianRupee,
  Loader2,
  MapPin,
  Users,
  X,
} from "lucide-react";

import type { StatusType, WorkerRequest } from "../../types";
import { getRequestTitle, normalizeStatus } from "../../utils/requestHelpers";

import RequestStatusBadge from "../card/RequestStatusBadge";
import RequestTimeline from "../timeline/RequestTimeline";

type Props = {
  request: WorkerRequest;
  updating?: string | null;
  onClose: () => void;
  onUpdate: (id: string, status: StatusType) => void;
};

export default function MobileRequestDrawer({ request, updating = null, onClose, onUpdate }: Props) {
  const status = normalizeStatus(request.status);
  const isUpdating = updating === request.id;
  const isPending = status === "pending";
  const isUnderReview = status === "under_review";
  const isAccepted = status === "accepted";
  const isCompleted = status === "completed";

  const title = getRequestTitle(request);
  const customer = request.requester_name || request.company_name || "Customer";
  const location = request.location || request.locality || "Location not specified";
  const date = request.work_date || "Date not specified";
  const time = request.start_time || "Time not specified";
  const workers = request.workers_required || 0;

  const update = (nextStatus: StatusType) => {
    if (!isUpdating) onUpdate(request.id, nextStatus);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#F8FAFC]">
      <div className="flex h-full flex-col">
        {/* HEADER */}
        <header className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-black text-[#172033]">Booking Details</p>
              <RequestStatusBadge status={status} size="sm" />
            </div>
            <p className="mt-0.5 truncate text-[8px] font-medium text-[#94A3B8]">
              {title}<span className="mx-1 text-[#D1D5DB]">•</span>{customer}
            </p>
          </div>

          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-24">
          <div className="space-y-2.5">
            {/* SUMMARY */}
            <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="flex items-start justify-between gap-3 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">Worker Booking</p>
                  <h1 className="mt-1 truncate text-[14px] font-black text-[#172033]">{title}</h1>
                  <p className="mt-0.5 truncate text-[10px] font-medium text-[#64748B]">{customer}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#FFF1EC] px-2.5 py-1.5">
                  <Users className="h-3.5 w-3.5 text-[#E23744]" />
                  <span className="text-[10px] font-black text-[#E23744]">{workers}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-50 px-3.5 py-3">
                <QuickInfo icon={<CalendarDays />} label="Date" value={date} />
                <QuickInfo icon={<Clock3 />} label="Time" value={time} />
                <QuickInfo icon={<MapPin />} label="Location" value={location} />
                <QuickInfo icon={<IndianRupee />} label="Budget" value={request.budget != null ? `₹${request.budget}` : "Not specified"} />
              </div>
            </section>

            {/* TIMELINE */}
            <section className="rounded-xl border border-gray-100 bg-white px-3.5 py-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-black text-[#172033]">Booking Status</p>
                  <p className="mt-0.5 text-[8px] font-medium text-[#94A3B8]">Track booking progress</p>
                </div>
                <RequestStatusBadge status={status} size="sm" />
              </div>

              <RequestTimeline status={status} mobile compact />
            </section>

            {/* WORK DETAILS */}
            <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <DetailHeader title="Work Details" />
              <div className="divide-y divide-gray-50">
                <DetailRow label="Category" value={request.category || "—"} />
                <DetailRow label="Project" value={request.project_name || "—"} />
                <DetailRow label="Project Type" value={request.project_type || "—"} />
                <DetailRow label="Duration" value={request.duration || "—"} />
                <DetailRow label="Requirement" value={request.requirement || "—"} />
              </div>
            </section>

            {/* LOCATION */}
            <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <DetailHeader title="Work Location" />
              <div className="flex items-start gap-2 px-3.5 py-3">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF5C39]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold leading-4 text-[#172033]">
                    {request.full_address || request.location || "Address not specified"}
                  </p>
                  {(request.locality || request.district || request.state || request.pincode) && (
                    <p className="mt-1 text-[8px] leading-4 text-[#94A3B8]">
                      {[request.locality, request.district, request.state, request.pincode].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* CUSTOMER */}
            <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <DetailHeader title="Customer Details" />
              <div className="divide-y divide-gray-50">
                <DetailRow label="Name" value={request.requester_name || request.company_name || "—"} />
                <DetailRow label="Mobile" value={request.requester_mobile || "—"} />
                <DetailRow label="Email" value={request.requester_email || "—"} />
                <DetailRow label="Type" value={request.requester_type || "—"} />
              </div>
            </section>

            {/* UNDER REVIEW */}
            {isUnderReview && (
              <section className="rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Clock3 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-700">Under Review</p>
                    <p className="mt-0.5 text-[8px] text-amber-600">Request is being reviewed before confirmation.</p>
                  </div>
                </div>
              </section>
            )}

            {/* ACCEPTED */}
            {isAccepted && (
              <section className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3">
                <div>
                  <p className="text-[10px] font-black text-emerald-700">Booking Confirmed</p>
                  <p className="mt-0.5 text-[8px] text-emerald-600">Work is ready to be completed.</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </section>
            )}

            {/* COMPLETED */}
            {isCompleted && (
              <section className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3">
                <div>
                  <p className="text-[10px] font-black text-blue-700">Work Completed</p>
                  <p className="mt-0.5 text-[8px] text-blue-600">This booking has been completed.</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </section>
            )}
          </div>
        </main>

        {/* ACTION BAR */}
        {(isPending || isUnderReview || isAccepted) && (
          <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white px-3 py-2.5">
            {/* PENDING → UNDER REVIEW */}
            {isPending && (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={isUpdating} onClick={() => update("rejected")} className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 text-[10px] font-black text-red-600 disabled:opacity-50">
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  Reject
                </button>

                <button type="button" disabled={isUpdating} onClick={() => update("under_review")} className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C39] text-[10px] font-black text-white shadow-sm disabled:opacity-50">
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock3 className="h-3.5 w-3.5" />}
                  Start Review
                </button>
              </div>
            )}

            {/* UNDER REVIEW → ACCEPTED */}
            {isUnderReview && (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={isUpdating} onClick={() => update("rejected")} className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 text-[10px] font-black text-red-600 disabled:opacity-50">
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  Reject
                </button>

                <button type="button" disabled={isUpdating} onClick={() => update("accepted")} className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#E23744] text-[10px] font-black text-white shadow-sm disabled:opacity-50">
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Confirm Booking
                </button>
              </div>
            )}

            {/* ACCEPTED → COMPLETED */}
            {isAccepted && (
              <button type="button" disabled={isUpdating} onClick={() => update("completed")} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-[10px] font-black text-white shadow-sm disabled:opacity-50">
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Mark Work Completed
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}

function QuickInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 shrink-0 text-[#94A3B8] [&>svg]:h-3 [&>svg]:w-3">{icon}</span>
      <div className="min-w-0">
        <p className="text-[7px] font-bold uppercase tracking-wide text-[#94A3B8]">{label}</p>
        <p className="mt-0.5 truncate text-[9px] font-black text-[#172033]">{value}</p>
      </div>
    </div>
  );
}

function DetailHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 px-3.5 py-2.5">
      <p className="text-[10px] font-black text-[#172033]">{title}</p>
      <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1]" />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
      <span className="shrink-0 text-[8px] font-medium text-[#94A3B8]">{label}</span>
      <span className="min-w-0 text-right text-[9px] font-bold leading-4 text-[#172033]">{value}</span>
    </div>
  );
}