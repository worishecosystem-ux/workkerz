"use client";

import {
  User,
  Phone,
  Mail,
  FileText,
  Info,
  Pencil,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export default function BookingCustomerInfoMobile({
  form,
  setForm,
}: Props) {
  const [editingField, setEditingField] = useState<
    "name" | "phone" | null
  >(null);

  const [savingField, setSavingField] = useState<
    "name" | "phone" | null
  >(null);

  /*
   * FETCH PREVIOUS PROFILE
   *
   * Second order:
   * email -> customer_profiles
   * -> previous name + phone
   */
  useEffect(() => {
    if (!form.email) return;

    let cancelled = false;

    const fetchCustomerProfile = async () => {
      const email = String(form.email)
        .trim()
        .toLowerCase();

      if (!email) return;

      const { data, error } = await supabase
        .from("customer_profiles")
        .select("customer_name, customer_phone")
        .eq("customer_email", email)
        .maybeSingle();

      if (cancelled || error || !data) return;

      setForm((prev: any) => ({
        ...prev,
        name: data.customer_name || prev.name || "",
        phone: data.customer_phone
          ? String(data.customer_phone)
              .replace(/\D/g, "")
              .slice(-10)
          : prev.phone || "",
      }));
    };

    fetchCustomerProfile();

    return () => {
      cancelled = true;
    };
  }, [form.email, setForm]);

  /*
   * LOCAL FORM UPDATE
   */
  const updateField = (
    field: "name" | "phone",
    value: string
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * SAVE UPDATED PROFILE
   *
   * Pencil -> edit
   * Check -> update customer_profiles
   */
  const saveField = async (
    field: "name" | "phone"
  ) => {
    if (!form.email) {
      setEditingField(null);
      return;
    }

    const email = String(form.email)
      .trim()
      .toLowerCase();

    setSavingField(field);

    try {
      const updateData =
        field === "name"
          ? {
              customer_name: String(form.name || "").trim(),
            }
          : {
              customer_phone: String(form.phone || "")
                .replace(/\D/g, "")
                .slice(0, 10),
            };

      const { error } = await supabase
        .from("customer_profiles")
        .update(updateData)
        .eq("customer_email", email);

      if (error) {
        console.error(
          "Failed to update customer profile:",
          error
        );
        return;
      }

      setEditingField(null);
    } finally {
      setSavingField(null);
    }
  };

  /*
   * PENCIL / CHECK
   */
  const toggleEdit = (
    field: "name" | "phone"
  ) => {
    if (savingField === field) return;

    if (editingField === field) {
      saveField(field);
      return;
    }

    setEditingField(field);
  };

  return (
    <div className="space-y-3 pb-32">
      {/* HEADER */}
      <div>
        <h2 className="text-[21px] font-bold tracking-tight text-slate-900">
          Contact Details
        </h2>

        <p className="mt-1 text-[13px] text-slate-500">
          Worker will contact you using these details.
        </p>
      </div>

      {/* CONTACT CARD */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* NAME */}
        <div className="border-b border-slate-100 px-4 py-3.5">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-slate-400">
            Full Name
          </label>

          <div
            className={`relative flex h-12 items-center rounded-xl border transition ${
              editingField === "name"
                ? "border-orange-300 bg-white ring-2 ring-orange-500/10"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="ml-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
              <User className="h-4 w-4 text-[#FF5C39]" />
            </div>

            <input
              type="text"
              value={form.name || ""}
              readOnly={editingField !== "name"}
              placeholder="Your name"
              enterKeyHint="done"
              autoCapitalize="words"
              autoCorrect="on"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();

                  if (editingField === "name") {
                    saveField("name");
                  }
                }
              }}
              onChange={(e) =>
                updateField("name", e.target.value)
              }
              className={`h-full min-w-0 flex-1 bg-transparent px-3 pr-11 text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400 ${
                editingField !== "name"
                  ? "cursor-default"
                  : ""
              }`}
            />

            <button
              type="button"
              disabled={savingField === "name"}
              onClick={() => toggleEdit("name")}
              className={`absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg transition ${
                editingField === "name"
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-slate-400 hover:bg-orange-50 hover:text-orange-500"
              }`}
              aria-label={
                editingField === "name"
                  ? "Save name"
                  : "Edit name"
              }
            >
              {savingField === "name" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" />
              ) : editingField === "name" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Pencil className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* PHONE */}
        <div className="border-b border-slate-100 px-4 py-3.5">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-slate-400">
            Mobile Number
          </label>

          <div
            className={`relative flex h-12 items-center rounded-xl border transition ${
              editingField === "phone"
                ? "border-orange-300 bg-white ring-2 ring-orange-500/10"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="ml-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
              <Phone className="h-4 w-4 text-[#FF5C39]" />
            </div>

            <span className="ml-3 text-[13px] font-bold text-slate-700">
              +91
            </span>

            <input
              type="tel"
              inputMode="numeric"
              enterKeyHint="done"
              maxLength={10}
              value={form.phone || ""}
              readOnly={editingField !== "phone"}
              placeholder="9876543210"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();

                  if (editingField === "phone") {
                    saveField("phone");
                  }
                }
              }}
              onChange={(e) =>
                updateField(
                  "phone",
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
              className={`h-full min-w-0 flex-1 bg-transparent px-2 pr-11 text-[14px] font-medium tracking-wide text-slate-900 outline-none placeholder:text-slate-400 ${
                editingField !== "phone"
                  ? "cursor-default"
                  : ""
              }`}
            />

            <button
              type="button"
              disabled={savingField === "phone"}
              onClick={() => toggleEdit("phone")}
              className={`absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg transition ${
                editingField === "phone"
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-slate-400 hover:bg-orange-50 hover:text-orange-500"
              }`}
              aria-label={
                editingField === "phone"
                  ? "Save phone"
                  : "Edit phone"
              }
            >
              {savingField === "phone" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" />
              ) : editingField === "phone" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Pencil className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* EMAIL */}
        <div className="px-4 py-3.5">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.07em] text-slate-400">
            Email
          </label>

          <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-100">
            <div className="ml-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200">
              <Mail className="h-4 w-4 text-slate-500" />
            </div>

            <input
              value={form.email || ""}
              readOnly
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-[13px] font-medium text-slate-500 outline-none"
            />
          </div>

          <p className="mt-1.5 px-1 text-[10px] text-slate-400">
            Email is linked to your account and cannot be changed.
          </p>
        </div>
      </div>

      {/* NOTES */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
            <FileText className="h-4 w-4 text-[#FF5C39]" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Additional Notes
            </h3>

            <p className="text-[10px] text-slate-400">
              Anything important for the worker
            </p>
          </div>
        </div>

        <input
          type="text"
          maxLength={200}
          value={form.notes || ""}
          placeholder="Tell the worker anything important..."
          enterKeyHint="done"
          autoCapitalize="sentences"
          autoCorrect="on"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
        />
      </div>

      {/* SECURITY INFO */}
      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <Info className="h-4 w-4 text-blue-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1">
            <span className="text-[9px] font-bold text-emerald-700">
              🔒 Secure Contact
            </span>
          </div>

          <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
            Your phone number is shared only with the booked worker for
            arrival updates.
          </p>
        </div>
      </div>
    </div>
  );
}