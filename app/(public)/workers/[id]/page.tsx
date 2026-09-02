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
  Briefcase,
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

import {
  getWorkerById,
  serviceCategories,
  type Worker,
  type PriceKey,
} from "@/app/data/workers";

import { supabase } from "@/lib/supabase";

/* =========================================
   PRICE KEYS
========================================= */

const PRICE_KEYS: PriceKey[] = [
  "per_job",
  "half_day",
  "full_day",
  "monthly",
  "visit_charge",
];

/* =========================================
   NORMALIZE DISPLAY CHARGE
========================================= */

function normalizeDisplayService(
  value: unknown,
): PriceKey | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleanValue = value.trim();

  return PRICE_KEYS.includes(
    cleanValue as PriceKey,
  )
    ? (cleanValue as PriceKey)
    : null;
}

/* =========================================
   STAR RATING
========================================= */

function StarRating({
  rating,
}: {
  rating: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

/* =========================================
   GET DISPLAY CHARGE

   workers.display_service contains ONLY
   the pricing key:

   per_job
   half_day
   full_day
   monthly
   visit_charge

   It is NOT a service name.

   Example:

   services:
   ["Visit", "Repair", "Emergency"]

   displayService:
   "half_day"

   halfDayPrice:
   600

   Result:
   Half Day ₹600
========================================= */

function getDisplayCharge(
  worker: Worker,
) {
  const displayService =
    normalizeDisplayService(
      worker.displayService,
    );

  if (!displayService) {
    return null;
  }

  const priceMap: Record<
    PriceKey,
    {
      price: number;
      label: string;
      suffix: string;
    }
  > = {
    per_job: {
      price: Number(
        worker.startingPrice ?? 0,
      ),
      label: "Per Work",
      suffix: "per work",
    },

    half_day: {
      price: Number(
        worker.halfDayPrice ?? 0,
      ),
      label: "Half Day",
      suffix: "half day",
    },

    full_day: {
      price: Number(
        worker.fullDayPrice ?? 0,
      ),
      label: "Full Day",
      suffix: "full day",
    },

    monthly: {
      price: Number(
        worker.monthlyPrice ?? 0,
      ),
      label: "Monthly",
      suffix: "per month",
    },

    visit_charge: {
      price: Number(
        worker.visitCharge ?? 0,
      ),
      label: "Visit Charge",
      suffix: "per visit",
    },
  };

  const selected =
    priceMap[displayService];

  if (!selected) {
    return null;
  }

  if (
    !Number.isFinite(
      selected.price,
    ) ||
    selected.price <= 0
  ) {
    return null;
  }

  return selected;
}

/* =========================================
   WORKER PROFILE
========================================= */

export default function WorkerProfile() {
  const { id } = useParams();

  const workerId = Array.isArray(id)
    ? id[0]
    : id;

  const router = useRouter();

  const [saved, setSaved] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<
      "about" | "reviews" | "portfolio"
    >("about");

  const [worker, setWorker] =
    useState<Worker | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [reviews, setReviews] =
    useState<any[]>([]);

  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);

  /* =========================================
     FETCH DATA
  ========================================= */

  useEffect(() => {
    if (!workerId) return;

    loadWorker();
    loadReviews();
    checkFavorite();
  }, [workerId]);

  /* =========================================
     LOAD WORKER
  ========================================= */

  const loadWorker = async () => {
    try {
      setLoading(true);

      if (!workerId) {
        return;
      }

      const data =
        await getWorkerById(
          workerId,
        );

      console.log(
        "CURRENT WORKER FROM DATABASE =>",
        data,
      );

      console.log(
        "DISPLAY SERVICE =>",
        data?.displayService,
      );

      console.log(
        "STARTING PRICE =>",
        data?.startingPrice,
      );

      console.log(
        "HALF DAY PRICE =>",
        data?.halfDayPrice,
      );

      console.log(
        "FULL DAY PRICE =>",
        data?.fullDayPrice,
      );

      console.log(
        "MONTHLY PRICE =>",
        data?.monthlyPrice,
      );

      console.log(
        "VISIT CHARGE =>",
        data?.visitCharge,
      );

      if (data) {
        const charge =
          getDisplayCharge(
            data,
          );

        console.log(
          "DISPLAY CHARGE RESULT =>",
          charge,
        );
      }

      setWorker(data);
    } catch (error) {
      console.error(
        "LOAD WORKER ERROR:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     CHECK FAVORITE
  ========================================= */

  const checkFavorite = async () => {
    if (!workerId) return;

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      setSaved(false);
      return;
    }

    const {
      data,
      error,
    } =
      await supabase
        .from("favorites")
        .select("id")
        .eq(
          "customer_id",
          user.id,
        )
        .eq(
          "worker_id",
          workerId,
        )
        .maybeSingle();

    if (error) {
      console.error(
        "CHECK FAVORITE ERROR:",
        error,
      );

      return;
    }

    setSaved(!!data);
  };

  /* =========================================
     TOGGLE FAVORITE
  ========================================= */

  const toggleFavorite =
    async () => {
      try {
        setFavoriteLoading(
          true,
        );

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          router.push(
            `/login?redirect=${encodeURIComponent(
              `/workers/${workerId}`,
            )}`,
          );

          return;
        }

        const {
          data: existing,
          error: checkError,
        } =
          await supabase
            .from("favorites")
            .select("id")
            .eq(
              "customer_id",
              user.id,
            )
            .eq(
              "worker_id",
              workerId,
            )
            .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        if (existing) {
          const {
            error,
          } =
            await supabase
              .from("favorites")
              .delete()
              .eq(
                "id",
                existing.id,
              );

          if (error) {
            throw error;
          }

          setSaved(false);
        } else {
          const {
            error,
          } =
            await supabase
              .from("favorites")
              .upsert(
                {
                  customer_id:
                    user.id,
                  worker_id:
                    workerId,
                },
                {
                  onConflict:
                    "customer_id,worker_id",
                  ignoreDuplicates:
                    true,
                },
              );

          if (error) {
            throw error;
          }

          setSaved(true);
        }

        await checkFavorite();
      } catch (error) {
        console.error(
          "Favorite Error:",
          error,
        );
      } finally {
        setFavoriteLoading(
          false,
        );
      }
    };

  /* =========================================
     LOAD REVIEWS
  ========================================= */

  const loadReviews = async () => {
    if (!workerId) return;

    const {
      data,
      error,
    } =
      await supabase
        .from("reviews")
        .select("*")
        .eq(
          "worker_id",
          workerId,
        );

    if (error) {
      console.error(
        "LOAD REVIEWS ERROR:",
        error,
      );

      setReviews([]);
      return;
    }

    setReviews(data || []);
  };

  /* =========================================
     BOOK NOW
  ========================================= */

  const handleBookNow =
    async () => {
      if (!workerId) return;

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session) {
        router.push(
          `/login?redirect=${encodeURIComponent(
            `/book/${workerId}`,
          )}`,
        );

        return;
      }

      router.push(
        `/book/${workerId}`,
      );
    };

  /* =========================================
     SHARE
  ========================================= */

  const handleShare =
    async () => {
      if (!worker) return;

      try {
        await Share.share({
          title: `${worker.name} | Workkerz`,
          text: `Book ${worker.name} on Workkerz`,
          url:
            window.location.href,
          dialogTitle:
            "Share Worker",
        });
      } catch (error: any) {
        if (
          error?.message
            ?.toLowerCase()
            .includes("cancel")
        ) {
          return;
        }

        console.error(
          "SHARE ERROR:",
          error,
        );
      }
    };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
        <div className="flex flex-col items-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />

            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#FF5C39] border-t-[#FF5C39]" />

            <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[#FF5C39] shadow-lg shadow-orange-200">
              <span
                className="text-2xl text-white"
                style={{
                  fontWeight: 900,
                }}
              >
                W
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-[1.2rem] font-extrabold text-[#0F172A]">
              Loading Workers
            </h2>

            <p className="mt-1 text-sm text-[#94A3B8]">
              Preparing Workkerz profile
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#FF5C39]" />

            <span
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#FF8A65]"
              style={{
                animationDelay:
                  "0.15s",
              }}
            />

            <span
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#FFB199]"
              style={{
                animationDelay:
                  "0.3s",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     NOT FOUND
  ========================================= */

  if (!worker) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] pt-16">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-[#0F172A]">
            Worker not found
          </h2>

          <Link
            href="/browse"
            className="text-sm text-[#FF5C39]"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================
     DISPLAY CHARGE
  ========================================= */

  const displayCharge =
    getDisplayCharge(worker);

  /* =========================================
     CATEGORY
  ========================================= */

  const cat =
    serviceCategories.find(
      (category) =>
        category.id ===
        worker.category,
    ) ?? {
      id: "other",
      label:
        worker.category ||
        "Other Services",
      color: "#64748B",
      bg: "#F1F5F9",
    };

  const workerReviews =
    reviews;

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-white">
      <div className="m-0 w-screen max-w-none p-0 lg:mx-auto lg:max-w-7xl lg:px-6 lg:py-8">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:gap-8">

          {/* =========================================
              MAIN CONTENT
          ========================================= */}

          <div className="space-y-5 lg:col-span-2">

            {/* =========================================
                PROFILE CARD
            ========================================= */}

            <div className="overflow-hidden rounded-none border-0 bg-white lg:rounded-3xl lg:border lg:border-gray-100">

              {/* COVER */}

              <div
                className="h-40 -mt-[env(safe-area-inset-top)] pt-[env(safe-area-inset-top)]"
                style={{
                  background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)`,
                }}
              />

              <div className="px-2 pb-2">

                {/* =====================================
                    PROFILE HEADER
                ===================================== */}

                <div className="relative z-10 -mt-12">
                  <div className="flex items-start gap-3 sm:gap-5">

                    {/* PROFILE PHOTO */}

                    <div className="relative shrink-0 px-3 sm:px-5">
                      {worker.photo?.trim() ? (
                        <img
                          src={
                            worker.photo
                          }
                          alt={
                            worker.name
                          }
                          className="h-20 w-20 rounded-2xl border-2 border-white bg-slate-100 object-cover object-top shadow-lg sm:h-24 sm:w-24"
                          onError={(
                            e,
                          ) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white bg-slate-100 shadow-lg sm:h-24 sm:w-24">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300">
                            <span className="text-lg font-bold text-white">
                              {worker.name?.charAt(
                                0,
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {worker.available && (
                        <span className="absolute bottom-1 right-3 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 sm:right-5" />
                      )}
                    </div>

                    {/* =================================
                        DETAILS
                    ================================= */}

                    <div className="min-w-0 flex-1 pt-1">

                      {/* NAME */}

                      <div className="flex min-w-0 items-center gap-1.5">
                        <h1
                          title={
                            worker.name
                          }
                          className="min-w-0 flex-1 truncate text-base font-bold leading-6 text-slate-900 sm:text-lg"
                        >
                          {
                            worker.name
                          }
                        </h1>

                        <div className="relative h-5 w-5 shrink-0">
                          <BadgeCheck className="absolute inset-0 h-5 w-5 fill-cyan-300 text-sky-500" />

                          <Check className="absolute inset-0 m-auto h-3 w-3 text-white stroke-3" />
                        </div>
                      </div>

                      {/* CATEGORY + SPECIALTY */}

                      <div className="mt-1.5 flex min-w-0 items-center gap-1.5 overflow-hidden">
                        <div
                          className="inline-flex h-7 max-w-[45%] shrink-0 items-center gap-1 overflow-hidden rounded-lg border px-2 text-[9px] font-semibold sm:text-[11px]"
                          style={{
                            backgroundColor:
                              cat.bg,
                            borderColor: `${cat.color}25`,
                            color:
                              cat.color,
                          }}
                        >
                          <BriefcaseBusiness className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />

                          <span className="truncate">
                            {cat.label}
                          </span>
                        </div>

                        <div className="inline-flex h-7 min-w-0 flex-1 items-center gap-1 overflow-hidden rounded-lg border border-slate-200 bg-white px-2 text-[9px] font-medium text-slate-600 sm:text-[11px]">
                          <Building2 className="h-3 w-3 shrink-0 text-slate-400 sm:h-3.5 sm:w-3.5" />

                          <span
                            title={
                              worker.specialty
                            }
                            className="truncate"
                          >
                            {
                              worker.specialty
                            }
                          </span>
                        </div>
                      </div>

                      {/* RATING */}

                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex items-center rounded-lg bg-amber-50 px-1.5 py-0.5">
                          {[1, 2, 3, 4, 5].map(
                            (
                              star,
                            ) => (
                              <Star
                                key={
                                  star
                                }
                                className={`h-3 w-3 ${
                                  worker.rating >=
                                  star
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-200 text-slate-200"
                                }`}
                              />
                            ),
                          )}

                          <span className="ml-1 text-[10px] font-semibold text-slate-900">
                            {Number(
                              worker.rating ||
                                0,
                            ).toFixed(
                              1,
                            )}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-500">
                          (
                          {
                            worker.reviewCount
                          }
                          )
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================
                    DISPLAY CHARGE + SHARE
                ========================================= */}

                <div className="mt-4 mb-4 flex items-center gap-2 px-2">

                  <div className="min-w-0 flex-1">
                    {displayCharge ? (
                      <div className="flex h-12 items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/50 px-3">
                        <BadgeIndianRupee className="h-5 w-5 shrink-0 text-emerald-600" />

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                              Display Charge
                            </p>

                            <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

                            <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                              {
                                displayCharge.label
                              }
                            </p>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-extrabold leading-none text-[#0F7A22]">
                              ₹
                              {displayCharge.price.toLocaleString(
                                "en-IN",
                              )}
                            </span>

                            <span className="text-[8px] text-slate-400">
                              {
                                displayCharge.suffix
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-12 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3">
                        <BadgeIndianRupee className="h-5 w-5 text-slate-300" />

                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                            Display Charge
                          </p>

                          <span className="text-[10px] text-slate-400">
                            Price not available
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SHARE */}

                  <button
                    type="button"
                    onClick={
                      handleShare
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#FF6B35] hover:bg-orange-50 active:scale-95"
                  >
                    <Share2 className="h-5 w-5 text-slate-600" />
                  </button>
                </div>

                {/* =========================================
                    STATS
                ========================================= */}

                <div className="grid grid-cols-2 gap-2 px-2">
                  {[
                    {
                      label:
                        "Rating",
                      value:
                        Number(
                          worker.rating ||
                            0,
                        ).toFixed(
                          1,
                        ),
                      icon: Star,
                      color:
                        "#F59E0B",
                    },
                    {
                      label:
                        "Works",
                      value: `${worker.completedJobs}+`,
                      icon: Briefcase,
                      color:
                        "#3B82F6",
                    },
                    {
                      label:
                        "Experience",
                      value: `${worker.yearsExperience}Y`,
                      icon: Award,
                      color:
                        "#10B981",
                    },
                    {
                      label:
                        "Location",
                      value:
                        worker.location ||
                        "N/A",
                      icon: MapPin,
                      color:
                        "#EF4444",
                    },
                  ].map(
                    (stat) => {
                      const Icon =
                        stat.icon;

                      return (
                        <div
                          key={
                            stat.label
                          }
                          className="flex h-14.5 min-w-0 items-center rounded-2xl border border-slate-100 bg-white px-2.5 shadow-sm"
                        >
                          <div className="flex w-full min-w-0 items-center gap-2">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                              style={{
                                backgroundColor: `${stat.color}15`,
                              }}
                            >
                              <Icon
                                className="h-4 w-4"
                                style={{
                                  color:
                                    stat.color,
                                }}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-xs font-semibold text-slate-900 sm:text-sm"
                                title={String(
                                  stat.value,
                                )}
                              >
                                {
                                  stat.value
                                }
                              </p>

                              <p className="truncate text-[9px] text-slate-500 sm:text-[11px]">
                                {
                                  stat.label
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {/* =========================================
                    TRUST BADGES
                ========================================= */}

                <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
                  <h4 className="mb-3 text-sm font-semibold text-[#0F172A]">
                    Why Book with Confidence
                  </h4>

                  <div className="space-y-3">
                    {[
                      {
                        icon: Shield,
                        text: "Background checked & verified",
                        color:
                          "#3B82F6",
                      },
                      {
                        icon: CheckCircle,
                        text: "Satisfaction guarantee",
                        color:
                          "#10B981",
                      },
                      {
                        icon: Clock,
                        text: "Flexible scheduling options",
                        color:
                          "#8B5CF6",
                      },
                    ].map(
                      (badge) => {
                        const Icon =
                          badge.icon;

                        return (
                          <div
                            key={
                              badge.text
                            }
                            className="flex items-center gap-3 text-sm text-[#475569]"
                          >
                            <Icon
                              className="h-4 w-4 shrink-0"
                              style={{
                                color:
                                  badge.color,
                              }}
                            />

                            {
                              badge.text
                            }
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================
                TABS
            ========================================= */}

            <div className="mb-20 overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="flex border-b border-gray-100">
                {(
                  [
                    "about",
                    "reviews",
                    "portfolio",
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tab,
                      )
                    }
                    className={`flex-1 border-b-2 py-4 text-sm capitalize transition-colors ${
                      activeTab ===
                      tab
                        ? "border-[#FF5C39] bg-orange-50/50 text-[#FF5C39]"
                        : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                    }`}
                    style={{
                      fontWeight:
                        activeTab ===
                        tab
                          ? 600
                          : 400,
                    }}
                  >
                    {tab}

                    {tab ===
                      "reviews" && (
                      <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-[#64748B]">
                        {
                          worker.reviewCount
                        }
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">

                {/* =====================================
                    ABOUT
                ===================================== */}

                {activeTab ===
                  "about" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 font-semibold text-[#0F172A]">
                        About
                      </h3>

                      <p className="text-sm leading-relaxed text-[#475569]">
                        {
                          worker.bio
                        }
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold text-[#0F172A]">
                        Skills & Expertise
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {worker.skills.map(
                          (
                            skill,
                          ) => (
                            <span
                              key={
                                skill
                              }
                              className="rounded-full border border-gray-200 bg-[#F8FAFC] px-3 py-1.5 text-sm text-[#475569]"
                            >
                              {
                                skill
                              }
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold text-[#0F172A]">
                        Certifications
                      </h3>

                      <div className="space-y-2">
                        {worker.certifications.map(
                          (
                            cert,
                          ) => (
                            <div
                              key={
                                cert
                              }
                              className="flex items-center gap-2.5"
                            >
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              </div>

                              <span className="text-sm text-[#475569]">
                                {
                                  cert
                                }
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* =====================================
                    REVIEWS
                ===================================== */}

                {activeTab ===
                  "reviews" && (
                  <div>
                    <div className="mb-6 flex items-center gap-6 rounded-xl bg-[#F8FAFC] p-5">
                      <div className="text-center">
                        <div className="text-[3rem] font-extrabold leading-none text-[#0F172A]">
                          {Number(
                            worker.rating ||
                              0,
                          ).toFixed(
                            1,
                          )}
                        </div>

                        <StarRating
                          rating={
                            worker.rating
                          }
                        />

                        <div className="mt-1 text-xs text-[#94A3B8]">
                          {
                            worker.reviewCount
                          }{" "}
                          reviews
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(
                          (
                            star,
                          ) => {
                            const pct =
                              star ===
                              5
                                ? 72
                                : star ===
                                    4
                                  ? 20
                                  : star ===
                                      3
                                    ? 5
                                    : star ===
                                        2
                                      ? 2
                                      : 1;

                            return (
                              <div
                                key={
                                  star
                                }
                                className="flex items-center gap-2"
                              >
                                <span className="w-2 text-xs text-[#94A3B8]">
                                  {
                                    star
                                  }
                                </span>

                                <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />

                                <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                                  <div
                                    className="h-1.5 rounded-full bg-amber-400"
                                    style={{
                                      width: `${pct}%`,
                                    }}
                                  />
                                </div>

                                <span className="w-6 text-right text-xs text-[#94A3B8]">
                                  {
                                    pct
                                  }
                                  %
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {workerReviews.length >
                    0 ? (
                      <div className="space-y-4">
                        {workerReviews.map(
                          (
                            review,
                          ) => (
                            <div
                              key={
                                review.id
                              }
                              className="rounded-xl border border-gray-100 p-4"
                            >
                              <div className="mb-3 flex items-start gap-3">
                                <img
                                  src={
                                    review.authorPhoto
                                  }
                                  alt={
                                    review.author
                                  }
                                  className="h-9 w-9 rounded-full object-cover"
                                />

                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#0F172A]">
                                      {
                                        review.author
                                      }
                                    </span>

                                    <span className="text-xs text-[#94A3B8]">
                                      {
                                        review.date
                                      }
                                    </span>
                                  </div>

                                  <div className="mt-0.5 flex items-center gap-2">
                                    <StarRating
                                      rating={
                                        review.rating
                                      }
                                    />

                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-[#64748B]">
                                      {
                                        review.jobType
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-sm leading-relaxed text-[#475569]">
                                {
                                  review.comment
                                }
                              </p>

                              <button
                                type="button"
                                className="mt-3 flex items-center gap-1.5 text-xs text-[#94A3B8] transition-colors hover:text-[#64748B]"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                Helpful
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-sm text-[#94A3B8]">
                        No reviews yet for this worker.
                      </div>
                    )}
                  </div>
                )}

                {/* =====================================
                    PORTFOLIO
                ===================================== */}

                {activeTab ===
                  "portfolio" && (
                  <div className="py-10 text-center text-sm text-[#94A3B8]">
                    No portfolio available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          MOBILE BOTTOM ACTION BAR
      ========================================= */}

      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <div className="border-t border-slate-200/80 bg-white/95 px-3 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+10px)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">

          <div className="flex items-center gap-2">

            {/* =====================================
                DISPLAY CHARGE
            ===================================== */}

            <div className="min-w-0 flex-1 overflow-hidden">
              {displayCharge ? (
                <div className="min-w-0">
                  <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                    {displayCharge.label}
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold leading-5 text-[#0F7A22]">
                      ₹
                      {displayCharge.price.toLocaleString(
                        "en-IN",
                      )}
                    </span>

                    <span className="text-[8px] text-slate-400">
                      {
                        displayCharge.suffix
                      }
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[9px] text-slate-400">
                  Price not available
                </p>
              )}
            </div>

            {/* =====================================
                FAVOURITE
            ===================================== */}

            <button
              type="button"
              onClick={
                toggleFavorite
              }
              disabled={
                favoriteLoading
              }
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                saved
                  ? "border border-red-100 bg-red-50 text-red-500"
                  : "border border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              <Heart
                className={`h-5 w-5 ${
                  saved
                    ? "fill-red-500"
                    : ""
                }`}
              />
            </button>

            {/* =====================================
                BOOK NOW
            ===================================== */}

            <button
              type="button"
              onClick={
                handleBookNow
              }
              disabled={
                !worker.available
              }
              className={`h-11 shrink-0 rounded-xl px-5 text-sm font-semibold transition-all ${
                worker.available
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-200 active:scale-[0.98]"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {worker.available
                ? "Book Now"
                : "Unavailable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}