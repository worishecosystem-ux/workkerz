"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import BottomGreeting from "../components/home/BottomGreeting";
const HomeBanner = dynamic(() => import("../components/HomeBanner"), {
  ssr: false,
});
import SplashScreen from "@/app/components/SplashScreen";
import { ArrowRight } from "lucide-react";
import { FeaturedWorkerSmallCard } from "../components/FeaturedWorkerSmallCard";
import HomeServices from "../components/home/HomeServices";
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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}

      <HomeBanner />

      <WorkerLive />

      <section className="py-5">
        <div className=" mx-auto px-4">
          <div className="">
            {/* Header */}

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

            {/* Workers */}
            <div className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {featuredWorkers.map((worker) => (
                  <FeaturedWorkerSmallCard key={worker.id} worker={worker} />
                ))}
              </div>
            </div>

           
          </div>
        </div>
      </section>
      <div className="pb-8">
        <HomeServices workers={workers} />
      </div>
      <>
        {/* Other Sections */}

        <BottomGreeting />
      </>
    </div>
  );
}
