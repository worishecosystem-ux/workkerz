import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase environment variables",
  );
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

type ActionType =
  | "accept"
  | "reject";

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const bookingId =
      typeof body.booking_id === "string"
        ? body.booking_id
        : "";

    const action =
      typeof body.action === "string"
        ? (body.action as ActionType)
        : "";

    console.log(
      "========================================",
    );

    console.log(
      "[ADMIN BOOKING ACTION]",
      {
        bookingId,
        action,
      },
    );

    console.log(
      "========================================",
    );

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: "booking_id is required",
        },
        { status: 400 },
      );
    }

    if (
      action !== "accept" &&
      action !== "reject"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "action must be accept or reject",
        },
        { status: 400 },
      );
    }

    /* =========================================
       FIND BOOKING
    ========================================= */

    const {
      data: booking,
      error: bookingError,
    } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      console.error(
        "[ADMIN BOOKING ACTION] FIND ERROR:",
        bookingError,
      );

      return NextResponse.json(
        {
          success: false,
          error: bookingError.message,
        },
        { status: 404 },
      );
    }

    /* =========================================
       PREVENT DOUBLE ACTION
    ========================================= */

    if (
      booking.booking_status !==
        "pending" &&
      booking.booking_status !==
        "new"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Booking already processed. Current status: ${booking.booking_status}`,
          booking,
        },
        { status: 409 },
      );
    }

    /* =========================================
       ACCEPT
    ========================================= */

    if (action === "accept") {
      const {
        data: updatedBooking,
        error: updateError,
      } = await supabaseAdmin
        .from("bookings")
        .update({
          booking_status: "confirmed",
          work_status: "scheduled",
          worker_available: true,
        })
        .eq("id", bookingId)
        .select("*")
        .single();

      if (updateError) {
        console.error(
          "[ADMIN ACCEPT BOOKING ERROR]",
          updateError,
        );

        return NextResponse.json(
          {
            success: false,
            error: updateError.message,
          },
          { status: 500 },
        );
      }

      console.log(
        "[ADMIN BOOKING ACCEPTED]",
        bookingId,
      );

      return NextResponse.json({
        success: true,
        action: "accept",
        message: "Booking accepted successfully",
        booking: updatedBooking,
      });
    }

    /* =========================================
       REJECT
    ========================================= */

    const {
      data: updatedBooking,
      error: updateError,
    } = await supabaseAdmin
      .from("bookings")
      .update({
        booking_status: "rejected",
        work_status: "completed",
        worker_available: true,
      })
      .eq("id", bookingId)
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "[ADMIN REJECT BOOKING ERROR]",
        updateError,
      );

      return NextResponse.json(
        {
          success: false,
          error: updateError.message,
        },
        { status: 500 },
      );
    }

    console.log(
      "[ADMIN BOOKING REJECTED]",
      bookingId,
    );

    return NextResponse.json({
      success: true,
      action: "reject",
      message: "Booking rejected successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "[ADMIN BOOKING ACTION FATAL ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown server error",
      },
      { status: 500 },
    );
  }
}