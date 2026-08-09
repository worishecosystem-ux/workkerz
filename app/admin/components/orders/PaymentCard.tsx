"use client";

import {
  CreditCard,
  Receipt,
  Truck,
  Wallet,
} from "lucide-react";

type Props = {
  order: any;
  onStatusChange?: (id: string, status: string) => void;
  onPaymentStatusChange?: (id: string, status: string) => void;
};

const statusStyle = (status: string) => {
  switch (status) {
    case "Paid":
      return "text-emerald-700 bg-emerald-50";

    case "Pending":
      return "text-amber-700 bg-amber-50";

    case "Failed":
      return "text-red-700 bg-red-50";

    case "Refunded":
      return "text-blue-700 bg-blue-50";

    default:
      return "text-slate-700 bg-slate-50";
  }
};

function Item({
  icon,
  label,
  value,
  valueClass = "text-slate-900",
  iconClass = "text-slate-500",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  iconClass?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400 sm:text-[9px]">
          {label}
        </p>

        <div
          className={`mt-0.5 whitespace-nowrap text-[11px] font-bold sm:text-xs ${valueClass}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCard({ order }: Props) {
  const paymentStatus = order.payment_status || "Pending";

  return (
    <section className="w-full rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm sm:p-3">
      {/* HEADER */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
          <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-900 sm:text-sm">
            Payment Summary
          </h3>

          <p className="text-[9px] text-slate-400">
            Order payment details
          </p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        <Item
          icon={<CreditCard className="h-3.5 w-3.5" />}
          iconClass="text-blue-600"
          label="Method"
          value={order.payment_method || "COD"}
        />

        <Item
          icon={<Wallet className="h-3.5 w-3.5" />}
          iconClass="text-orange-600"
          label="Status"
          value={
            <span
              className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] ${statusStyle(
                paymentStatus
              )}`}
            >
              {paymentStatus}
            </span>
          }
        />

        <Item
          icon={<Receipt className="h-3.5 w-3.5" />}
          iconClass="text-red-600"
          label="Items"
          value={`₹${Number(order.subtotal || 0).toLocaleString("en-IN")}`}
        />

        <Item
          icon={<Truck className="h-3.5 w-3.5" />}
          iconClass="text-violet-600"
          label="Delivery"
          value={`₹${Number(order.delivery || 0).toLocaleString("en-IN")}`}
        />

        <Item
          icon={<Wallet className="h-3.5 w-3.5" />}
          iconClass="text-emerald-600"
          label="Total"
          value={`₹${Number(order.total || 0).toLocaleString("en-IN")}`}
          valueClass="text-emerald-700"
        />
      </div>
    </section>
  );
}