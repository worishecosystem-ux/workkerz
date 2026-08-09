"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
  Mail,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

type AdminRole =
  | "worker_admin"
  | "order_admin"
  | "shop_admin"
  | "booking_admin"
  | "support_admin"
  | "finance_admin"
  | "verification_admin";

type AccountRole = "super_admin" | "admin";

type Admin = {
  id: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  role: AccountRole;
  admin_roles: AdminRole[];
  is_active: boolean;
  created_at?: string;
};

/* =====================================================
   ROLE LABELS
===================================================== */

const roleLabels: Record<AdminRole, string> = {
  worker_admin: "Worker Admin",
  order_admin: "Order Admin",
  shop_admin: "Shop Admin",
  booking_admin: "Booking Admin",
  support_admin: "Support Admin",
  finance_admin: "Finance Admin",
  verification_admin: "Verification Admin",
};

/* =====================================================
   ROLE COLORS
===================================================== */

const roleColors: Record<AdminRole, string> = {
  worker_admin: "bg-blue-50 text-blue-700 border-blue-100",
  order_admin: "bg-orange-50 text-orange-700 border-orange-100",
  shop_admin: "bg-purple-50 text-purple-700 border-purple-100",
  booking_admin: "bg-cyan-50 text-cyan-700 border-cyan-100",
  support_admin: "bg-emerald-50 text-emerald-700 border-emerald-100",
  finance_admin: "bg-amber-50 text-amber-700 border-amber-100",
  verification_admin: "bg-pink-50 text-pink-700 border-pink-100",
};

/* =====================================================
   SAFE API RESPONSE
===================================================== */

async function readApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  const text = await response.text();

  if (!contentType.includes("application/json")) {
    console.error("API returned non-JSON:", {
      status: response.status,
      contentType,
      response: text,
    });

    throw new Error(
      `API returned ${response.status}. Please check the API route.`,
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON response:", text, error);

    throw new Error("Server returned an invalid response.");
  }
}

/* =====================================================
   COMPONENT
===================================================== */

export default function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<"all" | AdminRole>("all");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "disabled">("all");

  const [selectedAdmin, setSelectedAdmin] =
    useState<Admin | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    admin_roles: ["worker_admin"] as AdminRole[],
  });

  /* =====================================================
     AUTH HEADERS
  ===================================================== */

  const getAuthHeaders = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Admin session expired. Please login again.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  };

  /* =====================================================
     LOAD ADMINS
  ===================================================== */

  const loadAdmins = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch("/api/admin/list", {
        method: "GET",
        headers,
        cache: "no-store",
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to load admins.");
      }

      const normalizedAdmins: Admin[] = (data.admins || []).map(
        (admin: Admin) => {
          let roles: AdminRole[] = [];

          if (Array.isArray(admin.admin_roles)) {
            roles = admin.admin_roles;
          }

          if (roles.length === 0 && typeof window !== "undefined") {
            try {
              const savedRoles = localStorage.getItem(
                `workkerz_admin_departments_${admin.id}`,
              );

              if (savedRoles) {
                const parsed = JSON.parse(savedRoles);

                if (Array.isArray(parsed)) {
                  roles = parsed as AdminRole[];
                }
              }
            } catch (error) {
              console.error(
                "Unable to restore saved departments:",
                error,
              );
            }
          }

          if (roles.length > 0 && typeof window !== "undefined") {
            try {
              localStorage.setItem(
                `workkerz_admin_departments_${admin.id}`,
                JSON.stringify(roles),
              );
            } catch (error) {
              console.error(
                "Unable to save departments:",
                error,
              );
            }
          }

          return {
            ...admin,
            admin_roles: roles,
          };
        },
      );

      setAdmins(normalizedAdmins);
    } catch (error) {
      console.error("Load admins error:", error);

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

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();

    return admins.filter((admin) => {
      const matchesSearch =
        !query ||
        admin.full_name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" ||
        admin.admin_roles.includes(roleFilter);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && admin.is_active) ||
        (statusFilter === "disabled" && !admin.is_active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [admins, search, roleFilter, statusFilter]);

  /* =====================================================
     CREATE ADMIN
  ===================================================== */

  const handleCreateAdmin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.full_name.trim().length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (!form.email.trim().includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.admin_roles.length === 0) {
      setError("Select at least one department.");
      return;
    }

    setSaving(true);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: "admin",
          admin_roles: form.admin_roles,
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create admin.",
        );
      }

      setSuccess("Admin created successfully.");

      setForm({
        full_name: "",
        email: "",
        password: "",
        admin_roles: ["worker_admin"],
      });

      setShowCreate(false);

      await loadAdmins();
    } catch (error) {
      console.error("Create admin error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create admin.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     UPDATE ADMIN
  ===================================================== */

  const updateAdmin = async (
    adminId: string,
    changes: {
      admin_roles?: AdminRole[];
      role?: AccountRole;
      is_active?: boolean;
    },
  ) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `/api/admin/${adminId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(changes),
        },
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update admin.",
        );
      }

      if (
        changes.admin_roles !== undefined &&
        typeof window !== "undefined"
      ) {
        try {
          localStorage.setItem(
            `workkerz_admin_departments_${adminId}`,
            JSON.stringify(changes.admin_roles),
          );
        } catch (error) {
          console.error(
            "Unable to save departments locally:",
            error,
          );
        }
      }

      setAdmins((current) =>
        current.map((admin) =>
          admin.id === adminId
            ? {
                ...admin,
                ...(changes.admin_roles !== undefined
                  ? {
                      admin_roles: changes.admin_roles,
                    }
                  : {}),
                ...(changes.role !== undefined
                  ? {
                      role: changes.role,
                    }
                  : {}),
                ...(changes.is_active !== undefined
                  ? {
                      is_active: changes.is_active,
                    }
                  : {}),
                ...(data.admin || {}),
              }
            : admin,
        ),
      );

      setSelectedAdmin((current) => {
        if (!current || current.id !== adminId) {
          return current;
        }

        return {
          ...current,
          ...(changes.admin_roles !== undefined
            ? {
                admin_roles: changes.admin_roles,
              }
            : {}),
          ...(changes.role !== undefined
            ? {
                role: changes.role,
              }
            : {}),
          ...(changes.is_active !== undefined
            ? {
                is_active: changes.is_active,
              }
            : {}),
        };
      });

      setSuccess(
        data.message || "Admin updated successfully.",
      );
    } catch (error) {
      console.error("Update admin error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update admin.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     TOGGLE DEPARTMENT
  ===================================================== */

  const toggleDepartment = async (role: AdminRole) => {
    if (!selectedAdmin) return;

    const currentRoles =
      selectedAdmin.admin_roles || [];

    const exists = currentRoles.includes(role);

    const nextRoles = exists
      ? currentRoles.filter((item) => item !== role)
      : [...currentRoles, role];

    await updateAdmin(selectedAdmin.id, {
      admin_roles: nextRoles,
    });
  };

  /* =====================================================
     ACCOUNT ROLE
  ===================================================== */

  const handleAccountRoleChange = async (
    role: AccountRole,
  ) => {
    if (!selectedAdmin) return;

    if (
      role === "super_admin" &&
      selectedAdmin.role !== "super_admin"
    ) {
      const confirmed = window.confirm(
        "Give this account Super Admin access? Super Admin can manage other admin accounts.",
      );

      if (!confirmed) return;
    }

    await updateAdmin(selectedAdmin.id, {
      role,
    });
  };

  /* =====================================================
     STATUS
  ===================================================== */

  const handleToggleStatus = async () => {
    if (!selectedAdmin) return;

    const nextStatus = !selectedAdmin.is_active;

    const confirmed = window.confirm(
      nextStatus
        ? "Activate this admin account?"
        : "Deactivate this admin account?",
    );

    if (!confirmed) return;

    await updateAdmin(selectedAdmin.id, {
      is_active: nextStatus,
    });
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    const confirmed = window.confirm(
      `Permanently delete ${selectedAdmin.full_name}'s admin account? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `/api/admin/${selectedAdmin.id}`,
        {
          method: "DELETE",
          headers,
        },
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete admin.",
        );
      }

      setAdmins((current) =>
        current.filter(
          (admin) => admin.id !== selectedAdmin.id,
        ),
      );

      setSelectedAdmin(null);

      setSuccess(
        data.message ||
          "Admin account deleted successfully.",
      );
    } catch (error) {
      console.error("Delete admin error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete admin.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     OPEN ADMIN
  ===================================================== */

  const openAdmin = (admin: Admin) => {
    setError("");
    setSuccess("");
    setShowMore(false);

    setSelectedAdmin({
      ...admin,
      admin_roles: admin.admin_roles || [],
    });
  };

  /* =====================================================
     CLOSE DRAWER
  ===================================================== */

  const closeDrawer = () => {
    if (saving) return;

    setSelectedAdmin(null);
    setShowMore(false);
  };

  /* =====================================================
     COUNTS
  ===================================================== */

  const totalAdmins = admins.length;

  const activeAdmins = admins.filter(
    (admin) => admin.is_active,
  ).length;

  const disabledAdmins = admins.filter(
    (admin) => !admin.is_active,
  ).length;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#F8FAFC]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-white border-b border-gray-100 px-3 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FF5C39]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-[#0F172A] leading-tight">
                Admin Management
              </h1>

              <p className="text-[11px] sm:text-sm text-[#64748B] mt-1 leading-5">
                Manage admin accounts, departments and access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowCreate(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-[#FF5C39] hover:bg-[#e54e2e] text-white text-sm font-bold shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Admin
          </button>

        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="p-3 sm:p-6 lg:p-8">

        {success && (
          <div className="mb-4 sm:mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error &&
          !selectedAdmin &&
          !showCreate && (
            <div className="mb-4 sm:mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">

          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 min-w-0">
            <p className="text-xs font-semibold text-[#64748B]">
              Total Admins
            </p>

            <p className="text-2xl font-black text-[#0F172A] mt-2">
              {totalAdmins}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 min-w-0">
            <p className="text-xs font-semibold text-[#64748B]">
              Active
            </p>

            <p className="text-2xl font-black text-emerald-600 mt-2">
              {activeAdmins}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 min-w-0">
            <p className="text-xs font-semibold text-[#64748B]">
              Disabled
            </p>

            <p className="text-2xl font-black text-red-500 mt-2">
              {disabledAdmins}
            </p>
          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_10rem_auto] gap-2.5 sm:gap-3">

            {/* SEARCH */}

            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search admin..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none focus:border-[#FF5C39]"
              />
            </div>

            {/* ROLE */}

            <div className="relative min-w-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(
                    e.target.value as
                      | "all"
                      | AdminRole,
                  )
                }
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none"
              >
                <option value="all">
                  All Departments
                </option>

                {(
                  Object.entries(roleLabels) as [
                    AdminRole,
                    string,
                  ][]
                ).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "active"
                    | "disabled",
                )
              }
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="disabled">
                Disabled
              </option>
            </select>

            {/* REFRESH */}

            <button
              type="button"
              onClick={loadAdmins}
              disabled={loading}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#475569] flex items-center justify-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>

          </div>
        </div>

        {/* =================================================
            ADMIN ACCOUNTS
        ================================================= */}

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#0F172A]">
              Admin Accounts
            </h2>

            <p className="text-xs text-[#94A3B8] mt-1">
              Click an admin to manage account access.
            </p>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-6 h-6 text-[#FF5C39] animate-spin mx-auto" />

              <p className="text-sm text-[#64748B] mt-3">
                Loading admins...
              </p>
            </div>
          ) : filteredAdmins.length === 0 ? (

            <div className="p-12 text-center">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto" />

              <p className="text-sm font-semibold text-[#64748B] mt-3">
                No admins found.
              </p>
            </div>

          ) : (
            <>
              {/* =================================================
                  MOBILE CARDS
              ================================================= */}

              <div className="md:hidden divide-y divide-gray-100">

                {filteredAdmins.map((admin) => (
                  <button
                    key={admin.id}
                    type="button"
                    onClick={() =>
                      openAdmin(admin)
                    }
                    className="w-full text-left p-4 active:bg-gray-50 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">

                      {/* AVATAR */}

                      <div className="w-10 h-10 shrink-0 rounded-full bg-orange-50 flex items-center justify-center">
                        <UserRound className="w-4 h-4 text-[#FF5C39]" />
                      </div>

                      <div className="min-w-0 flex-1">

                        {/* NAME + STATUS */}

                        <div className="flex items-start justify-between gap-2">

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0F172A] truncate">
                              {admin.full_name}
                            </p>

                            <p className="text-xs text-[#64748B] mt-0.5 truncate">
                              {admin.email}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                              admin.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                admin.is_active
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />

                            {admin.is_active
                              ? "Active"
                              : "Disabled"}
                          </span>

                        </div>

                        {/* DEPARTMENTS */}

                        <div className="mt-3 flex flex-wrap gap-1.5">

                          {admin.admin_roles.length > 0 ? (
                            admin.admin_roles
                              .slice(0, 3)
                              .map((role) => (
                                <span
                                  key={role}
                                  className={`inline-flex max-w-full px-2 py-1 rounded-lg border text-[10px] font-bold truncate ${
                                    roleColors[role]
                                  }`}
                                >
                                  {roleLabels[role]}
                                </span>
                              ))
                          ) : (
                            <span className="text-[11px] text-gray-400">
                              No department
                            </span>
                          )}

                          {admin.admin_roles.length > 3 && (
                            <span className="inline-flex px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500">
                              +{admin.admin_roles.length - 3}
                            </span>
                          )}

                        </div>

                        {/* BOTTOM */}

                        <div className="mt-3 flex items-center justify-between gap-3">

                          <div className="flex items-center gap-2 min-w-0">

                            {admin.role ===
                            "super_admin" ? (
                              <span className="inline-flex px-2 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold">
                                Super Admin
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-[10px] font-bold">
                                Admin
                              </span>
                            )}

                            {admin.created_at && (
                              <span className="text-[10px] text-[#94A3B8] truncate">
                                {new Date(
                                  admin.created_at,
                                ).toLocaleDateString(
                                  "en-IN",
                                )}
                              </span>
                            )}

                          </div>

                          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF5C39]">
                            Manage
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>

                        </div>

                      </div>
                    </div>
                  </button>
                ))}

              </div>

              {/* =================================================
                  TABLET + DESKTOP
              ================================================= */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full min-w-[820px]">

                  <thead>
                    <tr className="bg-[#F8FAFC] text-left">

                      <th className="px-4 lg:px-6 py-3 text-xs font-bold text-[#64748B]">
                        Admin
                      </th>

                      <th className="px-4 lg:px-6 py-3 text-xs font-bold text-[#64748B]">
                        Departments
                      </th>

                      <th className="px-4 lg:px-6 py-3 text-xs font-bold text-[#64748B]">
                        Account
                      </th>

                      <th className="px-4 lg:px-6 py-3 text-xs font-bold text-[#64748B]">
                        Status
                      </th>

                      <th className="px-4 lg:px-6 py-3 text-xs font-bold text-[#64748B]">
                        Created
                      </th>

                      <th className="px-4 lg:px-6 py-3 text-xs font-bold text-[#64748B]">
                        Manage
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {filteredAdmins.map((admin) => (
                      <tr
                        key={admin.id}
                        onClick={() =>
                          openAdmin(admin)
                        }
                        className="cursor-pointer hover:bg-[#FAFAFA] transition group"
                      >

                        {/* ADMIN */}

                        <td className="px-4 lg:px-6 py-4">

                          <div className="flex items-center gap-3 min-w-[190px]">

                            <div className="w-10 h-10 shrink-0 rounded-full bg-orange-50 flex items-center justify-center">
                              <UserRound className="w-4 h-4 text-[#FF5C39]" />
                            </div>

                            <div className="min-w-0">

                              <p className="text-sm font-bold text-[#0F172A] truncate">
                                {admin.full_name}
                              </p>

                              <p className="text-xs text-[#64748B] mt-0.5 truncate">
                                {admin.email}
                              </p>

                            </div>
                          </div>

                        </td>

                        {/* DEPARTMENTS */}

                        <td className="px-4 lg:px-6 py-4">

                          {admin.admin_roles.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-[320px]">

                              {admin.admin_roles.map(
                                (role) => (
                                  <span
                                    key={role}
                                    className={`inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                                      roleColors[role]
                                    }`}
                                  >
                                    {roleLabels[role]}
                                  </span>
                                ),
                              )}

                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No department
                            </span>
                          )}

                        </td>

                        {/* ACCOUNT */}

                        <td className="px-4 lg:px-6 py-4">

                          {admin.role ===
                          "super_admin" ? (
                            <span className="inline-flex px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold">
                              Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold">
                              Admin
                            </span>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-4 lg:px-6 py-4">

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

                        <td className="px-4 lg:px-6 py-4 text-sm text-[#64748B] whitespace-nowrap">

                          {admin.created_at
                            ? new Date(
                                admin.created_at,
                              ).toLocaleDateString(
                                "en-IN",
                              )
                            : "—"}

                        </td>

                        {/* MANAGE */}

                        <td className="px-4 lg:px-6 py-4">

                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5C39]">
                            Manage
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                          </div>

                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </main>

      {/* =================================================
          ADMIN DRAWER
      ================================================= */}

      {selectedAdmin && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDrawer();
            }
          }}
        >

          <div className="absolute right-0 top-0 h-dvh w-full sm:max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">

            {/* DRAWER HEADER */}

            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 shrink-0">

              <div className="min-w-0">

                <p className="text-xs font-bold text-[#FF5C39] uppercase tracking-wide">
                  Admin Management
                </p>

                <h2 className="text-xl font-black text-[#0F172A] mt-1 truncate">
                  {selectedAdmin.full_name}
                </h2>

              </div>

              <div className="flex items-center gap-2 shrink-0">

                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setShowMore(
                        (value) => !value,
                      )
                    }
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <MoreVertical className="w-4 h-4 text-[#64748B]" />
                  </button>

                  {showMore && (
                    <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-xl p-1">

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setShowMore(false);
                          handleDeleteAdmin();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>

                    </div>
                  )}

                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>

              </div>
            </div>

            {/* DRAWER BODY */}

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">

              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* PROFILE */}

              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 min-w-0">

                <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-[#FF5C39]" />
                </div>

                <div className="min-w-0">

                  <h3 className="text-base sm:text-lg font-black text-[#0F172A] truncate">
                    {selectedAdmin.full_name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-[#64748B] min-w-0">

                    <Mail className="w-3.5 h-3.5 shrink-0" />

                    <span className="truncate">
                      {selectedAdmin.email}
                    </span>

                  </div>

                </div>

              </div>

              {/* STATUS */}

              <div className="rounded-2xl border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-5">

                <div className="flex items-center justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-sm font-bold text-[#0F172A]">
                      Account Status
                    </p>

                    <p className="text-xs text-[#64748B] mt-1">
                      Control whether this admin can access the panel.
                    </p>

                  </div>

                  <span
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                      selectedAdmin.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {selectedAdmin.is_active
                      ? "Active"
                      : "Disabled"}
                  </span>

                </div>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={saving}
                  className={`mt-4 w-full h-11 rounded-xl text-sm font-bold ${
                    selectedAdmin.is_active
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  } disabled:opacity-50`}
                >
                  {selectedAdmin.is_active
                    ? "Deactivate Account"
                    : "Activate Account"}
                </button>

              </div>

              {/* DEPARTMENTS */}

              <div className="rounded-2xl border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-5">

                <div className="mb-4">

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-sm font-bold text-[#0F172A]">
                        Department Access
                      </p>

                      <p className="text-xs text-[#64748B] mt-1">
                        Assign multiple departments to this admin.
                      </p>

                    </div>

                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5C39] text-xs font-bold">
                      {selectedAdmin.admin_roles.length} assigned
                    </span>

                  </div>

                </div>

                {selectedAdmin.role ===
                "super_admin" ? (

                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">

                    <div className="flex items-start gap-3">

                      <ShieldCheck className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />

                      <div>

                        <p className="text-sm font-bold text-purple-800">
                          Super Admin
                        </p>

                        <p className="text-xs text-purple-700 mt-1">
                          Super Admin already has access to all admin management areas. Department assignments are not required.
                        </p>

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                    {(
                      Object.entries(
                        roleLabels,
                      ) as [
                        AdminRole,
                        string,
                      ][]
                    ).map(
                      ([role, label]) => {
                        const checked =
                          selectedAdmin.admin_roles.includes(
                            role,
                          );

                        return (
                          <label
                            key={role}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                              checked
                                ? "border-[#FF5C39] bg-orange-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >

                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={saving}
                              onChange={() =>
                                toggleDepartment(
                                  role,
                                )
                              }
                              className="w-4 h-4 accent-[#FF5C39]"
                            />

                            <div className="min-w-0">

                              <p className="text-sm font-bold text-[#0F172A] truncate">
                                {label}
                              </p>

                              <p className="text-[11px] text-[#94A3B8]">
                                {checked
                                  ? "Assigned"
                                  : "Not assigned"}
                              </p>

                            </div>

                          </label>
                        );
                      },
                    )}

                  </div>
                )}

              </div>

              {/* ACCOUNT ROLE */}

              <div className="rounded-2xl border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-5">

                <div className="mb-4">

                  <p className="text-sm font-bold text-[#0F172A]">
                    Account Access
                  </p>

                  <p className="text-xs text-[#64748B] mt-1">
                    Super Admin can manage other admin accounts.
                  </p>

                </div>

                <select
                  value={selectedAdmin.role}
                  onChange={(e) =>
                    handleAccountRoleChange(
                      e.target.value as AccountRole,
                    )
                  }
                  disabled={saving}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm font-semibold outline-none focus:border-[#FF5C39] disabled:opacity-60"
                >
                  <option value="admin">
                    Admin
                  </option>

                  <option value="super_admin">
                    Super Admin
                  </option>
                </select>

              </div>

              {/* DETAILS */}

              <div className="rounded-2xl border border-gray-100 overflow-hidden">

                <div className="px-4 sm:px-5 py-4 border-b border-gray-100">

                  <p className="text-sm font-bold text-[#0F172A]">
                    Account Details
                  </p>

                </div>

                <div className="divide-y divide-gray-100">

                  {/* ROLE */}

                  <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3 min-w-0">

                      <UserRound className="w-4 h-4 text-[#94A3B8] shrink-0" />

                      <span className="text-sm text-[#64748B]">
                        Account Role
                      </span>

                    </div>

                    <span className="text-sm font-bold text-[#0F172A] text-right">
                      {selectedAdmin.role ===
                      "super_admin"
                        ? "Super Admin"
                        : "Admin"}
                    </span>

                  </div>

                  {/* DEPARTMENTS */}

                  <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                    <div className="flex items-center gap-3 shrink-0">

                      <ShieldCheck className="w-4 h-4 text-[#94A3B8]" />

                      <span className="text-sm text-[#64748B]">
                        Departments
                      </span>

                    </div>

                    <div className="flex flex-wrap sm:justify-end gap-1.5 max-w-full sm:max-w-[280px]">

                      {selectedAdmin.admin_roles.length >
                      0 ? (
                        selectedAdmin.admin_roles.map(
                          (role) => (
                            <span
                              key={role}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                                roleColors[role]
                              }`}
                            >
                              {roleLabels[role]}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="text-sm font-bold text-gray-400">
                          No department
                        </span>
                      )}

                    </div>

                  </div>

                  {/* CREATED */}

                  <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <CalendarDays className="w-4 h-4 text-[#94A3B8]" />

                      <span className="text-sm text-[#64748B]">
                        Created
                      </span>

                    </div>

                    <span className="text-sm font-bold text-[#0F172A]">
                      {selectedAdmin.created_at
                        ? new Date(
                            selectedAdmin.created_at,
                          ).toLocaleDateString(
                            "en-IN",
                          )
                        : "—"}
                    </span>

                  </div>

                </div>
              </div>

              {/* DANGER */}

              <div className="mt-5 sm:mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 sm:p-5">

                <div className="flex items-start gap-3">

                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />

                  <div>

                    <p className="text-sm font-bold text-red-700">
                      Danger Zone
                    </p>

                    <p className="text-xs text-red-600 mt-1">
                      Permanently remove this admin account and its department assignments.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleDeleteAdmin}
                  disabled={saving}
                  className="mt-4 w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Admin Account
                </button>

              </div>

            </div>

            {/* FOOTER */}

            <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0 bg-white">

              <button
                type="button"
                onClick={closeDrawer}
                className="w-full h-11 rounded-xl border border-gray-200 text-sm font-bold text-[#64748B] hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =================================================
          CREATE ADMIN MODAL
      ================================================= */}

      {showCreate && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[1px] p-0 sm:px-4">

          <div className="w-full max-w-lg max-h-[94dvh] sm:max-h-[90dvh] overflow-y-auto overscroll-contain bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">

              <div className="min-w-0">

                <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                  Create Admin
                </h2>

                <p className="text-xs text-[#64748B] mt-1">
                  Create an admin with multiple department permissions.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-[#64748B]" />
              </button>

            </div>

            <form
              onSubmit={handleCreateAdmin}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5 pb-[calc(1rem+env(safe-area-inset-bottom))]"
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
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      full_name:
                        e.target.value,
                    }))
                  }
                  placeholder="Enter admin name"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none focus:border-[#FF5C39]"
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
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      email: e.target.value,
                    }))
                  }
                  placeholder="admin@workkerz.com"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none focus:border-[#FF5C39]"
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
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        password:
                          e.target.value,
                      }))
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                    className="w-full h-11 pl-4 pr-11 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm outline-none focus:border-[#FF5C39]"
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

              {/* DEPARTMENTS */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-sm font-semibold text-[#0F172A]">
                    Department Access
                  </label>

                  <span className="text-xs font-bold text-[#FF5C39]">
                    {form.admin_roles.length} selected
                  </span>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                  {(
                    Object.entries(
                      roleLabels,
                    ) as [
                      AdminRole,
                      string,
                    ][]
                  ).map(
                    ([role, label]) => {
                      const checked =
                        form.admin_roles.includes(
                          role,
                        );

                      return (
                        <label
                          key={role}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            checked
                              ? "border-[#FF5C39] bg-orange-50"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >

                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setForm(
                                (current) => ({
                                  ...current,

                                  admin_roles:
                                    checked
                                      ? current.admin_roles.filter(
                                          (
                                            item,
                                          ) =>
                                            item !==
                                            role,
                                        )
                                      : [
                                          ...current.admin_roles,
                                          role,
                                        ],
                                }),
                              );
                            }}
                            className="w-4 h-4 accent-[#FF5C39]"
                          />

                          <div className="min-w-0">

                            <p className="text-sm font-bold text-[#0F172A]">
                              {label}
                            </p>

                            <p className="text-[11px] text-[#94A3B8]">
                              {checked
                                ? "Selected"
                                : "Not selected"}
                            </p>

                          </div>

                        </label>
                      );
                    },
                  )}

                </div>

              </div>

              {/* BUTTONS */}

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  disabled={saving}
                  className="w-full h-11 rounded-xl border border-gray-200 text-sm font-bold text-[#64748B] hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-11 rounded-xl bg-[#FF5C39] hover:bg-[#e54e2e] disabled:opacity-60 text-white text-sm font-bold"
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