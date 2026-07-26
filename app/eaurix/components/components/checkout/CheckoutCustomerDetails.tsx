"use client";
import { useState } from "react";
import { User, Phone, Mail, MapPin } from "lucide-react";
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      {/* USER DETAILS */}
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Contact Details
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Used for booking updates & delivery.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          {isEditingProfile ? "Done" : "Edit"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* NAME */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={form.name}
              readOnly={!isEditingProfile}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter your full name"
              className={`${inp} pl-10 ${
                !isEditingProfile ? "bg-slate-50 cursor-default" : "bg-white"
              }`}
            />
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
              value={form.phone}
              readOnly={!isEditingProfile}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 9876543210"
              className={`${inp} pl-10 ${
                !isEditingProfile ? "bg-slate-50 cursor-default" : "bg-white"
              }`}
            />
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
            value={form.email}
            readOnly
            className={`${inp} pl-10 bg-slate-50 cursor-not-allowed`}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          Email is linked to your account and cannot be changed here.
        </p>
      </div>

      <BookingAddressCard
        address={selectedAddress}
        loading={loadingAddress}
        onChange={onAddressClick}
        onAdd={onAddressClick}
      />
    </div>
  );
}
