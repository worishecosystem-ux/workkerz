"use client";

import {
  MapPin,
  ChevronRight,
  Home,
  Building2,
  Navigation,
  CheckCircle2,
} from "lucide-react";

interface Address {
  id: string;
  customer_name?: string;
  phone?: string;
  house_no?: string;
  address?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  address_type?: string;
  is_default?: boolean;
}

interface BookingAddressCardProps {
  address: Address | null;
  loading?: boolean;
  onChange: () => void;
  onAdd: () => void;
}

export default function BookingAddressCard({
  address,
  loading,
  onChange,
  onAdd,
}: BookingAddressCardProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white/5 p-5 animate-pulse">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10" />
          <div className="flex-1 space-y-3">
            <div className="h-4 rounded bg-black/10 w-32" />
            <div className="h-3 rounded bg-black/10 w-full" />
            <div className="h-3 rounded bg-black/10 w-4/5" />
            <div className="h-3 rounded bg-black/10 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="rounded-3xl border border-dashed border-black/15 bg-linear-to-br from-black/5 to-black/2 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5C39]/15 flex items-center justify-center">
            <MapPin className="w-7 h-7 text-[#FF7A59]" />
          </div>

          <div className="flex-1">
            <h3 className="text-black font-semibold">Service Address</h3>

            <p className="text-sm text-white/55 mt-1">
              Add your delivery/service location
            </p>
          </div>

          <button
            onClick={onAdd}
            className="rounded-2xl bg-[#FF5C39] px-5 py-3 text-sm font-semibold text-black active:scale-95 transition"
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-black/10 bg-linear-to-br from-black/10 via-black/5 to-transparent backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        {/* Address Icon */}
        <div className="h-8 w-8 shrink-0 rounded-xl bg-[#FF5C39]/15 flex items-center justify-center">
          {address.address_type === "office" ? (
            <Building2 className="h-5 w-5 text-sky-400" />
          ) : (
            <Home className="h-5 w-5 text-[#FF7A59]" />
          )}
        </div>

        {/* Name + Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold text-black truncate">
              {address.customer_name}
            </h3>

            {address.is_default && (
              <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Default
              </span>
            )}
          </div>

          {address.phone && (
            <p className="mt-1 text-xs text-white/55 truncate">
              {address.phone}
            </p>
          )}
        </div>

        {/* Change Button */}
        <button
          onClick={onChange}
          className="shrink-0 flex items-center gap-1.5 rounded-sm border border-black/10 bg-black/5 px-3 py-2 text-xs font-medium text-black hover:bg-black/10 transition active:scale-95"
        >
          Change
          <ChevronRight className="h-3.5 w-3.5 text-black/70" />
        </button>
      </div>

      {/* Address */}
      <div className="border-t border-black/10 px-5 py-4">
        <div className="flex items-start gap-3">
          <Navigation className="w-5 h-5 text-[#FF7A59] mt-1 shrink-0" />

          <div className="text-sm text-black/80 leading-6">
            {address.house_no && <div>{address.house_no}</div>}

            {address.address && <div>{address.address}</div>}

            {address.landmark && (
              <div className="text-black/60">Landmark: {address.landmark}</div>
            )}

            <div>
              {[address.city, address.district, address.state, address.pincode]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
