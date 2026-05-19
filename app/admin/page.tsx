"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { AdminPanel } from "./AdminPanel";

export default function Page() {
  const router = useRouter();

  const [authorized, setAuthorized] =
    useState(false);

  useEffect(() => {
    const admin =
      localStorage.getItem(
        "admin-auth",
      );

    if (!admin) {
      router.push(
        "/admin/admin-login",
      );

      return;
    }

    setAuthorized(true);
  }, [router]);

  // LOADING
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-sm font-medium text-[#64748B]">
          Redirecting to login...
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}