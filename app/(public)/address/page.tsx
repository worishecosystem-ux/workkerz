"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  Home,
  Building2,
  Landmark,
  Globe2,
  Pencil,
  Trash2,
  BadgeCheck,
  Plus,
} from "lucide-react";
import AddressFormModal from "@/app/components/address/AddressFormModal";
import type { AddressItem } from "@/app/components/address/AddressSelectorModal";
interface Address {
  id: string;
  customer_email: string;
  customer_name: string | null;
  house_no: string | null;
  address: string;
  landmark: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  address_type: "home" | "office" | "other";
  is_default: boolean;
  created_at: string;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(
    null,
  );
  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_email", user.email)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setAddresses(data || []);
    }

    setLoading(false);
  }
  async function deleteAddress(id: string) {
    if (!confirm("Delete this address?")) return;

    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchAddresses();
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-100 via-slate-50 to-white">
      <AddressFormModal
        open={formOpen}
        editingAddress={editingAddress}
        onBack={() => setFormOpen(false)}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          fetchAddresses();
          setFormOpen(false);
          setEditingAddress(null);
        }}
      />
      {/* Header */}
      <div className="sticky  pt-13 top-0 z-20 border-b border-slate-200 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-white">Saved Addresses</h1>
            <p className="text-xs text-gray-200">
              Manage your delivery locations
            </p>
          </div>

          <button
            onClick={() => {
              setEditingAddress(null);
              setFormOpen(true);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg transition active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-5">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <MapPin className="h-10 w-10 text-emerald-600" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              No Saved Address
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Save your home or work address for faster checkout.
            </p>

            <button
              onClick={() => {
                setEditingAddress(null);
                setFormOpen(true);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-medium text-white"
            >
              <Plus size={18} />
              Add New Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex gap-3">
                  {/* Address Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.customer_name || "Customer"}
                      </h3>

                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {item.address_type || "Home"}
                      </span>

                      {item.is_default && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <BadgeCheck className="h-3 w-3" />
                          Default
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <Home className="mt-0.5 h-3.5 w-3.5 text-indigo-500" />
                        <span>
                          {[item.house_no, item.address]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>

                      {item.landmark && (
                        <div className="flex items-start gap-2">
                          <Landmark className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
                          <span>{item.landmark}</span>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 h-3.5 w-3.5 text-violet-500" />
                        <span>
                          {[item.city, item.district, item.state]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <Globe2 className="mt-0.5 h-3.5 w-3.5 text-cyan-500" />
                        <span>
                          {item.country} • {item.pincode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAddress({
                        ...item,
                        source: "customer",
                      } as AddressItem);

                      setFormOpen(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2 text-xs font-semibold text-blue-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteAddress(item.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && addresses.length > 0 && (
        <button
          onClick={() => {
            setEditingAddress(null);
            setFormOpen(true);
          }}
          className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
