import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingDraft = {
  booking_id?: string;
  worker_id?: string;
  worker_name?: string | null;
  worker_photo?: string | null;
  worker_specialty?: string | null;
  worker_rating?: number | null;
  service_type?: string;
  description?: string | null;
  booking_date?: string;
  booking_time?: string;
  booking_type?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  notes?: string | null;
  selected_materials?: Record<string, number> | unknown[];
  total_cost?: number;
  service_fee?: number;
  materials_cost?: number;
  package_price?: number;
  grand_total?: number;
  work_status?: string;
  worker_available?: boolean;
  house_no?: string | null;
  address?: string;
  landmark?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  address_type?: string | null;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function finiteAmount(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("[FREE BOOKING] Missing Supabase environment variables.");
      return jsonError("Booking service is not configured.", 500);
    }

    // Authenticate the customer. Do not trust customer details supplied in the body.
    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!accessToken) {
      return jsonError("Please sign in before confirming your booking.", 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);

    if (authError || !user?.id || !user.email) {
      return jsonError("Your session is invalid. Please sign in again.", 401);
    }

    const body = await request.json();
    const draft = body?.bookingDraft as BookingDraft | undefined;

    if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
      return jsonError("Booking details are missing.");
    }

    const bookingNumber = cleanString(draft.booking_id);
    const workerId = cleanString(draft.worker_id);
    const customerName = cleanString(draft.customer_name);
    const customerPhone = cleanString(draft.customer_phone);
    const customerEmail = cleanString(draft.customer_email).toLowerCase();
    const serviceType = cleanString(draft.service_type);
    const bookingDate = cleanString(draft.booking_date);
    const bookingTime = cleanString(draft.booking_time);
    const bookingType = cleanString(draft.booking_type);
    const address = cleanString(draft.address);

    if (!/^WRK-\d{6}-\d{3}$/.test(bookingNumber)) {
      return jsonError("Booking reference is invalid.");
    }

    if (
      !workerId ||
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !serviceType ||
      !bookingDate ||
      !bookingTime ||
      !bookingType ||
      !address
    ) {
      return jsonError("Some required booking details are missing.");
    }

    // Bind the booking to the authenticated customer.
    if (customerEmail !== user.email.toLowerCase()) {
      return jsonError("Customer email does not match the signed-in account.", 403);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Idempotency: if the same booking reference was already inserted, return it.
    const { data: existing, error: existingError } = await admin
      .from("bookings")
      .select("id, booking_id, customer_email")
      .eq("booking_id", bookingNumber)
      .maybeSingle();

    if (existingError) {
      console.error("[FREE BOOKING] Existing booking lookup failed:", existingError);
      return jsonError("Could not check the booking reference.", 500);
    }

    if (existing) {
      if (String(existing.customer_email || "").toLowerCase() !== user.email.toLowerCase()) {
        return jsonError("This booking reference is already in use.", 409);
      }

      return NextResponse.json({
        success: true,
        bookingId: existing.id,
        bookingNumber: existing.booking_id,
        paymentStatus: "not_required",
        message: "Your free booking is already submitted.",
        alreadyCreated: true,
      });
    }

    // Confirm that the selected worker exists.
    const { data: workerRow, error: workerError } = await admin
      .from("workers")
      .select("id")
      .eq("id", workerId)
      .maybeSingle();

    if (workerError) {
      console.error("[FREE BOOKING] Worker lookup failed:", workerError);
      return jsonError("Could not verify the selected worker.", 500);
    }

    if (!workerRow) {
      return jsonError("The selected worker could not be found.", 404);
    }

    // Preserve the worker's actual service price. Only the booking/platform
    // confirmation charge is free; this does not make the worker's work free.
    const totalCost = finiteAmount(draft.total_cost);
    const serviceFee = finiteAmount(draft.service_fee);
    const materialsCost = finiteAmount(draft.materials_cost);
    const packagePrice = finiteAmount(draft.package_price);
    const grandTotal = finiteAmount(draft.grand_total);

    const bookingPayload = {
      booking_id: bookingNumber,
      booking_status: "pending",
      payment_status: "not_required",
      payment_id: null,

      worker_id: workerId,
      worker_name: cleanString(draft.worker_name) || null,
      worker_photo: cleanString(draft.worker_photo) || null,
      worker_specialty: cleanString(draft.worker_specialty) || null,
      worker_rating: draft.worker_rating ?? null,

      service_type: serviceType,
      description: cleanString(draft.description) || null,
      booking_date: bookingDate,
      booking_time: bookingTime,
      booking_type: bookingType,

      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: user.email.toLowerCase(),
      notes: cleanString(draft.notes) || null,

      selected_materials: draft.selected_materials ?? {},
      total_cost: totalCost,
      service_fee: serviceFee,
      materials_cost: materialsCost,
      package_price: packagePrice,
      grand_total: grandTotal,

      work_status: "active",
      worker_available: false,

      house_no: cleanString(draft.house_no) || null,
      address,
      landmark: cleanString(draft.landmark) || null,
      city: cleanString(draft.city) || null,
      district: cleanString(draft.district) || null,
      state: cleanString(draft.state) || null,
      country: cleanString(draft.country) || "India",
      pincode: cleanString(draft.pincode) || null,
      address_type: cleanString(draft.address_type) || "home",
    };

    const { data: booking, error: insertError } = await admin
      .from("bookings")
      .insert(bookingPayload)
      .select("id, booking_id")
      .single();

    if (insertError || !booking) {
      // A concurrent request may have inserted the same booking number.
      if (insertError?.code === "23505") {
        const { data: duplicate } = await admin
          .from("bookings")
          .select("id, booking_id, customer_email")
          .eq("booking_id", bookingNumber)
          .maybeSingle();

        if (
          duplicate &&
          String(duplicate.customer_email || "").toLowerCase() === user.email.toLowerCase()
        ) {
          return NextResponse.json({
            success: true,
            bookingId: duplicate.id,
            bookingNumber: duplicate.booking_id,
            paymentStatus: "not_required",
            message: "Your free booking is already submitted.",
            alreadyCreated: true,
          });
        }
      }

      console.error("[FREE BOOKING] Insert failed:", insertError);
      return jsonError(
        insertError?.message || "Booking could not be submitted. Please try again.",
        500,
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingNumber: booking.booking_id,
      paymentStatus: "not_required",
      message: "Booking submitted successfully. No booking charge was collected.",
    });
  } catch (error) {
    console.error("[FREE BOOKING] Unexpected error:", error);
    return jsonError(
      error instanceof Error ? error.message : "Unexpected booking error.",
      500,
    );
  }
}
