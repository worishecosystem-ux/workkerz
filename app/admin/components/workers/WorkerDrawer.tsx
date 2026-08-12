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

type WorkerWithLegacyFields = Worker & {
  labour_chauk?: string | null;
};

export default function WorkerDrawer({
  worker,
  onClose,
}: WorkerDrawerProps) {
  if (!worker) return null;

  const workerData = worker as WorkerWithLegacyFields;

  /* =====================================================
     BASIC DATA
  ===================================================== */

  const name = worker.name?.trim() || "Unnamed Worker";

  const phone = worker.phone?.trim() || "Not available";

  const category =
    worker.category?.trim() || "Not specified";

  const subcategory =
    worker.subcategory?.trim() || "Not specified";

  const specialty =
    worker.specialty?.trim() || "Not specified";

  const location =
    worker.location?.trim() || "Not specified";

  const labourChauk =
    worker.labourChauk?.trim() ||
    workerData.labour_chauk?.trim() ||
    "Not specified";

  const rating = Number(worker.rating || 0);

  const reviewCount = Number(worker.reviewCount || 0);

  const isActive = worker.available === true;

  const createdDate = worker.createdAt
    ? new Date(worker.createdAt).toLocaleDateString(
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
    worker.workerCode || "WRKZ-PENDING";

  /* =====================================================
     PRICING
  ===================================================== */

  const startingPrice = Number(
    worker.startingPrice || 0,
  );

  const halfDayPrice = Number(
    worker.halfDayPrice || 0,
  );

  const fullDayPrice = Number(
    worker.fullDayPrice || 0,
  );

  const monthlyPrice = Number(
    worker.monthlyPrice || 0,
  );

  const visitCharge = Number(
    worker.visitCharge || 0,
  );

  /* =====================================================
     DISPLAY HELPERS
  ===================================================== */

  const experience = Number(
    worker.yearsExperience || 0,
  );

  const completedJobs = Number(
    worker.completedJobs || 0,
  );

  const responseTime =
    worker.responseTime?.trim() ||
    "Not specified";

  return (
    <div className="fixed inset-0 z-100 overflow-hidden">

      {/* =================================================
          BACKDROP
      ================================================= */}

      <button
        type="button"
        aria-label="Close worker details"
        onClick={onClose}
        className="
          absolute inset-0
          bg-slate-950/45
          backdrop-blur-[2px]
        "
      />

      {/* =================================================
          DRAWER

          Mobile  : full width
          Tablet  : 420px
          Desktop : 520px
      ================================================= */}

      <aside
        className="
          absolute
          inset-y-0
          right-0

          flex
          h-dvh
          w-full
          max-w-full
          flex-col

          overflow-hidden

          border-l
          border-white/20

          bg-[#F8FAFC]

          shadow-[-20px_0_60px_rgba(15,23,42,0.18)]

          sm:w-105
          md:w-115
          lg:w-130
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            relative
            shrink-0
            overflow-hidden
            bg-white
          "
        >

          {/* Decorative background */}

          <div
            className="
              absolute
              inset-x-0
              top-0
              h-24
              bg-linear-to-br
              from-[#FFF1EC]
              via-[#FFF8F5]
              to-white
            "
          />

          <div
            className="
              relative
              flex
              items-center
              justify-between

              px-4
              pb-3
              pt-15

              sm:px-5
              sm:pb-4
              sm:pt-5

              lg:px-6
            "
          >

            <div className="min-w-0">

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-[#FF5C39]

                  sm:text-[10px]
                "
              >
                Workkerz
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  font-medium
                  text-[#94A3B8]

                  sm:mt-1
                  sm:text-xs
                "
              >
                Worker Profile
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                bg-white/90
                text-[#64748B]
                shadow-sm
                transition

                hover:border-gray-300
                hover:bg-white
                hover:text-[#0F172A]

                sm:h-10
                sm:w-10
              "
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

          </div>
        </div>

        {/* =================================================
            SCROLL CONTENT
        ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden

            overscroll-contain

            [scrollbar-width:thin]
          "
        >

          <div
            className="
              space-y-4
              p-3

              sm:space-y-5
              sm:p-4

              lg:p-5
            "
          >

            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                shadow-sm

                sm:rounded-3xl
              "
            >

              <div
                className="
                  absolute
                  inset-x-0
                  top-0
                  h-20
                  bg-gradient-to-r
                  from-orange-50
                  via-[#FFF7F3]
                  to-white

                  sm:h-24
                "
              />

              <div
                className="
                  relative
                  p-4

                  sm:p-5
                "
              >

                {/* PROFILE */}

                <div
                  className="
                    flex
                    items-start
                    gap-3

                    sm:gap-4
                  "
                >

                  {/* PHOTO */}

                  <div className="relative shrink-0">

                    <div
                      className="
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        border-4
                        border-white
                        bg-orange-50
                        shadow-md

                        sm:h-24
                        sm:w-24
                      "
                    >

                      {worker.photo ? (
                        <img
                          src={worker.photo}
                          alt={name}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <User
                          className="
                            h-8
                            w-8
                            text-[#FF5C39]

                            sm:h-9
                            sm:w-9
                          "
                        />
                      )}

                    </div>

                    <span
                      className={`
                        absolute
                        bottom-1
                        right-1
                        h-3.5
                        w-3.5
                        rounded-full
                        border-[3px]
                        border-white

                        sm:bottom-1.5
                        sm:right-1.5
                        sm:h-4
                        sm:w-4

                        ${
                          isActive
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }
                      `}
                    />

                  </div>

                  {/* INFO */}

                  <div className="min-w-0 flex-1 pt-0.5">

                    <h2
                      className="
                        break-words
                        text-lg
                        font-black
                        leading-tight
                        tracking-tight
                        text-[#0F172A]

                        sm:text-xl
                      "
                    >
                      {name}
                    </h2>

                    <p
                      className="
                        mt-1
                        line-clamp-2
                        break-words
                        text-xs
                        font-medium
                        leading-5
                        text-[#64748B]

                        sm:text-sm
                      "
                    >
                      {specialty}
                    </p>

                    {/* CATEGORY */}

                    <div
                      className="
                        mt-2
                        flex
                        flex-wrap
                        gap-1.5

                        sm:mt-3
                        sm:gap-2
                      "
                    >

                      <span
                        className="
                          max-w-full
                          truncate
                          rounded-lg
                          bg-[#FFF1EC]
                          px-2
                          py-1
                          text-[10px]
                          font-bold
                          text-[#C2410C]

                          sm:px-2.5
                          sm:text-[11px]
                        "
                      >
                        {category}
                      </span>

                      {subcategory !==
                        "Not specified" && (
                        <span
                          className="
                            max-w-full
                            truncate
                            rounded-lg
                            bg-slate-100
                            px-2
                            py-1
                            text-[10px]
                            font-bold
                            text-[#64748B]

                            sm:px-2.5
                            sm:text-[11px]
                          "
                        >
                          {subcategory}
                        </span>
                      )}

                    </div>

                  </div>
                </div>

                {/* ID + STATUS */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-2
                    border-t
                    border-gray-100
                    pt-3

                    sm:mt-5
                    sm:gap-3
                    sm:pt-4
                  "
                >

                  <div className="min-w-0">

                    <p
                      className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.16em]
                        text-[#94A3B8]

                        sm:text-[9px]
                      "
                    >
                      Worker ID
                    </p>

                    <p
                      className="
                        mt-1
                        max-w-[190px]
                        truncate
                        font-mono
                        text-xs
                        font-black
                        tracking-wide
                        text-[#0F172A]

                        sm:max-w-[240px]
                        sm:text-sm
                      "
                    >
                      {workerCode}
                    </p>

                  </div>

                  {isActive ? (
                    <span
                      className="
                        inline-flex
                        shrink-0
                        items-center
                        gap-1
                        rounded-full
                        bg-emerald-50
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-bold
                        text-emerald-700

                        sm:gap-1.5
                        sm:px-3
                        sm:text-[11px]
                      "
                    >
                      <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Available
                    </span>
                  ) : (
                    <span
                      className="
                        inline-flex
                        shrink-0
                        items-center
                        gap-1
                        rounded-full
                        bg-slate-100
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-bold
                        text-slate-600

                        sm:gap-1.5
                        sm:px-3
                        sm:text-[11px]
                      "
                    >
                      <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Unavailable
                    </span>
                  )}

                </div>

              </div>
            </div>

            {/* =================================================
                QUICK STATS
            ================================================= */}

            <div
              className="
                grid
                grid-cols-3
                gap-2

                sm:gap-3
              "
            >

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
                value={String(experience)}
                suffix={
                  experience === 1
                    ? "year"
                    : "years"
                }
              />

              <QuickStat
                icon={ClipboardCheck}
                label="Completed"
                value={String(completedJobs)}
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

              <div
                className="
                  grid
                  grid-cols-1
                  gap-2.5
                  p-3

                  sm:grid-cols-2
                  sm:gap-3
                  sm:p-4
                "
              >

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

                <div className="sm:col-span-2">

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
                  value={String(completedJobs)}
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

              <div className="p-3 sm:p-4">

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-2.5

                    sm:grid-cols-2
                    sm:gap-3
                  "
                >

                  {/* RATING */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-amber-100
                      bg-amber-50/60
                      p-3

                      sm:p-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        shadow-sm
                      "
                    >
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>

                    <p
                      className="
                        mt-2
                        text-xl
                        font-black
                        text-[#0F172A]

                        sm:mt-3
                        sm:text-2xl
                      "
                    >
                      {rating > 0
                        ? rating.toFixed(1)
                        : "—"}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-[#94A3B8]">
                      {reviewCount} reviews
                    </p>

                  </div>

                  {/* RESPONSE */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-blue-100
                      bg-blue-50/60
                      p-3

                      sm:p-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        shadow-sm
                      "
                    >
                      <Clock3 className="h-4 w-4 text-blue-500" />
                    </div>

                    <p
                      className="
                        mt-2
                        truncate
                        text-sm
                        font-black
                        text-[#0F172A]

                        sm:mt-3
                      "
                    >
                      {responseTime}
                    </p>

                    <p className="mt-1 text-[10px] font-medium text-[#94A3B8]">
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

              <div
                className="
                  grid
                  grid-cols-2
                  gap-2.5
                  p-3

                  sm:gap-3
                  sm:p-4
                "
              >

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

            {worker.services.length > 0 && (
              <TagSection
                icon={Wrench}
                title="Services"
                items={worker.services}
                variant="orange"
              />
            )}

            {/* =================================================
                SKILLS
            ================================================= */}

            {worker.skills.length > 0 && (
              <TagSection
                icon={Award}
                title="Skills"
                items={worker.skills}
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

                <div className="p-4 sm:p-5">

                  <p
                    className="
                      break-words
                      text-xs
                      leading-6
                      text-[#475569]

                      sm:text-sm
                      sm:leading-7
                    "
                  >
                    {worker.bio}
                  </p>

                </div>

              </Section>
            )}

            {/* =================================================
                CERTIFICATIONS
            ================================================= */}

            {worker.certifications.length > 0 && (
              <Section
                icon={ShieldCheck}
                title="Certifications"
                description="Verified skills and certificates"
              >

                <div className="space-y-2 p-3 sm:p-4">

                  {worker.certifications.map(
                    (certification) => (
                      <div
                        key={certification}
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-2.5
                          rounded-xl
                          border
                          border-emerald-100
                          bg-emerald-50/50
                          px-3
                          py-2.5

                          sm:gap-3
                          sm:py-3
                        "
                      >

                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-white
                          "
                        >
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>

                        <span
                          className="
                            min-w-0
                            break-words
                            text-xs
                            font-semibold
                            text-[#334155]

                            sm:text-sm
                          "
                        >
                          {certification}
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
                  value={createdDate}
                />

                <div className="p-3 sm:p-4">

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      justify-between
                      gap-3
                    "
                  >

                    <div className="min-w-0">

                      <p
                        className="
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.15em]
                          text-[#94A3B8]
                        "
                      >
                        Worker ID
                      </p>

                      <p
                        className="
                          mt-1.5
                          max-w-[220px]
                          truncate
                          font-mono
                          text-xs
                          font-black
                          tracking-wide
                          text-[#0F172A]

                          sm:max-w-[280px]
                          sm:text-sm
                        "
                      >
                        {workerCode}
                      </p>

                    </div>

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#FFF1EC]

                        sm:h-9
                        sm:w-9
                      "
                    >
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

        <div
          className="
            shrink-0
            border-t
            border-gray-200
            bg-white

            px-3
            pb-[calc(0.75rem+env(safe-area-inset-bottom))]
            pt-3

            sm:px-4
            sm:py-4
          "
        >

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              rounded-xl
              bg-[#0F172A]
              text-xs
              font-bold
              text-white
              transition

              hover:bg-[#1E293B]

              active:scale-[0.99]

              sm:text-sm
            "
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
    <section className="min-w-0">

      <div
        className="
          mb-1.5
          flex
          items-center
          gap-2
          px-1

          sm:mb-2
          sm:gap-3
        "
      >

        <div
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#FFF1EC]

            sm:h-8
            sm:w-8
          "
        >
          <Icon className="h-3.5 w-3.5 text-[#FF5C39] sm:h-4 sm:w-4" />
        </div>

        <div className="min-w-0">

          <h3
            className="
              truncate
              text-xs
              font-black
              text-[#0F172A]

              sm:text-sm
            "
          >
            {title}
          </h3>

          {description && (
            <p
              className="
                mt-0.5
                truncate
                text-[9px]
                font-medium
                text-[#94A3B8]

                sm:text-[10px]
              "
            >
              {description}
            </p>
          )}

        </div>

      </div>

      <div
        className="
          min-w-0
          overflow-hidden
          rounded-2xl
          border
          border-gray-100
          bg-white
          shadow-sm
        "
      >
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
    <div
      className="
        flex
        min-w-0
        items-start
        gap-2.5
        p-3
        transition
        hover:bg-[#FAFAFA]

        sm:items-center
        sm:gap-3
        sm:p-4
      "
    >

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#F8FAFC]

          sm:h-9
          sm:w-9
        "
      >
        <Icon className="h-3.5 w-3.5 text-[#64748B] sm:h-4 sm:w-4" />
      </div>

      <div className="min-w-0 flex-1">

        <p
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-wide
            text-[#94A3B8]

            sm:text-[10px]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            wrap-break-word
            text-xs
            font-semibold
            leading-5
            text-[#334155]

            sm:text-sm
          "
        >
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
    <div
      className="
        min-w-0
        rounded-xl
        border
        border-gray-100
        bg-white
        p-2.5
        shadow-sm

        sm:rounded-2xl
        sm:p-4
      "
    >

      <div
        className={`
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg

          sm:h-8
          sm:w-8
          sm:rounded-lg

          ${
            rating
              ? "bg-amber-50"
              : "bg-[#F8FAFC]"
          }
        `}
      >

        <Icon
          className={`
            h-3.5
            w-3.5

            sm:h-4
            sm:w-4

            ${
              rating
                ? "fill-amber-400 text-amber-400"
                : "text-[#64748B]"
            }
          `}
        />

      </div>

      <p
        className="
          mt-2
          truncate
          text-lg
          font-black
          text-[#0F172A]

          sm:mt-3
          sm:text-xl
        "
      >
        {value}
      </p>

      <p
        className="
          mt-0.5
          truncate
          text-[8px]
          font-bold
          uppercase
          tracking-wide
          text-[#94A3B8]

          sm:text-[10px]
        "
      >
        {suffix || label}
      </p>

      {suffix && (
        <p
          className="
            mt-0.5
            hidden
            truncate
            text-[9px]
            text-[#94A3B8]

            sm:block
            sm:text-[10px]
          "
        >
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
      className={`
        min-w-0
        rounded-xl
        border
        p-3

        sm:rounded-2xl
        sm:p-4

        ${
          accent
            ? "border-orange-100 bg-orange-50/50"
            : "border-gray-100 bg-[#FAFAFA]"
        }
      `}
    >

      <div className="flex min-w-0 items-center gap-2">

        <div
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-white

            sm:h-8
            sm:w-8
          "
        >
          <Icon
            className={`
              h-3.5
              w-3.5

              sm:h-4
              sm:w-4

              ${
                accent
                  ? "text-[#FF5C39]"
                  : "text-[#64748B]"
              }
            `}
          />
        </div>

        <p
          className="
            min-w-0
            truncate
            text-[9px]
            font-bold
            uppercase
            tracking-wide
            text-[#94A3B8]

            sm:text-[10px]
          "
        >
          {label}
        </p>

      </div>

      <p
        className="
          mt-2
          break-words
          text-xs
          font-bold
          leading-5
          text-[#334155]

          sm:mt-3
          sm:text-sm
        "
      >
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
      className={`
        min-w-0
        rounded-xl
        border
        p-3

        sm:rounded-2xl
        sm:p-4

        ${
          highlight
            ? "border-orange-100 bg-gradient-to-br from-orange-50 to-white"
            : "border-gray-100 bg-[#FAFAFA]"
        }
      `}
    >

      <p
        className="
          truncate
          text-[9px]
          font-bold
          uppercase
          tracking-wide
          text-[#94A3B8]

          sm:text-[10px]
        "
      >
        {label}
      </p>

      <div className="mt-1.5 flex min-w-0 items-baseline gap-0.5 sm:mt-2 sm:gap-1">

        <span className="text-xs font-bold text-[#64748B] sm:text-sm">
          ₹
        </span>

        <span
          className="
            min-w-0
            truncate
            text-lg
            font-black
            text-[#0F172A]

            sm:text-xl
          "
        >
          {value.toLocaleString("en-IN")}
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
        items.length === 1 ? "item" : "items"
      }`}
    >

      <div
        className="
          flex
          flex-wrap
          gap-1.5
          p-3

          sm:gap-2
          sm:p-4
        "
      >

        {items.map((item) => (
          <span
            key={item}
            className={`
              max-w-full
              break-words
              rounded-xl
              border
              px-2.5
              py-1.5
              text-[10px]
              font-bold

              sm:px-3
              sm:py-2
              sm:text-xs

              ${
                variant === "orange"
                  ? "border-orange-100 bg-orange-50 text-[#C2410C]"
                  : "border-gray-100 bg-[#F8FAFC] text-[#475569]"
              }
            `}
          >
            {item}
          </span>
        ))}

      </div>

    </Section>
  );
}