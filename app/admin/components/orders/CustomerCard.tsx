"use client";

import { Mail, Phone, User } from "lucide-react";

type Props = {
  order: any;
};

export default function CustomerCard({ order }: Props) {
  return (
    <section className="w-full rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
      {/* HEADER */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <User className="h-4 w-4 text-blue-600" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Customer Details
          </h3>

          <p className="text-[10px] text-slate-400">
            Customer contact information
          </p>
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <InfoItem
          icon={<User className="h-3.5 w-3.5" />}
          label="Customer Name"
          value={order.customer_name || "-"}
          iconClass="text-blue-600"
        />

        <InfoItem
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Phone"
          value={
            order.customer_phone ? (
              <a
                href={`tel:${order.customer_phone}`}
                className="hover:text-blue-600"
              >
                {order.customer_phone}
              </a>
            ) : (
              "-"
            )
          }
          iconClass="text-green-600"
        />

        <InfoItem
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Email"
          value={order.customer_email || "No Email"}
          iconClass="text-purple-600"
        />
      </div>
    </section>
  );
}

function InfoItem({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <span className={iconClass}>{icon}</span>

        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <div className="mt-1 wrap-break-word text-[11px] font-semibold leading-tight text-slate-800 sm:text-xs">
        {value}
      </div>
    </div>
  );
}