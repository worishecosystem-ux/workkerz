"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";

import ProjectWorkerGroups, {
  type WorkerGroup,
} from "@/app/components/ProjectWorkerGroups";

import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type RequesterType = "individual" | "contractor" | "company";

/* =========================================================
   DATA
========================================================= */

const requestLocations = [
  "Bhopal",
  "Gwalior",
  "Indore",
  "Jabalpur",
  "Bilaspur",
  "Raipur",
  "Other",
];

const states = [
  "Madhya Pradesh",
  "Chhattisgarh",
  "Rajasthan",
  "Maharashtra",
  "Uttar Pradesh",
  "Other",
];

const districtsByState: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Bhopal",
    "Gwalior",
    "Indore",
    "Jabalpur",
    "Ujjain",
    "Sagar",
    "Other",
  ],

  Chhattisgarh: [
    "Bilaspur",
    "Raipur",
    "Durg",
    "Korba",
    "Rajnandgaon",
    "Other",
  ],

  Rajasthan: [
    "Jaipur",
    "Kota",
    "Udaipur",
    "Jodhpur",
    "Other",
  ],

  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Other",
  ],

  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Other",
  ],

  Other: ["Other"],
};

const durations = [
  "Few Hours",
  "1 Day",
  "2 Days",
  "3 Days",
  "1 Week",
  "1 Month",
];

/* =========================================================
   MAIN
========================================================= */

export default function HomeHero({
  openRequest = false,
  onRequestClose,
}: {
  openRequest?: boolean;
  onRequestClose?: () => void;
}) {
  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const [requestOpen, setRequestOpen] =
    useState(openRequest);

  const [requestLocation, setRequestLocation] =
    useState("");

  const [locationSearch, setLocationSearch] =
    useState("");

  const [requestLocationOpen, setRequestLocationOpen] =
    useState(false);

  /* =======================================================
     REQUESTER DETAILS
  ======================================================= */

  const [requesterType, setRequesterType] =
    useState<RequesterType>("individual");

  const [requesterName, setRequesterName] =
    useState("");

  const [requesterMobile, setRequesterMobile] =
    useState("");

  const [requesterEmail, setRequesterEmail] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [gstin, setGstin] =
    useState("");

  const [requesterAddress, setRequesterAddress] =
    useState("");

  /* =======================================================
     PROJECT
  ======================================================= */

  const [projectName, setProjectName] =
    useState("");

  const [projectType, setProjectType] =
    useState("Construction");

  const [workerGroups, setWorkerGroups] =
    useState<WorkerGroup[]>([
      {
        id: "initial-group",
        category: "Labour",
        workers_required: 1,
      },
    ]);

  /* =======================================================
     WORK ADDRESS
  ======================================================= */

  const [fullAddress, setFullAddress] =
    useState("");

  const [locality, setLocality] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [state, setState] =
    useState("");

  const [pincode, setPincode] =
    useState("");

  /* =======================================================
     SCHEDULE
  ======================================================= */

  const [workDate, setWorkDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [duration, setDuration] =
    useState("1 Day");

  /* =======================================================
     WORK DETAILS
  ======================================================= */

  const [budget, setBudget] =
    useState("");

  const [requirement, setRequirement] =
    useState("");

  /* =======================================================
     SUBMIT STATE
  ======================================================= */

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     KEYBOARD
  ======================================================= */

  const [keyboardOpen, setKeyboardOpen] =
    useState(false);

  const locationSearchRef =
    useRef<HTMLInputElement>(null);

  /* =======================================================
     SYNC OPEN
  ======================================================= */

  useEffect(() => {
    setRequestOpen(openRequest);
  }, [openRequest]);

  /* =======================================================
     LOCK BODY
  ======================================================= */

  useEffect(() => {
    if (!requestOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [requestOpen]);

  /* =======================================================
     NATIVE KEYBOARD
  ======================================================= */

  useEffect(() => {
    if (!requestOpen) {
      setKeyboardOpen(false);
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      setKeyboardOpen(false);
      return;
    }

    let showListener:
      | { remove: () => Promise<void> }
      | null = null;

    let hideListener:
      | { remove: () => Promise<void> }
      | null = null;

    let didShowListener:
      | { remove: () => Promise<void> }
      | null = null;

    let didHideListener:
      | { remove: () => Promise<void> }
      | null = null;

    let cancelled = false;

    const setupKeyboard = async () => {
      const show = await Keyboard.addListener(
        "keyboardWillShow",
        () => {
          setKeyboardOpen(true);
        },
      );

      const hide = await Keyboard.addListener(
        "keyboardWillHide",
        () => {
          setKeyboardOpen(false);
        },
      );

      const didShow = await Keyboard.addListener(
        "keyboardDidShow",
        () => {
          setKeyboardOpen(true);
        },
      );

      const didHide = await Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setKeyboardOpen(false);
        },
      );

      if (cancelled) {
        await show.remove();
        await hide.remove();
        await didShow.remove();
        await didHide.remove();
        return;
      }

      showListener = show;
      hideListener = hide;
      didShowListener = didShow;
      didHideListener = didHide;
    };

    setupKeyboard();

    return () => {
      cancelled = true;

      showListener?.remove();
      hideListener?.remove();
      didShowListener?.remove();
      didHideListener?.remove();

      setKeyboardOpen(false);
    };
  }, [requestOpen]);

  /* =======================================================
     ESC CLOSE
  ======================================================= */

  useEffect(() => {
    if (!requestOpen) return;

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeForm();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [requestOpen, submitting]);

  /* =======================================================
     TODAY
  ======================================================= */

  const today = new Date()
    .toISOString()
    .split("T")[0];

  /* =======================================================
     DISTRICTS
  ======================================================= */

  const availableDistricts = useMemo(
    () => districtsByState[state] || [],
    [state],
  );

  /* =======================================================
     FILTER LOCATIONS
  ======================================================= */

  const filteredLocations = useMemo(() => {
    const query =
      locationSearch.trim().toLowerCase();

    return requestLocations.filter(
      (location) =>
        !query ||
        location
          .toLowerCase()
          .includes(query),
    );
  }, [locationSearch]);

  /* =======================================================
     RESET
  ======================================================= */

  function resetForm() {
    setRequestLocation("");

    setLocationSearch("");

    setRequestLocationOpen(false);

    setWorkerGroups([
      {
        id: `${Date.now()}-initial`,
        category: "Labour",
        workers_required: 1,
      },
    ]);

    setProjectName("");
    setProjectType("Construction");

    /* REQUESTER */

    setRequesterType("individual");
    setRequesterName("");
    setRequesterMobile("");
    setRequesterEmail("");
    setCompanyName("");
    setGstin("");
    setRequesterAddress("");

    /* ADDRESS */

    setFullAddress("");
    setLocality("");
    setDistrict("");
    setState("");
    setPincode("");

    /* SCHEDULE */

    setWorkDate("");
    setStartTime("");
    setDuration("1 Day");

    /* DETAILS */

    setBudget("");
    setRequirement("");

    setError("");
    setSubmitted(false);
    setKeyboardOpen(false);
  }

  /* =======================================================
     CLOSE
  ======================================================= */

  function closeForm() {
    if (submitting) return;

    setRequestOpen(false);
    setKeyboardOpen(false);

    setRequestLocationOpen(false);

    setError("");

    onRequestClose?.();
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm() {
    if (!requesterName.trim()) {
      return "Please enter your full name.";
    }

    const mobile =
      requesterMobile.replace(/\D/g, "");

    if (mobile.length !== 10) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (
      requesterType === "contractor" ||
      requesterType === "company"
    ) {
      if (!companyName.trim()) {
        return `Please enter your ${
          requesterType === "company"
            ? "company"
            : "contractor"
        } name.`;
      }
    }

    if (!projectName.trim()) {
      return "Please enter your project name.";
    }

    if (!workerGroups.length) {
      return "Please add at least one worker group.";
    }

    const invalidGroup =
      workerGroups.some(
        (group) =>
          !group.category.trim() ||
          !Number.isFinite(
            group.workers_required,
          ) ||
          group.workers_required < 1,
      );

    if (invalidGroup) {
      return "Please select a worker and enter a valid quantity.";
    }

    if (!requestLocation) {
      return "Please select your work city.";
    }

    if (!fullAddress.trim()) {
      return "Please enter your full work address.";
    }

    if (!locality.trim()) {
      return "Please enter your area / locality.";
    }

    if (!state) {
      return "Please select your state.";
    }

    if (!district) {
      return "Please select your district.";
    }

    if (pincode.length !== 6) {
      return "Please enter a valid 6-digit pincode.";
    }

    if (!workDate) {
      return "Please select your work date.";
    }

    if (!requirement.trim()) {
      return "Please enter your work requirement.";
    }

    return "";
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function submitRequest(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) return;

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      requestAnimationFrame(() => {
        document
          .querySelector(
            "[data-request-error]",
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      });

      return;
    }

    try {
      setSubmitting(true);

      /* =====================================================
         GET CURRENT USER
      ===================================================== */

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      /* =====================================================
         INSERT REQUEST
      ===================================================== */

      const { error: insertError } =
        await supabase
          .from("worker_requests")
          .insert({
            /* PROJECT */

            project_name:
              projectName.trim(),

            project_type:
              projectType,

            /* WORKER GROUPS */

            workers_required:
              workerGroups.reduce(
                (total, group) =>
                  total +
                  Math.max(
                    1,
                    Number(
                      group.workers_required,
                    ) || 1,
                  ),
                0,
              ),

            category:
              workerGroups
                .map(
                  (group) =>
                    group.category,
                )
                .filter(Boolean)
                .join(", "),

            requirements:
              workerGroups.map(
                (group) => ({
                  category:
                    group.category,

                  workers_required:
                    Math.max(
                      1,
                      Number(
                        group.workers_required,
                      ) || 1,
                    ),
                }),
              ),

            location:
              requestLocation,

            /* REQUESTER */

            requester_type:
              requesterType,

            requester_name:
              requesterName.trim(),

            requester_mobile:
              requesterMobile
                .replace(/\D/g, "")
                .slice(0, 10),

            requester_email:
              requesterEmail.trim() ||
              null,

            company_name:
              requesterType ===
              "individual"
                ? null
                : companyName.trim() ||
                  null,

            gstin:
              requesterType ===
              "individual"
                ? null
                : gstin
                    .replace(
                      /\s/g,
                      "",
                    )
                    .toUpperCase() ||
                  null,

            requester_address:
              requesterAddress.trim() ||
              null,

            requester_user_id:
              user?.id || null,

            /* WORK ADDRESS */

            full_address:
              fullAddress.trim(),

            locality:
              locality.trim(),

            district,

            state,

            pincode,

            /* SCHEDULE */

            work_date:
              workDate,

            start_time:
              startTime || null,

            duration,

            /* WORK DETAILS */

            budget: budget
              ? Number(budget)
              : null,

            requirement:
              requirement.trim(),

            /* SYSTEM */

            status: "pending",

            source: "home",
          });

      if (insertError) {
        console.error(
          "WORKER REQUEST ERROR:",
          insertError,
        );

        setError(
          "Request submit nahi ho payi. Please try again.",
        );

        return;
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSubmitted(true);

      window.dispatchEvent(
        new CustomEvent(
          "workkerz-request-success",
        ),
      );

      setTimeout(() => {
        resetForm();

        setRequestOpen(false);

        onRequestClose?.();
      }, 1200);
    } catch (submitError) {
      console.error(
        "WORKER REQUEST ERROR:",
        submitError,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      {requestOpen && (
        <div
          className="
            fixed inset-0 z-[9999]
            bg-black/70
            backdrop-blur-md
          "
        >
          <div
            className="
              flex h-[100dvh] w-full
              items-center justify-center
              p-0
              sm:p-3
              lg:p-5
            "
          >
            <div
              className="
                relative flex
                h-[100dvh] w-full
                flex-col
                overflow-hidden
                bg-[#f6faf8]
                sm:h-[96dvh]
                sm:rounded-3xl
                sm:border
                sm:border-white/30
                sm:shadow-[0_30px_100px_rgba(0,0,0,0.25)]
                lg:max-w-6xl
              "
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <header
                className="
                  relative z-30
                  flex shrink-0
                  items-center justify-between
                  border-b border-white/20
                  bg-gradient-to-r
                  from-[#047a3b]
                  via-[#079d49]
                  to-[#0ab957]
                  px-3 py-2.5
                  pt-[max(10px,env(safe-area-inset-top))]
                  text-white
                  sm:px-5
                "
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-white/15
                      ring-1 ring-white/20
                      backdrop-blur
                    "
                  >
                    <Users className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className="
                          text-[8px]
                          font-black
                          uppercase
                          tracking-[0.18em]
                          text-emerald-100
                        "
                      >
                        Workkerz
                      </p>

                      <span
                        className="
                          flex items-center gap-1
                          rounded-full
                          bg-white/15
                          px-1.5 py-0.5
                          text-[7px]
                          font-bold
                        "
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        PREMIUM
                      </span>
                    </div>

                    <h2 className="truncate text-sm font-black">
                      Request Worker
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  aria-label="Close"
                  className="
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-white/10
                    ring-1 ring-white/15
                    transition
                    active:scale-95
                    hover:bg-white/20
                    disabled:opacity-50
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              {/* =================================================
                  SCROLL AREA
              ================================================= */}

              <div
                className="
                  min-h-0 flex-1
                  overflow-y-auto
                  overscroll-contain
                  scroll-smooth
                  [webkit-overflow-scrolling:touch]
                "
              >
                <form
                  onSubmit={submitRequest}
                  className="
                    mx-auto w-full
                    max-w-5xl
                    px-3 py-3
                    pb-[calc(110px+env(safe-area-inset-bottom))]
                    sm:px-5 sm:py-5
                  "
                >
                  {/* =================================================
                      TITLE
                  ================================================= */}

                  <div className="mb-3">
                    <div
                      className="
                        inline-flex items-center gap-1.5
                        rounded-full
                        border border-emerald-200
                        bg-emerald-50
                        px-2.5 py-1
                      "
                    >
                      <span
                        className="
                          h-1.5 w-1.5
                          animate-pulse
                          rounded-full
                          bg-emerald-500
                        "
                      />

                      <span
                        className="
                          text-[8px]
                          font-black
                          uppercase
                          tracking-[0.14em]
                          text-emerald-700
                        "
                      >
                        Worker Request
                      </span>
                    </div>

                    <h1
                      className="
                        mt-2
                        text-xl
                        font-black
                        tracking-tight
                        text-gray-950
                        sm:text-2xl
                      "
                    >
                      Apni requirement submit karein
                    </h1>

                    <p
                      className="
                        mt-1
                        max-w-2xl
                        text-[11px]
                        leading-4
                        text-gray-500
                      "
                    >
                      Complete details dene se suitable
                      worker arrange karna easy hota hai.
                    </p>
                  </div>

                  {/* =================================================
                      MAIN CARD
                  ================================================= */}

                  <div
                    className="
                      overflow-visible
                      rounded-2xl
                      border border-gray-200
                      bg-white
                      shadow-[0_10px_40px_rgba(0,0,0,0.06)]
                    "
                  >
                    {/* =================================================
                        01 REQUESTER DETAILS
                    ================================================= */}

                    <FormSection
                      number="01"
                      title="Requester Details"
                    >
                      <div className="space-y-3">
                        <div>
                          <FieldLabel
                            icon={
                              <User className="h-3.5 w-3.5" />
                            }
                            label="Who is sending this request?"
                            required
                          />

                          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                            {(
                              [
                                [
                                  "individual",
                                  "Individual",
                                ],
                                [
                                  "contractor",
                                  "Contractor",
                                ],
                                [
                                  "company",
                                  "Company",
                                ],
                              ] as const
                            ).map(
                              ([value, label]) => {
                                const active =
                                  requesterType ===
                                  value;

                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                      setRequesterType(
                                        value,
                                      );

                                      if (
                                        value ===
                                        "individual"
                                      ) {
                                        setCompanyName(
                                          "",
                                        );

                                        setGstin("");
                                      }
                                    }}
                                    className={`
                                      min-h-10
                                      rounded-xl
                                      border
                                      px-2
                                      text-[10px]
                                      font-black
                                      transition
                                      active:scale-[.98]
                                      ${
                                        active
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-200"
                                      }
                                    `}
                                  >
                                    {label}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <InputField
                            label={
                              requesterType ===
                              "company"
                                ? "Contact Person Name"
                                : requesterType ===
                                    "contractor"
                                  ? "Contractor Name"
                                  : "Full Name"
                            }
                            required
                            placeholder={
                              requesterType ===
                              "company"
                                ? "Enter contact person name"
                                : requesterType ===
                                    "contractor"
                                  ? "Enter contractor name"
                                  : "Enter your full name"
                            }
                            value={
                              requesterName
                            }
                            onChange={(
                              event,
                            ) =>
                              setRequesterName(
                                event.target
                                  .value,
                              )
                            }
                            enterKeyHint="next"
                            autoComplete="name"
                          />

                          <InputField
                            label="Mobile Number"
                            required
                            placeholder="10-digit mobile number"
                            value={
                              requesterMobile
                            }
                            onChange={(
                              event,
                            ) =>
                              setRequesterMobile(
                                event.target.value
                                  .replace(
                                    /\D/g,
                                    "",
                                  )
                                  .slice(
                                    0,
                                    10,
                                  ),
                              )
                            }
                            inputMode="numeric"
                            maxLength={10}
                            prefix="+91"
                            enterKeyHint="next"
                            autoComplete="tel"
                          />
                        </div>

                        <InputField
                          label="Email Address"
                          placeholder="example@email.com"
                          value={
                            requesterEmail
                          }
                          onChange={(
                            event,
                          ) =>
                            setRequesterEmail(
                              event.target
                                .value,
                            )
                          }
                          enterKeyHint="next"
                          autoComplete="email"
                        />

                        {(
                          requesterType ===
                            "contractor" ||
                          requesterType ===
                            "company"
                        ) && (
                          <div className="grid gap-2 sm:grid-cols-2">
                            <InputField
                              label={
                                requesterType ===
                                "company"
                                  ? "Company Name"
                                  : "Contractor / Firm Name"
                              }
                              required
                              placeholder={
                                requesterType ===
                                "company"
                                  ? "Enter company name"
                                  : "Enter contractor / firm name"
                              }
                              value={
                                companyName
                              }
                              onChange={(
                                event,
                              ) =>
                                setCompanyName(
                                  event.target
                                    .value,
                                )
                              }
                              enterKeyHint="next"
                              autoComplete="organization"
                            />

                            <InputField
                              label="GSTIN"
                              placeholder="Optional GSTIN"
                              value={gstin}
                              onChange={(
                                event,
                              ) =>
                                setGstin(
                                  event.target.value
                                    .replace(
                                      /\s/g,
                                      "",
                                    )
                                    .toUpperCase()
                                    .slice(
                                      0,
                                      15,
                                    ),
                                )
                              }
                              maxLength={15}
                              enterKeyHint="next"
                            />
                          </div>
                        )}

                        <div>
                          <FieldLabel
                            icon={
                              <MapPin className="h-3.5 w-3.5" />
                            }
                            label="Contact Address"
                          />

                          <textarea
                            value={
                              requesterAddress
                            }
                            onChange={(
                              event,
                            ) =>
                              setRequesterAddress(
                                event.target
                                  .value,
                              )
                            }
                            rows={2}
                            placeholder="Optional contact / office address"
                            className="
                              mt-1.5 w-full
                              resize-none
                              rounded-xl
                              border border-gray-200
                              bg-gray-50
                              px-3 py-2.5
                              text-xs
                              font-medium
                              text-gray-900
                              outline-none
                              placeholder:text-gray-400
                              focus:border-emerald-500
                              focus:bg-white
                              focus:ring-2
                              focus:ring-emerald-500/10
                            "
                          />
                        </div>
                      </div>
                    </FormSection>

                    {/* =================================================
                        02 PROJECT & WORKER REQUIREMENT
                    ================================================= */}

                    <FormSection
                      number="02"
                      title="Project & Worker Requirement"
                    >
                      <div className="space-y-4">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <InputField
                            label="Project Name"
                            required
                            placeholder="e.g. House Construction"
                            value={
                              projectName
                            }
                            onChange={(
                              event,
                            ) =>
                              setProjectName(
                                event.target
                                  .value,
                              )
                            }
                            enterKeyHint="next"
                            autoComplete="off"
                          />

                          <SelectField
                            label="Project Type"
                            required
                            value={
                              projectType
                            }
                            onChange={(
                              event,
                            ) =>
                              setProjectType(
                                event.target
                                  .value,
                              )
                            }
                            options={[
                              "Construction",
                              "House Work",
                              "Commercial",
                              "Factory",
                              "Road Work",
                              "Renovation",
                              "Other",
                            ]}
                            placeholder="Select project type"
                          />
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3 sm:p-4">
                          <ProjectWorkerGroups
                            value={
                              workerGroups
                            }
                            onChange={
                              setWorkerGroups
                            }
                          />
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                          <p className="text-[10px] font-bold text-gray-700">
                            Example
                          </p>

                          <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
                            Labour × 3, Painter × 4,
                            Mistry × 2 — ek hi project
                            request mein multiple worker
                            groups add kar sakte hain.
                          </p>
                        </div>
                      </div>
                    </FormSection>

                    {/* =================================================
                        03 WORK ADDRESS
                    ================================================= */}

                    <FormSection
                      number="03"
                      title="Work Address"
                    >
                      <div className="grid gap-2">
                        <div className="relative">
                          <FieldLabel
                            icon={
                              <MapPin className="h-3.5 w-3.5" />
                            }
                            label="Work City"
                            required
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setRequestLocationOpen(
                                (value) =>
                                  !value,
                              )
                            }
                            className="
                              mt-1.5 flex h-11
                              w-full
                              items-center gap-2
                              rounded-xl
                              border
                              border-gray-200
                              bg-gray-50
                              px-3
                              text-left
                              transition
                              hover:border-emerald-300
                            "
                          >
                            <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />

                            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-800">
                              {requestLocation ||
                                "Select work city"}
                            </span>

                            <ChevronDown
                              className={`
                                h-4 w-4
                                text-gray-400
                                transition-transform
                                ${
                                  requestLocationOpen
                                    ? "rotate-180 text-emerald-600"
                                    : ""
                                }
                              `}
                            />
                          </button>

                          {requestLocationOpen && (
                            <Dropdown>
                              <div className="border-b border-gray-100 p-2">
                                <input
                                  ref={
                                    locationSearchRef
                                  }
                                  value={
                                    locationSearch
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    setLocationSearch(
                                      event.target
                                        .value,
                                    )
                                  }
                                  placeholder="Search city..."
                                  className="
                                    h-9 w-full
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    px-3
                                    text-xs
                                    outline-none
                                    focus:border-emerald-500
                                  "
                                />
                              </div>

                              <div className="max-h-52 overflow-y-auto p-1.5">
                                {filteredLocations.map(
                                  (
                                    location,
                                  ) => (
                                    <button
                                      key={
                                        location
                                      }
                                      type="button"
                                      onClick={() => {
                                        setRequestLocation(
                                          location,
                                        );

                                        setRequestLocationOpen(
                                          false,
                                        );

                                        setLocationSearch(
                                          "",
                                        );
                                      }}
                                      className={`
                                        flex w-full
                                        items-center
                                        gap-2
                                        rounded-lg
                                        px-3 py-2.5
                                        text-left
                                        text-xs
                                        font-semibold
                                        ${
                                          requestLocation ===
                                          location
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "text-gray-700 hover:bg-gray-50"
                                        }
                                      `}
                                    >
                                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                                      {location}
                                    </button>
                                  ),
                                )}
                              </div>
                            </Dropdown>
                          )}
                        </div>

                        <InputField
                          label="Full Address"
                          required
                          placeholder="House / Plot, Street, Building, Landmark"
                          value={
                            fullAddress
                          }
                          onChange={(
                            event,
                          ) =>
                            setFullAddress(
                              event.target
                                .value,
                            )
                          }
                          enterKeyHint="next"
                          autoComplete="street-address"
                        />

                        <div className="grid gap-2 sm:grid-cols-2">
                          <InputField
                            label="Area / Locality"
                            required
                            placeholder="e.g. Thatipur"
                            value={
                              locality
                            }
                            onChange={(
                              event,
                            ) =>
                              setLocality(
                                event.target
                                  .value,
                              )
                            }
                            enterKeyHint="next"
                            autoComplete="address-level3"
                          />

                          <SelectField
                            label="State"
                            required
                            value={state}
                            onChange={(
                              event,
                            ) => {
                              setState(
                                event.target
                                  .value,
                              );

                              setDistrict("");
                            }}
                            options={states}
                            placeholder="Select state"
                          />

                          <SelectField
                            label="District"
                            required
                            value={
                              district
                            }
                            onChange={(
                              event,
                            ) =>
                              setDistrict(
                                event.target
                                  .value,
                              )
                            }
                            options={
                              availableDistricts
                            }
                            placeholder={
                              state
                                ? "Select district"
                                : "Select state first"
                            }
                            disabled={!state}
                          />

                          <InputField
                            label="Pincode"
                            required
                            placeholder="6-digit pincode"
                            value={
                              pincode
                            }
                            onChange={(
                              event,
                            ) =>
                              setPincode(
                                event.target.value
                                  .replace(
                                    /\D/g,
                                    "",
                                  )
                                  .slice(
                                    0,
                                    6,
                                  ),
                              )
                            }
                            inputMode="numeric"
                            maxLength={6}
                            enterKeyHint="done"
                            autoComplete="postal-code"
                          />
                        </div>
                      </div>
                    </FormSection>

                    {/* =================================================
                        04 SCHEDULE
                    ================================================= */}

                    <FormSection
                      number="04"
                      title="Work Schedule"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <CompactDateTime
                          icon={
                            <CalendarDays className="h-4 w-4" />
                          }
                          label="Work Date"
                          required
                        >
                          <input
                            type="date"
                            min={today}
                            value={
                              workDate
                            }
                            onChange={(
                              event,
                            ) =>
                              setWorkDate(
                                event.target
                                  .value,
                              )
                            }
                            className="
                              mt-0.5
                              w-full
                              bg-transparent
                              text-xs
                              font-black
                              text-gray-900
                              outline-none
                            "
                          />
                        </CompactDateTime>

                        <CompactDateTime
                          icon={
                            <Clock3 className="h-4 w-4" />
                          }
                          label="Start Time"
                        >
                          <input
                            type="time"
                            value={
                              startTime
                            }
                            onChange={(
                              event,
                            ) =>
                              setStartTime(
                                event.target
                                  .value,
                              )
                            }
                            className="
                              mt-0.5
                              w-full
                              bg-transparent
                              text-xs
                              font-black
                              text-gray-900
                              outline-none
                            "
                          />
                        </CompactDateTime>
                      </div>

                      <div className="mt-3">
                        <FieldLabel label="Work Duration" />

                        <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                          {durations.map(
                            (item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() =>
                                  setDuration(
                                    item,
                                  )
                                }
                                className={`
                                  min-h-9
                                  rounded-lg
                                  border
                                  px-2
                                  text-[10px]
                                  font-black
                                  transition
                                  active:scale-95
                                  ${
                                    duration ===
                                    item
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200"
                                  }
                                `}
                              >
                                {item}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div
                        className="
                          mt-2.5
                          rounded-xl
                          border
                          border-emerald-100
                          bg-emerald-50/60
                          px-3 py-2.5
                        "
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="
                              flex h-8 w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-white
                              text-emerald-600
                              shadow-sm
                            "
                          >
                            <CalendarDays className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-emerald-600
                              "
                            >
                              Schedule
                            </p>

                            <p className="truncate text-xs font-black text-gray-900">
                              {workDate ||
                                "Select date"}{" "}
                              ·{" "}
                              {startTime ||
                                "Select time"}{" "}
                              ·{" "}
                              {duration ||
                                "Select duration"}
                            </p>
                          </div>

                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        </div>
                      </div>
                    </FormSection>

                    {/* =================================================
                        05 BUDGET & DETAILS
                    ================================================= */}

                    <FormSection
                      number="05"
                      title="Budget & Work Details"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <InputField
                          label="Approx Budget"
                          placeholder="e.g. 1500"
                          value={
                            budget
                          }
                          onChange={(
                            event,
                          ) =>
                            setBudget(
                              event.target.value.replace(
                                /\D/g,
                                "",
                              ),
                            )
                          }
                          inputMode="numeric"
                          prefix="₹"
                          enterKeyHint="next"
                        />

                        <div>
                          <FieldLabel
                            label="Work Requirement"
                            required
                          />

                          <textarea
                            value={
                              requirement
                            }
                            onChange={(
                              event,
                            ) =>
                              setRequirement(
                                event.target.value.slice(
                                  0,
                                  500,
                                ),
                              )
                            }
                            rows={3}
                            enterKeyHint="done"
                            placeholder="Example: 3 labour chahiye construction site ke liye..."
                            className="
                              mt-1.5 w-full
                              resize-none
                              rounded-xl
                              border border-gray-200
                              bg-gray-50
                              px-3 py-2.5
                              text-xs
                              font-medium
                              text-gray-900
                              outline-none
                              placeholder:text-gray-400
                              focus:border-emerald-500
                              focus:bg-white
                            "
                          />

                          <div className="mt-1 flex justify-end">
                            <span className="text-[8px] font-medium text-gray-400">
                              {requirement.length}/500
                            </span>
                          </div>
                        </div>
                      </div>
                    </FormSection>

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                      <div
                        data-request-error
                        className="
                          mx-3 mb-3
                          rounded-xl
                          border border-red-100
                          bg-red-50
                          px-3 py-2.5
                          sm:mx-5
                        "
                      >
                        <p className="text-[11px] font-bold text-red-600">
                          {error}
                        </p>
                      </div>
                    )}

                    {/* =================================================
                        SUCCESS
                    ================================================= */}

                    {submitted && (
                      <div
                        className="
                          mx-3 mb-3
                          flex items-center gap-2
                          rounded-xl
                          border border-emerald-100
                          bg-emerald-50
                          px-3 py-3
                          sm:mx-5
                        "
                      >
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

                        <div>
                          <p className="text-xs font-black text-emerald-800">
                            Request submitted
                            successfully
                          </p>

                          <p className="text-[9px] font-medium text-emerald-600">
                            Our team will review
                            your requirement.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* =================================================
                        STICKY SUBMIT
                    ================================================= */}

                    {!keyboardOpen && (
                      <div
                        className="
                          fixed
                          inset-x-0
                          bottom-0
                          z-[100]
                          border-t
                          border-gray-100
                          bg-white/95
                          p-2.5
                          pb-[calc(10px+env(safe-area-inset-bottom))]
                          shadow-[0_-6px_25px_rgba(0,0,0,0.08)]
                          backdrop-blur-xl
                          sm:p-3
                        "
                      >
                        <button
                          type="submit"
                          disabled={
                            submitting ||
                            submitted
                          }
                          className="
                            flex h-12 w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-gradient-to-r
                            from-[#078c43]
                            to-[#09b653]
                            text-xs
                            font-black
                            text-white
                            shadow-lg
                            shadow-emerald-600/20
                            transition-all
                            duration-200
                            active:scale-[0.99]
                            hover:brightness-105
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {submitting ? (
                            <>
                              <span
                                className="
                                  h-4 w-4
                                  animate-spin
                                  rounded-full
                                  border-2
                                  border-white/30
                                  border-t-white
                                "
                              />

                              Submitting...
                            </>
                          ) : submitted ? (
                            <>
                              <Check className="h-4 w-4" />
                              Request Submitted
                            </>
                          ) : (
                            <>
                              Submit Worker Request
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>

                        <div
                          className="
                            mt-1.5
                            flex
                            items-center
                            justify-center
                            gap-1.5
                            text-[9px]
                            font-medium
                            text-gray-400
                          "
                        >
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          No advance payment required
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   FORM SECTION
========================================================= */

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-gray-100 p-3.5 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <div
          className="
            flex h-7 w-7 shrink-0
            items-center justify-center
            rounded-lg
            bg-emerald-50
            text-[9px]
            font-black
            text-emerald-600
          "
        >
          {number}
        </div>

        <h2 className="text-sm font-black text-gray-950">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  icon,
  label,
  required,
}: {
  icon?: ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {icon && (
        <span className="text-emerald-600">
          {icon}
        </span>
      )}

      <label className="text-[10px] font-bold text-gray-700">
        {label}

        {required && (
          <span className="ml-0.5 text-red-500">
            *
          </span>
        )}
      </label>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  required,
  placeholder,
  value,
  onChange,
  inputMode,
  maxLength,
  prefix,
  enterKeyHint,
  autoComplete,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  prefix?: string;
  enterKeyHint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send";
  autoComplete?: string;
}) {
  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
      />

      <div
        className="
          mt-1.5 flex h-11
          items-center
          rounded-xl
          border border-gray-200
          bg-gray-50
          px-3
          transition
          focus-within:border-emerald-500
          focus-within:bg-white
          focus-within:ring-2
          focus-within:ring-emerald-500/10
        "
      >
        {prefix && (
          <span className="mr-1.5 text-sm font-black text-gray-500">
            {prefix}
          </span>
        )}

        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          enterKeyHint={enterKeyHint}
          autoComplete={autoComplete}
          className="
            min-w-0
            w-full
            bg-transparent
            text-xs
            font-medium
            text-gray-900
            outline-none
            placeholder:text-gray-400
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
      />

      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="
            h-11 w-full
            appearance-none
            rounded-xl
            border border-gray-200
            bg-gray-50
            px-3 pr-8
            text-xs
            font-semibold
            text-gray-800
            outline-none
            focus:border-emerald-500
            focus:bg-white
            disabled:opacity-50
          "
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <ChevronDown
          className="
            pointer-events-none
            absolute
            right-2.5
            top-1/2
            h-3.5 w-3.5
            -translate-y-1/2
            text-gray-400
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   DATE / TIME
========================================================= */

function CompactDateTime({
  icon,
  label,
  required,
  children,
}: {
  icon: ReactNode;
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="
        rounded-xl
        border border-gray-200
        bg-white
        p-2.5
        transition
        focus-within:border-emerald-400
      "
    >
      <div className="flex items-center gap-2">
        <div
          className="
            flex h-8 w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-emerald-50
            text-emerald-600
          "
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span
              className="
                text-[9px]
                font-black
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              {label}
            </span>

            {required && (
              <span className="text-[9px] text-red-500">
                *
              </span>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DROPDOWN
========================================================= */

function Dropdown({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        absolute
        left-0 right-0
        top-[calc(100%+6px)]
        z-[100]
        overflow-hidden
        rounded-2xl
        border border-gray-200
        bg-white
        shadow-[0_20px_50px_rgba(0,0,0,0.15)]
      "
    >
      {children}
    </div>
  );
}