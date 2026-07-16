"use client";

import { MapPin, ChevronRight, Plus } from "lucide-react";

interface WorkLocationCardProps {
  loading: boolean;
  address: string;
  onEdit: () => void;
}

export default function WorkLocationCard({
  loading,
  address,
  onEdit,
}: WorkLocationCardProps) {
  const hasAddress = address.trim().length > 0;

  return (
    <button
      onClick={onEdit}
      className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-orange-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              hasAddress
                ? "bg-orange-100"
                : "bg-slate-100 border border-dashed border-slate-300"
            }`}
          >
            {hasAddress ? (
              <MapPin className="w-5 h-5 text-orange-500" />
            ) : (
              <Plus className="w-5 h-5 text-slate-500" />
            )}
          </div>

          <div className="text-left min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Work Location
            </p>

            {loading ? (
              <p className="text-sm text-slate-500 mt-1">
                Loading...
              </p>
            ) : hasAddress ? (
              <>
                <p className="font-semibold text-slate-900 truncate">
                  {address}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Tap to change location
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-orange-600">
                  Select Your Work Location
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Choose a saved address or add a new one
                </p>
              </>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
      </div>
    </button>
  );
}