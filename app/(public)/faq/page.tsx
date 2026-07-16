"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Search,
  HelpCircle,
  Phone,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Briefcase,
  User,
} from "lucide-react";

const faqs = [
  {
    category: "Booking",
    icon: Briefcase,
    question: "How do I book a worker?",
    answer:
      "Choose your required worker, select date & time, add your address and confirm the booking.",
  },
  {
    category: "Booking",
    icon: Briefcase,
    question: "Can I cancel my booking?",
    answer:
      "Yes. You can cancel your booking before the worker starts the work. Cancellation charges may apply.",
  },
  {
    category: "Payment",
    icon: CreditCard,
    question: "Which payment methods are accepted?",
    answer:
      "UPI, Debit Card, Credit Card, Net Banking and Cash (where available).",
  },
  {
    category: "Payment",
    icon: CreditCard,
    question: "When will I get my refund?",
    answer:
      "Eligible refunds are generally processed within 3-7 business days.",
  },
  {
    category: "Account",
    icon: User,
    question: "How do I update my profile?",
    answer:
      "Go to Profile → Edit Profile and update your information.",
  },
  {
    category: "Safety",
    icon: ShieldCheck,
    question: "Are workers verified?",
    answer:
      "Yes. Workers go through identity verification before joining the platform.",
  },
];
export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(() => {
    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}

      <div className="rounded-b-[34px] bg-linear-to-r from-emerald-600 via-green-600 to-teal-600 px-5 pb-8 pt-12 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
            <HelpCircle size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Help Center</h1>
            <p className="text-sm text-emerald-100">
              Find answers instantly
            </p>
          </div>
        </div>

        <div className="relative mt-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-2xl border-0 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-lg outline-none"
          />
        </div>
      </div>

      {/* FAQ */}

      <div className="space-y-3 px-4 py-6">
        {filtered.map((faq, index) => {
          const Icon = faq.icon;
          const active = open === index;

          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpen(active ? null : index)}
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                    <Icon size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-emerald-600 font-medium">
                      {faq.category}
                    </p>

                    <h3 className="font-semibold text-slate-800">
                      {faq.question}
                    </h3>
                  </div>
                </div>

                <ChevronDown
                  size={18}
                  className={`transition ${
                    active ? "rotate-180" : ""
                  }`}
                />
              </button>

              {active && (
                <div className="border-t bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow">
            <HelpCircle
              size={40}
              className="mx-auto mb-3 text-slate-300"
            />

            <h3 className="font-semibold text-slate-700">
              No FAQs Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try searching with another keyword.
            </p>
          </div>
        )}
      </div>

      {/* Contact */}

      <div className="px-4 pb-8">
        <div className="rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-xl">
          <h2 className="text-lg font-bold">
            Still need help?
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            Our support team is available to assist you.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 font-medium text-slate-900">
              <Phone size={18} />
              Call
            </button>

            <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-3 font-medium backdrop-blur">
              <MessageCircle size={18} />
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}