
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BookingRow = {
  id: string;
  booking_id: string | null;
  customer_email: string | null;
  booking_status: string | null;
  [key: string]: unknown;
};

type CancellationRow = {
  id: string;
  booking_id: string;
  booking_number: string | null;
  status: string | null;
  cancellation_reason: string | null;
  reason: string | null;
  refund_status: string | null;
  refund_amount: number | string | null;
  refund_expected_from: string | null;
  refund_expected_by: string | null;
  requested_at: string | null;
  updated_at: string | null;
  refund_method: string | null;
  admin_verified_at: string | null;
  refund_initiated_at: string | null;
  refund_processed_at: string | null;
  razorpay_refund_id: string | null;
  admin_review_note: string | null;
  [key: string]: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!token) {
      return jsonError("Authentication required. Please sign in.", 401);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("MY BOOKINGS API: Supabase environment variables missing.");
      return jsonError("Server configuration is incomplete.", 500);
    }

    // Verify the customer's access token.
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return jsonError(
        "Your session has expired. Please sign in again.",
        401
      );
    }

    if (!user.email) {
      return jsonError(
        "Your account does not have an email address. Please contact support.",
        400
      );
    }

    // Server-side database access. Never expose this key to the browser.
    const db = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // The verified schema uses bookings.id as the UUID
    // and bookings.booking_id as the display/reference ID.
    const { data: bookingData, error: bookingError } = await db
      .from("bookings")
      .select("*")
      .ilike("customer_email", user.email)
      .order("created_at", { ascending: false });

    if (bookingError) {
      console.error("MY BOOKINGS FETCH ERROR:", bookingError);
      return jsonError("Unable to load your bookings.", 500);
    }

    const bookings = (bookingData ?? []) as unknown as BookingRow[];

    // Match cancellation.booking_id against bookings.id, not bookings.booking_id.
    const bookingIds = [
      ...new Set(
        bookings
          .map((booking) => booking.id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      ),
    ];

    let cancellations: CancellationRow[] = [];

    if (bookingIds.length > 0) {
      const { data: cancellationData, error: cancellationError } = await db
        .from("booking_cancellation_requests")
        .select("*")
        .in("booking_id", bookingIds)
        .order("requested_at", { ascending: false });

      if (cancellationError) {
        console.error(
          "MY BOOKINGS CANCELLATION FETCH ERROR:",
          cancellationError
        );

        return jsonError(
          "Bookings loaded, but cancellation requests could not be loaded. Check the cancellation table schema.",
          500
        );
      }

      cancellations = (cancellationData ?? []) as unknown as CancellationRow[];
    }

    // Attach the latest cancellation request to each booking.
    const latestCancellationByBooking = new Map<string, CancellationRow>();

    for (const cancellation of cancellations) {
      if (
        cancellation.booking_id &&
        !latestCancellationByBooking.has(cancellation.booking_id)
      ) {
        latestCancellationByBooking.set(
          cancellation.booking_id,
          cancellation
        );
      }
    }

    const bookingsWithCancellation = bookings.map((booking) => ({
      ...booking,
      cancellation_request:
        latestCancellationByBooking.get(booking.id) ?? null,
    }));

    // Worker requests are supplementary; don't fail the bookings page
    // if this separate table/query is unavailable.
    let workerRequests: Record<string, unknown>[] = [];

    const { data: workerData, error: workerError } = await db
      .from("worker_requests")
      .select("*")
      .eq("requester_user_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (!workerError) {
      workerRequests = (workerData ?? []) as unknown as Record<
        string,
        unknown
      >[];
    } else {
      console.warn(
        "Worker requests user-ID query unavailable; trying email:",
        workerError.message
      );

      const { data: workerEmailData, error: workerEmailError } = await db
        .from("worker_requests")
        .select("*")
        .ilike("requester_email", user.email)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (!workerEmailError) {
        workerRequests = (workerEmailData ?? []) as unknown as Record<
          string,
          unknown
        >[];
      } else {
        console.warn(
          "Worker requests could not be loaded:",
          workerEmailError.message
        );
      }
    }

    console.info("MY BOOKINGS API RESULT", {
      customerEmail: user.email,
      bookingCount: bookings.length,
      cancellationCount: cancellations.length,
      workerRequestCount: workerRequests.length,
      matchedCancellationCount: bookingsWithCancellation.filter(
        (booking) => booking.cancellation_request !== null
      ).length,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          bookings: bookingsWithCancellation,
          cancellations,
          cancellationRequests: cancellations,
          workerRequests,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("MY BOOKINGS API UNEXPECTED ERROR:", error);

    return jsonError("An unexpected error occurred while loading your records.", 500);
  }
}
