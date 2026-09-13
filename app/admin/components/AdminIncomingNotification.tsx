"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  X,
  Check,
  Phone,
  MapPin,
  CalendarDays,
  Clock3,
  IndianRupee,
  UserRound,
  Zap,
  ShoppingBag,
  Users,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

type NotificationData = {
  type?: string;
  booking_id?: string;
  order_id?: string;
  worker_request_id?: string;
  title?: string;
  body?: string;
};

type Booking = {
  id: string;
  booking_id: string;
  booking_status: string | null;
  worker_name: string | null;
  worker_photo: string | null;
  worker_specialty: string | null;
  service_type: string | null;
  description: string | null;
  booking_date: string | null;
  booking_time: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  grand_total: number | null;
  house_no: string | null;
  address: string | null;
  landmark: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
};

type Order = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  delivery_option: string | null;
  delivery_slot: string | null;
  subtotal: number | null;
  delivery: number | null;
  tax: number | null;
  total: number | null;
  payment_method: string | null;
  payment_status: string | null;
  status: string | null;
  created_at: string | null;
  landmark: string | null;
  full_address: string | null;
};

type WorkerRequest = {
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
  source: string | null;
  created_at: string;
  full_address: string | null;
  locality: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  requester_name: string | null;
  requester_mobile: string | null;
  requester_email: string | null;
  company_name: string | null;
  project_name: string | null;
  project_type: string | null;
};

type IncomingType =
  | "booking"
  | "order"
  | "worker_request";

export default function AdminIncomingNotification() {
  const [type, setType] = useState<IncomingType | null>(null);
  const [booking, setBooking] =
    useState<Booking | null>(null);
  const [order, setOrder] =
    useState<Order | null>(null);
  const [workerRequest, setWorkerRequest] =
    useState<WorkerRequest | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [rejectOpen, setRejectOpen] =
    useState(false);

  const clearNotification = () => {
    setType(null);
    setBooking(null);
    setOrder(null);
    setWorkerRequest(null);
    setDetailsOpen(false);
    setRejectOpen(false);
  };

  useEffect(() => {
    const handleIncoming = async (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<NotificationData>;

      const data = customEvent.detail;

      if (!data?.type) return;

      if (
        data.type !== "booking" &&
        data.type !== "order" &&
        data.type !== "worker_request"
      ) {
        return;
      }

      setType(
        data.type as IncomingType
      );

      setBooking(null);
      setOrder(null);
      setWorkerRequest(null);
      setDetailsOpen(false);
      setRejectOpen(false);

      if (
        data.type === "booking" &&
        data.booking_id
      ) {
        const { data: row, error } =
          await supabase
            .from("bookings")
            .select("*")
            .eq(
              "booking_id",
              data.booking_id
            )
            .single();

        if (error) {
          console.error(
            "BOOKING BUMP FETCH ERROR:",
            error
          );
          clearNotification();
          return;
        }

        if (
          row?.booking_status !==
          "pending"
        ) {
          clearNotification();
          return;
        }

        setBooking(row);
      }

      if (
        data.type === "order" &&
        data.order_id
      ) {
        const { data: row, error } =
          await supabase
            .from("orders")
            .select("*")
            .eq(
              "id",
              data.order_id
            )
            .single();

        if (error) {
          console.error(
            "ORDER BUMP FETCH ERROR:",
            error
          );
          clearNotification();
          return;
        }

        setOrder(row);
      }

      if (
        data.type === "worker_request" &&
        data.worker_request_id
      ) {
        const { data: row, error } =
          await supabase
            .from("worker_requests")
            .select("*")
            .eq(
              "id",
              data.worker_request_id
            )
            .single();

        if (error) {
          console.error(
            "WORKER REQUEST BUMP FETCH ERROR:",
            error
          );
          clearNotification();
          return;
        }

        setWorkerRequest(row);
      }
    };

    window.addEventListener(
      "workkerz:incoming-notification",
      handleIncoming
    );

    return () => {
      window.removeEventListener(
        "workkerz:incoming-notification",
        handleIncoming
      );
    };
  }, []);

  const updateBooking = async (
    status: "confirmed" | "rejected"
  ) => {
    if (!booking || loading) return;

    setLoading(true);

    const { error } =
      await supabase
        .from("bookings")
        .update({
          booking_status: status,
        })
        .eq("id", booking.id);

    if (error) {
      console.error(
        "BOOKING STATUS UPDATE ERROR:",
        error
      );
      setLoading(false);
      return;
    }

    setBooking({
      ...booking,
      booking_status: status,
    });

    setLoading(false);

    if (status === "confirmed") {
      setTimeout(
        clearNotification,
        1200
      );
    } else {
      clearNotification();
    }
  };

  const updateOrder = async (
    status: string
  ) => {
    if (!order || loading) return;

    setLoading(true);

    const { error } =
      await supabase
        .from("orders")
        .update({
          status,
        })
        .eq("id", order.id);

    if (error) {
      console.error(
        "ORDER STATUS UPDATE ERROR:",
        error
      );
      setLoading(false);
      return;
    }

    setOrder({
      ...order,
      status,
    });

    setLoading(false);

    if (
      status.toLowerCase() ===
      "rejected"
    ) {
      clearNotification();
    } else {
      setTimeout(
        clearNotification,
        1200
      );
    }
  };

  const updateWorkerRequest = async (
    status: string
  ) => {
    if (!workerRequest || loading)
      return;

    setLoading(true);

    const { error } =
      await supabase
        .from("worker_requests")
        .update({
          status,
        })
        .eq(
          "id",
          workerRequest.id
        );

    if (error) {
      console.error(
        "WORKER REQUEST STATUS UPDATE ERROR:",
        error
      );
      setLoading(false);
      return;
    }

    setWorkerRequest({
      ...workerRequest,
      status,
    });

    setLoading(false);

    if (
      status.toLowerCase() ===
      "rejected"
    ) {
      clearNotification();
    } else {
      setTimeout(
        clearNotification,
        1200
      );
    }
  };

  const handleReject = async () => {
    setRejectOpen(false);

    if (type === "booking") {
      await updateBooking(
        "rejected"
      );
      return;
    }

    if (type === "order") {
      await updateOrder(
        "Rejected"
      );
      return;
    }

    if (
      type === "worker_request"
    ) {
      await updateWorkerRequest(
        "rejected"
      );
    }
  };

  const handleAccept = async () => {
    if (type === "booking") {
      await updateBooking(
        "confirmed"
      );
      return;
    }

    if (type === "order") {
      await updateOrder(
        "Accepted"
      );
      return;
    }

    if (
      type === "worker_request"
    ) {
      await updateWorkerRequest(
        "accepted"
      );
    }
  };

  if (
    !type ||
    (!booking &&
      !order &&
      !workerRequest)
  ) {
    return null;
  }

  const isBooking =
    type === "booking";

  const isOrder =
    type === "order";

  const isWorkerRequest =
    type === "worker_request";

  const title = isBooking
    ? "NEW WORK REQUEST"
    : isOrder
      ? "NEW E-AURIX ORDER"
      : "NEW WORKER REQUEST";

  const icon = isBooking
    ? <Zap className="h-6 w-6" />
    : isOrder
      ? <ShoppingBag className="h-6 w-6" />
      : <Users className="h-6 w-6" />;

  const accent = isBooking
    ? "from-orange-500 via-red-500 to-pink-500"
    : isOrder
      ? "from-blue-600 via-indigo-600 to-purple-600"
      : "from-emerald-500 via-teal-500 to-cyan-500";

  const customerName =
    booking?.customer_name ||
    order?.customer_name ||
    workerRequest?.requester_name ||
    "Customer";

  const phone =
    booking?.customer_phone ||
    order?.customer_phone ||
    workerRequest?.requester_mobile;

  const location =
    booking
      ? [
          booking.house_no,
          booking.address,
          booking.landmark,
          booking.city,
          booking.district,
          booking.state,
          booking.pincode,
        ]
          .filter(Boolean)
          .join(", ")
      : order
        ? [
            order.full_address ||
              order.address,
            order.landmark,
            order.city,
            order.pincode,
          ]
            .filter(Boolean)
            .join(", ")
        : [
            workerRequest?.full_address,
            workerRequest?.locality,
            workerRequest?.district,
            workerRequest?.state,
            workerRequest?.pincode,
          ]
            .filter(Boolean)
            .join(", ");

  const amount =
    booking?.grand_total ??
    order?.total ??
    workerRequest?.budget ??
    0;

  const currentStatus =
    booking?.booking_status ||
    order?.status ||
    workerRequest?.status ||
    "pending";

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/25 backdrop-blur-[2px]" />

      <div className="fixed left-1/2 top-4 z-[9999] w-[calc(100%-20px)] max-w-md -translate-x-1/2 animate-in slide-in-from-top-10 duration-500">

        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl">

          <div
            className={`bg-gradient-to-r ${accent} px-5 py-4 text-white`}
          >
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                  {icon}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                    Workkerz Admin
                  </p>

                  <h2 className="text-lg font-extrabold">
                    {title}
                  </h2>
                </div>

              </div>

              <button
                onClick={clearNotification}
                className="rounded-full bg-white/15 p-2 transition active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>

            </div>
          </div>

          <div className="max-h-[62vh] overflow-y-auto p-4">

            {isBooking && booking && (
              <>
                <div className="rounded-2xl bg-slate-50 p-4">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                    {booking.service_type ||
                      booking.worker_specialty ||
                      "Service"}
                  </p>

                  <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                    {booking.description ||
                      "New service booking"}
                  </h3>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                      <UserRound className="h-5 w-5 text-slate-500" />
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500">
                        Customer
                      </p>

                      <p className="text-sm font-bold text-slate-900">
                        {customerName}
                      </p>
                    </div>
                  </div>

                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">

                  <InfoBox
                    icon={
                      <CalendarDays className="h-4 w-4" />
                    }
                    label="Date"
                    value={
                      booking.booking_date ||
                      "Not specified"
                    }
                  />

                  <InfoBox
                    icon={
                      <Clock3 className="h-4 w-4" />
                    }
                    label="Time"
                    value={
                      booking.booking_time ||
                      "Not specified"
                    }
                  />

                </div>
              </>
            )}

            {isOrder && order && (
              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                  E-Aurix Order
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                  #{order.order_number ||
                    order.id.slice(0, 8)}
                </h3>

                <div className="mt-4 space-y-3">

                  <DetailRow
                    icon={
                      <UserRound className="h-4 w-4" />
                    }
                    label="Customer"
                    value={
                      customerName
                    }
                  />

                  <DetailRow
                    icon={
                      <MapPin className="h-4 w-4" />
                    }
                    label="Delivery"
                    value={
                      location ||
                      "Address unavailable"
                    }
                  />

                  <DetailRow
                    icon={
                      <ShoppingBag className="h-4 w-4" />
                    }
                    label="Payment"
                    value={
                      order.payment_method ||
                      "Pending"
                    }
                  />

                </div>

              </div>
            )}

            {isWorkerRequest &&
              workerRequest && (
                <div className="rounded-2xl bg-slate-50 p-4">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    Worker Requirement
                  </p>

                  <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                    {workerRequest.category}
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <InfoBox
                      icon={
                        <Users className="h-4 w-4" />
                      }
                      label="Workers"
                      value={String(
                        workerRequest.workers_required
                      )}
                    />

                    <InfoBox
                      icon={
                        <CalendarDays className="h-4 w-4" />
                      }
                      label="Date"
                      value={
                        workerRequest.work_date
                      }
                    />

                  </div>

                  {workerRequest.requirement && (
                    <p className="mt-4 text-sm leading-5 text-slate-700">
                      {workerRequest.requirement}
                    </p>
                  )}

                </div>
              )}

            <div className="mt-3 rounded-2xl border border-slate-100 p-4">

              <div className="flex items-start gap-3">

                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">
                    {location ||
                      "Location unavailable"}
                  </p>
                </div>

              </div>

            </div>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4"
              >
                <Phone className="h-5 w-5 text-emerald-600" />

                <div>
                  <p className="text-[11px] text-emerald-700">
                    Contact
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    {phone}
                  </p>
                </div>
              </a>
            )}

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-4 text-white">

              <div>
                <p className="text-[11px] text-slate-400">
                  {isWorkerRequest
                    ? "Budget"
                    : "Total"}
                </p>

                <p className="mt-1 text-2xl font-extrabold">
                  ₹
                  {Number(
                    amount
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <IndianRupee className="h-7 w-7 text-emerald-400" />

            </div>

            <button
              onClick={() =>
                setDetailsOpen(
                  true
                )
              }
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 transition active:scale-[0.98]"
            >
              View Full Details
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

          <div className="border-t border-slate-100 bg-white p-4">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-xs font-semibold text-slate-500">
                Status
              </span>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold capitalize text-amber-700">
                {currentStatus}
              </span>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() =>
                  setRejectOpen(true)
                }
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-sm font-extrabold text-red-600 transition active:scale-[0.98] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
                Reject
              </button>

              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 transition active:scale-[0.98] disabled:opacity-50"
              >
                <Check className="h-5 w-5" />
                {loading
                  ? "Processing..."
                  : isWorkerRequest
                    ? "Accept Request"
                    : isOrder
                      ? "Accept Order"
                      : "Accept Booking"}
              </button>

            </div>

          </div>

        </div>
      </div>

      {detailsOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 p-3 sm:items-center">

          <div className="max-h-[88vh] w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <h3 className="text-lg font-extrabold text-slate-900">
                Full Details
              </h3>

              <button
                onClick={() =>
                  setDetailsOpen(
                    false
                  )
                }
                className="rounded-full bg-slate-100 p-2"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="max-h-[72vh] overflow-y-auto p-5">

              {isBooking &&
                booking && (
                  <div className="space-y-3">

                    <DetailRow
                      label="Booking ID"
                      value={
                        booking.booking_id
                      }
                    />

                    <DetailRow
                      label="Service"
                      value={
                        booking.service_type ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Description"
                      value={
                        booking.description ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Customer"
                      value={
                        booking.customer_name ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Phone"
                      value={
                        booking.customer_phone ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Email"
                      value={
                        booking.customer_email ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Date"
                      value={
                        booking.booking_date ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Time"
                      value={
                        booking.booking_time ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Address"
                      value={
                        location ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Notes"
                      value={
                        booking.notes ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Grand Total"
                      value={`₹${Number(
                        booking.grand_total ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}`}
                    />

                  </div>
                )}

              {isOrder &&
                order && (
                  <div className="space-y-3">

                    <DetailRow
                      label="Order Number"
                      value={
                        order.order_number ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Customer"
                      value={
                        order.customer_name ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Phone"
                      value={
                        order.customer_phone ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Address"
                      value={
                        location ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Delivery"
                      value={
                        order.delivery_option ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Delivery Slot"
                      value={
                        order.delivery_slot ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Subtotal"
                      value={`₹${Number(
                        order.subtotal ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}`}
                    />

                    <DetailRow
                      label="Delivery Charge"
                      value={`₹${Number(
                        order.delivery ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}`}
                    />

                    <DetailRow
                      label="Payment"
                      value={
                        order.payment_method ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Payment Status"
                      value={
                        order.payment_status ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Total"
                      value={`₹${Number(
                        order.total ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}`}
                    />

                  </div>
                )}

              {isWorkerRequest &&
                workerRequest && (
                  <div className="space-y-3">

                    <DetailRow
                      label="Category"
                      value={
                        workerRequest.category
                      }
                    />

                    <DetailRow
                      label="Workers Required"
                      value={String(
                        workerRequest.workers_required
                      )}
                    />

                    <DetailRow
                      label="Location"
                      value={
                        workerRequest.location ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Work Date"
                      value={
                        workerRequest.work_date
                      }
                    />

                    <DetailRow
                      label="Start Time"
                      value={
                        workerRequest.start_time ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Duration"
                      value={
                        workerRequest.duration ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Budget"
                      value={`₹${Number(
                        workerRequest.budget ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}`}
                    />

                    <DetailRow
                      label="Requirement"
                      value={
                        workerRequest.requirement ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Requester"
                      value={
                        workerRequest.requester_name ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Mobile"
                      value={
                        workerRequest.requester_mobile ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Project"
                      value={
                        workerRequest.project_name ||
                        "-"
                      }
                    />

                  </div>
                )}

            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">

              <button
                onClick={() =>
                  setRejectOpen(
                    true
                  )
                }
                className="h-12 rounded-2xl bg-red-50 text-sm font-extrabold text-red-600"
              >
                Reject
              </button>

              <button
                onClick={handleAccept}
                disabled={loading}
                className="h-12 rounded-2xl bg-emerald-600 text-sm font-extrabold text-white disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : "Accept"}
              </button>

            </div>

          </div>
        </div>
      )}

      {rejectOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/55 p-5">

          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-slate-900">
              Reject this request?
            </h3>

            <p className="mt-2 text-sm leading-5 text-slate-500">
              This action will mark the request as rejected.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">

              <button
                onClick={() =>
                  setRejectOpen(
                    false
                  )
                }
                className="h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleReject
                }
                disabled={loading}
                className="h-11 rounded-xl bg-red-600 text-sm font-bold text-white disabled:opacity-50"
              >
                {loading
                  ? "Rejecting..."
                  : "Reject"}
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="mb-2 text-orange-500">
        {icon}
      </div>

      <p className="text-[11px] text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-3">

      {icon && (
        <div className="mt-0.5 shrink-0 text-slate-500">
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>

    </div>
  );
}