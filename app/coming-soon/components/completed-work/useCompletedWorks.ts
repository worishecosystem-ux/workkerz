
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import type {
  CompletedBooking,
  CompletedRequest,
  CompletedWorkImage,
  GalleryImageItem,
  GalleryWork,
} from "./types";

import { getWorkTitle } from "./utils";

interface CompletedWorksState {
  works: GalleryWork[];
  loading: boolean;
  error: string | null;
}

export function useCompletedWorks(): CompletedWorksState {
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchWorks() {
      setLoading(true);
      setError(null);

      try {
        const [bookingResult, requestResult] = await Promise.all([
          supabase
            .from("bookings")
            .select(
              "id, booking_id, worker_request_id, service_type, description, worker_name, worker_photo, customer_name, booking_date, booking_time, created_at"
            )
            .eq("booking_status", "completed")
            .order("booking_date", { ascending: false }),

          supabase
            .from("worker_requests")
            .select(
              "id, workers_required, location, category, work_date, start_time, duration, budget, requirement, status, requester_name, requester_mobile, requester_email, company_name, project_name, project_type, total_workers, is_deleted, created_at, worker_name"
            )
            .or("is_deleted.eq.false,is_deleted.is.null")
            .order("work_date", { ascending: false }),
        ]);

        if (bookingResult.error) throw bookingResult.error;
        if (requestResult.error) throw requestResult.error;

        const bookings = (bookingResult.data ?? []) as CompletedBooking[];
        const requests = (requestResult.data ?? []) as CompletedRequest[];

        const requestMap = new Map(
          requests.map((request) => [request.id, request])
        );

        const requestIds = requests.map((request) => request.id);
        const bookingIds = [
          ...new Set(
            bookings
              .map((booking) => booking.booking_id)
              .filter(Boolean)
          ),
        ];

        const linkedBookings: CompletedBooking[] = [];

        if (requestIds.length > 0) {
          const { data, error: linkedError } = await supabase
            .from("bookings")
            .select(
              "id, booking_id, worker_request_id, service_type, description, worker_name, worker_photo, customer_name, booking_date, booking_time, created_at"
            )
            .in("worker_request_id", requestIds);

          if (linkedError) throw linkedError;
          linkedBookings.push(...((data ?? []) as CompletedBooking[]));
        }

        const allBookings = Array.from(
          new Map(
            [...bookings, ...linkedBookings].map((booking) => [
              booking.booking_id || booking.id,
              booking,
            ])
          ).values()
        );

        const allBookingIds = [
          ...new Set(
            allBookings
              .map((booking) => booking.booking_id)
              .filter((id): id is string => Boolean(id))
          ),
        ];

        const imageQueries: PromiseLike<{
          data: CompletedWorkImage[] | null;
          error: { message: string } | null;
        }>[] = [];

        if (allBookingIds.length > 0) {
          imageQueries.push(
            supabase
              .from("completed_work_images")
              .select("id, booking_id, worker_request_id, image_url, created_at")
              .in("booking_id", allBookingIds)
          );
        }

        if (requestIds.length > 0) {
          imageQueries.push(
            supabase
              .from("completed_work_images")
              .select("id, booking_id, worker_request_id, image_url, created_at")
              .in("worker_request_id", requestIds)
          );
        }

        const imageResults = await Promise.all(imageQueries);
        const imageMap = new Map<string, CompletedWorkImage>();

        for (const result of imageResults) {
          if (result.error) throw result.error;

          for (const image of result.data ?? []) {
            if (image.id && image.image_url) {
              imageMap.set(image.id, image);
            }
          }
        }

        const bookingImages = new Map<string, GalleryImageItem[]>();
        const requestImages = new Map<string, GalleryImageItem[]>();

        for (const image of imageMap.values()) {
          const item: GalleryImageItem = {
            id: image.id,
            image_url: image.image_url,
            created_at: image.created_at,
          };

          if (image.booking_id) {
            const list = bookingImages.get(image.booking_id) ?? [];
            list.push(item);
            bookingImages.set(image.booking_id, list);
          }

          if (image.worker_request_id) {
            const list = requestImages.get(image.worker_request_id) ?? [];
            list.push(item);
            requestImages.set(image.worker_request_id, list);
          }
        }

        const gallery: GalleryWork[] = [];

        for (const booking of allBookings) {
          if (!booking.booking_id) continue;

          const images = bookingImages.get(booking.booking_id) ?? [];
          if (images.length === 0) continue;

          const request = booking.worker_request_id
            ? requestMap.get(booking.worker_request_id)
            : undefined;

          gallery.push({
            id: `booking-${booking.booking_id}`,
            booking_id: booking.booking_id,
            worker_request_id: booking.worker_request_id,
            work_name: getWorkTitle(
              booking.service_type,
              request?.project_name,
              request?.category
            ),
            images,
            worker_name:
              booking.worker_name ||
              request?.worker_name ||
              "Workkerz Professional",
            worker_photo: booking.worker_photo,
            customer_name:
              booking.customer_name ||
              request?.requester_name ||
              request?.company_name ||
              "Workkerz Customer",
            completed_date:
              booking.booking_date ||
              request?.work_date ||
              booking.created_at ||
              null,
            completed_time: booking.booking_time || request?.start_time || null,
            description: booking.description || request?.requirement || null,
            source: "booking",
          });
        }

        for (const request of requests) {
          const images = requestImages.get(request.id) ?? [];
          if (images.length === 0) continue;

          const hasBookingGallery = gallery.some(
            (work) => work.worker_request_id === request.id
          );

          if (hasBookingGallery) continue;

          gallery.push({
            id: `request-${request.id}`,
            booking_id: null,
            worker_request_id: request.id,
            work_name: getWorkTitle(
              request.project_name,
              request.category,
              request.project_type
            ),
            images,
            worker_name: request.worker_name || "Workkerz Professional",
            worker_photo: null,
            customer_name:
              request.requester_name ||
              request.company_name ||
              "Workkerz Customer",
            completed_date: request.work_date || request.created_at,
            completed_time: request.start_time,
            description: request.requirement,
            source: "request",
          });
        }

        const uniqueWorks = Array.from(
          new Map(gallery.map((work) => [work.id, work])).values()
        ).sort(
          (a, b) =>
            new Date(b.completed_date || 0).getTime() -
            new Date(a.completed_date || 0).getTime()
        );

        if (mounted) setWorks(uniqueWorks);
      } catch (err) {
        console.error("[CompletedWorkGallery] Fetch error:", err);

        if (mounted) {
          setWorks([]);
          setError("Completed work load nahi ho saka. Please try again.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchWorks();

    return () => {
      mounted = false;
    };
  }, []);

  return { works, loading, error };
}
