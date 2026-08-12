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
import HomeHero from "../components/HomeHero";
import HomeServices from "../components/home/HomeServices";
import HomeCategories from "../components/HomeCategories";
import { useAdmin } from "../components/context/AdminContext";
export default function Home() {
  const router = useRouter();
  const { workers } = useAdmin();

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
  const featuredWorkers = (() => {
    const availableWorkers = (workers || []).filter((w) => w.available);

    // Group workers by category
    const grouped = availableWorkers.reduce(
      (acc, worker) => {
        const category = worker.category || "Other";

        if (!acc[category]) acc[category] = [];
        acc[category].push(worker);

        return acc;
      },
      {} as Record<string, typeof availableWorkers>,
    );

    // Take one worker from each category first
    const mixed: typeof availableWorkers = [];

    Object.values(grouped).forEach((list) => {
      if (list.length) mixed.push(list[0]);
    });

    // Fill remaining slots with other workers
    Object.values(grouped).forEach((list) => {
      list.slice(1).forEach((worker) => {
        if (mixed.length < 12) mixed.push(worker);
      });
    });

    return mixed.slice(0, 12);
  })();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
  {/* Hero Section */}
  <HomeBanner />

  {/* New Big Category Section */}
  <section className="mt-4 sm:mt-6 md:mt-8">
    <HomeCategories />
  </section>

  {/* Home Hero */}
  <section className="py-4 sm:py-5">
    <div className="mx-auto px-3 sm:px-4">
      <HomeHero />
    </div>
  </section>

  {/* Home Services */}
  <div className="pb-8">
    <HomeServices workers={workers} />
  </div>

  <BottomGreeting />
</div>
  );
}
