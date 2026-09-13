import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFirebaseMessaging } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/* =========================================================
   CONSTANTS
========================================================= */

const ADMIN_ANDROID_APP_ID = "com.workkerz.admin";

const ADMIN_NOTIFICATION_CHANNEL_ID =
  "workkerz_admin_high";

/* =========================================================
   TYPES
========================================================= */

type NotificationType =
  | "booking"
  | "worker_request"
  | "order"
  | "marketing"
  | "system"
  | "offer"
  | "work"
  | "payment"
  | string;

/* =========================================================
   SUPABASE ADMIN
========================================================= */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing"
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/* =========================================================
   HELPERS
========================================================= */

function cleanString(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const result = value.trim();

  return result.length > 0
    ? result
    : null;
}

function stringValue(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /* =====================================================
       AUTH
    ===================================================== */

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (!authorization) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authorization token is required.",
        },
        { status: 401 }
      );
    }

    const accessToken =
      authorization
        .replace(
          /^Bearer\s+/i,
          ""
        )
        .trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid authorization token.",
        },
        { status: 401 }
      );
    }

    /* =====================================================
       SUPABASE
    ===================================================== */

    const supabase =
      getSupabaseAdmin();

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser(
        accessToken
      );

    if (
      userError ||
      !user
    ) {
      console.error(
        "[Notifications POST] Auth:",
        userError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    /* =====================================================
       BODY
    ===================================================== */

    let body: Record<
      string,
      unknown
    >;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       BASIC
    ===================================================== */

    const title =
      cleanString(
        body.title
      ) || "";

    const message =
      cleanString(
        body.message
      ) || "";

    const type: NotificationType =
      cleanString(
        body.type
      ) || "system";

    const image_url =
      cleanString(
        body.image_url
      );

    const icon =
      cleanString(
        body.icon
      ) || "📢";

    const action_url =
      cleanString(
        body.action_url
      );

    /* =====================================================
       REQUEST IDS
    ===================================================== */

    const requestedBookingId =
      cleanString(
        body.booking_id
      );

    const requestedWorkerRequestId =
      cleanString(
        body.worker_request_id
      );

    const requestedOrderId =
      cleanString(
        body.order_id
      );

    const requestedUserId =
      cleanString(
        body.user_id
      );

    const requestedIsGlobal =
      body.is_global === true;

    /* =====================================================
       DETAIL VALUES
    ===================================================== */

    let customer_name =
      cleanString(
        body.customer_name
      );

    let customer_phone =
      cleanString(
        body.customer_phone
      );

    let customer_email =
      cleanString(
        body.customer_email
      );

    let worker_name =
      cleanString(
        body.worker_name
      );

    let worker_phone =
      cleanString(
        body.worker_phone
      );

    let service_name =
      cleanString(
        body.service_name
      );

    let category =
      cleanString(
        body.category
      );

    let subcategory =
      cleanString(
        body.subcategory
      );

    let description =
      cleanString(
        body.description
      );

    let order_number =
      cleanString(
        body.order_number
      );

    let order_total =
      cleanString(
        body.order_total
      );

    let order_status =
      cleanString(
        body.order_status
      );

    let booking_status =
      cleanString(
        body.booking_status
      );

    let booking_date =
      cleanString(
        body.booking_date
      );

    let booking_time =
      cleanString(
        body.booking_time
      );

    let address =
      cleanString(
        body.address
      );

    let payment_method =
      cleanString(
        body.payment_method
      );

    let payment_status =
      cleanString(
        body.payment_status
      );

    let delivery_option =
      cleanString(
        body.delivery_option
      );

    let delivery_slot =
      cleanString(
        body.delivery_slot
      );

    let requester_type =
      cleanString(
        body.requester_type
      );

    let company_name =
      cleanString(
        body.company_name
      );

    let project_name =
      cleanString(
        body.project_name
      );

    let project_type =
      cleanString(
        body.project_type
      );

    let workers_required =
      cleanString(
        body.workers_required
      );

    let duration =
      cleanString(
        body.duration
      );

    let budget =
      cleanString(
        body.budget
      );

    let requirement =
      cleanString(
        body.requirement
      );

    let source =
      cleanString(
        body.source
      );

    /* =====================================================
       ADMIN INCOMING TYPES
    ===================================================== */

    const isAdminIncoming =
      type === "booking" ||
      type === "worker_request" ||
      type === "order";

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Notification title is required.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Notification message is required.",
        },
        { status: 400 }
      );
    }

    if (
      !isAdminIncoming &&
      !requestedIsGlobal &&
      !requestedUserId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A user must be selected for a user notification.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       RESOLVED IDS
    ===================================================== */

    let resolvedBookingId =
      requestedBookingId ||
      null;

    let resolvedWorkerRequestId =
      requestedWorkerRequestId ||
      null;

    let resolvedOrderId =
      requestedOrderId ||
      null;

    /* =====================================================
       BOOKING LOOKUP
    ===================================================== */

    if (
      isAdminIncoming &&
      type === "booking" &&
      requestedBookingId
    ) {
      const {
        data: booking,
        error: bookingError,
      } =
        await supabase
          .from("bookings")
          .select("*")
          .eq(
            "id",
            requestedBookingId
          )
          .maybeSingle();

      console.log(
        "[ADMIN FCM] BOOKING LOOKUP:",
        {
          requestedBookingId,
          found:
            Boolean(booking),
          error:
            bookingError?.message ||
            null,
        }
      );

      if (bookingError) {
        console.error(
          "[ADMIN FCM] BOOKING LOOKUP ERROR:",
          bookingError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to lookup booking.",
            details:
              bookingError.message,
          },
          { status: 500 }
        );
      }

      if (!booking) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Booking not found.",
          },
          { status: 404 }
        );
      }

      /* -----------------------------------------------
         ID
      ----------------------------------------------- */

      resolvedBookingId =
        booking.id;

      /* -----------------------------------------------
         CUSTOMER
      ----------------------------------------------- */

      customer_name =
        booking.customer_name ||
        "";

      customer_phone =
        booking.customer_phone ||
        "";

      customer_email =
        booking.customer_email ||
        "";

      /* -----------------------------------------------
         WORKER
      ----------------------------------------------- */

      worker_name =
        booking.worker_name ||
        "";

      worker_phone =
        booking.worker_phone ||
        "";

      /* -----------------------------------------------
         SERVICE
      ----------------------------------------------- */

      service_name =
        booking.service_type ||
        "";

      category =
        booking.worker_specialty ||
        "";

      subcategory =
        booking.subcategory ||
        "";

      description =
        booking.description ||
        "";

      /* -----------------------------------------------
         BOOKING NUMBER
      ----------------------------------------------- */

      order_number =
        booking.booking_id ||
        "";

      /* -----------------------------------------------
         AMOUNT
      ----------------------------------------------- */

      order_total =
        booking.grand_total != null
          ? String(
              booking.grand_total
            )
          : "";

      /* -----------------------------------------------
         STATUS
      ----------------------------------------------- */

      booking_status =
        booking.booking_status ||
        "";

      /* -----------------------------------------------
         DATE
      ----------------------------------------------- */

      booking_date =
        booking.booking_date
          ? String(
              booking.booking_date
            )
          : "";

      /* -----------------------------------------------
         TIME
      ----------------------------------------------- */

      booking_time =
        booking.booking_time ||
        "";

      /* -----------------------------------------------
         ADDRESS
      ----------------------------------------------- */

      address = [
        booking.house_no,
        booking.address,
        booking.landmark,
        booking.city,
        booking.district,
        booking.state,
        booking.pincode,
      ]
        .filter(Boolean)
        .join(", ");

      console.log(
        "[ADMIN FCM] BOOKING FOUND:",
        {
          id:
            resolvedBookingId,

          booking_id:
            order_number,

          customer_name,
          customer_phone,

          worker_name,
          worker_phone,

          service_name,
          category,
          subcategory,

          booking_status,

          booking_date,
          booking_time,

          grand_total:
            booking.grand_total,

          address,
        }
      );
    }

    /* =====================================================
       ORDER LOOKUP
    ===================================================== */

    if (
      isAdminIncoming &&
      type === "order" &&
      requestedOrderId
    ) {
      console.log(
        "=========================================="
      );

      console.log(
        "[ADMIN FCM] STARTING ORDER LOOKUP"
      );

      console.log(
        "[ADMIN FCM] ORDER ID:",
        requestedOrderId
      );

      console.log(
        "=========================================="
      );

      const {
        data: order,
        error: orderError,
      } =
        await supabase
          .from("orders")
          .select("*")
          .eq(
            "id",
            requestedOrderId
          )
          .maybeSingle();

      console.log(
        "[ADMIN FCM] ORDER LOOKUP RESULT:",
        {
          requestedOrderId,
          found:
            Boolean(order),
          error:
            orderError?.message ||
            null,
        }
      );

      if (orderError) {
        console.error(
          "[ADMIN FCM] ORDER LOOKUP ERROR:",
          orderError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to lookup order.",
            details:
              orderError.message,
            code:
              orderError.code,
          },
          { status: 500 }
        );
      }

      if (!order) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Order not found.",
            order_id:
              requestedOrderId,
          },
          { status: 404 }
        );
      }

      /* -----------------------------------------------
         ID
      ----------------------------------------------- */

      resolvedOrderId =
        order.id;

      /* -----------------------------------------------
         ORDER NUMBER
      ----------------------------------------------- */

      order_number =
        order.order_number ||
        "";

      /* -----------------------------------------------
         CUSTOMER
      ----------------------------------------------- */

      customer_name =
        order.customer_name ||
        "";

      customer_phone =
        order.customer_phone ||
        "";

      customer_email =
        order.customer_email ||
        "";

      /* -----------------------------------------------
         TOTAL
      ----------------------------------------------- */

      order_total =
        order.total != null
          ? String(order.total)
          : "";

      /* -----------------------------------------------
         ORDER STATUS
      ----------------------------------------------- */

      order_status =
        order.status ||
        "";

      /* -----------------------------------------------
         PAYMENT
      ----------------------------------------------- */

      payment_method =
        order.payment_method ||
        "";

      payment_status =
        order.payment_status ||
        "";

      /* -----------------------------------------------
         DELIVERY
      ----------------------------------------------- */

      delivery_option =
        order.delivery_option ||
        "";

      delivery_slot =
        order.delivery_slot ||
        "";

      /* -----------------------------------------------
         ADDRESS
      ----------------------------------------------- */

      address =
        order.full_address ||
        "";

      if (!address) {
        address = [
          order.address,
          order.landmark,
          order.city,
          order.district,
          order.state,
          order.pincode,
          order.country,
        ]
          .filter(Boolean)
          .join(", ");
      }

      console.log(
        "=========================================="
      );

      console.log(
        "[ADMIN FCM] ORDER FOUND"
      );

      console.log({
        id:
          resolvedOrderId,

        order_number,

        customer_name,
        customer_phone,
        customer_email,

        subtotal:
          order.subtotal,

        delivery:
          order.delivery,

        tax:
          order.tax,

        total:
          order.total,

        payment_method,

        payment_status,

        status:
          order.status,

        delivery_option,

        delivery_slot,

        address,
      });

      console.log(
        "=========================================="
      );
    }

    /* =====================================================
       WORKER REQUEST LOOKUP
    ===================================================== */

    if (
      isAdminIncoming &&
      type === "worker_request" &&
      requestedWorkerRequestId
    ) {
      console.log(
        "=========================================="
      );

      console.log(
        "[ADMIN FCM] STARTING WORKER REQUEST LOOKUP"
      );

      console.log(
        "[ADMIN FCM] REQUEST ID:",
        requestedWorkerRequestId
      );

      console.log(
        "=========================================="
      );

      const {
        data: workerRequest,
        error:
          workerRequestError,
      } =
        await supabase
          .from(
            "worker_requests"
          )
          .select("*")
          .eq(
            "id",
            requestedWorkerRequestId
          )
          .maybeSingle();

      console.log(
        "[ADMIN FCM] WORKER REQUEST LOOKUP:",
        {
          requestedWorkerRequestId,
          found:
            Boolean(
              workerRequest
            ),
          error:
            workerRequestError?.message ||
            null,
        }
      );

      if (
        workerRequestError
      ) {
        console.error(
          "[ADMIN FCM] WORKER REQUEST LOOKUP ERROR:",
          workerRequestError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to lookup worker request.",
            details:
              workerRequestError.message,
            code:
              workerRequestError.code,
          },
          { status: 500 }
        );
      }

      if (
        !workerRequest
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Worker request not found.",
            worker_request_id:
              requestedWorkerRequestId,
          },
          { status: 404 }
        );
      }

      /* -----------------------------------------------
         ID
      ----------------------------------------------- */

      resolvedWorkerRequestId =
        workerRequest.id;

      /* -----------------------------------------------
         REQUESTER
      ----------------------------------------------- */

      customer_name =
        workerRequest.requester_name ||
        "";

      customer_phone =
        workerRequest.requester_mobile ||
        "";

      customer_email =
        workerRequest.requester_email ||
        "";

      /* -----------------------------------------------
         CATEGORY
      ----------------------------------------------- */

      category =
        workerRequest.category ||
        "";

      /* -----------------------------------------------
         PROJECT
      ----------------------------------------------- */

      project_name =
        workerRequest.project_name ||
        "";

      project_type =
        workerRequest.project_type ||
        "";

      /* -----------------------------------------------
         REQUIREMENT
      ----------------------------------------------- */

      requirement =
        workerRequest.requirement ||
        "";

      description =
        workerRequest.requirement ||
        "";

      /* -----------------------------------------------
         WORKERS
      ----------------------------------------------- */

      workers_required =
        workerRequest.workers_required !=
        null
          ? String(
              workerRequest.workers_required
            )
          : "";

      /* -----------------------------------------------
         DATE
      ----------------------------------------------- */

      booking_date =
        workerRequest.work_date
          ? String(
              workerRequest.work_date
            )
          : "";

      /* -----------------------------------------------
         TIME
      ----------------------------------------------- */

      booking_time =
        workerRequest.start_time
          ? String(
              workerRequest.start_time
            )
          : "";

      /* -----------------------------------------------
         DURATION
      ----------------------------------------------- */

      duration =
        workerRequest.duration ||
        "";

      /* -----------------------------------------------
         BUDGET
      ----------------------------------------------- */

      budget =
        workerRequest.budget !=
        null
          ? String(
              workerRequest.budget
            )
          : "";

      order_total =
        budget;

      /* -----------------------------------------------
         STATUS
      ----------------------------------------------- */

      booking_status =
        workerRequest.status ||
        "";

      /* -----------------------------------------------
         SOURCE
      ----------------------------------------------- */

      source =
        workerRequest.source ||
        "";

      /* -----------------------------------------------
         REQUESTER TYPE
      ----------------------------------------------- */

      requester_type =
        workerRequest.requester_type ||
        "";

      /* -----------------------------------------------
         COMPANY
      ----------------------------------------------- */

      company_name =
        workerRequest.company_name ||
        "";

      /* -----------------------------------------------
         ADDRESS
      ----------------------------------------------- */

      address =
        workerRequest.full_address ||
        "";

      if (!address) {
        address = [
          workerRequest.location,
          workerRequest.locality,
          workerRequest.district,
          workerRequest.state,
          workerRequest.pincode,
        ]
          .filter(Boolean)
          .join(", ");
      }

      /* -----------------------------------------------
         SERVICE
      ----------------------------------------------- */

      service_name =
        workerRequest.category ||
        "";

      console.log(
        "=========================================="
      );

      console.log(
        "[ADMIN FCM] WORKER REQUEST FOUND"
      );

      console.log({
        id:
          resolvedWorkerRequestId,

        requester_name:
          customer_name,

        requester_mobile:
          customer_phone,

        requester_email:
          customer_email,

        category,

        project_name,
        project_type,

        workers_required,

        work_date:
          booking_date,

        start_time:
          booking_time,

        duration,

        budget,

        status:
          booking_status,

        address,
      });

      console.log(
        "=========================================="
      );
    }

    /* =====================================================
       CUSTOMER EMAIL RESOLUTION
    ===================================================== */

    let resolvedCustomerEmail =
      customer_email;

    if (
      requestedUserId &&
      !isAdminIncoming
    ) {
      const {
        data: authUser,
        error:
          authUserError,
      } =
        await supabase.auth.admin.getUserById(
          requestedUserId
        );

      if (
        authUserError ||
        !authUser?.user
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Selected user could not be found.",
            details:
              authUserError?.message,
          },
          { status: 400 }
        );
      }

      resolvedCustomerEmail =
        authUser.user.email ||
        null;
    }

    /* =====================================================
       FINAL IDS
    ===================================================== */

    const finalBookingId =
      resolvedBookingId;

    const finalWorkerRequestId =
      resolvedWorkerRequestId;

    const finalOrderId =
      resolvedOrderId;

    /* =====================================================
       DATABASE NOTIFICATION
    ===================================================== */

    const notification = {
      title,

      message,

      type,

      image_url,

      icon,

      action_url,

      booking_id:
        finalBookingId,

      worker_request_id:
        finalWorkerRequestId,

      order_id:
        finalOrderId,

      user_id:
        isAdminIncoming
          ? null
          : requestedIsGlobal
            ? null
            : requestedUserId,

      customer_email:
        isAdminIncoming
          ? null
          : requestedIsGlobal
            ? null
            : resolvedCustomerEmail,

      is_global:
        isAdminIncoming
          ? false
          : requestedIsGlobal,

      is_read:
        false,
    };

    console.log(
      "=========================================="
    );

    console.log(
      "[Notifications POST] FINAL DATA:"
    );

    console.log({
      title,
      message,
      type,

      finalBookingId,
      finalWorkerRequestId,
      finalOrderId,

      customer_name,
      customer_phone,
      customer_email,

      worker_name,
      worker_phone,

      service_name,
      category,
      subcategory,

      order_number,
      order_total,

      order_status,
      booking_status,

      booking_date,
      booking_time,

      payment_method,
      payment_status,

      workers_required,
      duration,
      budget,

      project_name,
      project_type,

      address,

      isAdminIncoming,
    });

    console.log(
      "=========================================="
    );

    /* =====================================================
       INSERT NOTIFICATION
    ===================================================== */

    const {
      data,
      error,
    } =
      await supabase
        .from("notifications")
        .insert(
          notification
        )
        .select("*")
        .single();

    if (error) {
      console.error(
        "[Notifications POST] INSERT ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error.message ||
            "Unable to create notification.",

          details:
            error.details,

          hint:
            error.hint,

          code:
            error.code,
        },
        { status: 500 }
      );
    }

    console.log(
      "[Notifications POST] INSERTED:",
      data
    );

    /* =====================================================
       PUSH COUNTERS
    ===================================================== */

    let pushSent = 0;

    let pushFailed = 0;

    let pushTargetCount = 0;

    /* =====================================================
       ADMIN PUSH
    ===================================================== */

    if (
      isAdminIncoming
    ) {
      try {
        const {
          data:
            adminRows,
          error:
            adminTokenError,
        } =
          await supabase
            .from(
              "admin_push_tokens"
            )
            .select(
              "token,platform,app_id,is_active"
            )
            .eq(
              "platform",
              "android"
            )
            .eq(
              "app_id",
              ADMIN_ANDROID_APP_ID
            )
            .eq(
              "is_active",
              true
            );

        if (
          adminTokenError
        ) {
          console.error(
            "[ADMIN FCM] TOKEN LOOKUP ERROR:",
            adminTokenError
          );
        } else {
          const adminTokens =
            Array.from(
              new Set(
                (
                  adminRows ||
                  []
                )
                  .map(
                    (
                      row
                    ) =>
                      row.token
                  )
                  .filter(
                    (
                      token
                    ): token is string =>
                      typeof token ===
                        "string" &&
                      token.trim()
                        .length > 0
                  )
              )
            );

          pushTargetCount =
            adminTokens.length;

          console.log(
            `[ADMIN FCM] ${adminTokens.length} active admin device(s)`
          );

          if (
            adminTokens.length >
            0
          ) {
            const messaging =
              getFirebaseMessaging();

            /* =========================================
               SOUND
            ========================================= */

            let sound =
              "notification";

            if (
              type ===
              "booking"
            ) {
              sound =
                "booking";
            } else if (
              type === "order"
            ) {
              sound =
                "order";
            } else if (
              type ===
              "worker_request"
            ) {
              sound =
                "worker_request";
            }

            /* =========================================
               ACTION
            ========================================= */

            const hasAction =
              Boolean(
                finalBookingId ||
                finalWorkerRequestId ||
                finalOrderId
              );

            /* =========================================
               AMOUNT
            ========================================= */

            const normalizedAmount =
              order_total ||
              budget ||
              "";

            /* =========================================
               LOCATION
            ========================================= */

            const normalizedLocation =
              address || "";

            /* =========================================
               ACTION URL
            ========================================= */

            const finalActionUrl =
              action_url ||
              (
                finalBookingId
                  ? `/admin/bookings?booking=${finalBookingId}`
                  : finalWorkerRequestId
                    ? `/admin/worker-requests?request=${finalWorkerRequestId}`
                    : finalOrderId
                      ? `/admin/orders?order=${finalOrderId}`
                      : ""
              );

            /* =========================================
               FCM DATA PAYLOAD
            ========================================= */

            const dataPayload: Record<
              string,
              string
            > = {
              /* -----------------------------------------
                 BASIC
              ----------------------------------------- */

              title,

              body:
                message,

              type:
                String(type),

              icon,

              sound,

              notification_id:
                String(
                  data?.id || ""
                ),

              show_actions:
                hasAction
                  ? "true"
                  : "false",

              /* -----------------------------------------
                 IDS
              ----------------------------------------- */

              booking_id:
                finalBookingId ||
                "",

              worker_request_id:
                finalWorkerRequestId ||
                "",

              order_id:
                finalOrderId ||
                "",

              /* -----------------------------------------
                 CUSTOMER
              ----------------------------------------- */

              customer_name:
                customer_name ||
                "",

              customer_phone:
                customer_phone ||
                "",

              customer_email:
                customer_email ||
                "",

              /* -----------------------------------------
                 WORKER
              ----------------------------------------- */

              worker_name:
                worker_name ||
                "",

              worker_phone:
                worker_phone ||
                "",

              /* -----------------------------------------
                 SERVICE
              ----------------------------------------- */

              service_name:
                service_name ||
                "",

              service:
                service_name ||
                "",

              category:
                category ||
                "",

              subcategory:
                subcategory ||
                "",

              description:
                description ||
                "",

              /* -----------------------------------------
                 ORDER
              ----------------------------------------- */

              order_number:
                order_number ||
                "",

              order_id_display:
                order_number ||
                "",

              /* -----------------------------------------
                 AMOUNT
              ----------------------------------------- */

              order_total:
                normalizedAmount,

              grand_total:
                normalizedAmount,

              amount:
                normalizedAmount,

              total:
                normalizedAmount,

              booking_amount:
                normalizedAmount,

              payable_amount:
                normalizedAmount,

              budget:
                budget ||
                "",

              /* -----------------------------------------
                 ORDER STATUS
              ----------------------------------------- */

              order_status:
                order_status ||
                "",

              payment_status:
                payment_status ||
                "",

              payment_method:
                payment_method ||
                "",

              delivery_option:
                delivery_option ||
                "",

              delivery_slot:
                delivery_slot ||
                "",

              /* -----------------------------------------
                 BOOKING STATUS
              ----------------------------------------- */

              booking_status:
                booking_status ||
                "",

              status:
                booking_status ||
                order_status ||
                "",

              /* -----------------------------------------
                 DATE / TIME
              ----------------------------------------- */

              booking_date:
                booking_date ||
                "",

              booking_time:
                booking_time ||
                "",

              work_date:
                booking_date ||
                "",

              start_time:
                booking_time ||
                "",

              /* -----------------------------------------
                 WORKER REQUEST
              ----------------------------------------- */

              requester_type:
                requester_type ||
                "",

              company_name:
                company_name ||
                "",

              project_name:
                project_name ||
                "",

              project_type:
                project_type ||
                "",

              workers_required:
                workers_required ||
                "",

              total_workers:
                workers_required ||
                "",

              duration:
                duration ||
                "",

              requirement:
                requirement ||
                "",

              source:
                source ||
                "",

              /* -----------------------------------------
                 LOCATION
              ----------------------------------------- */

              address:
                normalizedLocation,

              location:
                normalizedLocation,

              booking_address:
                normalizedLocation,

              full_address:
                normalizedLocation,

              customer_address:
                normalizedLocation,

              /* -----------------------------------------
                 ACTION URL
              ----------------------------------------- */

              action_url:
                finalActionUrl,

              deep_link:
                finalActionUrl,

              /* -----------------------------------------
                 ACTIONS
              ----------------------------------------- */

              accept_action:
                hasAction
                  ? "accept"
                  : "",

              reject_action:
                hasAction
                  ? "reject"
                  : "",
            };

            /* =========================================
               IMAGE
            ========================================= */

            if (
              image_url
            ) {
              dataPayload.image_url =
                image_url;
            }

            /* =========================================
               DEBUG
            ========================================= */

            console.log(
              "=========================================="
            );

            console.log(
              "[ADMIN FCM] FULL DATA PAYLOAD:"
            );

            console.log(
              dataPayload
            );

            console.log(
              "=========================================="
            );

            /* =========================================
               SEND MAX 500
            ========================================= */

            for (
              let i = 0;
              i <
              adminTokens.length;
              i += 500
            ) {
              const batch =
                adminTokens.slice(
                  i,
                  i + 500
                );

              const response =
                await messaging.sendEachForMulticast(
                  {
                    tokens:
                      batch,

                    /*
                     * DATA ONLY
                     *
                     * Android WorkkerzFirebaseMessagingService
                     * receives everything from getData().
                     */

                    data:
                      dataPayload,

                    android: {
                      priority:
                        "high",
                    },
                  }
                );

              pushSent +=
                response.successCount;

              pushFailed +=
                response.failureCount;

              console.log(
                "[ADMIN FCM] RESULT:",
                {
                  type,

                  success:
                    response.successCount,

                  failed:
                    response.failureCount,
                }
              );

              /* =======================================
                 INVALID TOKEN CLEANUP
              ======================================= */

              for (
                let index = 0;
                index <
                response.responses
                  .length;
                index++
              ) {
                const result =
                  response
                    .responses[
                    index
                  ];

                if (
                  result.success
                ) {
                  continue;
                }

                const failedToken =
                  batch[index];

                const errorCode =
                  result.error?.code;

                const errorMessage =
                  result.error
                    ?.message ||
                  "";

                console.error(
                  "[ADMIN FCM] FAILED:",
                  {
                    code:
                      errorCode,

                    error:
                      errorMessage,
                  }
                );

                const invalidToken =
                  errorCode ===
                    "messaging/registration-token-not-registered" ||
                  errorMessage.includes(
                    "Requested entity was not found"
                  ) ||
                  errorMessage.includes(
                    "registration token is not a valid FCM registration token"
                  ) ||
                  errorMessage.includes(
                    "NotRegistered"
                  );

                if (
                  invalidToken
                ) {
                  await supabase
                    .from(
                      "admin_push_tokens"
                    )
                    .update({
                      is_active:
                        false,

                      updated_at:
                        new Date().toISOString(),
                    })
                    .eq(
                      "token",
                      failedToken
                    );
                }
              }
            }
          }
        }
      } catch (
        pushError
      ) {
        console.error(
          "[ADMIN FCM] PUSH ERROR:",
          pushError
        );
      }
    }

    /* =====================================================
       CUSTOMER PUSH
    ===================================================== */

    else {
      try {
        let tokenQuery =
          supabase
            .from(
              "device_tokens"
            )
            .select(
              "fcm_token,user_id,email,platform"
            )
            .not(
              "fcm_token",
              "is",
              null
            );

        if (
          requestedIsGlobal
        ) {
          tokenQuery =
            tokenQuery.eq(
              "platform",
              "android"
            );
        } else {
          tokenQuery =
            tokenQuery
              .eq(
                "user_id",
                requestedUserId
              )
              .eq(
                "platform",
                "android"
              );
        }

        const {
          data:
            deviceRows,
          error:
            deviceTokenError,
        } =
          await tokenQuery;

        if (
          deviceTokenError
        ) {
          console.error(
            "[FCM] TOKEN LOOKUP ERROR:",
            deviceTokenError
          );
        } else {
          const tokens =
            Array.from(
              new Set(
                (
                  deviceRows ||
                  []
                )
                  .map(
                    (
                      row
                    ) =>
                      row.fcm_token
                  )
                  .filter(
                    (
                      token
                    ): token is string =>
                      typeof token ===
                        "string" &&
                      token.trim()
                        .length > 0
                  )
              )
            );

          pushTargetCount =
            tokens.length;

          if (
            tokens.length >
            0
          ) {
            const messaging =
              getFirebaseMessaging();

            const normalizedAmount =
              order_total ||
              budget ||
              "";

            const normalizedLocation =
              address ||
              "";

            const finalActionUrl =
              action_url ||
              (
                finalBookingId
                  ? `/book/${finalBookingId}`
                  : finalOrderId
                    ? `/orders/${finalOrderId}`
                    : finalWorkerRequestId
                      ? `/worker-requests/${finalWorkerRequestId}`
                      : ""
              );

            const dataPayload: Record<
              string,
              string
            > = {
              title,

              body:
                message,

              type:
                String(type),

              icon,

              notification_id:
                String(
                  data?.id || ""
                ),

              /* IDS */

              booking_id:
                finalBookingId ||
                "",

              worker_request_id:
                finalWorkerRequestId ||
                "",

              order_id:
                finalOrderId ||
                "",

              /* CUSTOMER */

              customer_name:
                customer_name ||
                "",

              customer_phone:
                customer_phone ||
                "",

              customer_email:
                resolvedCustomerEmail ||
                "",

              /* WORKER */

              worker_name:
                worker_name ||
                "",

              worker_phone:
                worker_phone ||
                "",

              /* SERVICE */

              service_name:
                service_name ||
                "",

              service:
                service_name ||
                "",

              category:
                category ||
                "",

              subcategory:
                subcategory ||
                "",

              description:
                description ||
                "",

              /* ORDER */

              order_number:
                order_number ||
                "",

              order_id_display:
                order_number ||
                "",

              /* AMOUNT */

              order_total:
                normalizedAmount,

              grand_total:
                normalizedAmount,

              amount:
                normalizedAmount,

              total:
                normalizedAmount,

              booking_amount:
                normalizedAmount,

              payable_amount:
                normalizedAmount,

              budget:
                budget ||
                "",

              /* STATUS */

              order_status:
                order_status ||
                "",

              payment_status:
                payment_status ||
                "",

              payment_method:
                payment_method ||
                "",

              booking_status:
                booking_status ||
                "",

              status:
                booking_status ||
                order_status ||
                "",

              /* DATE */

              booking_date:
                booking_date ||
                "",

              booking_time:
                booking_time ||
                "",

              work_date:
                booking_date ||
                "",

              start_time:
                booking_time ||
                "",

              /* WORKER REQUEST */

              requester_type:
                requester_type ||
                "",

              company_name:
                company_name ||
                "",

              project_name:
                project_name ||
                "",

              project_type:
                project_type ||
                "",

              workers_required:
                workers_required ||
                "",

              total_workers:
                workers_required ||
                "",

              duration:
                duration ||
                "",

              requirement:
                requirement ||
                "",

              source:
                source ||
                "",

              /* LOCATION */

              address:
                normalizedLocation,

              location:
                normalizedLocation,

              booking_address:
                normalizedLocation,

              full_address:
                normalizedLocation,

              customer_address:
                normalizedLocation,

              /* ACTION */

              action_url:
                finalActionUrl,

              deep_link:
                finalActionUrl,
            };

            if (
              image_url
            ) {
              dataPayload.image_url =
                image_url;
            }

            /* =========================================
               CUSTOMER FCM
            ========================================= */

            for (
              let i = 0;
              i <
              tokens.length;
              i += 500
            ) {
              const batch =
                tokens.slice(
                  i,
                  i + 500
                );

              const response =
                await messaging.sendEachForMulticast(
                  {
                    tokens:
                      batch,

                    notification: {
                      title,

                      body:
                        message,
                    },

                    data:
                      dataPayload,

                    android: {
                      priority:
                        "high",
                    },
                  }
                );

              pushSent +=
                response.successCount;

              pushFailed +=
                response.failureCount;

              console.log(
                "[FCM] CUSTOMER RESULT:",
                {
                  type,

                  success:
                    response.successCount,

                  failed:
                    response.failureCount,
                }
              );

              /* =======================================
                 INVALID CUSTOMER TOKEN CLEANUP
              ======================================= */

              for (
                let index = 0;
                index <
                response.responses
                  .length;
                index++
              ) {
                const result =
                  response
                    .responses[
                    index
                  ];

                if (
                  result.success
                ) {
                  continue;
                }

                const failedToken =
                  batch[index];

                const errorCode =
                  result.error?.code;

                const errorMessage =
                  result.error
                    ?.message ||
                  "";

                const invalidToken =
                  errorCode ===
                    "messaging/registration-token-not-registered" ||
                  errorMessage.includes(
                    "Requested entity was not found"
                  ) ||
                  errorMessage.includes(
                    "registration token is not a valid FCM registration token"
                  ) ||
                  errorMessage.includes(
                    "NotRegistered"
                  );

                if (
                  invalidToken
                ) {
                  await supabase
                    .from(
                      "device_tokens"
                    )
                    .delete()
                    .eq(
                      "fcm_token",
                      failedToken
                    );
                }
              }
            }
          }
        }
      } catch (
        pushError
      ) {
        console.error(
          "[FCM] CUSTOMER PUSH ERROR:",
          pushError
        );
      }
    }

    /* =====================================================
       FINAL RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Notification created and push processed.",

        notification:
          data,

        type,

        ids: {
          booking_id:
            finalBookingId,

          worker_request_id:
            finalWorkerRequestId,

          order_id:
            finalOrderId,
        },

        booking: {
          uuid:
            finalBookingId,

          booking_number:
            type === "booking"
              ? order_number
              : null,

          customer_name,
          customer_phone,

          worker_name,
          worker_phone,

          service_name,
          category,
          subcategory,

          description,

          booking_status,

          booking_date,
          booking_time,

          total:
            order_total,

          amount:
            order_total,

          location:
            address,

          address,
        },

        order: {
          id:
            finalOrderId,

          order_number:
            type === "order"
              ? order_number
              : null,

          customer_name,

          customer_phone,

          customer_email,

          total:
            type === "order"
              ? order_total
              : null,

          status:
            type === "order"
              ? order_status
              : null,

          payment_method:
            type === "order"
              ? payment_method
              : null,

          payment_status:
            type === "order"
              ? payment_status
              : null,

          delivery_option:
            type === "order"
              ? delivery_option
              : null,

          delivery_slot:
            type === "order"
              ? delivery_slot
              : null,

          address:
            type === "order"
              ? address
              : null,
        },

        worker_request: {
          id:
            finalWorkerRequestId,

          requester_name:
            type ===
            "worker_request"
              ? customer_name
              : null,

          requester_mobile:
            type ===
            "worker_request"
              ? customer_phone
              : null,

          requester_email:
            type ===
            "worker_request"
              ? customer_email
              : null,

          category:
            type ===
            "worker_request"
              ? category
              : null,

          project_name:
            type ===
            "worker_request"
              ? project_name
              : null,

          project_type:
            type ===
            "worker_request"
              ? project_type
              : null,

          workers_required:
            type ===
            "worker_request"
              ? workers_required
              : null,

          work_date:
            type ===
            "worker_request"
              ? booking_date
              : null,

          start_time:
            type ===
            "worker_request"
              ? booking_time
              : null,

          duration:
            type ===
            "worker_request"
              ? duration
              : null,

          budget:
            type ===
            "worker_request"
              ? budget
              : null,

          status:
            type ===
            "worker_request"
              ? booking_status
              : null,

          address:
            type ===
            "worker_request"
              ? address
              : null,
        },

        push: {
          targetCount:
            pushTargetCount,

          sent:
            pushSent,

          failed:
            pushFailed,

          channelId:
            isAdminIncoming
              ? ADMIN_NOTIFICATION_CHANNEL_ID
              : null,

          target:
            isAdminIncoming
              ? "admin"
              : requestedIsGlobal
                ? "customers_global"
                : "customer",

          mode:
            isAdminIncoming
              ? "DATA_ONLY"
              : "NORMAL",
        },
      },
      {
        status: 201,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "[Notifications POST] EXCEPTION:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to send notification.",
      },
      {
        status: 500,
      }
    );
  }
}