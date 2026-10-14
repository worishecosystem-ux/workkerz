
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Decision = "approve" | "reject";

function json(
  success: boolean,
  message: string,
  status = 200,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      success,
      ...(success ? { message } : { error: message }),
      ...extra,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin
    const authorization = request.headers.get("authorization");
    const token = authorization
      ?.match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim();

    if (!token) {
      return json(false, "Authentication required. Please log in again.", 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return json(false, "Invalid or expired admin session.", 401);
    }

    // 2. Verify admin permissions
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error("[Cancellation Decision] Admin lookup:", adminError.message);
      return json(false, "Unable to verify admin permissions.", 500);
    }

    const role = String(admin?.role ?? "").toLowerCase();

    if (
      !admin ||
      admin.is_active !== true ||
      !["admin", "super_admin", "finance_admin"].includes(role)
    ) {
      return json(false, "You do not have permission to manage cancellations.", 403);
    }

    // 3. Validate payload
    const body = await request.json();

    const requestType =
      typeof body.requestType === "string"
        ? body.requestType.trim().toLowerCase()
        : "booking";

    const requestId =
      typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";

    const decision = body.decision as Decision;

    const reviewNote =
      typeof body.reviewNote === "string"
        ? body.reviewNote.trim()
        : "";

    if (!requestId) {
      return json(false, "Request ID is required.", 400);
    }

    if (!["approve", "reject"].includes(decision)) {
      return json(false, "Decision must be approve or reject.", 400);
    }

    // =========================================================
    // 4. WORKER REQUEST CANCELLATION
    //    This branch MUST run before booking cancellation logic.
    // =========================================================
    if (requestType === "worker_request") {
      const { data: workerRequest, error: workerLookupError } =
        await supabaseAdmin
          .from("worker_requests")
          .select("id, cancellation_status, status")
          .eq("id", requestId)
          .maybeSingle();

      if (workerLookupError) {
        console.error(
          "[Worker Request Decision] Lookup:",
          workerLookupError.message
        );

        return json(
          false,
          `Unable to load worker request: ${workerLookupError.message}`,
          500
        );
      }

      if (!workerRequest) {
        return json(
          false,
          "Worker request cancellation not found in worker_requests.",
          404
        );
      }

      const currentCancellationStatus = String(
        workerRequest.cancellation_status ?? ""
      ).toLowerCase();

      if (currentCancellationStatus !== "cancellation_requested") {
        return json(
          false,
          `This request is no longer pending. Current status: ${
            currentCancellationStatus || "not requested"
          }. Refresh the table and try again.`,
          409
        );
      }

      const now = new Date().toISOString();

      const updatePayload: Record<string, unknown> = {
        cancellation_status:
          decision === "approve" ? "approved" : "rejected",
        cancellation_reviewed_at: now,
        cancellation_reviewed_by: user.id,
        cancellation_admin_note: reviewNote || null,
      };

      if (decision === "approve") {
        updatePayload.status = "cancelled";
      }

      // Conditional update prevents two admins from deciding the same
      // pending cancellation simultaneously.
      const { data: updatedRequest, error: updateError } =
        await supabaseAdmin
          .from("worker_requests")
          .update(updatePayload)
          .eq("id", requestId)
          .eq("cancellation_status", "cancellation_requested")
          .select("id, cancellation_status, status")
          .maybeSingle();

      if (updateError) {
        console.error(
          "[Worker Request Decision] Update:",
          updateError.message
        );

        return json(
          false,
          `Unable to update worker request cancellation: ${updateError.message}`,
          500
        );
      }

      if (!updatedRequest) {
        return json(
          false,
          "Cancellation request was already reviewed. Refresh the table.",
          409
        );
      }

      return json(
        true,
        decision === "approve"
          ? "Worker request cancellation approved."
          : "Worker request cancellation rejected.",
        200,
        {
          requestType: "worker_request",
          data: updatedRequest,
          refundInitiated: false,
        }
      );
    }

    // =========================================================
    // 5. BOOKING CANCELLATION
    //    Existing booking cancellation flow remains separate.
    // =========================================================
    if (requestType !== "booking") {
      return json(false, "Unsupported cancellation request type.", 400);
    }

    const { data: cancellationRequest, error: cancellationLookupError } =
      await supabaseAdmin
        .from("booking_cancellation_requests")
        .select("id, booking_id, status")
        .eq("id", requestId)
        .maybeSingle();

    if (cancellationLookupError) {
      console.error(
        "[Booking Cancellation Decision] Lookup:",
        cancellationLookupError.message
      );

      return json(
        false,
        `Unable to load booking cancellation: ${cancellationLookupError.message}`,
        500
      );
    }

    if (!cancellationRequest) {
      return json(false, "Booking cancellation request not found.", 404);
    }

    const bookingId = cancellationRequest.booking_id;

    if (!bookingId) {
      return json(false, "No booking is linked to this cancellation request.", 400);
    }

    const { data: booking, error: bookingLookupError } = await supabaseAdmin
      .from("bookings")
      .select("id, booking_status")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingLookupError) {
      console.error(
        "[Booking Cancellation Decision] Booking lookup:",
        bookingLookupError.message
      );

      return json(false, "Unable to load the linked booking.", 500);
    }

    if (!booking) {
      return json(false, "Linked booking not found.", 404);
    }

    const now = new Date().toISOString();

    const bookingUpdate: Record<string, unknown> = {
      cancellation_status: decision === "approve" ? "approved" : "rejected",
      cancellation_reviewed_at: now,
      cancellation_reviewed_by: user.id,
      cancellation_admin_note: reviewNote || null,
    };

    if (decision === "approve") {
      bookingUpdate.booking_status = "cancelled";
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update(bookingUpdate)
      .eq("id", bookingId);

    if (bookingUpdateError) {
      console.error(
        "[Booking Cancellation Decision] Booking update:",
        bookingUpdateError.message
      );

      return json(
        false,
        `Unable to update booking: ${bookingUpdateError.message}`,
        500
      );
    }

    const { data: updatedCancellation, error: cancellationUpdateError } =
      await supabaseAdmin
        .from("booking_cancellation_requests")
        .update({
          status: decision === "approve" ? "approved" : "rejected",
          reviewed_at: now,
          reviewed_by: user.id,
          admin_note: reviewNote || null,
        })
        .eq("id", requestId)
        .select("id, status, booking_id")
        .maybeSingle();

    if (cancellationUpdateError) {
      console.error(
        "[Booking Cancellation Decision] Request update:",
        cancellationUpdateError.message
      );

      return json(
        false,
        `Booking was updated, but cancellation request update failed: ${cancellationUpdateError.message}`,
        500
      );
    }

    return json(
      true,
      decision === "approve"
        ? "Booking cancellation approved."
        : "Booking cancellation rejected.",
      200,
      {
        requestType: "booking",
        data: updatedCancellation,
        refundInitiated: false,
      }
    );
  } catch (error) {
    console.error("[Cancellation Decision] Unexpected error:", error);

    if (error instanceof SyntaxError) {
      return json(false, "Invalid JSON request body.", 400);
    }

    return json(false, "Internal server error while processing cancellation.", 500);
  }
}
