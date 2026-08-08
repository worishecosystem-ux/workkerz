"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const [validSession, setValidSession] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // CHECK RESET SESSION
  // =====================================================

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(
            "This password reset link is invalid or has expired.",
          );

          setValidSession(false);
          return;
        }

        setValidSession(true);
      } catch (error) {
        console.error(
          "Reset session error:",
          error,
        );

        setError(
          "Unable to verify password reset session.",
        );
      } finally {
        setChecking(false);
      }
    };

    checkSession();

    // Supabase may establish the recovery session
    // after the page initially loads.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setValidSession(true);
          setError("");
          setChecking(false);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const passwordLength =
    password.length >= 8;

  const hasUppercase =
    /[A-Z]/.test(password);

  const hasNumber =
    /[0-9]/.test(password);

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const passwordValid =
    passwordLength &&
    hasUppercase &&
    hasNumber;

  // =====================================================
  // UPDATE PASSWORD
  // =====================================================

  const handleUpdatePassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!passwordValid) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter and one number.",
      );

      return;
    }

    if (!passwordsMatch) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "Your reset session has expired. Please request a new reset link.",
        );

        return;
      }

      // ===================================================
      // UPDATE SUPABASE PASSWORD
      // ===================================================

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        console.error(
          "Password update error:",
          updateError,
        );

        setError(
          updateError.message ||
            "Unable to update password.",
        );

        return;
      }

      // ===================================================
      // SUCCESS
      // ===================================================

      setSuccess(
        "Password updated successfully. Redirecting to login...",
      );

      // Sign out so the admin must use the
      // new password on the next login.
      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace(
          "/admin/admin-login",
        );
      }, 1800);
    } catch (error) {
      console.error(
        "Password reset error:",
        error,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (checking) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">

        <div className="text-center">

          <div className="w-9 h-9 border-2 border-[#FF5C39] border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-sm text-[#64748B] mt-4">
            Verifying reset link...
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // INVALID SESSION
  // =====================================================

  if (!validSession) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">

        <div className="w-full max-w-md">

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center">

            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">

              <AlertCircle className="w-7 h-7 text-red-500" />

            </div>

            <h1 className="text-xl font-black text-[#0F172A] mt-5">
              Reset Link Invalid
            </h1>

            <p className="text-sm text-[#64748B] mt-2 leading-6">
              {error ||
                "This password reset link is invalid or has expired."}
            </p>

            <button
              type="button"
              onClick={() =>
                router.replace(
                  "/admin/admin-login",
                )
              }
              className="w-full h-12 mt-6 rounded-xl bg-[#FF5C39] hover:bg-[#e54e2e] text-white text-sm font-bold transition"
            >
              Back to Admin Login
            </button>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF5C39] text-white shadow-lg shadow-orange-100">

            <LockKeyhole className="w-6 h-6" />

          </div>

          <h1 className="text-2xl font-black text-[#0F172A] mt-4">
            Create New Password
          </h1>

          <p className="text-sm text-[#64748B] mt-1">
            Set a new password for your Workkerz
            admin account.
          </p>

        </div>

        {/* CARD */}

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-7">

          <form
            onSubmit={handleUpdatePassword}
            className="space-y-5"
          >

            {/* NEW PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                New Password
              </label>

              <div className="relative">

                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#64748B]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#64748B]" />
                  )}
                </button>

              </div>

            </div>

            {/* PASSWORD REQUIREMENTS */}

            <div className="rounded-xl bg-[#F8FAFC] border border-gray-100 p-4">

              <p className="text-xs font-bold text-[#0F172A] mb-3">
                Password requirements
              </p>

              <div className="space-y-2">

                <Requirement
                  valid={passwordLength}
                  text="At least 8 characters"
                />

                <Requirement
                  valid={hasUppercase}
                  text="At least one uppercase letter"
                />

                <Requirement
                  valid={hasNumber}
                  text="At least one number"
                />

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Confirm New Password
              </label>

              <div className="relative">

                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-[#64748B]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#64748B]" />
                  )}
                </button>

              </div>

            </div>

            {/* PASSWORD MATCH */}

            {confirmPassword && (
              <div
                className={`text-xs ${
                  passwordsMatch
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {passwordsMatch
                  ? "Passwords match."
                  : "Passwords do not match."}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />

                <span>{error}</span>

              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />

                <span>{success}</span>

              </div>
            )}

            {/* UPDATE */}

            <button
              type="submit"
              disabled={
                loading ||
                !passwordValid ||
                !passwordsMatch
              }
              className="w-full h-12 rounded-xl bg-[#FF5C39] hover:bg-[#e54e2e] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition"
            >
              {loading
                ? "Updating Password..."
                : "Update Password"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}


// =========================================================
// PASSWORD REQUIREMENT
// =========================================================

function Requirement({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center ${
          valid
            ? "bg-emerald-500"
            : "bg-gray-200"
        }`}
      >
        {valid && (
          <CheckCircle className="w-3 h-3 text-white" />
        )}
      </div>

      <span
        className={`text-xs ${
          valid
            ? "text-emerald-600"
            : "text-[#94A3B8]"
        }`}
      >
        {text}
      </span>

    </div>
  );
}