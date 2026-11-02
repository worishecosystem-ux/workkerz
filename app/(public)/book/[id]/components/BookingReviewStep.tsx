
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
  Tag,
} from "lucide-react";

interface Props {
  worker: any;
  form: any;
  address: any;

  totalCost: number;
  grandTotal: number;

  // Compatible with both controller versions
  bookingSubmitting?: boolean;
  onComplete?: () => void;
  onProceed?: () => void;
  onEdit: (step: number) => void;

  // Optional legacy props
  serviceFee?: number;
  payableAmount?: number;
  paymentType?: "full" | "fee";
}

export default function BookingReviewStep({
  worker,
  form,
  address,
  totalCost,
  grandTotal,
  bookingSubmitting = false,
  onComplete,
  onProceed,
  onEdit,
}: Props) {
  const handleComplete = onComplete || onProceed || (() => {});

  const pricingType =
    form?.pricingType ||
    form?.bookingType ||
    worker?.pricingType ||
    "";

  const workerStartingPrice = Number(worker?.startingPrice || 0);
  const workerHalfDayPrice = Number(worker?.halfDayPrice || 0);
  const workerFullDayPrice = Number(worker?.fullDayPrice || 0);
  const workerMonthlyPrice = Number(worker?.monthlyPrice || 0);
  const workerVisitCharge = Number(worker?.visitCharge || 0);

  let resolvedWorkerCharge = Number(totalCost || 0);

  if (resolvedWorkerCharge <= 0) {
    switch (pricingType) {
      case "visit_charge":
      case "visit":
      case "visitCharge":
        resolvedWorkerCharge = workerVisitCharge;
        break;

      case "half_day":
      case "half-day":
        resolvedWorkerCharge = workerHalfDayPrice;
        break;

      case "full_day":
      case "full-day":
        resolvedWorkerCharge = workerFullDayPrice;
        break;

      case "monthly":
        resolvedWorkerCharge = workerMonthlyPrice;
        break;

      default:
        resolvedWorkerCharge = workerStartingPrice;
        break;
    }
  }

  // Only booking confirmation charge is free.
  // Worker/service price remains unchanged.
  const finalGrandTotal =
    Number(grandTotal) > 0
      ? Number(grandTotal)
      : resolvedWorkerCharge;

  const bookingAddress = [
    address?.house_no || form?.houseNo,
    address?.address || form?.address,
    address?.landmark || form?.landmark,
    address?.city || form?.city,
    address?.district || form?.district,
    address?.state || form?.state,
    address?.pincode || form?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white min-h-screen pb-36">

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="px-5 pt-5 pb-4">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            Review Booking
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Verify your booking details before completing.
          </p>

          <div className="mt-3 rounded-xl bg-gray-100 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                  <ShieldCheck size={16} className="text-green-600" />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-gray-900">
                    Protected Booking
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Verified worker · Secure booking
                  </p>
                </div>
              </div>

              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-0 py-4">

        {/* FREE BOOKING OFFER */}
        <div className="mx-4 relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
          <div className="absolute right-0 top-0 rounded-bl-xl bg-emerald-600 px-3 py-1.5 text-[10px] font-extrabold text-white">
            100% OFF
          </div>

          <div className="flex items-center gap-2">
            <Tag size={19} className="text-emerald-700" />
            <p className="text-sm font-extrabold text-emerald-900">
              Special Booking Offer
            </p>
          </div>

          <p className="mt-1 text-xs text-emerald-800">
            Your Workkerz booking confirmation charge is waived.
          </p>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-semibold text-gray-400 line-through">
              ₹19
            </span>

            <span className="text-3xl font-black text-emerald-700">
              ₹0
            </span>

            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
              FREE
            </span>
          </div>

          <div className="mt-3 flex justify-between gap-2 border-t border-emerald-100 pt-3 text-xs">
            <span className="text-gray-600">
              Booking confirmation charge
            </span>
            <span className="font-bold text-emerald-700">
              ₹0 · No payment required
            </span>
          </div>

          <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
            This offer applies only to the booking charge.
            Worker/service charges are separate.
          </p>
        </div>

        {/* SERVICE DETAILS */}
        <Card
          title="Service Details"
          icon={<Calendar size={18} />}
          step={1}
          onEdit={onEdit}
        >
          <Item
            icon={<Receipt size={16} />}
            label="Category"
            value={worker?.specialty || worker?.category || "Not Available"}
          />

          <Item
            icon={<Calendar size={16} />}
            label="Date"
            value={form?.date || "Not Selected"}
          />

          <Item
            icon={<Clock3 size={16} />}
            label="Time"
            value={form?.time || "Not Selected"}
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
              value={formatPricingType(pricingType)}
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
                <p className="mt-1 text-sm leading-5 text-gray-900 break-words">
                  {form.description}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* CUSTOMER DETAILS */}
        <Card
          title="Customer Details"
          icon={<UserRound size={18} />}
          step={3}
          onEdit={onEdit}
        >
          <Item
            icon={<UserRound size={16} />}
            label="Name"
            value={form?.name || "Not Provided"}
          />

          <Item
            icon={<Phone size={16} />}
            label="Phone"
            value={form?.phone || "Not Provided"}
          />

          <Item
            icon={<Mail size={16} />}
            label="Email"
            value={form?.email || "Not Provided"}
          />
        </Card>

        {/* SERVICE ADDRESS */}
        <Card
          title="Service Address"
          icon={<Navigation size={18} />}
          step={1}
          onEdit={onEdit}
        >
          <p className="text-sm font-semibold text-gray-900">
            {address?.customer_name || form?.name || "Service Address"}
          </p>

          <p className="mt-1 text-[13px] leading-5 text-gray-600 break-words">
            {bookingAddress || "Address not provided"}
          </p>
        </Card>

        {/* BOOKING NOTES */}
        {form?.notes?.trim() && (
          <Card
            title="Booking Notes"
            icon={<FileText size={18} />}
            step={3}
            onEdit={onEdit}
          >
            <p className="text-sm text-gray-700">{form.notes}</p>
          </Card>
        )}

        {/* PAYMENT SUMMARY */}
        <Card
          title="Payment Summary"
          icon={<Wallet size={18} />}
          step={4}
          onEdit={onEdit}
        >
          <div className="space-y-2">
            <Row
              title="Worker Charge"
              value={`₹${resolvedWorkerCharge.toLocaleString("en-IN")}`}
            />

            <Row
              title="Booking Charge"
              value="₹0"
              green
            />

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm font-bold text-gray-900">
                Worker/Service Total
              </span>

              <span className="text-lg font-extrabold text-gray-900">
                ₹{finalGrandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </Card>

        {/* INFORMATION */}
        <div className="mx-4 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <InfoRow
            icon={<ShieldCheck size={18} />}
            title="Secure Booking"
            subtitle="Your booking details are protected."
          />

          <InfoRow
            icon={<Receipt size={18} />}
            title="Cancellation Policy"
            subtitle="Free cancellation before worker accepts."
          />

          <InfoRow
            icon={<Headphones size={18} />}
            title="Need Help?"
            subtitle="Our support team is available."
            last
          />
        </div>
      </div>

      {/* BOTTOM COMPLETE BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              Worker/Service Amount
            </p>

            <h2 className="text-xl font-extrabold text-gray-900">
              ₹{finalGrandTotal.toLocaleString("en-IN")}
            </h2>

            <p className="text-[10px] font-semibold text-emerald-700">
              Booking charge ₹0 · FREE
            </p>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            disabled={bookingSubmitting}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#59dbff] to-[#19e2ca] px-5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bookingSubmitting ? "Completing..." : "Complete Booking"}
            {!bookingSubmitting && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* CARD */
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
    <div className="mx-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2874F0]/10 text-[#2874F0]">
            {icon}
          </div>

          <h3 className="text-sm font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onEdit(step)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#2874F0]"
        >
          <PencilLine size={14} />
          Edit
        </button>
      </div>

      <div className="p-3.5">{children}</div>
    </div>
  );
}

/* ITEM */
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
    <div className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        {icon}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="text-xs font-medium text-gray-500">
          {label}
        </span>

        <span className="truncate text-right text-sm font-semibold text-gray-900">
          {value}
        </span>
      </div>
    </div>
  );
}

/* ROW */
function Row({
  title,
  value,
  green,
}: {
  title: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-gray-600">{title}</span>

      <span
        className={`text-[13px] font-semibold ${
          green ? "text-emerald-700" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* INFO ROW */
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
    <div className={`flex items-start gap-4 p-4 ${!last ? "border-b" : ""}`}>
      <div className="mt-1 text-green-600">{icon}</div>

      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

/* PRICING TYPE */
function formatPricingType(value: string): string {
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
            .replace(/\b\w/g, (char) => char.toUpperCase())
        : "Not Selected";
  }
}
