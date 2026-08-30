"use client";

import {
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
  onVerified: () => void;
};

export default function TrashPinModal({
  open,
  onClose,
  onVerified,
}: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  /* =========================================================
     ADD NUMBER
  ========================================================= */

  const handleNumber = (number: string) => {
    if (loading) return;

    // EXACTLY 4 DIGITS
    if (pin.length >= 4) return;

    setError("");

    setPin((current) => {
      if (current.length >= 4) {
        return current;
      }

      return `${current}${number}`;
    });
  };

  /* =========================================================
     BACKSPACE
  ========================================================= */

  const handleBackspace = () => {
    if (loading) return;

    setError("");

    setPin((current) =>
      current.slice(0, -1),
    );
  };

  /* =========================================================
     VERIFY TRASH PIN
  ========================================================= */

  const handleVerify = async () => {
    // EXACTLY 4 DIGITS
    if (pin.length !== 4) {
      setError(
        "Enter your 4-digit Trash PIN.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      /* =====================================================
         GET CURRENT SUPABASE SESSION
      ===================================================== */

      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "[Trash PIN Modal] Session error:",
          sessionError,
        );

        setError(
          "Unable to get your admin session.",
        );

        return;
      }

      const session =
        sessionData?.session;

      if (!session?.access_token) {
        setError(
          "Your admin session has expired. Please login again.",
        );

        return;
      }

      /* =====================================================
         VERIFY PIN

         Do NOT call /api/admin/me here.

         The verify API authenticates the Supabase
         access token itself.
      ===================================================== */

      const response =
        await fetch(
          "/api/admin/trash-pin/verify",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            credentials: "include",

            cache: "no-store",

            body: JSON.stringify({
              pin,
            }),
          },
        );

      /* =====================================================
         READ RESPONSE
      ===================================================== */

      const contentType =
        response.headers.get(
          "content-type",
        ) || "";

      let result: {
        success?: boolean;
        configured?: boolean;
        error?: string;
        message?: string;
      } | null = null;

      if (
        contentType.includes(
          "application/json",
        )
      ) {
        result =
          await response
            .json()
            .catch(() => null);
      } else {
        const text =
          await response
            .text()
            .catch(() => "");

        console.error(
          "[Trash PIN Modal] Non-JSON response:",
          text.slice(0, 500),
        );

        setError(
          `API error (${response.status}). Please check the Trash PIN API route.`,
        );

        return;
      }

      /* =====================================================
         HANDLE API ERROR
      ===================================================== */

      if (
        !response.ok ||
        result?.success !== true
      ) {
        console.error(
          "[Trash PIN Modal] Verify failed:",
          {
            status:
              response.status,
            result,
          },
        );

        /* PIN NOT CONFIGURED */

        if (
          result?.configured ===
          false
        ) {
          setError(
            "Trash PIN has not been configured by Super Admin.",
          );

          setPin("");

          return;
        }

        /* UNAUTHORIZED */

        if (
          response.status ===
          401
        ) {
          setError(
            result?.error ||
              "Invalid or expired admin session.",
          );

          setPin("");

          return;
        }

        /* FORBIDDEN */

        if (
          response.status ===
          403
        ) {
          setError(
            result?.error ||
              "Only Super Admin can access Trash.",
          );

          setPin("");

          return;
        }

        /* WRONG PIN */

        setError(
          result?.error ||
            "Incorrect Trash PIN.",
        );

        setPin("");

        return;
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setPin("");
      setError("");

      onVerified();
    } catch (err) {
      console.error(
        "[Trash PIN Modal]",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify Trash PIN. Please try again.",
      );

      setPin("");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-[360px]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            px-5
            py-4
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <LockKeyhole className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2
                  className="
                    text-sm
                    font-black
                    text-[#172033]
                  "
                >
                  Trash Locked
                </h2>

                <ShieldCheck
                  className="
                    h-3.5
                    w-3.5
                    text-emerald-500
                  "
                />
              </div>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  font-medium
                  text-[#94A3B8]
                "
              >
                Enter 4-digit Super Admin PIN
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              bg-gray-50
              text-gray-500
              transition
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ===================================================
            PIN DISPLAY — 4 BOXES
        =================================================== */}

        <div className="px-5 pt-5">
          <div className="flex justify-center gap-2.5">
            {Array.from({
              length: 4,
            }).map((_, index) => {
              const filled =
                index < pin.length;

              return (
                <div
                  key={index}
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    text-lg
                    font-black
                    transition
                    ${
                      filled
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-gray-200 bg-gray-50 text-gray-300"
                    }
                  `}
                >
                  {filled ? "•" : "○"}
                </div>
              );
            })}
          </div>

          {error && (
            <div
              className="
                mt-3
                rounded-lg
                border
                border-red-100
                bg-red-50
                px-3
                py-2
              "
            >
              <p
                className="
                  text-center
                  text-[9px]
                  font-bold
                  leading-4
                  text-red-600
                "
              >
                {error}
              </p>
            </div>
          )}
        </div>

        {/* ===================================================
            KEYPAD
        =================================================== */}

        <div className="grid grid-cols-3 gap-2 px-5 py-5">
          {/* 1 - 9 */}

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
              disabled={
                loading ||
                pin.length >= 4
              }
              onClick={() =>
                handleNumber(number)
              }
              className="
                flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-gray-100
                bg-gray-50
                text-sm
                font-black
                text-[#172033]
                transition
                hover:bg-gray-100
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {number}
            </button>
          ))}

          {/* =================================================
              BACKSPACE
          ================================================= */}

          <button
            type="button"
            disabled={
              loading ||
              pin.length === 0
            }
            onClick={
              handleBackspace
            }
            aria-label="Delete last digit"
            className="
              flex
              h-11
              items-center
              justify-center
              rounded-xl
              border
              border-gray-100
              bg-gray-50
              text-gray-500
              transition
              hover:bg-gray-100
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Delete className="h-4 w-4" />
          </button>

          {/* =================================================
              ZERO
          ================================================= */}

          <button
            type="button"
            disabled={
              loading ||
              pin.length >= 4
            }
            onClick={() =>
              handleNumber("0")
            }
            className="
              flex
              h-11
              items-center
              justify-center
              rounded-xl
              border
              border-gray-100
              bg-gray-50
              text-sm
              font-black
              text-[#172033]
              transition
              hover:bg-gray-100
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            0
          </button>

          {/* =================================================
              VERIFY
          ================================================= */}

          <button
            type="button"
            disabled={
              loading ||
              pin.length !== 4
            }
            onClick={
              handleVerify
            }
            className="
              flex
              h-11
              items-center
              justify-center
              rounded-xl
              bg-[#172033]
              text-white
              transition
              hover:bg-[#101827]
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LockKeyhole className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div
          className="
            border-t
            border-gray-100
            bg-gray-50
            px-5
            py-3
          "
        >
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck
              className="
                h-3
                w-3
                text-emerald-500
              "
            />

            <p
              className="
                text-center
                text-[8px]
                font-medium
                leading-4
                text-[#94A3B8]
              "
            >
              Trash access is restricted
              to Super Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}