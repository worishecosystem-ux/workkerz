"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BookingReviewStep from "./components/BookingReviewStep";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import BookingAddressCard from "./components/BookingAddressCard";
import AddressSelectorModal, {
  type AddressItem,
} from "@/app/components/address/AddressSelectorModal";
import AddressFormModal from "@/app/components/address/AddressFormModal";
import BookingScheduleStep from "./components/BookingScheduleStep";
import BookingCustomerInfoMobile from "./components/BookingCustomerInfoMobile";
import { ChevronRight, Check, X, CheckCircle } from "lucide-react";
import { useAdmin } from "@/app/components/context/AdminContext";
import BookingPaymentStep from "./components/BookingPaymentStep";
import BookingSuccessScreen from "./components/BookingSuccessScreen";
const timeSlots = [
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

export default function BookingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { getWorkerById } = useAdmin();
  const worker = getWorkerById(id || "");
  const [showCalendar, setShowCalendar] = useState(false);
  const [step, setStep] = useState(1);
  const STORAGE_KEY = `booking-form-${id}`;
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    // SERVICE
    serviceType: "",
    description: "",

    // ADDRESS
    houseNo: "",
    address: "",
    landmark: "",

    city: "",
    district: "",
    state: "",
    country: "India",
    pincode: "",

    addressType: "home",

    // SCHEDULE
    date: "",
    time: "",
    bookingType: "",

    // USER
    name: "",
    phone: "",
    email: "",
    notes: "",

    // PAYMENT
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    cardName: "",

    paymentName: "",
    paymentUpi: "",
    transactionId: "",

    // MATERIALS
    selectedMaterials: {} as Record<string, number>,
  });
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(
    null,
  );

  const [showAddressModal, setShowAddressModal] = useState(false);

  const [loadingAddress, setLoadingAddress] = useState(true);

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(
    null,
  );
  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const stepRef = useRef(1);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  }, [step]);

  // Har step par ek history entry banao
  useEffect(() => {
    if (step > 1) {
      window.history.pushState({ step }, "");
    }
  }, [step]);

  // Browser/Android back ko handle karo
  useEffect(() => {
    const onPopState = () => {
      if (stepRef.current > 1) {
        setStep((prev) => prev - 1);

        // History khatam na ho isliye dubara push
        setTimeout(() => {
          window.history.pushState({ step: stepRef.current - 1 }, "");
        }, 0);

        return;
      }

      router.back();
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [router]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const show = Keyboard.addListener("keyboardWillShow", () => {
      setKeyboardOpen(true);
    });

    const hide = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardOpen(false);
    });

    return () => {
      show.then((l) => l.remove());
      hide.then((l) => l.remove());
    };
  }, []);
  // STATES
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const workerCategoryMap: Record<string, string[]> = {
    Labour: ["masonry", "tools", "safety"],
    Mechanic: ["tools", "safety"],
    Driver: ["moving"],
    "Home Contractor": ["masonry", "tools", "electrical"],
    "Home Services": ["tools", "safety"],
    Electrician: ["electrical", "tools"],
    Plumber: ["plumbing", "tools"],
  };

  const [bookedDates, setBookedDates] = useState<string[]>([]);
  // FETCH BOOKED DATES + SLOTS
  useEffect(() => {
    const fetchBookings = async () => {
      if (!worker?.id) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
        booking_date,
        booking_time,
        booking_status,
        worker_available
      `,
        )
        .eq("worker_id", worker.id)
        .in("booking_status", ["pending", "confirmed"])
        .eq("worker_available", false);

      if (error) {
        console.log(error);
        return;
      }

      // BOOKED DATES
      const dates = [...new Set(data.map((b) => b.booking_date))];

      setBookedDates(dates);

      // BOOKED SLOTS
      if (form.date) {
        const slots = data
          .filter((b) => b.booking_date === form.date)
          .map((b) => b.booking_time);

        setBookedSlots(slots);
      } else {
        setBookedSlots([]);
      }
    };

    fetchBookings();
  }, [form.date, worker?.id]);
  // LOAD SAVED FORM
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      const parsed = JSON.parse(savedData);

      setForm(parsed.form || parsed);

      if (parsed.step) {
        setStep(parsed.step);
      }
    }
  }, [STORAGE_KEY]);

  const bookingOptions =
    worker?.category === "Labour" ||
    worker?.category === "Construction" ||
    worker?.category === "Factory"
      ? [
          { label: "Half Day", value: "half_day" },
          { label: "Full Day", value: "full_day" },
          { label: "Weekly", value: "weekly" },
          { label: "Monthly", value: "monthly" },
        ]
      : worker?.category === "Driver"
        ? [
            { label: "4 Hours", value: "4h" },
            { label: "8 Hours", value: "8h" },
            { label: "12 Hours", value: "12h" },
            { label: "Full Day", value: "full_day" },
          ]
        : worker?.category === "Mechanic" ||
            worker?.category === "Home Contractor"
          ? [
              { label: "Inspection Visit", value: "visit" },
              { label: "Repair Work", value: "repair" },
              { label: "Emergency Service", value: "emergency" },
            ]
          : worker?.category === "Security"
            ? [
                { label: "Day Shift", value: "day_shift" },
                { label: "Night Shift", value: "night_shift" },
                { label: "Monthly", value: "monthly" },
              ]
            : [{ label: "Standard Service", value: "service" }];

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) return;

      // User addresses fetch
      const { data: addressData, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_email", user.email)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Address fetch error:", error);
      }

      // Default / First address
      if (addressData && addressData.length > 0) {
        setSelectedAddress(addressData[0]);
      }

      // User info
      setForm((prev) => ({
        ...prev,
        email: user.email || "",
        name:
          prev.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "",
      }));

      setLoadingAddress(false);
    };

    loadUser();
  }, []);

  // AUTO SAVE FORM
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        form,
        step,
      }),
    );
  }, [form, step, STORAGE_KEY]);

  // 1. useState ke niche add karo
  const [paymentType, setPaymentType] = useState<"full" | "fee">("fee");

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[#0F172A] mb-2" style={{ fontWeight: 700 }}>
            Worker not found
          </h2>
          <Link href="/browse" className="text-[#FF5C39]">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const serviceOptions = worker.services || [];

  // 2. totalCost ke niche add karo
  const totalCost =
    form.bookingType === "quick_service"
      ? worker.visitCharge || worker.startingPrice
      : form.bookingType === "half_day"
        ? worker.halfDayPrice || worker.startingPrice
        : form.bookingType === "full_day"
          ? worker.fullDayPrice || worker.startingPrice
          : form.bookingType === "monthly"
            ? worker.monthlyPrice || worker.startingPrice
            : worker.startingPrice;

  let serviceFee = 15;

  if (form.bookingType === "monthly") {
    serviceFee = 99;
  }
  const grandTotal = Number(totalCost || 0) + Number(serviceFee || 0);

  const payableAmount = paymentType === "full" ? grandTotal : serviceFee;

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });

      return;
    }

    sessionStorage.setItem(
      "booking-data",
      JSON.stringify({
        form,
        worker,
        selectedAddress,
        addressId: selectedAddress?.id,
        totalCost,
        serviceFee,
        grandTotal,
      }),
    );

    localStorage.removeItem(STORAGE_KEY);

    setShowSuccess(true);

    setTimeout(() => {
      router.replace(`/confirmation/${worker.id}`);
    }, 3500);
  };

  const steps = [
    { id: 1, label: "Basic" },
    { id: 2, label: "Schedule" },
    { id: 3, label: "Contact" },
    { id: 4, label: "Review" },
    { id: 5, label: "Payemnt" },
  ];

  const canProceed = () => {
    if (step === 1) {
      return (
        form.serviceType.trim() !== "" &&
        form.description.trim().length >= 10 &&
        selectedAddress
      );
    }

    if (step === 2) {
      return (
        form.date.trim() !== "" &&
        form.time.trim() !== "" &&
        (form.bookingType || "").trim() !== ""
      );
    }

    if (step === 3) {
      return (
        form.name.trim() !== "" &&
        form.phone.trim() !== "" &&
        form.email.trim() !== ""
      );
    }

    // STEP 4 FIXED
    if (step === 4) {
      return form.transactionId.trim() !== "";
    }

    return true;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const inp =
    "w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-gray-400 outline-none focus:border-[#FF5C39] transition-colors";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600">
        <div className="relative mx-auto px-4 pt-safe pt-4 pb-5">
          {/* Cancel Button */}
          <button
            onClick={handleBack} // ya onCancel
            className="absolute top-10 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-2xl  backdrop-blur-xl transition hover:bg-white/15 active:scale-95"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl p-4 mt-8">
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative shrink-0">
                <img
                  src={
                    worker.photo?.trim()
                      ? worker.photo
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=f97316&color=fff`
                  }
                  alt={worker.name}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=f97316&color=fff`;
                  }}
                  className="w-13 h-13 rounded-2xl object-cover-contaibn border-2 border-white/15"
                />

                {worker.available && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0F172A]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 ">
                <h2 className=" flex text-white text-[15px] font-bold truncate gap-9">
                  {worker.name}{" "}
                  <span className="px-3 py-1 rounded-full bg-emerald-300/35 text-emerald-100 text-xs font-semibold">
                    ✓ Verified
                  </span>
                </h2>

                <div className="mt-1 flex items-center gap-2 min-w-0">
                  <p className="text-[12px] text-white/70 truncate">
                    {worker.specialty}
                  </p>

                  <span className="shrink-0 rounded-full bg-[#FF5C39]/15 px-3 py-1 text-[10px] font-medium text-[#FFB199]">
                    {worker.completedJobs}+ Works
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Progress */}
      <div className="fixed top-30 left-0 right-0 z-40 bg-white/55 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Progress Bar */}
          <div className="relative h-1 rounded-full bg-slate-200 overflow-hidden mb-6">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-[#FF7A59] to-[#FF5C39] transition-all duration-500"
              style={{
                width: `${((step - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="flex justify-between items-start">
            {steps.map((s) => {
              const completed = step > s.id;
              const active = step === s.id;

              return (
                <div key={s.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`
                flex items-center justify-center
                w-9 h-9 rounded-full
                text-xs font-bold
                transition-all duration-300
                ${
                  completed
                    ? "bg-[#FF5C39] text-white"
                    : active
                      ? "border-2 border-[#FF5C39] bg-white text-[#FF5C39] scale-110"
                      : "bg-slate-200 text-slate-500"
                }
              `}
                  >
                    {completed ? <Check className="w-4 h-4" /> : s.id}
                  </div>

                  <span
                    className={`mt-2 text-[10px] text-center leading-3 transition-all ${
                      active || completed
                        ? "text-slate-900 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current Step */}
          <div className="mt-4">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-[#FF7A59] to-[#FF5C39] transition-all duration-500 ease-in-out"
                style={{
                  width: `${((step - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto items-start px-4 sm:px-6 pt-65 pb-32">
        {/* Form */}
        <div className="">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-2">
              {/* Heading */}
              <div>
                <h2 className="text-[#000000] font-bold">Service Details</h2>

                <p className="text-[#2b2c2e] text-sm">
                  Tell us what work needs to be done and where.
                </p>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm text-[#25272b] mb-2">
                  Service Type
                  <span className="text-red-400 ml-1">*</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {serviceOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setForm({
                          ...form,
                          serviceType: opt,
                        })
                      }
                      className={`rounded-xl border px-3 py-2 text-sm transition-all duration-200 ${
                        form.serviceType === opt
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-black/15 bg-black/5 text-black hover:bg-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#25272b]">
                    Work Description
                    <span className="ml-1 text-red-400">*</span>
                  </label>

                  <span
                    className={`text-[11px] ${
                      form.description.length > 180
                        ? "text-orange-400"
                        : "text-black/50"
                    }`}
                  >
                    {form.description.length}/200
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={200}
                  value={form.description}
                  enterKeyHint="done"
                  autoComplete="off"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                  spellCheck={true}
                  placeholder="Describe your work..."
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full h-14 rounded-2xl border border-black/10 bg-black/5 px-4 text-sm text-black placeholder:text-black/35 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-black/40">
                    Add work details for better matching.
                  </span>

                  {form.description.trim().length >= 10 ? (
                    <span className="font-medium text-green-500">
                      ✓ Looks good
                    </span>
                  ) : (
                    <span className="text-orange-400">Min 10 characters</span>
                  )}
                </div>
              </div>
              <div className="mt-5 mb-2">
                <label className="text-l font-medium text-[#25272b]">
                  Work location for best service
                  <span className="text-red-400 ml-1">*</span>
                </label>
                {/* Service Address */}
                <BookingAddressCard
                  address={selectedAddress}
                  loading={loadingAddress}
                  onChange={() => setShowAddressModal(true)}
                  onAdd={() => setShowAddressModal(true)}
                />
              </div>
            </div>
          )}
          {/* STEP 2 */}
          {step === 2 && (
            <BookingScheduleStep
              form={form}
              setForm={setForm}
              bookedDates={bookedDates}
              bookedSlots={bookedSlots}
              timeSlots={timeSlots}
              showCalendar={showCalendar}
              setShowCalendar={setShowCalendar}
              worker={worker}
            />
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <BookingCustomerInfoMobile form={form} setForm={setForm} />
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <BookingReviewStep
              worker={worker}
              form={form}
              address={selectedAddress}
              totalCost={totalCost}
              serviceFee={serviceFee}
              grandTotal={grandTotal}
              payableAmount={payableAmount}
              paymentType={paymentType}
              onProceed={() => setStep(5)}
              onEdit={(step) => setStep(step)}
            />
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <BookingPaymentStep
              form={form}
              setForm={setForm}
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              payableAmount={payableAmount}
              grandTotal={grandTotal}
              inp={inp}
            />
          )}
        </div>
      </div>
      {/* Mobile Bottom Bar */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] transition-all duration-300 ${
          keyboardOpen || step === 4
            ? "translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        }`}
      >
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full h-13 rounded-2xl flex items-center justify-center gap-2 text-[15px] font-bold transition-all ${
            canProceed()
              ? "bg-linear-to-r from-[#59dbff] to-[#19e2ca] text-white shadow-lg shadow-[#FF5C39]/30 active:scale-[0.98]"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          {step === 5 ? (
            <>
              Complete Booking
              <CheckCircle className="w-5 h-5" />
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
      <AddressSelectorModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={(item) => {
          setSelectedAddress(item);

          setForm((prev) => ({
            ...prev,
            houseNo: item.house_no ?? "",
            address: item.address ?? "",
            landmark: item.landmark ?? "",
            city: item.city ?? "",
            district: item.district ?? "",
            state: item.state ?? "",
            country: item.country ?? "India",
            pincode: item.pincode ?? "",
            addressType: item.address_type ?? "home",
          }));

          setShowAddressModal(false);
        }}
        onAdd={() => {
          setShowAddressModal(false);
          setShowAddressForm(true);
        }}
        onEdit={(item) => {
          setEditingAddress(item);
          setShowAddressModal(false);
          setShowAddressForm(true);
        }}
      />

      <AddressFormModal
        open={showAddressForm}
        editingAddress={editingAddress}
        onBack={() => {
          setShowAddressForm(false);
          setShowAddressModal(true);
        }}
        onClose={() => setShowAddressForm(false)}
        onSaved={async () => {
          setShowAddressForm(false);

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user?.email) return;

          const { data } = await supabase
            .from("customer_addresses")
            .select("*")
            .eq("customer_email", user.email)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false });

          if (data?.length) {
            setSelectedAddress(data[0]);
          }

          if (data?.length) {
            setSelectedAddress(data[0]);
          }
        }}
      />
      {showSuccess && <BookingSuccessScreen />}
    </div>
  );
}
