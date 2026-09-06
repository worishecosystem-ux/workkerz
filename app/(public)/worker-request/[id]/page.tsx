"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  Building2,
  ShieldCheck,
  BriefcaseBusiness,
  FileText,
  Hash,
  CheckCircle,
  CircleAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface WorkerRequest {
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

  requirements?: unknown;
  total_workers: number;

  is_deleted: boolean;
  deleted_at?: string | null;
  delete_reason?: string | null;
  deletion_reason?: string | null;
}

export default function WorkerRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [request, setRequest] = useState<WorkerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  async function loadRequest() {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("worker_requests")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .single();

      if (error) {
        console.error("LOAD WORKER REQUEST ERROR:", error);
        setError("Worker request could not be found.");
        setRequest(null);
        return;
      }

      setRequest(data as WorkerRequest);
    } catch (err) {
      console.error("REQUEST DETAIL ERROR:", err);
      setError("Something went wrong while loading the request.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date?: string | null) {
    if (!date) return "Not specified";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }

  function formatDateTime(date?: string | null) {
    if (!date) return "";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  }

  function getStatusClass(status?: string) {
    switch (status?.toLowerCase()) {
      case "completed":
      case "accepted":
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "rejected":
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700 border-red-200";

      case "in_progress":
      case "assigned":
        return "bg-blue-100 text-blue-700 border-blue-200";

      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  }

  function getStatusIcon(status?: string) {
    switch (status?.toLowerCase()) {
      case "completed":
      case "accepted":
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;

      case "rejected":
      case "cancelled":
      case "canceled":
        return <CircleAlert className="h-4 w-4" />;

      default:
        return <Clock className="h-4 w-4" />;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="fixed inset-x-0 top-0 z-50 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600">
          <div className="px-4 pb-4 pt-12">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-white/10" />
              <div>
                <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="mt-1 h-3 w-20 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 pb-6 pt-28">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="mt-3 h-10 w-full rounded-xl bg-slate-100" />
              <div className="mt-2 h-10 w-full rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <CircleAlert className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-4 text-base font-bold text-slate-900">
            Request Not Found
          </h1>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {error || "This worker request is no longer available."}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 h-10 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="fixed inset-x-0 top-0 z-50 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600 shadow-xl">
        <div className="px-4 pb-4 pt-12">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-bold text-white">
                Worker Request
              </h1>

              <p className="mt-0.5 truncate text-[9px] text-emerald-100">
                Complete request details
              </p>
            </div>

            <span
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-bold ${getStatusClass(
                request.status
              )}`}
            >
              {getStatusIcon(request.status)}
              {request.status?.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 pb-8 pt-28">
        {/* =====================================================
            REQUEST OVERVIEW
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="h-1 bg-linear-to-r from-purple-500 via-violet-500 to-fuchsia-400" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                <Users className="h-5 w-5 text-purple-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                  Worker Request
                </p>

                <h2 className="mt-0.5 text-base font-bold text-slate-900">
                  {request.project_name ||
                    request.category ||
                    "Worker Request"}
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  {request.category || "General Work"}
                  {request.project_type
                    ? ` · ${request.project_type}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-purple-50 p-2.5">
                <Users className="h-4 w-4 text-purple-600" />

                <p className="mt-1 text-[8px] text-slate-400">
                  Required
                </p>

                <p className="text-sm font-bold text-slate-900">
                  {request.workers_required}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />

                <p className="mt-1 text-[8px] text-slate-400">
                  Assigned
                </p>

                <p className="text-sm font-bold text-emerald-700">
                  {request.total_workers || 0}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-2.5">
                <Hash className="h-4 w-4 text-blue-600" />

                <p className="mt-1 text-[8px] text-slate-400">
                  Request ID
                </p>

                <p className="truncate text-[10px] font-bold text-slate-800">
                  {request.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            WORK SCHEDULE
        ===================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h3 className="text-[12px] font-bold text-slate-900">
                Work Schedule
              </h3>

              <p className="text-[9px] text-slate-400">
                When the work is required
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoBox
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="Work Date"
              value={formatDate(request.work_date)}
            />

            <InfoBox
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Start Time"
              value={request.start_time || "Flexible"}
            />

            <InfoBox
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Duration"
              value={request.duration || "Not specified"}
            />

            <InfoBox
              icon={<Users className="h-3.5 w-3.5" />}
              label="Workers"
              value={`${request.workers_required} Required`}
            />
          </div>
        </section>

        {/* =====================================================
            LOCATION
        ===================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              <MapPin className="h-4 w-4 text-red-500" />
            </div>

            <div>
              <h3 className="text-[12px] font-bold text-slate-900">
                Work Location
              </h3>

              <p className="text-[9px] text-slate-400">
                Complete work address
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-semibold leading-5 text-slate-800">
              {request.full_address ||
                request.location ||
                "Location not specified"}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {request.locality && (
                <Tag text={request.locality} />
              )}

              {request.district && (
                <Tag text={request.district} />
              )}

              {request.state && (
                <Tag text={request.state} />
              )}

              {request.pincode && (
                <Tag text={request.pincode} />
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            BUDGET
        ===================================================== */}

        <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-[12px] font-bold text-slate-900">
                  Work Budget
                </h3>

                <p className="text-[9px] text-slate-400">
                  Budget shared by requester
                </p>
              </div>
            </div>

            <p className="text-lg font-black text-emerald-600">
              {request.budget !== null &&
              request.budget !== undefined
                ? `₹${Number(request.budget).toLocaleString(
                    "en-IN"
                  )}`
                : "Not specified"}
            </p>
          </div>
        </section>

        {/* =====================================================
            REQUIREMENT
        ===================================================== */}

        {request.requirement && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>

              <div>
                <h3 className="text-[12px] font-bold text-slate-900">
                  Work Requirement
                </h3>

                <p className="text-[9px] text-slate-400">
                  Requirement details
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="whitespace-pre-wrap text-[11px] leading-5 text-slate-600">
                {request.requirement}
              </p>
            </div>
          </section>
        )}

        {/* =====================================================
            PROJECT DETAILS
        ===================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <BriefcaseBusiness className="h-4 w-4 text-violet-600" />
            </div>

            <div>
              <h3 className="text-[12px] font-bold text-slate-900">
                Project Details
              </h3>

              <p className="text-[9px] text-slate-400">
                Work and project information
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <DetailRow
              label="Category"
              value={request.category}
            />

            <DetailRow
              label="Project Name"
              value={request.project_name}
            />

            <DetailRow
              label="Project Type"
              value={request.project_type}
            />

            <DetailRow
              label="Source"
              value={request.source}
            />
          </div>
        </section>

        {/* =====================================================
            REQUESTER
        ===================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
              <User className="h-4 w-4 text-cyan-600" />
            </div>

            <div>
              <h3 className="text-[12px] font-bold text-slate-900">
                Requester Details
              </h3>

              <p className="text-[9px] text-slate-400">
                Person who created this request
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <DetailRow
              icon={<User className="h-3.5 w-3.5" />}
              label="Name"
              value={request.requester_name}
            />

            <DetailRow
              icon={<Users className="h-3.5 w-3.5" />}
              label="Requester Type"
              value={request.requester_type}
            />

            {request.requester_mobile && (
              <a
                href={`tel:${request.requester_mobile}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />

                  <span className="text-[10px] text-slate-500">
                    Mobile
                  </span>
                </div>

                <span className="text-[10px] font-semibold text-slate-800">
                  {request.requester_mobile}
                </span>
              </a>
            )}

            {request.requester_email && (
              <a
                href={`mailto:${request.requester_email}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />

                  <span className="text-[10px] text-slate-500">
                    Email
                  </span>
                </div>

                <span className="truncate text-[10px] font-semibold text-slate-800">
                  {request.requester_email}
                </span>
              </a>
            )}
          </div>
        </section>

        {/* =====================================================
            COMPANY DETAILS
        ===================================================== */}

        {(request.company_name ||
          request.gstin ||
          request.requester_address) && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                <Building2 className="h-4 w-4 text-orange-600" />
              </div>

              <div>
                <h3 className="text-[12px] font-bold text-slate-900">
                  Company Details
                </h3>

                <p className="text-[9px] text-slate-400">
                  Business information
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <DetailRow
                label="Company"
                value={request.company_name}
              />

              <DetailRow
                label="GSTIN"
                value={request.gstin}
              />

              <DetailRow
                label="Address"
                value={request.requester_address}
              />
            </div>
          </section>
        )}

        {/* =====================================================
            CREATED INFO
        ===================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />

              <div>
                <p className="text-[11px] font-bold text-slate-900">
                  Workkerz Trust
                </p>

                <p className="text-[9px] text-slate-400">
                  Request securely recorded
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-700">
              VERIFIED REQUEST
            </span>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[9px] text-slate-400">
              Created
            </p>

            <p className="mt-0.5 text-[10px] font-semibold text-slate-700">
              {formatDateTime(request.created_at)}
            </p>
          </div>
        </section>

        {/* =====================================================
            BACK BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-700 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Worker Requests
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}

        <span className="text-[8px]">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-[10px] font-semibold text-slate-800">
        {value || "Not specified"}
      </p>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        {icon && (
          <span className="shrink-0 text-slate-400">
            {icon}
          </span>
        )}

        <span className="shrink-0 text-[9px] text-slate-400">
          {label}
        </span>
      </div>

      <span className="max-w-[65%] text-right text-[10px] font-semibold leading-4 text-slate-700">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   TAG
========================================================= */

function Tag({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-white px-2 py-1 text-[8px] font-medium text-slate-600 shadow-sm">
      {text}
    </span>
  );
}