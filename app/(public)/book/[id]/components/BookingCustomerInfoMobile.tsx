"use client";

import { User, Phone, Mail, FileText, Info } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export default function BookingCustomerInfoMobile({ form, setForm }: Props) {
  useEffect(() => {
    if (!form.email) return;

    const fetchCustomerName = async () => {
      const { data, error } = await supabase
        .from("customer_addresses")
        .select("customer_name")
        .eq("customer_email", form.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.customer_name) {
        setForm((prev: any) => ({
          ...prev,
          name: data.customer_name,
        }));
      }
    };

    fetchCustomerName();
  }, [form.email, setForm]);
  return (
    <div className="pb-1 space-y-2">
      {/* Header */}

      <div>
        <h2 className="text-[22px] font-bold text-slate-900">
          Contact Details
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Worker will contact you using these details.
        </p>
      </div>

      {/* Card */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Full Name
          </label>

          <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <User className="h-4 w-4 text-[#FF5C39]" />
            </div>

            <input
              type="text"
              value={form.name}
              placeholder="Your name"
              enterKeyHint="done"
              autoCapitalize="words"
              autoCorrect="on"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Mobile Number
          </label>

          <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <Phone className="h-4 w-4 text-[#FF5C39]" />
            </div>

            <span className="mr-2 text-sm font-semibold text-slate-900">
              +91
            </span>

            <input
              type="tel"
              inputMode="numeric"
              enterKeyHint="done"
              maxLength={10}
              value={form.phone}
              placeholder="9876543210"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Email
          </label>

          <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-100 px-3">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200">
              <Mail className="h-4 w-4 text-slate-600" />
            </div>

            <input
              value={form.email}
              readOnly
              className="flex-1 bg-transparent text-sm text-slate-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notes */}

      <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-orange-500" />

          <h3 className="font-semibold text-slate-900">Additional Notes</h3>
        </div>

        <input
          type="text"
          maxLength={200}
          value={form.notes}
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
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
          className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200 px-4 text-[15px] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Info */}

      <div className="rounded-3xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1">
          <div className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1">
            <span className="text-[10px] font-bold text-emerald-700">
              🔒 Secure Contact
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-slate-600">
            Your phone number is shared only with the booked worker for arrival
            updates.
          </p>
        </div>
      </div>
    </div>
  );
}
