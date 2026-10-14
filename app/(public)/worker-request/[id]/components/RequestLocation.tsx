
"use client";

import {
  MapPin,
  MapPinned,
  Building2,
  Map,
  ExternalLink,
} from "lucide-react";

import type { ElementType } from "react";
import type { WorkerRequest } from "./types";

interface RequestLocationProps {
  request: WorkerRequest;
}

interface LocationItemProps {
  icon: ElementType;
  label: string;
  value?: string | null;
}

function LocationItem({
  icon: Icon,
  label,
  value,
}: LocationItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-green-100 bg-green-50/50 p-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 ring-1 ring-green-100">
        <Icon size={16} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] leading-4 text-gray-500">
          {label}
        </p>
        <p className="break-words text-xs font-semibold leading-4 text-gray-900">
          {value?.trim() || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function RequestLocation({
  request,
}: RequestLocationProps) {
  const addressParts = [
    request.full_address,
    request.locality,
    request.district,
    request.state,
    request.pincode,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  const fullAddress = addressParts
    .filter((part, index, array) => array.indexOf(part) === index)
    .join(", ");

  const mapSearch = addressParts.join(", ");

  const mapUrl = mapSearch
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearch)}`
    : null;

  return (
    <section className="w-full min-w-0 rounded-xl border border-green-100 bg-white p-3 shadow-sm sm:p-4">

      {/* Compact Heading */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
          <MapPinned size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold leading-5 text-gray-900">
            Work Location
          </h2>
          <p className="text-[11px] leading-4 text-gray-500">
            Address and location details
          </p>
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-2 gap-2">
        <LocationItem
          icon={MapPin}
          label="Location"
          value={request.location}
        />

        <LocationItem
          icon={Building2}
          label="Locality"
          value={request.locality}
        />

        <LocationItem
          icon={Map}
          label="District"
          value={request.district}
        />

        <LocationItem
          icon={MapPinned}
          label="State"
          value={request.state}
        />
      </div>

      {/* Address Card */}
      <div className="mt-2 rounded-lg border border-green-100 bg-green-50/50 p-2.5">
        <p className="text-[10px] font-medium text-gray-500">
          FULL ADDRESS
        </p>

        <p className="mt-1 break-words text-xs font-medium leading-5 text-gray-800">
          {fullAddress || "Not provided"}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-green-100 pt-2">
          <p className="min-w-0 text-[11px] text-gray-600">
            <span className="font-semibold">PIN:</span>{" "}
            {request.pincode?.trim() || "Not provided"}
          </p>

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open work location in Google Maps"
              className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-green-700 px-2.5 py-1.5 text-[11px] font-semibold text-white transition active:bg-green-800"
            >
              <ExternalLink size={13} />
              Maps
            </a>
          )}
        </div>
      </div>
    </section>
  );
}