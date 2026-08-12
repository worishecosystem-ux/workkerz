"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentAdmin } from "@/lib/admin-auth";
import AdminPanel from "./AdminPanel";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      const admin = await getCurrentAdmin();

      if (!mounted) return;

      if (!admin) {
        router.replace("/admin/admin-login");
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF5C39] border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-sm text-[#64748B] mt-3">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  // Unauthorized
  if (!authorized) {
    return null;
  }

  // Authorized
  return <AdminPanel />;
}
