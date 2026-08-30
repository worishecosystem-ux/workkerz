"use client";

import Link from "next/link";
import { Star, Heart } from "lucide-react";
import type { Worker, PriceKey } from "@/app/data/workers";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function FeaturedWorkerSmallCard({
  worker,
}: {
  worker: Worker;
}) {
  const [saved, setSaved] =
    useState(false);

  const router = useRouter();

  /* =====================================================
     FAVOURITE
  ===================================================== */

  const checkFavourite =
    async () => {
      try {
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
        } = await supabase
          .from("favorites")
          .select("id")
          .eq(
            "customer_id",
            user.id,
          )
          .eq(
            "worker_id",
            worker.id,
          )
          .maybeSingle();

        if (error) {
          throw error;
        }

        setSaved(!!data);
      } catch (err) {
        console.error(
          "Check Favourite Error:",
          err,
        );
      }
    };

  useEffect(() => {
    checkFavourite();
  }, [worker.id]);

  const handleFavourite =
    async (
      e: React.MouseEvent<HTMLButtonElement>,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          router.push(
            `/login?redirect=/workers/${worker.id}`,
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
              worker.id,
            )
            .limit(1);

        if (checkError) {
          throw checkError;
        }

        if (
          existing &&
          existing.length > 0
        ) {
          const {
            error,
          } = await supabase
            .from("favorites")
            .delete()
            .eq(
              "id",
              existing[0].id,
            );

          if (error) {
            throw error;
          }

          setSaved(false);
        } else {
          const {
            error,
          } = await supabase
            .from("favorites")
            .upsert(
              {
                customer_id:
                  user.id,
                worker_id:
                  worker.id,
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

        await checkFavourite();
      } catch (err) {
        console.error(
          "Favourite Error:",
          err,
        );
      }
    };

  /* =====================================================
     PRICE HELPERS
  ===================================================== */

  const visiblePrices: PriceKey[] =
    Array.isArray(
      worker.visiblePricingTypes,
    )
      ? worker.visiblePricingTypes
      : [];

  const priceData: Record<
    PriceKey,
    {
      price: number;
      label: string;
    }
  > = {
    per_job: {
      price:
        worker.startingPrice,
      label: "Job",
    },

    half_day: {
      price:
        worker.halfDayPrice,
      label: "Half Day",
    },

    full_day: {
      price:
        worker.fullDayPrice,
      label: "Full Day",
    },

    monthly: {
      price:
        worker.monthlyPrice,
      label: "Month",
    },

    visit_charge: {
      price:
        worker.visitCharge,
      label: "Visit",
    },
  };

  /* =====================================================
     ONLY VALID + NON ZERO PRICES
  ===================================================== */

  const displayPrices =
    visiblePrices
      .map((key) => ({
        key,
        ...priceData[key],
      }))
      .filter(
        (item) =>
          Number(item.price) > 0,
      );

  /* =====================================================
     FALLBACK
     
     If visiblePricingTypes is empty,
     show starting price so card
     doesn't become blank.
  ===================================================== */

  const fallbackPrice =
    Number(
      worker.startingPrice,
    ) > 0
      ? {
          key: "per_job" as PriceKey,
          price:
            worker.startingPrice,
          label: "Job",
        }
      : null;

  const pricesToShow =
    displayPrices.length > 0
      ? displayPrices
      : fallbackPrice
        ? [fallbackPrice]
        : [];

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <Link
      href={`/workers/${worker.id}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

        {/* =================================================
            IMAGE
        ================================================= */}

        <div className="relative bg-gray-50">
          <div className="relative h-36 w-full overflow-hidden rounded-xl border border-gray-200 bg-white">

            {/* Background */}
            <img
              src={
                worker.photo ||
                "/placeholder-worker.png"
              }
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-20 blur-md"
            />

            {/* Worker Image */}
            <img
              src={
                worker.photo ||
                "/placeholder-worker.png"
              }
              alt={worker.name}
              loading="lazy"
              draggable={false}
              className="relative z-10 h-full w-full object-contain"
            />

            {/* Available */}
            {worker.available && (
              <span className="absolute left-2 top-2 z-20 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}

            {/* Favourite */}
            <button
              type="button"
              onClick={
                handleFavourite
              }
              className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition ${
                saved
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  saved
                    ? "fill-red-500 text-red-500"
                    : ""
                }`}
              />
            </button>

            {/* Rating */}
            <div className="absolute bottom-2 left-2 z-20 rounded-md bg-white px-2 py-1 shadow">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />

                <span className="text-xs font-bold">
                  {Number(
                    worker.rating || 0,
                  ).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="space-y-1.5 p-2.5">

          {/* Worker Name */}
          <h3 className="line-clamp-1 text-[13px] font-semibold leading-tight text-gray-900">
            {worker.name}
          </h3>

          {/* Category */}
          <p className="line-clamp-1 text-[10px] text-gray-500">
            {worker.subcategory ||
              worker.category}
          </p>

          {/* Experience */}
          <div className="flex items-center justify-between">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-600">
              {worker.yearsExperience}+
              yrs
            </span>

            <span className="text-[9px] text-gray-500">
              Verified
            </span>
          </div>

          {/* =================================================
              VISIBLE PRICING
          ================================================= */}

          {pricesToShow.length >
            0 && (
            <div className="pt-1">

              {pricesToShow.length ===
              1 ? (
                <div className="flex items-end gap-1">
                  <span className="text-[18px] font-bold leading-none text-[#0F7A22]">
                    ₹
                    {
                      pricesToShow[0]
                        .price
                    }
                  </span>

                  <span className="pb-0.5 text-[9px] text-gray-500">
                    /{" "}
                    {
                      pricesToShow[0]
                        .label
                    }
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">

                  {pricesToShow.map(
                    (item) => (
                      <div
                        key={
                          item.key
                        }
                        className="rounded-md bg-[#F6FBF7] px-1.5 py-1.5"
                      >
                        <p className="text-[8px] font-medium text-gray-500">
                          {item.label}
                        </p>

                        <p className="text-[13px] font-bold leading-none text-[#0F7A22]">
                          ₹
                          {
                            item.price
                          }
                        </p>
                      </div>
                    ),
                  )}

                </div>
              )}

            </div>
          )}

          {/* =================================================
              BUTTON
          ================================================= */}

          <button
            type="button"
            className="mt-1 w-full rounded-md border border-[#FCD200] bg-[#FFD814] py-1.5 text-[11px] font-semibold text-gray-900 transition hover:bg-[#F7CA00]"
          >
            View Details
          </button>

        </div>
      </div>
    </Link>
  );
}