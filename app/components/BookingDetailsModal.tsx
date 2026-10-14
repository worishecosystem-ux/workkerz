
"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import {
  X,
  UserRound,
  Phone,
  MapPin,
  Mail,
  BriefcaseBusiness,
  CalendarDays,
  Hash,
  Wallet,
  Building2,
  AlertCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import type { Booking } from "@/lib/booking-details";

export type ModalType = "user" | "worker" | "refund" | null;

export type RefundFormValues = {
  reason: string;
  refundMethod: "upi" | "bank";
  refundDetails:
    | { upiId: string }
    | {
        accountHolder: string;
        accountNumber: string;
        ifsc: string;
      };
};

type BookingDetailsModalProps = {
  activeModal: ModalType;
  setActiveModal: Dispatch<SetStateAction<ModalType>>;
  booking: Booking;
  address: string;
  bookingReference: string;
  serviceName: string;
  workerName: string;
  workerPhone: string;
  reason: string;
  setReason: (value: string) => void;
  submitting: boolean;
  error: string;
  success: string;
  onClearError: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    values: RefundFormValues
  ) => void | Promise<void>;
};

const REFUND_REASONS = [
  "Booking was cancelled by me",
  "Worker was not available",
  "Worker did not arrive on time",
  "Booking was made by mistake",
  "Payment was deducted but booking failed",
  "Duplicate payment",
  "Service was no longer required",
  "Other",
];

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="break-words text-sm font-semibold text-gray-900">
        {value === undefined || value === null || value === ""
          ? "Not provided"
          : String(value)}
      </p>
    </div>
  );
}

export default function BookingDetailsModal({
  activeModal,
  setActiveModal,
  booking,
  address,
  bookingReference,
  serviceName,
  workerName,
  workerPhone,
  reason,
  setReason,
  submitting,
  error,
  success,
  onClearError,
  onSubmit,
}: BookingDetailsModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [refundMethod, setRefundMethod] =
    useState<"upi" | "bank">("upi");

  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] =
    useState("");
  const [ifsc, setIfsc] = useState("");

  const [formError, setFormError] = useState("");

  const bookingData = booking as Booking & {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    email?: string;
    phone?: string;
    booking_date?: string;
    booking_time?: string;
    payment_status?: string;
    grand_total?: number;
    payable_amount?: number;
    total_amount?: number;
    worker?: {
      name?: string;
      full_name?: string;
      phone?: string;
      mobile_number?: string;
    };
  };

  useEffect(() => {
    if (activeModal !== "refund") return;

    setSelectedReason(
      REFUND_REASONS.includes(reason) && reason !== "Other"
        ? reason
        : reason
          ? "Other"
          : ""
    );

    setFormError("");
  }, [activeModal, reason]);

  useEffect(() => {
    if (!activeModal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        setActiveModal(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeModal, submitting, setActiveModal]);

  if (!activeModal) return null;

  const closeModal = () => {
    if (submitting) return;
    setFormError("");
    onClearError();
    setActiveModal(null);
  };

  const clearValidation = () => {
    setFormError("");
    onClearError();
  };

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
    setReason(value === "Other" ? "" : value);
    clearValidation();
  };

  const handleFormSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    clearValidation();

    const finalReason =
      selectedReason === "Other"
        ? reason.trim()
        : selectedReason.trim();

    if (finalReason.length < 5 || finalReason.length > 150) {
      setFormError(
        "Please select a reason between 5 and 150 characters."
      );
      return;
    }

    let refundDetails: RefundFormValues["refundDetails"];

    if (refundMethod === "upi") {
      const cleanUpi = upiId.trim();

      if (
        !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(cleanUpi)
      ) {
        setFormError("Please enter a valid UPI ID.");
        return;
      }

      refundDetails = { upiId: cleanUpi };
    } else {
      const cleanHolder = accountHolder.trim();
      const cleanAccount = accountNumber.trim();
      const cleanConfirm = confirmAccountNumber.trim();
      const cleanIfsc = ifsc.trim().toUpperCase();

      if (
        !cleanHolder ||
        !cleanAccount ||
        !cleanConfirm ||
        !cleanIfsc
      ) {
        setFormError("Please fill in all bank account details.");
        return;
      }

      if (!/^\d{9,18}$/.test(cleanAccount)) {
        setFormError("Please enter a valid bank account number.");
        return;
      }

      if (cleanAccount !== cleanConfirm) {
        setFormError("Bank account numbers do not match.");
        return;
      }

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
        setFormError("Please enter a valid IFSC code.");
        return;
      }

      refundDetails = {
        accountHolder: cleanHolder,
        accountNumber: cleanAccount,
        ifsc: cleanIfsc,
      };
    }

    const values: RefundFormValues = {
      reason: finalReason,
      refundMethod,
      refundDetails,
    };

    setReason(finalReason);

    // Pass both arguments: this fixes values.reason being undefined.
    await onSubmit(event, values);
  };

  const title =
    activeModal === "user"
      ? "Customer Details"
      : activeModal === "worker"
        ? "Worker Details"
        : "Cancel Booking";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          closeModal();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2
              id="booking-modal-title"
              className="text-lg font-bold text-gray-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {activeModal === "refund"
                ? "Submit a cancellation and refund request"
                : `Booking ${bookingReference}`}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={submitting}
            aria-label="Close modal"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          {activeModal === "user" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail
                label="Customer name"
                value={bookingData.customer_name}
                icon={<UserRound size={15} />}
              />
              <Detail
                label="Email"
                value={bookingData.customer_email || bookingData.email}
                icon={<Mail size={15} />}
              />
              <Detail
                label="Phone"
                value={bookingData.customer_phone || bookingData.phone}
                icon={<Phone size={15} />}
              />
              <Detail
                label="Address"
                value={address}
                icon={<MapPin size={15} />}
              />
            </div>
          )}

          {activeModal === "worker" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail
                label="Worker name"
                value={workerName}
                icon={<UserRound size={15} />}
              />
              <Detail
                label="Worker phone"
                value={workerPhone}
                icon={<Phone size={15} />}
              />
              <Detail
                label="Service"
                value={serviceName}
                icon={<BriefcaseBusiness size={15} />}
              />
              <Detail
                label="Address"
                value={bookingData.worker?.full_name
                  ? bookingData.worker?.name
                  : address}
                icon={<MapPin size={15} />}
              />
            </div>
          )}

          {activeModal === "refund" && (
            <>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      Booking cancellation request
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-700">
                      Only the ₹49 booking charge is covered by this
                      refund request. Submission does not itself
                      cancel the booking or initiate a payment refund.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Detail
                  label="Booking ID"
                  value={bookingReference}
                  icon={<Hash size={15} />}
                />
                <Detail
                  label="Service"
                  value={serviceName}
                  icon={<BriefcaseBusiness size={15} />}
                />
                <Detail
                  label="Booking date"
                  value={bookingData.booking_date}
                  icon={<CalendarDays size={15} />}
                />
                <Detail
                  label="Payment status"
                  value={bookingData.payment_status}
                  icon={<Wallet size={15} />}
                />
              </div>

              <form
                onSubmit={handleFormSubmit}
                className="space-y-5"
                noValidate
              >
                <div>
                  <label
                    htmlFor="refund-reason"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Cancellation reason
                    <span className="text-red-600"> *</span>
                  </label>

                  <select
                    id="refund-reason"
                    value={selectedReason}
                    onChange={(event) =>
                      handleReasonChange(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="" disabled>
                      Select cancellation reason
                    </option>
                    {REFUND_REASONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedReason === "Other" && (
                  <div>
                    <label
                      htmlFor="other-reason"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Explain your reason
                    </label>
                    <textarea
                      id="other-reason"
                      rows={3}
                      maxLength={150}
                      value={reason}
                      onChange={(event) => {
                        setReason(event.target.value);
                        clearValidation();
                      }}
                      placeholder="Enter your reason"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-800">
                    Refund destination
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRefundMethod("upi");
                        clearValidation();
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                        refundMethod === "upi"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <Wallet size={17} />
                      UPI ID
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRefundMethod("bank");
                        clearValidation();
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                        refundMethod === "bank"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <Building2 size={17} />
                      Bank account
                    </button>
                  </div>
                </div>

                {refundMethod === "upi" ? (
                  <div>
                    <label
                      htmlFor="refund-upi"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      UPI ID
                    </label>
                    <input
                      id="refund-upi"
                      type="text"
                      autoComplete="off"
                      maxLength={100}
                      value={upiId}
                      onChange={(event) => {
                        setUpiId(event.target.value);
                        clearValidation();
                      }}
                      placeholder="example@upi"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="refund-account-holder"
                        className="mb-2 block text-sm font-semibold text-gray-800"
                      >
                        Account holder name
                      </label>
                      <input
                        id="refund-account-holder"
                        value={accountHolder}
                        onChange={(event) => {
                          setAccountHolder(event.target.value);
                          clearValidation();
                        }}
                        maxLength={100}
                        autoComplete="name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="refund-account-number"
                        className="mb-2 block text-sm font-semibold text-gray-800"
                      >
                        Account number
                      </label>
                      <input
                        id="refund-account-number"
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                        value={accountNumber}
                        onChange={(event) => {
                          setAccountNumber(
                            event.target.value.replace(/\D/g, "")
                          );
                          clearValidation();
                        }}
                        maxLength={18}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="refund-account-confirm"
                        className="mb-2 block text-sm font-semibold text-gray-800"
                      >
                        Confirm account number
                      </label>
                      <input
                        id="refund-account-confirm"
                        inputMode="numeric"
                        autoComplete="off"
                        value={confirmAccountNumber}
                        onChange={(event) => {
                          setConfirmAccountNumber(
                            event.target.value.replace(/\D/g, "")
                          );
                          clearValidation();
                        }}
                        maxLength={18}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="refund-ifsc"
                        className="mb-2 block text-sm font-semibold text-gray-800"
                      >
                        IFSC code
                      </label>
                      <input
                        id="refund-ifsc"
                        value={ifsc}
                        onChange={(event) => {
                          setIfsc(event.target.value.toUpperCase());
                          clearValidation();
                        }}
                        maxLength={11}
                        autoComplete="off"
                        placeholder="ABCD0123456"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm uppercase outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs leading-5 text-amber-900">
                    Never share your UPI PIN, OTP, card PIN or
                    banking password to receive a refund.
                  </p>
                </div>

                {(formError || error) && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <p>{formError || error}</p>
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                  >
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                    <p>{success}</p>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Go back
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <X size={17} />
                        Cancel Booking
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
