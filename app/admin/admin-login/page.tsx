"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const login = async () => {
    try {
      setLoading(true);

      const { data, error } =
        await supabase
          .from("admin_users")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .single();

      if (error || !data) {
        alert(
          "Invalid credentials",
        );

        return;
      }

      localStorage.setItem(
        "admin-auth",
        JSON.stringify(data),
      );

      router.push("/admin");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-4xl border border-gray-200 p-8 shadow-xl">
        <div className="text-3xl font-black text-center text-[#0F172A]">
          Admin Login
        </div>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value,
              )
            }
            className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value,
              )
            }
            className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none"
          />

          <button
            onClick={login}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-[#0F172A] text-white font-bold"
          >
            {loading
              ? "Please wait..."
              : "Login"}
          </button>

          <button
            onClick={() =>
              router.push
                ("/admin/admin-register")
              
            }
            className="w-full text-sm text-[#64748B]"
          >
            Create Admin Account
          </button>
        </div>
      </div>
    </div>
  );
}