"use client";

import { Mail, MapPin, Phone, Printer, User, X } from "lucide-react";

import StatusBadge from "./StatusBadge";
import OrderStatusTimeline from "./OrderStatusSelect";
import PaymentStatusSelect from "./PaymentStatusSelect";

type Props = {
  order: any;
  onClose: () => void;
  onPrint: () => void;
  onStatusChange: (id: string, status: string) => void;
  onPaymentStatusChange: (id: string, status: string) => void;
  paymentSummary?: React.ReactNode;
};

export default function OrderHeader({
  order,
  onClose,
  onPrint,
  onStatusChange,
  onPaymentStatusChange,
  paymentSummary,
}: Props) {
  return (
    <header className="w-full bg-white">
      {/* TOP */}
      <div className="px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-start justify-between gap-3">
          {/* ORDER INFO */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="max-w-37.5 truncate text-sm font-extrabold text-slate-900 sm:max-w-none sm:text-base">
                #{order.order_number || "-"}
              </h1>

              <StatusBadge status={order.status || "Pending"} />

              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700 sm:text-xs">
                ₹{Number(order.total || 0).toLocaleString("en-IN")}
              </span>
            </div>

            {/* CUSTOMER */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              {order.customer_name && (
                <div className="flex min-w-0 max-w-full items-center gap-1">
                  <User className="h-3 w-3 shrink-0 text-slate-400" />

                  <span className="max-w-32.5 truncate text-[10px] font-medium text-slate-600 sm:max-w-45 sm:text-xs">
                    {order.customer_name}
                  </span>
                </div>
              )}

              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="flex items-center gap-1 text-[10px] font-medium text-slate-600 hover:text-blue-600 sm:text-xs"
                >
                  <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                  {order.customer_phone}
                </a>
              )}

              {order.customer_email && (
                <div className="hidden min-w-0 items-center gap-1 md:flex">
                  <Mail className="h-3 w-3 shrink-0 text-slate-400" />

                  <span className="max-w-55 truncate text-xs text-slate-500">
                    {order.customer_email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex shrink-0 items-center gap-1">
            <PaymentStatusSelect
              value={order.payment_status || "Pending"}
              onChange={(status) => onPaymentStatusChange(order.id, status)}
            />

            <button
              type="button"
              onClick={onPrint}
              aria-label="Print invoice"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95 sm:h-9 sm:w-9"
            >
              <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close order"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600 active:scale-95 sm:h-9 sm:w-9"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* STATUS TIMELINE */}
      <div className="border-y border-slate-100 bg-slate-50">
        <div className="overflow-x-auto px-2 py-2 scrollbar-none [&::-webkit-scrollbar]:hidden sm:px-4">
          <OrderStatusTimeline
            value={order.status || "Pending"}
            onChange={(status) => onStatusChange(order.id, status)}
          />
        </div>
      </div>

      {/* ADDRESS */}
      <div className="border-t border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">
                Delivery Address
              </p>

              <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-blue-700 sm:text-[9px]">
                {order.delivery_option || "Standard"}
              </span>
            </div>

            <p className="mt-1 wrap-break-word text-[10px] font-semibold leading-[1.45] text-slate-800 sm:text-xs">
              {order.address || "Address not available"}
              {order.city && `, ${order.city}`}
              {order.pincode && ` • ${order.pincode}`}
            </p>

            {order.delivery_slot && (
              <div className="mt-1.5">
                <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[8px] font-bold text-purple-700 sm:text-[9px]">
                  {order.delivery_slot}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYMENT SUMMARY */}
      {paymentSummary && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 sm:px-4">
          {paymentSummary}
        </div>
      )}
    </header>
  );
}
