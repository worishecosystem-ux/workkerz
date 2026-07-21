"use client";

import {
  X,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  Shield,
  FileText,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Info,
  LucideIcon,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function SupportSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open) return null;

  const callSupport = () => {
    window.location.href = "tel:+917000543603";
  };

  const whatsappSupport = () => {
    window.open(
      "https://wa.me/917000543603?text=Hello%20Workkerz%20Support",
      "_blank",
    );
  };

  const emailSupport = () => {
    window.location.href =
      "mailto:support@workkerz.com?subject=Support Request";
  };

  const openFAQ = () => {
    router.push("/faq");
  };

  const reportProblem = () => {
    router.push("/ReportProblem");
  };

  

  const privacyPolicy = () => {
    router.push("/privacy-policy");
  };

  const terms = () => {
    router.push("/terms");
  };

  const appVersion = () => {
  router.push("/version");
};

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm "
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white shadow-2xl">
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-slate-300" />

        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-bold">Support Center</h2>
            <p className="text-sm text-slate-500">We're here to help</p>
          </div>

          <button onClick={onClose} className="rounded-full bg-slate-100 p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto px-5 pb-8 mb-15">
          <SupportItem
            icon={Phone}
            title="Call Support"
            onClick={callSupport}
          />

          <SupportItem
            icon={MessageCircle}
            title="WhatsApp Support"
            onClick={whatsappSupport}
          />

          <SupportItem
            icon={Mail}
            title="Email Support"
            onClick={emailSupport}
          />

          <SupportItem
            icon={HelpCircle}
            title="Frequently Asked Questions"
            onClick={openFAQ}
          />

          <SupportItem
            icon={AlertTriangle}
            title="Report a Problem"
            onClick={reportProblem}
          />

          <SupportItem
            icon={Shield}
            title="Privacy Policy"
            onClick={privacyPolicy}
          />

          <SupportItem
            icon={FileText}
            title="Terms & Conditions"
            onClick={terms}
          />

          <SupportItem
            icon={Info}
            title="App Version 1.0.0"
            onClick={appVersion}
          />

          <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
            <p className="font-medium text-sm text-emerald-700">Live Chat</p>

            <p className="mt-1 text-xs text-emerald-600">Coming Soon</p>
          </div>
        </div>
      </div>
    </>
  );
}

function SupportItem({
  icon: Icon,
  title,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg active:scale-[0.98]"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-linear-to-r from-emerald-50/0 via-emerald-50/40 to-emerald-50/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-green-600 shadow-md">
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div className="text-left">
          <h3 className="text-sm font-semibold text-slate-900">
            {title}
          </h3>
        </div>
      </div>

      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition-all duration-200 group-hover:bg-emerald-100">
        <ChevronRight className="h-4 w-4 text-slate-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-600" />
      </div>
    </button>
  );
}
