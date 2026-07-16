"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Check,
  MoreVertical,
  Home,
  Building2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface AddressItem {
  id: string;
  source: "customer" | "booking";

  customer_email: string;
  customer_name: string;
  house_no: string;
  address: string;
  landmark: string;

  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;

  address_type: "home" | "office" | "other";

  is_default: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;

  onSelect: (address: AddressItem) => void;

  onAdd: () => void;

  onEdit: (address: AddressItem) => void;
}

export default function AddressSelectorModal({
  open,
  onClose,
  onSelect,
  onAdd,
  onEdit,
}: Props) {
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    if (open) {
      loadAddresses();
    }
  }, [open]);

  async function loadAddresses() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setLoading(false);
        return;
      }

      // Saved Addresses
      const { data: savedAddresses } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_email", user.email)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      // Recent Booking Addresses
      const { data: bookingAddresses } = await supabase
        .from("bookings")
        .select(
          `
        id,
        customer_name,
        house_no,
        address,
        landmark,
        city,
        district,
        state,
        country,
        pincode,
        address_type,
        created_at
      `,
        )
        .eq("customer_email", user.email)
        .not("address", "is", null)
        .order("created_at", { ascending: false });
      if (bookingAddresses?.length) {
        setCustomerName(bookingAddresses[0].customer_name ?? "");
      } else {
        setCustomerName(user.email.split("@")[0]);
      }

      const map = new Map<string, AddressItem>();

      // Saved addresses first
      (savedAddresses || []).forEach((item: any) => {
        map.set(item.id, {
          ...item,
          customer_name: item.customer_name || "",
          source: "customer",
        });
      });

      // Booking addresses (avoid duplicates)
      (bookingAddresses || []).forEach((item: any) => {
        const key = [
          item.house_no,
          item.address,
          item.landmark,
          item.city,
          item.district,
          item.state,
          item.pincode,
        ]
          .filter(Boolean)
          .join("|");

        const alreadyExists = [...map.values()].some((a) => {
          const compare = [
            a.house_no,
            a.address,
            a.landmark,
            a.city,
            a.district,
            a.state,
            a.pincode,
          ]
            .filter(Boolean)
            .join("|");

          return compare === key;
        });

        if (!alreadyExists) {
          map.set(`booking-${item.id}`, {
            id: `booking-${item.id}`,
            source: "booking",
            customer_email: user.email!,
            customer_name: item.customer_name || "",
            house_no: item.house_no || "",
            address: item.address || "",
            landmark: item.landmark || "",

            city: item.city || "",
            district: item.district || "",
            state: item.state || "",
            country: item.country || "India",
            pincode: item.pincode || "",

            address_type: (item.address_type ?? "home") as
              | "home"
              | "office"
              | "other",

            is_default: false,
          });
        }
      });

      const list = [...map.values()];

      setAddresses(list);

      // Select default address automatically
      setSelectedAddressId((prev) => {
        // Keep current selection if it still exists
        if (prev && list.some((a) => a.id === prev)) {
          return prev;
        }

        const defaultAddress = list.find((a) => a.is_default);

        return defaultAddress?.id ?? list[0]?.id ?? null;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAddress(id: string) {
    if (!confirm("Delete this address?")) return;

    console.log("Deleting:", id);

    const { data, error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id)
      .select();

    console.log("Deleted Data:", data);
    console.log("Delete Error:", error);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAddresses();
  }

  async function makeDefault(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return;

    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_email", user.email);

    await supabase
      .from("customer_addresses")
      .update({ is_default: true })
      .eq("id", id);

    loadAddresses();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999 bg-black/50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-xl rounded-t-3xl md:rounded-3xl overflow-hidden">
        {/* Header */}

        <div className="border-b px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-700">
            Choose your work location
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onAdd}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-orange-300 bg-orange-50 px-3 text-xs font-medium text-orange-600 transition hover:bg-orange-100"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add</span>
            </button>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}

        <div className="max-h-[70vh] overflow-y-auto p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative h-14 w-14">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-orange-100"></div>

                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>

                {/* Center Dot */}
                <div className="absolute inset-3 rounded-full bg-orange-50 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse"></div>
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-gray-700">
                Loading addresses...
              </p>

              <p className="mt-1 text-xs text-gray-400">Please wait a moment</p>
            </div>
          )}

          {!loading &&
            addresses.map((item) => (
              <div key={item.id} className="border rounded-2xl p-4 mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.address_type === "home" ? (
                        <Home size={16} className="text-orange-500" />
                      ) : item.address_type === "office" ? (
                        <Building2 size={16} className="text-blue-500" />
                      ) : (
                        <Home size={16} className="text-gray-500" />
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.customer_name}
                        </p>

                        {item.is_default && (
                          <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-700">
                      {[
                        item.house_no,
                        item.address,
                        item.landmark,
                        item.city,
                        item.district,
                        item.state,
                        item.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 ml-2">
                    {/* Select */}
                    <button
                      onClick={() => {
                        setSelectedAddressId(item.id);
                        onSelect(item);
                      }}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${selectedAddressId === item.id
                          ? "border-green-600 bg-green-600"
                          : "border-gray-300 bg-white"
                        }`}
                    >
                      {selectedAddressId === item.id && (
                        <Check
                          size={12}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </button>

                    {/* 3 Dot Menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === item.id ? null : item.id)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>

                      {openMenu === item.id && (
                        <div className="absolute right-0 top-10 z-50 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                          <button
                            onClick={() => {
                              setOpenMenu(null);

                              if (item.source === "booking") {
                                alert(
                                  "This address came from a previous booking. Save it as a new address before editing.",
                                );
                                return;
                              }

                              onEdit(item);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Pencil size={16} />
                            <span>Edit</span>
                          </button>

                          {/* Divider */}
                          <div className="mx-3 border-t border-gray-200" />

                          <button
                            onClick={() => {
                              console.log("Delete clicked", item);

                              setOpenMenu(null);

                              if (item.source !== "customer") {
                                alert("Booking addresses cannot be deleted.");
                                return;
                              }

                              deleteAddress(item.id);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {item.source === "customer" && !item.is_default && (
                  <button
                    onClick={() => makeDefault(item.id)}
                    className="mt-3 text-sm text-orange-600 font-semibold"
                  >
                    Make Default
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
