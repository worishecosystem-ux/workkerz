"use client";

import { Clock3, MapPin, Navigation } from "lucide-react";

type Props = {
  order: any;
};

export default function AddressCard({ order }: Props) {
  return (
    <section className="w-full rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
      {/* HEADER */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
          <MapPin className="h-4 w-4 text-emerald-600" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">Delivery Address</h3>

          <p className="text-[10px] text-slate-400">
            Customer delivery details
          </p>
        </div>
      </div>

      {/* ADDRESS */}
      <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">
              Address
            </p>

            <p className="mt-1 break-words text-xs font-semibold leading-relaxed text-slate-900">
              {order.address || "Address not available"}
            </p>
          </div>
        </div>
      </div>

      {/* LOCATION */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <InfoItem
          icon={<Navigation className="h-3.5 w-3.5" />}
          label="City"
          value={order.city || "-"}
        />

        <InfoItem
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Pincode"
          value={order.pincode || "-"}
        />
      </div>

      {/* DELIVERY */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <InfoItem
          label="Delivery Option"
          value={order.delivery_option || "Standard"}
        />

        <InfoItem
          icon={<Clock3 className="h-3.5 w-3.5" />}
          label="Delivery Slot"
          value={order.delivery_slot || "-"}
        />
      </div>
    </section>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2">
      <div className="flex items-center gap-1">
        {icon && <span className="text-slate-400">{icon}</span>}

        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-1 break-words text-[10px] font-semibold leading-tight text-slate-800 sm:text-xs">
        {value}
      </p>
    </div>
  );
}
