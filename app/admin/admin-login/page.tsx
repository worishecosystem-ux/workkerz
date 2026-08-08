"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      if (error) {
        alert(error.message);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("SESSION AFTER LOGIN:", session);

      if (!session) {
        alert("Login failed. Session not created.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border p-3"
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </div>
    </div>
  );
}