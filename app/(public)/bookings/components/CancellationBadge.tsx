import { ShieldCheck } from "lucide-react";
import type { CancellationRequest } from "./types";

export default function CancellationBadge({ request }: { request?: CancellationRequest }) {
  if (!request) return null;
  const status = String(request.status ?? "pending").toLowerCase();
  const refund = String(request.refund_status ?? "").toLowerCase();
  const rejected = ["rejected", "declined"].includes(status);
  const approved = ["approved", "accepted", "cancelled", "canceled"].includes(status);
  const refunded = ["processed", "completed", "success", "refunded"].includes(refund);
  const label = rejected ? "Cancellation rejected" : refunded ? "Refund processed" : approved ? "Cancellation approved" : ["processing", "initiated"].includes(refund) ? "Refund processing" : "Cancellation pending";
  const color = rejected ? "border-red-200 bg-red-50 text-red-700" : approved ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800";
  const reason = request.cancellation_reason || request.reason;
  return <div className={`mt-3 flex min-w-0 items-start gap-2 rounded-lg border px-3 py-2 ${color}`}><ShieldCheck size={15} className="mt-0.5 shrink-0" /><div className="min-w-0 flex-1"><p className="text-[11px] font-bold">{label}</p>{reason && <p className="mt-0.5 truncate text-[10px] opacity-80" title={reason}>Reason: {reason}</p>}<p className="mt-0.5 text-[10px] opacity-75">{request.requested_at ? new Date(request.requested_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Request submitted"}{request.refund_status ? ` · Refund: ${request.refund_status}` : ""}</p></div></div>;
}
