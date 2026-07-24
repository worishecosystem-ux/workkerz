import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeBottomGreeting() {
  return (
    <section className="relative mt-12 overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 px-6 py-14 text-white">
      {/* Background Glow */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur">
          E-Aurix
        </span>

        <h2 className="mt-5 text-4xl font-extrabold md:text-5xl">
          Build Better.
        </h2>

        <p className="mt-3 max-w-md text-orange-100">
          Everything your project needs.
        </p>

        <Link
          href="/materials"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-orange-600 transition hover:scale-105 active:scale-95"
        >
          Explore Materials
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}