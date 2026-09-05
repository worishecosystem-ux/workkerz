"use client";

import { FormEvent, useEffect, useState } from "react";
import { Sparkles, Users, X } from "lucide-react";

import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

import { supabase } from "@/lib/supabase";

import type { WorkerGroup } from "@/app/components/ProjectWorkerGroups";

import RequestProgress from "./worker-request/RequestProgress";
import RequestStep1 from "./worker-request/RequestStep1";
import RequestStep2 from "./worker-request/RequestStep2";
import RequestStep3 from "./worker-request/RequestStep3";
import RequestStep4 from "./worker-request/RequestStep4";
import RequestStep5 from "./worker-request/RequestStep5";

/* =========================================================
   TYPES
========================================================= */

export type RequesterType =
  | "individual"
  | "contractor"
  | "company";

/* =========================================================
   DATA
========================================================= */

export const requestLocations = [
  "Bhopal",
  "Gwalior",
  "Indore",
  "Jabalpur",
  "Bilaspur",
  "Raipur",
  "Other",
];

export const states = [
  "Madhya Pradesh",
  "Chhattisgarh",
  "Rajasthan",
  "Maharashtra",
  "Uttar Pradesh",
  "Other",
];

export const districtsByState: Record<string, string[]> = {
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

export const durations = [
  "Few Hours",
  "1 Day",
  "2 Days",
  "3 Days",
  "1 Week",
  "1 Month",
];

/* =========================================================
   MAIN HERO
========================================================= */

export default function HomeHero({
  openRequest = false,
  onRequestClose,
}: {
  openRequest?: boolean;
  onRequestClose?: () => void;
}) {
  /* =======================================================
     REQUEST OPEN
  ======================================================= */

  const [requestOpen, setRequestOpen] =
    useState(openRequest);

  /* =======================================================
     STEP
  ======================================================= */

  const TOTAL_STEPS = 5;

  const [currentStep, setCurrentStep] =
    useState(1);

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

  const [requestLocation, setRequestLocation] =
    useState("");

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
     SYSTEM
  ======================================================= */

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [keyboardOpen, setKeyboardOpen] =
    useState(false);

  /* =======================================================
     SYNC OPEN
  ======================================================= */

  useEffect(() => {
    setRequestOpen(openRequest);
  }, [openRequest]);

  /* =======================================================
     LOCK BODY + HTML SCROLL
  ======================================================= */

  useEffect(() => {
    if (!requestOpen) return;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousBodyHeight =
      document.body.style.height;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    const previousHtmlHeight =
      document.documentElement.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";

    document.documentElement.style.overflow =
      "hidden";
    document.documentElement.style.height =
      "100dvh";

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.body.style.height =
        previousBodyHeight;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.documentElement.style.height =
        previousHtmlHeight;
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
      const show =
        await Keyboard.addListener(
          "keyboardWillShow",
          () => {
            setKeyboardOpen(true);
          },
        );

      const hide =
        await Keyboard.addListener(
          "keyboardWillHide",
          () => {
            setKeyboardOpen(false);
          },
        );

      const didShow =
        await Keyboard.addListener(
          "keyboardDidShow",
          () => {
            setKeyboardOpen(true);
          },
        );

      const didHide =
        await Keyboard.addListener(
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
     ERROR
  ======================================================= */

  function showError(message: string) {
    setError(message);
  }

  /* =======================================================
     STEP 1 VALIDATION
  ======================================================= */

  function validateStep1() {
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

    return "";
  }

  /* =======================================================
     STEP 2 VALIDATION
  ======================================================= */

  function validateStep2() {
    if (!projectName.trim()) {
      return "Please enter your project name.";
    }

    if (!projectType) {
      return "Please select a project type.";
    }

    if (!workerGroups.length) {
      return "Please select at least one worker.";
    }

    const invalidGroup =
      workerGroups.some(
        (group) =>
          !group.category.trim() ||
          !Number.isFinite(
            Number(
              group.workers_required,
            ),
          ) ||
          Number(
            group.workers_required,
          ) < 1,
      );

    if (invalidGroup) {
      return "Please select a worker and enter a valid quantity.";
    }

    return "";
  }

  /* =======================================================
     STEP 3 VALIDATION
  ======================================================= */

  function validateStep3() {
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

    return "";
  }

  /* =======================================================
     STEP 4 VALIDATION
  ======================================================= */

  function validateStep4() {
    if (!workDate) {
      return "Please select your work date.";
    }

    return "";
  }

  /* =======================================================
     STEP NAVIGATION
  ======================================================= */

  function nextStep() {
    setError("");

    let validationError = "";

    switch (currentStep) {
      case 1:
        validationError = validateStep1();
        break;

      case 2:
        validationError = validateStep2();
        break;

      case 3:
        validationError = validateStep3();
        break;

      case 4:
        validationError = validateStep4();
        break;

      default:
        break;
    }

    if (validationError) {
      showError(validationError);
      return;
    }

    setCurrentStep((prev) =>
      Math.min(
        prev + 1,
        TOTAL_STEPS,
      ),
    );
  }

  /* =======================================================
     PREVIOUS STEP
  ======================================================= */

  function previousStep() {
    setError("");

    setCurrentStep((prev) =>
      Math.max(prev - 1, 1),
    );
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetForm() {
    setCurrentStep(1);

    setRequesterType("individual");

    setRequesterName("");
    setRequesterMobile("");
    setRequesterEmail("");
    setCompanyName("");
    setGstin("");
    setRequesterAddress("");

    setProjectName("");
    setProjectType("Construction");

    setWorkerGroups([
      {
        id: `${Date.now()}-initial`,
        category: "Labour",
        workers_required: 1,
      },
    ]);

    setRequestLocation("");
    setFullAddress("");
    setLocality("");
    setDistrict("");
    setState("");
    setPincode("");

    setWorkDate("");
    setStartTime("");
    setDuration("1 Day");

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
    setError("");

    onRequestClose?.();
  }

  /* =======================================================
     FINAL VALIDATION
  ======================================================= */

  function validateForm() {
    const step1Error =
      validateStep1();

    if (step1Error) {
      return step1Error;
    }

    const step2Error =
      validateStep2();

    if (step2Error) {
      return step2Error;
    }

    const step3Error =
      validateStep3();

    if (step3Error) {
      return step3Error;
    }

    const step4Error =
      validateStep4();

    if (step4Error) {
      return step4Error;
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
      showError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const totalWorkers =
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
        );

      const requirements =
        workerGroups.map(
          (group) => ({
            category: group.category,
            workers_required:
              Math.max(
                1,
                Number(
                  group.workers_required,
                ) || 1,
              ),
          }),
        );

      const categories =
        workerGroups
          .map(
            (group) =>
              group.category,
          )
          .filter(Boolean)
          .join(", ");

      const { error: insertError } =
        await supabase
          .from("worker_requests")
          .insert({
            project_name:
              projectName.trim(),

            project_type:
              projectType,

            workers_required:
              totalWorkers,

            total_workers:
              totalWorkers,

            category:
              categories,

            requirements:
              requirements,

            location:
              requestLocation,

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
                    .replace(/\s/g, "")
                    .toUpperCase() ||
                  null,

            requester_address:
              requesterAddress.trim() ||
              null,

            requester_user_id:
              user?.id || null,

            full_address:
              fullAddress.trim(),

            locality:
              locality.trim(),

            district,

            state,

            pincode,

            work_date:
              workDate,

            start_time:
              startTime || null,

            duration,

            budget:
              budget
                ? Number(budget)
                : null,

            requirement:
              requirement.trim(),

            status:
              "pending",

            source:
              "home",

            is_deleted:
              false,
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
        <div className="fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden overscroll-none bg-black/70 backdrop-blur-md">
          <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden p-0 sm:p-3 lg:p-5">
            <div className="relative flex h-[100dvh] w-full min-h-0 flex-col overflow-hidden overscroll-none bg-[#f6faf8] sm:h-[96dvh] sm:rounded-3xl sm:border sm:border-white/30 sm:shadow-[0_30px_100px_rgba(0,0,0,0.25)] lg:max-w-6xl">

              {/* =================================================
                  BACKGROUND IMAGE
              ================================================= */}

              <div className="pointer-events-none absolute inset-x-0 top-22 z-0 h-50 overflow-hidden sm:h-77.5 lg:h-85">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url('/images/worker-request-bg.png')",
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-[#f6faf8]" />

                <div className="absolute inset-0 bg-emerald-950/10" />
              </div>

              {/* =================================================
                  HEADER
              ================================================= */}

              <header className="relative z-40 flex shrink-0 items-center justify-between bg-gradient-to-r from-[#047a3b]/95 via-[#079d49]/95 to-[#0ab957]/95 px-3 py-2.5 pt-[max(10px,env(safe-area-inset-top))] text-white shadow-sm sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Users className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-100">
                        Workkerz
                      </p>

                      <span className="flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[7px] font-bold">
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition active:scale-95 hover:bg-white/20 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              {/* =================================================
                  PROGRESS
              ================================================= */}

              <div className="relative z-40 shrink-0">
                <RequestProgress
                  currentStep={currentStep}
                />
              </div>

              {/* =================================================
                  FIXED FORM AREA
              ================================================= */}

              <div
                data-request-scroll
                className="relative z-20 min-h-0 flex-1 overflow-hidden overscroll-none"
              >
                <form
                  onSubmit={submitRequest}
                  className="relative mx-auto h-full w-full max-w-5xl overflow-hidden px-3 pb-24 pt-12 sm:px-5 sm:pb-24 sm:pt-4 lg:pt-5"
                >
                  {/* =================================================
                      STEP 1
                  ================================================= */}

                  {currentStep === 1 && (
                    <RequestStep1
                      requesterType={
                        requesterType
                      }
                      setRequesterType={
                        setRequesterType
                      }
                      requesterName={
                        requesterName
                      }
                      setRequesterName={
                        setRequesterName
                      }
                      requesterMobile={
                        requesterMobile
                      }
                      setRequesterMobile={
                        setRequesterMobile
                      }
                      requesterEmail={
                        requesterEmail
                      }
                      setRequesterEmail={
                        setRequesterEmail
                      }
                      companyName={
                        companyName
                      }
                      setCompanyName={
                        setCompanyName
                      }
                      gstin={gstin}
                      setGstin={setGstin}
                      requesterAddress={
                        requesterAddress
                      }
                      setRequesterAddress={
                        setRequesterAddress
                      }
                      onNext={nextStep}
                    />
                  )}

                  {/* =================================================
                      STEP 2
                  ================================================= */}

                  {currentStep === 2 && (
                    <RequestStep2
                      projectName={
                        projectName
                      }
                      setProjectName={
                        setProjectName
                      }
                      projectType={
                        projectType
                      }
                      setProjectType={
                        setProjectType
                      }
                      workerGroups={
                        workerGroups
                      }
                      setWorkerGroups={
                        setWorkerGroups
                      }
                      onNext={nextStep}
                      onBack={
                        previousStep
                      }
                    />
                  )}

                  {/* =================================================
                      STEP 3
                  ================================================= */}

                  {currentStep === 3 && (
                    <RequestStep3
                      requestLocation={
                        requestLocation
                      }
                      setRequestLocation={
                        setRequestLocation
                      }
                      fullAddress={
                        fullAddress
                      }
                      setFullAddress={
                        setFullAddress
                      }
                      locality={locality}
                      setLocality={
                        setLocality
                      }
                      state={state}
                      setState={setState}
                      district={
                        district
                      }
                      setDistrict={
                        setDistrict
                      }
                      pincode={pincode}
                      setPincode={
                        setPincode
                      }
                      onNext={nextStep}
                      onBack={
                        previousStep
                      }
                    />
                  )}

                  {/* =================================================
                      STEP 4
                  ================================================= */}

                  {currentStep === 4 && (
                    <RequestStep4
                      workDate={workDate}
                      setWorkDate={
                        setWorkDate
                      }
                      startTime={
                        startTime
                      }
                      setStartTime={
                        setStartTime
                      }
                      duration={
                        duration
                      }
                      setDuration={
                        setDuration
                      }
                      onNext={nextStep}
                      onBack={
                        previousStep
                      }
                    />
                  )}

                  {/* =================================================
                      STEP 5
                  ================================================= */}

                  {currentStep === 5 && (
                    <RequestStep5
                      budget={budget}
                      setBudget={setBudget}
                      requirement={
                        requirement
                      }
                      setRequirement={
                        setRequirement
                      }
                      workerGroups={
                        workerGroups
                      }
                      projectName={
                        projectName
                      }
                      projectType={
                        projectType
                      }
                      requestLocation={
                        requestLocation
                      }
                      workDate={
                        workDate
                      }
                      startTime={
                        startTime
                      }
                      duration={
                        duration
                      }
                      submitting={
                        submitting
                      }
                      submitted={
                        submitted
                      }
                      onBack={
                        previousStep
                      }
                    />
                  )}

                  {/* =================================================
                      ERROR
                  ================================================= */}

                  {error && (
                    <div
                      data-request-error
                      className="absolute bottom-24 left-3 right-3 z-[90] rounded-xl border border-red-100 bg-red-50/95 px-3 py-2.5 shadow-lg backdrop-blur-md sm:left-5 sm:right-5"
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
                    <div className="absolute bottom-24 left-3 right-3 z-[90] rounded-2xl border border-emerald-200/50 bg-emerald-50/95 px-4 py-3 text-center shadow-lg backdrop-blur-md sm:left-5 sm:right-5">
                      <p className="text-xs font-black text-emerald-700">
                        Your worker request has been submitted successfully!
                      </p>

                      <p className="mt-0.5 text-[10px] text-emerald-600">
                        We will connect you with the best workers.
                      </p>
                    </div>
                  )}
                </form>
              </div>

              {/* =================================================
                  FIXED BOTTOM ACTION BAR
              ================================================= */}

              {!keyboardOpen && (
                <div className="absolute inset-x-0 bottom-0 z-[100] shrink-0 border-t border-gray-100 bg-white/95 p-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl sm:p-3">
                  <div className="mx-auto max-w-5xl">
                    <div className="flex gap-2">

                      {/* BACK */}

                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={
                            previousStep
                          }
                          disabled={
                            submitting
                          }
                          className="flex h-12 w-24 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-700 transition active:scale-[.98] disabled:opacity-50"
                        >
                          Back
                        </button>
                      )}

                      {/* CONTINUE / SUBMIT */}

                      {currentStep <
                      TOTAL_STEPS ? (
                        <button
                          type="button"
                          onClick={
                            nextStep
                          }
                          disabled={
                            submitting
                          }
                          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#078c43] to-[#09b653] text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition active:scale-[.99] hover:brightness-105 disabled:opacity-60"
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={
                            submitting ||
                            submitted
                          }
                          onClick={() => {
                            document
                              .querySelector(
                                "form",
                              )
                              ?.requestSubmit();
                          }}
                          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#078c43] to-[#09b653] text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition active:scale-[.99] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitting
                            ? "Submitting..."
                            : submitted
                              ? "Request Submitted"
                              : "Submit Worker Request"}
                        </button>
                      )}
                    </div>

                    <div className="mt-1.5 text-center text-[9px] font-medium text-gray-400">
                      {currentStep ===
                      TOTAL_STEPS
                        ? "Review your request before submitting"
                        : `Step ${currentStep} of ${TOTAL_STEPS}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}