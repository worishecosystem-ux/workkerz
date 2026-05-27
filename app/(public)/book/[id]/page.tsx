"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  User,
  Phone,
  Mail,
  Lock,
  Star,
  Info,
  CalendarDays,
  Timer,
  Clock3,
  X,
  BadgeCheck,
  ShieldCheck,
  QrCode,
  Receipt,
  Mic,
  MicOff,
  CheckCircle,
} from "lucide-react";
import { useAdmin } from "@/app/components/context/AdminContext";

const steps = [
  { id: 1, label: "Service Details" },
  { id: 2, label: "Schedule" },
  { id: 3, label: "Your Info" },
  { id: 4, label: "Payment" },
];

const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

const durations = [
  { label: "1 hour", hours: 1 },
  { label: "2 hours", hours: 2 },
  { label: "3 hours", hours: 3 },
  { label: "4 hours", hours: 4 },
  { label: "6 hours", hours: 6 },
  { label: "Full Day (8h)", hours: 8 },
];

function CalendarPicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (d: string) => void;
  disabledDates?: string[];
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const formatDate = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isToday = (day: number) =>
    new Date(viewYear, viewMonth, day).toDateString() === today.toDateString();
  const isPast = (day: number) =>
    new Date(viewYear, viewMonth, day) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span style={{ fontWeight: 600, color: "#0F172A" }}>
          {monthName} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="text-center text-xs text-[#94A3B8] py-1"
            style={{ fontWeight: 500 }}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(day);
          const selected = selectedDate === dateStr;
          const past = isPast(day);
          const todayFlag = isToday(day);
          return (
            <button
              key={day}
              onClick={() => !past && onSelect(dateStr)}
              disabled={past}
              className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                selected
                  ? "bg-[#FF5C39] text-white"
                  : past
                    ? "text-gray-200 cursor-not-allowed"
                    : todayFlag
                      ? "bg-orange-50 text-[#FF5C39] border border-[#FF5C39]/30"
                      : "hover:bg-gray-100 text-[#475569]"
              }`}
              style={{ fontWeight: selected || todayFlag ? 600 : 400 }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { getWorkerById } = useAdmin();
  const worker = getWorkerById(id || "");
  const [showCalendar, setShowCalendar] = useState(false);
  const [step, setStep] = useState(1);
  const STORAGE_KEY = `booking-form-${id}`;

  const [form, setForm] = useState({
    serviceType: "",
    description: "",

    // ADDRESS
    pincode: "",
    district: "",
    state: "",
    city: "",
    address: "",

    // SCHEDULE
    date: "",
    time: "",
    duration: 2,

    // USER INFO
    name: "",
    phone: "",
    email: "",
    notes: "",

    // PAYMENT
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    cardName: "",

    // MATERIALS
    selectedMaterials: {} as Record<string, number>,

    paymentName: "",
    paymentUpi: "",
    transactionId: "",
  });
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

  const allowedCategories = worker
    ? workerCategoryMap[worker.category] || []
    : [];

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

  const [pincodeLoading, setPincodeLoading] = useState(false);

  const fetchLocationByPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;

    try {
      setPincodeLoading(true);

      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error("API failed");
      }

      const data = await res.json();

      console.log(data);

      if (
        !data ||
        !data[0] ||
        data[0].Status !== "Success" ||
        !data[0].PostOffice
      ) {
        return;
      }

      const office = data[0].PostOffice[0];

      setForm((prev) => ({
        ...prev,
        district: office.District || "",
        state: office.State || "",
        city: office.Block || office.Name || office.Division || "",
      }));
    } catch (err) {
      console.log("Pincode fetch error:", err);

      // FALLBACK MANUAL
      if (pincode === "462038") {
        setForm((prev) => ({
          ...prev,
          district: "Bhopal",
          state: "Madhya Pradesh",
          city: "Bhopal",
        }));
      }
    } finally {
      setPincodeLoading(false);
    }
  };

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
  const totalCost = worker.hourlyRate * form.duration;

  const serviceFee = 15;

  const grandTotal = totalCost + serviceFee;

  const payableAmount = paymentType === "full" ? grandTotal : serviceFee;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      sessionStorage.setItem(
        "booking-data",
        JSON.stringify({
          form,
          worker,
          totalCost,
          serviceFee,
        }),
      );
      localStorage.removeItem(STORAGE_KEY);

      router.push(`/confirmation/${worker.id}`);
      router.push(`/confirmation/${worker.id}`);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push(`/workers/${worker.id}`);
  };

  const canProceed = () => {
    if (step === 1) {
      return form.serviceType.trim() !== "" && form.address.trim() !== "";
    }

    if (step === 2) {
      return form.date.trim() !== "" && form.time.trim() !== "";
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0F172A] pt-16">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="">
            {/* GLOW */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#FF5C39]/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-start gap-4">
                {/* PHOTO */}
                <div className="relative shrink-0">
                  <img
                    src={
                      worker.photo && worker.photo.trim() !== ""
                        ? worker.photo
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=f97316&color=fff`
                    }
                    alt={worker.name}
                    className="w-25 h-28 rounded-3xl object-cover border-3 border-white/20 shadow-xl"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=f97316&color=fff`;
                    }}
                  />

                  {worker.available && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0F172A]" />
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3
                        className="text-white text-[1.05rem] truncate"
                        style={{ fontWeight: 800 }}
                      >
                        {worker.name}
                      </h3>

                      <p className="text-white/70 text-sm mt-0.5 truncate">
                        {worker.specialty}
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur text-white text-xs">
                      Verified
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />

                      <span
                        className="text-white text-sm"
                        style={{ fontWeight: 700 }}
                      >
                        {worker.rating}
                      </span>

                      <span className="text-white/60 text-xs">
                        ({worker.reviewCount})
                      </span>
                    </div>

                    <div className="w-1 h-1 rounded-full bg-white/30" />

                    <div className="text-white/80 text-sm">
                      {worker.completedJobs}+ works
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Step progress */}
          <div className="flex items-center gap-2 mt-6">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                      step > s.id
                        ? "bg-[#FF5C39] text-white"
                        : step === s.id
                          ? "bg-white text-[#0F172A]"
                          : "bg-white/10 text-gray-400"
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span
                    className={`text-xs hidden sm:block ${
                      step === s.id
                        ? "text-white"
                        : step > s.id
                          ? "text-[#FF5C39]"
                          : "text-gray-500"
                    }`}
                    style={{ fontWeight: step === s.id ? 600 : 400 }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1"
                    style={{
                      backgroundColor:
                        step > s.id ? "#FF5C39" : "rgba(255,255,255,0.1)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      
        <div className="max-w-8xl  items-start px-4 sm:px-6 py-5">
          {/* Form */}
          <div className="">
            <div className="bg-white rounded-4xl border border-gray-100 p-5 sm:p-7 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2
                      className="text-[#0F172A] mb-1"
                      style={{ fontWeight: 700 }}
                    >
                      Service Details
                    </h2>
                    <p className="text-[#64748B] text-sm">
                      Tell us what you need done
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-[#0F172A] mb-2">
                      Service Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {serviceOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setForm({ ...form, serviceType: opt })}
                          className={`text-sm px-3 py-2.5 rounded-xl border transition-all text-left ${
                            form.serviceType === opt
                              ? "border-[#FF5C39] bg-orange-50 text-[#FF5C39]"
                              : "border-gray-200 text-[#475569] hover:border-gray-300"
                          }`}
                          style={{
                            fontWeight: form.serviceType === opt ? 600 : 400,
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#0F172A] mb-2">
                      Work Description
                    </label>

                    <div className="relative">
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe the work you need done in detail..."
                        className={inp + " resize-none pr-14"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-[#0F172A] mb-2">
                        Pincode *
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        <input
                          type="text"
                          maxLength={6}
                          value={form.pincode || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");

                            setForm({
                              ...form,
                              pincode: value,
                            });

                            if (value.length === 6) {
                              fetchLocationByPincode(value);
                            }
                          }}
                          placeholder="Enter 6 digit pincode"
                          className={inp + " pl-11"}
                        />

                        {pincodeLoading && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[#FF5C39] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DISTRICT + STATE */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#0F172A] mb-2">
                          District
                        </label>

                        <input
                          type="text"
                          value={form.district || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              district: e.target.value,
                            })
                          }
                          placeholder="District"
                          className={inp}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[#0F172A] mb-2">
                          State
                        </label>

                        <input
                          type="text"
                          value={form.state || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              state: e.target.value,
                            })
                          }
                          placeholder="State"
                          className={inp}
                        />
                      </div>
                    </div>

                    {/* CITY */}
                    <div>
                      <label className="block text-sm text-[#0F172A] mb-2">
                        Area / City
                      </label>

                      <input
                        type="text"
                        value={form.city || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            city: e.target.value,
                          })
                        }
                        placeholder="Area / City"
                        className={inp}
                      />
                    </div>

                    {/* FULL ADDRESS */}
                    <div>
                      <label className="block text-sm text-[#0F172A] mb-2">
                        Full Address *
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-5 w-4 h-4 text-gray-400" />

                        <textarea
                          rows={4}
                          value={form.address}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              address: e.target.value,
                            })
                          }
                          placeholder="House no, street, landmark..."
                          className={inp + " pl-11 resize-none"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2
                        className="text-[#0F172A] text-[1.3rem]"
                        style={{ fontWeight: 800 }}
                      >
                        Schedule Booking
                      </h2>

                      <p className="text-[#64748B] text-sm mt-1">
                        Pick your preferred booking slot
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#FFF4EF] flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5 text-[#FF5C39]" />
                    </div>
                  </div>

                  {/* DATE SELECTOR */}
                  <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div
                          className="text-[#0F172A] text-sm"
                          style={{ fontWeight: 700 }}
                        >
                          Choose Date
                        </div>

                        <div className="text-xs text-[#94A3B8] mt-1">
                          Next available booking days
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-full bg-[#FFF4EF] text-[#FF5C39] text-xs font-bold">
                        Live Availability
                      </div>
                    </div>

                    {/* DATE CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date();

                        date.setDate(date.getDate() + i);

                        const iso = date.toISOString().split("T")[0];

                        const active = form.date === iso;

                        const fullyBooked = bookedDates.includes(iso);

                        return (
                          <button
                            key={iso}
                            disabled={fullyBooked}
                            onClick={() =>
                              setForm({
                                ...form,
                                date: iso,
                                time: "",
                              })
                            }
                            className={`relative rounded-3xl border p-4 transition-all duration-200 text-left overflow-hidden ${
                              active
                                ? "bg-[#FF5C39] border-[#FF5C39] text-white shadow-lg shadow-orange-200 scale-[1.02]"
                                : fullyBooked
                                  ? "bg-red-50 border-red-200 opacity-70 cursor-not-allowed"
                                  : "bg-white border-gray-200 hover:border-[#FF5C39]/40 hover:bg-orange-50 hover:-translate-y-0.5"
                            }`}
                          >
                            {/* ACTIVE DOT */}
                            {active && (
                              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white animate-pulse" />
                            )}

                            {/* BOOKED BADGE */}
                            {fullyBooked && (
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500 text-white text-[9px] font-bold shadow">
                                FULL
                              </div>
                            )}

                            {/* DAY */}
                            <div
                              className={`text-xs ${
                                active
                                  ? "text-white/70"
                                  : fullyBooked
                                    ? "text-red-400"
                                    : "text-[#94A3B8]"
                              }`}
                              style={{
                                fontWeight: 700,
                              }}
                            >
                              {date.toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </div>

                            {/* NUMBER */}
                            <div
                              className={`mt-3 text-3xl ${
                                fullyBooked ? "text-red-500" : ""
                              }`}
                              style={{
                                fontWeight: 900,
                              }}
                            >
                              {date.getDate()}
                            </div>

                            {/* MONTH */}
                            <div
                              className={`text-xs mt-2 ${
                                active
                                  ? "text-white/80"
                                  : fullyBooked
                                    ? "text-red-400"
                                    : "text-[#64748B]"
                              }`}
                            >
                              {date.toLocaleDateString("en-US", {
                                month: "short",
                              })}
                            </div>

                            {/* STATUS */}
                            <div
                              className={`mt-4 text-[10px] font-bold tracking-wide ${
                                active
                                  ? "text-white"
                                  : fullyBooked
                                    ? "text-red-500"
                                    : "text-emerald-600"
                              }`}
                            >
                              {active
                                ? "SELECTED"
                                : fullyBooked
                                  ? "UNAVAILABLE"
                                  : "AVAILABLE"}
                            </div>
                          </button>
                        );
                      })}

                      {/* OTHER DATE BUTTON */}
                      <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="rounded-3xl border border-dashed border-gray-300 bg-[#FAFAFA] hover:border-[#FF5C39] hover:bg-orange-50 transition-all duration-200 p-2 flex flex-col items-center justify-center"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-3">
                          <CalendarDays className="w-5 h-5 text-[#FF5C39]" />
                        </div>

                        <div
                          className="text-sm text-[#0F172A]"
                          style={{
                            fontWeight: 700,
                          }}
                        >
                          Other Date
                        </div>

                        <div className="text-[10px] text-[#94A3B8] mt-1">
                          Open calendar
                        </div>
                      </button>
                    </div>

                    {/* CALENDAR */}
                    {showCalendar && (
                      <div className="mt-5 rounded-3xl border border-gray-100 bg-[#FCFCFC] p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div
                              className="text-[#0F172A] text-sm"
                              style={{
                                fontWeight: 700,
                              }}
                            >
                              Select Custom Date
                            </div>

                            <div className="text-xs text-[#94A3B8] mt-1">
                              Choose any future booking date
                            </div>
                          </div>

                          <button
                            onClick={() => setShowCalendar(false)}
                            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>

                        <CalendarPicker
                          selectedDate={form.date}
                          disabledDates={bookedDates}
                          onSelect={(d) => {
                            if (bookedDates.includes(d)) return;

                            setForm({
                              ...form,
                              date: d,
                              time: "",
                            });

                            setShowCalendar(false);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* TIME SECTION */}
                  {form.date && (
                    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-2xl bg-[#EEF9FF] flex items-center justify-center shrink-0">
                          <Clock3 className="w-5 h-5 text-[#0EA5E9]" />
                        </div>

                        <div>
                          <div
                            className="text-[#0F172A] text-sm"
                            style={{ fontWeight: 700 }}
                          >
                            Select Time Slot
                          </div>

                          <div className="text-xs text-[#94A3B8] mt-0.5">
                            Available worker timings
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {timeSlots.map((slot) => {
                          const active = form.time === slot;

                          const booked = bookedSlots.includes(slot);

                          return (
                            <button
                              key={slot}
                              disabled={booked}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  time: slot,
                                })
                              }
                              className={`rounded-2xl border px-4 py-4 transition-all duration-200 ${
                                booked
                                  ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-70"
                                  : active
                                    ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg"
                                    : "bg-white border-gray-200 hover:border-[#0F172A]/20 hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className="text-sm"
                                style={{
                                  fontWeight: 800,
                                }}
                              >
                                {slot}
                              </div>

                              <div
                                className={`text-[10px] mt-1 ${
                                  booked
                                    ? "text-red-400"
                                    : active
                                      ? "text-white/70"
                                      : "text-[#94A3B8]"
                                }`}
                              >
                                {booked ? "Booked" : "Available"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* DURATION */}
                  {form.time && (
                    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-2xl bg-[#F3F4FF] flex items-center justify-center shrink-0">
                          <Timer className="w-5 h-5 text-[#6366F1]" />
                        </div>

                        <div>
                          <div
                            className="text-[#0F172A] text-sm"
                            style={{ fontWeight: 700 }}
                          >
                            Booking Duration
                          </div>

                          <div className="text-xs text-[#94A3B8] mt-0.5">
                            Estimated working hours
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {durations.map((d) => {
                          const active = form.duration === d.hours;

                          return (
                            <button
                              key={d.hours}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  duration: d.hours,
                                })
                              }
                              className={`rounded-2xl border p-4 transition-all duration-200 ${
                                active
                                  ? "bg-[#6366F1] border-[#6366F1] text-white shadow-lg shadow-indigo-100"
                                  : "bg-white border-gray-200 hover:border-[#6366F1]/30 hover:bg-indigo-50"
                              }`}
                            >
                              <div
                                className="text-base"
                                style={{
                                  fontWeight: 800,
                                }}
                              >
                                {d.label}
                              </div>

                              <div
                                className={`text-[10px] mt-1 ${
                                  active ? "text-white/70" : "text-[#94A3B8]"
                                }`}
                              >
                                Duration
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* HEADER */}

                  <div>
                    <h2
                      className="text-[#0F172A] text-[1.35rem] mb-1"
                      style={{ fontWeight: 800 }}
                    >
                      Your Information
                    </h2>

                    <p className="text-[#64748B] text-sm">
                      Worker will contact you on these details
                    </p>
                  </div>

                  {/* NAME + PHONE */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NAME */}

                    <div>
                      <label className="block text-sm text-[#0F172A] mb-2 font-medium">
                        Full Name *
                      </label>

                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter your full name"
                          className="
              w-full h-14
              rounded-2xl
              border border-gray-200
              bg-[#F8FAFC]
              pl-11 pr-4
              text-sm text-[#0F172A]
              placeholder:text-[#94A3B8]
              outline-none
              focus:border-[#FF5C39]
              focus:bg-white
              transition-all
            "
                        />
                      </div>
                    </div>

                    {/* PHONE */}

                    <div>
                      <label className="block text-sm text-[#0F172A] mb-2 font-medium">
                        Mobile Number *
                      </label>

                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                        <span
                          className="
              absolute left-11 top-1/2 -translate-y-1/2
              text-sm font-semibold text-[#0F172A]
            "
                        >
                          +91
                        </span>

                        <input
                          type="tel"
                          maxLength={10}
                          value={form.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");

                            setForm({
                              ...form,
                              phone: value,
                            });
                          }}
                          placeholder="9876543210"
                          className="
              w-full h-14
              rounded-2xl
              border border-gray-200
              bg-[#F8FAFC]
              pl-21 pr-4
              text-sm text-[#0F172A]
              placeholder:text-[#94A3B8]
              outline-none
              focus:border-[#FF5C39]
              focus:bg-white
              transition-all
            "
                        />
                      </div>
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label className="block text-sm text-[#0F172A] mb-2 font-medium">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            email: e.target.value,
                          })
                        }
                        placeholder="example@gmail.com"
                        className="
            w-full h-14
            rounded-2xl
            border border-gray-200
            bg-[#F8FAFC]
            pl-11 pr-4
            text-sm text-[#0F172A]
            placeholder:text-[#94A3B8]
            outline-none
            focus:border-[#FF5C39]
            focus:bg-white
            transition-all
          "
                      />
                    </div>
                  </div>

                  {/* NOTES */}

                  <div>
                    <label className="block text-sm text-[#0F172A] mb-2 font-medium">
                      Additional Notes
                    </label>

                    <div className="relative">
                      <textarea
                        rows={4}
                        value={form.notes}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Extra details for worker..."
                        className="
        w-full
        rounded-2xl
        border border-gray-200
        bg-[#F8FAFC]
        px-4 py-4 pr-14
        text-sm
        resize-none
        outline-none
      "
                      />
                    </div>
                  </div>

                  {/* INFO BOX */}

                  <div
                    className="
        rounded-2xl
        border border-blue-100
        bg-blue-50
        p-4
        flex gap-3
      "
                  >
                    <Info className="w-5 h-5 text-[#0EA5E9] shrink-0 mt-0.5" />

                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">
                        Contact Information
                      </div>

                      <div className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        Worker and support team will use this number for booking
                        updates and arrival confirmation.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-6">
                  {/* HEADER */}
                  <div>
                    <h2
                      className="text-[#0F172A] text-[1.35rem] mb-1"
                      style={{ fontWeight: 800 }}
                    >
                      Complete Payment
                    </h2>

                    <p className="text-[#64748B] text-sm">
                      Scan QR & enter transaction ID to continue
                    </p>
                  </div>

                  {/* PAYMENT CARD */}
                  <div className="rounded-4xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                    {/* TOP */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      {/* LEFT */}
                      <div className="flex-1">
                        {/* PAYMENT TYPE */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <button
                            type="button"
                            onClick={() => setPaymentType("fee")}
                            className={`h-13 rounded-2xl text-sm font-bold transition-all ${
                              paymentType === "fee"
                                ? "bg-[#FF5C39] text-white shadow-lg shadow-orange-200"
                                : "bg-white border border-gray-200 text-[#0F172A]"
                            }`}
                          >
                            Booking Fee ₹15
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentType("full")}
                            className={`h-13 rounded-2xl text-sm font-bold transition-all ${
                              paymentType === "full"
                                ? "bg-[#0F172A] text-white shadow-lg"
                                : "bg-white border border-gray-200 text-[#0F172A]"
                            }`}
                          >
                            Full Pay ₹{grandTotal}
                          </button>
                        </div>

                        {/* PAY TEXT */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div>
                            <div className="text-3xl sm:text-4xl font-black text-[#0F172A]">
                              ₹{payableAmount}
                            </div>

                            <div className="text-sm text-[#64748B] mt-1">
                              UPI / Paytm / PhonePe / GPay
                            </div>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-[#E8FFF3] text-[#10B981] text-xs font-semibold">
                            Secure
                          </div>
                        </div>

                        {/* APPS */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
  {/* GPay */}
  <a
    href={`gpay://upi/pay?pa=8602190366@ptaxis&pn=Workkerz&am=${payableAmount}&cu=INR`}
    className="h-14 rounded-2xl border border-gray-200 hover:border-[#FF5C39] flex items-center justify-center gap-2 px-3 transition-all"
  >
    <img
      src="/gpay.png"
      alt="GPay"
      className="w-8 h-8 object-contain"
    />

    <span className="text-sm font-semibold text-[#0F172A]">
      GPay
    </span>
  </a>

  {/* PhonePe */}
  <a
    href={`phonepe://pay?pa=8602190366@ptaxis&pn=Workkerz&am=${payableAmount}&cu=INR`}
    className="h-14 rounded-2xl border border-gray-200 hover:border-[#FF5C39] flex items-center justify-center p-3 transition-all"
  >
    <img
      src="/phonepe.svg"
      alt="PhonePe"
      className="w-28 h-8 object-contain"
    />
  </a>

  {/* Paytm */}
  <a
    href={`paytmmp://pay?pa=8602190366@ptaxis&pn=Workkerz&am=${payableAmount}&cu=INR`}
    className="h-14 rounded-2xl border border-gray-200 hover:border-[#FF5C39] flex items-center justify-center p-3 transition-all"
  >
    <img
      src="/paytm.png"
      alt="Paytm"
      className="w-28 h-8 object-contain"
    />
  </a>

  {/* Amazon Pay */}
  <a
    href={`amazonpay://pay?pa=8602190366@ptaxis&pn=Workkerz&am=${payableAmount}&cu=INR`}
    className="h-14 rounded-2xl border border-gray-200 hover:border-[#FF5C39] flex items-center justify-center p-3 transition-all"
  >
    <img
      src="/amazon_pay.svg"
      alt="Amazon Pay"
      className="w-24 h-7 object-contain"
    />
  </a>
</div>
                      </div>

                      {/* QR */}
                      <div className="w-full max-w-75 mx-auto lg:mx-0">
                        <div className="rounded-4xl border-10 border-[#0F172A] bg-white p-4 shadow-2xl">
                          {/* QR TOP */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-sm font-black text-[#0F172A]">
                                WORKKERZ
                              </div>

                              <div className="text-[11px] text-[#64748B]">
                                Secure UPI Payment
                              </div>
                            </div>

                            <div className="px-2 py-1 rounded-lg bg-[#EEF9FF] text-[#0EA5E9] text-[10px]">
                              UPI
                            </div>
                          </div>

                          {/* QR IMAGE */}
                          <div className="rounded-2xl overflow-hidden border border-gray-200">
                            <img
                              src="/workkerzpay.jpeg"
                              alt="QR"
                              className="w-full aspect-square object-cover"
                            />
                          </div>

                          {/* QR FOOTER */}
                          <div className="mt-4 text-center">
                            <div className="text-xl font-black text-[#0F172A]">
                              Scan & Pay ₹{payableAmount}
                            </div>

                            <div className="text-xs text-[#64748B] mt-1">
                              Instant secure payment
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TRANSACTION */}
                    <div className="mt-7">
                      <label className="block text-sm text-[#0F172A] mb-2">
                        Transaction ID *
                      </label>

                      <div className="relative">
                        <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        <input
                          type="text"
                          value={form.transactionId}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              transactionId: e.target.value,
                            })
                          }
                          placeholder="Enter UPI transaction/reference ID"
                          className={inp + " pl-11"}
                        />
                      </div>
                    </div>

                    {/* NOTE */}
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#0EA5E9] shrink-0 mt-0.5" />

                      <div>
                        <div className="text-sm font-bold text-[#0F172A]">
                          Booking Verification
                        </div>

                        <div className="text-xs text-[#64748B] mt-1">
                          Booking continues after valid payment verification.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-end mt-5">
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`min-w-35 h-12 flex items-center justify-center gap-2 px-6 rounded-2xl text-sm font-bold transition-all duration-200 shrink-0 ${canProceed() ? "bg-[#FF5C39] hover:bg-[#e54e2e] text-white shadow-lg shadow-orange-200" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                >
                  {step === 4 ? (
                    <>
                      Continue <CheckCircle className="w-4 h-4" />
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
        </div>
      </div>
  );
}
