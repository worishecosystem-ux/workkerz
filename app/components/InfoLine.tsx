import type { ReactNode } from "react";

export default function InfoLine({ label, value, icon }: { label: string; value?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2 border-b border-gray-100 py-2 last:border-0">
      {icon && <span className="mt-0.5 shrink-0 text-emerald-700">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <div className="mt-0.5 break-words text-xs font-semibold leading-4 text-gray-800">{value || "Not available"}</div>
      </div>
    </div>
  );
}
