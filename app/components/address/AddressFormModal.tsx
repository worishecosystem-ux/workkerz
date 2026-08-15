"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, MapPin, LocateFixed, Loader2 } from "lucide-react";
import type { AddressItem } from "./AddressSelectorModal";

import { Capacitor } from "@capacitor/core";
import {
  Geolocation,
  type Position,
} from "@capacitor/geolocation";

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

  const [addressType, setAddressType] = useState<
    "home" | "office" | "other"
  >("home");

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  /* =====================================================
     KEYBOARD
  ===================================================== */

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let showListener:
      | { remove: () => void }
      | undefined;

    let hideListener:
      | { remove: () => void }
      | undefined;

    (async () => {
      showListener =
        await Keyboard.addListener(
          "keyboardDidShow",
          () => {
            setKeyboardVisible(true);
          },
        );

      hideListener =
        await Keyboard.addListener(
          "keyboardDidHide",
          () => {
            setKeyboardVisible(false);
          },
        );
    })();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  /* =====================================================
     EDIT / NEW ADDRESS
  ===================================================== */

  useEffect(() => {
    if (!open) return;

    setLocationError("");

    if (editingAddress) {
      setCustomerName(
        editingAddress.customer_name || "",
      );

      setHouseNo(
        editingAddress.house_no || "",
      );

      setAddress(
        editingAddress.address || "",
      );

      setLandmark(
        editingAddress.landmark || "",
      );

      setCity(
        editingAddress.city || "",
      );

      setDistrict(
        editingAddress.district || "",
      );

      setState(
        editingAddress.state || "",
      );

      setCountry(
        editingAddress.country || "India",
      );

      setPincode(
        editingAddress.pincode || "",
      );

      setAddressType(
        editingAddress.address_type,
      );

      return;
    }

    resetForm();

    /*
     * New address:
     * automatically detect current location.
     */
    void useCurrentLocation();
  }, [editingAddress, open]);

  /* =====================================================
     RESET
  ===================================================== */

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

    setLocationError("");
  }

  /* =====================================================
     CURRENT LOCATION
  ===================================================== */

  async function useCurrentLocation() {
    if (locationLoading) {
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    try {
      let latitude = 0;
      let longitude = 0;

      /* ===============================================
         NATIVE ANDROID
      =============================================== */

      if (Capacitor.isNativePlatform()) {
        let permission =
          await Geolocation.checkPermissions();

        if (
          permission.location !==
          "granted"
        ) {
          permission =
            await Geolocation.requestPermissions();
        }

        if (
          permission.location !==
          "granted"
        ) {
          throw new Error(
            "Location permission was denied. Please allow location access.",
          );
        }

        const position: Position =
          await Geolocation.getCurrentPosition(
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 30000,
            },
          );

        latitude =
          position.coords.latitude;

        longitude =
          position.coords.longitude;
      }

      /* ===============================================
         WEB
      =============================================== */

      else {
        if (!navigator.geolocation) {
          throw new Error(
            "Location is not supported on this device.",
          );
        }

        const position =
          await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 30000,
                },
              );
            },
          );

        latitude =
          position.coords.latitude;

        longitude =
          position.coords.longitude;
      }

      console.log(
        "[Address] Current location:",
        {
          latitude,
          longitude,
        },
      );

      /* ===============================================
         REVERSE GEOCODING
      =============================================== */

      const response =
        await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        );

      if (!response.ok) {
        throw new Error(
          "Unable to detect your address.",
        );
      }

      const data =
        await response.json();

      console.log(
        "[Address] Reverse geocode:",
        data,
      );

      /* ===============================================
         ADDRESS PARTS
      =============================================== */

      const informative =
        Array.isArray(
          data.localityInfo
            ?.informative,
        )
          ? data.localityInfo
              .informative
          : [];

      const findInformative = (
        description: string,
      ) => {
        const item =
          informative.find(
            (entry: {
              name?: string;
              description?: string;
            }) =>
              entry.description
                ?.toLowerCase() ===
              description.toLowerCase(),
          );

        return item?.name || "";
      };

      const road =
        findInformative("road");

      const neighbourhood =
        findInformative(
          "neighbourhood",
        );

      const detectedAddress =
        [
          road,
          neighbourhood,
          data.locality,
        ]
          .filter(Boolean)
          .filter(
            (
              value,
              index,
              array,
            ) =>
              array.indexOf(
                value,
              ) === index,
          )
          .join(", ");

      /* ===============================================
         DISTRICT
      =============================================== */

      const administrative =
        Array.isArray(
          data.localityInfo
            ?.administrative,
        )
          ? data.localityInfo
              .administrative
          : [];

      const districtItem =
        administrative.find(
          (item: {
            name?: string;
            description?: string;
          }) =>
            item.description
              ?.toLowerCase()
              .includes(
                "district",
              ),
        );

      /* ===============================================
         AUTO FILL
      =============================================== */

      setAddress(
        detectedAddress ||
          data.locality ||
          "",
      );

      setCity(
        data.city ||
          data.locality ||
          "",
      );

      setDistrict(
        districtItem?.name ||
          data.district ||
          "",
      );

      setState(
        data.principalSubdivision ||
          "",
      );

      setCountry(
        data.countryName ||
          "India",
      );

      setPincode(
        data.postcode ||
          "",
      );

      setLocationError("");

      console.log(
        "[Address] Auto-filled successfully",
      );
    } catch (error) {
      console.error(
        "[Address] Location error:",
        error,
      );

      if (
        error instanceof Error
      ) {
        setLocationError(
          error.message,
        );
      } else {
        setLocationError(
          "Unable to detect your current location.",
        );
      }
    } finally {
      setLocationLoading(false);
    }
  }

  /* =====================================================
     PINCODE
  ===================================================== */

  async function fetchPincode(
    pin: string,
  ) {
    if (pin.length !== 6) {
      return;
    }

    try {
      const res =
        await fetch(
          `https://api.postalpincode.in/pincode/${pin}`,
        );

      const json =
        await res.json();

      if (
        json[0]?.Status ===
          "Success" &&
        json[0]?.PostOffice
          ?.length
      ) {
        const office =
          json[0].PostOffice[0];

        setCity(
          office.Block ||
            office.Name ||
            "",
        );

        setDistrict(
          office.District ||
            "",
        );

        setState(
          office.State ||
            "",
        );

        setCountry(
          office.Country ||
            "India",
        );
      }
    } catch (error) {
      console.error(
        "[Address] Pincode error:",
        error,
      );
    }
  }

  /* =====================================================
     SAVE ADDRESS
  ===================================================== */

  async function saveAddress() {
    console.log(
      "editingAddress:",
      editingAddress,
    );

    console.log(
      "source:",
      editingAddress?.source,
    );

    console.log(
      "id:",
      editingAddress?.id,
    );

    if (
      !customerName.trim() ||
      !houseNo.trim() ||
      !address.trim() ||
      !pincode.trim()
    ) {
      alert(
        "Please fill all required fields.",
      );

      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user?.email) {
        alert(
          "Please login first",
        );

        return;
      }

      const payload = {
        customer_email:
          user.email,

        customer_name:
          customerName.trim(),

        house_no:
          houseNo.trim(),

        address:
          address.trim(),

        landmark:
          landmark.trim(),

        city:
          city.trim(),

        district:
          district.trim(),

        state:
          state.trim(),

        country:
          country.trim() ||
          "India",

        pincode:
          pincode.trim(),

        address_type:
          addressType,
      };

      /* ===============================================
         UPDATE
      =============================================== */

      if (editingAddress) {
        console.log(
          "UPDATE MODE",
          editingAddress.id,
        );

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "customer_addresses",
            )
            .update(payload)
            .eq(
              "id",
              editingAddress.id,
            )
            .select();

        if (error) {
          throw error;
        }

        console.log(
          "Updated:",
          data,
        );

        onSaved();
        onClose();
        resetForm();

        return;
      }

      /* ===============================================
         CHECK EXISTING
      =============================================== */

      console.log(
        "INSERT MODE",
      );

      const {
        data: existing,
        error:
          existingError,
      } =
        await supabase
          .from(
            "customer_addresses",
          )
          .select("id")
          .eq(
            "customer_email",
            user.email,
          );

      if (existingError) {
        throw existingError;
      }

      /* ===============================================
         INSERT
      =============================================== */

      const {
        error,
      } =
        await supabase
          .from(
            "customer_addresses",
          )
          .insert({
            ...payload,
            is_default:
              !existing?.length,
          });

      if (error) {
        throw error;
      }

      onSaved();
      onClose();
      resetForm();
    } catch (error) {
      console.error(
        "[Address] Save error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save address.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     CLOSED
  ===================================================== */

  if (!open) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      data-modal-open="true"
      className="
        fixed
        inset-0
        z-[999]
        flex
        items-end
        justify-center
        bg-black/40
      "
    >
      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-md
          flex-col
          overflow-hidden
          rounded-t-2xl
          bg-white
          shadow-xl
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            relative
            flex
            h-14
            shrink-0
            items-center
            justify-center
            border-b
            border-gray-100
            bg-white
          "
        >
          <h2 className="text-sm font-bold text-gray-900">
            {editingAddress
              ? "Edit Address"
              : "Add New Address"}
          </h2>

          <button
            type="button"
            onClick={onBack}
            aria-label="Close"
            className="
              absolute
              right-3
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-gray-500
              transition
              active:scale-95
              active:bg-gray-100
            "
          >
            <X
              size={24}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div
          className="
            flex-1
            space-y-3
            overflow-y-auto
            px-4
            py-3
          "
        >
          {/* =================================================
              CURRENT LOCATION
          ================================================= */}

          {!editingAddress && (
            <div
              className="
                rounded-2xl
                border
                border-orange-100
                bg-orange-50/70
                p-3
              "
            >
              <button
                type="button"
                onClick={() =>
                  void useCurrentLocation()
                }
                disabled={
                  locationLoading
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-3
                  text-left
                  disabled:opacity-60
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-white
                      text-orange-600
                      shadow-sm
                    "
                  >
                    {locationLoading ? (
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                    ) : (
                      <LocateFixed
                        size={19}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      {locationLoading
                        ? "Detecting your location..."
                        : "Use current location"}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-gray-500">
                      {locationLoading
                        ? "Please allow location access"
                        : "Automatically fill your address"}
                    </p>
                  </div>
                </div>

                {!locationLoading && (
                  <span
                    className="
                      shrink-0
                      rounded-lg
                      bg-white
                      px-3
                      py-2
                      text-[11px]
                      font-bold
                      text-orange-600
                      shadow-sm
                    "
                  >
                    Detect
                  </span>
                )}
              </button>

              {locationError && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-2.5 py-2">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-[11px] leading-4 text-red-600">
                    {locationError}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =================================================
              ADDRESS TYPE
          ================================================= */}

          <div>
            <div className="rounded-xl bg-gray-100 p-1">
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    {
                      value: "home",
                      label: "Home",
                      icon: "🏠",
                    },
                    {
                      value: "office",
                      label: "Office",
                      icon: "🏢",
                    },
                    {
                      value: "other",
                      label: "Other",
                      icon: "📍",
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={
                      item.value
                    }
                    type="button"
                    onClick={() =>
                      setAddressType(
                        item.value,
                      )
                    }
                    className={`
                      flex
                      h-10
                      items-center
                      justify-center
                      gap-1.5
                      rounded-lg
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      ${
                        addressType ===
                        item.value
                          ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-200"
                          : "text-gray-600 hover:bg-white/70"
                      }
                    `}
                  >
                    <span className="text-base">
                      {item.icon}
                    </span>

                    <span>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================
              FULL NAME
          ================================================= */}

          <div>
            <label className="text-xs font-medium text-gray-700">
              Full Name
            </label>

            <input
              enterKeyHint="done"
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  (
                    event.target as HTMLInputElement
                  ).blur();
                }
              }}
              value={customerName}
              onChange={(event) =>
                setCustomerName(
                  event.target.value,
                )
              }
              placeholder="Enter full name"
              className="
                mt-1
                h-10
                w-full
                rounded-lg
                border
                border-gray-200
                px-3
                text-sm
                text-black
                outline-none
                focus:border-orange-400
                focus:ring-2
                focus:ring-orange-100
              "
            />
          </div>

          {/* =================================================
              HOUSE
          ================================================= */}

          <div>
            <label className="text-xs font-medium text-gray-700">
              House / Flat No
            </label>

            <input
              enterKeyHint="done"
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  (
                    event.target as HTMLInputElement
                  ).blur();
                }
              }}
              value={houseNo}
              onChange={(event) =>
                setHouseNo(
                  event.target.value,
                )
              }
              placeholder="House / Flat / Shop No."
              className="
                mt-1
                h-10
                w-full
                rounded-lg
                border
                border-gray-200
                px-3
                text-sm
                text-black
                outline-none
                focus:border-orange-400
                focus:ring-2
                focus:ring-orange-100
              "
            />
          </div>

          {/* =================================================
              ADDRESS
          ================================================= */}

          <div>
            <label className="text-xs font-medium text-gray-700">
              Street / Area
            </label>

            <textarea
              enterKeyHint="done"
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  (
                    event.target as HTMLTextAreaElement
                  ).blur();
                }
              }}
              rows={2}
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value,
                )
              }
              placeholder="Street, area, locality"
              className="
                mt-1
                w-full
                resize-none
                rounded-lg
                border
                border-gray-200
                p-3
                text-sm
                text-black
                outline-none
                focus:border-orange-400
                focus:ring-2
                focus:ring-orange-100
              "
            />
          </div>

          {/* =================================================
              LANDMARK + PINCODE
          ================================================= */}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700">
                Landmark
              </label>

              <input
                enterKeyHint="done"
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    (
                      event.target as HTMLInputElement
                    ).blur();
                  }
                }}
                value={landmark}
                onChange={(event) =>
                  setLandmark(
                    event.target.value,
                  )
                }
                placeholder="Nearby landmark"
                className="
                  mt-1
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-200
                  px-3
                  text-sm
                  text-black
                  outline-none
                  focus:border-orange-400
                  focus:ring-2
                  focus:ring-orange-100
                "
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">
                Pincode
              </label>

              <input
                enterKeyHint="done"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(event) => {
                  const pin =
                    event.target.value.replace(
                      /\D/g,
                      "",
                    );

                  setPincode(pin);

                  if (
                    pin.length === 6
                  ) {
                    void fetchPincode(
                      pin,
                    );
                  }
                }}
                placeholder="6 digit PIN"
                className="
                  mt-1
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-200
                  px-3
                  text-sm
                  text-black
                  outline-none
                  focus:border-orange-400
                  focus:ring-2
                  focus:ring-orange-100
                "
              />
            </div>
          </div>

          {/* =================================================
              AUTO FILLED LOCATION
          ================================================= */}

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Location details
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-500">
                  City
                </label>

                <input
                  readOnly
                  value={city}
                  className="
                    mt-1
                    h-9
                    w-full
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-100
                    px-3
                    text-sm
                    text-black
                  "
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-500">
                  District
                </label>

                <input
                  readOnly
                  value={district}
                  className="
                    mt-1
                    h-9
                    w-full
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-100
                    px-3
                    text-sm
                    text-black
                  "
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-500">
                  State
                </label>

                <input
                  readOnly
                  value={state}
                  className="
                    mt-1
                    h-9
                    w-full
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-100
                    px-3
                    text-sm
                    text-black
                  "
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-500">
                  Country
                </label>

                <input
                  readOnly
                  value={country}
                  className="
                    mt-1
                    h-9
                    w-full
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-100
                    px-3
                    text-sm
                    text-black
                  "
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        {!keyboardVisible && (
          <div
            className="
              flex
              shrink-0
              gap-2
              border-t
              border-gray-100
              bg-white
              p-3
            "
          >
            <button
              type="button"
              onClick={saveAddress}
              disabled={saving}
              className="
                flex
                h-11
                flex-1
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-b
                from-orange-500
                to-orange-600
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                active:scale-[0.98]
                disabled:opacity-60
              "
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