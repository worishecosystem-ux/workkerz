"use client";

import React, { useEffect, useRef, useState } from "react";

import { Checkout } from "capacitor-razorpay";

import {

  CheckCircle2,

  LockKeyhole,

  MapPin,

  CalendarDays,

  Clock3,

  ShieldCheck,



  X,

  CircleCheck,

  CircleAlert,

  CreditCard,

  Smartphone,

  ReceiptText,

} from "lucide-react";

interface BookingPaymentStepProps {

  form: any;

  setForm: React.Dispatch<React.SetStateAction<any>>;

  paymentType?: "full" | "fee";

  setPaymentType?: React.Dispatch<React.SetStateAction<"full" | "fee">>;

  payableAmount?: number;

  grandTotal?: number;

  inp?: string;

  // Parent component success-screen callback

  paymentActionRef: React.MutableRefObject<(() => Promise<void>) | null>;

  onPaymentSuccess?: (data: {

    bookingId: string;

    transactionId?: string;

    paymentId: string;

    status: "paid";

    verification: any;

  }) => void;

}

type ToastType = "success" | "error";

interface ToastState {

  message: string;

  type: ToastType;

}

export default function BookingPaymentStep({

  form,

  setForm,

  paymentActionRef,

  onPaymentSuccess,

}: BookingPaymentStepProps) {

  const [loading, setLoading] = useState(false);

  const [paymentToast, setPaymentToast] = useState<ToastState | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {

    return () => {

      if (toastTimer.current) {

        clearTimeout(toastTimer.current);

      }

    };

  }, []);

  const showToast = (message: string, type: ToastType) => {

    if (toastTimer.current) {

      clearTimeout(toastTimer.current);

    }

    setPaymentToast({ message, type });

    toastTimer.current = setTimeout(() => {

      setPaymentToast(null);

    }, 3500);

  };

  const dismissToast = () => {

    if (toastTimer.current) {

      clearTimeout(toastTimer.current);

    }

    setPaymentToast(null);

  };

  const bookingId = String(

    form?.bookingId || form?.booking_id || form?.id || "",

  );

  const serviceName =

    form?.serviceType ||

    form?.serviceName ||

    form?.service_type ||

    "Workkerz Service";

  const customerName =

    form?.name || form?.fullName || form?.customer_name || "Customer";

  const customerEmail =

    form?.email || form?.customerEmail || form?.customer_email || "";

  const customerPhone =

    form?.phone ||

    form?.mobile ||

    form?.mobileNumber ||

    form?.customer_phone ||

    "";

  const address = [

    form?.houseNo || form?.house_no,

    form?.address,

    form?.landmark,

    form?.city,

    form?.pincode,

  ]

    .filter(Boolean)

    .join(", ");

  const bookingDate = form?.date || form?.booking_date || "";

  const bookingTime = form?.time || form?.booking_time || "";

  const formatDate = (value: string) => {

    if (!value) return "As selected";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

      return value;

    }

    return date.toLocaleDateString("en-IN", {

      day: "numeric",

      month: "short",

      year: "numeric",

    });

  };

  const handlePayment = async () => {

    if (loading) return;

    if (!bookingId) {

      showToast("Booking ID missing. Please go back and try again.", "error");

      return;

    }

    setLoading(true);

    dismissToast();

    try {

      // Read the complete draft saved by BookingPageController before payment.
      // No row is inserted into `bookings` at this stage.
      const readSessionObject = (key: string) => {
        try {
          const raw = sessionStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch (storageError) {
          console.error(`SESSION STORAGE READ ERROR (${key}):`, storageError);
          return null;
        }
      };

      const savedDraftContext = readSessionObject("workkerz_booking_draft");
      const savedBookingContext = readSessionObject("booking-data");

      const contextForm =
        savedDraftContext?.form ||
        savedBookingContext?.form ||
        savedBookingContext ||
        {};

      const draftId = String(
        savedDraftContext?.draftId ||
          savedDraftContext?.bookingId ||
          savedBookingContext?.draftId ||
          savedBookingContext?.bookingId ||
          contextForm?.draftId ||
          contextForm?.bookingId ||
          contextForm?.booking_id ||
          bookingId ||
          "",
      );

      // Prefer the canonical draft object. If an older session only saved the
      // booking form, normalize that form into the API's bookingDraft shape.
      const storedBookingDraft =
        savedDraftContext?.bookingDraft ||
        savedDraftContext?.form?.bookingDraft ||
        savedBookingContext?.bookingDraft ||
        savedBookingContext?.form?.bookingDraft ||
        form?.bookingDraft ||
        null;

      const sourceForm = {
        ...contextForm,
        ...(form && typeof form === "object" ? form : {}),
      };

      const bookingDraft =
        storedBookingDraft &&
        typeof storedBookingDraft === "object" &&
        !Array.isArray(storedBookingDraft)
          ? storedBookingDraft
          : {
              booking_id: draftId,
              booking_status: sourceForm.booking_status || "pending_payment",
              worker_id:
                sourceForm.worker_id || sourceForm.workerId || sourceForm.worker?.id || null,
              worker_name:
                sourceForm.worker_name || sourceForm.workerName || sourceForm.worker?.name || "",
              worker_photo:
                sourceForm.worker_photo || sourceForm.workerPhoto || sourceForm.worker?.photo || null,
              worker_specialty:
                sourceForm.worker_specialty || sourceForm.workerSpecialty || sourceForm.worker?.specialty || "",
              worker_rating: sourceForm.worker_rating ?? sourceForm.workerRating ?? sourceForm.worker?.rating ?? null,
              service_type:
                sourceForm.service_type || sourceForm.serviceType || sourceForm.serviceName || "",
              description: sourceForm.description || sourceForm.workDescription || "",
              booking_date: sourceForm.booking_date || sourceForm.date || sourceForm.bookingDate || "",
              booking_time: sourceForm.booking_time || sourceForm.time || sourceForm.bookingTime || "",
              booking_type: sourceForm.booking_type || sourceForm.bookingType || "service",
              customer_name:
                sourceForm.customer_name || sourceForm.name || sourceForm.fullName || customerName || "",
              customer_phone:
                sourceForm.customer_phone || sourceForm.phone || sourceForm.mobile || sourceForm.mobileNumber || customerPhone || "",
              customer_email:
                sourceForm.customer_email || sourceForm.email || sourceForm.customerEmail || customerEmail || "",
              notes: sourceForm.notes || sourceForm.note || "",
              selected_materials: sourceForm.selected_materials || sourceForm.selectedMaterials || [],
              total_cost: Number(sourceForm.total_cost ?? sourceForm.totalCost ?? 0),
              service_fee: Number(sourceForm.service_fee ?? sourceForm.serviceFee ?? 0),
              materials_cost: Number(sourceForm.materials_cost ?? sourceForm.materialsCost ?? 0),
              package_price: Number(sourceForm.package_price ?? sourceForm.packagePrice ?? 0),
              grand_total: Number(sourceForm.grand_total ?? sourceForm.grandTotal ?? 0),
              work_status: sourceForm.work_status || "pending",
              worker_available: sourceForm.worker_available ?? sourceForm.workerAvailable ?? true,
              house_no: sourceForm.house_no || sourceForm.houseNo || "",
              address: sourceForm.address || sourceForm.fullAddress || "",
              landmark: sourceForm.landmark || "",
              city: sourceForm.city || "",
              state: sourceForm.state || "Madhya Pradesh",
              pincode: sourceForm.pincode || sourceForm.pinCode || "",
            };

      const requiredDraftFields = [
        "worker_id",
        "customer_name",
        "customer_phone",
        "customer_email",
        "booking_date",
        "booking_time",
        "booking_type",
        "service_type",
      ];
      const missingDraftFields = requiredDraftFields.filter((key) => {
        const value = bookingDraft?.[key];
        return value === undefined || value === null || String(value).trim() === "";
      });

      if (!draftId || !bookingDraft || typeof bookingDraft !== "object" || missingDraftFields.length) {
        console.error("BOOKING DRAFT VALIDATION FAILED BEFORE CREATE ORDER:", {
          draftId,
          savedDraftContextPresent: Boolean(savedDraftContext),
          savedBookingContextPresent: Boolean(savedBookingContext),
          storedBookingDraftPresent: Boolean(storedBookingDraft),
          missingDraftFields,
          formKeys: form && typeof form === "object" ? Object.keys(form) : [],
          contextFormKeys: contextForm && typeof contextForm === "object" ? Object.keys(contextForm) : [],
        });
        throw new Error(
          missingDraftFields.length
            ? `Booking details are incomplete: ${missingDraftFields.join(", ")}. Please return to Review and check your details.`
            : "Booking draft is missing. Please return to Review and try again.",
        );
      }

      // Persist the normalized context so refreshes/navigation do not discard it.
      const normalizedContext = {
        ...(savedDraftContext || {}),
        ...(savedBookingContext || {}),
        form: sourceForm,
        draftId,
        bookingId: draftId,
        bookingDraft,
        paymentStatus: "pending",
        paymentVerified: false,
      };
      sessionStorage.setItem("workkerz_booking_draft", JSON.stringify(normalizedContext));
      sessionStorage.setItem("booking-data", JSON.stringify(normalizedContext));

      // 1. Create Razorpay order on the server.
      // The API stores the draft in the transaction metadata; the actual
      // booking row should be created only after server-side payment verification.
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceType: "booking",
          sourceId: draftId,
          amount: 19,
          customerName: customerName || bookingDraft.customer_name || "",
          customerEmail: customerEmail || bookingDraft.customer_email || "",
          customerPhone: customerPhone || bookingDraft.customer_phone || "",
          workerId: bookingDraft.worker_id || form?.workerId || form?.worker_id || null,
          itemName: "Workkerz Booking Charge",
          // Keep draft in metadata (canonical API contract) and top-level
          // fields for compatibility with older route handlers.
          draftId,
          bookingDraft,
          metadata: {
            draftId,
            bookingDraft,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (

        !orderResponse.ok ||

        !orderData?.success ||

        !orderData?.orderId ||

        !orderData?.keyId

      ) {

        throw new Error(

          orderData?.message || "Unable to create payment order.",

        );

      }

      // 2. Open Razorpay native checkout.

      const checkoutOptions = {
        key: String(orderData.keyId),
        amount: String(orderData.amount),
        currency: String(orderData.currency || "INR"),
        name: "Workkerz",
        description: "₹19 Booking Charge",
        order_id: String(orderData.orderId),
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: {
          source_type: "booking",
          source_id: String(draftId),
          transaction_id: String(orderData.transactionId || ""),
          transaction_number: String(orderData.transactionNumber || ""),
        },
        theme: { color: "#0F9F8F" },
      } as any;

      const paymentResponse = await Checkout.open(checkoutOptions);

      console.log("RAZORPAY CHECKOUT RESPONSE:", paymentResponse);

      if (!paymentResponse) {

        throw new Error("Payment response was not received.");

      }

      const paymentData = paymentResponse as any;

      const razorpayOrderId =

        paymentData?.razorpay_order_id ||

        paymentData?.razorpayOrderId ||

        paymentData?.response?.razorpay_order_id ||

        paymentData?.data?.razorpay_order_id ||

        String(orderData.orderId);

      const razorpayPaymentId =

        paymentData?.razorpay_payment_id ||

        paymentData?.razorpayPaymentId ||

        paymentData?.response?.razorpay_payment_id ||

        paymentData?.data?.razorpay_payment_id;

      const razorpaySignature =

        paymentData?.razorpay_signature ||

        paymentData?.razorpaySignature ||

        paymentData?.response?.razorpay_signature ||

        paymentData?.data?.razorpay_signature;

      if (!razorpayPaymentId || !razorpaySignature) {

        console.error("RAZORPAY PAYMENT DETAILS MISSING:", {

          orderId: razorpayOrderId,

          hasPaymentId: Boolean(razorpayPaymentId),

          hasSignature: Boolean(razorpaySignature),

          response: paymentData,

        });

        throw new Error(

          "Payment details could not be confirmed. Check the payment status before trying again.",

        );

      }

      // 3. Verify the payment signature on the server.

      const verifyResponse = await fetch("/api/razorpay/verify-payment", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          razorpay_order_id: razorpayOrderId,

          razorpay_payment_id: razorpayPaymentId,

          razorpay_signature: razorpaySignature,

          sourceType: "booking",

          sourceId: draftId,

        }),

      });

      const verifyData = await verifyResponse.json();

      console.log("RAZORPAY VERIFY RESPONSE:", verifyData);

      if (

        !verifyResponse.ok ||

        !verifyData?.success ||

        !verifyData?.paymentVerified

      ) {

        throw new Error(verifyData?.message || "Payment verification failed.");

      }

      // 4. The verification API must return the real database bookings.id.
      // Never use the temporary draft ID as the confirmation URL/booking ID.
      const confirmedBookingId = String(
        verifyData?.bookingId || verifyData?.booking?.id || "",
      );

      if (!confirmedBookingId) {
        console.error(
          "VERIFY PAYMENT DID NOT RETURN DATABASE BOOKING UUID:",
          verifyData,
        );
        throw new Error(
          "Payment was verified, but the confirmed booking ID was not returned. Please contact Workkerz support before retrying payment.",
        );
      }

      // Update local form only after server-side verification and booking creation.
      const updatedForm = {

        ...form,

        bookingId: confirmedBookingId,

        booking_id: confirmedBookingId,

        paymentStatus: "paid",

        payment_status: "paid",

        paymentVerified: true,

        payment_verified: true,

        bookingPaymentStatus: "paid",

        bookingCharge: 19,

        booking_charge: 19,

        razorpay_order_id: razorpayOrderId,

        razorpay_payment_id: razorpayPaymentId,

        razorpay_signature: razorpaySignature,

        paymentVerification: verifyData,

      };

      setForm(updatedForm);

      // Persist the verified payment state for the

      // existing booking flow.

      try {

        sessionStorage.setItem(

          "workkerz_booking_form",

          JSON.stringify(updatedForm),

        );

        const existingBookingData = sessionStorage.getItem("booking-data");

        if (existingBookingData) {

          try {

            const parsed = JSON.parse(existingBookingData);

            sessionStorage.setItem(

              "booking-data",

              JSON.stringify({

                ...parsed,

                form: updatedForm,

                bookingId: confirmedBookingId,

                draftId,

                paymentStatus: "paid",

                paymentVerified: true,

                razorpay_payment_id: razorpayPaymentId,

              }),

            );

          } catch (storageError) {

            console.error("BOOKING DATA STORAGE ERROR:", storageError);

          }

        }

      } catch (storageError) {

        console.error("PAYMENT SESSION STORAGE ERROR:", storageError);

      }

      // Keep the event for any existing listeners.

      window.dispatchEvent(

        new CustomEvent("booking:payment-success", {

          detail: {

            bookingId: confirmedBookingId,

            draftId,

            payment: paymentData,

            verification: verifyData,

          },

        }),

      );

      // 5. Tell the parent component to show its

      // booking-success screen or advance its step.

      showToast("₹19 booking charge paid successfully.", "success");

      onPaymentSuccess?.({

        bookingId: confirmedBookingId,

        transactionId: verifyData?.transactionId || orderData?.transactionId,

        paymentId: String(razorpayPaymentId),

        status: "paid",

        verification: verifyData,

      });

    } catch (error: any) {

      console.error("BOOKING PAYMENT ERROR:", error);

      const message = String(

        error?.message || error?.description || error?.error?.description || "",

      ).toLowerCase();

      const errorCode = String(

        error?.code || error?.error?.code || error?.error?.reason || "",

      ).toLowerCase();

      const isCancelled =

        message.includes("cancel") ||

        message.includes("dismiss") ||

        message.includes("user closed") ||

        message.includes("user_cancelled") ||

        errorCode.includes("cancel") ||

        errorCode.includes("user_cancelled");

      showToast(

        isCancelled

          ? "Payment cancelled. Your booking is not confirmed."

          : error?.message ||

              "Payment confirmation failed. Check payment status before retrying.",

        "error",

      );

    } finally {

      setLoading(false);

    }

  };

  // The parent booking screen owns the single bottom action button.
  // Register this payment handler so that button opens Razorpay directly.
  useEffect(() => {
    paymentActionRef.current = handlePayment;

    return () => {
      if (paymentActionRef.current === handlePayment) {
        paymentActionRef.current = null;
      }
    };
  }, [paymentActionRef, handlePayment]);

  return (

    <div className="mx-auto w-full max-w-md bg-[#F6F8FB] pb-6 text-slate-900 sm:rounded-3xl sm:border sm:border-slate-100 sm:bg-white sm:p-5">

      {/* Toast */}

      {paymentToast && (

        <div className="fixed inset-x-3 top-20 z-[9999] flex justify-center sm:top-24">

          <div

            role="status"

            aria-live="polite"

            className={`flex w-full max-w-md items-center gap-3 rounded-2xl border bg-white p-3.5 shadow-[0_12px_40px_rgba(15,23,42,0.16)] ${

              paymentToast.type === "success"

                ? "border-emerald-200"

                : "border-red-200"

            }`}

          >

            <div

              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${

                paymentToast.type === "success"

                  ? "bg-emerald-50 text-emerald-600"

                  : "bg-red-50 text-red-600"

              }`}

            >

              {paymentToast.type === "success" ? (

                <CircleCheck className="h-5 w-5" />

              ) : (

                <CircleAlert className="h-5 w-5" />

              )}

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-bold">

                {paymentToast.type === "success"

                  ? "Payment Successful"

                  : paymentToast.message.toLowerCase().includes("cancel")

                    ? "Payment Cancelled"

                    : "Payment Failed"}

              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">

                {paymentToast.message}

              </p>

            </div>

            <button

              type="button"

              aria-label="Dismiss notification"

              onClick={dismissToast}

              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"

            >

              <X className="h-4 w-4" />

            </button>

          </div>

        </div>

      )}

      {/* Header */}

      <header className="flex items-center gap-3 bg-white px-4 py-4 sm:rounded-2xl sm:px-0 sm:py-0">

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">

          <LockKeyhole className="h-5 w-5 text-emerald-700" />

        </div>

        <div className="min-w-0 flex-1">

          <h2 className="text-[17px] font-extrabold tracking-tight">

            Secure Checkout

          </h2>

          <p className="mt-0.5 text-xs text-slate-500">

            Complete your Workkerz booking

          </p>

        </div>

        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5">

          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />

          <span className="text-[10px] font-bold text-emerald-700">Secure</span>

        </div>

      </header>

      {/* Amount */}

      <section className="relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-[#102B3B] via-[#123E4A] to-[#087F78] p-5 text-white shadow-[0_12px_28px_rgba(10,70,76,0.16)]">

        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[24px] border-white/[0.05]" />

        <div className="relative">

          <div className="flex items-center justify-between">

            <p className="text-xs font-medium text-white/70">

              Booking confirmation charge

            </p>

            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold">

              One-time

            </span>

          </div>

          <div className="mt-2 flex items-end gap-2">

            <span className="text-[42px] font-extrabold leading-none tracking-tight">

              ₹19

            </span>

            <span className="pb-1 text-xs text-white/60">INR</span>

          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-3">

            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" />

            <p className="text-[11px] text-white/75">

              Payment is verified securely before confirmation

            </p>

          </div>

        </div>

      </section>

      {/* Booking details */}

      <section className="mt-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

        <div className="mb-4 flex items-center justify-between">

          <h3 className="text-sm font-extrabold">Booking details</h3>

          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700">

            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

            Awaiting payment

          </span>

        </div>

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">

            <ReceiptText className="h-5 w-5 text-slate-600" />

          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">

              Selected service

            </p>

            <p className="mt-1 break-words text-sm font-bold">{serviceName}</p>

            <p className="mt-1 text-xs text-slate-400">

              Booking ID: {bookingId || "Not available"}

            </p>

          </div>

        </div>

        <div className="my-4 border-t border-dashed border-slate-200" />

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">

            <MapPin className="h-4 w-4 text-slate-500" />

          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">

              Service location

            </p>

            <p className="mt-1 break-words text-xs font-medium leading-5 text-slate-700">

              {address || "Address selected during booking"}

            </p>

          </div>

        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">

          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3">

            <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />

            <div className="min-w-0">

              <p className="text-[10px] text-slate-400">Date</p>

              <p className="mt-0.5 truncate text-xs font-bold">

                {formatDate(bookingDate)}

              </p>

            </div>

          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3">

            <Clock3 className="h-4 w-4 shrink-0 text-slate-500" />

            <div className="min-w-0">

              <p className="text-[10px] text-slate-400">Time</p>

              <p className="mt-0.5 truncate text-xs font-bold">

                {bookingTime || "As selected"}

              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Payment summary */}

      <section className="mt-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

        <h3 className="text-sm font-extrabold">Payment summary</h3>

        <div className="mt-4 flex items-center justify-between">

          <span className="text-xs text-slate-500">Booking charge</span>

          <span className="text-sm font-semibold">₹19.00</span>

        </div>

        <div className="mt-3 flex items-center justify-between">

          <span className="text-xs text-slate-500">Payment processing</span>

          <span className="text-xs font-semibold text-emerald-700">

            Secure checkout

          </span>

        </div>

        <div className="my-4 border-t border-dashed border-slate-200" />

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm font-extrabold">Total payable</p>

            <p className="mt-1 text-[10px] text-slate-400">

              Booking confirmation charge

            </p>

          </div>

          <span className="text-2xl font-extrabold tracking-tight">₹19</span>

        </div>

      </section>

      {/* Payment options */}

      <section className="mt-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

        <div className="flex items-center justify-between">

          <h3 className="text-sm font-extrabold">Payment options</h3>

          <span className="text-[10px] font-medium text-slate-400">

            Via Razorpay

          </span>

        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 p-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">

              <Smartphone className="h-4 w-4 text-violet-600" />

            </div>

            <div>

              <p className="text-xs font-bold">UPI</p>

              <p className="mt-0.5 text-[10px] text-slate-400">GPay, PhonePe</p>

            </div>

          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 p-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">

              <CreditCard className="h-4 w-4 text-blue-600" />

            </div>

            <div>

              <p className="text-xs font-bold">Cards</p>

              <p className="mt-0.5 text-[10px] text-slate-400">Credit, debit</p>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-100 p-3">

            <p className="text-xs font-bold">Net banking</p>

            <p className="mt-1 text-[10px] text-slate-400">Supported banks</p>

          </div>

          <div className="rounded-2xl border border-slate-100 p-3">

            <p className="text-xs font-bold">Wallets</p>

            <p className="mt-1 text-[10px] text-slate-400">Available wallets</p>

          </div>

        </div>

      </section>

    </div>

  );

}
