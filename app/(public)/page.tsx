"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeBanner from "../components/HomeBanner";
import {
  Star,
  CheckCircle,
  Shield,
  ArrowRight,
  Users,
  Store,
} from "lucide-react";
import { FeaturedWorkerSmallCard } from "../components/FeaturedWorkerSmallCard";

import { serviceCategories } from "@/app/data/workers";
import { useAdmin } from "../components/context/AdminContext";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
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
    .filter((worker) => worker.available)
    .slice(0, 12);

  const categoryImages: Record<string, string> = {
    Labour: "/categories/1L.png",
    Driver: "/categories/1d.png",
    Mechanic: "/categories/1m.webp",
    Washer: "/categories/1w.png",
    "Computer Operator": "/categories/1c.webp",
    "Office Worker": "/categories/1c.webp",
    "Home Services": "/categories/1h.png",
    "Salon & Beauty": "/categories/1sa.png",
    Restaurant: "/categories/1r.webp",
    Contractor: "/categories/1c.jpg",
    Factory: "/categories/image copy.png",
    Security: "/categories/1sec.jpg",
    "Event Services": "/categories/1e.avif",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HomeBanner />
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-2xl font-bold text-[#0F172A]">
              All work Categories
            </h2>

            <Link
              href="/browse"
              className="text-[#FF5C39] text-sm font-semibold"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6">
            {serviceCategories.map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.id}`}
                className="flex flex-col items-center group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] bg-[#EAF1FF] overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <img
                    src={categoryImages[category.id]}
                    alt={category.label}
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                <span className="mt-2 text-[11px] md:text-sm text-center font-medium text-slate-700 line-clamp-1">
                  {category.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gray-200/60 backdrop-blur-xl border border-white/80 rounded-[20px] shadow-[0_8px_32px_rgba(15,23,42,0.08)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#FFF5F3] text-[#FF5C39] px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ FEATURED WORKERS
                </span>

                <h2 className="mt-3 text-2xl md:text-4xl font-black text-[#0F172A]">
                  Top Rated Professionals
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Verified workers trusted by thousands
                </p>
              </div>

              <Link
                href="/browse"
                className="hidden md:flex items-center gap-2 px-5 h-11 rounded-2xl bg-[#0F172A] text-white font-semibold"
              >
                Explore All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Workers */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {featuredWorkers.map((worker) => (
                  <FeaturedWorkerSmallCard key={worker.id} worker={worker} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-blue-500">
                Skilled workers available across India
              </p>

              <Link
                href="/browse"
                className="md:hidden inline-flex items-center whitespace-nowrap gap-1 px-3 py-2 rounded-2xl bg-[#1aa2e6]/10 border border-[#1aa2e6]/20 text-[#1aa2e6] text-xs font-bold"
              >
                View All <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
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

      {/* CTA Banner */}
      <section className="py-5 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-white text-3xl sm:text-4xl font-bold mb-2">
              Ready to Get Started?
            </h2>

            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Whether you're looking for work, hiring skilled workers, or
              selling materials — Workkerz helps you grow faster.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {[
                {
                  title: "Book a Worker",
                  href: "/browse",
                  icon: ArrowRight,
                  iconColor: "text-[#FF5C39]",
                },
                {
                  title: "Become a Worker",
                  href: "https://forms.gle/ncSadKLHkuM3iqRRA",
                  icon: Users,
                  iconColor: "text-emerald-400",
                },
                {
                  title: "Become a Seller",
                  href: "https://forms.gle/3uBc51yk2mbe8gCdA",
                  icon: Store,
                  iconColor: "text-sky-400",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : "_self"}
                    className="group flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>

                    <span className="flex-1 text-white text-sm font-semibold">
                      {item.title}
                    </span>

                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
