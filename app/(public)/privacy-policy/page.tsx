import chapters from "./data";
import PrivacyAccordion from "./components/PrivacyAccordion";
import { ShieldCheck } from "lucide-react";
export const metadata = {
  title: "Privacy Policy | Workkerz",
  description:
    "Privacy Policy of Workkerz and E-Aurix operated by Worish Ecosystem Private Limited.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex h-screen flex-col bg-slate-50">
      {/* Fixed / Sticky Header */}
      <header className="sticky top-0 z-50 bg-linear-to-r from-emerald-600 to-green-600 px-4 py-5 text-white shadow-md md:px-8 md:py-10">
        <div className="flex items-center gap-3 pt-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white md:text-2xl">
              Privacy Policy
            </h1>

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />

            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-emerald-50 backdrop-blur">
              WORKKERZ &amp; E-Aurix
            </span>
          </div>
        </div>

        <p className="mt-1 text-xs text-emerald-200 md:text-base">
          Owned and Operated by Worish Ecosystem Private Limited
        </p>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <article className="mx-auto w-full max-w-5xl bg-white px-4 py-6 md:rounded-3xl md:border md:border-slate-200 md:px-8 md:py-10 md:shadow-sm">
          <PrivacyAccordion chapters={chapters} />
        </article>
      </div>
    </main>
  );
}
