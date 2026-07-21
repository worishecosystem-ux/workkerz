"use client";

import { FileText, ShieldCheck } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function TermsPage() {
  const [open, setOpen] = useState<number | null>(0);
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        "By accessing or using Workkerz, you agree to comply with these Terms & Conditions. If you do not agree, please do not use our platform.",
    },
    {
      title: "2. About Workkerz",
      content:
        "Workkerz is a digital platform that connects customers with skilled workers and service providers. Workkerz acts only as a technology platform and is not the employer of any worker.",
    },
    {
      title: "3. Eligibility",
      content:
        "You must be at least 18 years old or have legal permission to use the platform. You agree to provide accurate and complete information while creating your account.",
    },
    {
      title: "4. User Accounts",
      content:
        "Users are responsible for maintaining the confidentiality of their account credentials. Any activity performed using your account is your responsibility.",
    },
    {
      title: "5. Booking Services",
      content:
        "Customers may book workers through the platform. Bookings are subject to worker availability, location, pricing, and confirmation.",
    },
    {
      title: "6. Worker Responsibilities",
      content:
        "Workers are responsible for providing services professionally, honestly, and in accordance with applicable laws. Workkerz is not responsible for the quality of services provided by workers.",
    },
    {
      title: "7. Payments",
      content:
        "Payments may be collected online or through supported payment methods. Applicable taxes, platform fees, or convenience charges may apply.",
    },
    {
      title: "8. Cancellation & Refund",
      content:
        "Cancellation and refund eligibility depends on the service type, booking status, and applicable cancellation policy displayed during booking.",
    },
    {
      title: "9. Marketplace Purchases",
      content:
        "Products listed by sellers on Workkerz are their responsibility. Product quality, warranties, and delivery timelines may vary depending on the seller.",
    },
    {
      title: "10. Prohibited Activities",
      content:
        "Users must not misuse the platform, commit fraud, upload illegal content, impersonate others, interfere with platform operations, or violate any applicable law.",
    },
    {
      title: "11. Intellectual Property",
      content:
        "All logos, branding, graphics, software, content, and platform designs belong to Workkerz or their respective owners and are protected by applicable intellectual property laws.",
    },
    {
      title: "12. Privacy",
      content:
        "Your use of Workkerz is also governed by our Privacy Policy, which explains how personal information is collected, used, and protected.",
    },
    {
      title: "13. Limitation of Liability",
      content:
        "Workkerz shall not be liable for indirect, incidental, special, or consequential damages arising from the use of the platform or services provided by independent workers.",
    },
    {
      title: "14. Suspension or Termination",
      content:
        "We may suspend or terminate any account that violates these Terms or applicable laws without prior notice.",
    },
    {
      title: "15. Third-Party Services",
      content:
        "The platform may integrate third-party services including payment gateways, maps, messaging, and authentication providers. Their respective terms also apply.",
    },
    {
      title: "16. Changes to Terms",
      content:
        "Workkerz may update these Terms at any time. Continued use of the platform after changes indicates acceptance of the revised Terms.",
    },
    {
      title: "17. Governing Law",
      content:
        "These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in India.",
    },
    {
      title: "18. Contact",
      content:
        "For questions regarding these Terms & Conditions, please contact the Workkerz support team through the Contact Us page or official support email.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-600 pt-14 px-4">
        <div className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-white">Terms & Conditions</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur text-gray-300">
              <FileText className="h-4 w-4" />
              Trust & Transparency
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-emerald-50">
            Please read these Terms carefully before using Workkerz.
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
                  01 July 2026
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Active
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-3 py-5">
        <div className="space-y-2">
          {sections.map((section, index) => {
            const isOpen = open === index;

            return (
              <div
                key={section.title}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition active:bg-slate-50"
                >
                  <h2 className="pr-3 text-sm font-semibold text-slate-900">
                    {section.title}
                  </h2>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <p className="text-sm leading-6 text-slate-600">
                      {section.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-semibold text-emerald-800">
            Acknowledgement
          </h3>

          <p className="mt-2 text-sm leading-6 text-emerald-700">
            By using Workkerz, you acknowledge that you have read, understood,
            and agreed to these Terms & Conditions.
          </p>
        </div>
      </section>
    </main>
  );
}
