"use client";

import type { ReactNode } from "react";

import {
  X,
  User,
  Phone,
  MapPin,
  Star,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Wrench,
  IndianRupee,
} from "lucide-react";

import type { Worker } from "@/app/data/workers";

type WorkerDrawerProps = {
  worker: Worker | null;
  onClose: () => void;
};

/* =====================================================
   WORKER COMPATIBILITY TYPE
===================================================== */

type WorkerWithLegacyFields =
  Worker & {
    labour_chauk?: string | null;
  };

/* =====================================================
   COMPONENT
===================================================== */

export default function WorkerDrawer({
  worker,
  onClose,
}: WorkerDrawerProps) {
  if (!worker) {
    return null;
  }

  /*
   * Support both:
   *
   * labourChauk
   *
   * and legacy/raw:
   *
   * labour_chauk
   */
  const workerData =
    worker as WorkerWithLegacyFields;

  // =====================================================
  // WORKER DATA
  // =====================================================

  const name =
    worker.name ||
    "Unnamed Worker";

  const phone =
    worker.phone ||
    "Not available";

  const category =
    worker.category ||
    "Not specified";

  const subcategory =
    worker.subcategory ||
    "Not specified";

  const specialty =
    worker.specialty ||
    "Not specified";

  const location =
    worker.location ||
    "Not specified";

  const labourChauk =
    worker.labourChauk ||
    workerData.labour_chauk ||
    "Not specified";

  const rating =
    Number(worker.rating || 0);

  const reviewCount =
    Number(worker.reviewCount || 0);

  const isActive =
    worker.available === true;

  const createdDate =
    worker.createdAt
      ? new Date(
          worker.createdAt,
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          },
        )
      : "—";

  // =====================================================
  // PRICING
  // =====================================================

  const startingPrice =
    Number(
      worker.startingPrice || 0,
    );

  const halfDayPrice =
    Number(
      worker.halfDayPrice || 0,
    );

  const fullDayPrice =
    Number(
      worker.fullDayPrice || 0,
    );

  const monthlyPrice =
    Number(
      worker.monthlyPrice || 0,
    );

  const visitCharge =
    Number(
      worker.visitCharge || 0,
    );

  return (
    <div className="fixed inset-0 z-50">

      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      <button
        type="button"
        aria-label="Close worker details"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      {/* ================================================= */}
      {/* DRAWER */}
      {/* ================================================= */}

      <aside className="absolute bottom-0 right-0 top-0 w-[460px] max-w-full overflow-y-auto bg-white shadow-2xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                Worker Profile
              </p>

              <h2 className="mt-1 text-xl font-black text-[#0F172A]">
                {name}
              </h2>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-[#64748B]" />
            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="space-y-6 p-6">

          {/* ================================================= */}
          {/* PROFILE */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-gray-100 p-5">

            <div className="flex items-center gap-4">

              {/* PHOTO */}

              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50">

                {worker.photo ? (
                  <img
                    src={worker.photo}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-7 w-7 text-[#FF5C39]" />
                )}

              </div>

              {/* INFO */}

              <div className="min-w-0 flex-1">

                <h3 className="truncate text-lg font-black text-[#0F172A]">
                  {name}
                </h3>

                <p className="mt-1 text-sm text-[#64748B]">
                  {specialty}
                </p>

                <div className="mt-2">

                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">

                      <CheckCircle2 className="h-3.5 w-3.5" />

                      Available

                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">

                      <XCircle className="h-3.5 w-3.5" />

                      Unavailable

                    </span>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* CONTACT */}
          {/* ================================================= */}

          <Section title="Contact Information">

            <DetailRow
              icon={Phone}
              label="Phone"
              value={phone}
            />

            <DetailRow
              icon={MapPin}
              label="Location"
              value={location}
            />

            <DetailRow
              icon={MapPin}
              label="Labour Chauk"
              value={labourChauk}
            />

          </Section>

          {/* ================================================= */}
          {/* WORK INFORMATION */}
          {/* ================================================= */}

          <Section title="Work Information">

            <DetailRow
              icon={BriefcaseBusiness}
              label="Category"
              value={category}
            />

            <DetailRow
              icon={BriefcaseBusiness}
              label="Subcategory"
              value={subcategory}
            />

            <DetailRow
              icon={Wrench}
              label="Specialty"
              value={specialty}
            />

            <DetailRow
              icon={BriefcaseBusiness}
              label="Experience"
              value={`${worker.yearsExperience || 0} years`}
            />

            <DetailRow
              icon={CheckCircle2}
              label="Completed Jobs"
              value={String(
                worker.completedJobs || 0,
              )}
            />

          </Section>

          {/* ================================================= */}
          {/* RATING */}
          {/* ================================================= */}

          <Section title="Performance">

            <DetailRow
              icon={Star}
              label="Rating"
              value={
                rating > 0
                  ? `${rating.toFixed(
                      1,
                    )} (${reviewCount} reviews)`
                  : "Not rated"
              }
            />

            <DetailRow
              icon={CheckCircle2}
              label="Response Time"
              value={
                worker.responseTime ||
                "Not specified"
              }
            />

          </Section>

          {/* ================================================= */}
          {/* PRICING */}
          {/* ================================================= */}

          <Section title="Pricing">

            <DetailRow
              icon={IndianRupee}
              label="Starting Price"
              value={`₹${startingPrice}`}
            />

            <DetailRow
              icon={IndianRupee}
              label="Half Day"
              value={`₹${halfDayPrice}`}
            />

            <DetailRow
              icon={IndianRupee}
              label="Full Day"
              value={`₹${fullDayPrice}`}
            />

            <DetailRow
              icon={IndianRupee}
              label="Monthly"
              value={`₹${monthlyPrice}`}
            />

            <DetailRow
              icon={IndianRupee}
              label="Visit Charge"
              value={`₹${visitCharge}`}
            />

          </Section>

          {/* ================================================= */}
          {/* SERVICES */}
          {/* ================================================= */}

          {worker.services.length > 0 && (
            <Section title="Services">

              <div className="p-4">

                <div className="flex flex-wrap gap-2">

                  {worker.services.map(
                    (service) => (
                      <span
                        key={service}
                        className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#C2410C]"
                      >
                        {service}
                      </span>
                    ),
                  )}

                </div>

              </div>

            </Section>
          )}

          {/* ================================================= */}
          {/* SKILLS */}
          {/* ================================================= */}

          {worker.skills.length > 0 && (
            <Section title="Skills">

              <div className="p-4">

                <div className="flex flex-wrap gap-2">

                  {worker.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-gray-100 bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#334155]"
                      >
                        {skill}
                      </span>
                    ),
                  )}

                </div>

              </div>

            </Section>
          )}

          {/* ================================================= */}
          {/* BIO */}
          {/* ================================================= */}

          {worker.bio && (
            <Section title="About Worker">

              <div className="p-4">

                <p className="text-sm leading-6 text-[#475569]">
                  {worker.bio}
                </p>

              </div>

            </Section>
          )}

          {/* ================================================= */}
          {/* CERTIFICATIONS */}
          {/* ================================================= */}

          {worker.certifications.length > 0 && (
            <Section title="Certifications">

              <div className="space-y-2 p-4">

                {worker.certifications.map(
                  (certification) => (
                    <div
                      key={certification}
                      className="flex items-center gap-2"
                    >

                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

                      <span className="text-sm text-[#334155]">
                        {certification}
                      </span>

                    </div>
                  ),
                )}

              </div>

            </Section>
          )}

          {/* ================================================= */}
          {/* ACCOUNT INFORMATION */}
          {/* ================================================= */}

          <Section title="Account Information">

            <DetailRow
              icon={CalendarDays}
              label="Registered"
              value={createdDate}
            />

            <div className="p-4">

              <p className="text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">
                Worker ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-[#334155]">
                {worker.id}
              </p>

            </div>

          </Section>

        </div>

      </aside>

    </div>
  );
}

/* =====================================================
   SECTION
===================================================== */

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>

      <h3 className="mb-3 text-sm font-black text-[#0F172A]">
        {title}
      </h3>

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
        {children}
      </div>

    </section>
  );
}

/* =====================================================
   DETAIL ROW
===================================================== */

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC]">

        <Icon className="h-4 w-4 text-[#64748B]" />

      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[11px] font-semibold text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-semibold text-[#334155]">
          {value}
        </p>

      </div>

    </div>
  );
}