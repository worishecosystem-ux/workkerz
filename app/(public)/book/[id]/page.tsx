"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import BookingReviewStep from "./components/BookingReviewStep";
import BookingScheduleStep from "./components/BookingScheduleStep";
import BookingCustomerInfoMobile from "./components/BookingCustomerInfoMobile";
import BookingPaymentStep from "./components/BookingPaymentStep";
import BookingAddressCard from "./components/BookingAddressCard";
import BookingSuccessScreen from "./components/BookingSuccessScreen";

import AddressSelectorModal, {
  type AddressItem,
} from "@/app/components/address/AddressSelectorModal";

import AddressFormModal from "@/app/components/address/AddressFormModal";

import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";

import {
  ChevronRight,
  Check,
  X,
  CheckCircle,
} from "lucide-react";

import { useAdmin } from "@/app/components/context/AdminContext";

const timeSlots = [
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
];

export default function BookingPage() {
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();

  const { getWorkerById } = useAdmin();

  const worker = getWorkerById(id || "");

  const STORAGE_KEY = `booking-form-${id}`;

  const [showCalendar, setShowCalendar] = useState(false);

  const [step, setStep] = useState(1);

  const [keyboardOpen, setKeyboardOpen] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [paymentType, setPaymentType] =
    useState<"full" | "fee">("fee");

  const [selectedAddress, setSelectedAddress] =
    useState<AddressItem | null>(null);

  const [showAddressModal, setShowAddressModal] =
    useState(false);

  const [loadingAddress, setLoadingAddress] =
    useState(true);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [editingAddress, setEditingAddress] =
    useState<AddressItem | null>(null);

  const [bookedSlots, setBookedSlots] =
    useState<string[]>([]);

  const [bookedDates, setBookedDates] =
    useState<string[]>([]);

  const stepRef = useRef(1);

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

    // CUSTOMER
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

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  // ============================================================
  // STEP REF
  // ============================================================

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // ============================================================
  // SCROLL TOP
  // ============================================================

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  }, [step]);

  // ============================================================
  // HISTORY
  // ============================================================

  useEffect(() => {
    if (step > 1) {
      window.history.pushState(
        { step },
        "",
      );
    }
  }, [step]);

  // ============================================================
  // POP STATE
  // ============================================================

  useEffect(() => {
    const onPopState = () => {
      if (stepRef.current > 1) {
        const previousStep =
          stepRef.current - 1;

        setStep(previousStep);

        setTimeout(() => {
          window.history.pushState(
            {
              step: previousStep,
            },
            "",
          );
        }, 0);

        return;
      }

      router.back();
    };

    window.addEventListener(
      "popstate",
      onPopState,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        onPopState,
      );
    };
  }, [router]);

  // ============================================================
  // CAPACITOR KEYBOARD
  // ============================================================

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const show =
      Keyboard.addListener(
        "keyboardWillShow",
        () => {
          setKeyboardOpen(true);
        },
      );

    const hide =
      Keyboard.addListener(
        "keyboardWillHide",
        () => {
          setKeyboardOpen(false);
        },
      );

    return () => {
      show.then((listener) =>
        listener.remove(),
      );

      hide.then((listener) =>
        listener.remove(),
      );
    };
  }, []);

  // ============================================================
  // WORKER CATEGORY MATERIAL MAP
  // ============================================================

  const workerCategoryMap: Record<
    string,
    string[]
  > = {
    Labour: [
      "masonry",
      "tools",
      "safety",
    ],

    Mechanic: [
      "tools",
      "safety",
    ],

    Driver: [
      "moving",
    ],

    "Home Contractor": [
      "masonry",
      "tools",
      "electrical",
    ],

    "Home Services": [
      "tools",
      "safety",
    ],

    Electrician: [
      "electrical",
      "tools",
    ],

    Plumber: [
      "plumbing",
      "tools",
    ],
  };

  // ============================================================
  // FETCH BOOKED DATES + SLOTS
  // ============================================================

  useEffect(() => {
    const fetchBookings = async () => {
      if (!worker?.id) {
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("bookings")
        .select(
          `
            booking_date,
            booking_time,
            booking_status,
            worker_available
          `,
        )
        .eq(
          "worker_id",
          worker.id,
        )
        .in(
          "booking_status",
          [
            "pending",
            "confirmed",
          ],
        )
        .eq(
          "worker_available",
          false,
        );

      if (error) {
        console.error(
          "BOOKINGS FETCH ERROR:",
          error,
        );

        return;
      }

      const dates = [
        ...new Set(
          (data ?? []).map(
            (booking) =>
              booking.booking_date,
          ),
        ),
      ];

      setBookedDates(dates);

      if (form.date) {
        const slots =
          (data ?? [])
            .filter(
              (booking) =>
                booking.booking_date ===
                form.date,
            )
            .map(
              (booking) =>
                booking.booking_time,
            );

        setBookedSlots(slots);
      } else {
        setBookedSlots([]);
      }
    };

    void fetchBookings();
  }, [
    form.date,
    worker?.id,
  ]);

  // ============================================================
  // LOAD SAVED FORM
  // ============================================================

  useEffect(() => {
    const savedData =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!savedData) {
      return;
    }

    try {
      const parsed =
        JSON.parse(savedData);

      setForm(
        parsed.form || parsed,
      );

      if (parsed.step) {
        setStep(parsed.step);
      }
    } catch (error) {
      console.error(
        "BOOKING FORM LOAD ERROR:",
        error,
      );
    }
  }, [STORAGE_KEY]);

  // ============================================================
  // BOOKING OPTIONS
  // ============================================================

  const bookingOptions =
    worker?.category === "Labour" ||
    worker?.category === "Construction" ||
    worker?.category === "Factory"
      ? [
          {
            label: "Half Day",
            value: "half_day",
          },
          {
            label: "Full Day",
            value: "full_day",
          },
          {
            label: "Weekly",
            value: "weekly",
          },
          {
            label: "Monthly",
            value: "monthly",
          },
        ]
      : worker?.category === "Driver"
        ? [
            {
              label: "4 Hours",
              value: "4h",
            },
            {
              label: "8 Hours",
              value: "8h",
            },
            {
              label: "12 Hours",
              value: "12h",
            },
            {
              label: "Full Day",
              value: "full_day",
            },
          ]
        : worker?.category ===
              "Mechanic" ||
            worker?.category ===
              "Home Contractor"
          ? [
              {
                label:
                  "Inspection Visit",
                value: "visit",
              },
              {
                label: "Repair Work",
                value: "repair",
              },
              {
                label:
                  "Emergency Service",
                value: "emergency",
              },
            ]
          : worker?.category ===
              "Security"
            ? [
                {
                  label: "Day Shift",
                  value: "day_shift",
                },
                {
                  label:
                    "Night Shift",
                  value: "night_shift",
                },
                {
                  label: "Monthly",
                  value: "monthly",
                },
              ]
            : [
                {
                  label:
                    "Standard Service",
                  value: "service",
                },
              ];

  // ============================================================
  // LOAD USER + ADDRESSES
  // ============================================================

  useEffect(() => {
    const loadUser =
      async () => {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user?.email) {
          setLoadingAddress(false);
          return;
        }

        const {
          data: addressData,
          error,
        } =
          await supabase
            .from(
              "customer_addresses",
            )
            .select("*")
            .eq(
              "customer_email",
              user.email,
            )
            .order(
              "is_default",
              {
                ascending: false,
              },
            )
            .order(
              "created_at",
              {
                ascending: false,
              },
            );

        if (error) {
          console.error(
            "ADDRESS FETCH ERROR:",
            error,
          );
        }

        if (
          addressData &&
          addressData.length > 0
        ) {
          setSelectedAddress(
            addressData[0],
          );
        }

        setForm((prev) => ({
          ...prev,

          email:
            user.email || "",

          name:
            prev.name ||
            user.user_metadata
              ?.full_name ||
            user.user_metadata
              ?.name ||
            "",
        }));

        setLoadingAddress(false);
      };

    void loadUser();
  }, []);

  // ============================================================
  // AUTO SAVE
  // ============================================================

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        form,
        step,
      }),
    );
  }, [
    form,
    step,
    STORAGE_KEY,
  ]);

  // ============================================================
  // WORKER CHECK
  // ============================================================

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2
            className="text-[#0F172A] mb-2"
            style={{
              fontWeight: 700,
            }}
          >
            Worker not found
          </h2>

          <Link
            href="/browse"
            className="text-[#FF5C39]"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // SERVICE OPTIONS
  // ============================================================

  const serviceOptions =
    worker.services || [];

  // ============================================================
  // WORKER FEE RESOLVER
  //
  // IMPORTANT:
  // NO SERVICE CHARGE.
  //
  // Selected booking type decides worker fee.
  // ============================================================

  const getWorkerFee = () => {
    const bookingType =
      String(
        form.bookingType || "",
      ).trim();

    const startingPrice =
      Number(
        worker.startingPrice || 0,
      );

    const visitCharge =
      Number(
        worker.visitCharge || 0,
      );

    const halfDayPrice =
      Number(
        worker.halfDayPrice || 0,
      );

    const fullDayPrice =
      Number(
        worker.fullDayPrice || 0,
      );

    const monthlyPrice =
      Number(
        worker.monthlyPrice || 0,
      );

    console.log(
      "WORKER PRICING:",
      {
        bookingType,
        startingPrice,
        visitCharge,
        halfDayPrice,
        fullDayPrice,
        monthlyPrice,
      },
    );

    // ========================================================
    // VISIT CHARGE
    // ========================================================

    if (
      bookingType ===
        "visit_charge" ||
      bookingType ===
        "visit" ||
      bookingType ===
        "quick_service"
    ) {
      return (
        visitCharge ||
        startingPrice ||
        0
      );
    }

    // ========================================================
    // HALF DAY
    // ========================================================

    if (
      bookingType ===
      "half_day"
    ) {
      return (
        halfDayPrice ||
        startingPrice ||
        0
      );
    }

    // ========================================================
    // FULL DAY
    // ========================================================

    if (
      bookingType ===
      "full_day"
    ) {
      return (
        fullDayPrice ||
        startingPrice ||
        0
      );
    }

    // ========================================================
    // MONTHLY
    // ========================================================

    if (
      bookingType ===
      "monthly"
    ) {
      return (
        monthlyPrice ||
        startingPrice ||
        0
      );
    }

    // ========================================================
    // STANDARD / SERVICE / REPAIR
    //
    // If a specific pricing type is not selected,
    // prefer visit charge because these are service visits.
    // ========================================================

    if (
      bookingType ===
        "service" ||
      bookingType ===
        "repair" ||
      bookingType ===
        "emergency" ||
      bookingType ===
        "per_job"
    ) {
      return (
        visitCharge ||
        startingPrice ||
        0
      );
    }

    // ========================================================
    // DRIVER HOURLY OPTIONS
    //
    // No separate hourly DB fields currently exist,
    // so use starting price.
    // ========================================================

    if (
      bookingType === "4h" ||
      bookingType === "8h" ||
      bookingType === "12h" ||
      bookingType ===
        "day_shift" ||
      bookingType ===
        "night_shift"
    ) {
      return (
        startingPrice ||
        visitCharge ||
        0
      );
    }

    // ========================================================
    // FALLBACK
    // ========================================================

    return (
      startingPrice ||
      visitCharge ||
      halfDayPrice ||
      fullDayPrice ||
      monthlyPrice ||
      0
    );
  };

  // ============================================================
  // TOTAL WORKER COST
  // ============================================================

  const totalCost =
    Number(
      getWorkerFee(),
    );

  // ============================================================
  // SERVICE FEE REMOVED
  // ============================================================

  const serviceFee = 0;

  // ============================================================
  // MATERIAL COST
  //
  // Currently 0 because selected material pricing
  // is not being calculated here.
  // ============================================================

  const materialsCost = 0;

  // ============================================================
  // GRAND TOTAL
  // ============================================================

  const grandTotal =
    totalCost +
    materialsCost;

  // ============================================================
  // PAYABLE AMOUNT
  // ============================================================

  const payableAmount =
    paymentType === "full"
      ? grandTotal
      : grandTotal;

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    localStorage.removeItem(
      STORAGE_KEY,
    );

    router.back();
  };

  // ============================================================
  // CREATE BOOKING
  // ============================================================

  const handleNext =
    async () => {
      // ========================================================
      // MOVE TO NEXT STEP
      // ========================================================

      if (step < 5) {
        setStep(
          (prev) =>
            prev + 1,
        );

        requestAnimationFrame(
          () => {
            window.scrollTo(
              0,
              0,
            );

            document.documentElement.scrollTop =
              0;

            document.body.scrollTop =
              0;
          },
        );

        return;
      }

      // ========================================================
      // STEP 5
      // CREATE BOOKING
      // ========================================================

      try {
        // ======================================================
        // VALIDATION
        // ======================================================

        if (
          !selectedAddress &&
          !form.address.trim()
        ) {
          alert(
            "Please select a service address.",
          );

          return;
        }

        if (
          !form.name.trim()
        ) {
          alert(
            "Please enter customer name.",
          );

          return;
        }

        if (
          !form.phone.trim()
        ) {
          alert(
            "Please enter customer phone number.",
          );

          return;
        }

        if (
          !form.email.trim()
        ) {
          alert(
            "Please enter customer email.",
          );

          return;
        }

        if (
          !form.serviceType.trim()
        ) {
          alert(
            "Please select service type.",
          );

          return;
        }

        if (
          !form.date.trim()
        ) {
          alert(
            "Please select booking date.",
          );

          return;
        }

        if (
          !form.time.trim()
        ) {
          alert(
            "Please select booking time.",
          );

          return;
        }

        if (
          !form.bookingType.trim()
        ) {
          alert(
            "Please select booking type.",
          );

          return;
        }

        // ======================================================
        // FINAL WORKER FEE
        //
        // Recalculate at submit time.
        // ======================================================

        const finalWorkerFee =
          Number(
            getWorkerFee(),
          );

        if (
          !Number.isFinite(
            finalWorkerFee,
          ) ||
          finalWorkerFee <= 0
        ) {
          console.error(
            "INVALID WORKER FEE:",
            {
              bookingType:
                form.bookingType,

              worker,
            },
          );

          alert(
            "Worker price is not available for the selected booking type.",
          );

          return;
        }

        // ======================================================
        // ADDRESS SNAPSHOT
        // ======================================================

        const bookingAddress = {
          house_no:
            selectedAddress?.house_no ??
            form.houseNo ??
            "",

          address:
            selectedAddress?.address ??
            form.address ??
            "",

          landmark:
            selectedAddress?.landmark ??
            form.landmark ??
            "",

          city:
            selectedAddress?.city ??
            form.city ??
            "",

          district:
            selectedAddress?.district ??
            form.district ??
            "",

          state:
            selectedAddress?.state ??
            form.state ??
            "",

          country:
            selectedAddress?.country ??
            form.country ??
            "India",

          pincode:
            selectedAddress?.pincode ??
            form.pincode ??
            "",

          address_type:
            selectedAddress?.address_type ??
            form.addressType ??
            "home",
        };

        // ======================================================
        // GENERATE BOOKING ID
        // ======================================================

        const {
          data:
            bookingReferenceData,
          error:
            bookingReferenceError,
        } =
          await supabase.rpc(
            "generate_workkerz_booking_id",
          );

        if (
          bookingReferenceError ||
          !bookingReferenceData
        ) {
          console.error(
            "BOOKING ID GENERATION ERROR:",
            bookingReferenceError,
          );

          alert(
            "Booking ID could not be generated. Please try again.",
          );

          return;
        }

        const bookingReference =
          String(
            bookingReferenceData,
          );

        // ======================================================
        // FINAL PRICING
        //
        // SERVICE CHARGE = 0
        // ======================================================

        const finalMaterialsCost = 0;

        const finalGrandTotal =
          finalWorkerFee +
          finalMaterialsCost;

        // ======================================================
        // BOOKING PAYLOAD
        // ======================================================

        const bookingPayload = {
          // ----------------------------------------------------
          // BOOKING
          // ----------------------------------------------------

          booking_id:
            bookingReference,

          booking_status:
            "pending",

          // ----------------------------------------------------
          // WORKER
          // ----------------------------------------------------

          worker_id:
            worker.id,

          worker_name:
            worker.name ??
            null,

          worker_photo:
            worker.photo ??
            null,

          worker_specialty:
            worker.specialty ??
            null,

          worker_rating:
            worker.rating ??
            null,

          // ----------------------------------------------------
          // SERVICE
          // ----------------------------------------------------

          service_type:
            form.serviceType ||
            null,

          description:
            form.description ||
            null,

          // ----------------------------------------------------
          // SCHEDULE
          // ----------------------------------------------------

          booking_date:
            form.date ||
            null,

          booking_time:
            form.time ||
            null,

          booking_type:
            form.bookingType ||
            null,

          // ----------------------------------------------------
          // CUSTOMER
          // ----------------------------------------------------

          customer_name:
            form.name ||
            null,

          customer_phone:
            form.phone ||
            null,

          customer_email:
            form.email ||
            null,

          notes:
            form.notes ||
            null,

          // ----------------------------------------------------
          // MATERIALS
          // ----------------------------------------------------

          selected_materials:
            form.selectedMaterials ??
            {},

          // ----------------------------------------------------
          // PRICE
          //
          // WORKER FEE ONLY
          // SERVICE FEE = 0
          // ----------------------------------------------------

          total_cost:
            finalWorkerFee,

          service_fee:
            0,

          materials_cost:
            finalMaterialsCost,

          package_price:
            finalWorkerFee,

          grand_total:
            finalGrandTotal,

          // ----------------------------------------------------
          // WORK STATUS
          // ----------------------------------------------------

          work_status:
            "active",

          worker_available:
            false,

          // ----------------------------------------------------
          // ADDRESS SNAPSHOT
          // ----------------------------------------------------

          house_no:
            bookingAddress.house_no,

          address:
            bookingAddress.address,

          landmark:
            bookingAddress.landmark,

          city:
            bookingAddress.city,

          district:
            bookingAddress.district,

          state:
            bookingAddress.state,

          country:
            bookingAddress.country,

          pincode:
            bookingAddress.pincode,

          address_type:
            bookingAddress.address_type,
        };

        // ======================================================
        // DEBUG
        // ======================================================

        console.log(
          "====================================",
        );

        console.log(
          "CREATING WORKKERZ BOOKING",
        );

        console.log(
          "Booking Type:",
          form.bookingType,
        );

        console.log(
          "Worker:",
          worker.name,
        );

        console.log(
          "Starting Price:",
          worker.startingPrice,
        );

        console.log(
          "Visit Charge:",
          worker.visitCharge,
        );

        console.log(
          "Half Day:",
          worker.halfDayPrice,
        );

        console.log(
          "Full Day:",
          worker.fullDayPrice,
        );

        console.log(
          "Monthly:",
          worker.monthlyPrice,
        );

        console.log(
          "FINAL WORKER FEE:",
          finalWorkerFee,
        );

        console.log(
          "SERVICE FEE:",
          0,
        );

        console.log(
          "GRAND TOTAL:",
          finalGrandTotal,
        );

        console.log(
          "BOOKING PAYLOAD:",
          bookingPayload,
        );

        console.log(
          "====================================",
        );

        // ======================================================
        // INSERT
        // ======================================================

        const {
          data: createdBooking,
          error: bookingError,
        } =
          await supabase
            .from("bookings")
            .insert(
              bookingPayload,
            )
            .select()
            .single();

        if (
          bookingError
        ) {
          console.error(
            "BOOKING INSERT ERROR:",
            bookingError,
          );

          // ====================================================
          // DUPLICATE BOOKING ID
          // ====================================================

          if (
            bookingError.code ===
            "23505"
          ) {
            alert(
              "Booking ID conflict occurred. Please try booking again.",
            );

            return;
          }

          alert(
            `Booking could not be created.\n\n${bookingError.message}`,
          );

          return;
        }

        if (
          !createdBooking
        ) {
          alert(
            "Booking was not returned after saving.",
          );

          return;
        }

        // ======================================================
        // SUCCESS
        // ======================================================

        console.log(
          "BOOKING CREATED SUCCESSFULLY:",
          createdBooking,
        );

        // ======================================================
        // CONFIRMATION DATA
        // ======================================================

        sessionStorage.setItem(
          "booking-data",
          JSON.stringify({
            form,

            worker,

            // Address snapshot
            selectedAddress:
              bookingAddress,

            // Database UUID
            bookingId:
              createdBooking.id,

            // Public booking ID
            bookingReference:
              createdBooking.booking_id,

            // Correct pricing
            totalCost:
              finalWorkerFee,

            // Service charge removed
            serviceFee:
              0,

            materialsCost:
              finalMaterialsCost,

            grandTotal:
              finalGrandTotal,

            paymentType,

            payableAmount:
              finalGrandTotal,
          }),
        );

        // ======================================================
        // CLEAR FORM
        // ======================================================

        localStorage.removeItem(
          STORAGE_KEY,
        );

        // ======================================================
        // SUCCESS SCREEN
        // ======================================================

        setShowSuccess(
          true,
        );

        // ======================================================
        // CONFIRMATION
        // ======================================================

        setTimeout(() => {
          router.replace(
            `/confirmation/${worker.id}`,
          );
        }, 3500);
      } catch (error) {
        console.error(
          "BOOKING CREATE ERROR:",
          error,
        );

        alert(
          "Booking could not be created. Please try again.",
        );
      }
    };

  // ============================================================
  // STEPS
  // ============================================================

  const steps = [
    {
      id: 1,
      label: "Basic",
    },
    {
      id: 2,
      label: "Schedule",
    },
    {
      id: 3,
      label: "Contact",
    },
    {
      id: 4,
      label: "Review",
    },
    {
      id: 5,
      label: "Payment",
    },
  ];

  // ============================================================
  // CAN PROCEED
  // ============================================================

  const canProceed =
    () => {
      if (step === 1) {
        return (
          form.serviceType.trim() !==
            "" &&
          form.description.trim()
            .length >= 10 &&
          !!selectedAddress
        );
      }

      if (step === 2) {
        return (
          form.date.trim() !==
            "" &&
          form.time.trim() !==
            "" &&
          form.bookingType.trim() !==
            ""
        );
      }

      if (step === 3) {
        return (
          form.name.trim() !==
            "" &&
          form.phone.trim() !==
            "" &&
          form.email.trim() !==
            ""
        );
      }

      // Payment validation
      if (step === 4) {
        return true;
      }

      if (step === 5) {
        return true;
      }

      return true;
    };

  // ============================================================
  // INPUT
  // ============================================================

  const inp =
    "w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-gray-400 outline-none focus:border-[#FF5C39] transition-colors";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="fixed top-0 left-0 right-0 z-50 bg-linear-to-br from-emerald-950 via-emerald-800 to-green-600">
        <div className="relative mx-auto px-4 pt-safe pt-4 pb-5">

          {/* CANCEL */}

          <button
            onClick={
              handleCancel
            }
            aria-label="Cancel booking"
            className="absolute top-10 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-2xl backdrop-blur-xl transition hover:bg-white/15 active:scale-95"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* WORKER HEADER */}

          <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl p-4 mt-8">
            <div className="flex gap-4">

              {/* IMAGE */}

              <div className="relative shrink-0">
                <img
                  src={
                    worker.photo?.trim()
                      ? worker.photo
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          worker.name,
                        )}&background=f97316&color=fff`
                  }
                  alt={worker.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        worker.name,
                      )}&background=f97316&color=fff`;
                  }}
                  className="h-13 w-13 rounded-2xl object-cover border-2 border-white/15"
                />

                {worker.available && (
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-[#0F172A]" />
                )}
              </div>

              {/* INFO */}

              <div className="flex-1 min-w-0">
                <h2 className="flex text-white text-[15px] font-bold truncate gap-9">
                  {worker.name}

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

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <div className="fixed top-30 left-0 right-0 z-40 bg-white/55 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">

          <div className="relative h-1 rounded-full bg-slate-200 overflow-hidden mb-6">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-[#FF7A59] to-[#FF5C39] transition-all duration-500"
              style={{
                width: `${((step - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="flex justify-between items-start">
            {steps.map(
              (s) => {
                const completed =
                  step >
                  s.id;

                const active =
                  step ===
                  s.id;

                return (
                  <div
                    key={
                      s.id
                    }
                    className="flex flex-col items-center flex-1"
                  >
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
                      {completed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        s.id
                      )}
                    </div>

                    <span
                      className={`
                        mt-2 text-[10px] text-center leading-3 transition-all
                        ${
                          active ||
                          completed
                            ? "text-slate-900 font-semibold"
                            : "text-slate-400"
                        }
                      `}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              },
            )}
          </div>

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

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="max-w-2xl mx-auto items-start px-4 sm:px-6 pt-65 pb-32">

        {/* ====================================================
            STEP 1
        ==================================================== */}

        {step === 1 && (
          <div className="space-y-2">

            <div>
              <h2 className="text-[#000000] font-bold">
                Service Details
              </h2>

              <p className="text-[#2b2c2e] text-sm">
                Tell us what work needs to be done and where.
              </p>
            </div>

            {/* SERVICE TYPE */}

            <div>
              <label className="block text-sm text-[#25272b] mb-2">
                Service Type
                <span className="text-red-400 ml-1">
                  *
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {serviceOptions.map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setForm(
                          (
                            prev,
                          ) => ({
                            ...prev,
                            serviceType:
                              opt,
                          }),
                        )
                      }
                      className={`
                        rounded-xl border px-3 py-2 text-sm transition-all duration-200
                        ${
                          form.serviceType ===
                          opt
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-black/15 bg-black/5 text-black hover:bg-white/10"
                        }
                      `}
                    >
                      {opt}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#25272b]">
                  Work Description
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <span
                  className={`
                    text-[11px]
                    ${
                      form.description.length >
                      180
                        ? "text-orange-400"
                        : "text-black/50"
                    }
                  `}
                >
                  {form.description.length}/200
                </span>
              </div>

              <input
                type="text"
                maxLength={200}
                value={
                  form.description
                }
                enterKeyHint="done"
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="sentences"
                spellCheck
                placeholder="Describe your work..."
                onChange={(e) =>
                  setForm(
                    (
                      prev,
                    ) => ({
                      ...prev,
                      description:
                        e.target
                          .value,
                    }),
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    (
                      e.target as HTMLInputElement
                    ).blur();
                  }
                }}
                className="w-full h-14 rounded-2xl border border-black/10 bg-black/5 px-4 text-sm text-black placeholder:text-black/35 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-black/40">
                  Add work details for better matching.
                </span>

                {form.description.trim().length >=
                10 ? (
                  <span className="font-medium text-green-500">
                    ✓ Looks good
                  </span>
                ) : (
                  <span className="text-orange-400">
                    Min 10 characters
                  </span>
                )}
              </div>
            </div>

            {/* ADDRESS */}

            <div className="mt-5 mb-2">
              <label className="text-l font-medium text-[#25272b]">
                Work location for best service
                <span className="text-red-400 ml-1">
                  *
                </span>
              </label>

              <BookingAddressCard
                address={
                  selectedAddress
                }
                loading={
                  loadingAddress
                }
                onChange={() =>
                  setShowAddressModal(
                    true,
                  )
                }
                onAdd={() =>
                  setShowAddressModal(
                    true,
                  )
                }
              />
            </div>
          </div>
        )}

        {/* ====================================================
            STEP 2
        ==================================================== */}

        {step === 2 && (
          <BookingScheduleStep
            form={form}
            setForm={setForm}
            bookedDates={
              bookedDates
            }
            bookedSlots={
              bookedSlots
            }
            timeSlots={
              timeSlots
            }
            showCalendar={
              showCalendar
            }
            setShowCalendar={
              setShowCalendar
            }
            worker={worker}
          />
        )}

        {/* ====================================================
            STEP 3
        ==================================================== */}

        {step === 3 && (
          <BookingCustomerInfoMobile
            form={form}
            setForm={setForm}
          />
        )}

        {/* ====================================================
            STEP 4
        ==================================================== */}

        {step === 4 && (
          <BookingReviewStep
            worker={worker}
            form={form}
            address={
              selectedAddress
            }

            totalCost={
              totalCost
            }

            serviceFee={0}

            grandTotal={
              grandTotal
            }

            payableAmount={
              payableAmount
            }

            paymentType={
              paymentType
            }

            onProceed={() =>
              setStep(5)
            }

            onEdit={(
              editStep,
            ) =>
              setStep(
                editStep,
              )
            }
          />
        )}

        {/* ====================================================
            STEP 5
        ==================================================== */}

        {step === 5 && (
          <BookingPaymentStep
            form={form}
            setForm={setForm}
            paymentType={
              paymentType
            }
            setPaymentType={
              setPaymentType
            }
            payableAmount={
              payableAmount
            }
            grandTotal={
              grandTotal
            }
            inp={inp}
          />
        )}
      </div>

      {/* ======================================================
          MOBILE BOTTOM BAR
      ====================================================== */}

      <div
        className={`
          fixed bottom-0 inset-x-0 z-50 md:hidden
          border-t border-slate-200
          bg-white/95 backdrop-blur-xl
          px-4 pt-3
          pb-[calc(env(safe-area-inset-bottom)+12px)]
          shadow-[0_-8px_30px_rgba(15,23,42,0.08)]
          transition-all duration-300
          ${
            keyboardOpen ||
            step === 4
              ? "translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100"
          }
        `}
      >
        <button
          onClick={
            handleNext
          }
          disabled={
            !canProceed()
          }
          className={`
            w-full h-13 rounded-2xl
            flex items-center justify-center gap-2
            text-[15px] font-bold
            transition-all
            ${
              canProceed()
                ? "bg-linear-to-r from-[#59dbff] to-[#19e2ca] text-white shadow-lg shadow-[#FF5C39]/30 active:scale-[0.98]"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }
          `}
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

      {/* ======================================================
          ADDRESS SELECTOR
      ====================================================== */}

      <AddressSelectorModal
        open={
          showAddressModal
        }
        onClose={() =>
          setShowAddressModal(
            false,
          )
        }
        onSelect={(item) => {
          setSelectedAddress(
            item,
          );

          setForm(
            (prev) => ({
              ...prev,

              houseNo:
                item.house_no ??
                "",

              address:
                item.address ??
                "",

              landmark:
                item.landmark ??
                "",

              city:
                item.city ??
                "",

              district:
                item.district ??
                "",

              state:
                item.state ??
                "",

              country:
                item.country ??
                "India",

              pincode:
                item.pincode ??
                "",

              addressType:
                item.address_type ??
                "home",
            }),
          );

          setShowAddressModal(
            false,
          );
        }}
        onAdd={() => {
          setShowAddressModal(
            false,
          );

          setShowAddressForm(
            true,
          );
        }}
        onEdit={(item) => {
          setEditingAddress(
            item,
          );

          setShowAddressModal(
            false,
          );

          setShowAddressForm(
            true,
          );
        }}
      />

      {/* ======================================================
          ADDRESS FORM
      ====================================================== */}

      <AddressFormModal
        open={
          showAddressForm
        }
        editingAddress={
          editingAddress
        }
        onBack={() => {
          setShowAddressForm(
            false,
          );

          setShowAddressModal(
            true,
          );
        }}
        onClose={() =>
          setShowAddressForm(
            false,
          )
        }
        onSaved={
          async () => {
            setShowAddressForm(
              false,
            );

            const {
              data: {
                user,
              },
            } =
              await supabase.auth.getUser();

            if (
              !user?.email
            ) {
              return;
            }

            const {
              data,
            } =
              await supabase
                .from(
                  "customer_addresses",
                )
                .select("*")
                .eq(
                  "customer_email",
                  user.email,
                )
                .order(
                  "is_default",
                  {
                    ascending:
                      false,
                  },
                )
                .order(
                  "created_at",
                  {
                    ascending:
                      false,
                  },
                );

            if (
              data?.length
            ) {
              setSelectedAddress(
                data[0],
              );
            }
          }
        }
      />

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {showSuccess && (
        <BookingSuccessScreen />
      )}
    </div>
  );
}