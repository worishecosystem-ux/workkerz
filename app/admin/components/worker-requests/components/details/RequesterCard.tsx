"use client";

import {
  AtSign,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { WorkerRequest } from "../../types";

type Props = {
  request: WorkerRequest;

  compact?: boolean;
};

function RequesterItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-[#94A3B8]">
          {icon}
        </span>

        <span className="truncate text-[8px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-xs font-black text-[#172033]">
        {value || "—"}
      </p>
    </div>
  );
}

export default function RequesterCard({
  request,
  compact = false,
}: Props) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm md:p-4">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UserRound className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-black text-[#172033] md:text-sm">
              Requester Details
            </h3>

            <p className="mt-0.5 truncate text-[9px] font-medium text-[#94A3B8]">
              Customer information
            </p>
          </div>
        </div>

        {/* REQUESTER TYPE */}

        {request.requester_type && (
          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[8px] font-black capitalize text-blue-600">
            {request.requester_type}
          </span>
        )}
      </div>

      {/* =================================================
          BASIC DETAILS
      ================================================= */}

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-x-3
          gap-y-4
        "
      >
        <RequesterItem
          icon={
            <UserRound className="h-3 w-3" />
          }
          label="Name"
          value={
            request.requester_name ||
            "Customer"
          }
        />

        <RequesterItem
          icon={
            <Phone className="h-3 w-3" />
          }
          label="Mobile"
          value={
            request.requester_mobile ||
            "—"
          }
        />

        <RequesterItem
          icon={
            <Mail className="h-3 w-3" />
          }
          label="Email"
          value={
            request.requester_email ||
            "—"
          }
        />

        {request.company_name && (
          <RequesterItem
            icon={
              <Building2 className="h-3 w-3" />
            }
            label="Company"
            value={
              request.company_name
            }
          />
        )}

        {request.gstin && (
          <RequesterItem
            icon={
              <ShieldCheck className="h-3 w-3" />
            }
            label="GSTIN"
            value={request.gstin}
          />
        )}
      </div>

      {/* =================================================
          CONTACT QUICK ACTIONS
      ================================================= */}

      {(request.requester_mobile ||
        request.requester_email) && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
          {request.requester_mobile && (
            <a
              href={`tel:${request.requester_mobile}`}
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-1.5
                rounded-xl
                bg-emerald-50
                py-2.5
                text-[10px]
                font-black
                text-emerald-700
                transition
                hover:bg-emerald-100
              "
            >
              <Phone className="h-3.5 w-3.5" />

              Call Customer
            </a>
          )}

          {request.requester_email && (
            <a
              href={`mailto:${request.requester_email}`}
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-1.5
                rounded-xl
                bg-blue-50
                py-2.5
                text-[10px]
                font-black
                text-blue-700
                transition
                hover:bg-blue-100
              "
            >
              <AtSign className="h-3.5 w-3.5" />

              Email
            </a>
          )}
        </div>
      )}
    </section>
  );
}