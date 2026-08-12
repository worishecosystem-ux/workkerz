"use client";

import Image from "next/image";
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  Truck,
  Users,
  User,
  Search,
  CheckCircle2,
  ArrowDown,
  Play,
} from "lucide-react";
import MobileAppMockup from "@/app/components/MobileAppMockup";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.workkerz.app&pcampaignid=web_share";

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <Image
              src="/WORKKERZ (1).png"
              alt="Workkerz"
              width={115}
              height={44}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Get App
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* LEFT */}
            <div>
              {/* LIVE BADGE */}
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3.5 py-2 text-xs font-bold text-green-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Workkerz App is Live
              </div>

              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                Your work.
                <br />
                <span className="text-green-600">Your workers.</span>
                <br />
                Your materials.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Workkerz brings workers and work-related materials together in
                one simple mobile app.
              </p>

              {/* DOWNLOAD BUTTON */}
              <div className="mt-8">
                <a
                  href="https://play.google.com/store/apps/details?id=com.workkerz.app&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Workkerz on Google Play"
                  className="
    inline-flex
    items-center
    gap-3
    rounded-xl
    bg-black
    px-4
    py-2.5
    text-white
    shadow-lg
    transition
    duration-200
    hover:scale-[1.02]
    hover:bg-slate-900
  "
                >
                  {/* Google Play Icon */}
                  <div className="flex h-9 w-9 items-center justify-center">
                    <Play className="h-7 w-7 fill-white text-white" />
                  </div>

                  <div className="text-left leading-none">
                    <span className="block text-[9px] font-medium uppercase tracking-wide text-white/70">
                      GET IT ON
                    </span>

                    <span className="mt-1 block text-[17px] font-semibold tracking-tight text-white">
                      Google Play
                    </span>
                  </div>
                </a>
              </div>

              {/* TRUST */}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Easy to use
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Secure platform
                </div>

                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  Android App
                </div>
              </div>
            </div>

            {/* APP VISUAL */}
            <div className="relative">
              <MobileAppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-green-600">
            One app
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Everything you need for work
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Workkerz makes it easier to find workers and get the materials you
            need for your work.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* CARD 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Users className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-bold">Find Workers</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Discover skilled professionals for different types of work.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Truck className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-bold">Order Materials</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Get construction and work-related materials from local sellers.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Zap className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-bold">Simple Experience</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Everything is designed to make your everyday work easier.
            </p>
          </div>

          {/* CARD 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-bold">Trusted Platform</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              A dedicated platform built around workers and work-related needs.
            </p>
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD CTA */}
      <section id="download" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-8 lg:px-10">
          {/* Background glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-10">
            {/* LEFT CONTENT */}
            <div className="max-w-2xl flex-1 text-center lg:text-left">
              {/* Small badge */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                WORKKERZ MOBILE APP
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-[2.15rem]">
                Workkerz, right in your pocket.
              </h2>

              <p className="mt-2.5 max-w-lg text-sm leading-6 text-green-50 sm:text-[15px] lg:text-base">
                Book workers, manage your work and stay connected — all from the
                Workkerz Android app.
              </p>

              {/* CTA ROW */}
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

            {/* RIGHT — SMALL MOBILE CLONE */}
            <div className="relative flex w-full shrink-0 justify-center lg:w-[260px] lg:justify-end">
              {/* Glow behind phone */}
              <div className="absolute right-8 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-white/15 blur-3xl" />

              {/* Phone */}
              <div className="relative z-10 w-[145px] rotate-[3deg] transition-transform duration-500 hover:rotate-0 sm:w-[155px]">
                {/* Phone frame */}
                <div className="rounded-[2rem] border-[5px] border-slate-900 bg-slate-900 p-1.5 shadow-2xl">
                  {/* Screen */}
                  <div className="relative aspect-[9/18.5] overflow-hidden rounded-[1.55rem] bg-white">
                    {/* Dynamic island / camera */}
                    <div className="absolute left-1/2 top-1.5 z-20 h-4 w-12 -translate-x-1/2 rounded-full bg-slate-900" />

                    {/* App preview */}
                    <div className="h-full bg-slate-50">
                      {/* App header */}
                      <div className="bg-green-600 px-3 pb-4 pt-7 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[6px] opacity-80">
                              Welcome back
                            </p>
                            <p className="mt-0.5 text-[9px] font-black">
                              Find a Worker
                            </p>
                          </div>

                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                            <User className="h-2.5 w-2.5" />
                          </div>
                        </div>

                        {/* Search */}
                        <div className="mt-3 flex h-6 items-center gap-1.5 rounded-lg bg-white px-2 text-slate-400">
                          <Search className="h-2.5 w-2.5" />
                          <span className="text-[6px]">Search workers...</span>
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="px-2.5 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] font-black text-slate-800">
                            Popular Services
                          </span>
                          <span className="text-[5px] font-semibold text-green-600">
                            View all
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-4 gap-1.5">
                          {["Mason", "Electrician", "Plumber", "Painter"].map(
                            (item) => (
                              <div
                                key={item}
                                className="rounded-lg border border-slate-100 bg-white p-1.5 text-center shadow-sm"
                              >
                                <div className="mx-auto h-5 w-5 rounded-md bg-green-50" />
                                <p className="mt-1 truncate text-[5px] font-bold text-slate-600">
                                  {item}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Worker card */}
                      <div className="px-2.5 pt-3">
                        <p className="text-[7px] font-black text-slate-800">
                          Top Workers
                        </p>

                        <div className="mt-2 rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
                          <div className="flex gap-2">
                            <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-200" />

                            <div className="min-w-0 flex-1">
                              <p className="text-[7px] font-black text-slate-800">
                                Rajesh Kumar
                              </p>

                              <p className="mt-0.5 text-[5px] text-slate-400">
                                Mason • 5+ Years
                              </p>

                              <div className="mt-1 flex items-center gap-1">
                                <span className="rounded bg-green-50 px-1 py-0.5 text-[5px] font-bold text-green-600">
                                  ★ 4.8
                                </span>

                                <span className="text-[5px] text-slate-400">
                                  ₹500/day
                                </span>
                              </div>
                            </div>
                          </div>

                          <button className="mt-2 h-5 w-full rounded-md bg-green-600 text-[6px] font-bold text-white">
                            Book Worker
                          </button>
                        </div>
                      </div>

                      {/* Bottom nav */}
                      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-2 py-2">
                        <div className="flex justify-around">
                          <div className="h-1.5 w-5 rounded-full bg-green-600" />
                          <div className="h-1.5 w-5 rounded-full bg-slate-200" />
                          <div className="h-1.5 w-5 rounded-full bg-slate-200" />
                          <div className="h-1.5 w-5 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone shadow */}
                <div className="absolute -bottom-4 left-1/2 -z-10 h-8 w-28 -translate-x-1/2 rounded-full bg-black/30 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/WORKKERZ (1).png"
              alt="Workkerz"
              width={95}
              height={35}
              className="h-8 w-auto object-contain"
            />

            <span className="text-xs text-slate-400">
              Powered by Worish Ecosystem Pvt. Ltd.
            </span>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 Workkerz. All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
