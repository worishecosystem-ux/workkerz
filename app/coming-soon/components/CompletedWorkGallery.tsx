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
  workers_required: number;
  location: string;
  category: string;
  work_date: string;
  start_time: string | null;
  duration: string | null;
  budget: number | null;
  requirement: string | null;
  status: string;
  requester_name: string | null;
  requester_mobile: string | null;
  requester_email: string | null;
  company_name: string | null;
  project_name: string | null;
  project_type: string | null;
  total_workers: number;
  is_deleted: boolean;
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
   DATE
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
   COMPONENT
============================================================ */

export default function CompletedWorkGallery() {
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImages, setSelectedImages] = useState<
    Record<string, string>
  >({});

  /* ============================================================
     FETCH
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const fetchCompletedWork = async () => {
      try {
        setLoading(true);

        /* ======================================================
           COMPLETED BOOKINGS
        ====================================================== */

        const { data: bookingData, error: bookingError } =
          await supabase
            .from("bookings")
            .select(`
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
            `)
            .eq("booking_status", "completed")
            .order("booking_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (bookingError) {
          console.error(
            "[CompletedWork] Completed booking fetch error:",
            bookingError,
          );
        }

        const completedBookings =
          (bookingData || []) as CompletedBooking[];

        /* ======================================================
           COMPLETED REQUESTS
        ====================================================== */

        const { data: requestData, error: requestError } =
          await supabase
            .from("worker_requests")
            .select(`
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
            `)
            .eq("status", "completed")
            .eq("is_deleted", false)
            .order("work_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (requestError) {
          console.error(
            "[CompletedWork] Completed request fetch error:",
            requestError,
          );
        }

        const completedRequests =
          (requestData || []) as CompletedRequest[];

        /* ======================================================
           REQUEST MAP
        ====================================================== */

        const requestMap = new Map<string, CompletedRequest>();

        completedRequests.forEach((request) => {
          requestMap.set(request.id, request);
        });

        /* ======================================================
           LINKED BOOKINGS
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
            .select(`
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
            `)
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
           MERGE BOOKINGS
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
           IDS
        ====================================================== */

        const bookingIds = allBookings
          .map((booking) => booking.booking_id)
          .filter((id): id is string => Boolean(id));

        const workerRequestIds = completedRequests
          .map((request) => request.id)
          .filter((id): id is string => Boolean(id));

        /* ======================================================
           FETCH IMAGES
        ====================================================== */

        let images: CompletedWorkImage[] = [];

        const imageQueries = [];

        if (bookingIds.length > 0) {
          imageQueries.push(
            supabase
              .from("completed_work_images")
              .select(
                "id, booking_id, worker_request_id, image_url, created_at",
              )
              .in("booking_id", bookingIds),
          );
        }

        if (workerRequestIds.length > 0) {
          imageQueries.push(
            supabase
              .from("completed_work_images")
              .select(
                "id, booking_id, worker_request_id, image_url, created_at",
              )
              .in("worker_request_id", workerRequestIds),
          );
        }

        if (imageQueries.length > 0) {
          const imageResults = await Promise.all(imageQueries);

          const imageMapById = new Map<
            string,
            CompletedWorkImage
          >();

          imageResults.forEach((result) => {
            if (result.error) {
              console.error(
                "[CompletedWork] Image fetch error:",
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
           IMAGE MAP
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
              requestImageMap.get(image.worker_request_id) || [];

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
           GALLERY WORKS
        ====================================================== */

        const galleryWorks: GalleryWork[] = [];

        /* ======================================================
           BOOKING WORKS
        ====================================================== */

        allBookings.forEach((booking) => {
          const bookingImages =
            bookingImageMap.get(booking.booking_id) || [];

          if (bookingImages.length === 0) return;

          const request = booking.worker_request_id
            ? requestMap.get(booking.worker_request_id)
            : null;

          const workName =
            booking.service_type ||
            request?.project_name ||
            request?.category ||
            "Completed Work";

          const customerName =
            booking.customer_name ||
            request?.requester_name ||
            request?.company_name ||
            "Workkerz Customer";

          const workerName =
            booking.worker_name ||
            request?.worker_name ||
            "Workkerz Professional";

          const completedDate =
            booking.booking_date ||
            request?.work_date ||
            booking.created_at ||
            request?.created_at ||
            null;

          const completedTime =
            booking.booking_time ||
            request?.start_time ||
            null;

          const description =
            booking.description ||
            request?.requirement ||
            null;

          galleryWorks.push({
            id: `booking-${booking.booking_id}`,
            booking_id: booking.booking_id,
            worker_request_id: booking.worker_request_id,
            work_name: workName,
            images: bookingImages,
            worker_name: workerName,
            worker_photo: booking.worker_photo || null,
            customer_name: customerName,
            completed_date: completedDate,
            completed_time: completedTime,
            description,
            source: "booking",
          });
        });

        /* ======================================================
           REQUEST WORKS
        ====================================================== */

        completedRequests.forEach((request) => {
          const requestImages =
            requestImageMap.get(request.id) || [];

          if (requestImages.length === 0) return;

          const hasLinkedBooking = allBookings.some(
            (booking) =>
              booking.worker_request_id === request.id &&
              bookingImageMap.has(booking.booking_id),
          );

          if (hasLinkedBooking) return;

          galleryWorks.push({
            id: `request-${request.id}`,
            booking_id: null,
            worker_request_id: request.id,
            work_name:
              request.project_name ||
              request.category ||
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
            completed_time: request.start_time || null,
            description:
              request.requirement || null,
            source: "request",
          });
        });

        /* ======================================================
           UNIQUE
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
           SORT
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
           INITIAL IMAGE
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
          setSelectedImages(initialSelectedImages);
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
     IMPORTANT:
     4 OR LESS = NORMAL
     MORE THAN 4 = COMPACT
  ============================================================ */

  const compact = works.length > 4;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section
      className={`relative overflow-hidden bg-[#f7f8f5] ${
        compact
          ? "px-3 py-8 sm:px-5 sm:py-10"
          : "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      }`}
    >
      {/* ========================================================
         BACKGROUND
      ======================================================== */}

      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-green-100/40 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-emerald-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* ======================================================
           HEADER
        ====================================================== */}

        <div
          className={`mx-auto text-center ${
            compact
              ? "max-w-xl"
              : "max-w-2xl"
          }`}
        >
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white font-bold text-green-700 shadow-sm ${
              compact
                ? "px-2.5 py-1 text-[9px]"
                : "px-3.5 py-2 text-xs"
            }`}
          >
            <CheckCircle2
              className={
                compact
                  ? "h-3 w-3"
                  : "h-4 w-4"
              }
            />

            Completed Work
          </div>

          <h2
            className={`font-black tracking-tight text-slate-950 ${
              compact
                ? "mt-3 text-2xl sm:text-3xl"
                : "mt-4 text-3xl sm:text-4xl md:text-5xl"
            }`}
          >
            Real Work.
            <span className="text-green-600">
              {" "}Real Results.
            </span>
          </h2>

          <p
            className={`mx-auto text-slate-500 ${
              compact
                ? "mt-2 max-w-lg text-[10px] leading-4 sm:text-xs"
                : "mt-3 max-w-xl text-sm leading-6 sm:text-base"
            }`}
          >
            Explore real work completed by professionals
            through Workkerz.
          </p>
        </div>

        {/* ======================================================
           LOADING
        ====================================================== */}

        {loading && (
          <div className="mt-10 flex min-h-[180px] items-center justify-center">
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
          <div
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
              compact
                ? "mt-6 gap-2.5 sm:gap-3 md:gap-3 lg:gap-4"
                : "mt-10 gap-4 sm:gap-5 lg:gap-6"
            }`}
          >
            {works.map((work) => {
              const mainImage =
                selectedImages[work.id] ||
                work.images[0]?.image_url ||
                "";

              return (
                <article
                  key={work.id}
                  className={`group min-w-0 overflow-hidden bg-white transition-all duration-300 ${
                    compact
                      ? "rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:shadow-md"
                      : "rounded-2xl border border-slate-200 shadow-[0_5px_25px_rgba(15,23,42,0.07)] hover:-translate-y-1 hover:shadow-xl"
                  }`}
                >
                  {/* ==================================================
                     IMAGE
                  ================================================== */}

                  <div
                    className={`relative overflow-hidden bg-slate-100 ${
                      compact
                        ? "aspect-[1.15/1]"
                        : "aspect-[4/3]"
                    }`}
                  >
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={
                          work.work_name ||
                          "Completed work"
                        }
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon
                          className={
                            compact
                              ? "h-6 w-6 text-slate-300"
                              : "h-10 w-10 text-slate-300"
                          }
                        />
                      </div>
                    )}

                    {/* IMAGE GRADIENT */}

                    <div
                      className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent ${
                        compact
                          ? "h-12"
                          : "h-20"
                      }`}
                    />

                    {/* COMPLETED */}

                    <div
                      className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 font-extrabold text-green-700 shadow-sm backdrop-blur ${
                        compact
                          ? "px-1.5 py-1 text-[7px]"
                          : "px-2.5 py-1.5 text-[10px]"
                      }`}
                    >
                      <CheckCircle2
                        className={
                          compact
                            ? "h-2.5 w-2.5"
                            : "h-3.5 w-3.5"
                        }
                      />

                      Completed
                    </div>

                    {/* IMAGE COUNT */}

                    {work.images.length > 1 && (
                      <div
                        className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 font-bold text-white backdrop-blur ${
                          compact
                            ? "px-1.5 py-1 text-[7px]"
                            : "px-2.5 py-1.5 text-[10px]"
                        }`}
                      >
                        <ImageIcon
                          className={
                            compact
                              ? "h-2.5 w-2.5"
                              : "h-3.5 w-3.5"
                          }
                        />

                        {work.images.length}
                      </div>
                    )}

                    {/* DATE */}

                    <div
                      className={`absolute bottom-2 left-2 flex max-w-[90%] items-center gap-1 truncate font-semibold text-white drop-shadow-md ${
                        compact
                          ? "text-[7px]"
                          : "text-[10px]"
                      }`}
                    >
                      <CalendarDays
                        className={
                          compact
                            ? "h-2.5 w-2.5 shrink-0"
                            : "h-3.5 w-3.5 shrink-0"
                        }
                      />

                      <span className="truncate">
                        {formatDate(
                          work.completed_date,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* ==================================================
                     SMALL IMAGE SELECTOR
                  ================================================== */}

                  {work.images.length > 1 && (
                    <div
                      className={`flex overflow-hidden bg-slate-50 ${
                        compact
                          ? "gap-1 border-b border-slate-100 p-1"
                          : "gap-1.5 border-b border-slate-100 p-2"
                      }`}
                    >
                      {work.images
                        .slice(0, 5)
                        .map((image, imageIndex) => {
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
                              className={`relative shrink-0 overflow-hidden border transition-all ${
                                compact
                                  ? "h-7 w-7 rounded-md border"
                                  : "h-10 w-10 rounded-lg border-2"
                              } ${
                                isSelected
                                  ? "border-green-500 ring-1 ring-green-200"
                                  : "border-transparent opacity-65 hover:border-slate-300 hover:opacity-100"
                              }`}
                              aria-label={`Show image ${
                                imageIndex + 1
                              }`}
                            >
                              <img
                                src={image.image_url}
                                alt={`${work.work_name} image ${
                                  imageIndex + 1
                                }`}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          );
                        })}
                    </div>
                  )}

                  {/* ==================================================
                     CONTENT
                  ================================================== */}

                  <div
                    className={
                      compact
                        ? "p-2.5"
                        : "p-4"
                    }
                  >
                    {/* WORK NAME */}

                    <h3
                      title={work.work_name}
                      className={`truncate font-extrabold tracking-tight text-slate-900 ${
                        compact
                          ? "text-[10px] leading-3"
                          : "text-sm leading-5 sm:text-base"
                      }`}
                    >
                      {work.work_name}
                    </h3>

                    {/* DESCRIPTION */}

                    {work.description && (
                      <p
                        title={work.description}
                        className={`line-clamp-1 text-slate-400 ${
                          compact
                            ? "mt-0.5 text-[7px] leading-3"
                            : "mt-1 text-xs leading-5"
                        }`}
                      >
                        {work.description}
                      </p>
                    )}

                    {/* ==================================================
                       WORKER + CUSTOMER
                    ================================================== */}

                    <div
                      className={`grid grid-cols-2 ${
                        compact
                          ? "mt-2 gap-1"
                          : "mt-4 gap-2"
                      }`}
                    >
                      {/* WORKER */}

                      <div
                        className={`flex min-w-0 items-center overflow-hidden border border-green-100 bg-green-50/70 ${
                          compact
                            ? "gap-1 rounded-md p-1"
                            : "gap-2 rounded-xl p-2"
                        }`}
                      >
                        <div
                          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-green-600 ring-1 ring-green-200 ${
                            compact
                              ? "h-5 w-5"
                              : "h-9 w-9"
                          }`}
                        >
                          {work.worker_photo ? (
                            <img
                              src={work.worker_photo}
                              alt={
                                work.worker_name ||
                                "Worker"
                              }
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound
                              className={
                                compact
                                  ? "h-2.5 w-2.5"
                                  : "h-4 w-4"
                              }
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-bold uppercase tracking-wide text-green-600 ${
                              compact
                                ? "text-[5px]"
                                : "text-[8px]"
                            }`}
                          >
                            Worker
                          </p>

                          <p
                            title={
                              work.worker_name ||
                              "Worker"
                            }
                            className={`truncate font-bold text-slate-800 ${
                              compact
                                ? "text-[7px]"
                                : "text-[10px]"
                            }`}
                          >
                            {work.worker_name ||
                              "Worker"}
                          </p>
                        </div>
                      </div>

                      {/* CUSTOMER */}

                      <div
                        className={`flex min-w-0 items-center overflow-hidden border border-slate-200 bg-slate-50 ${
                          compact
                            ? "gap-1 rounded-md p-1"
                            : "gap-2 rounded-xl p-2"
                        }`}
                      >
                        <div
                          className={`flex shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 ${
                            compact
                              ? "h-5 w-5"
                              : "h-9 w-9"
                          }`}
                        >
                          <UserCheck
                            className={
                              compact
                                ? "h-2.5 w-2.5"
                                : "h-4 w-4"
                            }
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-bold uppercase tracking-wide text-slate-400 ${
                              compact
                                ? "text-[5px]"
                                : "text-[8px]"
                            }`}
                          >
                            Booked By
                          </p>

                          <p
                            title={
                              work.customer_name ||
                              "Customer"
                            }
                            className={`truncate font-bold text-slate-800 ${
                              compact
                                ? "text-[7px]"
                                : "text-[10px]"
                            }`}
                          >
                            {work.customer_name ||
                              "Customer"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ==================================================
                       DATE FOOTER
                    ================================================== */}

                    <div
                      className={`flex min-w-0 items-center justify-between border-t border-slate-100 ${
                        compact
                          ? "mt-2 pt-1.5"
                          : "mt-4 pt-3"
                      }`}
                    >
                      <div
                        className={`flex min-w-0 items-center gap-1 font-medium text-slate-400 ${
                          compact
                            ? "text-[7px]"
                            : "text-[10px]"
                        }`}
                      >
                        <CalendarDays
                          className={
                            compact
                              ? "h-2.5 w-2.5 shrink-0 text-green-600"
                              : "h-3.5 w-3.5 shrink-0 text-green-600"
                          }
                        />

                        <span className="truncate">
                          {formatDate(
                            work.completed_date,
                          )}
                        </span>
                      </div>

                      {work.completed_time && (
                        <span
                          className={`ml-1 shrink-0 font-semibold text-slate-400 ${
                            compact
                              ? "text-[6px]"
                              : "text-[9px]"
                          }`}
                        >
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
          <div className="mt-10 flex min-h-[200px] items-center justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <ImageIcon className="h-6 w-6 text-slate-300" />
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
          <div
            className={`flex items-center justify-center gap-1.5 text-center font-medium text-slate-400 ${
              compact
                ? "mt-6 text-[8px]"
                : "mt-10 text-xs"
            }`}
          >
            <CheckCircle2
              className={
                compact
                  ? "h-3 w-3 text-green-600"
                  : "h-4 w-4 text-green-600"
              }
            />

            <span>
              Completed by professionals on Workkerz
            </span>
          </div>
        )}
      </div>
    </section>
  );
}