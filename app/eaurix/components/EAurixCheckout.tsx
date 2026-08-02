"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutCustomerDetails from "./components/checkout/CheckoutCustomerDetails";
import CheckoutDeliveryDetails from "./components/checkout/CheckoutDeliveryDetails";
import AddressSelectorModal, {
  type AddressItem,
} from "@/app/components/address/AddressSelectorModal";
import OrderSummarySidebar from "./eaurix/OrderSummarySidebar";
import AddressFormModal from "@/app/components/address/AddressFormModal";
import { supabase } from "@/lib/supabase";
import CheckoutPaymentStep from "./components/checkout/CheckoutPaymentStep";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Trash2,
  Truck,
  X,
  ShoppingCart,
} from "lucide-react";
import { usePlatform } from "@/app/components/context/PlatformContext";

const steps = [
  { id: 1, label: "Details" },
  { id: 2, label: "Delivery" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Review" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CHECKOUT
// ═══════════════════════════════════════════════════════════════════════════════
export function EAurixCheckout() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = usePlatform();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(
    null,
  );
  const [reviewCart, setReviewCart] = useState(cart);
  const handleAddressPicker = () => {
    setShowAddressModal(true);
  };
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showOrderItems, setShowOrderItems] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(
    null,
  );
  1;
  const totalAmount = reviewCart.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [form, setForm] = useState({
    transactionId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "US",
    deliveryNote: "",
    deliveryOption: "standard",
    latitude: "",
    longitude: "",
    deliverySlot: "09:00 AM - 12:00 PM",
  });

  const [compactHeader, setCompactHeader] = useState(false);

  useEffect(() => {
    setReviewCart(cart);
  }, [cart]);
  const removeFromCart = (id: string) => {
    setReviewCart((prev) => prev.filter((item) => item.id !== id));
  };
  useEffect(() => {
    if (showOrderSummary) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showOrderSummary]);
  useEffect(() => {
    const handleScroll = () => {
      setCompactHeader(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const loadUser = async () => {
      setLoadingAddress(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
          setLoadingAddress(false);
          return;
        }

        // Default email
        setForm((prev) => ({
          ...prev,
          email: user.email!,
        }));

        /* ===============================
         CUSTOMER PROFILE
      =============================== */

        const { data: profile } = await supabase
          .from("customer_profiles")
          .select("*")
          .eq("customer_email", user.email)
          .maybeSingle();

        if (profile) {
          setForm((prev) => ({
            ...prev,
            name: profile.customer_name ?? "",
            phone: profile.customer_phone ?? "",
            email: profile.customer_email ?? user.email!,
          }));
        } else {
          /* ===============================
           LAST BOOKING (Fallback)
        =============================== */

          const { data: lastBooking } = await supabase
            .from("bookings")
            .select("customer_name, customer_phone, customer_email")
            .eq("customer_email", user.email)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastBooking) {
            setForm((prev) => ({
              ...prev,
              name: lastBooking.customer_name ?? "",
              phone: lastBooking.customer_phone ?? "",
              email: lastBooking.customer_email ?? user.email!,
            }));
          }
        }

        /* ===============================
         DEFAULT ADDRESS
      =============================== */

        const { data: addresses, error } = await supabase
          .from("customer_addresses")
          .select("*")
          .eq("customer_email", user.email)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (!error && addresses?.length) {
          const address = addresses[0];

          setSelectedAddress(address);

          setForm((prev) => ({
            ...prev,
            address: address.address ?? "",
            city: address.city ?? "",
            zip: address.pincode ?? "",
          }));
        }
      } finally {
        setLoadingAddress(false);
      }
    };

    loadUser();
  }, []);

  const reviewCartTotal = useMemo(
    () => reviewCart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [reviewCart],
  );

  const delivery =
    form.deliveryOption === "express" ? 99 : reviewCartTotal > 1000 ? 0 : 40;

  const tax = parseFloat((reviewCartTotal * 0.08).toFixed(2));

  const grandTotal = parseFloat((reviewCartTotal + delivery + tax).toFixed(2));

  const update = (field: string, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const canNext = () => {
    // Customer Details
    if (step === 1) {
      return (
        form.name &&
        form.email &&
        form.phone &&
        form.address &&
        form.city &&
        form.zip
      );
    }

    // Delivery Details
    if (step === 2) {
      return form.deliveryOption && form.deliverySlot;
    }

    // Payment
    if (step === 3) {
      return form.transactionId.trim().length > 4;
    }

    return true; // Review
  };

  const handleConfirm = async () => {
    try {
      const orderData = {
        form,
        cart,
        cartTotal,
        delivery,
        tax,
        grandTotal,
      };

      // Create Order
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_number: `EA-${Date.now()}`,

          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,

          address: form.address,
          city: form.city,
          pincode: form.zip,

          delivery_option: form.deliveryOption,
          delivery_slot: form.deliverySlot,

          subtotal: cartTotal,
          delivery,
          tax,
          total: grandTotal,

          payment_method: "UPI", // or "COD"
          payment_status: "Pending",
          status: "Pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Order Error:", error);

        alert(`
Message: ${error.message}

Details: ${error.details ?? "-"}

Hint: ${error.hint ?? "-"}
  `);

        return;
      }

      // Create Order Items
      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.icon,
        qty: item.qty,
        price: item.price,
        unit: item.unit,
      }));

      const { error: itemError } = await supabase
        .from("order_items")
        .insert(items);

      if (itemError) {
        console.error("Order Items Error:", itemError);
        alert("Failed to save order items.");
        return;
      }

      // Save for confirmation page
      sessionStorage.setItem(
        "eaurix-order",
        JSON.stringify({
          ...orderData,
          orderId: order.id,
          orderNumber: order.order_number,
        }),
      );

      router.push("/eaurix/order-placed");
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Something went wrong. Please try again.");
    }
  };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>
            Nothing to checkout
          </h2>
          <Link href="/eaurix" className="text-[#0EA5E9] text-sm">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const inp =
    "w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#0EA5E9] transition-colors";

  return (
    <div className="min-h-screen  pb-14">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        {/* Header */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            compactHeader ? "max-h-0 opacity-0" : "max-h-28 opacity-100 pt-12"
          }`}
        >
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
            {/* Left */}
            <button
              onClick={() =>
                step === 1 ? router.push("/eaurix/cart") : setStep(step - 1)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
            >
              <ChevronLeft className="h-5 w-5 text-slate-800" />
            </button>

            {/* Center */}
            <div className="text-center">
              <h1 className="text-lg font-bold">Checkout</h1>
              <p className="text-xs text-slate-500">
                Step {step} of {steps.length}
              </p>
            </div>

            {/* Right */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <Lock className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-4 py-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-300"
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto px-6 mt-4 pb-4">
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.9fr] gap-2 items-start">
          {/* Form panel */}
          <div className="">
            {step === 1 && (
              <CheckoutCustomerDetails
                form={form}
                update={update}
                inp={inp}
                selectedAddress={selectedAddress}
                loadingAddress={loadingAddress}
                onAddressClick={handleAddressPicker}
              />
            )}
            {step === 2 && (
              <CheckoutDeliveryDetails
                form={form}
                update={update}
                inp={inp}
                cartTotal={cartTotal}
              />
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 3 && (
              <CheckoutPaymentStep
                form={form}
                update={update}
                grandTotal={grandTotal}
                inp={inp}
              />
            )}

            {/* ── STEP 4: Review ── */}
            {step === 4 && (
              <div className="space-y-2">
                {/* Header */}
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Review Order
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Check your delivery details before placing the order.
                  </p>
                </div>

                {/* Delivery Summary */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 ">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 ">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100">
                          <Truck className="h-4 w-4 text-sky-600" />
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            Delivering To
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            {form.deliveryOption === "express"
                              ? "Express Delivery"
                              : "Standard Delivery"}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-semibold text-sky-700">
                        {form.deliveryOption === "express"
                          ? "⚡ Next Day"
                          : "🚚 3–5 Days"}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="rounded-xl bg-white p-3 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          {form.name}
                        </span>

                        <span className="text-xs text-slate-500">
                          {form.phone}
                        </span>
                      </div>

                      <p className="mt-2 wrap-break-word text-xs leading-5 text-slate-600 whitespace-normal">
                        {form.address}, {form.city} {form.zip}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {/* Header */}
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-1">
                    <button
                      type="button"
                      onClick={() => setShowOrderPopup(true)}
                      className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Order Items
                        </h3>
                        <p className="text-xs text-slate-500">
                          {reviewCart.length}{" "}
                          {reviewCart.length === 1 ? "Item" : "Items"}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                        View Order
                      </span>
                    </button>
                  </div>

                  {showOrderPopup && (
                    <div
                      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 p-4 sm:items-center"
                      onClick={() => setShowOrderPopup(false)}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-5 py-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              Order Items
                            </h3>
                            <p className="text-xs text-slate-500">
                              {reviewCart.length}{" "}
                              {reviewCart.length === 1 ? "Item" : "Items"}
                            </p>
                          </div>

                          <button
                            onClick={() => setShowOrderPopup(false)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Product List */}
                        <div className="max-h-[65vh] overflow-y-auto divide-y">
                          {reviewCart.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 px-4 py-3"
                            >
                              <img
                                src={item.icon || "/placeholder.png"}
                                alt={item.name}
                                className="h-12 w-12 rounded-xl border object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-slate-900">
                                  {item.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {item.qty} × ₹{item.price}
                                  {item.unit && ` / ${item.unit}`}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="font-bold text-slate-900">
                                  ₹{(item.qty * item.price).toFixed(2)}
                                </p>

                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="mt-1 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="border-t p-4">
                          <button
                            onClick={() => setShowOrderPopup(false)}
                            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Amazon Style Bill Card */}
                <div className=" mt-2 rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      Bill Details
                    </h4>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {reviewCart.reduce((sum, item) => sum + item.qty, 0)}{" "}
                      Items
                    </span>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charges</span>
                      <span
                        className={`font-medium ${
                          delivery === 0 ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {delivery === 0 ? "FREE" : `₹${delivery.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Discount</span>
                      <span className="font-medium text-emerald-600">
                        -₹0.00
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>GST</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>

                    <div className="my-2 border-t border-dashed border-slate-300"></div>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">
                        Total Amount
                      </span>

                      <span className="text-xl font-extrabold text-emerald-600">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      {delivery === 0 ? (
                        <>
                          🎉 Your order is eligible for <b>FREE Delivery</b>.
                        </>
                      ) : (
                        <>
                          🚚 Delivery Charge: <b>₹{delivery.toFixed(2)}</b>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {/* Terms */}
                <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

                  <p className="text-[10px] leading-4 text-slate-600">
                    By placing your order, you agree to{" "}
                    <span className="font-medium text-slate-900">
                      E-Aurix Terms
                    </span>{" "}
                    &{" "}
                    <span className="font-medium text-slate-900">
                      Returns Policy
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div
              className={`fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] transition-all duration-300 ${
                showOrderSummary
                  ? "translate-y-full opacity-0 pointer-events-none"
                  : "translate-y-0 opacity-100"
              }`}
            >
              <div className="mx-auto flex max-w-md gap-3">
                {/* View Products */}
                <button
                  onClick={() => setShowOrderSummary(true)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
                >
                  View Products
                </button>

                {/* Continue / Place Order */}
                <button
                  onClick={() =>
                    step === 4 ? handleConfirm() : setStep((prev) => prev + 1)
                  }
                  disabled={!canNext()}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    canNext()
                      ? step === 4
                        ? "bg-[#FF5C39] hover:bg-[#E54E2E] text-white"
                        : "bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {step === 4 ? (
                    <>
                      <Lock className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold whitespace-nowrap">
                        Place Order
                      </span>
                      <span className="text-xs font-bold whitespace-nowrap">
                        ₹{grandTotal.toFixed(0)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">Continue</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          {showOrderSummary && (
            <>
              <div
                className="fixed inset-0 z-[90] bg-black/40"
                onClick={() => setShowOrderSummary(false)}
              />

              <div className="fixed inset-x-0 bottom-0 z-[91] max-h-[80vh] overflow-hidden rounded-t-3xl bg-gray-200 shadow-2xl xl:hidden">
                <div className="px-4 py-3">
                  <OrderSummarySidebar
                    cart={reviewCart}
                    cartTotal={reviewCartTotal}
                    delivery={delivery}
                    tax={tax}
                    grandTotal={grandTotal}
                    step={step}
                    onClose={() => setShowOrderSummary(false)}
                    onRemove={removeFromCart}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <AddressSelectorModal
        open={showAddressModal}
        selected={selectedAddress}
        onClose={() => setShowAddressModal(false)}
        onSelect={(address) => {
          setSelectedAddress(address);

          setForm((prev) => ({
            ...prev,
            address: address.address ?? "",
            city: address.city ?? "",
            zip: address.pincode ?? "",
          }));

          setShowAddressModal(false);
        }}
        onEdit={(address) => {
          setEditingAddress(address);
          setShowAddressModal(false);
          setShowAddressForm(true);
        }}
        onAdd={() => {
          setEditingAddress(null);
          setShowAddressModal(false);
          setShowAddressForm(true);
        }}
      />
      <AddressFormModal
        open={showAddressForm}
        editingAddress={editingAddress}
        onClose={() => setShowAddressForm(false)}
        onBack={() => {
          setShowAddressForm(false);
          setShowAddressModal(true);
        }}
        onSaved={async () => {
          setShowAddressForm(false);

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            setForm((prev) => ({
              ...prev,
              email: user.email ?? "",
            }));
          }
          if (!user?.email) return;

          const { data } = await supabase
            .from("customer_addresses")
            .select("*")
            .eq("customer_email", user.email)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false });

          if (data?.length) {
            setSelectedAddress(data[0]);

            setForm((prev) => ({
              ...prev,
              name: data[0].customer_name ?? "",
              email: data[0].customer_email ?? user.email ?? "",
              phone: data[0].phone ?? "",
              address: data[0].address ?? "",
              city: data[0].city ?? "",
              zip: data[0].pincode ?? "",
            }));
          }
        }}
      />
    </div>
  );
}
