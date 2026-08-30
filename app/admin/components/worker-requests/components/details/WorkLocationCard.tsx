"use client";

import {
  ExternalLink,
  MapPin,
} from "lucide-react";

import type { WorkerRequest } from "../../types";

import {
  getWorkAddress,
  getLocationLabel,
} from "../../utils/requestHelpers";

type Props = {
  request: WorkerRequest;

  compact?: boolean;
};

export default function WorkLocationCard({
  request,
  compact = false,
}: Props) {
  const address =
    getWorkAddress(request);

  const location =
    getLocationLabel(request);

  const mapQuery = encodeURIComponent(
    address,
  );

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm md:p-4">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5C39]">
            <MapPin className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-black text-[#172033] md:text-sm">
              Work Location
            </h3>

            <p className="mt-0.5 truncate text-[9px] font-medium text-[#94A3B8]">
              Where the work needs to be done
            </p>
          </div>
        </div>

        {location && (
          <span className="max-w-[40%] truncate rounded-full bg-orange-50 px-2 py-1 text-[8px] font-black text-[#FF5C39]">
            {location}
          </span>
        )}
      </div>

      {/* =================================================
          ADDRESS
      ================================================= */}

      <div className="mt-3 rounded-xl bg-[#F8FAFC] p-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF5C39]" />

          <p className="break-words text-xs font-medium leading-5 text-[#475569]">
            {address}
          </p>
        </div>
      </div>

      {/* =================================================
          LOCATION DETAILS
      ================================================= */}

      {(request.locality ||
        request.district ||
        request.state ||
        request.pincode) && (
        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-x-3
            gap-y-3
            sm:grid-cols-4
          "
        >
          {request.locality && (
            <LocationItem
              label="Locality"
              value={
                request.locality
              }
            />
          )}

          {request.district && (
            <LocationItem
              label="District"
              value={
                request.district
              }
            />
          )}

          {request.state && (
            <LocationItem
              label="State"
              value={request.state}
            />
          )}

          {request.pincode && (
            <LocationItem
              label="Pincode"
              value={
                request.pincode
              }
            />
          )}
        </div>
      )}

      {/* =================================================
          MAP ACTION
      ================================================= */}

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          mt-3
          flex
          w-full
          items-center
          justify-center
          gap-1.5
          rounded-xl
          border
          border-gray-200
          bg-white
          py-2.5
          text-[10px]
          font-black
          text-[#475569]
          transition
          hover:border-orange-200
          hover:bg-orange-50
          hover:text-[#FF5C39]
        "
      >
        <MapPin className="h-3.5 w-3.5" />

        Open in Google Maps

        <ExternalLink className="h-3 w-3" />
      </a>
    </section>
  );
}

/* =========================================================
   LOCATION ITEM
========================================================= */

function LocationItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-black text-[#172033]">
        {value}
      </p>
    </div>
  );
}