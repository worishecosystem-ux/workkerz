"use client";

import {
  UserRound,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Copy,
  Check,
} from "lucide-react";

import { useState } from "react";
import type { WorkerRequest } from "./types";

interface RequesterDetailsProps {
  request: WorkerRequest;
}

interface RequesterItemProps {
  icon: typeof UserRound;
  label: string;
  value?: string | null;
}

function RequesterItem({ icon: Icon, label, value }: RequesterItemProps) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-green-100 bg-green-50/50 p-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-green-100">
        <Icon className="h-4 w-4 text-green-700" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-900">
          {value?.trim() || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function RequesterDetails({ request }: RequesterDetailsProps) {
  const [copied, setCopied] = useState(false);

  const mobile = request.requester_mobile?.trim() || "";
  const email = request.requester_email?.trim() || "";
  const requesterName = request.requester_name?.trim() || "";

  // Fixed WhatsApp number with India country code
  const whatsappNumber = `91${"7000543603"
    .replace(/\D/g, "")
    .replace(/^0+/, "")}`;

  const hasContactDetails = Boolean(requesterName || mobile || email);

  const copyContact = async () => {
    const contact = [
      requesterName ? `Name: ${requesterName}` : "",
      mobile ? `Mobile: ${mobile}` : "",
      email ? `Email: ${email}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!contact) return;

    try {
      await navigator.clipboard.writeText(contact);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="w-full min-w-0 rounded-xl border border-green-100 bg-white p-3 shadow-sm sm:p-4">
      {/* Header */}
      <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <UserRound className="h-4 w-4 text-green-700" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900">
              Requester Details
            </h2>

            <p className="text-[11px] leading-4 text-gray-500">
              Contact information
            </p>
          </div>
        </div>

        {hasContactDetails && (
          <button
            type="button"
            onClick={copyContact}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-green-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-green-800 transition hover:bg-green-50 active:scale-[0.98]"
            aria-label="Copy requester contact details"
          >
            {copied ? (
              <Check
                className="h-3.5 w-3.5 text-green-700"
                aria-hidden="true"
              />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}

            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {/* Requester Information */}
      <div className="grid grid-cols-2 gap-2">
        <RequesterItem
          icon={UserRound}
          label="Requester Name"
          value={request.requester_name}
        />

        <RequesterItem
          icon={UserCheck}
          label="Requester Type"
          value={request.requester_type}
        />

        <RequesterItem
          icon={Phone}
          label="Mobile Number"
          value={mobile || null}
        />

        <RequesterItem
          icon={Mail}
          label="Email Address"
          value={email || null}
        />

        <div className="col-span-2">
          <RequesterItem
            icon={MapPin}
            label="Requester Address"
            value={request.requester_address}
          />
        </div>
      </div>

      {/* Contact Actions */}
      <div className="mt-3 flex gap-2">
        {mobile && (
          <a
            href="tel:7000543603"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800 active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call Workkerz
          </a>
        )}

        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-100 active:scale-[0.98]"
        >
          WhatsApp
        </a>
      </div>
    </section>
  );
}
