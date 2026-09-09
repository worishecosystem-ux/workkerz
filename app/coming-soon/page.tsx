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
        <div className="mx-auto flex h-13 w-full max-w-7xl items-center justify-between px-3 sm:h-15 sm:px-5 lg:px-6">
          <Image
            src="/WORKKERZ (1).png"
            alt="Workkerz"
            width={115}
            height={44}
            className="h-7 w-auto object-contain sm:h-8"
            priority
          />

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-green-700 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
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
        <div className="pointer-events-none absolute -left-40 top-10 h-64 w-64 rounded-full bg-green-100/50 blur-3xl sm:h-80 sm:w-80" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl sm:h-96 sm:w-96" />

        <div className="relative mx-auto w-full max-w-7xl px-3 pb-7 pt-6 sm:px-5 sm:pb-10 sm:pt-8 lg:px-8 lg:pb-14 lg:pt-12">
          <div className="grid w-full items-center gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-5 xl:grid-cols-2 xl:gap-8">
            {/* ======================================================
                LEFT CONTENT
            ====================================================== */}

            <div className="relative z-10 w-full max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-bold text-green-700 sm:px-3 sm:py-1.5 sm:text-[10px] lg:text-xs">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                Workkerz App is Live
              </div>

              <h1 className="mt-3 text-[2rem] font-black leading-[1.02] tracking-[-0.04em] sm:mt-4 sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
                Your work.
                <br />
                <span className="text-green-600">Your workers.</span>
                <br />
                Your materials.
              </h1>

              <p className="mt-3 max-w-xl text-xs leading-5 text-slate-600 sm:mt-4 sm:text-sm sm:leading-6 lg:text-lg">
                Workkerz brings workers and work-related materials together in
                one simple mobile app.
              </p>

              {/* DOWNLOAD */}

              <div className="mt-4 sm:mt-5">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Workkerz on Google Play"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-black px-3.5 py-2 text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:bg-slate-900 sm:px-4 sm:py-2.5"
                >
                  <div className="flex h-7 w-7 items-center justify-center sm:h-8 sm:w-8">
                    <Play className="h-5 w-5 fill-white text-white sm:h-6 sm:w-6" />
                  </div>

                  <div className="text-left leading-none">
                    <span className="block text-[7px] font-medium uppercase tracking-wide text-white/70 sm:text-[8px]">
                      GET IT ON
                    </span>

                    <span className="mt-0.5 block text-sm font-semibold tracking-tight text-white sm:text-[16px]">
                      Google Play
                    </span>
                  </div>
                </a>
              </div>

              {/* TRUST */}

              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] text-slate-500 sm:mt-5 sm:gap-x-4 sm:text-xs lg:text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600 sm:h-3.5 sm:w-3.5" />
                  Easy to use
                </div>

                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-green-600 sm:h-3.5 sm:w-3.5" />
                  Secure platform
                </div>

                <div className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3 text-green-600 sm:h-3.5 sm:w-3.5" />
                  Android App
                </div>
              </div>
            </div>

            {/* ======================================================
                APP PHONES
            ====================================================== */}

            <div className="relative flex min-h-[300px] w-full items-center justify-center py-2 sm:min-h-[400px] sm:py-4 lg:min-h-[500px]">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/60 blur-3xl sm:h-[320px] sm:w-[320px] lg:h-[420px] lg:w-[420px]" />

              <div className="relative flex w-full max-w-[500px] items-end justify-center">
                {/* WORKKERZ PHONE */}

                <div className="relative z-20 w-[39vw] max-w-[210px] min-w-[135px] -rotate-[5deg] transition-transform duration-500 hover:rotate-0 sm:w-[215px]">
                  <div className="rounded-[1.7rem] border-[4px] border-slate-900 bg-slate-900 p-1.5 shadow-[15px_20px_35px_rgba(0,0,0,0.22)] sm:rounded-[2.2rem] sm:border-[6px]">
                    <div className="relative aspect-[768/1600] w-full overflow-hidden rounded-[1.3rem] bg-white sm:rounded-[1.7rem]">
                      <Image
                        src="/mock/workkerz-home.jpeg"
                        alt="Workkerz App Home"
                        fill
                        sizes="(max-width: 640px) 39vw, 215px"
                        className="object-cover object-top"
                        priority
                      />

                      <div className="pointer-events-none absolute left-1/2 top-1.5 z-30 h-3.5 w-10 -translate-x-1/2 rounded-full bg-black sm:top-2 sm:h-5 sm:w-16" />
                    </div>
                  </div>

                  <div className="absolute -bottom-4 left-1/2 -z-10 h-6 w-20 -translate-x-1/2 rounded-full bg-black/20 blur-lg" />
                </div>

                {/* E-AURIX PHONE */}

                <div className="relative z-10 -ml-[6vw] w-[35vw] max-w-[195px] min-w-[125px] rotate-[6deg] transition-transform duration-500 hover:rotate-0 sm:-ml-8 sm:w-[195px]">
                  <div className="rounded-[1.7rem] border-[4px] border-slate-900 bg-slate-900 p-1.5 shadow-[15px_20px_35px_rgba(0,0,0,0.2)] sm:rounded-[2.2rem] sm:border-[6px]">
                    <div className="relative aspect-[771/1600] w-full overflow-hidden rounded-[1.3rem] bg-white sm:rounded-[1.7rem]">
                      <Image
                        src="/mock/e-aurix-home.jpeg"
                        alt="E-Aurix App Home"
                        fill
                        sizes="(max-width: 640px) 35vw, 195px"
                        className="object-cover object-top"
                      />

                      <div className="pointer-events-none absolute left-1/2 top-1.5 z-30 h-3.5 w-10 -translate-x-1/2 rounded-full bg-black sm:top-2 sm:h-5 sm:w-16" />
                    </div>
                  </div>

                  <div className="absolute -bottom-4 left-1/2 -z-10 h-6 w-16 -translate-x-1/2 rounded-full bg-black/20 blur-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMPLETED WORK
      ============================================================ */}

      <section className="">
        <CompletedWorkGallery />
      </section>

      {/* ============================================================
          WHAT YOU GET
      ============================================================ */}

      <section className="w-full bg-[#f7f8f5]">
        <div className="mx-auto w-full max-w-7xl px-3 py-7 sm:px-5 sm:py-10 lg:px-4 lg:py-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-green-600 sm:text-[10px] lg:text-xs">
              One app
            </p>

            <h2 className="mt-1.5 text-xl font-black tracking-tight sm:text-2xl lg:text-4xl">
              Everything you need for work
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Workkerz makes it easier to find workers and get the materials you
              need for your work.
            </p>
          </div>

          <div className="mt-5 grid w-full gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
            <FeatureCard
              icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
              title="Find Workers"
              description="Discover skilled professionals for different types of work."
            />

            <FeatureCard
              icon={<Truck className="h-4 w-4 sm:h-5 sm:w-5" />}
              title="Order Materials"
              description="Get construction and work-related materials from local sellers."
            />

            <FeatureCard
              icon={<Zap className="h-4 w-4 sm:h-5 sm:w-5" />}
              title="Simple Experience"
              description="Everything is designed to make your everyday work easier."
            />

            <FeatureCard
              icon={<ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />}
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
        <div className="mx-auto w-full max-w-7xl px-3 pb-5 sm:px-5 sm:pb-7 lg:px-8">
          <div className="relative w-full overflow-hidden rounded-2xl bg-linear-to-br from-green-700 via-green-600 to-emerald-500 px-5 py-6 text-white shadow-xl sm:rounded-3xl sm:px-8 sm:py-8">
            {/* Decorative Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />

            <div className="relative flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-10">
              {/* LEFT CONTENT */}
              <div className="w-full text-center lg:text-left">
                <div className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                  <span className="text-[9px] font-bold tracking-[0.18em] text-white sm:text-[10px]">
                    WORKKERZ MOBILE APP
                  </span>
                </div>

                <h2 className="max-w-xl text-2xl font-black leading-[1.1] tracking-tight sm:text-3xl lg:text-[34px]">
                  Workkerz, right in your pocket.
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-5 text-green-50 sm:text-[15px] lg:mx-0">
                  Book trusted workers, manage your work and get quick services
                  — all from the Workkerz Android app.
                </p>

                {/* BUTTON AREA */}
                <div className="mt-5 flex w-full items-center justify-center gap-3 sm:justify-start">
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-12 shrink-0 items-center gap-2.5 rounded-xl bg-white px-5 text-green-700 shadow-lg shadow-green-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-50 hover:shadow-xl active:translate-y-0"
                  >
                    <Download className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-y-0.5" />

                    <div className="text-left leading-none">
                      <span className="mb-1 block text-[8px] font-semibold tracking-wide text-green-600">
                        GET IT ON
                      </span>
                      <span className="block text-[15px] font-extrabold tracking-tight">
                        Google Play
                      </span>
                    </div>
                  </a>

                  <div className="flex shrink-0 items-center gap-2 text-[10px] font-medium text-green-50 sm:text-[11px]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>

                    <span className="whitespace-nowrap">
                      Android available now
                    </span>
                  </div>
                </div>

                {/* FEATURES */}
                <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-medium text-green-50 sm:text-xs lg:justify-start">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Easy Booking
                  </span>

                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Workers
                  </span>

                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Quick Service
                  </span>
                </div>
              </div>

              {/* =========================================================
            REALISTIC PHONE MOCKUP — UNCHANGED
        ========================================================= */}
              <div className="relative flex shrink-0 justify-center lg:w-[260px]">
                <div className="relative w-[145px] rotate-[3deg] transition-transform duration-500 hover:rotate-0 sm:w-[175px] lg:w-[195px]">
                  {/* Side frame */}
                  <div className="absolute -right-[3px] top-[14%] z-0 h-[72%] w-[5px] rounded-r-md bg-gradient-to-b from-slate-300 via-slate-700 to-slate-400" />

                  {/* Volume buttons */}
                  <div className="absolute -left-[4px] top-[23%] z-0 h-7 w-[4px] rounded-l-md bg-slate-500" />
                  <div className="absolute -left-[4px] top-[33%] z-0 h-9 w-[4px] rounded-l-md bg-slate-500" />
                  <div className="absolute -left-[4px] top-[42%] z-0 h-9 w-[4px] rounded-l-md bg-slate-500" />

                  {/* Main Phone */}
                  <div className="relative z-10 rounded-[1.6rem] border border-slate-400 bg-gradient-to-br from-slate-300 via-slate-900 to-slate-500 p-[3px] shadow-[0_22px_45px_rgba(0,0,0,0.4)]">
                    {/* Black bezel */}
                    <div className="rounded-[1.4rem] bg-black p-[3px]">
                      {/* Screen */}
                      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.2rem] bg-white">
                        <Image
                          src="/mock/app.jpeg"
                          alt="Workkerz mobile app preview"
                          fill
                          sizes="195px"
                          priority
                          className="object-cover object-top"
                        />

                        {/* Dynamic Island */}
                        <div className="absolute left-1/2 top-[6px] z-30 h-[12px] w-[43px] -translate-x-1/2 rounded-full bg-black" />

                        {/* Glass reflection */}
                        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                      </div>
                    </div>

                    {/* Metallic highlight */}
                    <div className="pointer-events-none absolute inset-[2px] rounded-[1.5rem] border border-white/20" />
                  </div>

                  {/* Shadow */}
                  <div className="absolute -bottom-4 left-1/2 -z-10 h-7 w-[80%] -translate-x-1/2 rounded-full bg-black/30 blur-xl" />
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
        <div className="mx-auto w-full max-w-7xl px-3 pb-5 sm:px-5 sm:pb-7 lg:px-8">
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-[1.5rem]">
            {/* HEADER */}

            <div className="border-b border-slate-100 bg-slate-50 px-4 py-4 sm:px-7 sm:py-5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 sm:h-10 sm:w-10 sm:rounded-xl">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-green-600 sm:text-[9px]">
                    Support & Contact
                  </p>

                  <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                    Need help with Workkerz?
                  </h2>

                  <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:max-w-2xl sm:text-xs sm:leading-5">
                    For support, business enquiries, technical assistance or
                    other Workkerz related queries, contact our team.
                  </p>
                </div>
              </div>
            </div>

            {/* CONTACT CARDS */}

            <div className="grid gap-2 p-3 sm:gap-3 sm:p-5 lg:grid-cols-3">
              {/* EMAIL */}

              <a
                href="mailto:worishecosystem@gmail.com"
                className="group rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-green-200 hover:bg-green-50 sm:p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm sm:h-9 sm:w-9">
                  <Mail className="h-4 w-4" />
                </div>

                <p className="mt-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  Email Support
                </p>

                <p className="mt-0.5 break-all text-xs font-bold text-slate-800 group-hover:text-green-700 sm:text-sm">
                  worishecosystem@gmail.com
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                  Contact us by email
                </p>
              </a>

              {/* PHONE */}

              <a
                href="tel:7000543603"
                className="group rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-green-200 hover:bg-green-50 sm:p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm sm:h-9 sm:w-9">
                  <Phone className="h-4 w-4" />
                </div>

                <p className="mt-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  Contact
                </p>

                <p className="mt-0.5 text-xs font-bold text-slate-800 group-hover:text-green-700 sm:text-sm">
                  7000543603
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                  Call our support team
                </p>
              </a>

              {/* COMPANY */}

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm sm:h-9 sm:w-9">
                  <Building2 className="h-4 w-4" />
                </div>

                <p className="mt-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                  Company
                </p>

                <p className="mt-0.5 text-xs font-black text-slate-800 sm:text-sm">
                  WORISH ECOSYSTEM PRIVATE LIMITED
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                  Workkerz
                </p>
              </div>
            </div>

            {/* ADDRESS */}

            <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-7 sm:py-5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm sm:h-9 sm:w-9">
                  <Building2 className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
                    Office Address
                  </p>

                  <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-700 sm:text-xs sm:leading-5">
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
        <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            {/* BRAND */}
            <div className="flex min-w-0 items-center gap-2.5">
              <Image
                src="/WORKKERZ (1).png"
                alt="Workkerz"
                width={100}
                height={35}
                className="h-7 w-auto shrink-0 object-contain sm:h-8"
              />

              <span className="truncate text-[9px] text-slate-400 sm:text-[11px]">
                Powered by Worish Ecosystem Pvt. Ltd.
              </span>
            </div>

            {/* COMPANY */}
            <div className="shrink-0 text-right">
              <p className="text-[9px] font-bold leading-tight tracking-wide text-slate-500 sm:text-[10px]">
                WORISH ECOSYSTEM PRIVATE LIMITED
              </p>

              <p className="mt-1 text-[8px] leading-tight text-slate-400 sm:text-[10px]">
                © 2026 Workkerz. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* LEGAL */}
          <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3">
            <a
              href="/privacy-policy"
              className="text-[9px] font-semibold text-blue-600 transition-colors hover:text-green-600 sm:text-xs"
            >
              Privacy Policy
            </a>

            <span className="h-3 w-px shrink-0 bg-slate-200" />

            <a
              href="/terms"
              className="text-[9px] font-semibold text-blue-600 transition-colors hover:text-green-600 sm:text-xs"
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
    <div className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 sm:h-10 sm:w-10 sm:rounded-xl">
        {icon}
      </div>

      <h3 className="mt-2 text-xs font-bold sm:mt-3 sm:text-sm lg:text-base">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
        {description}
      </p>
    </div>
  );
}
