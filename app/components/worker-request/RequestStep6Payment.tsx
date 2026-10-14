"use client";

import { CalendarDays, CheckCircle2, Clock3, CreditCard, MapPin, ShieldCheck, Users } from "lucide-react";
import type { WorkerGroup } from "@/app/components/ProjectWorkerGroups";

type Props = {
  requesterName: string;
  requesterMobile: string;
  requesterEmail: string;
  projectName: string;
  projectType: string;
  workerGroups: WorkerGroup[];
  requestLocation: string;
  fullAddress: string;
  workDate: string;
  startTime: string;
  duration: string;
  budget: string;
  requirement: string;
};

export default function RequestStep6Payment({
  requesterName, requesterMobile, requesterEmail, projectName, projectType,
  workerGroups, requestLocation, fullAddress, workDate, startTime, duration,
  budget, requirement,
}: Props) {
  const totalWorkers = workerGroups.reduce((sum, group) => sum + Math.max(1, Number(group.workers_required) || 1), 0);
  const workerSummary = workerGroups.map((group) => `${group.category} × ${Math.max(1, Number(group.workers_required) || 1)}`).join(", ");
  const formattedDate = workDate ? new Date(`${workDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not selected";

  return (
    <section className="mx-auto max-w-3xl space-y-4 pb-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-emerald-700 to-green-500 px-4 py-4 text-white sm:px-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">Step 6 · Secure payment</p>
          <h1 className="mt-1 text-xl font-black">Review & pay</h1>
          <p className="mt-1 text-xs text-white/85">Pay the one-time ₹49 Worker Request charge to submit your request.</p>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-900">Worker Request Booking Charge</p>
                <p className="mt-1 text-[11px] leading-5 text-emerald-800">This is the request/booking charge, not the full cost of worker services.</p>
              </div>
              <p className="shrink-0 text-2xl font-black text-emerald-800">₹49</p>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-emerald-200 pt-3 text-[11px] font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4 shrink-0" /> Secure payment through Razorpay
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 text-gray-500"><Users className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">Workers</span></div>
              <p className="mt-1 text-sm font-black text-gray-900">{totalWorkers} worker{totalWorkers === 1 ? "" : "s"}</p>
              <p className="mt-1 text-xs text-gray-600">{workerSummary}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-2 text-gray-500"><CalendarDays className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">Work schedule</span></div>
              <p className="mt-1 text-sm font-black text-gray-900">{formattedDate}</p>
              <p className="mt-1 text-xs text-gray-600">{startTime || "Time to be confirmed"} · {duration}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-3 sm:col-span-2">
              <div className="flex items-center gap-2 text-gray-500"><MapPin className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">Project & location</span></div>
              <p className="mt-1 text-sm font-black text-gray-900">{projectName} <span className="font-medium text-gray-500">· {projectType}</span></p>
              <p className="mt-1 text-xs leading-5 text-gray-600">{requestLocation}{fullAddress ? `, ${fullAddress}` : ""}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-gray-500">Requester</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{requesterName}</p>
            <p className="text-xs text-gray-600">{requesterMobile}{requesterEmail ? ` · ${requesterEmail}` : ""}</p>
            {budget ? <p className="mt-2 text-xs text-gray-600">Estimated budget: ₹{Number(budget).toLocaleString("en-IN")}</p> : null}
            {requirement ? <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-gray-600">{requirement}</p> : null}
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
              <div>
                <p className="text-xs font-black text-blue-900">Cancellation & refund information</p>
                <p className="mt-1 text-[11px] leading-5 text-blue-900">You may submit a cancellation/refund request with a valid reason within 5 hours of request creation. Refund eligibility and any applicable deductions are subject to the Workkerz cancellation and refund policy and admin review.</p>
                <p className="mt-1 text-[11px] leading-5 text-blue-900">If Workkerz cannot arrange the requested workers, Workkerz may cancel the request and initiate the applicable refund.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-[10px] leading-5 text-gray-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Your request is submitted only after Razorpay payment verification succeeds. If you cancel checkout, the request will not be submitted.
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-gray-400"><CreditCard className="h-3.5 w-3.5" /> UPI · Cards · Net Banking · Wallets</div>
        </div>
      </div>
    </section>
  );
}
