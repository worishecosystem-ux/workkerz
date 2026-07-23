import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BottomGreeting() {
  return (
    <section className="relative -mb-[calc(80px+env(safe-area-inset-bottom))] overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.12),transparent_45%)]" />

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-sm tracking-[0.25em] uppercase text-white/70">
          Workkerz
        </p>

        <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
          Every booking
          <br />
          changes someone's day.
        </h2>

        <p className="mt-5 text-base text-white/85">
          Thank you for believing in local workers.
          <br />
          Together, we're creating more work with dignity.
        </p>

        <div className="mt-10 h-px w-20 mx-auto bg-white/30" />

        <p className="mt-6 text-sm text-white/70">Built with ❤️ in India.</p>
      </div>
    </section>
  );
}
