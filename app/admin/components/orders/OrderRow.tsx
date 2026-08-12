"use client";

import { Eye, Phone, Printer, User } from "lucide-react";
import StatusBadge from "./StatusBadge";

type Props = {
  order: any;
  onView: (order: any) => void;
  highlight: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function OrderRow({
  order,
  onView,
  highlight,
  selected,
  onSelect,
}: Props) {
  const canSelect = !["Delivered", "Cancelled", "Out For Delivery"].includes(
    order.status,
  );

  const date = order.created_at ? new Date(order.created_at) : null;

  return (
    <tr
      className={`border-b border-slate-100 transition ${
        selected
          ? "bg-blue-50"
          : highlight
            ? "animate-pulse bg-yellow-50"
            : "hover:bg-slate-50"
      }`}
    >
      {/* SELECT */}
      <td className="w-10 px-2 py-2.5 text-center">
        {canSelect ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(String(order.id))}
            className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-orange-600 focus:ring-orange-500"
          />
        ) : (
          <span
            title="This order cannot be selected"
            className="text-[9px] text-slate-300"
          >
            Lock
          </span>
        )}
      </td>

      {/* ORDER */}
      <td className="px-2.5 py-2.5 sm:px-3">
        <div className="min-w-[90px]">
          <p className="text-[11px] font-bold text-slate-900 sm:text-xs">
            {order.order_number || "-"}
          </p>

          <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[8px] text-slate-500">
            #{String(order.id ?? "").slice(0, 8)}
          </span>
        </div>
      </td>

      {/* CUSTOMER */}
      <td className="px-2.5 py-2.5 sm:px-3">
        <div className="flex min-w-[150px] items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <User className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0">
            <p className="whitespace-nowrap text-[11px] font-semibold text-slate-900 sm:text-xs">
              {order.customer_name || "Unknown Customer"}
            </p>

            <p className="whitespace-nowrap text-[9px] text-slate-400">
              {order.customer_email || "No Email"}
            </p>
          </div>
        </div>
      </td>

      {/* PHONE */}
      <td className="px-2.5 py-2.5 sm:px-3">
        {order.customer_phone ? (
          <a
            href={`tel:${order.customer_phone}`}
            className="flex w-fit items-center gap-1 whitespace-nowrap text-[10px] font-medium text-slate-600 hover:text-orange-600 sm:text-xs"
          >
            <Phone className="h-3 w-3 text-slate-400" />
            {order.customer_phone}
          </a>
        ) : (
          <span className="text-[10px] text-slate-400">No Phone</span>
        )}
      </td>

      {/* AMOUNT */}
      <td className="px-2.5 py-2.5 sm:px-3">
        <span className="whitespace-nowrap rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700 sm:text-xs">
          ₹{Number(order.total || 0).toLocaleString("en-IN")}
        </span>
      </td>

      {/* STATUS */}
      <td className="px-2.5 py-2.5 sm:px-3">
        <div className="w-max">
          <StatusBadge status={order.status} />
        </div>
      </td>

      {/* DATE */}
      <td className="px-2.5 py-2.5 sm:px-3">
        {date ? (
          <div className="whitespace-nowrap">
            <p className="text-[10px] font-medium text-slate-700 sm:text-xs">
              {date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>

            <p className="text-[9px] text-slate-400">
              {date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400">-</span>
        )}
      </td>

      {/* ACTIONS */}
      <td className="px-2.5 py-2.5 sm:px-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onView(order)}
            title="View Order"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <a
            href={
              order.customer_phone ? `tel:${order.customer_phone}` : undefined
            }
            title="Call Customer"
            className={`flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-600 hover:text-white ${
              !order.customer_phone ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            title="Print Invoice"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-700 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
