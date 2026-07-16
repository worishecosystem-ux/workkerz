"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeBanner from "../components/HomeBanner";
import SplashScreen from "@/app/components/SplashScreen";

import { ArrowRight } from "lucide-react";
import { FeaturedWorkerSmallCard } from "../components/FeaturedWorkerSmallCard";

import WorkerLive from "../components/WorkerLive";
import { useAdmin } from "../components/context/AdminContext";
export default function Home() {
  const [searchQuery] = useState("");
  const [selectedCategory] = useState("");
  const router = useRouter();
  const { workers } = useAdmin();
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/browse?${params.toString()}`);
  };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const splashShown = sessionStorage.getItem("workkerz_splash");

    if (!splashShown) {
      setLoading(true);

      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("workkerz_splash", "true");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const featuredWorkers = (workers || [])
    .filter((worker) => worker.available)
    .slice(0, 8);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}

      <HomeBanner />

      <WorkerLive />

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
    </div>
  );
}
