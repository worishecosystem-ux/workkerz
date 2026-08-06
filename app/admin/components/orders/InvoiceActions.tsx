"use client";

import { Printer, Download } from "lucide-react";

type Props = {
  order: any;
  onPrint: () => void;
};

export default function InvoiceActions({ order, onPrint }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrint}
        className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <Printer className="h-4 w-4" />
        <span className="hidden sm:block">Print</span>
      </button>

      <button
        className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:block">PDF</span>
      </button>

      <div className="hidden lg:block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        #{order.order_number}
      </div>
    </div>
  );
}