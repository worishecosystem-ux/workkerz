"use client";

import { Check, CheckCircle2, ClipboardCheck, PartyPopper, Sparkles, Users, X } from "lucide-react";

type Props = {
  requesterName: string;
  projectName: string;
  totalWorkers: number;
  requestId: string;
  onDone: () => void;
};

export default function WorkerRequestSuccess({
  requesterName,
  projectName,
  totalWorkers,
  requestId,
  onDone,
}: Props) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#f4fbf6] px-5 py-8 text-center"
    >
      <style jsx>{`
        @keyframes success-pop {
          0% { transform: scale(.35) rotate(-18deg); opacity: 0; }
          65% { transform: scale(1.12) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes success-draw {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes success-rise {
          from { transform: translateY(18px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes success-confetti {
          0% { transform: translateY(-20px) rotate(0); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(240px) rotate(260deg); opacity: 0; }
        }
        .success-pop { animation: success-pop .65s cubic-bezier(.2,.9,.3,1.3) both; }
        .success-draw { stroke-dasharray: 60; stroke-dashoffset: 60; animation: success-draw .45s .45s ease-out forwards; }
        .success-rise { animation: success-rise .55s .25s ease-out both; }
        .confetti { position:absolute; top:-12px; width:8px; height:13px; border-radius:3px; animation:success-confetti 2.4s ease-in both; }
        @media (prefers-reduced-motion: reduce) {
          .success-pop,.success-draw,.success-rise,.confetti { animation:none !important; stroke-dashoffset:0; }
        }
      `}</style>

      {/* Celebration particles */}
      {[
        ["8%", "#10b981", ".1s"], ["18%", "#f59e0b", ".5s"],
        ["29%", "#34d399", ".2s"], ["43%", "#60a5fa", ".8s"],
        ["57%", "#fbbf24", ".3s"], ["70%", "#10b981", ".7s"],
        ["83%", "#fb7185", ".15s"], ["93%", "#34d399", ".6s"],
      ].map(([left, color, delay], index) => (
        <span key={index} className="confetti" style={{ left, backgroundColor: color, animationDelay: delay }} />
      ))}

      <button
        type="button"
        onClick={onDone}
        aria-label="Close success screen"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50"
      >
        <X size={18} />
      </button>

      <div className="relative mb-7 mt-3">
        <div className="absolute inset-0 scale-150 rounded-full bg-emerald-200/50 blur-2xl" />
        <div className="success-pop relative flex h-28 w-28 items-center justify-center rounded-full border-[7px] border-white bg-gradient-to-br from-emerald-500 to-green-700 shadow-[0_15px_45px_rgba(5,150,105,.3)]">
          <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden="true">
            <path className="success-draw" d="M16 33L27 44L49 21" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="absolute -right-3 -top-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#f4fbf6] bg-amber-400 text-white">
          <Sparkles size={15} />
        </span>
      </div>

      <div className="success-rise w-full max-w-md">
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-emerald-800">
          <PartyPopper size={13} /> Request submitted
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
          Thank You{requesterName ? `, ${requesterName.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-2 text-sm font-semibold text-gray-700">Your Worker Request has been submitted successfully.</p>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-gray-500">
          Our team will review your requirement and work on connecting you with suitable workers.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white text-left shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Request summary</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">FREE · ₹0</span>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><ClipboardCheck size={17} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400">Project</p>
                <p className="truncate text-sm font-extrabold text-gray-900">{projectName || "Worker Request"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><Users size={17} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400">Workers requested</p>
                <p className="text-sm font-extrabold text-gray-900">{totalWorkers} worker{totalWorkers === 1 ? "" : "s"}</p>
              </div>
            </div>
            {requestId && (
              <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Request ID</p>
                <p className="mt-1 break-all font-mono text-xs font-bold text-gray-700">{requestId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-left">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-700" />
          <p className="text-[11px] leading-5 text-blue-900">You do not need to make any payment for submitting this request. Keep your request ID for future reference.</p>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-green-500 px-5 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition hover:brightness-105 active:scale-[.99]"
        >
          Done <Check size={17} />
        </button>
        <p className="mt-3 text-[9px] text-gray-400">This screen will close automatically in a few seconds.</p>
      </div>
    </section>
  );
}
