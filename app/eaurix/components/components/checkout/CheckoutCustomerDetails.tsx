"use client";

import { useEffect, useState } from "react";
import { User, Phone, Mail, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BookingAddressCard from "@/app/(public)/book/[id]/components/BookingAddressCard";

type Props = {
  form: any;
  update: (field: string, value: string) => void;
  inp: string;
  selectedAddress: any;
  loadingAddress: boolean;
  onAddressClick: () => void;
};

export default function CheckoutCustomerDetails({
  form,
  update,
  inp,
  selectedAddress,
  loadingAddress,
  onAddressClick,
}: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const handleInputClick = (field: string) => {
    setEditingField(field);
  };

  const isEditing = (field: string) => editingField === field;

  useEffect(() => {
    const fetchPreviousOrder = async () => {
      if (!form.email) return;

      // Agar already form mein data hai to database se overwrite mat karo
      if (form.name && form.phone) return;

      try {
        setLoadingCustomer(true);

        const { data, error } = await supabase
          .from("orders")
          .select("customer_name, customer_phone, created_at")
          .eq("customer_email", form.email)
          .not("customer_name", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Previous order fetch error:", error);
          return;
        }

        if (!data) return;

        if (!form.name && data.customer_name) {
          update("name", data.customer_name);
        }

        if (!form.phone && data.customer_phone) {
          update("phone", data.customer_phone);
        }
      } catch (error) {
        console.error("Customer data fetch error:", error);
      } finally {
        setLoadingCustomer(false);
      }
    };

    fetchPreviousOrder();
  }, [form.email]);

  return (
    <div className="flex flex-col gap-5">
      {/* HEADER */}
      <div className="mb-2">
        <h3 className="text-base font-bold text-slate-900">
          Contact Details
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Used for booking updates & delivery.
        </p>
      </div>

      {/* USER DETAILS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* NAME */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Full Name *
          </label>

          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={form.name || ""}
              readOnly={!isEditing("name")}
              onClick={() => handleInputClick("name")}
              onChange={(e) => update("name", e.target.value)}
              placeholder={
                loadingCustomer ? "Fetching name..." : "Enter your full name"
              }
              className={`${inp} w-full pl-10 pr-10 ${
                !isEditing("name")
                  ? "cursor-pointer bg-slate-50"
                  : "bg-white"
              }`}
            />

            <button
              type="button"
              onClick={() => handleInputClick("name")}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Edit name"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* MOBILE */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Mobile Number *
          </label>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="tel"
              value={form.phone || ""}
              readOnly={!isEditing("phone")}
              onClick={() => handleInputClick("phone")}
              onChange={(e) => update("phone", e.target.value)}
              placeholder={
                loadingCustomer ? "Fetching mobile..." : "+91 9876543210"
              }
              className={`${inp} w-full pl-10 pr-10 ${
                !isEditing("phone")
                  ? "cursor-pointer bg-slate-50"
                  : "bg-white"
              }`}
            />

            <button
              type="button"
              onClick={() => handleInputClick("phone")}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Edit mobile number"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* EMAIL */}
      <div className="mt-2">
        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
          Email Address
        </label>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="email"
            value={form.email || ""}
            readOnly
            className={`${inp} w-full cursor-not-allowed bg-slate-50 pl-10`}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          Email is linked to your account and cannot be changed here.
        </p>
      </div>

      {/* ADDRESS */}
      <BookingAddressCard
        address={selectedAddress}
        loading={loadingAddress}
        onChange={onAddressClick}
        onAdd={onAddressClick}
      />
    </div>
  );
}