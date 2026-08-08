"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // =====================================================
      // SUPABASE LOGIN
      // =====================================================

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        setError(
          "Invalid email or password.",
        );

        return;
      }

      const user = authData.user;

      if (!user) {
        setError(
          "Unable to create login session.",
        );

        return;
      }

      // =====================================================
      // CHECK ADMIN PROFILE
      // =====================================================

      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admin_profiles")
        .select(
          "id, full_name, email, role, is_active",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) {
        console.error(
          "Admin profile error:",
          adminError,
        );

        await supabase.auth.signOut();

        setError(
          "Unable to verify admin account.",
        );

        return;
      }

      // =====================================================
      // NOT AN ADMIN
      // =====================================================

      if (!admin) {
        await supabase.auth.signOut();

        setError(
          "This account does not have admin access.",
        );

        return;
      }

      // =====================================================
      // ADMIN DISABLED
      // =====================================================

      if (!admin.is_active) {
        await supabase.auth.signOut();

        setError(
          "Your admin account has been disabled.",
        );

        return;
      }

      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error(
        "Admin login error:",
        error,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF5C39] text-white shadow-lg shadow-orange-100">
            <LockKeyhole className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-black text-[#0F172A] mt-4">
            Workkerz Admin
          </h1>

          <p className="text-sm text-[#64748B] mt-1">
            Sign in to your admin account
          </p>

        </div>

        {/* LOGIN CARD */}

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-7">

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Email
              </label>

              <div className="relative">

                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter admin email"
                  autoComplete="email"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-[#0F172A] outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 transition"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Password
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
                    setPassword(event.target.value)
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
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

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* LOGIN */}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#FF5C39] hover:bg-[#e54e2e] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

        </div>

        {/* SECURITY NOTE */}

        <p className="text-center text-xs text-[#94A3B8] mt-5">
          Admin access is provided by the system
          administrator.
        </p>

      </div>

    </main>
  );
}