"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@supabase/supabase-js";

import {
  updateWorker,
  type WorkerFormData,
} from "@/app/data/workers";

import type {
  EditWorkerModalProps,
  PriceKey,
} from "./editWorker.types";

import EditWorkerHeader from "./EditWorkerHeader";
import EditWorkerForm from "./EditWorkerForm";
import EditWorkerBottomBar from "./EditWorkerBottomBar";

import useEditWorker from "./hooks/useEditWorker";
import useWorkerPhoto from "./hooks/useWorkerPhoto";
import useKeyboardState from "./hooks/useKeyboardState";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const WORKER_IMAGE_BUCKET = "workers";

/* =====================================================
   PRICE KEYS
===================================================== */

const PRICE_KEYS: PriceKey[] = [
  "per_job",
  "half_day",
  "full_day",
  "monthly",
  "visit_charge",
];

/* =====================================================
   NORMALIZE DISPLAY SERVICE
===================================================== */

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

/* =====================================================
   NORMALIZE SERVICES
===================================================== */

function normalizeServices(
  value: unknown,
): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .filter(
            (item): item is string =>
              typeof item === "string",
          )
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    /* JSON ARRAY */

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return Array.from(
          new Set(
            parsed
              .filter(
                (item): item is string =>
                  typeof item === "string",
              )
              .map((item) => item.trim())
              .filter(Boolean),
          ),
        );
      }
    } catch {
      // Continue with PostgreSQL array parsing.
    }

    /* POSTGRES ARRAY */

    if (
      trimmed.startsWith("{") &&
      trimmed.endsWith("}")
    ) {
      return Array.from(
        new Set(
          trimmed
            .slice(1, -1)
            .split(",")
            .map((item) =>
              item
                .trim()
                .replace(/^"|"$/g, ""),
            )
            .filter(Boolean),
        ),
      );
    }

    return [trimmed];
  }

  return [];
}

/* =====================================================
   NORMALIZE STRING ARRAY
===================================================== */

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

/* =====================================================
   COMPONENT
===================================================== */

export default function EditWorkerModal({
  worker,
  onClose,
  onUpdated,
}: EditWorkerModalProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const keyboardOpen = useKeyboardState();

  const form = useEditWorker();

  const photo = useWorkerPhoto("");

  const [
    photoUploading,
    setPhotoUploading,
  ] = useState(false);

  const [
    fetchingWorker,
    setFetchingWorker,
  ] = useState(false);

  /* =====================================================
     AVAILABLE SERVICE TYPES
  ===================================================== */

  const [
    availableServiceTypes,
    setAvailableServiceTypes,
  ] = useState<string[]>([]);

  /* =====================================================
     FETCH WORKER + SERVICE TYPES
  ===================================================== */

  useEffect(() => {
    if (!worker?.id) {
      return;
    }

    let cancelled = false;

    const fetchWorkerFromDatabase =
      async () => {
        try {
          setFetchingWorker(true);
          form.setError("");

          /* =============================================
             FETCH CURRENT WORKER
          ============================================= */

          const {
            data,
            error,
          } = await supabase
            .from("workers")
            .select("*")
            .eq("id", worker.id)
            .single();

          if (error) {
            throw error;
          }

          if (!data) {
            throw new Error(
              "Worker data not found in database.",
            );
          }

          if (cancelled) {
            return;
          }

          /* =============================================
             CURRENT WORKER SERVICES
          ============================================= */

          const selectedServices =
            normalizeServices(
              data.services,
            );

          /* =============================================
             DISPLAY CHARGE

             DB COLUMN:
             workers.display_service

             VALUES:
             per_job
             half_day
             full_day
             monthly
             visit_charge
          ============================================= */

          const displayService =
            normalizeDisplayService(
              data.display_service,
            );

          /* =============================================
             FETCH ALL SERVICE TYPES

             Services come from workers.services.
          ============================================= */

          const {
            data: serviceRows,
            error: serviceError,
          } = await supabase
            .from("workers")
            .select(
              "services, category, subcategory",
            )
            .eq(
              "category",
              data.category ?? "",
            )
            .eq(
              "subcategory",
              data.subcategory ?? "",
            );

          if (serviceError) {
            console.error(
              "SERVICE TYPES FETCH ERROR:",
              serviceError,
            );
          }

          /* =============================================
             BUILD AVAILABLE SERVICE TYPES
          ============================================= */

          const fetchedServiceTypes =
            Array.from(
              new Set(
                (serviceRows ?? []).flatMap(
                  (row) =>
                    normalizeServices(
                      row.services,
                    ),
                ),
              ),
            );

          /*
           * Always include current worker's
           * saved services.
           */

          const finalServiceTypes =
            Array.from(
              new Set([
                ...selectedServices,
                ...fetchedServiceTypes,
              ]),
            );

          if (cancelled) {
            return;
          }

          setAvailableServiceTypes(
            finalServiceTypes,
          );

          console.log(
            "====================================",
          );

          console.log(
            "EDIT WORKER ID:",
            worker.id,
          );

          console.log(
            "CURRENT WORKER SERVICES:",
            selectedServices,
          );

          console.log(
            "DISPLAY SERVICE FROM DB:",
            displayService,
          );

          console.log(
            "DATABASE SERVICE ROWS:",
            serviceRows,
          );

          console.log(
            "AVAILABLE SERVICE TYPES:",
            finalServiceTypes,
          );

          console.log(
            "====================================",
          );

          /* =============================================
             LOAD FORM
          ============================================= */

          form.loadFromDatabase({
            id: data.id,

            name:
              data.name ?? "",

            phone:
              data.phone ?? "",

            category:
              data.category ?? "",

            subcategory:
              data.subcategory ?? "",

            specialty:
              data.specialty ?? "",

            /* SELECTED SERVICES ONLY */

            services: [
              ...selectedServices,
            ],

            /* PRICING */

            pricingType:
              data.pricing_type ??
              data.pricingType ??
              "custom",

            startingPrice:
              data.starting_price != null
                ? String(
                    data.starting_price,
                  )
                : data.startingPrice != null
                  ? String(
                      data.startingPrice,
                    )
                  : "",

            halfDayPrice:
              data.half_day_price != null
                ? String(
                    data.half_day_price,
                  )
                : data.halfDayPrice != null
                  ? String(
                      data.halfDayPrice,
                    )
                  : "",

            fullDayPrice:
              data.full_day_price != null
                ? String(
                    data.full_day_price,
                  )
                : data.fullDayPrice != null
                  ? String(
                      data.fullDayPrice,
                    )
                  : "",

            monthlyPrice:
              data.monthly_price != null
                ? String(
                    data.monthly_price,
                  )
                : data.monthlyPrice != null
                  ? String(
                      data.monthlyPrice,
                    )
                  : "",

            visitCharge:
              data.visit_charge != null
                ? String(
                    data.visit_charge,
                  )
                : data.visitCharge != null
                  ? String(
                      data.visitCharge,
                    )
                  : "",

            /* DISPLAY CHARGE */

            displayService:
              displayService,

            /* VISIBLE PRICING */

            visiblePricingTypes:
              Array.isArray(
                data.visible_pricing_types,
              )
                ? [
                    ...data.visible_pricing_types,
                  ]
                : Array.isArray(
                      data.visiblePricingTypes,
                    )
                  ? [
                      ...data.visiblePricingTypes,
                    ]
                  : [
                      "per_job",
                      "half_day",
                    ],

            /* LOCATION */

            location:
              data.location ?? "",

            labourChauk:
              data.labour_chauk ??
              data.labourChauk ??
              "",

            /* AVAILABILITY */

            available:
              data.available ??
              true,

            /* EXPERIENCE */

            yearsExperience:
              data.years_experience != null
                ? String(
                    data.years_experience,
                  )
                : data.yearsExperience != null
                  ? String(
                      data.yearsExperience,
                    )
                  : "",

            completedJobs:
              data.completed_jobs != null
                ? String(
                    data.completed_jobs,
                  )
                : data.completedJobs != null
                  ? String(
                      data.completedJobs,
                    )
                  : "",

            /* ABOUT */

            bio:
              data.bio ?? "",

            /* SKILLS */

            skills:
              normalizeStringArray(
                data.skills,
              ),

            /* REVIEWS */

            rating:
              data.rating != null
                ? String(
                    data.rating,
                  )
                : "",

            reviewCount:
              data.review_count != null
                ? String(
                    data.review_count,
                  )
                : data.reviewCount != null
                  ? String(
                      data.reviewCount,
                    )
                  : "",

            responseTime:
              data.response_time ??
              data.responseTime ??
              "Within 1 hour",

            /* CERTIFICATIONS */

            certifications:
              normalizeStringArray(
                data.certifications,
              ),

            /* PHOTO */

            photo:
              data.photo ?? "",
          });

          photo.resetPhoto(
            data.photo ?? "",
          );
        } catch (fetchError) {
          if (cancelled) {
            return;
          }

          console.error(
            "DIRECT WORKER DATABASE FETCH ERROR:",
            fetchError,
          );

          form.setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to fetch worker from database.",
          );
        } finally {
          if (!cancelled) {
            setFetchingWorker(false);
          }
        }
      };

    fetchWorkerFromDatabase();

    return () => {
      cancelled = true;
    };
  }, [worker?.id]);

  /* =====================================================
     ESCAPE
  ===================================================== */

  useEffect(() => {
    if (!worker) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !form.loading &&
        !fetchingWorker
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    worker,
    form.loading,
    fetchingWorker,
    onClose,
  ]);

  /* =====================================================
     BODY SCROLL
  ===================================================== */

  useEffect(() => {
    if (!worker) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [worker]);

  /* =====================================================
     PHOTO UPLOAD
  ===================================================== */

  const uploadWorkerPhoto =
    async (
      file: File,
    ): Promise<string> => {
      setPhotoUploading(true);
      photo.setPhotoError("");

      try {
        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const safeName =
          form.form.name
            .trim()
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              "-",
            )
            .replace(
              /^-+|-+$/g,
              "",
            ) || "worker";

        const fileName =
          `${safeName}-${Date.now()}.${extension}`;

        const filePath =
          `workers/${fileName}`;

        const {
          error: uploadError,
        } =
          await supabase.storage
            .from(
              WORKER_IMAGE_BUCKET,
            )
            .upload(
              filePath,
              file,
              {
                cacheControl:
                  "3600",
                upsert: false,
                contentType:
                  file.type,
              },
            );

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from(
              WORKER_IMAGE_BUCKET,
            )
            .getPublicUrl(
              filePath,
            );

        const publicUrl =
          publicUrlData?.publicUrl;

        if (!publicUrl) {
          throw new Error(
            "Unable to generate image URL.",
          );
        }

        return publicUrl;
      } catch (uploadError) {
        console.error(
          "PHOTO UPLOAD ERROR:",
          uploadError,
        );

        throw new Error(
          uploadError instanceof Error
            ? uploadError.message
            : "Unable to upload worker photo.",
        );
      } finally {
        setPhotoUploading(false);
      }
    };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!worker?.id) {
        return;
      }

      if (
        form.loading ||
        fetchingWorker
      ) {
        return;
      }

      const validationError =
        form.validate();

      if (validationError) {
        form.setError(
          validationError,
        );
        return;
      }

      try {
        form.setLoading(true);
        form.setError("");

        /* =============================================
           PHOTO
        ============================================= */

        let finalPhoto =
          form.form.photo ?? "";

        if (
          photo.selectedPhoto
        ) {
          finalPhoto =
            await uploadWorkerPhoto(
              photo.selectedPhoto,
            );
        } else if (
          photo.photoPreview === ""
        ) {
          finalPhoto = "";
        }

        /* =============================================
           SERVICES
        ============================================= */

        const finalServices =
          normalizeServices(
            form.form.services,
          );

        console.log(
          "SAVING WORKER SERVICES:",
          finalServices,
        );

        /* =============================================
           DISPLAY CHARGE
        ============================================= */

        const finalDisplayService =
          normalizeDisplayService(
            form.form.displayService,
          );

        console.log(
          "SAVING DISPLAY SERVICE:",
          finalDisplayService,
        );

        /* =============================================
           DISPLAY CHARGE VALIDATION
        ============================================= */

        if (finalDisplayService) {
          const displayPriceMap: Record<
            PriceKey,
            number
          > = {
            per_job:
              Number(
                form.form.startingPrice,
              ) || 0,

            half_day:
              Number(
                form.form.halfDayPrice,
              ) || 0,

            full_day:
              Number(
                form.form.fullDayPrice,
              ) || 0,

            monthly:
              Number(
                form.form.monthlyPrice,
              ) || 0,

            visit_charge:
              Number(
                form.form.visitCharge,
              ) || 0,
          };

          const selectedDisplayPrice =
            displayPriceMap[
              finalDisplayService
            ];

          if (
            !Number.isFinite(
              selectedDisplayPrice,
            ) ||
            selectedDisplayPrice <= 0
          ) {
            throw new Error(
              "Display charge must be selected from a filled pricing option.",
            );
          }
        }

        /* =============================================
           WORKER DATA
        ============================================= */

        const workerData:
          WorkerFormData = {
          name:
            form.form.name.trim(),

          phone:
            form.form.phone.trim(),

          category:
            form.form.category.trim(),

          subcategory:
            form.form.subcategory.trim(),

          specialty:
            form.form.specialty.trim(),

          services:
            finalServices,

          pricingType:
            form.form.pricingType,

          startingPrice:
            Number(
              form.form.startingPrice,
            ) || 0,

          halfDayPrice:
            Number(
              form.form.halfDayPrice,
            ) || 0,

          fullDayPrice:
            Number(
              form.form.fullDayPrice,
            ) || 0,

          monthlyPrice:
            Number(
              form.form.monthlyPrice,
            ) || 0,

          visitCharge:
            Number(
              form.form.visitCharge,
            ) || 0,

          /* DISPLAY CHARGE */

          displayService:
            finalDisplayService,

          rating:
            Number(
              form.form.rating,
            ) || 0,

          reviewCount:
            Number(
              form.form.reviewCount,
            ) || 0,

          location:
            form.form.location.trim(),

          labourChauk:
            form.form.labourChauk.trim(),

          available:
            form.form.available,

          yearsExperience:
            Number(
              form.form.yearsExperience,
            ) || 0,

          completedJobs:
            Number(
              form.form.completedJobs,
            ) || 0,

          bio:
            form.form.bio.trim(),

          skills:
            normalizeStringArray(
              form.form.skills,
            ),

          photo:
            finalPhoto,

          responseTime:
            form.form.responseTime.trim() ||
            "Within 1 hour",

          certifications:
            normalizeStringArray(
              form.form.certifications,
            ),

          visiblePricingTypes:
            [
              ...form.form
                .visiblePricingTypes,
            ],
        };

        console.log(
          "====================================",
        );

        console.log(
          "FINAL WORKER UPDATE:",
          workerData,
        );

        console.log(
          "DISPLAY SERVICE:",
          workerData.displayService,
        );

        console.log(
          "====================================",
        );

        /* =============================================
           UPDATE DATABASE
        ============================================= */

        const updatedWorker =
          await updateWorker(
            worker.id,
            workerData,
          );

        onUpdated(
          updatedWorker,
        );

        onClose();
      } catch (updateError) {
        console.error(
          "UPDATE WORKER ERROR:",
          updateError,
        );

        form.setError(
          updateError instanceof Error
            ? updateError.message
            : "Unable to update worker.",
        );
      } finally {
        form.setLoading(false);
      }
    };

  /* =====================================================
     NO WORKER
  ===================================================== */

  if (!worker) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-[100] flex h-dvh w-full flex-col bg-white">
      <EditWorkerHeader
        onClose={onClose}
        loading={
          form.loading ||
          fetchingWorker
        }
      />

      <form
        id="edit-worker-form"
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col"
      >
        {fetchingWorker ? (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-white px-5">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#FF5C39]" />

              <p className="mt-3 text-sm font-semibold text-[#0F172A]">
                Loading worker data...
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Fetching latest data from database
              </p>
            </div>
          </div>
        ) : (
          <>
            <EditWorkerForm
              {...form.form}

              availableServiceTypes={
                availableServiceTypes
              }

              photoPreview={
                photo.photoPreview
              }

              selectedPhoto={
                photo.selectedPhoto
              }

              photoError={
                photo.photoError
              }

              loading={
                form.loading
              }

              fileInputRef={
                fileInputRef
              }

              error={
                form.error
              }

              setName={
                form.setName
              }

              setPhone={
                form.setPhone
              }

              setCategory={
                form.setCategory
              }

              setSubcategory={
                form.setSubcategory
              }

              setSpecialty={
                form.setSpecialty
              }

              setLocation={
                form.setLocation
              }

              setLabourChauk={
                form.setLabourChauk
              }

              setYearsExperience={
                form.setYearsExperience
              }

              setCompletedJobs={
                form.setCompletedJobs
              }

              setBio={
                form.setBio
              }

              setServices={
                form.setServices
              }

              setPricingType={
                form.setPricingType
              }

              setStartingPrice={
                form.setStartingPrice
              }

              setHalfDayPrice={
                form.setHalfDayPrice
              }

              setFullDayPrice={
                form.setFullDayPrice
              }

              setMonthlyPrice={
                form.setMonthlyPrice
              }

              setVisitCharge={
                form.setVisitCharge
              }

              setVisiblePricingTypes={
                form.setVisiblePricingTypes
              }

              /* =========================================
                 DISPLAY CHARGE
              ========================================= */

              displayService={
                form.form.displayService
              }

              setDisplayService={
                form.setDisplayService
              }

              setRating={
                form.setRating
              }

              setReviewCount={
                form.setReviewCount
              }

              setResponseTime={
                form.setResponseTime
              }

              setAvailable={
                form.setAvailable
              }

              onPhotoSelect={
                photo.handlePhotoSelect
              }

              onRemovePhoto={
                photo.handleRemovePhoto
              }

              onUploadClick={() =>
                fileInputRef.current?.click()
              }
            />

            <EditWorkerBottomBar
              loading={
                form.loading
              }
              photoUploading={
                photoUploading
              }
              keyboardOpen={
                keyboardOpen
              }
              onClose={
                onClose
              }
            />
          </>
        )}
      </form>
    </div>
  );
}