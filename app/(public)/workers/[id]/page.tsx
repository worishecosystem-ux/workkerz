"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  ChevronLeft,
  Zap,
  Calendar,
  MessageCircle,
  Share2,
  Heart,
  Award,
  Briefcase,
  ThumbsUp,
} from "lucide-react";

import { getWorkerById, type Worker } from "@/app/data/workers";
import { supabase } from "@/lib/supabase";

const categoryColors: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  Labour: {
    color: "#F97316",
    bg: "#FFF7ED",
    label: "Labour",
  },

  Driver: {
    color: "#10B981",
    bg: "#ECFDF5",
    label: "Driver",
  },

  Mechanic: {
    color: "#3B82F6",
    bg: "#EFF6FF",
    label: "Mechanic",
  },

  Washer: {
    color: "#EAB308",
    bg: "#FEFCE8",
    label: "Washer",
  },

  "Computer Operator": {
    color: "#9333EA",
    bg: "#F3E8FF",
    label: "Computer Operator",
  },

  "Office Worker": {
    color: "#DB2777",
    bg: "#FCE7F3",
    label: "Office Worker",
  },

  "Home Services": {
    color: "#65A30D",
    bg: "#ECFCCB",
    label: "Home Services",
  },

  Restaurant: {
    color: "#E11D48",
    bg: "#FFE4E6",
    label: "Restaurant",
  },

  "Home Contractor": {
    color: "#0284C7",
    bg: "#E0F2FE",
    label: "Home Contractor",
  },

  Factory: {
    color: "#475569",
    bg: "#F1F5F9",
    label: "Factory",
  },

  Roads: {
    color: "#D97706",
    bg: "#FEF3C7",
    label: "Roads",
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

  const loadReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("worker_id", id);

    setReviews(data || []);
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
              Preparing Workkerz dashboard...
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="bg-[#0F172A] pt-16">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400 text-sm">Browse</span>
          <span className="text-gray-600">/</span>
          <span className="text-white text-sm">{worker.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Cover */}
              <div
                className="h-28"
                style={{
                  background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)`,
                }}
              />

              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 mt-2 mb-5">
                  <div className="relative shrink-0 w-24 h-24">
                    <img
                      src={worker.photo}
                      alt={worker.name}
                      className="w-full h-full rounded-2xl border-4 border-white object-cover shadow-lg"
                    />

                    {worker.available && (
                      <div className="absolute bottom-1 right-1 z-20 flex items-center justify-center">
                        <span className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1
                            className="text-[#0F172A]"
                            style={{ fontSize: "1.4rem", fontWeight: 700 }}
                          >
                            {worker.name}
                          </h1>
                          <span
                            className="text-xs px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: cat.bg,
                              color: cat.color,
                              fontWeight: 600,
                            }}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <p className="text-[#64748B] text-sm mt-1">
                          {worker.specialty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSaved(!saved)}
                          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                            saved
                              ? "bg-red-50 border-red-200 text-red-400"
                              : "border-gray-200 text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${saved ? "fill-red-400" : ""}`}
                          />
                        </button>
                        <button className="w-9 h-9 rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 flex items-center justify-center transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 border border-gray-200 text-[#475569] hover:border-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {[
                    {
                      label: "Rating",
                      value: `${worker.rating}`,
                      sub: `${worker.reviewCount} reviews`,
                      icon: Star,
                      color: "#F59E0B",
                    },
                    {
                      label: "Jobs Done",
                      value: `${worker.completedJobs}+`,
                      sub: "Completed",
                      icon: Briefcase,
                      color: "#3B82F6",
                    },
                    {
                      label: "Experience",
                      value: `${worker.yearsExperience}yr`,
                      sub: "In trade",
                      icon: Award,
                      color: "#10B981",
                    },
                    {
                      label: "Response",
                      value: worker.responseTime
                        .split(" ")
                        .slice(0, 2)
                        .join(" "),
                      sub: "Avg reply time",
                      icon: Clock,
                      color: "#8B5CF6",
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="bg-[#F8FAFC] rounded-xl p-4 text-center"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: stat.color }}
                          />
                        </div>
                        <div
                          className="text-[#0F172A]"
                          style={{ fontWeight: 700, fontSize: "1.05rem" }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-[#94A3B8] text-xs">{stat.sub}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Location & Availability */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-[#64748B]">
                    <MapPin className="w-4 h-4 text-[#FF5C39]" />
                    {worker.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${worker.available ? "bg-emerald-400" : "bg-gray-300"}`}
                    />
                    <span
                      style={{
                        fontWeight: 500,
                        color: worker.available ? "#10B981" : "#94A3B8",
                      }}
                    >
                      {worker.available
                        ? "Available Now"
                        : "Currently Unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#64748B]">
                    <Zap className="w-4 h-4 text-[#FF5C39]" />
                    Responds {worker.responseTime.toLowerCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Booking Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="text-[#0F172A]"
                    style={{ fontSize: "1.8rem", fontWeight: 800 }}
                  >
                    ₹{worker.hourlyRate}
                  </span>
                  <span className="text-[#94A3B8]">/hour</span>
                </div>
                <div className="flex items-center gap-1 mb-5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span
                    className="text-[#0F172A] text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    {worker.rating}
                  </span>
                  <span className="text-[#94A3B8] text-sm">
                    ({worker.reviewCount} reviews)
                  </span>
                </div>

                {/* Quick info */}
                <div className="space-y-3 mb-5 p-4 bg-[#F8FAFC] rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Availability</span>
                    <span
                      style={{
                        color: worker.available ? "#10B981" : "#94A3B8",
                        fontWeight: 600,
                      }}
                    >
                      {worker.available ? "Available Now" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Response time</span>
                    <span
                      className="text-[#0F172A]"
                      style={{ fontWeight: 500 }}
                    >
                      {worker.responseTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Location</span>
                    <span
                      className="text-[#0F172A]"
                      style={{ fontWeight: 500 }}
                    >
                      {worker.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Experience</span>
                    <span
                      className="text-[#0F172A]"
                      style={{ fontWeight: 500 }}
                    >
                      {worker.yearsExperience} years
                    </span>
                  </div>
                </div>

                <Link
                  href={`/book/${worker.id}`}
                  className={`block w-full text-center text-white py-3.5 rounded-xl text-sm transition-colors mb-3 ${
                    worker.available
                      ? "bg-[#FF5C39] hover:bg-[#e54e2e]"
                      : "bg-gray-300 cursor-not-allowed pointer-events-none"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {worker.available ? "Book Now" : "Currently Unavailable"}
                </Link>

                <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-[#475569] hover:bg-gray-50 py-3 rounded-xl text-sm transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>
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
    </div>
  );
}
