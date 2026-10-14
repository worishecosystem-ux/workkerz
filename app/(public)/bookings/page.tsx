
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import Orders from "@/app/components/Orders";

import BookingsHeader from "./components/BookingsHeader";
import BookingCard from "./components/BookingCard";
import WorkerRequestCard from "./components/WorkerRequestCard";
import EmptyState from "./components/EmptyState";

import type {
  Booking,
  CancellationRequest,
  WorkerRequest,
  PageTab,
} from "./components/types";

type ApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    bookings?: Booking[];
    cancellations?: CancellationRequest[];
    cancellationRequests?: CancellationRequest[];
    workerRequests?: WorkerRequest[];
  };
};

const VALID_TABS: PageTab[] = [
  "bookings",
  "cancelled",
  "requests",
  "orders",
];

const normalizeId = (value: unknown) =>
  String(value ?? "").trim().toLowerCase();

export default function MyBookingsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<PageTab>("bookings");
  const [search, setSearch] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancellations, setCancellations] = useState<
    CancellationRequest[]
  >([]);
  const [workerRequests, setWorkerRequests] = useState<WorkerRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session?.access_token) {
        throw new Error("Please sign in to view your bookings.");
      }

      const response = await fetch("/api/my-bookings", {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: "application/json",
        },
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        throw new Error(
          result.message ||
            result.error ||
            `Could not load bookings. HTTP ${response.status}`
        );
      }

      const fetchedBookings = result.data?.bookings ?? [];
      const fetchedCancellations =
        result.data?.cancellations ??
        result.data?.cancellationRequests ??
        [];
      const fetchedWorkerRequests = result.data?.workerRequests ?? [];

      // Diagnostic output: compare the real booking UUIDs.
      console.table(
        fetchedBookings.map((booking) => {
          const matchedRequest = fetchedCancellations.find(
            (request) =>
              normalizeId(request.booking_id) ===
              normalizeId(booking.id)
          );

          return {
            booking_uuid: booking.id,
            booking_display_id: booking.booking_id,
            cancellation_request_id: matchedRequest?.id ?? "NOT FOUND",
            cancellation_booking_id:
              matchedRequest?.booking_id ?? "NOT FOUND",
            cancellation_status: matchedRequest?.status ?? "NO REQUEST",
          };
        })
      );

      console.info("MY BOOKINGS API COUNTS", {
        bookings: fetchedBookings.length,
        cancellations: fetchedCancellations.length,
        workerRequests: fetchedWorkerRequests.length,
      });

      console.info("CANCELLATION API DATA:", fetchedCancellations);

      setBookings(fetchedBookings);
      setCancellations(fetchedCancellations);
      setWorkerRequests(fetchedWorkerRequests);
    } catch (err) {
      console.error("MY BOOKINGS PAGE ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load your records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get("tab") as PageTab | null;

    if (requestedTab && VALID_TABS.includes(requestedTab)) {
      setTab(requestedTab);
    }

    void loadData();
  }, [loadData]);

  // Match cancellation requests to a booking by bookings.id.
  const cancellationForBooking = useCallback(
    (booking: Booking) => {
      return (
        cancellations.find(
          (request) =>
            normalizeId(request.booking_id) ===
            normalizeId(booking.id)
        ) ?? undefined
      );
    },
    [cancellations]
  );

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (!query) return true;

      return [
        booking.booking_id,
        booking.worker_name,
        booking.service_type,
        booking.booking_status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [bookings, search]);

  // Includes requests awaiting admin review, not only approved cancellations.
  const cancelledBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const relatedRequests = cancellations.filter(
        (request) =>
          normalizeId(request.booking_id) ===
          normalizeId(booking.id)
      );

      const bookingStatus = String(
        booking.booking_status ?? ""
      ).toLowerCase();

      const bookingIsCancelled = [
        "cancelled",
        "canceled",
      ].includes(bookingStatus);

      if (relatedRequests.length === 0 && !bookingIsCancelled) {
        return false;
      }

      if (!query) return true;

      return [
        booking.booking_id,
        booking.worker_name,
        booking.service_type,
        booking.booking_status,
        ...relatedRequests.map((request) => request.status),
        ...relatedRequests.map((request) => request.reason),
        ...relatedRequests.map(
          (request) => request.cancellation_reason
        ),
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [bookings, cancellations, search]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workerRequests.filter((request) => {
      if (!query) return true;

      return [
        request.category,
        request.location,
        request.project_name,
        request.project_type,
        request.status,
        request.requester_name,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [workerRequests, search]);

  const changeTab = useCallback(
    (nextTab: PageTab) => {
      setTab(nextTab);

      const params = new URLSearchParams(window.location.search);
      params.set("tab", nextTab);

      router.replace(`/bookings?${params.toString()}`, {
        scroll: false,
      });
    },
    [router]
  );

  const handleBookAgain = useCallback(
    (booking: Booking) => {
      if (booking.worker_id) {
        router.push(`/workers/${booking.worker_id}`);
        return;
      }

      router.push(
        `/workers?service=${encodeURIComponent(
          booking.service_type ?? ""
        )}`
      );
    },
    [router]
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <BookingsHeader
        tab={tab}
        onTabChange={changeTab}
        search={search}
        onSearch={setSearch}
        counts={{
          bookings: bookings.length,
          cancelled: cancelledBookings.length,
          requests: workerRequests.length,
        }}
        onRefresh={loadData}
      />

      <section className="mx-auto max-w-3xl px-3 pb-8 pt-64 sm:px-4">
        {error && (
          <div
            role="alert"
            className="mb-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>

            <div className="flex shrink-0 gap-2">
              {error.toLowerCase().includes("sign in") ||
              error.toLowerCase().includes("session has expired") ? (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700"
                >
                  Sign in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void loadData()}
                  className="rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "orders" ? (
          <Orders search={search} />
        ) : loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="text-sm text-slate-500">
              Loading your records…
            </p>
          </div>
        ) : tab === "requests" ? (
          filteredRequests.length > 0 ? (
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <WorkerRequestCard
                  key={request.id}
                  request={request}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No requests found"
              description="Your worker requests will appear here."
            />
          )
        ) : tab === "cancelled" ? (
          cancelledBookings.length > 0 ? (
            <div className="space-y-3">
              {cancelledBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  cancellation={cancellationForBooking(booking)}
                  onBookAgain={() => handleBookAgain(booking)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No cancellation requests found"
              description="Your cancellation requests and cancelled bookings will appear here."
            />
          )
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                cancellation={cancellationForBooking(booking)}
                onBookAgain={() => handleBookAgain(booking)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No bookings found"
            description="Your bookings will appear here."
          />
        )}
      </section>
    </main>
  );
}
