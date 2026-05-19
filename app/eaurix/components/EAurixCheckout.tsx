"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Lock,
  Check,
  Truck,
  Star,
  Briefcase,
  Plus,
  Minus,
  CheckCircle,
  X,
  Zap,
} from "lucide-react";
import { usePlatform } from "@/app/components/context/PlatformContext";
import { useAdmin } from "@/app/components/context/AdminContext";
import type { Worker } from "../../data/workers";
import type { ProductCategory } from "../../data/products";

// Map product category → worker service category
const PRODUCT_WORKER_MAP: Record<ProductCategory, string[]> = {
  masonry: ["construction"],
  plumbing: ["plumbing"],
  electrical: ["electrical"],
  moving: ["driving"],
  tools: ["construction", "plumbing", "electrical", "driving"],
  safety: ["construction", "plumbing", "electrical", "driving"],
};

const steps = [
  { id: 1, label: "Delivery" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Add Worker" },
  { id: 4, label: "Review" },
];

interface WorkerAddon {
  worker: Worker;
  hours: number;
}

// ── Worker Add-On Step ─────────────────────────────────────────────────────────
function WorkerAddonStep({
  cart,
  addon,
  onSelect,
}: {
  cart: { productId: string; name: string; icon: string; color: string }[];
  addon: WorkerAddon | null;
  onSelect: (a: WorkerAddon | null) => void;
}) {
  const { workers } = useAdmin();
  const [hours, setHours] = useState(addon?.hours || 2);

  // Collect relevant worker categories from cart items (we need product categories)
  // We embed the product category info in the cart item via a lookup
  const { getProductById } = useAdmin();

  const relevantWorkerCats = useMemo(() => {
    const cats = new Set<string>();
    cart.forEach((item) => {
      const product = getProductById(item.productId);
      if (product) {
        const mapped =
          PRODUCT_WORKER_MAP[product.category as ProductCategory] || [];
        mapped.forEach((c) => cats.add(c));
      }
    });
    return Array.from(cats);
  }, [cart, getProductById]);

  const suggestedWorkers = useMemo(() => {
    if (relevantWorkerCats.length === 0)
      return workers.filter((w) => w.available).slice(0, 3);
    return workers
      .filter((w) => w.available && relevantWorkerCats.includes(w.category))
      .slice(0, 4);
  }, [workers, relevantWorkerCats]);

  const allWorkers = workers.filter((w) => w.available);

  const CAT_LABELS: Record<string, string> = {
    construction: "Construction",
    plumbing: "Plumbing",
    electrical: "Electrical",
    driving: "Driving / Moving",
  };

  const handleSelectWorker = (w: Worker) => {
    if (addon?.worker.id === w.id) {
      onSelect(null); // deselect
    } else {
      onSelect({ worker: w, hours });
    }
  };

  const handleHoursChange = (h: number) => {
    setHours(h);
    if (addon) onSelect({ worker: addon.worker, hours: h });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-linear-to-r from-[#0F2744] to-[#0C3B5E] rounded-2xl">
        <div className="w-10 h-10 bg-[#FF5C39]/20 rounded-xl flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5 text-[#FF6B47]" />
        </div>
        <div>
          <div
            className="text-white text-sm mb-0.5"
            style={{ fontWeight: 700 }}
          >
            Add a Professional to Your Order
          </div>
          <div className="text-sky-300 text-xs">
            {relevantWorkerCats.length > 0
              ? `Based on your cart, we suggest: ${relevantWorkerCats.map((c) => CAT_LABELS[c] || c).join(", ")} workers`
              : "Book a skilled professional to install or use your materials"}
          </div>
        </div>
        <div className="ml-auto shrink-0">
          <span className="text-sky-300 text-xs bg-white/10 px-2 py-1 rounded-lg">
            Optional
          </span>
        </div>
      </div>

      {/* Suggested workers */}
      {suggestedWorkers.length > 0 && (
        <div>
          <div
            className="text-sm text-[#0F172A] mb-3"
            style={{ fontWeight: 700 }}
          >
            Suggested Workers
            {relevantWorkerCats.length > 0 && (
              <span
                className="ml-2 text-xs text-[#0EA5E9] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200"
                style={{ fontWeight: 600 }}
              >
                Matched to your cart
              </span>
            )}
          </div>
          <div className="space-y-3">
            {suggestedWorkers.map((w) => {
              const selected = addon?.worker.id === w.id;
              const CAT_STYLE: Record<string, { bg: string; color: string }> = {
                construction: { bg: "#FFF7ED", color: "#F97316" },
                plumbing: { bg: "#EFF6FF", color: "#3B82F6" },
                electrical: { bg: "#FEFCE8", color: "#EAB308" },
                driving: { bg: "#ECFDF5", color: "#10B981" },
              };
              const style = CAT_STYLE[w.category] || {
                bg: "#F8FAFC",
                color: "#64748B",
              };

              return (
                <button
                  key={w.id}
                  onClick={() => handleSelectWorker(w)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    selected
                      ? "border-[#FF5C39] bg-orange-50 shadow-md shadow-orange-100"
                      : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={w.photo}
                        alt={w.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=f97316&color=fff`;
                        }}
                      />
                      {selected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5C39] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[#0F172A] text-sm"
                          style={{ fontWeight: 700 }}
                        >
                          {w.name}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                            fontWeight: 600,
                          }}
                        >
                          {w.category}
                        </span>
                      </div>
                      <div className="text-[#64748B] text-xs">
                        {w.specialty} · {w.location}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-[#64748B]">
                          {w.rating} ({w.reviewCount} jobs)
                        </span>
                        <span className="text-xs text-[#64748B]">
                          · {w.yearsExperience} yrs exp.
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className="text-[#0F172A]"
                        style={{ fontWeight: 800 }}
                      >
                        ${w.hourlyRate}
                        <span className="text-xs text-[#94A3B8]">/hr</span>
                      </div>
                      <div
                        className="text-xs text-emerald-600 mt-0.5"
                        style={{ fontWeight: 500 }}
                      >
                        {w.responseTime}
                      </div>
                    </div>
                  </div>

                  {/* Skills preview */}
                  {w.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {w.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-gray-100 text-[#475569] px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hours picker — shown when a worker is selected */}
      {addon && (
        <div className="p-4 bg-white border-2 border-[#FF5C39] rounded-2xl">
          <div
            className="text-sm text-[#0F172A] mb-3"
            style={{ fontWeight: 700 }}
          >
            How many hours do you need {addon.worker.name.split(" ")[0]}?
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#F8FAFC] border border-gray-200 rounded-xl p-1.5">
              <button
                onClick={() => handleHoursChange(Math.max(1, hours - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-[#64748B]" />
              </button>
              <span
                className="w-10 text-center text-[#0F172A]"
                style={{ fontWeight: 800, fontSize: "1.1rem" }}
              >
                {hours}
              </span>
              <button
                onClick={() => handleHoursChange(Math.min(12, hours + 1))}
                className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-[#FF5C39]" />
              </button>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">Hours of service</div>
              <div
                className="text-[#0F172A] text-sm"
                style={{ fontWeight: 700 }}
              >
                Total:{" "}
                <span className="text-[#FF5C39]">
                  ${(addon.worker.hourlyRate * hours).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="ml-auto w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      )}

      {/* Browse all button */}
      {allWorkers.length > suggestedWorkers.length && (
        <div className="text-center">
          <p className="text-xs text-[#64748B] mb-1">
            {allWorkers.length - suggestedWorkers.length} more workers available
          </p>
        </div>
      )}

      {/* Skip banner */}
      {!addon && (
        <div className="text-center p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-xs text-[#94A3B8]">
            No worker needed? That's fine — you can also{" "}
            <Link
              href="/browse"
              className="text-[#FF5C39] hover:underline"
              style={{ fontWeight: 600 }}
            >
              book separately on Workkerz
            </Link>{" "}
            anytime.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CHECKOUT
// ═══════════════════════════════════════════════════════════════════════════════
export function EAurixCheckout() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = usePlatform();
  const [step, setStep] = useState(1);
  const [workerAddon, setWorkerAddon] = useState<WorkerAddon | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "US",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    deliveryNote: "",
    deliveryOption: "standard",
  });

  const delivery =
    form.deliveryOption === "express" ? 24.99 : cartTotal > 100 ? 0 : 12.99;
  const tax = parseFloat((cartTotal * 0.08).toFixed(2));
  const workerCost = workerAddon
    ? parseFloat((workerAddon.worker.hourlyRate * workerAddon.hours).toFixed(2))
    : 0;
  const grandTotal = parseFloat(
    (cartTotal + delivery + tax + workerCost).toFixed(2),
  );

  const update = (field: string, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const canNext = () => {
    if (step === 1)
      return (
        form.name &&
        form.email &&
        form.phone &&
        form.address &&
        form.city &&
        form.zip
      );
    if (step === 2)
      return (
        form.cardName && form.cardNumber && form.cardExpiry && form.cardCVV
      );
    return true; // step 3 (worker) and step 4 (review) are always valid
  };

  const handleConfirm = () => {
    const orderData = {
      form,
      cart,
      cartTotal,
      delivery,
      tax,
      grandTotal,
      workerAddon: workerAddon
        ? {
            workerName: workerAddon.worker.name,
            workerPhoto: workerAddon.worker.photo,
            workerSpecialty: workerAddon.worker.specialty,
            workerRate: workerAddon.worker.hourlyRate,
            hours: workerAddon.hours,
            cost: workerCost,
          }
        : null,
    };

    // Save first
    sessionStorage.setItem("eaurix-order", JSON.stringify(orderData));

    // Small delay ensures storage is ready
    setTimeout(() => {
      clearCart();
      router.push("/eaurix/confirmed");
    }, 100);
  };
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>
            Nothing to checkout
          </h2>
          <Link href="/eaurix/shop" className="text-[#0EA5E9] text-sm">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const inp =
    "w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#0EA5E9] transition-colors";

  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-20 pb-16">
      {/* Header */}
      <div className="bg-linear-to-r from-[#0F2744] to-[#0C3B5E] pt-6 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() =>
              step === 1 ? router.push("/eaurix/cart") : setStep(step - 1)
            }
            className="flex items-center gap-1.5 text-sky-300 hover:text-sky-100 text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1
            className="text-white mb-6"
            style={{ fontWeight: 800, fontSize: "1.4rem" }}
          >
            Checkout
          </h1>

          {/* Step indicators */}
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all"
                    style={{
                      fontWeight: 700,
                      backgroundColor:
                        step > s.id
                          ? "#0EA5E9"
                          : step === s.id
                            ? "#ffffff"
                            : "rgba(255,255,255,0.1)",
                      color:
                        step > s.id
                          ? "#ffffff"
                          : step === s.id
                            ? "#0F172A"
                            : "#94A3B8",
                    }}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span
                    className="text-xs hidden sm:block"
                    style={{
                      fontWeight: step === s.id ? 700 : 400,
                      color:
                        step === s.id
                          ? "#ffffff"
                          : step > s.id
                            ? "#38BDF8"
                            : "#94A3B8",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-3"
                    style={{
                      backgroundColor:
                        step > s.id ? "#0EA5E9" : "rgba(255,255,255,0.1)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              {/* ── STEP 1: Delivery ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-[#0F172A]" style={{ fontWeight: 700 }}>
                    Delivery Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs text-[#64748B] mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="John Smith"
                          className={inp + " pl-10"}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-xs text-[#64748B] mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className={inp + " pl-10"}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[#64748B] mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="john@example.com"
                        className={inp + " pl-10"}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[#64748B] mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        placeholder="123 Main Street"
                        className={inp + " pl-10"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label
                        className="block text-xs text-[#64748B] mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        placeholder="New York"
                        className={inp}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs text-[#64748B] mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        ZIP *
                      </label>
                      <input
                        type="text"
                        value={form.zip}
                        onChange={(e) => update("zip", e.target.value)}
                        placeholder="10001"
                        className={inp}
                      />
                    </div>
                  </div>

                  {/* Delivery options */}
                  <div>
                    <label
                      className="block text-xs text-[#64748B] mb-2"
                      style={{ fontWeight: 600 }}
                    >
                      Delivery Option
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: "standard",
                          label: "Standard Delivery",
                          sub: "3–5 business days",
                          price: cartTotal > 100 ? "FREE" : "$12.99",
                          icon: "📦",
                        },
                        {
                          id: "express",
                          label: "Express Delivery",
                          sub: "Next business day",
                          price: "$24.99",
                          icon: "⚡",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => update("deliveryOption", opt.id)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${form.deliveryOption === opt.id ? "border-[#0EA5E9] bg-sky-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <div className="flex-1">
                            <div
                              className="text-sm text-[#0F172A]"
                              style={{ fontWeight: 600 }}
                            >
                              {opt.label}
                            </div>
                            <div className="text-xs text-[#64748B]">
                              {opt.sub}
                            </div>
                          </div>
                          <div
                            className="text-sm"
                            style={{
                              fontWeight: 700,
                              color:
                                opt.price === "FREE" ? "#10B981" : "#0EA5E9",
                            }}
                          >
                            {opt.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[#64748B] mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Delivery Note (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.deliveryNote}
                      onChange={(e) => update("deliveryNote", e.target.value)}
                      placeholder="Leave at front door, etc."
                      className={inp + " resize-none"}
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 2: Payment ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-[#0F172A]" style={{ fontWeight: 700 }}>
                    Payment Details
                  </h2>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-2 text-sm text-emerald-700">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    Your payment is encrypted and secure.
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[#64748B] mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Cardholder Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.cardName}
                        onChange={(e) => update("cardName", e.target.value)}
                        placeholder="John Smith"
                        className={inp + " pl-10"}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[#64748B] mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Card Number *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.cardNumber}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);
                          update(
                            "cardNumber",
                            val.match(/.{1,4}/g)?.join(" ") || val,
                          );
                        }}
                        placeholder="1234 5678 9012 3456"
                        className={inp + " pl-10"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs text-[#64748B] mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        Expiry *
                      </label>
                      <input
                        type="text"
                        value={form.cardExpiry}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          update(
                            "cardExpiry",
                            val.length >= 3
                              ? `${val.slice(0, 2)}/${val.slice(2)}`
                              : val,
                          );
                        }}
                        placeholder="MM/YY"
                        className={inp}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs text-[#64748B] mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={form.cardCVV}
                        onChange={(e) =>
                          update(
                            "cardCVV",
                            e.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        placeholder="123"
                        className={inp}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    {["VISA", "MC", "AMEX", "PayPal"].map((m) => (
                      <span
                        key={m}
                        className="text-xs text-gray-400 border border-gray-200 px-2.5 py-1.5 rounded-lg"
                        style={{ fontWeight: 600 }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Worker Add-On ── */}
              {step === 3 && (
                <div>
                  <h2
                    className="text-[#0F172A] mb-5"
                    style={{ fontWeight: 700 }}
                  >
                    Add a Worker (Optional)
                  </h2>
                  <WorkerAddonStep
                    cart={cart.map((item) => ({
                      productId: item.productId,
                      name: item.name,
                      icon: item.icon || "",
                      color: item.color || "",
                    }))}
                    addon={workerAddon}
                    onSelect={setWorkerAddon}
                  />
                </div>
              )}

              {/* ── STEP 4: Review ── */}
              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-[#0F172A]" style={{ fontWeight: 700 }}>
                    Review Your Order
                  </h2>

                  {/* Delivery summary */}
                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-gray-100 text-sm space-y-2">
                    <div className="text-[#0F172A]" style={{ fontWeight: 600 }}>
                      Delivering to
                    </div>
                    <div className="text-[#64748B]">
                      {form.name} · {form.phone}
                    </div>
                    <div className="text-[#64748B]">
                      {form.address}, {form.city} {form.zip}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#0EA5E9]">
                      <Truck className="w-3.5 h-3.5" />
                      <span style={{ fontWeight: 600 }}>
                        {form.deliveryOption === "express"
                          ? "Express (Next Day)"
                          : "Standard (3–5 Days)"}{" "}
                        Delivery
                      </span>
                    </div>
                  </div>

                  {/* Worker add-on summary */}
                  {workerAddon && (
                    <div className="p-4 bg-orange-50 border-2 border-[#FF5C39] rounded-xl flex items-center gap-3">
                      <img
                        src={workerAddon.worker.photo}
                        alt={workerAddon.worker.name}
                        className="w-10 h-10 rounded-xl object-cover border border-orange-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(workerAddon.worker.name)}&background=f97316&color=fff`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm text-[#0F172A]"
                          style={{ fontWeight: 700 }}
                        >
                          <Briefcase className="w-3.5 h-3.5 inline mr-1 text-[#FF5C39]" />
                          {workerAddon.worker.name} · {workerAddon.hours}h
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {workerAddon.worker.specialty}
                        </div>
                      </div>
                      <div
                        className="text-[#FF5C39]"
                        style={{ fontWeight: 800 }}
                      >
                        +${workerCost.toFixed(2)}
                      </div>
                      <button
                        onClick={() => setWorkerAddon(null)}
                        className="ml-1 w-7 h-7 rounded-lg hover:bg-orange-100 flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm text-[#0F172A] line-clamp-1"
                            style={{ fontWeight: 600 }}
                          >
                            {item.name}
                          </div>
                          <div className="text-xs text-[#94A3B8]">
                            {item.brand} · Qty {item.qty}
                          </div>
                        </div>
                        <div
                          className="text-sm text-[#0F172A]"
                          style={{ fontWeight: 700 }}
                        >
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-sm text-[#0369A1] flex gap-2">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    By placing your order you agree to E-Aurix's terms of
                    service and returns policy.
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                <button
                  onClick={() =>
                    step === 1 ? router.push("/eaurix/cart") : setStep(step - 1)
                  }
                  className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {step === 1 ? "Back to Cart" : "Back"}
                </button>

                <button
                  onClick={step === 4 ? handleConfirm : () => setStep(step + 1)}
                  disabled={!canNext()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm text-white transition-all ${
                    canNext()
                      ? step === 4
                        ? "bg-[#FF5C39] hover:bg-[#e54e2e] shadow-lg shadow-orange-100"
                        : "bg-[#0EA5E9] hover:bg-[#0284C7] shadow-lg shadow-sky-200"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  {step === 4 ? (
                    <>
                      <Lock className="w-4 h-4" /> Place Order · $
                      {grandTotal.toFixed(2)}
                    </>
                  ) : step === 3 ? (
                    <>
                      {workerAddon ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Worker Added ·
                          Next
                        </>
                      ) : (
                        <>
                          Skip · Review <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24 shadow-sm">
              <h3 className="text-[#0F172A] mb-3" style={{ fontWeight: 700 }}>
                Order Total
              </h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">
                    Items ({cart.reduce((s, c) => s + c.qty, 0)})
                  </span>
                  <span className="text-[#0F172A]">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Delivery</span>
                  {delivery === 0 ? (
                    <span
                      className="text-emerald-600"
                      style={{ fontWeight: 600 }}
                    >
                      FREE
                    </span>
                  ) : (
                    <span className="text-[#0F172A]">
                      ${delivery.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Tax (8%)</span>
                  <span className="text-[#0F172A]">${tax.toFixed(2)}</span>
                </div>
                {workerAddon && (
                  <div className="flex justify-between items-center py-1 border-t border-orange-100 mt-1">
                    <span
                      className="text-[#FF5C39] flex items-center gap-1"
                      style={{ fontWeight: 600 }}
                    >
                      <Briefcase className="w-3 h-3" />
                      {workerAddon.worker.name.split(" ")[0]} (
                      {workerAddon.hours}h)
                    </span>
                    <span
                      className="text-[#FF5C39]"
                      style={{ fontWeight: 700 }}
                    >
                      +${workerCost.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-[#0F172A]" style={{ fontWeight: 700 }}>
                    Total
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      color: step === 4 ? "#FF5C39" : "#0EA5E9",
                    }}
                  >
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs text-[#0F172A] line-clamp-1"
                        style={{ fontWeight: 500 }}
                      >
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        ×{item.qty}
                      </div>
                    </div>
                    <div
                      className="text-xs text-[#0F172A]"
                      style={{ fontWeight: 600 }}
                    >
                      ${(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
                {workerAddon && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-orange-100">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-[#FF5C39]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs text-[#0F172A] line-clamp-1"
                        style={{ fontWeight: 500 }}
                      >
                        {workerAddon.worker.name}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        {workerAddon.hours}h service
                      </div>
                    </div>
                    <div
                      className="text-xs text-[#FF5C39]"
                      style={{ fontWeight: 600 }}
                    >
                      ${workerCost.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3 promo nudge */}
              {step < 3 && (
                <div className="mt-3 p-2.5 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#FF5C39] shrink-0" />
                  <p
                    className="text-[10px] text-[#FF5C39]"
                    style={{ fontWeight: 500 }}
                  >
                    You can add a worker in Step 3!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
