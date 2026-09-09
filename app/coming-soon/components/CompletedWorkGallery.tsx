"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  UserCheck,
  UserRound,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* ============================================================
   TYPES
============================================================ */

interface CompletedBooking {
  id: string;
  booking_id: string;
  worker_request_id: string | null;
  service_type: string | null;
  description: string | null;
  worker_name: string | null;
  worker_photo: string | null;
  customer_name: string | null;
  booking_date: string | null;
  booking_time: string | null;
  created_at: string | null;
}

interface CompletedRequest {
  id: string;
  workers_required: number | null;
  location: string | null;
  category: string | null;
  work_date: string | null;
  start_time: string | null;
  duration: string | null;
  budget: number | null;
  requirement: string | null;
  status: string | null;
  requester_name: string | null;
  requester_mobile: string | null;
  requester_email: string | null;
  company_name: string | null;
  project_name: string | null;
  project_type: string | null;
  total_workers: number | null;
  is_deleted: boolean | null;
  created_at: string | null;
  worker_name: string | null;
}

interface CompletedWorkImage {
  id: string;
  booking_id: string | null;
  worker_request_id: string | null;
  image_url: string;
  created_at: string | null;
}

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string | null;
}

interface GalleryWork {
  id: string;
  booking_id: string | null;
  worker_request_id: string | null;
  work_name: string;
  images: GalleryImage[];
  worker_name: string;
  worker_photo: string | null;
  customer_name: string;
  completed_date: string | null;
  completed_time: string | null;
  description: string | null;
  source: "booking" | "request";
}

/* ============================================================
   DATE FORMAT
============================================================ */

const formatDate = (date: string | null) => {
  if (!date) return "Completed";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ============================================================
   SAFE IMAGE
============================================================ */

function GalleryImage({
  src,
  alt,
  className,
  fallbackIconSize = "small",
}: {
  src: string;
  alt: string;
  className: string;
  fallbackIconSize?: "small" | "large";
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <ImageIcon
          className={
            fallbackIconSize === "large"
              ? "h-7 w-7 text-slate-300"
              : "h-3.5 w-3.5 text-slate-300"
          }
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-100">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-green-500" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.error("[CompletedWorkGallery] Image failed:", src);
          setError(true);
        }}
        className={`${className} transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function CompletedWorkGallery() {
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImages, setSelectedImages] = useState<
    Record<string, string>
  >({});

  /* ============================================================
     FETCH COMPLETED WORK
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const fetchCompletedWork = async () => {
      try {
        setLoading(true);

        /* ======================================================
           1. BOOKINGS
        ====================================================== */

        const { data: bookingData, error: bookingError } =
          await supabase
            .from("bookings")
            .select(
              `
                id,
                booking_id,
                worker_request_id,
                service_type,
                description,
                worker_name,
                worker_photo,
                customer_name,
                booking_date,
                booking_time,
                created_at
              `,
            )
            .eq("booking_status", "completed")
            .order("booking_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (bookingError) {
          console.error(
            "[CompletedWork] Booking fetch error:",
            bookingError,
          );
        }

        const completedBookings =
          (bookingData || []) as CompletedBooking[];

        /* ======================================================
           2. WORKER REQUESTS
        ====================================================== */

        const { data: requestData, error: requestError } =
          await supabase
            .from("worker_requests")
            .select(
              `
                id,
                workers_required,
                location,
                category,
                work_date,
                start_time,
                duration,
                budget,
                requirement,
                status,
                requester_name,
                requester_mobile,
                requester_email,
                company_name,
                project_name,
                project_type,
                total_workers,
                is_deleted,
                created_at,
                worker_name
              `,
            )
            .or("is_deleted.eq.false,is_deleted.is.null")
            .order("work_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (requestError) {
          console.error(
            "[CompletedWork] Worker request fetch error:",
            requestError,
          );
        }

        const completedRequests =
          (requestData || []) as CompletedRequest[];

        /* ======================================================
           3. REQUEST MAP
        ====================================================== */

        const requestMap = new Map<string, CompletedRequest>();

        completedRequests.forEach((request) => {
          if (request.id) {
            requestMap.set(request.id, request);
          }
        });

        /* ======================================================
           4. LINKED BOOKINGS
        ====================================================== */

        const requestIds = completedRequests
          .map((request) => request.id)
          .filter((id): id is string => Boolean(id));

        let requestBookings: CompletedBooking[] = [];

        if (requestIds.length > 0) {
          const {
            data: linkedBookingData,
            error: linkedBookingError,
          } = await supabase
            .from("bookings")
            .select(
              `
                id,
                booking_id,
                worker_request_id,
                service_type,
                description,
                worker_name,
                worker_photo,
                customer_name,
                booking_date,
                booking_time,
                created_at
              `,
            )
            .in("worker_request_id", requestIds);

          if (linkedBookingError) {
            console.error(
              "[CompletedWork] Linked booking fetch error:",
              linkedBookingError,
            );
          }

          requestBookings =
            (linkedBookingData || []) as CompletedBooking[];
        }

        /* ======================================================
           5. MERGE BOOKINGS
        ====================================================== */

        const allBookings: CompletedBooking[] = [
          ...completedBookings,
        ];

        requestBookings.forEach((booking) => {
          const exists = allBookings.some(
            (item) => item.booking_id === booking.booking_id,
          );

          if (!exists) {
            allBookings.push(booking);
          }
        });

        /* ======================================================
           6. FETCH IMAGES
        ====================================================== */

        let images: CompletedWorkImage[] = [];

        const imageQueries = [];

        const bookingIds = allBookings
          .map((booking) => booking.booking_id)
          .filter((id): id is string => Boolean(id));

        if (bookingIds.length > 0) {
          imageQueries.push(
            supabase
              .from("completed_work_images")
              .select(
                `
                  id,
                  booking_id,
                  worker_request_id,
                  image_url,
                  created_at
                `,
              )
              .in("booking_id", bookingIds),
          );
        }

        if (requestIds.length > 0) {
          imageQueries.push(
            supabase
              .from("completed_work_images")
              .select(
                `
                  id,
                  booking_id,
                  worker_request_id,
                  image_url,
                  created_at
                `,
              )
              .in("worker_request_id", requestIds),
          );
        }

        /* ======================================================
           7. IMAGE RESULTS
        ====================================================== */

        if (imageQueries.length > 0) {
          const imageResults = await Promise.all(imageQueries);

          const imageMapById = new Map<
            string,
            CompletedWorkImage
          >();

          imageResults.forEach((result) => {
            if (result.error) {
              console.error(
                "[CompletedWork] Image query error:",
                result.error,
              );

              return;
            }

            const rows =
              (result.data || []) as CompletedWorkImage[];

            rows.forEach((image) => {
              if (image.id && image.image_url) {
                imageMapById.set(image.id, image);
              }
            });
          });

          images = Array.from(imageMapById.values());
        }

        /* ======================================================
           8. IMAGE MAPS
        ====================================================== */

        const bookingImageMap = new Map<
          string,
          GalleryImage[]
        >();

        const requestImageMap = new Map<
          string,
          GalleryImage[]
        >();

        images.forEach((image) => {
          if (!image.image_url) return;

          if (image.booking_id) {
            const existing =
              bookingImageMap.get(image.booking_id) || [];

            existing.push({
              id: image.id,
              image_url: image.image_url,
              created_at: image.created_at,
            });

            bookingImageMap.set(
              image.booking_id,
              existing,
            );
          }

          if (image.worker_request_id) {
            const existing =
              requestImageMap.get(
                image.worker_request_id,
              ) || [];

            existing.push({
              id: image.id,
              image_url: image.image_url,
              created_at: image.created_at,
            });

            requestImageMap.set(
              image.worker_request_id,
              existing,
            );
          }
        });

        /* ======================================================
           9. GALLERY WORKS
        ====================================================== */

        const galleryWorks: GalleryWork[] = [];

        /* ======================================================
           10. BOOKING WORKS
        ====================================================== */

        allBookings.forEach((booking) => {
          const bookingImages =
            bookingImageMap.get(booking.booking_id) || [];

          if (bookingImages.length === 0) {
            return;
          }

          const request = booking.worker_request_id
            ? requestMap.get(booking.worker_request_id)
            : null;

          galleryWorks.push({
            id: `booking-${booking.booking_id}`,
            booking_id: booking.booking_id,
            worker_request_id:
              booking.worker_request_id,
            work_name:
              booking.service_type ||
              request?.project_name ||
              request?.category ||
              "Completed Work",
            images: bookingImages,
            worker_name:
              booking.worker_name ||
              request?.worker_name ||
              "Workkerz Professional",
            worker_photo:
              booking.worker_photo || null,
            customer_name:
              booking.customer_name ||
              request?.requester_name ||
              request?.company_name ||
              "Workkerz Customer",
            completed_date:
              booking.booking_date ||
              request?.work_date ||
              booking.created_at ||
              request?.created_at ||
              null,
            completed_time:
              booking.booking_time ||
              request?.start_time ||
              null,
            description:
              booking.description ||
              request?.requirement ||
              null,
            source: "booking",
          });
        });

        /* ======================================================
           11. REQUEST WORKS
        ====================================================== */

        completedRequests.forEach((request) => {
          const requestImages =
            requestImageMap.get(request.id) || [];

          if (requestImages.length === 0) {
            return;
          }

          const hasBookingGallery = allBookings.some(
            (booking) => {
              if (
                booking.worker_request_id !==
                request.id
              ) {
                return false;
              }

              const bookingImages =
                bookingImageMap.get(
                  booking.booking_id,
                ) || [];

              return bookingImages.length > 0;
            },
          );

          if (hasBookingGallery) {
            return;
          }

          galleryWorks.push({
            id: `request-${request.id}`,
            booking_id: null,
            worker_request_id: request.id,
            work_name:
              request.project_name ||
              request.category ||
              request.project_type ||
              "Completed Work",
            images: requestImages,
            worker_name:
              request.worker_name ||
              "Workkerz Professional",
            worker_photo: null,
            customer_name:
              request.requester_name ||
              request.company_name ||
              "Workkerz Customer",
            completed_date:
              request.work_date ||
              request.created_at ||
              null,
            completed_time:
              request.start_time || null,
            description:
              request.requirement || null,
            source: "request",
          });
        });

        /* ======================================================
           12. SAFETY FALLBACK
        ====================================================== */

        requestImageMap.forEach(
          (requestImages, requestId) => {
            if (requestImages.length === 0) {
              return;
            }

            const alreadyExists = galleryWorks.some(
              (work) =>
                work.worker_request_id ===
                requestId,
            );

            if (alreadyExists) {
              return;
            }

            const request =
              requestMap.get(requestId);

            galleryWorks.push({
              id: `request-${requestId}`,
              booking_id: null,
              worker_request_id: requestId,
              work_name:
                request?.project_name ||
                request?.category ||
                request?.project_type ||
                "Completed Work",
              images: requestImages,
              worker_name:
                request?.worker_name ||
                "Workkerz Professional",
              worker_photo: null,
              customer_name:
                request?.requester_name ||
                request?.company_name ||
                "Workkerz Customer",
              completed_date:
                request?.work_date ||
                request?.created_at ||
                images.find(
                  (image) =>
                    image.worker_request_id ===
                    requestId,
                )?.created_at ||
                null,
              completed_time:
                request?.start_time || null,
              description:
                request?.requirement || null,
              source: "request",
            });
          },
        );

        /* ======================================================
           13. UNIQUE
        ====================================================== */

        const uniqueWorks = Array.from(
          new Map(
            galleryWorks.map((work) => [
              work.id,
              work,
            ]),
          ).values(),
        );

        /* ======================================================
           14. SORT
        ====================================================== */

        uniqueWorks.sort((a, b) => {
          const aDate = a.completed_date
            ? new Date(a.completed_date).getTime()
            : 0;

          const bDate = b.completed_date
            ? new Date(b.completed_date).getTime()
            : 0;

          return bDate - aDate;
        });

        /* ======================================================
           15. INITIAL IMAGE
        ====================================================== */

        const initialSelectedImages: Record<
          string,
          string
        > = {};

        uniqueWorks.forEach((work) => {
          if (work.images.length > 0) {
            initialSelectedImages[work.id] =
              work.images[0].image_url;
          }
        });

        if (mounted) {
          setWorks(uniqueWorks);
          setSelectedImages(
            initialSelectedImages,
          );
        }
      } catch (error) {
        console.error(
          "[CompletedWork] Fetch error:",
          error,
        );

        if (mounted) {
          setWorks([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchCompletedWork();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     EMPTY
  ============================================================ */

  if (!loading && works.length === 0) {
    return null;
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section className="relative overflow-hidden bg-[#f7f8f5] px-3 py-2 sm:px-5 sm:py-10 lg:px-2 lg:py-4">
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute -left-32 top-20 h-64 w-64 rounded-full bg-green-100/40 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-10 h-64 w-64 rounded-full bg-emerald-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* ======================================================
           HEADER
        ====================================================== */}

        <div className="mx-auto max-w-2xl text-center">

          <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-2.5 py-1 text-[9px] font-bold text-green-700 shadow-sm sm:px-3 sm:py-1.5 sm:text-[10px] lg:px-3.5 lg:py-2 lg:text-xs">
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
            Completed Work
          </div>

          <h2 className="mt-2.5 text-2xl font-black tracking-tight text-slate-950 sm:mt-3 sm:text-3xl lg:mt-4 lg:text-5xl">
            Real Work.
            <span className="text-green-600">
              {" "}Real Results.
            </span>
          </h2>

          <p className="mx-auto mt-1.5 max-w-xl text-[10px] leading-4 text-slate-500 sm:mt-2 sm:text-xs sm:leading-5 lg:mt-3 lg:text-base lg:leading-6">
            Explore real work completed by
            professionals through Workkerz.
          </p>
        </div>

        {/* ======================================================
           LOADING
        ====================================================== */}

        {loading && (
          <div className="mt-8 flex min-h-35 items-center justify-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
              Loading...
            </div>
          </div>
        )}

        {/* ======================================================
           GRID
        ====================================================== */}

        {!loading && works.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:mt-10 lg:grid-cols-4 lg:gap-5">

            {works.map((work) => {
              const mainImage =
                selectedImages[work.id] ||
                work.images[0]?.image_url ||
                "";

              return (
                <article
                  key={work.id}
                  className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:rounded-2xl"
                >

                  {/* ==================================================
                     IMAGE
                  ================================================== */}

                  <div className="relative aspect-[1.22/1] overflow-hidden bg-slate-100 sm:aspect-[1.3/1] lg:aspect-[4/3]">

                    {mainImage ? (
                      <GalleryImage
                        src={mainImage}
                        alt={
                          work.work_name ||
                          "Completed work"
                        }
                        fallbackIconSize="large"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-300 lg:h-9 lg:w-9" />
                      </div>
                    )}

                    {/* IMAGE GRADIENT */}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/65 to-transparent sm:h-14 lg:h-20" />

                    {/* COMPLETED BADGE */}

                    <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[6px] font-extrabold text-green-700 shadow-sm backdrop-blur sm:left-2 sm:top-2 sm:gap-1 sm:px-2 sm:py-1 sm:text-[8px] lg:px-2.5 lg:py-1.5 lg:text-[10px]">
                      <CheckCircle2 className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5" />
                      Completed
                    </div>

                    {/* IMAGE COUNT */}

                    {work.images.length > 1 && (
                      <div className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[6px] font-bold text-white backdrop-blur sm:right-2 sm:top-2 sm:gap-1 sm:px-2 sm:py-1 sm:text-[8px] lg:px-2.5 lg:py-1.5 lg:text-[10px]">
                        <ImageIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5" />
                        {work.images.length}
                      </div>
                    )}

                    {/* DATE */}

                    <div className="absolute bottom-1.5 left-1.5 flex max-w-[90%] items-center gap-0.5 truncate text-[6px] font-semibold text-white drop-shadow-md sm:bottom-2 sm:left-2 sm:gap-1 sm:text-[8px] lg:text-[10px]">
                      <CalendarDays className="h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5" />

                      <span className="truncate">
                        {formatDate(
                          work.completed_date,
                        )}
                      </span>

                      {work.completed_time && (
                        <>
                          <span className="opacity-60">
                            •
                          </span>

                          <span className="truncate">
                            {work.completed_time}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ==================================================
                     IMAGE THUMBNAILS
                  ================================================== */}

                  {work.images.length > 1 && (
                    <div className="flex gap-1 overflow-hidden border-b border-slate-100 bg-slate-50 p-1 sm:gap-1.5 sm:p-1.5 lg:p-2">

                      {work.images
                        .slice(0, 5)
                        .map(
                          (
                            image,
                            imageIndex,
                          ) => {
                            const isSelected =
                              mainImage ===
                              image.image_url;

                            return (
                              <button
                                key={image.id}
                                type="button"
                                onClick={() =>
                                  setSelectedImages(
                                    (previous) => ({
                                      ...previous,
                                      [work.id]:
                                        image.image_url,
                                    }),
                                  )
                                }
                                className={`relative h-6 w-6 shrink-0 overflow-hidden rounded-md border transition-all sm:h-8 sm:w-8 sm:rounded-lg lg:h-10 lg:w-10 ${
                                  isSelected
                                    ? "border-green-500 ring-1 ring-green-200"
                                    : "border-transparent opacity-60 hover:border-slate-300 hover:opacity-100"
                                }`}
                                aria-label={`Show image ${
                                  imageIndex + 1
                                }`}
                              >
                                <GalleryImage
                                  src={
                                    image.image_url
                                  }
                                  alt={`${work.work_name} image ${
                                    imageIndex + 1
                                  }`}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            );
                          },
                        )}
                    </div>
                  )}

                  {/* ==================================================
                     CONTENT
                  ================================================== */}

                  <div className="p-2 sm:p-3 lg:p-4">

                    {/* WORK NAME */}

                    <h3
                      title={work.work_name}
                      className="truncate text-[9px] font-extrabold leading-3 tracking-tight text-slate-900 sm:text-xs sm:leading-4 lg:text-base lg:leading-5"
                    >
                      {work.work_name}
                    </h3>

                    {/* DESCRIPTION
                        Hidden on mobile to keep cards compact
                    */}

                    {work.description && (
                      <p
                        title={work.description}
                        className="mt-0.5 hidden line-clamp-1 text-xs leading-5 text-slate-400 sm:block"
                      >
                        {work.description}
                      </p>
                    )}

                    {/* ==================================================
                       WORKER + CUSTOMER
                    ================================================== */}

                    <div className="mt-1.5 grid grid-cols-2 gap-1 sm:mt-2 sm:gap-1.5 lg:mt-3 lg:gap-2">

                      {/* WORKER */}

                      <div className="flex min-w-0 items-center gap-1 overflow-hidden rounded-md border border-green-100 bg-green-50/70 px-1 py-1 sm:gap-1.5 sm:rounded-lg sm:p-1.5 lg:gap-2 lg:rounded-xl lg:p-2">

                        <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-green-600 ring-1 ring-green-200 sm:h-6 sm:w-6 lg:h-8 lg:w-8">

                          {work.worker_photo ? (
                            <GalleryImage
                              src={
                                work.worker_photo
                              }
                              alt={
                                work.worker_name ||
                                "Worker"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[5px] font-bold uppercase tracking-wide text-green-600 sm:text-[6px] lg:text-[8px]">
                            Worker
                          </p>

                          <p
                            title={
                              work.worker_name ||
                              "Worker"
                            }
                            className="truncate text-[6px] font-bold text-slate-800 sm:text-[8px] lg:text-[10px]"
                          >
                            {work.worker_name ||
                              "Worker"}
                          </p>
                        </div>
                      </div>

                      {/* CUSTOMER */}

                      <div className="flex min-w-0 items-center gap-1 overflow-hidden rounded-md border border-slate-200 bg-slate-50 px-1 py-1 sm:gap-1.5 sm:rounded-lg sm:p-1.5 lg:gap-2 lg:rounded-xl lg:p-2">

                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 sm:h-6 sm:w-6 lg:h-8 lg:w-8">
                          <UserCheck className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400 sm:text-[6px] lg:text-[8px]">
                            Booked By
                          </p>

                          <p
                            title={
                              work.customer_name ||
                              "Customer"
                            }
                            className="truncate text-[6px] font-bold text-slate-800 sm:text-[8px] lg:text-[10px]"
                          >
                            {work.customer_name ||
                              "Customer"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ==================================================
                       DESKTOP DATE FOOTER
                       Mobile hidden because date is already on image
                    ================================================== */}

                    <div className="mt-3 hidden items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-400 lg:flex">

                      <div className="flex min-w-0 items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-green-600" />

                        <span className="truncate">
                          {formatDate(
                            work.completed_date,
                          )}
                        </span>
                      </div>

                      {work.completed_time && (
                        <span className="ml-1 shrink-0 font-semibold">
                          {work.completed_time}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ======================================================
           EMPTY
        ====================================================== */}

        {!loading && works.length === 0 && (
          <div className="mt-8 flex min-h-[180px] items-center justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">
                <ImageIcon className="h-5 w-5 text-slate-300" />
              </div>

              <p className="mt-3 text-sm font-bold text-slate-600">
                No completed work available
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Completed projects will appear here.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
           FOOTER
        ====================================================== */}

        {!loading && works.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[8px] font-medium text-slate-400 sm:mt-8 sm:text-[10px] lg:mt-10 lg:text-xs">
            <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />

            <span>
              Completed by professionals on Workkerz
            </span>
          </div>
        )}
      </div>
    </section>
  );
}