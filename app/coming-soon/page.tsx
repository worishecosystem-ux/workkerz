import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Smartphone,
  Play,
  Users,
  ShieldCheck,
  Wrench,
  Truck,
  Hammer,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-100">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            <Sparkles className="h-4 w-4" />
            Coming Soon
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900">
            Workkerz Mobile App
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            India's workforce marketplace for booking verified workers and
            purchasing construction materials from trusted local suppliers.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <button
              disabled
              className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-3 text-white shadow-lg opacity-80 cursor-not-allowed"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Play className="h-6 w-6 fill-current" />
              </div>

              <div className="flex flex-col items-start leading-none">
                <span className="text-xs text-slate-300">
                  Coming Soon on
                </span>
                <span className="text-base font-semibold">
                  Google Play
                </span>
              </div>

              <span className="rounded-full bg-yellow-400/20 px-2.5 py-1 text-xs font-semibold text-yellow-300">
                Soon
              </span>
            </button>
          </div>
        </section>

        {/* Cards */}
        <section className="mt-20 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-green-100 bg-white/70 p-8 backdrop-blur shadow-xl">
            <Image
              src="/WORKKERZ (1).png" // change if your logo filename is different
              alt="Workkerz Logo"
              width={100}
              height={42}
              className="object-contain"
              priority
            />

            <p className="mt-4 text-slate-600 leading-7">
              Connect with verified professionals for home services,
              construction work and daily labour.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Electrician",
                "Plumber",
                "Painter",
                "Carpenter",
                "Mason",
                "Cleaning",
                "AC Repair",
                "Gardener",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-green-50 px-4 py-3 font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-green-100 bg-white/70 p-8 backdrop-blur shadow-xl">
            <div className="flex items-center gap-3">
              <Image
                src="/aurixapp.png"
                alt="E-Aurix Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />

              <h2 className="text-2xl font-bold text-slate-900">E-Aurix</h2>
            </div>

            <p className="mt-4 text-slate-600 leading-7">
              Construction materials delivered from nearby trusted suppliers.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Cement",
                "Bricks",
                "Sand",
                "Steel",
                "Paint",
                "Tiles",
                "Electrical",
                "Plumbing",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-emerald-50 px-4 py-3 font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}

        <section className="mt-20">
          <h2 className="text-center text-3xl font-bold">
            Why Choose Workkerz
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                title: "Verified Workers",
                desc: "Trusted professionals near you",
              },
              {
                icon: ShieldCheck,
                title: "Secure Platform",
                desc: "Safe booking experience",
              },
              {
                icon: Wrench,
                title: "Instant Booking",
                desc: "Book workers in minutes",
              },
              {
                icon: Truck,
                title: "Material Delivery",
                desc: "Construction essentials",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
              >
                <item.icon className="mb-5 h-10 w-10 text-green-600" />

                <h3 className="text-xl font-bold">{item.title}</h3>

                <p className="mt-3 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}

        <section className="mt-24 rounded-4xl bg-linear-to-r from-green-700 to-emerald-600 p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-black">Mobile App Launching Soon</h2>

          <p className="mx-auto mt-5 max-w-xl text-lg text-green-100">
            We're putting the finishing touches on the Workkerz app. Stay tuned
            for the official launch on Android.
          </p>

          <button
            disabled
            className="mt-10 rounded-xl bg-white px-8 py-4 font-bold text-green-700 opacity-80"
          >
            Google Play • Coming Soon
          </button>
        </section>

        {/* Footer */}

        <footer className="mt-20 border-t border-slate-200 py-8 text-center text-slate-500">
          <h3 className="text-xl font-bold text-slate-900">Workkerz</h3>

          <p className="mt-2">Powered by Worish Ecosystem Pvt. Ltd.</p>

         <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
  <Link
    href="/privacy-policy"
    className="font-medium text-green-600 hover:text-green-700 hover:underline"
  >
    Privacy Policy
  </Link>

  <span className="text-slate-300">|</span>

  <Link
    href="/delete-account"
    className="font-medium text-green-600 hover:text-green-700 hover:underline"
  >
    Delete Account
  </Link>
</div>

          <p className="mt-4">© 2026 Workkerz. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
