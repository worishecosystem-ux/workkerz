import {
  ShieldCheck,
  Wallet,
  Clock3,
  Ban,
  CircleCheck,
  Mail,
  Phone,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    icon: Wallet,
    title: "Service Bookings",
    color: "text-emerald-600",
    points: [
      "Full refund if Workkerz cancels the booking.",
      "Refund available if the worker does not arrive.",
      "Duplicate payments are automatically refunded.",
      "Eligible cancellations are processed according to this policy.",
    ],
  },
  {
    icon: CircleCheck,
    title: "Marketplace Orders",
    color: "text-blue-600",
    points: [
      "Wrong or damaged product received.",
      "Item missing from the order.",
      "Order cancelled before dispatch.",
      "Approved returns are refunded after inspection.",
    ],
  },
  {
    icon: Ban,
    title: "Non-Refundable",
    color: "text-red-600",
    points: [
      "Completed services.",
      "Customer no-show.",
      "Custom or special orders.",
      "Fraudulent refund requests.",
    ],
  },
];

const faq = [
  {
    q: "How long does a refund take?",
    a: "Approved refunds are generally credited within 3–7 business days depending on your payment provider.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. Cancellation eligibility depends on the booking status and timing.",
  },
  {
    q: "How do I request a refund?",
    a: "Open the booking or order details and contact Workkerz Support with your issue.",
  },
  {
    q: "Will payment gateway charges be refunded?",
    a: "Applicable payment gateway deductions may apply depending on the transaction.",
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="fixed inset-x-0 top-0 z-50 overflow-hidden bg-linear-to-br from-emerald-800 via-green-700 to-teal-700 px-4 pt-15 text-white shadow-lg">
        <div className="pb-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-white">Refund Policy</h2>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Trust & Transparency
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-emerald-50">
            Learn when you're eligible for a refund and how the refund process
            works for bookings and marketplace orders.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Last Updated
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  17 July 2026
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Active
            </span>
          </div>
        </div>
      </section>

      {/* Quick Cards */}
      <section className=" px-4 mt-65">
        <div className="grid gap-6 lg:grid-cols-3">
          {sections.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-2xl"
              >
                {/* Top Accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-green-500 to-teal-500" />

                {/* Badge */}
                <div className="gap-2 mb-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
                  <Icon className="h-4 w-4" /> Refund Coverage
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-slate-900">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review the refund conditions applicable to this category.
                </p>

                {/* Divider */}
                <div className="my-6 h-px bg-slate-100" />

                {/* Points */}
                <ul className="space-y-4">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                      </div>

                      <span className="text-sm leading-6 text-slate-600">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className=" mt-8  px-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm md:p-10">
          <h2 className="text-xl font-bold md:text-3xl">Refund Process</h2>

          {/* Mobile */}
          <div className="mt-8 md:hidden">
            {[
              "Request Submitted",
              "Verification",
              "Approved",
              "Refund Completed",
            ].map((step, index, arr) => (
              <div key={step} className="relative flex gap-5 pb-6 last:pb-0">
                {/* Timeline */}
                <div className="relative flex w-12 justify-center">
                  {index !== arr.length - 1 && (
                    <div className="absolute top-14 bottom-0 w-0.5 rounded-full bg-linear-to-b from-emerald-500 via-emerald-300 to-transparent" />
                  )}

                  <div className="z-10 mt-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-emerald-600 to-green-500 text-sm font-bold text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)]">
                    {index + 1}
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1">
                  <div className="rounded-2xl border border-white/60 bg-white/80 px-6 py-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                        Step
                      </span>
                      <h3 className="text-base font-semibold text-slate-900">
                        {step}
                      </h3>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Complete this stage to continue to the next step.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-green-50 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
                <Clock3 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                  Processing Time
                </p>
                <p className="text-sm font-bold text-slate-900">
                  3–7 Business Days
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="mx-auto mt-10 max-w-5xl px-6">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <h2 className="text-3xl font-bold">Refund Eligibility Guidelines</h2>

          <div className="mt-8 space-y-6 text-slate-600 leading-8">
            <p>
              Refund requests must be submitted within the applicable period
              after the booking or purchase. Requests are reviewed by our
              support team before approval.
            </p>

            <p>
              If a worker fails to arrive or Workkerz cancels a confirmed
              booking, eligible customers may receive a full refund.
            </p>

            <p>
              Marketplace refunds are subject to verification of the returned
              product and applicable return conditions.
            </p>

            <p>
              Workkerz reserves the right to reject fraudulent, abusive or
              duplicate refund requests.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-5xl px-6">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>

          <div className="mt-8 divide-y">
            {faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {item.q}

                  <ChevronRight className="transition group-open:rotate-90" />
                </summary>

                <p className="mt-4 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto mt-10 mb-16 max-w-5xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-linear-to-r from-emerald-600 to-green-600 p-5 shadow-xl sm:rounded-3xl sm:p-10">
          <h2 className="text-xl font-bold text-white sm:text-3xl">
            Need Help With a Refund?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100 sm:mt-3 sm:text-base">
            If you have questions about refunds or need assistance with a
            booking or order, our support team is here to help.
          </p>

          <div className="mt-5 space-y-3 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            {/* Email */}
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-md sm:rounded-2xl sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ">
                <Mail className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-emerald-100">
                  Email
                </p>

                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  support@workkerz.com
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-md sm:rounded-2xl sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Phone className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-100">
                  Support
                </p>

                <p className="text-sm font-semibold text-white sm:text-base">
                  Mon – Sat
                </p>

                <p className="text-xs text-emerald-100">9:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
