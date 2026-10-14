
"use client";

import { Building2, FileCheck2, Copy, Check } from "lucide-react";
import { useState } from "react";

import type { WorkerRequest } from "./types";

interface CompanyDetailsProps {
  request: WorkerRequest;
}

interface CompanyItemProps {
  icon: typeof Building2;
  label: string;
  value: string;
}

function CompanyItem({
  icon: Icon,
  label,
  value,
}: CompanyItemProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <Icon
          className="h-5 w-5 text-indigo-600"
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function CompanyDetails({
  request,
}: CompanyDetailsProps) {
  const [copied, setCopied] = useState(false);

  const companyName = request.company_name?.trim() || "";
  const gstin = request.gstin?.trim() || "";

  const hasCompanyDetails = Boolean(companyName || gstin);

  const copyCompanyDetails = async () => {
    const text = [
      companyName ? `Company Name: ${companyName}` : "",
      gstin ? `GSTIN: ${gstin}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Building2
              className="h-5 w-5 text-indigo-600"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Company Details
            </h2>

            <p className="text-sm text-gray-500">
              Business information provided by the requester
            </p>
          </div>
        </div>

        {hasCompanyDetails && (
          <button
            type="button"
            onClick={copyCompanyDetails}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}

            {copied ? "Copied" : "Copy Details"}
          </button>
        )}
      </div>

      {!hasCompanyDetails ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-7 text-center">
          <Building2 className="mx-auto h-8 w-8 text-gray-400" />

          <p className="mt-3 text-sm font-medium text-gray-700">
            No company details available
          </p>

          <p className="mt-1 text-xs text-gray-500">
            The requester has not provided company information.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CompanyItem
            icon={Building2}
            label="Company Name"
            value={companyName || "Not provided"}
          />

          <CompanyItem
            icon={FileCheck2}
            label="GSTIN"
            value={gstin || "Not provided"}
          />
        </div>
      )}
    </section>
  );
}
