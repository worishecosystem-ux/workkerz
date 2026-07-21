"use client";

import { useState, type ChangeEvent } from "react";
import {
  TriangleAlert,
  Upload,
  Mail,
  Phone,
  Send,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function ReportProblemPage() {
  const [issueType, setIssueType] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reportNumber, setReportNumber] = useState("");

  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!issueType) {
      alert("Select issue type");
      return;
    }

    if (!subject.trim()) {
      alert("Enter subject");
      return;
    }

    if (!description.trim()) {
      alert("Enter description");
      return;
    }

    if (!email.trim()) {
      alert("Enter email");
      return;
    }

    try {
      setLoading(true);

      // Generate Report Number
      const generatedReportNumber = `RPT-${Date.now()}`;

      const userEmail = user?.email ?? email;

      const { error } = await supabase.from("reports").insert({
        report_number: generatedReportNumber,
        issue_type: issueType,
        booking_id: bookingId || null,
        subject,
        description,
        email: userEmail,
        phone: phone || null,
        screenshot: screenshot || null,
        priority: "Medium",
        status: "Pending",
      });

      if (error) throw error;

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          title: "Report Submitted",
          message: `Your report ${generatedReportNumber} has been submitted successfully. Our support team will review it shortly.`,
          customer_email: userEmail,
          is_global: false,
          is_read: false,
        });

      if (notificationError) {
        console.error("Notification Error:", notificationError);
      }

      if (notificationError) {
        console.error(notificationError);
      }
      setReportNumber(generatedReportNumber);
      setShowSuccess(true);

      setIssueType("");
      setBookingId("");
      setSubject("");
      setDescription("");
      setEmail("");
      setPhone("");
      setScreenshot("");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  }
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("report-images")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("report-images").getPublicUrl(fileName);

    setScreenshot(publicUrl);
  };
  const copyReportNumber = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(reportNumber);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = reportNumber;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Unable to copy report number.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-linear-to-br from-emerald-700 via-green-600 to-teal-600 text-white">
        <div className="mx-auto max-w-5xl px-5 pt-15 md:px-6 md:py-16 pb-12">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-white"> Support Center</h2>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <TriangleAlert className="h-4 w-4" />
              Report a Problem
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm text-emerald-100 md:text-base">
            Experiencing an issue with a booking, payment, refund or your
            account? Tell us what happened and our support team will review it.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto -mt-8 max-w-4xl px-4 pb-20">
        <div className="rounded-3xl bg-white p-5 shadow-xl md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Issue Type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Issue Type <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  "Booking ",
                  "Refund",
                  "Payment",
                  "Worker",
                  "Material Order",
                  "Account",
                  "Technical Bug",
                  "Other",
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIssueType(type)}
                    className={`flex h-10 w-full items-center gap-2 rounded-xl border px-3 transition-all ${
                      issueType === type
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200 bg-white active:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        issueType === type
                          ? "border-emerald-600"
                          : "border-slate-300"
                      }`}
                    >
                      {issueType === type && (
                        <div className="h-2 w-2 rounded-full bg-emerald-600" />
                      )}
                    </div>

                    <span
                      className={`flex-1 text-left text-xs font-medium leading-tight ${
                        issueType === type
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Booking ID */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Booking ID (Optional)
              </label>

              <input
                type="text"
                value={bookingId}
                onChange={(e) => {
                  let value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");

                  if (value.length > 3) {
                    value = value.slice(0, 3) + "-" + value.slice(3, 9);
                  }

                  setBookingId(value);
                }}
                maxLength={10}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="WKZ-Q9TJS2"
              />
            </div>

            {/* Subject */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Subject *
              </label>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Briefly describe your issue"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Description <span className="text-red-500">*</span>
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Describe your issue..."
                className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-slate-500">Maximum 500 characters</p>

                <span
                  className={`text-xs font-medium ${
                    description.length > 450 ? "text-red-500" : "text-slate-500"
                  }`}
                >
                  {description.length}/500
                </span>
              </div>
            </div>

            {/* Upload */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Screenshot (Optional)
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 transition hover:border-emerald-500 hover:bg-emerald-50">
                {screenshot ? (
                  <img
                    src={screenshot}
                    alt="Screenshot Preview"
                    className="mb-4 h-40 w-full max-w-md rounded-xl border border-slate-200 object-cover shadow-sm"
                  />
                ) : (
                  <>
                    <Upload className="mb-3 h-5 w-5 text-emerald-600" />

                    <p className="font-semibold text-slate-800">
                      Upload Screenshot
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      PNG, JPG or JPEG • Max 5 MB
                    </p>
                  </>
                )}

                {screenshot && (
                  <p className="mb-2 text-sm font-medium text-emerald-600">
                    Tap to change screenshot
                  </p>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Email <span className="text-red-500">*</span>
              </label>

              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value.trim().toLowerCase())
                  }
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Phone <span className="text-slate-400">(Optional)</span>
              </label>

              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />

                <span className="ml-2 text-sm font-medium text-slate-700">
                  +91
                </span>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="9876543210"
                  className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !issueType}
            className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              loading || !issueType
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-emerald-600 text-white active:scale-[0.98] active:bg-emerald-700"
            }`}
          >
            <Send className="h-4 w-4" />

            <span>{loading ? "Submitting..." : "Submit Report"}</span>
          </button>
        </div>

        {/* Help Card */}
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Headphones className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Need Immediate Assistance?
              </h3>

              <p className="text-[11px] text-emerald-100">
                Mon – Sat • 9:00 AM – 6:00 PM
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
              <span className="text-xs text-emerald-100">Email</span>

              <span className="text-xs font-medium">support@workkerz.com</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
              <span className="text-xs text-emerald-100">Support</span>

              <span className="text-xs font-medium">Mon – Sat</span>
            </div>
          </div>
        </div>
      </section>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>

            <h2 className="mt-4 text-center text-lg font-bold">
              Report Submitted
            </h2>

            <p className="mt-2 text-center text-sm text-slate-500">
              Your complaint has been submitted successfully.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Report Number</p>

              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono font-semibold">{reportNumber}</span>

                <button
                  onClick={copyReportNumber}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSuccess(false)}
              className="mt-5 h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
