"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeBanner from "../components/HomeBanner";
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Users,
  Briefcase,
  TrendingUp,
  Hammer,
  Droplets,
  Zap,
  Car,
  Quote,
  Store,
} from "lucide-react";


import { useAdmin } from "../components/context/AdminContext";
import { WorkerCard } from "../components/WorkerCard";

const stats = [
  { value: "12,000+", label: "Verified Workers", icon: Users },
  { value: "98%", label: "Satisfaction Rate", icon: TrendingUp },
  { value: "50,000+", label: "Jobs Completed", icon: Briefcase },
  { value: "24/7", label: "Support Available", icon: Clock },
];

const howItWorks = [
  {
    step: "01",
    title: "Describe Your Job",
    description:
      "Tell us what type of work you need done. Choose a service category and provide details about your project.",
    icon: Search,
    color: "#FF5C39",
  },
  {
    step: "02",
    title: "Match with Experts",
    description:
      "Browse through our verified professionals. Filter by ratings, availability, location, and hourly rate.",
    icon: Users,
    color: "#3B82F6",
  },
  {
    step: "03",
    title: "Book & Get It Done",
    description:
      "Schedule your preferred time, make a secure payment, and your worker shows up ready to get the job done.",
    icon: CheckCircle,
    color: "#10B981",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Rachel Thompson",
    role: "Homeowner, Brooklyn",
    photo:
      "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
    rating: 5,
    comment:
      "Workkerz saved the day when my pipes burst at midnight. Found a plumber in under 20 minutes who fixed everything. The platform is incredibly easy to use!",
  },
  {
    id: 2,
    name: "Carlos Mendez",
    role: "Restaurant Owner, Manhattan",
    photo:
      "https://images.unsplash.com/photo-1630670401138-9a5c91abad18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
    rating: 5,
    comment:
      "We use Workkerz regularly for electrical maintenance. The workers are always professional, certified, and the pricing is transparent. Highly recommended.",
  },
  {
    id: 3,
    name: "Jennifer Liu",
    role: "Property Manager, Queens",
    photo:
      "https://images.unsplash.com/photo-1752070182361-9fa562ed7f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
    rating: 5,
    comment:
      "Managing multiple properties means I need reliable workers fast. Workkerz has been a game-changer — quality workers, great pricing, and amazing support.",
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  construction: Hammer,
  plumbing: Droplets,
  electrical: Zap,
  driving: Car,
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();
  const { workers } = useAdmin();
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/browse?${params.toString()}`);
  };

  const featuredWorkers = (workers || [])
    .filter((w) => w.available)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HomeBanner />

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[#FF5C39] text-xs uppercase tracking-widest font-semibold">
              Simple Process
            </span>

            <h2 className="text-[#0F172A] mt-3 text-3xl sm:text-[2.2rem] font-bold tracking-tight">
              How Workkerz Works
            </h2>

            <p className="text-[#64748B] mt-4 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
              Get your job done in three simple steps. No hassle, no hidden
              fees.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0" />

            {howItWorks.map((step, i) => {
              const Icon = step.icon;

              return (
                <div key={step.step} className="relative text-center group">
                  {/* Icon Box */}
                  <div className="relative inline-block mb-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300"
                      style={{ backgroundColor: step.color }}
                    >
                      <Icon className="w-9 h-9 text-white" />
                    </div>

                    {/* Step Number */}
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center border-2 border-white text-[11px] font-bold shadow">
                      {i + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[#0F172A] mb-2 text-base sm:text-lg font-semibold">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#64748B] text-sm leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-[#FF5C39] hover:bg-[#e54e2e] text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Find a Worker Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      {/* Featured Workers */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span
                className="text-[#FF5C39] text-sm uppercase tracking-widest"
                style={{ fontWeight: 600 }}
              >
                Top Rated
              </span>
              <h2
                className="text-[#0F172A] mt-2"
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Featured Professionals
              </h2>
              <p className="text-[#64748B] mt-2">
                Hand-picked top-rated workers available now
              </p>
            </div>
            <Link
              href="/browse"
              className="hidden md:flex items-center gap-2 text-[#FF5C39] text-sm hover:gap-3 transition-all"
              style={{ fontWeight: 600 }}
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Fully Verified",
                description:
                  "Every worker on our platform is background-checked, licensed, and insured before they can accept any job.",
                color: "#3B82F6",
                bgColor: "#EFF6FF",
              },
              {
                icon: Star,
                title: "Rated & Reviewed",
                description:
                  "Real reviews from real customers. Our transparent rating system ensures quality and accountability.",
                color: "#F59E0B",
                bgColor: "#FFFBEB",
              },
              {
                icon: CheckCircle,
                title: "Satisfaction Guaranteed",
                description:
                  "Not happy with the work? We'll make it right. Our guarantee means you only pay for quality work.",
                color: "#10B981",
                bgColor: "#ECFDF5",
              },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="flex gap-5 p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: badge.bgColor }}
                  >
                    <Icon className="w-6 h-6" style={{ color: badge.color }} />
                  </div>
                  <div>
                    <h3
                      className="text-[#0F172A] mb-2"
                      style={{ fontWeight: 700 }}
                    >
                      {badge.title}
                    </h3>
                    <p className="text-[#64748B] text-sm leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span
              className="text-[#FF5C39] text-sm uppercase tracking-widest"
              style={{ fontWeight: 600 }}
            >
              Testimonials
            </span>
            <h2
              className="text-[#0F172A] mt-2"
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <Quote className="w-8 h-8 text-[#FF5C39]/20 mb-4" />
                <p className="text-[#334155] text-sm leading-relaxed mb-5">
                  {t.comment}
                </p>
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div
                      className="text-[#0F172A] text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {t.name}
                    </div>
                    <div className="text-[#94A3B8] text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>

            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              Whether you're looking for work, hiring skilled workers, or
              selling materials — Workkerz helps you grow faster.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#FF5C39]/10 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-[#FF5C39]" />
              </div>

              <h3 className="text-white text-lg font-semibold mb-2">
                Book a Worker
              </h3>

              <p className="text-gray-400 text-sm mb-5">
                Find skilled workers instantly for your daily or monthly needs.
              </p>

              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 border border-[#FF5C39] hover:bg-[#b57163]/50 text-white px-6 py-3 rounded-xl text-sm font-semibold w-full"
              >
                Get Started
              </Link>
            </div>

            {/* Worker */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>

              <h3 className="text-white text-lg font-semibold mb-2">
                Become a Worker
              </h3>

              <p className="text-gray-400 text-sm mb-5">
                Get daily job opportunities and grow your income with Workkerz.
              </p>

              <Link
                href="https://forms.gle/ncSadKLHkuM3iqRRA"
                className="inline-flex items-center justify-center gap-2 border border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 px-6 py-3 rounded-xl text-sm font-semibold w-full"
              >
                Join as Worker
              </Link>
            </div>

            {/* Seller */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Store className="w-6 h-6 text-sky-400" />
              </div>

              <h3 className="text-white text-lg font-semibold mb-2">
                Become a Seller
              </h3>

              <p className="text-gray-400 text-sm mb-5">
                Sell construction materials & tools directly to customers.
              </p>

              <Link
                href="https://forms.gle/3uBc51yk2mbe8gCdA"
                className="inline-flex items-center justify-center gap-2 border border-sky-400 text-sky-400 hover:bg-sky-400/10 px-6 py-3 rounded-xl text-sm font-semibold w-full"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
