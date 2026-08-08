"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

type AdminRole =
  | "worker_admin"
  | "order_admin"
  | "shop_admin"
  | "booking_admin";

type Admin = {
  id: string;
  full_name: string;
  email: string;
  role: "super_admin" | "admin";
  is_active: boolean;
  created_at?: string;
};

const roleLabels: Record<AdminRole, string> = {
  worker_admin: "Worker Admin",
  order_admin: "Order Admin",
  shop_admin: "Shop Admin",
  booking_admin: "Booking Admin",
};

export default function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "worker_admin" as AdminRole,
  });

  // =====================================================
  // LOAD ADMINS
  // =====================================================

  const loadAdmins = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/list",
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load admins.",
        );
      }

      setAdmins(data.admins || []);
    } catch (error) {
      console.error(
        "Load admins error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load admins.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // =====================================================
  // CREATE ADMIN
  // =====================================================

  const handleCreateAdmin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: form.full_name,
            email: form.email,
            password: form.password,
            role: form.role,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create admin.",
        );
      }

      setSuccess(
        "Admin created successfully.",
      );

      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "worker_admin",
      });

      setShowCreate(false);

      await loadAdmins();
    } catch (error) {
      console.error(
        "Create admin error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create admin.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen">

      {/* HEADER */}

      <header className="bg-white border-b border-gray-100 px-8 py-6">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#FF5C39]" />
              </div>

              <div>

                <h1 className="text-2xl font-black text-[#0F172A]">
                  Admin Management
                </h1>

                <p className="text-sm text-[#64748B] mt-1">
                  Manage Workkerz admin accounts
                  and roles.
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-[#FF5C39] hover:bg-[#e54e2e] text-white text-sm font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Create Admin
          </button>

        </div>

      </header>

      {/* CONTENT */}

      <div className="p-8">

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && !showCreate && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-100">

            <h2 className="font-bold text-[#0F172A]">
              Admins
            </h2>

          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-[#64748B]">
              Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <div className="p-10 text-center">

              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto" />

              <p className="text-sm font-semibold text-[#64748B] mt-3">
                No admin accounts found.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-[#F8FAFC] text-left">

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Admin
                    </th>

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Role
                    </th>

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Status
                    </th>

                    <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                      Created
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {admins.map((admin) => (
                    <tr key={admin.id}>

                      {/* ADMIN */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">

                            <ShieldCheck className="w-4 h-4 text-[#FF5C39]" />

                          </div>

                          <div>

                            <p className="text-sm font-bold text-[#0F172A]">
                              {admin.full_name}
                            </p>

                            <p className="text-xs text-[#64748B] mt-0.5">
                              {admin.email}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-4">

                        {admin.role ===
                        "super_admin" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            Admin
                          </span>
                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        {admin.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <UserCheck className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500">
                            <UserX className="w-3.5 h-3.5" />
                            Disabled
                          </span>
                        )}

                      </td>

                      {/* CREATED */}

                      <td className="px-6 py-4 text-sm text-[#64748B]">

                        {admin.created_at
                          ? new Date(
                              admin.created_at,
                            ).toLocaleDateString()
                          : "—"}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* CREATE ADMIN MODAL */}
      {/* ================================================= */}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

              <div>

                <h2 className="text-lg font-black text-[#0F172A]">
                  Create Admin
                </h2>

                <p className="text-xs text-[#64748B] mt-1">
                  Create a new role-based admin.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-[#64748B]" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateAdmin}
              className="p-6 space-y-5"
            >

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* NAME */}

              <div>

                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      full_name:
                        event.target.value,
                    }))
                  }
                  placeholder="Enter admin name"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email:
                        event.target.value,
                    }))
                  }
                  placeholder="admin@example.com"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password:
                          event.target.value,
                      }))
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                    className="w-full h-11 pl-4 pr-11 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#64748B]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#64748B]" />
                    )}
                  </button>

                </div>

              </div>

              {/* ROLE */}

              <div>

                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Admin Role
                </label>

                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target
                        .value as AdminRole,
                    }))
                  }
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100"
                >

                  {Object.entries(
                    roleLabels,
                  ).map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ),
                  )}

                </select>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-bold text-[#64748B] hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl bg-[#FF5C39] hover:bg-[#e54e2e] disabled:opacity-60 text-white text-sm font-bold"
                >
                  {saving
                    ? "Creating..."
                    : "Create Admin"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}