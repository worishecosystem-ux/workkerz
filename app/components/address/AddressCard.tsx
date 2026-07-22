"use client";

import { useEffect, useState } from "react";
import { MapPin, Home, Building2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AddressSelectorModal, { type AddressItem } from "./AddressSelectorModal";
import AddressFormModal from "./AddressFormModal";
const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home className="w-4 h-4 text-orange-500" />;
    case "office":
      return <Building2 className="w-4 h-4 text-blue-500" />;
  }
};
interface AddressCardProps {
  onAddressChange?: (address: AddressItem | null) => void;
  onOverlayChange?: (open: boolean) => void;
}

export default function AddressCard({
  onAddressChange,
  onOverlayChange,
}: AddressCardProps) {
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [addressType, setAddressType] = useState<"home" | "office">("home");
  const [showSelector, setShowSelector] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(
    null,
  );
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(
    null,
  );

  useEffect(() => {
    onOverlayChange?.(showSelector || showForm);
  }, [showSelector, showForm, onOverlayChange]);

  useEffect(() => {
    loadUserAddress();
  }, []);

  async function loadUserAddress() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setAddress("Add work location");
        return;
      }

      const { data: booking, error } = await supabase
        .from("customer_addresses")
        .select(
          `
          customer_name,
          house_no,
          address,
          landmark,
          city,
          district,
          state,
          pincode,
          address_type
        `,
        )
        .select("*")
        .eq("customer_email", user.email)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !booking) {
        setAddress("Add work location");
        return;
      }

      const fullAddress = [
        booking.house_no,
        booking.address,
        booking.landmark,
        booking.city,
        booking.district,
        booking.state,
        booking.pincode,
      ]
        .filter(Boolean)
        .join(", ");

      setCustomerName(booking.customer_name || "");
      setAddress(fullAddress);
      setAddressType((booking.address_type as "home" | "office") || "home");
      setSelectedAddress(booking);
      onAddressChange?.(booking);
    } catch (e) {
      console.error(e);
      setAddress("Add work location");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
     <div className="bg-emerald-50 rounded-[12px] border border-amber-100 shadow-sm px-3 py-2.5 flex items-center">
  <div className="flex-1 min-w-0">
    {loading ? (
      <div className="space-y-1">
        <div className="h-2 w-52 rounded bg-gray-200 animate-pulse" />
        <div className="h-2 w-36 rounded bg-gray-200 animate-pulse" />
      </div>
    ) : (
      <div
        className="flex items-center gap-1 min-w-0"
        title={`${addressType} • ${customerName}, ${address}`}
      >
        <span className="shrink-0">
          {getAddressIcon(addressType)}
        </span>

        <span className="shrink-0 text-gray-400">•</span>

        <span className="shrink-0 font-semibold text-gray-900 text-[12px]">
          {customerName || "Name"}
        </span>

        <span className="truncate text-[12px] text-gray-500">
          {address ? `, ${address}` : ""}
        </span>
      </div>
    )}
  </div>

  <button
    onClick={() => setShowSelector(true)}
    className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-100"
  >
    <ChevronDown className="h-5 w-5" />
  </button>
</div>
    </>
  );
}
