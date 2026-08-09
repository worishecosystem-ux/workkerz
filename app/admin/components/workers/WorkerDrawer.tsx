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
  Clock3,
  ShieldCheck,
  Award,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { Worker } from "@/app/data/workers";

type WorkerDrawerProps = {
  worker: Worker | null;
  onClose: () => void;
};

/* =====================================================
   COMPATIBILITY
===================================================== */

type WorkerWithLegacyFields = Worker & {
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

  const workerData =
    worker as WorkerWithLegacyFields;

  /* =====================================================
     BASIC DATA
  ===================================================== */

  const name =
    worker.name?.trim() ||
    "Unnamed Worker";

  const phone =
    worker.phone?.trim() ||
    "Not available";

  const category =
    worker.category?.trim() ||
    "Not specified";

  const subcategory =
    worker.subcategory?.trim() ||
    "Not specified";

  const specialty =
    worker.specialty?.trim() ||
    "Not specified";

  const location =
    worker.location?.trim() ||
    "Not specified";

  const labourChauk =
    worker.labourChauk?.trim() ||
    workerData.labour_chauk?.trim() ||
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

  /* =====================================================
     WORKER ID
  ===================================================== */

  const workerCode =
    worker.workerCode ||
    "WRKZ-PENDING";

  /* =====================================================
     PRICING
  ===================================================== */

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

  /* =====================================================
     DISPLAY HELPERS
  ===================================================== */

  const experience =
    Number(
      worker.yearsExperience || 0,
    );

  const completedJobs =
    Number(
      worker.completedJobs || 0,
    );

  const responseTime =
    worker.responseTime?.trim() ||
    "Not specified";

  return (
    <div className="fixed inset-0 z-50">

      {/* =================================================
          BACKDROP
      ================================================= */}

      <button
        type="button"
        aria-label="Close worker details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />

      {/* =================================================
          DRAWER
      ================================================= */}

      <aside className="absolute bottom-0 right-0 top-0 flex w-[520px] max-w-full flex-col overflow-hidden border-l border-white/20 bg-[#F8FAFC] shadow-[-20px_0_60px_rgba(15,23,42,0.18)]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="relative shrink-0 overflow-hidden bg-white">

          {/* Decorative top */}

          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-[#FFF1EC] via-[#FFF8F5] to-white" />

          <div className="relative flex items-center justify-between px-6 pb-4 pt-5">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF5C39]">
                Workkerz
              </p>

              <p className="mt-1 text-xs font-medium text-[#94A3B8]">
                Worker Profile
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white/90 text-[#64748B] shadow-sm transition hover:border-gray-300 hover:bg-white hover:text-[#0F172A]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

        </div>

        {/* =================================================
            SCROLL CONTENT
        ================================================= */}

        <div className="flex-1 overflow-y-auto">

          <div className="space-y-5 p-5">

            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

              {/* Background */}

              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-orange-50 via-[#FFF7F3] to-white" />

              <div className="relative p-5">

                <div className="flex items-start gap-4">

                  {/* PHOTO */}

                  <div className="relative shrink-0">

                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-orange-50 shadow-md">

                      {worker.photo ? (
                        <img
                          src={worker.photo}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-9 w-9 text-[#FF5C39]" />
                      )}

                    </div>

                    {/* STATUS DOT */}

                    <span
                      className={`absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-[3px] border-white ${
                        isActive
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />

                  </div>

                  {/* INFO */}

                  <div className="min-w-0 flex-1 pt-1">

                    <div className="flex items-start justify-between gap-2">

                      <div className="min-w-0">

                        <h2 className="truncate text-xl font-black tracking-tight text-[#0F172A]">
                          {name}
                        </h2>

                        <p className="mt-1 truncate text-sm font-medium text-[#64748B]">
                          {specialty}
                        </p>

                      </div>

                    </div>

                    {/* CATEGORY */}

                    <div className="mt-3 flex flex-wrap gap-2">

                      <span className="rounded-lg bg-[#FFF1EC] px-2.5 py-1 text-[11px] font-bold text-[#C2410C]">
                        {category}
                      </span>

                      {subcategory !==
                        "Not specified" && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-[#64748B]">
                          {subcategory}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

                {/* WORKER ID + STATUS */}

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                      Worker ID
                    </p>

                    <p className="mt-1 font-mono text-sm font-black tracking-wide text-[#0F172A]">
                      {workerCode}
                    </p>

                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">

                      <CheckCircle2 className="h-3.5 w-3.5" />

                      Available

                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">

                      <XCircle className="h-3.5 w-3.5" />

                      Unavailable

                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* =================================================
                QUICK STATS
            ================================================= */}

            <div className="grid grid-cols-3 gap-3">

              <QuickStat
                icon={Star}
                label="Rating"
                value={
                  rating > 0
                    ? rating.toFixed(1)
                    : "—"
                }
                suffix={
                  reviewCount > 0
                    ? `${reviewCount} reviews`
                    : undefined
                }
                rating
              />

              <QuickStat
                icon={BriefcaseBusiness}
                label="Experience"
                value={String(
                  experience,
                )}
                suffix={
                  experience === 1
                    ? "year"
                    : "years"
                }
              />

              <QuickStat
                icon={ClipboardCheck}
                label="Completed"
                value={String(
                  completedJobs,
                )}
                suffix="jobs"
              />

            </div>

            {/* =================================================
                CONTACT
            ================================================= */}

            <Section
              icon={Phone}
              title="Contact & Location"
              description="Worker contact and base location"
            >

              <div className="grid grid-cols-2 gap-3 p-4">

                <InfoCard
                  icon={Phone}
                  label="Phone"
                  value={phone}
                />

                <InfoCard
                  icon={MapPin}
                  label="Location"
                  value={location}
                />

                <div className="col-span-2">
                  <InfoCard
                    icon={MapPin}
                    label="Labour Chauk"
                    value={labourChauk}
                    accent
                  />
                </div>

              </div>

            </Section>

            {/* =================================================
                WORK DETAILS
            ================================================= */}

            <Section
              icon={Wrench}
              title="Work Information"
              description="Professional profile and experience"
            >

              <div className="divide-y divide-gray-100">

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
                  value={`${experience} ${
                    experience === 1
                      ? "year"
                      : "years"
                  }`}
                />

                <DetailRow
                  icon={ClipboardCheck}
                  label="Completed Jobs"
                  value={String(
                    completedJobs,
                  )}
                />

              </div>

            </Section>

            {/* =================================================
                PERFORMANCE
            ================================================= */}

            <Section
              icon={Star}
              title="Performance"
              description="Ratings and response details"
            >

              <div className="p-4">

                <div className="grid grid-cols-2 gap-3">

                  {/* RATING */}

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">

                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                    </div>

                    <p className="mt-3 text-2xl font-black text-[#0F172A]">
                      {rating > 0
                        ? rating.toFixed(
                            1,
                          )
                        : "—"}
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium text-[#94A3B8]">
                      {reviewCount}{" "}
                      reviews
                    </p>

                  </div>

                  {/* RESPONSE */}

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">

                      <Clock3 className="h-4 w-4 text-blue-500" />

                    </div>

                    <p className="mt-3 truncate text-sm font-black text-[#0F172A]">
                      {responseTime}
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-[#94A3B8]">
                      Response time
                    </p>

                  </div>

                </div>

              </div>

            </Section>

            {/* =================================================
                PRICING
            ================================================= */}

            <Section
              icon={IndianRupee}
              title="Pricing"
              description="Worker service charges"
            >

              <div className="grid grid-cols-2 gap-3 p-4">

                <PriceCard
                  label="Starting"
                  value={startingPrice}
                  highlight
                />

                <PriceCard
                  label="Half Day"
                  value={halfDayPrice}
                />

                <PriceCard
                  label="Full Day"
                  value={fullDayPrice}
                />

                <PriceCard
                  label="Monthly"
                  value={monthlyPrice}
                />

                <PriceCard
                  label="Visit Charge"
                  value={visitCharge}
                />

              </div>

            </Section>

            {/* =================================================
                SERVICES
            ================================================= */}

            {worker.services.length >
              0 && (
              <TagSection
                icon={Wrench}
                title="Services"
                items={
                  worker.services
                }
                variant="orange"
              />
            )}

            {/* =================================================
                SKILLS
            ================================================= */}

            {worker.skills.length >
              0 && (
              <TagSection
                icon={Award}
                title="Skills"
                items={
                  worker.skills
                }
                variant="slate"
              />
            )}

            {/* =================================================
                BIO
            ================================================= */}

            {worker.bio && (
              <Section
                icon={User}
                title="About Worker"
                description="Worker profile description"
              >

                <div className="p-5">

                  <p className="text-sm leading-7 text-[#475569]">
                    {worker.bio}
                  </p>

                </div>

              </Section>
            )}

            {/* =================================================
                CERTIFICATIONS
            ================================================= */}

            {worker.certifications.length >
              0 && (
              <Section
                icon={ShieldCheck}
                title="Certifications"
                description="Verified skills and certificates"
              >

                <div className="space-y-2 p-4">

                  {worker.certifications.map(
                    (
                      certification,
                    ) => (
                      <div
                        key={
                          certification
                        }
                        className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-3"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">

                          <ShieldCheck className="h-4 w-4 text-emerald-500" />

                        </div>

                        <span className="text-sm font-semibold text-[#334155]">
                          {
                            certification
                          }
                        </span>

                      </div>
                    ),
                  )}

                </div>

              </Section>
            )}

            {/* =================================================
                ACCOUNT
            ================================================= */}

            <Section
              icon={CalendarDays}
              title="Account Information"
              description="Registration and account details"
            >

              <div className="divide-y divide-gray-100">

                <DetailRow
                  icon={CalendarDays}
                  label="Registered"
                  value={
                    createdDate
                  }
                />

                <div className="p-4">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">
                        Worker ID
                      </p>

                      <p className="mt-1.5 font-mono text-sm font-black tracking-wide text-[#0F172A]">
                        {
                          workerCode
                        }
                      </p>

                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF1EC]">

                      <ChevronRight className="h-4 w-4 text-[#FF5C39]" />

                    </div>

                  </div>

                </div>

              </div>

            </Section>

            <div className="h-2" />

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="shrink-0 border-t border-gray-200 bg-white p-4">

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#0F172A] text-sm font-bold text-white transition hover:bg-[#1E293B]"
          >
            Close Profile
          </button>

        </div>

      </aside>

    </div>
  );
}

/* =====================================================
   SECTION
===================================================== */

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section>

      <div className="mb-2 flex items-center gap-3 px-1">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF1EC]">

          <Icon className="h-4 w-4 text-[#FF5C39]" />

        </div>

        <div>

          <h3 className="text-sm font-black text-[#0F172A]">
            {title}
          </h3>

          {description && (
            <p className="mt-0.5 text-[10px] font-medium text-[#94A3B8]">
              {description}
            </p>
          )}

        </div>

      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
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
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 transition hover:bg-[#FAFAFA]">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC]">

        <Icon className="h-4 w-4 text-[#64748B]" />

      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[#334155]">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   QUICK STAT
===================================================== */

function QuickStat({
  icon: Icon,
  label,
  value,
  suffix,
  rating = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
  rating?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          rating
            ? "bg-amber-50"
            : "bg-[#F8FAFC]"
        }`}
      >

        <Icon
          className={`h-4 w-4 ${
            rating
              ? "fill-amber-400 text-amber-400"
              : "text-[#64748B]"
          }`}
        />

      </div>

      <p className="mt-3 text-xl font-black text-[#0F172A]">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
        {suffix || label}
      </p>

      {suffix && (
        <p className="mt-0.5 text-[10px] text-[#94A3B8]">
          {label}
        </p>
      )}

    </div>
  );
}

/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-orange-100 bg-orange-50/50"
          : "border-gray-100 bg-[#FAFAFA]"
      }`}
    >

      <div className="flex items-center gap-2">

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent
              ? "bg-white"
              : "bg-white"
          }`}
        >

          <Icon
            className={`h-4 w-4 ${
              accent
                ? "text-[#FF5C39]"
                : "text-[#64748B]"
            }`}
          />

        </div>

        <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
          {label}
        </p>

      </div>

      <p className="mt-3 wrap-break-word text-sm font-bold text-[#334155]">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   PRICE CARD
===================================================== */

function PriceCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-orange-100 bg-gradient-to-br from-orange-50 to-white"
          : "border-gray-100 bg-[#FAFAFA]"
      }`}
    >

      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">

        <span className="text-sm font-bold text-[#64748B]">
          ₹
        </span>

        <span className="text-xl font-black text-[#0F172A]">
          {value.toLocaleString(
            "en-IN",
          )}
        </span>

      </div>

    </div>
  );
}

/* =====================================================
   TAG SECTION
===================================================== */

function TagSection({
  icon: Icon,
  title,
  items,
  variant,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  variant: "orange" | "slate";
}) {
  return (
    <Section
      icon={Icon}
      title={title}
      description={`${items.length} ${
        items.length === 1
          ? "item"
          : "items"
      }`}
    >

      <div className="flex flex-wrap gap-2 p-4">

        {items.map((item) => (
          <span
            key={item}
            className={
              variant ===
              "orange"
                ? "rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-[#C2410C]"
                : "rounded-xl border border-gray-100 bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#475569]"
            }
          >
            {item}
          </span>
        ))}

      </div>

    </Section>
  );
}