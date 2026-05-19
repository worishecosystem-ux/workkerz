"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AdminRegister() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("admin");

  const [loading, setLoading] =
    useState(false);

  const register = async () => {
    try {
      // VALIDATION
      if (
        !name.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        alert(
          "Please fill all fields",
        );

        return;
      }

      setLoading(true);

      // CHECK EXISTING EMAIL
      const {
        data: existing,
        error: existingError,
      } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingError) {
        console.log(
          existingError,
        );

        alert(
          "Something went wrong",
        );

        return;
      }

      // EMAIL EXISTS
      if (existing) {
        alert(
          "Email already exists",
        );

        return;
      }

      // INSERT ADMIN
      const { error } =
        await supabase
          .from("admin_users")
          .insert([
            {
              name,
              email,
              password,
              role,
            },
          ]);

      if (error) {
        console.log(error);

        alert(
          "Registration failed",
        );

        return;
      }

      alert(
        "Admin registered successfully",
      );

      // REDIRECT LOGIN
      router.push(
        "/admin/admin-login",
      );
    } catch (err) {
      console.log(err);

      alert(
        "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-[32px] border border-gray-200 p-8 shadow-xl">
        {/* TITLE */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#0F172A]">
            Admin Register
          </h1>

          <p className="text-sm text-[#64748B] mt-2">
            Create admin account
          </p>
        </div>

        {/* FORM */}
        <div className="mt-8 space-y-4">
          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value,
              )
            }
            className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-[#0F172A]"
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value,
              )
            }
            className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-[#0F172A]"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value,
              )
            }
            className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-[#0F172A]"
          />

          {/* ROLE */}
          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value,
              )
            }
            className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-[#0F172A]"
          >
            <option value="admin">
              Admin
            </option>

            <option value="manager">
              Manager
            </option>

            <option value="super_admin">
              Super Admin
            </option>
          </select>

          {/* BUTTON */}
          <button
            onClick={register}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-[#0F172A] text-white font-bold transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>

          {/* LOGIN */}
          <button
            onClick={() =>
              router.push(
                "/admin/admin-login",
              )
            }
            className="w-full text-sm text-[#64748B] mt-2"
          >
            Already have account? Login
          </button>
        </div>
      </div>
    </div>
  );
}