"use client";

import {
  Calendar,
  Clock3,
  Navigation,
  UserRound,
  Phone,
  Mail,
  FileText,
  Wallet,
  Receipt,
  ShieldCheck,
  Headphones,
  ChevronRight,
  PencilLine,
} from "lucide-react";

interface Props {
  worker: any;
  form: any;
  address: any;

  totalCost: number;
  serviceFee: number;
  grandTotal: number;
  payableAmount: number;

  paymentType: "full" | "fee";

  onProceed: () => void;
  onEdit: (step: number) => void;
}

export default function BookingReviewStep({
  worker,
  form,
  address,
  totalCost,
  serviceFee,
  grandTotal,
  payableAmount,
  paymentType,
  onProceed,
  onEdit,
}: Props) {
  /* =========================================
     SELECTED PRICING TYPE
  ========================================= */

  const pricingType =
    form?.pricingType ||
    form?.bookingType ||
    worker?.pricingType ||
    "";

  /* =========================================
     WORKER PRICES
  ========================================= */

  const workerStartingPrice = Number(
    worker?.startingPrice || 0,
  );

  const workerHalfDayPrice = Number(
    worker?.halfDayPrice || 0,
  );

  const workerFullDayPrice = Number(
    worker?.fullDayPrice || 0,
  );

  const workerMonthlyPrice = Number(
    worker?.monthlyPrice || 0,
  );

  const workerVisitCharge = Number(
    worker?.visitCharge || 0,
  );

  /* =========================================
     RESOLVE WORKER CHARGE
  ========================================= */

  let resolvedWorkerCharge = Number(
    totalCost || 0,
  );

  if (resolvedWorkerCharge <= 0) {
    switch (pricingType) {
      case "visit_charge":
      case "visit":
      case "visitCharge":
        resolvedWorkerCharge =
          workerVisitCharge;
        break;

      case "half_day":
      case "half-day":
        resolvedWorkerCharge =
          workerHalfDayPrice;
        break;

      case "full_day":
      case "full-day":
        resolvedWorkerCharge =
          workerFullDayPrice;
        break;

      case "monthly":
        resolvedWorkerCharge =
          workerMonthlyPrice;
        break;

      case "per_job":
      case "per-job":
      case "per_service":
      default:
        resolvedWorkerCharge =
          workerStartingPrice;
        break;
    }
  }

  /* =========================================
     NO SERVICE CHARGE
     TOTAL = WORKER CHARGE
  ========================================= */

  const finalGrandTotal =
    resolvedWorkerCharge;

  const finalPayableAmount =
    finalGrandTotal;

  /* =========================================
     DEBUG
  ========================================= */

  console.log(
    "BOOKING REVIEW PRICING:",
    {
      worker: worker?.name,
      pricingType,
      totalCost,
      workerStartingPrice,
      workerHalfDayPrice,
      workerFullDayPrice,
      workerMonthlyPrice,
      workerVisitCharge,
      resolvedWorkerCharge,
      finalGrandTotal,
      finalPayableAmount,
    },
  );

  return (
    <div className="bg-white min-h-screen pb-36">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="px-5 pt-5 pb-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              Review Booking
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Verify your booking details before payment.
            </p>
          </div>

          {/* Protected Booking */}
          <div className="mt-2 rounded-xl bg-gray-100 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                  <ShieldCheck
                    size={16}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-gray-900 leading-none">
                    Protected Booking
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500 leading-none">
                    Secure payment • Verified worker
                  </p>
                </div>
              </div>

              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* =====================================
            SERVICE DETAILS
        ===================================== */}

        <Card
          title="Service Details"
          icon={<Calendar size={18} />}
          step={1}
          onEdit={onEdit}
        >
          <Item
            icon={<Receipt size={16} />}
            label="Category"
            value={
              worker?.specialty ||
              worker?.category ||
              "Not Available"
            }
          />

          <Item
            icon={<Calendar size={16} />}
            label="Date"
            value={
              form?.date ||
              "Not Selected"
            }
          />

          <Item
            icon={<Clock3 size={16} />}
            label="Time"
            value={
              form?.time ||
              "Not Selected"
            }
          />

          {form?.serviceType && (
            <Item
              icon={<FileText size={16} />}
              label="Service Type"
              value={form.serviceType}
            />
          )}

          {pricingType && (
            <Item
              icon={<Wallet size={16} />}
              label="Pricing Type"
              value={formatPricingType(
                pricingType,
              )}
            />
          )}

          {form?.description?.trim() && (
            <div className="flex items-start gap-3 py-3 border-t border-gray-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <FileText size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-gray-500">
                  Work Description
                </p>

                <p className="mt-1 text-[14px] leading-5 text-gray-900 wrap-break-word">
                  {form.description}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* =====================================
            CUSTOMER DETAILS
        ===================================== */}

        <Card
          title="Customer Details"
          icon={<UserRound size={18} />}
          step={2}
          onEdit={onEdit}
        >
          <Item
            icon={<UserRound size={16} />}
            label="Name"
            value={
              form?.name ||
              "Not Provided"
            }
          />

          <Item
            icon={<Phone size={16} />}
            label="Phone"
            value={
              form?.phone ||
              "Not Provided"
            }
          />

          <Item
            icon={<Mail size={16} />}
            label="Email"
            value={
              form?.email ||
              "Not Provided"
            }
          />
        </Card>

        {/* =====================================
            SERVICE ADDRESS
        ===================================== */}

        <Card
          title="Service Address"
          icon={<Navigation size={18} />}
          step={3}
          onEdit={onEdit}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {address?.customer_name ||
                  form?.name ||
                  "Service Address"}
              </p>

              <p className="mt-0.5 text-[13px] leading-5 text-gray-600 wrap-break-word">
                {[
                  address?.house_no,
                  address?.address,
                  address?.landmark,
                  address?.city,
                  address?.district,
                  address?.state,
                  address?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                  "Address not provided"}
              </p>
            </div>
          </div>
        </Card>

        {/* =====================================
            BOOKING NOTES
        ===================================== */}

        {form?.notes?.trim() && (
          <Card
            title="Booking Notes"
            icon={<FileText size={18} />}
            step={2}
            onEdit={onEdit}
          >
            <p className="text-gray-700">
              {form.notes}
            </p>
          </Card>
        )}

        {/* =====================================
            PAYMENT SUMMARY
        ===================================== */}

        <Card
          title="Payment Summary"
          icon={<Wallet size={18} />}
          step={4}
          onEdit={onEdit}
        >
          <div className="space-y-1">
            <Row
              title="Worker Charge"
              value={`₹${resolvedWorkerCharge.toLocaleString(
                "en-IN",
              )}`}
            />

            <div className="my-2 border-t border-gray-100" />

            <Row
              title="Total"
              value={`₹${finalGrandTotal.toLocaleString(
                "en-IN",
              )}`}
              bold
            />
          </div>
        </Card>

        {/* =====================================
            INFORMATION
        ===================================== */}

        <div className="bg-white rounded-2xl border border-gray-100">
          <InfoRow
            icon={
              <ShieldCheck size={18} />
            }
            title="Secure Payment"
            subtitle="100% Safe & Secure Payment"
          />

          <InfoRow
            icon={
              <Receipt size={18} />
            }
            title="Cancellation Policy"
            subtitle="Free cancellation before worker accepts."
          />

          <InfoRow
            icon={
              <Headphones size={18} />
            }
            title="Need Help?"
            subtitle="Our support team is available."
            last
          />
        </div>
      </div>

      {/* =====================================
          BOTTOM BAR
      ===================================== */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">
              Amount Payable
            </p>

            <h2 className="text-2xl font-bold text-gray-900">
              ₹
              {finalPayableAmount.toLocaleString(
                "en-IN",
              )}
            </h2>
          </div>

          <button
            onClick={onProceed}
            className="bg-linear-to-r from-[#59dbff] to-[#19e2ca] text-white rounded-xl px-7 py-4 font-semibold flex items-center gap-2"
          >
            Continue
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   CARD
========================================= */

function Card({
  title,
  icon,
  step,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2874F0]/10 text-[#2874F0]">
            {icon}
          </div>

          <h3 className="text-[15px] font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        <button
          onClick={() => onEdit(step)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-[#2874F0] transition active:scale-95"
        >
          <PencilLine size={14} />
          Edit
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5">
        {children}
      </div>
    </div>
  );
}

/* =========================================
   ITEM
========================================= */

function Item({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        {icon}
      </div>

      <div className="flex flex-1 items-center justify-between min-w-0 gap-3">
        <span className="text-[12px] font-medium text-gray-500">
          {label}
        </span>

        <span className="truncate text-[14px] font-semibold text-gray-900 text-right">
          {value}
        </span>
      </div>
    </div>
  );
}

/* =========================================
   ROW
========================================= */

function Row({
  title,
  value,
  bold,
  blue,
}: {
  title: string;
  value: string;
  bold?: boolean;
  blue?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span
        className={`text-[13px] ${
          bold
            ? "font-semibold text-gray-900"
            : "text-gray-600"
        }`}
      >
        {title}
      </span>

      <span
        className={`text-[13px] ${
          blue
            ? "font-bold text-[#2874F0]"
            : bold
              ? "font-bold text-gray-900"
              : "font-medium text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================
   INFO ROW
========================================= */

function InfoRow({
  icon,
  title,
  subtitle,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 ${
        !last ? "border-b" : ""
      }`}
    >
      <div className="text-green-600 mt-1">
        {icon}
      </div>

      <div>
        <h4 className="font-medium text-gray-900">
          {title}
        </h4>

        <p className="text-sm text-gray-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================
   FORMAT PRICING TYPE
========================================= */

function formatPricingType(
  value: string,
): string {
  switch (value) {
    case "visit_charge":
    case "visit":
    case "visitCharge":
      return "Visit Charge";

    case "per_job":
    case "per-job":
      return "Per Work";

    case "half_day":
    case "half-day":
      return "Half Day";

    case "full_day":
    case "full-day":
      return "Full Day";

    case "monthly":
      return "Monthly";

    default:
      return value
        ? value
            .replaceAll("_", " ")
            .replace(
              /\b\w/g,
              (char) =>
                char.toUpperCase(),
            )
        : "Not Selected";
  }
}