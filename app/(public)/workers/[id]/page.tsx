"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Share } from "@capacitor/share";
import {
  Star,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  Clock3,
  Briefcase,
  CalendarDays,
  Share2,
  Heart,
  Award,
  ThumbsUp,
  BriefcaseBusiness,
  Building2,
  BadgeCheck,
  Check,
  BadgeIndianRupee,
} from "lucide-react";

import { getWorkerById, type Worker } from "@/app/data/workers";
import { supabase } from "@/lib/supabase";
const categoryColors: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  Labour: {
    color: "#F97316",
    bg: "#FFF5EB",
    label: "Labour",
  },

  Driver: {
    color: "#16A34A",
    bg: "#F0FDF4",
    label: "Driver",
  },

  Mechanic: {
    color: "#2563EB",
    bg: "#EFF6FF",
    label: "Mechanic",
  },

  Washer: {
    color: "#0891B2",
    bg: "#ECFEFF",
    label: "Washer",
  },

  "Computer Operator": {
    color: "#7C3AED",
    bg: "#F5F3FF",
    label: "Computer Operator",
  },

  "Office Worker": {
    color: "#DB2777",
    bg: "#FDF2F8",
    label: "Office Worker",
  },

  "Home Services": {
    color: "#059669",
    bg: "#ECFDF5",
    label: "Home Services",
  },

  "Salon & Beauty": {
    color: "#E11D48",
    bg: "#FFF1F2",
    label: "Salon & Beauty",
  },

  Restaurant: {
    color: "#DC2626",
    bg: "#FEF2F2",
    label: "Restaurant",
  },

  "Home Contractor": {
    color: "#D97706",
    bg: "#FFF7ED",
    label: "Home Contractor",
  },

  Construction: {
    color: "#B45309",
    bg: "#FFFBEB",
    label: "Construction",
  },

  Factory: {
    color: "#475569",
    bg: "#F8FAFC",
    label: "Factory",
  },

  Roads: {
    color: "#A16207",
    bg: "#FEFCE8",
    label: "Roads",
  },

  Delivery: {
    color: "#0F766E",
    bg: "#F0FDFA",
    label: "Delivery",
  },

  Security: {
    color: "#1E3A8A",
    bg: "#EFF6FF",
    label: "Security",
  },

  Healthcare: {
    color: "#0284C7",
    bg: "#F0F9FF",
    label: "Healthcare",
  },

  "Event Services": {
    color: "#9333EA",
    bg: "#FAF5FF",
    label: "Event Services",
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function WorkerProfile() {
  const { id } = useParams();
  const workerId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const [saved, setSaved] = useState(false);

  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "portfolio">(
    "about",
  );

  const [worker, setWorker] = useState<Worker | null>(null);

  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  /* LOADING */

  const workerReviews = reviews;

  /* FETCH DATA */

  useEffect(() => {
    if (id) {
      loadWorker();
      loadReviews();
    }
  }, [id]);

  const loadWorker = async () => {
    try {
      setLoading(true);

      const data = await getWorkerById(id as string);

      console.log("CURRENT WORKER =>", data);

      setWorker(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadWorker();
      loadReviews();
      checkFavorite();
    }
  }, [id]);

  const checkFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaved(false);
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("customer_id", user.id)
      .eq("worker_id", workerId)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    setSaved(!!data);
  };

  const toggleFavorite = async () => {
    try {
      setFavoriteLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/workers/${workerId}`);
        return;
      }

      // Check in database first
      const { data: existing, error: checkError } = await supabase
        .from("favorites")
        .select("id")
        .eq("customer_id", user.id)
        .eq("worker_id", workerId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;

        setSaved(false);
      } else {
        // Add favorite
        const { error } = await supabase.from("favorites").insert({
          customer_id: user.id,
          worker_id: workerId,
        });

        if (error) throw error;

        setSaved(true);
      }

      // Refresh state from database
      await checkFavorite();
    } catch (error) {
      console.error("Favorite Error:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const loadReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("worker_id", id);

    setReviews(data || []);
  };

  const handleBookNow = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(`/book/${workerId}`)}`);
      return;
    }

    router.push(`/book/${workerId}`);
  };

  const handleShare = async () => {
    if (!worker) return;

    try {
      await Share.share({
        title: `${worker.name} | Workkerz`,
        text: `Book ${worker.name} on Workkerz`,
        url: window.location.href,
        dialogTitle: "Share Worker",
      });
    } catch (error: any) {
      // User cancelled sharing
      if (error?.message?.toLowerCase().includes("cancel")) {
        return;
      }
    }
  };
  /* LOADING */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="flex flex-col items-center">
          {/* LOGO LOADER */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* OUTER RING */}
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />

            {/* SPINNING RING */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FF5C39] border-r-[#FF5C39] animate-spin" />

            {/* INNER GLOW */}
            <div className="w-14 h-14 rounded-2xl bg-[#FF5C39] flex items-center justify-center shadow-lg shadow-orange-200 animate-pulse">
              <span
                className="text-white text-2xl"
                style={{
                  fontWeight: 900,
                }}
              >
                W
              </span>
            </div>
          </div>

          {/* TEXT */}
          <div className="mt-6 text-center">
            <h2
              className="text-[#0F172A]"
              style={{
                fontWeight: 800,
                fontSize: "1.2rem",
              }}
            >
              Loading Workers
            </h2>

            <p className="text-sm text-[#94A3B8] mt-1">
              Preparing Workkerz profile
            </p>
          </div>

          {/* DOTS */}
          <div className="flex items-center gap-2 mt-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C39] animate-bounce" />
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#FF8A65] animate-bounce"
              style={{
                animationDelay: "0.15s",
              }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#FFB199] animate-bounce"
              style={{
                animationDelay: "0.3s",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* NOT FOUND */

  if (!worker) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center pt-16">
        <div className="text-center">
          <h2
            className="text-[#0F172A] mb-2"
            style={{
              fontWeight: 700,
            }}
          >
            Worker not found
          </h2>

          <Link href="/browse" className="text-[#FF5C39] text-sm">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const cat = categoryColors[worker.category];

  // Portfolio items (placeholder)
  const portfolioItems = [
    "https://images.unsplash.com/photo-1774600166432-ba8ac640b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    "https://images.unsplash.com/photo-1660330590022-9f4ff56b63f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  ];

  return (
    <div className="min-h-dvh w-full bg-white overflow-x-hidden">
      <div className="w-screen max-w-none m-0 p-0 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile Card */}
            <div className="bg-white overflow-hidden border-0 lg:border lg:border-gray-100 rounded-none lg:rounded-3xl">
              {/* Cover */}
              <div
                className="h-40 -mt-[env(safe-area-inset-top)]
    pt-[env(safe-area-inset-top)]
  "
                style={{
                  background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)`,
                }}
              />

              <div className="px-2 pb-2">
                {/* Profile */}
                <div className="-mt-12 relative z-10">
                  <div className="flex items-start gap-6">
                    {/* Profile */}
                    <div className="relative shrink-0 px-5">
                      {worker.photo?.trim() ? (
                        <img
                          src={worker.photo}
                          alt={worker.name}
                          className="h-20 w-20 rounded-2xl border-2 border-white bg-slate-100 object-cover-contain shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white bg-slate-100 shadow-lg">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300">
                            <span className="text-lg font-bold text-white">
                              {worker.name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                      )}

                      {worker.available && (
                        <span className="absolute bottom-1 right-5 h-4 w-4 rounded-full border border-white bg-emerald-500" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Name */}
                      <div className="flex items-center gap-1 flex-wrap ">
                        <h1 className="truncate text-lg font-bold text-slate-900">
                          {worker.name}
                        </h1>

                        <div className="relative w-5 h-5">
                          <BadgeCheck className="absolute inset-0 h-5 w-5 fill-cyan-300 text-sky-500" />
                          <Check className="absolute inset-0 m-auto h-3 w-3 text-white stroke-3" />
                        </div>
                      </div>

                      {/* Category + Specialty */}
                      <div className="flex flex-wrap gap-6 mt-">
                        <div
                          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                          style={{
                            backgroundColor: cat.bg,
                            borderColor: `${cat.color}25`,
                            color: cat.color,
                          }}
                        >
                          <BriefcaseBusiness className="h-3.5 w-3.5" />
                          {cat.label}
                        </div>

                        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate max-w-32.5">
                            {worker.specialty}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg bg-amber-50 px-2 py-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                worker.rating >= star
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-slate-200 text-slate-200"
                              }`}
                            />
                          ))}

                          <span className="ml-1 text-xs font-semibold text-slate-900">
                            {worker.rating.toFixed(1)}
                          </span>
                        </div>

                        <span className="text-xs text-slate-500">
                          ({worker.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 mb-5 flex items-center gap-5 px-2">
                  {/* Starting Price Card */}
                  <div className="relative flex-1 overflow-hidden rounded-2xl bg-linear-to-r from-[#FF6B35] via-[#FF7A45] to-[#FF9A62] p-px shadow-md shadow-orange-300/20">
                    <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2">
                      {/* Left */}
                      <div className="flex items-center gap-3 px-5">
                        <BadgeIndianRupee className="h-6 w-6 text-emerald-600" />

                        <div className="flex items-center gap-3">
                          <span className="text-[15px] font-semibold uppercase tracking-wide text-slate-500">
                            Starting Price
                          </span>

                          <span className="h-4 w-px bg-slate-300" />

                          <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-extrabold text-transparent">
                            ₹{worker.startingPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#FF6B35] hover:bg-orange-50 active:scale-95"
                  >
                    <Share2 className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
                {/* Booking Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 px-2">
                      {[
                        {
                          label: "Rating",
                          value: worker.rating,
                          icon: Star,
                          color: "#F59E0B",
                        },
                        {
                          label: "Works",
                          value: `${worker.completedJobs}+`,
                          icon: Briefcase,
                          color: "#3B82F6",
                        },
                        {
                          label: "Experience",
                          value: `${worker.yearsExperience}Y`,
                          icon: Award,
                          color: "#10B981",
                        },
                        {
                          label: "",
                          value: worker.location || "N/A",
                          icon: MapPin,
                          color: "#EF4444",
                        },
                      ].map((stat) => {
                        const Icon = stat.icon;

                        return (
                          <div
                            key={stat.label}
                            className="h-14.5 bg-white border border-slate-100 rounded-2xl px-3 shadow-sm flex items-center"
                          >
                            <div className="flex items-center gap-2 w-full min-w-0">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: `${stat.color}15`,
                                }}
                              >
                                <Icon
                                  className="w-4 h-4"
                                  style={{ color: stat.color }}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-semibold text-slate-900 truncate"
                                  title={String(stat.value)}
                                >
                                  {stat.value}
                                </p>

                                <p className="text-[11px] text-slate-500">
                                  {stat.label}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Trust badges */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <h4
                        className="text-[#0F172A] text-sm mb-4"
                        style={{ fontWeight: 600 }}
                      >
                        Why Book with Confidence
                      </h4>
                      <div className="space-y-3">
                        {[
                          {
                            icon: Shield,
                            text: "Background checked & verified",
                            color: "#3B82F6",
                          },
                          {
                            icon: CheckCircle,
                            text: "Satisfaction guarantee",
                            color: "#10B981",
                          },
                          {
                            icon: Clock,
                            text: "Flexible scheduling options",
                            color: "#8B5CF6",
                          },
                        ].map((badge) => {
                          const Icon = badge.icon;
                          return (
                            <div
                              key={badge.text}
                              className="flex items-center gap-3 text-sm text-[#475569]"
                            >
                              <Icon
                                className="w-4 h-4 shrink-0"
                                style={{ color: badge.color }}
                              />
                              {badge.text}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-20">
              <div className="flex border-b border-gray-100">
                {(["about", "reviews", "portfolio"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm capitalize transition-colors ${
                      activeTab === tab
                        ? "text-[#FF5C39] border-b-2 border-[#FF5C39] bg-orange-50/50"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                    style={{ fontWeight: activeTab === tab ? 600 : 400 }}
                  >
                    {tab}
                    {tab === "reviews" && (
                      <span className="ml-1.5 text-xs bg-gray-100 text-[#64748B] px-1.5 py-0.5 rounded-full">
                        {worker.reviewCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* About Tab */}
                {activeTab === "about" && (
                  <div className="space-y-6">
                    <div>
                      <h3
                        className="text-[#0F172A] mb-3"
                        style={{ fontWeight: 600 }}
                      >
                        About
                      </h3>
                      <p className="text-[#475569] text-sm leading-relaxed">
                        {worker.bio}
                      </p>
                    </div>

                    <div>
                      <h3
                        className="text-[#0F172A] mb-3"
                        style={{ fontWeight: 600 }}
                      >
                        Skills & Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {worker.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-[#F8FAFC] border border-gray-200 text-[#475569] text-sm px-3 py-1.5 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3
                        className="text-[#0F172A] mb-3"
                        style={{ fontWeight: 600 }}
                      >
                        Certifications
                      </h3>
                      <div className="space-y-2">
                        {worker.certifications.map((cert) => (
                          <div key={cert} className="flex items-center gap-2.5">
                            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <span className="text-[#475569] text-sm">
                              {cert}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div>
                    {/* Rating Summary */}
                    <div className="bg-[#F8FAFC] rounded-xl p-5 flex items-center gap-6 mb-6">
                      <div className="text-center">
                        <div
                          className="text-[#0F172A]"
                          style={{
                            fontSize: "3rem",
                            fontWeight: 800,
                            lineHeight: 1,
                          }}
                        >
                          {worker.rating}
                        </div>
                        <StarRating rating={worker.rating} />
                        <div className="text-[#94A3B8] text-xs mt-1">
                          {worker.reviewCount} reviews
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const pct =
                            star === 5
                              ? 72
                              : star === 4
                                ? 20
                                : star === 3
                                  ? 5
                                  : star === 2
                                    ? 2
                                    : 1;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-xs text-[#94A3B8] w-2">
                                {star}
                              </span>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="h-1.5 bg-amber-400 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#94A3B8] w-6 text-right">
                                {pct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review List */}
                    {workerReviews.length > 0 ? (
                      <div className="space-y-4">
                        {workerReviews.map((review) => (
                          <div
                            key={review.id}
                            className="border border-gray-100 rounded-xl p-4"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <img
                                src={review.authorPhoto}
                                alt={review.author}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span
                                    className="text-[#0F172A] text-sm"
                                    style={{ fontWeight: 600 }}
                                  >
                                    {review.author}
                                  </span>
                                  <span className="text-[#94A3B8] text-xs">
                                    {review.date}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <StarRating rating={review.rating} />
                                  <span className="text-xs text-[#64748B] bg-gray-100 px-2 py-0.5 rounded-full">
                                    {review.jobType}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-[#475569] text-sm leading-relaxed">
                              {review.comment}
                            </p>
                            <button className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B] mt-3 transition-colors">
                              <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-[#94A3B8] text-sm">
                        No reviews yet for this worker.
                      </div>
                    )}
                  </div>
                )}

                {/* Portfolio Tab */}
                {activeTab === "portfolio" && (
                  <div>
                    <p className="text-[#64748B] text-sm mb-5">
                      Past work samples from {worker.name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {portfolioItems.map((img, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
                        >
                          <img
                            src={img}
                            alt={`Portfolio ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
        <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3">
            {/* Price */}
            <div className="min-w-fit">
              <p className="text-[11px] text-slate-500 leading-none">
                Starting from
              </p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                ₹{worker.startingPrice}
              </h3>
            </div>

            {/* Favourite */}
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                saved
                  ? "bg-red-50 text-red-500 border border-red-100"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  saved ? "fill-red-500" : ""
                }`}
              />
            </button>

            {/* Book Button */}
            <button
              onClick={handleBookNow}
              disabled={!worker.available}
              className={`flex-1 h-12 rounded-2xl font-semibold text-sm transition-all ${
                worker.available
                  ? "bg-sky-500 active:scale-[0.98] text-white shadow-lg shadow-sky-200"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {worker.available ? "Book Now" : "Unavailable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
