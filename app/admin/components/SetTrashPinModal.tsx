"use client";

import {
  Check,
  Delete,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

import { useState } from "react";

import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function SetTrashPinModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<
    "pin" | "confirm"
  >("pin");

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!open) return null;

  /* =========================================================
     ACTIVE PIN
  ========================================================= */

  const activePin =
    step === "pin"
      ? pin
      : confirmPin;

  /* =========================================================
     ADD NUMBER
  ========================================================= */

  const handleNumber = (
    number: string,
  ) => {
    if (loading) return;

    if (activePin.length >= 6) {
      return;
    }

    setError("");

    if (step === "pin") {
      setPin(
        (current) =>
          current.length < 6
            ? current + number
            : current,
      );
    } else {
      setConfirmPin(
        (current) =>
          current.length < 6
            ? current + number
            : current,
      );
    }
  };

  /* =========================================================
     BACKSPACE
  ========================================================= */

  const handleBackspace = () => {
    if (loading) return;

    setError("");

    if (step === "pin") {
      setPin((current) =>
        current.slice(0, -1),
      );
    } else {
      setConfirmPin((current) =>
        current.slice(0, -1),
      );
    }
  };

  /* =========================================================
     CONTINUE
  ========================================================= */

  const handleContinue = () => {
    setError("");

    if (!/^\d{4,6}$/.test(pin)) {
      setError(
        "PIN must contain 4–6 digits.",
      );
      return;
    }

    setStep("confirm");
  };

  /* =========================================================
     SET PIN
  ========================================================= */

  const handleSetPin = async () => {
    if (!/^\d{4,6}$/.test(confirmPin)) {
      setError(
        "Confirm PIN must contain 4–6 digits.",
      );
      return;
    }

    if (pin !== confirmPin) {
      setError(
        "PINs do not match.",
      );
      setConfirmPin("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      /* =====================================================
         GET SESSION
      ===================================================== */

      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "[Set Trash PIN] Session error:",
          sessionError,
        );

        setError(
          "Unable to get admin session.",
        );

        return;
      }

      const session =
        sessionData.session;

      if (!session?.access_token) {
        setError(
          "Your admin session has expired. Please login again.",
        );

        return;
      }

      /* =====================================================
         VERIFY ADMIN
      ===================================================== */

      const adminResponse =
        await fetch(
          "/api/admin/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include",
            cache: "no-store",
          },
        );

      const adminResult =
        await adminResponse
          .json()
          .catch(() => null);

      if (!adminResponse.ok) {
        setError(
          adminResult?.error ||
            "Unable to authenticate admin.",
        );

        return;
      }

      /* =====================================================
         SUPER ADMIN ONLY
      ===================================================== */

      if (
        adminResult?.isSuperAdmin !==
        true
      ) {
        setError(
          "Only Super Admin can set the Trash PIN.",
        );

        return;
      }

      /* =====================================================
         SAVE PIN
      ===================================================== */

      const response =
        await fetch(
          "/api/admin/trash-pin/set",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include",
            cache: "no-store",
            body: JSON.stringify({
              pin,
            }),
          },
        );

      const result =
        await response
          .json()
          .catch(() => null);

      if (
        !response.ok ||
        result?.success !== true
      ) {
        setError(
          result?.error ||
            "Unable to save Trash PIN.",
        );

        return;
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setPin("");
      setConfirmPin("");
      setStep("pin");
      setError("");

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(
        "[Set Trash PIN]",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to set Trash PIN.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const handleClose = () => {
    if (loading) return;

    setPin("");
    setConfirmPin("");
    setStep("pin");
    setError("");

    onClose();
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">

      <div className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-black text-[#172033]">
                Set Trash PIN
              </h2>

              <p className="mt-0.5 text-[9px] font-medium text-[#94A3B8]">
                Super Admin only
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        {/* =================================================
            STEP
        ================================================= */}

        <div className="px-5 pt-4">

          <div className="mb-3 flex items-center justify-between">

            <p className="text-[9px] font-black uppercase tracking-wide text-[#64748B]">
              {step === "pin"
                ? "Create PIN"
                : "Confirm PIN"}
            </p>

            <span className="rounded-full bg-gray-100 px-2 py-1 text-[8px] font-black text-[#64748B]">
              {step === "pin"
                ? "1 / 2"
                : "2 / 2"}
            </span>

          </div>

          {/* PIN DISPLAY */}

          <div className="flex justify-center gap-2">

            {Array.from({
              length: 6,
            }).map((_, index) => {
              const filled =
                index <
                activePin.length;

              return (
                <div
                  key={index}
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    text-sm
                    font-black
                    transition
                    ${
                      filled
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : "border-gray-200 bg-gray-50 text-gray-300"
                    }
                  `}
                >
                  {filled
                    ? "•"
                    : "○"}
                </div>
              );
            })}

          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
              <p className="text-center text-[9px] font-bold leading-4 text-red-600">
                {error}
              </p>
            </div>
          )}

        </div>

        {/* =================================================
            KEYPAD
        ================================================= */}

        <div className="grid grid-cols-3 gap-2 px-5 py-5">

          {[
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
          ].map((number) => (
            <button
              key={number}
              type="button"
              disabled={loading}
              onClick={() =>
                handleNumber(
                  number,
                )
              }
              className="flex h-11 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-sm font-black text-[#172033] transition hover:bg-gray-100 active:scale-95 disabled:opacity-50"
            >
              {number}
            </button>
          ))}

          {/* BACKSPACE */}

          <button
            type="button"
            disabled={
              loading ||
              activePin.length ===
                0
            }
            onClick={
              handleBackspace
            }
            className="flex h-11 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <Delete className="h-4 w-4" />
          </button>

          {/* ZERO */}

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              handleNumber("0")
            }
            className="flex h-11 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-sm font-black text-[#172033] hover:bg-gray-100 disabled:opacity-50"
          >
            0
          </button>

          {/* ACTION */}

          <button
            type="button"
            disabled={
              loading ||
              activePin.length <
                4
            }
            onClick={
              step === "pin"
                ? handleContinue
                : handleSetPin
            }
            className="flex h-11 items-center justify-center rounded-xl bg-[#172033] text-white hover:bg-[#101827] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === "pin" ? (
              <Check className="h-4 w-4" />
            ) : (
              <LockKeyhole className="h-4 w-4" />
            )}
          </button>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">

          <p className="text-center text-[8px] font-medium leading-4 text-[#94A3B8]">
            Create a 4–6 digit PIN.
            <br />
            Only Super Admin can change this PIN.
          </p>

        </div>

      </div>

    </div>
  );
}