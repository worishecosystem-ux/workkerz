"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";

type Props = {
  order: any;
  onStatusChange: (id: string, status: string) => void;
};

export default function OrderActions({ order, onStatusChange }: Props) {
  const [copied, setCopied] = useState("");

  const copy = async (text: string, type: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);

      setTimeout(() => setCopied(""), 1500);
    } catch {
      console.error("Copy failed");
    }
  };

  const phone = order?.customer_phone || "";
  const address = [order?.address, order?.city, order?.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="w-full rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm sm:p-3">
      {/* HEADER */}
      <div className="mb-2.5">
        <h3 className="text-xs font-bold text-slate-900 sm:text-sm">
          Order Actions
        </h3>

        <p className="text-[9px] text-slate-400">
          Quick actions for this order
        </p>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {/* CALL */}
        <button
          type="button"
          disabled={!phone}
          onClick={() => {
            if (phone) window.location.href = `tel:${phone}`;
          }}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:text-xs"
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </button>

        {/* COPY ORDER */}
        <button
          type="button"
          onClick={() => copy(order?.order_number || "", "order")}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:h-10 sm:text-xs"
        >
          {copied === "order" ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}

          {copied === "order" ? "Copied" : "Copy Order"}
        </button>

        {/* COPY ADDRESS */}
        <button
          type="button"
          disabled={!address}
          onClick={() => copy(address, "address")}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:text-xs"
        >
          {copied === "address" ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <MapPin className="h-3.5 w-3.5" />
          )}

          {copied === "address" ? "Copied" : "Copy Address"}
        </button>

        {/* DELIVER */}
        <button
          type="button"
          onClick={() => onStatusChange(order.id, "Delivered")}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2 text-[10px] font-bold text-white transition hover:bg-emerald-700 sm:h-10 sm:text-xs"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Deliver
        </button>

        {/* CANCEL */}
        <button
          type="button"
          onClick={() => onStatusChange(order.id, "Cancelled")}
          className="col-span-2 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600 transition hover:bg-red-100 sm:col-span-4 sm:h-10 sm:text-xs"
        >
          <XCircle className="h-3.5 w-3.5" />
          Cancel Order
        </button>
      </div>
    </section>
  );
}
