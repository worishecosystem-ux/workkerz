"use client";

import Image from "next/image";
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  Truck,
  Users,
  CheckCircle2,
  ArrowDown,
  Play,
  Mail,
  MapPin,
  Phone,
  Building2,
} from "lucide-react";

import CompletedWorkGallery from "@/app/coming-soon/components/CompletedWorkGallery";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.workkerz.app&pcampaignid=web_share";

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f7f8f5] text-slate-900">
      {/* ============================================================
          HEADER
      ============================================================ */}

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-5 lg:px-6">
          <Image
            src="/WORKKERZ (1).png"
            alt="Workkerz"
            width={115}
            height={44}
            className="h-8 w-auto object-contain sm:h-9"
            priority
          />

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-green-700 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Get App
          </a>
        </div>
      </header>

      {/* ============================================================
          HERO
      ============================================================ */}

      <section className="relative w-full overflow-hidden bg-white">
        {/* Background */}
        <div className="pointer-events-none absolute -left-40 top-20 h-72 w-72 rounded-full bg-green-100/50 blur-3xl sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl sm:h-[500px] sm:w-[500px]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 xl:grid-cols-2 xl:gap-12">
            {/* ======================================================
                LEFT CONTENT
            ====================================================== */}

            <div className="relative z-10 w-full max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-700 sm:px-3.5 sm:py-2 sm:text-xs">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 sm:h-2 sm:w-2" />
                Workkerz App is Live
              </div>

              {/* Heading */}
              <h1 className="mt-5 text-[2.35rem] font-black leading-[1.03] tracking-[-0.04em] sm:mt-6 sm:text-5xl md:text-6xl lg:text-[3.7rem] xl:text-[4.1rem]">
                Your work.
                <br />
                <span className="text-green-600">Your workers.</span>
                <br />
                Your materials.
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 sm:mt-6 sm:text-base sm:leading-7 lg:text-lg">
                Workkerz brings workers and work-related materials together in
                one simple mobile app.
              </p>

              {/* Download */}
              <div className="mt-6 sm:mt-8">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Workkerz on Google Play"
                  className="inline-flex items-center gap-3 rounded-xl bg-black px-4 py-2.5 text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:bg-slate-900 sm:px-5 sm:py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">
                    <Play className="h-6 w-6 fill-white text-white sm:h-7 sm:w-7" />
                  </div>

                  <div className="text-left leading-none">
                    <span className="block text-[8px] font-medium uppercase tracking-wide text-white/70 sm:text-[9px]">
                      GET IT ON
                    </span>

                    <span className="mt-1 block text-[15px] font-semibold tracking-tight text-white sm:text-[17px]">
                      Google Play
                    </span>
                  </div>
                </a>
              </div>

              {/* Trust */}
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2.5 text-[11px] text-slate-500 sm:gap-x-5 sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
                  Easy to use
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
                  Secure platform
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Smartphone className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
                  Android App
                </div>
              </div>
            </div>

            {/* ======================================================
                APP PHONES
            ====================================================== */}

            <div className="relative flex min-h-[390px] w-full items-center justify-center py-4 sm:min-h-[520px] sm:py-8 lg:min-h-[600px]">
              {/* Glow */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/60 blur-3xl sm:h-[400px] sm:w-[400px] lg:h-[480px] lg:w-[480px]" />

              {/* Phones wrapper */}
              <div className="relative flex w-full max-w-[550px] items-end justify-center">
                {/* ==================================================
                    WORKKERZ PHONE
                ================================================== */}

                <div className="relative z-20 w-[42vw] max-w-[235px] min-w-[150px] -rotate-[5deg] transition-transform duration-500 hover:rotate-0 sm:w-[235px]">
                  {/* Frame */}
                  <div className="rounded-[2rem] border-[5px] border-slate-900 bg-slate-900 p-1.5 shadow-[20px_25px_45px_rgba(0,0,0,0.25)] sm:rounded-[2.4rem] sm:border-[7px] sm:p-1.5">
                    {/* Screen */}
                    <div className="relative aspect-[768/1600] w-full overflow-hidden rounded-[1.5rem] bg-white sm:rounded-[1.85rem]">
                      <Image
                        src="/mock/workkerz-home.jpeg"
                        alt="Workkerz App Home"
                        fill
                        sizes="(max-width: 640px) 42vw, 235px"
                        className="object-cover object-top"
                        priority
                      />

                      {/* Dynamic Island */}
                      <div className="pointer-events-none absolute left-1/2 top-1.5 z-30 h-4 w-12 -translate-x-1/2 rounded-full bg-black sm:top-2 sm:h-6 sm:w-[72px]" />
                    </div>
                  </div>

                  {/* Shadow */}
                  <div className="absolute -bottom-5 left-1/2 -z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-black/25 blur-xl sm:h-8 sm:w-32" />
                </div>

                {/* ==================================================
                    E-AURIX PHONE
                ================================================== */}

                <div className="relative z-10 -ml-[7vw] w-[38vw] max-w-[215px] min-w-[140px] rotate-[6deg] transition-transform duration-500 hover:rotate-0 sm:-ml-10 sm:w-[215px]">
                  {/* Frame */}
                  <div className="rounded-[2rem] border-[5px] border-slate-900 bg-slate-900 p-1.5 shadow-[20px_25px_45px_rgba(0,0,0,0.22)] sm:rounded-[2.4rem] sm:border-[7px] sm:p-1.5">
                    {/* Screen */}
                    <div className="relative aspect-[771/1600] w-full overflow-hidden rounded-[1.5rem] bg-white sm:rounded-[1.85rem]">
                      <Image
                        src="/mock/e-aurix-home.jpeg"
                        alt="E-Aurix App Home"
                        fill
                        sizes="(max-width: 640px) 38vw, 215px"
                        className="object-cover object-top"
                      />

                      {/* Dynamic Island */}
                      <div className="pointer-events-none absolute left-1/2 top-1.5 z-30 h-4 w-12 -translate-x-1/2 rounded-full bg-black sm:top-2 sm:h-6 sm:w-[72px]" />
                    </div>
                  </div>

                  {/* Shadow */}
                  <div className="absolute -bottom-5 left-1/2 -z-10 h-7 w-20 -translate-x-1/2 rounded-full bg-black/20 blur-xl sm:h-8 sm:w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMPLETED WORK
      ============================================================ */}

      <section className="w-full">
        <CompletedWorkGallery />
      </section>
      {/* ============================================================
          WHAT YOU GET
      ============================================================ */}

      <section className="w-full bg-[#f7f8f5]">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-green-600 sm:text-xs">
              One app
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Everything you need for work
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Workkerz makes it easier to find workers and get the materials you
              need for your work.
            </p>
          </div>

          <div className="mt-8 grid w-full gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {/* CARD 1 */}
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Find Workers"
              description="Discover skilled professionals for different types of work."
            />

            {/* CARD 2 */}
            <FeatureCard
              icon={<Truck className="h-5 w-5" />}
              title="Order Materials"
              description="Get construction and work-related materials from local sellers."
            />

            {/* CARD 3 */}
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Simple Experience"
              description="Everything is designed to make your everyday work easier."
            />

            {/* CARD 4 */}
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Trusted Platform"
              description="A dedicated platform built around workers and work-related needs."
            />
          </div>
        </div>
      </section>
      {/* ============================================================
          APP DOWNLOAD CTA
      ============================================================ */}

      <section id="download" className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
          <div className="relative isolate w-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 px-5 py-7 text-white shadow-xl sm:rounded-[1.75rem] sm:px-8 sm:py-8 lg:px-10">
            {/* Background */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-10">
              {/* LEFT */}
              <div className="w-full max-w-2xl text-center lg:text-left">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold backdrop-blur-sm sm:text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  WORKKERZ MOBILE APP
                </div>

                <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-[2.15rem]">
                  Workkerz, right in your pocket.
                </h2>

                <p className="mx-auto mt-2.5 max-w-lg text-sm leading-6 text-green-50 sm:text-[15px] lg:mx-0 lg:text-base">
                  Book workers, manage your work and stay connected — all from
                  the Workkerz Android app.
                </p>

                {/* CTA */}
                <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-12 items-center gap-3 rounded-xl bg-white px-5 text-sm font-extrabold text-green-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-50 hover:shadow-xl"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
                      <Download className="h-4 w-4" />
                    </div>

                    <div className="text-left leading-tight">
                      <span className="block text-[9px] font-semibold text-green-600">
                        GET IT ON
                      </span>

                      <span className="block text-sm">Google Play</span>
                    </div>

                    <ArrowDown className="ml-1 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  </a>

                  <div className="flex items-center gap-2 text-xs text-green-100">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <Smartphone className="h-3.5 w-3.5" />
                    </span>
                    Android available now
                  </div>
                </div>

                {/* FEATURES */}
                <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-green-50 lg:justify-start">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Easy Booking
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Verified Workers
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Quick Service
                  </span>
                </div>
              </div>

              {/* RIGHT PHONE */}
              <div className="relative flex w-full shrink-0 justify-center lg:w-[260px] lg:justify-end">
                <div className="absolute right-8 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-white/15 blur-3xl" />

                <div className="relative z-10 w-[135px] rotate-[3deg] transition-transform duration-500 hover:rotate-0 sm:w-[155px]">
                  <div className="rounded-[2rem] border-[5px] border-slate-900 bg-slate-900 p-1.5 shadow-2xl">
                    <div className="relative aspect-[768/1600] w-full overflow-hidden rounded-[1.55rem] bg-white">
                      <Image
                        src="/mock/workkerz-request.jpeg"
                        alt="Workkerz mobile app preview"
                        fill
                        sizes="155px"
                        className="object-cover object-top"
                      />

                      <div className="pointer-events-none absolute left-1/2 top-1.5 z-20 h-4 w-12 -translate-x-1/2 rounded-full bg-slate-900" />
                    </div>
                  </div>

                  <div className="absolute -bottom-4 left-1/2 -z-10 h-8 w-28 -translate-x-1/2 rounded-full bg-black/30 blur-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SUPPORT / CONTACT
      ============================================================ */}

      <section className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
          <div className="w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm sm:rounded-[1.75rem]">
            {/* HEADER */}
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-6 sm:px-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 sm:h-11 sm:w-11">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-green-600 sm:text-[10px]">
                    Support & Contact
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    Need help with Workkerz?
                  </h2>

                  <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                    For support, business enquiries, technical assistance or
                    other Workkerz related queries, contact our team.
                  </p>
                </div>
              </div>
            </div>

            {/* CONTACT CARDS */}
            <div className="grid gap-3 p-4 sm:gap-4 sm:p-8 lg:grid-cols-3">
              {/* EMAIL */}
              <a
                href="mailto:worishecosystem@gmail.com"
                className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50 sm:p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>

                <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Email Support
                </p>

                <p className="mt-1 break-all text-sm font-bold text-slate-800 group-hover:text-green-700">
                  worishecosystem@gmail.com
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Contact us by email
                </p>
              </a>

              {/* PHONE */}
              <a
                href="tel:700543603"
                className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-green-200 hover:bg-green-50 sm:p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
                  <Phone className="h-5 w-5" />
                </div>

                <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Contact
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800 group-hover:text-green-700">
                  700543603
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Call our support team
                </p>
              </a>

              {/* COMPANY */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>

                <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Company
                </p>

                <p className="mt-1 text-sm font-black text-slate-800">
                  WORISH ECOSYSTEM PRIVATE LIMITED
                </p>

                <p className="mt-1 text-xs text-slate-400">Workkerz</p>
              </div>
            </div>

            {/* REGISTERED ADDRESS */}
            <div className="border-t border-slate-100 px-5 py-6 sm:px-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <MapPin className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Registered / Correspondence Address
                  </p>

                  <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-700 sm:text-sm sm:leading-6">
                    C/O MR. KAILASH, NADI PAR, TAAL, KABEER ASHRAM, Gird,
                    Gwalior, Madhya Pradesh, 474006, India.
                  </p>
                </div>
              </div>
            </div>

            {/* CURRENT OFFICE */}
            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-6 sm:px-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Current Office
                  </p>

                  <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-700 sm:text-sm sm:leading-6">
                    H. No. L-3, Elixir Green, Karond Road, Bhopal (M.P.) 462038,
                    Dist. Bhopal, Madhya Pradesh, India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
    FOOTER
============================================================ */}

      <footer className="w-full border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          {/* TOP FOOTER */}
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* BRAND */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Image
                src="/WORKKERZ (1).png"
                alt="Workkerz"
                width={95}
                height={35}
                className="h-7 w-auto object-contain sm:h-8"
              />

              <span className="text-[11px] text-slate-400 sm:text-xs">
                Powered by Worish Ecosystem Pvt. Ltd.
              </span>
            </div>

            {/* COMPANY */}
            <div className="text-left md:text-right">
              <p className="text-[11px] font-semibold text-slate-500 sm:text-xs">
                WORISH ECOSYSTEM PRIVATE LIMITED
              </p>

              <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                © 2026 Workkerz. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* LEGAL LINKS */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
            <a
              href="/privacy-policy"
              className="text-xs font-semibold text-slate-500 transition hover:text-green-600"
            >
              Privacy Policy
            </a>

            <span className="h-3 w-px bg-slate-200" />

            <a
              href="/terms"
              className="text-xs font-semibold text-slate-500 transition hover:text-green-600"
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 sm:h-11 sm:w-11">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-bold sm:mt-4 sm:text-base">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
        {description}
      </p>
    </div>
  );
}
