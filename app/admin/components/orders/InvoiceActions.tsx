"use client";

import { Download, FileText } from "lucide-react";

type Props = {
  order: any;
  onPrint: () => void;
};

export default function InvoiceActions({
  order,
  onPrint,
}: Props) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {/* PRINT / PDF */}
      <button
        type="button"
        onClick={onPrint}
        aria-label="Print invoice"
        className="
          flex
          h-8
          shrink-0
          items-center
          gap-1.5
          rounded-lg
          border
          border-slate-200
          bg-white
          px-2.5
          text-[10px]
          font-semibold
          text-slate-700
          transition
          hover:border-slate-300
          hover:bg-slate-50
          active:scale-95
          sm:h-9
          sm:px-3
          sm:text-xs
        "
      >
        <Download className="h-3.5 w-3.5 shrink-0" />

        <span className="hidden xs:inline sm:inline">
          PDF
        </span>

        <span className="sm:hidden">
          Print
        </span>
      </button>

      {/* ORDER NUMBER */}
      <div
        className="
          flex
          min-w-0
          max-w-[110px]
          items-center
          gap-1.5
          rounded-lg
          bg-slate-100
          px-2
          py-1.5
          text-[9px]
          font-bold
          text-slate-600
          sm:max-w-[150px]
          sm:px-2.5
          sm:text-[10px]
        "
      >
        <FileText className="h-3 w-3 shrink-0 text-slate-400" />

        <span className="truncate">
          #{order?.order_number || "-"}
        </span>
      </div>
    </div>
  );
}