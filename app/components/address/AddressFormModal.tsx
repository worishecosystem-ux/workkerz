"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { App } from "@capacitor/app";
import type { AddressItem } from "./AddressSelectorModal";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

interface Props {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onSaved: () => void;
  editingAddress?: AddressItem | null;
}

export default function AddressFormModal({
  open,
  onClose,
  onSaved,
  onBack,
  editingAddress,
}: Props) {
  const [saving, setSaving] = useState(false);

  const [houseNo, setHouseNo] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");

  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [customerName, setCustomerName] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState<"home" | "office" | "other">(
    "home",
  );
  const [keyboardVisible, setKeyboardVisible] = useState(false);


  useEffect(() => {
    if (!open) return;

    if (editingAddress) {
      setCustomerName(editingAddress.customer_name || "");
      setHouseNo(editingAddress.house_no || "");
      setAddress(editingAddress.address || "");
      setLandmark(editingAddress.landmark || "");

      setCity(editingAddress.city || "");
      setDistrict(editingAddress.district || "");
      setState(editingAddress.state || "");
      setCountry(editingAddress.country || "India");

      setPincode(editingAddress.pincode || "");

      setAddressType(editingAddress.address_type);
    } else {
      resetForm();
    }
  }, [editingAddress, open]);



  function resetForm() {
    setCustomerName("");
    setHouseNo("");
    setAddress("");
    setLandmark("");

    setCity("");
    setDistrict("");
    setState("");
    setCountry("India");

    setPincode("");

    setAddressType("home");
  }

  async function fetchPincode(pin: string) {
    if (pin.length !== 6) return;

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);

      const json = await res.json();

      if (json[0]?.Status === "Success" && json[0]?.PostOffice?.length) {
        const office = json[0].PostOffice[0];

        setCity(office.Block || office.Name || "");
        setDistrict(office.District || "");
        setState(office.State || "");
        setCountry(office.Country || "India");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function saveAddress() {
    console.log("editingAddress:", editingAddress);
    console.log("source:", editingAddress?.source);
    console.log("id:", editingAddress?.id);
    if (!customerName || !houseNo || !address || !pincode) {
      alert("Please fill all required fields.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        alert("Please login first");
        return;
      }

      const payload = {
        customer_email: user.email,
        customer_name: customerName,
        house_no: houseNo,
        address,
        landmark,

        city,
        district,
        state,
        country,

        pincode,

        address_type: addressType,
      };

      // Update existing address
      if (editingAddress) {
        console.log("UPDATE MODE", editingAddress.id);

        const { data, error } = await supabase
          .from("customer_addresses")
          .update(payload)
          .eq("id", editingAddress.id)
          .select();

        if (error) throw error;

        console.log("Updated:", data);

        onSaved();
        onClose();
        resetForm();
        return; // <-- IMPORTANT
      }

      // Insert new address
      console.log("INSERT MODE");

      const { data: existing } = await supabase
        .from("customer_addresses")
        .select("id")
        .eq("customer_email", user.email);

      const { error } = await supabase.from("customer_addresses").insert({
        ...payload,
        is_default: !existing?.length,
      });

      if (error) throw error;

      onSaved();
      onClose();
      resetForm();
    } catch (err) {
      console.error(err);

      alert("Unable to save address.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      data-modal-open="true"
      className="fixed inset-0 z-999 bg-black/40 flex items-end justify-center"
    >
      <div className="w-full max-w-md bg-white rounded-t-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-base font-semibold">
              {editingAddress ? "Edit Address" : "Add Work Address"}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Address Type */}
          <div>
            <div className="rounded-xl bg-gray-100 p-1">
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { value: "home", label: "Home", icon: "🏠" },
                    { value: "office", label: "Office", icon: "🏢" },
                    { value: "other", label: "Other", icon: "📍" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAddressType(item.value)}
                    className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      addressType === item.value
                        ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-200"
                        : "text-gray-600 hover:bg-white/70"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">
              Full Name
            </label>

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter full name"
              className="mt-1 h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {/* House */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              House / Flat No
            </label>

            <input
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Street / Area
            </label>

            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Landmark + Pincode */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700">
                Landmark
              </label>

              <input
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border px-3 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">
                Pincode
              </label>

              <input
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  const pin = e.target.value.replace(/\D/g, "");
                  setPincode(pin);

                  if (pin.length === 6) fetchPincode(pin);
                }}
                className="mt-1 h-10 w-full rounded-lg border px-3 text-sm"
              />
            </div>
          </div>

          {/* Auto Filled */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-500">City</label>
              <input
                readOnly
                value={city}
                className="mt-1 h-9 w-full rounded-lg border bg-gray-100 px-3 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500">District</label>
              <input
                readOnly
                value={district}
                className="mt-1 h-9 w-full rounded-lg border bg-gray-100 px-3 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500">State</label>
              <input
                readOnly
                value={state}
                className="mt-1 h-9 w-full rounded-lg border bg-gray-100 px-3 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500">Country</label>
              <input
                readOnly
                value={country}
                className="mt-1 h-9 w-full rounded-lg border bg-gray-100 px-3 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        {!keyboardVisible && (
          <div className="sticky bottom-0 bg-white border-t p-3 flex gap-2">
            <button
              onClick={saveAddress}
              disabled={saving}
              className="flex-1 h-11 rounded-xl border border-orange-200 bg-linear-to-b from-orange-50 to-orange-100 text-orange-700 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md hover:border-orange-300 active:scale-[0.98] disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingAddress
                  ? "Update Address"
                  : "Save Address"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
