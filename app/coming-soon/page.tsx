"use client";

import Image from "next/image";
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  Truck,
  Users,
  Star,
  CheckCircle2,
  ArrowDown,
  Play
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
      <section id="download" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-green-600 px-6 py-12 text-white sm:px-10 sm:py-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Smartphone className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-3xl font-black sm:text-4xl">
              Download the Workkerz App
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
              Get the Workkerz experience on your Android phone and manage your
              work from one place.
            </p>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-green-700 shadow-xl transition hover:bg-green-50"
            >
              <Download className="h-5 w-5" />
              Download from Google Play
            </a>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-green-100">
              <ArrowDown className="h-4 w-4" />
              Available now on Android
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
