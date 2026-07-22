"use client";

import { useEffect, useState } from "react";
import { MapPin, Home, Building2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AddressSelectorModal, { type AddressItem } from "./AddressSelectorModal";
import AddressFormModal from "./AddressFormModal";
import { useMobileNavbar } from "../context/MobileNavbarContext";
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
  const { setShowMobileNavbar } = useMobileNavbar();
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(
    null,
  );
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(
    null,
  );

  useEffect(() => {
  const show = !(showSelector || showForm);

  setShowMobileNavbar(show);
  onOverlayChange?.(!show);

  return () => setShowMobileNavbar(true);
}, [
  showSelector,
  showForm,
  onOverlayChange,
  setShowMobileNavbar,
]);

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
      <div className="w-full">
        <div className="flex h-10 items-center rounded-lg border border-amber-100 bg-emerald-50 px-2.5 shadow-sm">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-1">
                <div className="h-2 w-28 rounded bg-gray-200 animate-pulse" />
                <div className="h-2 w-20 rounded bg-gray-200 animate-pulse" />
              </div>
            ) : (
              <div
                className="flex items-center gap-1 min-w-0"
                title={`${addressType} • ${customerName}, ${address}`}
              >
                <span className="shrink-0 scale-90">
                  {getAddressIcon(addressType)}
                </span>

                <span className="text-gray-300 text-[10px] shrink-0">•</span>

                <span className="shrink-0 text-[10px] font-semibold text-gray-900 max-w-17.5 truncate">
                  {customerName || "Name"}
                </span>

                <span className="truncate text-[10px] text-gray-500">
                  {address || "Add work location"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSelector(true)}
            className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md active:bg-emerald-100"
          >
            <ChevronDown className="h-3.5 w-3.5 text-emerald-700" />
          </button>
        </div>
      </div>
<AddressSelectorModal
  open={showSelector}
  selected={selectedAddress}
  onClose={() => setShowSelector(false)}
  onSelect={(item) => {
    const fullAddress = [
      item.house_no,
      item.address,
      item.landmark,
      item.city,
      item.district,
      item.state,
      item.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    setSelectedAddress(item);
    setCustomerName(item.customer_name || "");
    setAddress(fullAddress);
    setAddressType(
      (item.address_type as "home" | "office") || "home"
    );

    onAddressChange?.(item);
    setShowSelector(false);
  }}
  onAdd={() => {
    setEditingAddress(null);
    setShowSelector(false);
    setShowForm(true);
  }}
  onEdit={(item) => {
    setEditingAddress(item);
    setShowSelector(false);
    setShowForm(true);
  }}
/>

      <AddressFormModal
        open={showForm}
        editingAddress={editingAddress}
        onBack={() => {
          setShowForm(false);
          setEditingAddress(null);
          setShowSelector(true);
        }}
        onClose={() => {
          setShowForm(false);
          setEditingAddress(null);
        }}
        onSaved={() => {
          setShowForm(false);
          setEditingAddress(null);
          loadUserAddress();
        }}
      />
    </>
  );
}
