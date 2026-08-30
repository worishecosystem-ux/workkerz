"use client";

import {
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
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

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

type AdminRole =
  | "worker_admin"
  | "worker_request_admin"
  | "order_admin"
  | "shop_admin"
  | "booking_admin"
  | "support_admin"
  | "finance_admin"
  | "verification_admin";

type AccountRole =
  | "super_admin"
  | "admin";

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

const roleLabels: Record<
  AdminRole,
  string
> = {
  worker_admin: "Worker Admin",
  worker_request_admin:
    "Worker Request Admin",
  order_admin: "Order Admin",
  shop_admin: "Shop Admin",
  booking_admin: "Booking Admin",
  support_admin: "Support Admin",
  finance_admin: "Finance Admin",
  verification_admin:
    "Verification Admin",
};

/* =====================================================
   ROLE COLORS
===================================================== */

const roleColors: Record<
  AdminRole,
  string
> = {
  worker_admin:
    "bg-blue-50 text-blue-700 border-blue-100",

  worker_request_admin:
    "bg-indigo-50 text-indigo-700 border-indigo-100",

  order_admin:
    "bg-orange-50 text-orange-700 border-orange-100",

  shop_admin:
    "bg-purple-50 text-purple-700 border-purple-100",

  booking_admin:
    "bg-cyan-50 text-cyan-700 border-cyan-100",

  support_admin:
    "bg-emerald-50 text-emerald-700 border-emerald-100",

  finance_admin:
    "bg-amber-50 text-amber-700 border-amber-100",

  verification_admin:
    "bg-pink-50 text-pink-700 border-pink-100",
};

/* =====================================================
   SAFE API RESPONSE
===================================================== */

async function readApiResponse(
  response: Response,
) {
  const contentType =
    response.headers.get(
      "content-type",
    ) || "";

  const text =
    await response.text();

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    console.error(
      "API returned non-JSON:",
      {
        status: response.status,
        contentType,
        response: text,
      },
    );

    throw new Error(
      `API returned ${response.status}. Please check the API route.`,
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "Invalid JSON response:",
      text,
      error,
    );

    throw new Error(
      "Server returned an invalid response.",
    );
  }
}

/* =====================================================
   COMPONENT
===================================================== */

export default function AdminsTab() {
  const [admins, setAdmins] =
    useState<Admin[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState<
      "all" | AdminRole
    >("all");

  const [statusFilter, setStatusFilter] =
    useState<
      "all" | "active" | "disabled"
    >("all");

  const [
    selectedAdmin,
    setSelectedAdmin,
  ] = useState<Admin | null>(null);

  const [showCreate, setShowCreate] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showMore, setShowMore] =
    useState(false);

  /* =====================================================
     TRASH PIN STATE
  ===================================================== */

  const [
    showTrashPin,
    setShowTrashPin,
  ] = useState(false);

  const [trashPin, setTrashPin] =
    useState("");

  const [
    confirmTrashPin,
    setConfirmTrashPin,
  ] = useState("");

  const [
    showTrashPinValue,
    setShowTrashPinValue,
  ] = useState(false);

  const [
    savingTrashPin,
    setSavingTrashPin,
  ] = useState(false);

  const [
    trashPinError,
    setTrashPinError,
  ] = useState("");

  const [
    trashPinSuccess,
    setTrashPinSuccess,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =====================================================
     FORM
  ===================================================== */

  const [form, setForm] =
    useState({
      full_name: "",
      email: "",
      password: "",
      admin_roles: [
        "worker_admin",
      ] as AdminRole[],
    });

  /* =====================================================
     AUTH HEADERS
  ===================================================== */

  const getAuthHeaders = async () => {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    if (
      !session?.access_token
    ) {
      throw new Error(
        "Admin session expired. Please login again.",
      );
    }

    return {
      "Content-Type":
        "application/json",

      Authorization:
        `Bearer ${session.access_token}`,
    };
  };

  /* =====================================================
     LOAD ADMINS
  ===================================================== */

  const loadAdmins = async () => {
    setLoading(true);
    setError("");

    try {
      const headers =
        await getAuthHeaders();

      const response =
        await fetch(
          "/api/admin/list",
          {
            method: "GET",
            headers,
            cache: "no-store",
          },
        );

      const data =
        await readApiResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load admins.",
        );
      }

      const normalizedAdmins: Admin[] =
        (data.admins || []).map(
          (admin: Admin) => {
            let roles: AdminRole[] =
              [];

            if (
              Array.isArray(
                admin.admin_roles,
              )
            ) {
              roles =
                admin.admin_roles;
            }

            if (
              roles.length === 0 &&
              typeof window !==
                "undefined"
            ) {
              try {
                const savedRoles =
                  localStorage.getItem(
                    `workkerz_admin_departments_${admin.id}`,
                  );

                if (savedRoles) {
                  const parsed =
                    JSON.parse(
                      savedRoles,
                    );

                  if (
                    Array.isArray(
                      parsed,
                    )
                  ) {
                    roles =
                      parsed as AdminRole[];
                  }
                }
              } catch (error) {
                console.error(
                  "Unable to restore saved departments:",
                  error,
                );
              }
            }

            if (
              roles.length > 0 &&
              typeof window !==
                "undefined"
            ) {
              try {
                localStorage.setItem(
                  `workkerz_admin_departments_${admin.id}`,
                  JSON.stringify(
                    roles,
                  ),
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
              admin_roles:
                roles,
            };
          },
        );

      setAdmins(
        normalizedAdmins,
      );
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

  /* =====================================================
     SET / UPDATE TRASH PIN
  ===================================================== */

  const handleSetTrashPin =
    async () => {
      setTrashPinError("");
      setTrashPinSuccess("");

      if (
        !/^\d{4,6}$/.test(
          trashPin,
        )
      ) {
        setTrashPinError(
          "Trash PIN must be 4–6 digits.",
        );
        return;
      }

      if (
        trashPin !==
        confirmTrashPin
      ) {
        setTrashPinError(
          "PIN and confirm PIN do not match.",
        );
        return;
      }

      setSavingTrashPin(true);

      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            "/api/admin/trash-pin/set",
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                pin: trashPin,
              }),
            },
          );

        const data =
          await readApiResponse(
            response,
          );

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to set Trash PIN.",
          );
        }

        setTrashPin("");
        setConfirmTrashPin("");

        setTrashPinSuccess(
          data.message ||
            "Trash PIN set successfully.",
        );
      } catch (error) {
        console.error(
          "Set Trash PIN error:",
          error,
        );

        setTrashPinError(
          error instanceof Error
            ? error.message
            : "Unable to set Trash PIN.",
        );
      } finally {
        setSavingTrashPin(false);
      }
    };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredAdmins =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return admins.filter(
        (admin) => {
          const matchesSearch =
            !query ||
            admin.full_name
              .toLowerCase()
              .includes(query) ||
            admin.email
              .toLowerCase()
              .includes(query);

          const matchesRole =
            roleFilter === "all" ||
            admin.admin_roles.includes(
              roleFilter,
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            (statusFilter ===
              "active" &&
              admin.is_active) ||
            (statusFilter ===
              "disabled" &&
              !admin.is_active);

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        },
      );
    }, [
      admins,
      search,
      roleFilter,
      statusFilter,
    ]);

  /* =====================================================
     CREATE ADMIN
  ===================================================== */

  const handleCreateAdmin =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        form.full_name.trim()
          .length < 2
      ) {
        setError(
          "Please enter a valid name.",
        );
        return;
      }

      if (
        !form.email
          .trim()
          .includes("@")
      ) {
        setError(
          "Please enter a valid email.",
        );
        return;
      }

      if (
        form.password.length < 8
      ) {
        setError(
          "Password must be at least 8 characters.",
        );
        return;
      }

      if (
        form.admin_roles.length ===
        0
      ) {
        setError(
          "Select at least one department.",
        );
        return;
      }

      setSaving(true);

      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            "/api/admin/create",
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                full_name:
                  form.full_name.trim(),

                email:
                  form.email
                    .trim()
                    .toLowerCase(),

                password:
                  form.password,

                role: "admin",

                admin_roles:
                  form.admin_roles,
              }),
            },
          );

        const data =
          await readApiResponse(
            response,
          );

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
          admin_roles: [
            "worker_admin",
          ],
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

  /* =====================================================
     UPDATE ADMIN
  ===================================================== */

  const updateAdmin =
    async (
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
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            `/api/admin/${adminId}`,
            {
              method: "PATCH",
              headers,
              body: JSON.stringify(
                changes,
              ),
            },
          );

        const data =
          await readApiResponse(
            response,
          );

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to update admin.",
          );
        }

        if (
          changes.admin_roles !==
            undefined &&
          typeof window !==
            "undefined"
        ) {
          try {
            localStorage.setItem(
              `workkerz_admin_departments_${adminId}`,
              JSON.stringify(
                changes.admin_roles,
              ),
            );
          } catch (error) {
            console.error(
              "Unable to save departments locally:",
              error,
            );
          }
        }

        setAdmins(
          (current) =>
            current.map(
              (admin) =>
                admin.id ===
                adminId
                  ? {
                      ...admin,

                      ...(changes.admin_roles !==
                      undefined
                        ? {
                            admin_roles:
                              changes.admin_roles,
                          }
                        : {}),

                      ...(changes.role !==
                      undefined
                        ? {
                            role:
                              changes.role,
                          }
                        : {}),

                      ...(changes.is_active !==
                      undefined
                        ? {
                            is_active:
                              changes.is_active,
                          }
                        : {}),

                      ...(data.admin ||
                        {}),
                    }
                  : admin,
            ),
        );

        setSelectedAdmin(
          (current) => {
            if (
              !current ||
              current.id !==
                adminId
            ) {
              return current;
            }

            return {
              ...current,

              ...(changes.admin_roles !==
              undefined
                ? {
                    admin_roles:
                      changes.admin_roles,
                  }
                : {}),

              ...(changes.role !==
              undefined
                ? {
                    role:
                      changes.role,
                  }
                : {}),

              ...(changes.is_active !==
              undefined
                ? {
                    is_active:
                      changes.is_active,
                  }
                : {}),
            };
          },
        );

        setSuccess(
          data.message ||
            "Admin updated successfully.",
        );
      } catch (error) {
        console.error(
          "Update admin error:",
          error,
        );

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

  const toggleDepartment =
    async (
      role: AdminRole,
    ) => {
      if (!selectedAdmin)
        return;

      const currentRoles =
        selectedAdmin.admin_roles ||
        [];

      const exists =
        currentRoles.includes(
          role,
        );

      const nextRoles = exists
        ? currentRoles.filter(
            (item) =>
              item !== role,
          )
        : [
            ...currentRoles,
            role,
          ];

      await updateAdmin(
        selectedAdmin.id,
        {
          admin_roles:
            nextRoles,
        },
      );
    };

  /* =====================================================
     ACCOUNT ROLE
  ===================================================== */

  const handleAccountRoleChange =
    async (
      role: AccountRole,
    ) => {
      if (!selectedAdmin)
        return;

      if (
        role === "super_admin" &&
        selectedAdmin.role !==
          "super_admin"
      ) {
        const confirmed =
          window.confirm(
            "Give this account Super Admin access? Super Admin can manage other admin accounts.",
          );

        if (!confirmed) return;
      }

      await updateAdmin(
        selectedAdmin.id,
        {
          role,
        },
      );
    };

  /* =====================================================
     STATUS
  ===================================================== */

  const handleToggleStatus =
    async () => {
      if (!selectedAdmin)
        return;

      const nextStatus =
        !selectedAdmin.is_active;

      const confirmed =
        window.confirm(
          nextStatus
            ? "Activate this admin account?"
            : "Deactivate this admin account?",
        );

      if (!confirmed) return;

      await updateAdmin(
        selectedAdmin.id,
        {
          is_active:
            nextStatus,
        },
      );
    };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDeleteAdmin =
    async () => {
      if (!selectedAdmin)
        return;

      const confirmed =
        window.confirm(
          `Permanently delete ${selectedAdmin.full_name}'s admin account? This action cannot be undone.`,
        );

      if (!confirmed) return;

      setSaving(true);
      setError("");
      setSuccess("");

      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            `/api/admin/${selectedAdmin.id}`,
            {
              method: "DELETE",
              headers,
            },
          );

        const data =
          await readApiResponse(
            response,
          );

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to delete admin.",
          );
        }

        setAdmins(
          (current) =>
            current.filter(
              (admin) =>
                admin.id !==
                selectedAdmin.id,
            ),
        );

        setSelectedAdmin(null);

        setSuccess(
          data.message ||
            "Admin account deleted successfully.",
        );
      } catch (error) {
        console.error(
          "Delete admin error:",
          error,
        );

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

  const openAdmin = (
    admin: Admin,
  ) => {
    setError("");
    setSuccess("");
    setShowMore(false);

    setSelectedAdmin({
      ...admin,
      admin_roles:
        admin.admin_roles || [],
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

  const totalAdmins =
    admins.length;

  const activeAdmins =
    admins.filter(
      (admin) =>
        admin.is_active,
    ).length;

  const disabledAdmins =
    admins.filter(
      (admin) =>
        !admin.is_active,
    ).length;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#F8FAFC]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-gray-100 bg-white px-3 py-4 sm:px-6 sm:py-5 lg:px-8">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 sm:h-11 sm:w-11">
              <ShieldCheck className="h-5 w-5 text-[#FF5C39]" />
            </div>

            <div className="min-w-0">

              <h1 className="text-lg font-black leading-tight text-[#0F172A] sm:text-2xl">
                Admin Management
              </h1>

              <p className="mt-1 text-[11px] leading-5 text-[#64748B] sm:text-sm">
                Manage admin accounts,
                departments and access.
              </p>

            </div>

          </div>

          {/* HEADER ACTIONS */}

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

            {/* TRASH PIN */}

            <button
              type="button"
              onClick={() => {
                setTrashPin("");
                setConfirmTrashPin("");
                setTrashPinError("");
                setTrashPinSuccess("");
                setShowTrashPin(true);
              }}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 transition hover:bg-red-100 sm:h-11 sm:w-auto sm:px-5"
            >
              <ShieldCheck className="h-4 w-4" />
              Trash PIN
            </button>

            {/* CREATE ADMIN */}

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreate(true);
              }}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF5C39] px-4 text-sm font-bold text-white hover:bg-[#e54e2e] sm:h-11 sm:w-auto sm:px-5"
            >
              <Plus className="h-4 w-4" />
              Create Admin
            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="p-3 sm:p-6 lg:p-8">

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:mb-5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error &&
          !selectedAdmin &&
          !showCreate && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mb-5">
              {error}
            </div>
          )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-5 grid grid-cols-3 gap-3 sm:mb-6 sm:gap-4">

          <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <p className="text-xs font-semibold text-[#64748B]">
              Total Admins
            </p>

            <p className="mt-2 text-2xl font-black text-[#0F172A]">
              {totalAdmins}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <p className="text-xs font-semibold text-[#64748B]">
              Active
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-600">
              {activeAdmins}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <p className="text-xs font-semibold text-[#64748B]">
              Disabled
            </p>

            <p className="mt-2 text-2xl font-black text-red-500">
              {disabledAdmins}
            </p>
          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-3 sm:mb-5 sm:p-4">

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_13rem_10rem_auto]">

            {/* SEARCH */}

            <div className="relative min-w-0">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Search admin..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-4 text-sm outline-none focus:border-[#FF5C39]"
              />

            </div>

            {/* ROLE */}

            <div className="relative min-w-0">

              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(
                    e.target.value as
                      | "all"
                      | AdminRole,
                  )
                }
                className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-4 text-sm outline-none"
              >
                <option value="all">
                  All Departments
                </option>

                {(
                  Object.entries(
                    roleLabels,
                  ) as [
                    AdminRole,
                    string,
                  ][]
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
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
              className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 text-sm outline-none"
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
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-[#475569]"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

          </div>

        </div>

        {/* =================================================
            ADMIN ACCOUNTS
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">

          <div className="border-b border-gray-100 px-4 py-4 sm:px-6">

            <h2 className="font-bold text-[#0F172A]">
              Admin Accounts
            </h2>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Click an admin to manage
              account access.
            </p>

          </div>

          {loading ? (
            <div className="p-12 text-center">

              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#FF5C39]" />

              <p className="mt-3 text-sm text-[#64748B]">
                Loading admins...
              </p>

            </div>
          ) : filteredAdmins.length ===
            0 ? (
            <div className="p-12 text-center">

              <ShieldCheck className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 text-sm font-semibold text-[#64748B]">
                No admins found.
              </p>

            </div>
          ) : (
            <>
              {/* MOBILE */}

              <div className="divide-y divide-gray-100 md:hidden">

                {filteredAdmins.map(
                  (admin) => (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() =>
                        openAdmin(
                          admin,
                        )
                      }
                      className="w-full p-4 text-left transition hover:bg-gray-50 active:bg-gray-50"
                    >

                      <div className="flex min-w-0 items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                          <UserRound className="h-4 w-4 text-[#FF5C39]" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold text-[#0F172A]">
                                {
                                  admin.full_name
                                }
                              </p>

                              <p className="mt-0.5 truncate text-xs text-[#64748B]">
                                {
                                  admin.email
                                }
                              </p>

                            </div>

                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                                admin.is_active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
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

                          <div className="mt-3 flex flex-wrap gap-1.5">

                            {admin.admin_roles.length >
                            0 ? (
                              admin.admin_roles
                                .slice(
                                  0,
                                  3,
                                )
                                .map(
                                  (
                                    role,
                                  ) => (
                                    <span
                                      key={
                                        role
                                      }
                                      className={`inline-flex max-w-full truncate rounded-lg border px-2 py-1 text-[10px] font-bold ${roleColors[role]}`}
                                    >
                                      {
                                        roleLabels[
                                          role
                                        ]
                                      }
                                    </span>
                                  ),
                                )
                            ) : (
                              <span className="text-[11px] text-gray-400">
                                No department
                              </span>
                            )}

                            {admin.admin_roles.length >
                              3 && (
                              <span className="inline-flex rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-500">
                                +
                                {admin.admin_roles.length -
                                  3}
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    </button>
                  ),
                )}

              </div>

              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[850px]">

                  <thead>

                    <tr className="border-b border-gray-100 bg-[#F8FAFC] text-left">

                      <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                        Admin
                      </th>

                      <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                        Departments
                      </th>

                      <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                        Account
                      </th>

                      <th className="px-6 py-3 text-xs font-bold text-[#64748B]">
                        Status
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-bold text-[#64748B]">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {filteredAdmins.map(
                      (admin) => (
                        <tr
                          key={
                            admin.id
                          }
                          className="transition hover:bg-gray-50"
                        >

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                                <UserRound className="h-4 w-4 text-[#FF5C39]" />
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-[#0F172A]">
                                  {
                                    admin.full_name
                                  }
                                </p>

                                <p className="mt-0.5 truncate text-xs text-[#64748B]">
                                  {
                                    admin.email
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex max-w-[350px] flex-wrap gap-1.5">

                              {admin.admin_roles.length >
                              0 ? (
                                admin.admin_roles.map(
                                  (
                                    role,
                                  ) => (
                                    <span
                                      key={
                                        role
                                      }
                                      className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold ${roleColors[role]}`}
                                    >
                                      {
                                        roleLabels[
                                          role
                                        ]
                                      }
                                    </span>
                                  ),
                                )
                              ) : (
                                <span className="text-xs text-gray-400">
                                  No department
                                </span>
                              )}

                            </div>

                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                admin.role ===
                                "super_admin"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {admin.role ===
                              "super_admin"
                                ? "Super Admin"
                                : "Admin"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                admin.is_active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >

                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  admin.is_active
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                              />

                              {admin.is_active
                                ? "Active"
                                : "Disabled"}

                            </span>

                          </td>

                          <td className="px-6 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                openAdmin(
                                  admin,
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-[#475569] hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                              Manage
                            </button>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

        </div>

      </main>

      {/* =================================================
          TRASH PIN MODAL
      ================================================= */}

      {showTrashPin && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">

          <div className="w-full max-w-[380px] overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="text-sm font-black text-[#172033]">
                    Set Trash PIN
                  </h2>

                  <p className="mt-0.5 text-[9px] font-medium text-[#94A3B8]">
                    Protect deleted requests
                  </p>

                </div>

              </div>

              <button
                type="button"
                disabled={
                  savingTrashPin
                }
                onClick={() =>
                  setShowTrashPin(
                    false,
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* CONTENT */}

            <div className="space-y-4 p-5">

              {/* INFO */}

              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">

                <p className="text-[9px] font-bold leading-4 text-red-700">
                  This PIN is required before
                  opening the Trash section.
                </p>

              </div>

              {/* NEW PIN */}

              <div>

                <label className="mb-1.5 block text-[10px] font-black text-[#475569]">
                  New Trash PIN
                </label>

                <div className="relative">

                  <input
                    type={
                      showTrashPinValue
                        ? "text"
                        : "password"
                    }
                    inputMode="numeric"
                    maxLength={6}
                    value={trashPin}
                    onChange={(e) =>
                      setTrashPin(
                        e.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    placeholder="Enter 4–6 digit PIN"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 pr-11 text-sm font-bold tracking-[0.25em] outline-none focus:border-[#FF5C39]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowTrashPinValue(
                        (value) =>
                          !value,
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400"
                  >
                    {showTrashPinValue ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* CONFIRM */}

              <div>

                <label className="mb-1.5 block text-[10px] font-black text-[#475569]">
                  Confirm Trash PIN
                </label>

                <input
                  type={
                    showTrashPinValue
                      ? "text"
                      : "password"
                  }
                  inputMode="numeric"
                  maxLength={6}
                  value={
                    confirmTrashPin
                  }
                  onChange={(e) =>
                    setConfirmTrashPin(
                      e.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  placeholder="Re-enter PIN"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 text-sm font-bold tracking-[0.25em] outline-none focus:border-[#FF5C39]"
                />

              </div>

              {/* ERROR */}

              {trashPinError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-600">
                  {trashPinError}
                </div>
              )}

              {/* SUCCESS */}

              {trashPinSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[10px] font-bold text-emerald-700">

                  <CheckCircle2 className="h-4 w-4 shrink-0" />

                  {trashPinSuccess}

                </div>
              )}

              {/* ACTIONS */}

              <div className="flex gap-2 pt-1">

                <button
                  type="button"
                  disabled={
                    savingTrashPin
                  }
                  onClick={() =>
                    setShowTrashPin(
                      false,
                    )
                  }
                  className="h-11 flex-1 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    savingTrashPin ||
                    trashPin.length <
                      4 ||
                    confirmTrashPin.length <
                      4
                  }
                  onClick={
                    handleSetTrashPin
                  }
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#172033] text-xs font-black text-white hover:bg-[#101827] disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {savingTrashPin ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}

                  {savingTrashPin
                    ? "Saving..."
                    : "Set PIN"}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          CREATE ADMIN MODAL
      ================================================= */}

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">

          <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[24px] bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-6">

              <div>

                <h2 className="text-lg font-black text-[#0F172A]">
                  Create Admin
                </h2>

                <p className="mt-1 text-xs text-[#64748B]">
                  Create an admin account
                  and assign departments.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  !saving &&
                  setShowCreate(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={
                handleCreateAdmin
              }
              className="space-y-5 p-4 sm:p-6"
            >

              <div>

                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Full Name
                </label>

                <input
                  value={
                    form.full_name
                  }
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        full_name:
                          e.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Enter full name"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 text-sm outline-none focus:border-[#FF5C39]"
                />

              </div>

              <div>

                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Email
                </label>

                <input
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        email:
                          e.target
                            .value,
                      }),
                    )
                  }
                  placeholder="admin@example.com"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 text-sm outline-none focus:border-[#FF5C39]"
                />

              </div>

              <div>

                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      form.password
                    }
                    onChange={(e) =>
                      setForm(
                        (current) => ({
                          ...current,
                          password:
                            e.target
                              .value,
                        }),
                      )
                    }
                    placeholder="Minimum 8 characters"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 pr-11 text-sm outline-none focus:border-[#FF5C39]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) =>
                          !value,
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* DEPARTMENTS */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-xs font-bold text-[#475569]">
                    Departments
                  </label>

                  <span className="text-[10px] font-semibold text-[#94A3B8]">
                    Select one or more
                  </span>

                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                  {(
                    Object.entries(
                      roleLabels,
                    ) as [
                      AdminRole,
                      string,
                    ][]
                  ).map(
                    ([
                      role,
                      label,
                    ]) => {

                      const checked =
                        form.admin_roles.includes(
                          role,
                        );

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setForm(
                              (
                                current,
                              ) => {

                                const exists =
                                  current.admin_roles.includes(
                                    role,
                                  );

                                const nextRoles =
                                  exists
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
                                      ];

                                return {
                                  ...current,
                                  admin_roles:
                                    nextRoles,
                                };
                              },
                            );
                          }}
                          className={`flex min-h-[48px] items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                            checked
                              ? roleColors[
                                  role
                                ]
                              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >

                          <span className="text-xs font-bold">
                            {label}
                          </span>

                          {checked ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-gray-300" />
                          )}

                        </button>
                      );
                    },
                  )}

                </div>

              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    !saving &&
                    setShowCreate(
                      false,
                    )
                  }
                  className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5C39] px-5 text-sm font-bold text-white disabled:opacity-60"
                >

                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? "Creating..."
                    : "Create Admin"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          ADMIN DETAIL DRAWER
      ================================================= */}

      {selectedAdmin && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm">

          <button
            type="button"
            aria-label="Close"
            onClick={
              closeDrawer
            }
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <aside className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[26px] bg-white shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[460px] sm:rounded-none sm:rounded-l-[24px]">

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-5">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <ShieldCheck className="h-5 w-5 text-[#FF5C39]" />
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-black text-[#0F172A]">
                    Admin Access
                  </p>

                  <p className="truncate text-xs text-[#64748B]">
                    Manage account permissions
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeDrawer
                }
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-5 p-4 sm:p-5">

              {/* PROFILE */}

              <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50">
                    <UserRound className="h-5 w-5 text-[#FF5C39]" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-base font-black text-[#0F172A]">
                      {
                        selectedAdmin.full_name
                      }
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#64748B]">
                      {
                        selectedAdmin.email
                      }
                    </p>

                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
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

              </div>

              {/* ACCOUNT ROLE */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <p className="text-sm font-black text-[#0F172A]">
                    Account Role
                  </p>

                  <span className="text-[10px] font-semibold text-[#94A3B8]">
                    System access
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handleAccountRoleChange(
                        "admin",
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-left ${
                      selectedAdmin.role ===
                      "admin"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    <p className="text-xs font-black">
                      Admin
                    </p>

                    <p className="mt-1 text-[10px] opacity-70">
                      Assigned departments
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handleAccountRoleChange(
                        "super_admin",
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-left ${
                      selectedAdmin.role ===
                      "super_admin"
                        ? "border-purple-200 bg-purple-50 text-purple-700"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    <p className="text-xs font-black">
                      Super Admin
                    </p>

                    <p className="mt-1 text-[10px] opacity-70">
                      Full admin access
                    </p>
                  </button>

                </div>

              </div>

              {/* DEPARTMENTS */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <p className="text-sm font-black text-[#0F172A]">
                    Department Access
                  </p>

                  <span className="text-[10px] font-semibold text-[#94A3B8]">
                    {
                      selectedAdmin
                        .admin_roles
                        .length
                    }{" "}
                    selected
                  </span>

                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                  {(
                    Object.entries(
                      roleLabels,
                    ) as [
                      AdminRole,
                      string,
                    ][]
                  ).map(
                    ([
                      role,
                      label,
                    ]) => {

                      const checked =
                        selectedAdmin.admin_roles.includes(
                          role,
                        );

                      return (
                        <button
                          key={role}
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            toggleDepartment(
                              role,
                            )
                          }
                          className={`flex min-h-[48px] items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                            checked
                              ? roleColors[
                                  role
                                ]
                              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >

                          <span className="text-xs font-bold">
                            {label}
                          </span>

                          {checked ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-gray-300" />
                          )}

                        </button>
                      );
                    },
                  )}

                </div>

              </div>

              {/* STATUS */}

              <div className="rounded-2xl border border-gray-100 bg-white">

                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    handleToggleStatus
                  }
                  className="flex w-full items-center justify-between p-4 text-left"
                >

                  <div className="flex items-center gap-3">

                    {selectedAdmin.is_active ? (
                      <UserCheck className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <UserX className="h-5 w-5 text-red-500" />
                    )}

                    <div>

                      <p className="text-sm font-bold text-[#0F172A]">
                        Account Status
                      </p>

                      <p className="mt-1 text-xs text-[#64748B]">
                        {selectedAdmin.is_active
                          ? "Admin can access the panel."
                          : "Admin access is disabled."}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      selectedAdmin.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {selectedAdmin.is_active
                      ? "Active"
                      : "Disabled"}
                  </span>

                </button>

              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              {/* MORE */}

              <div className="rounded-2xl border border-gray-100">

                <button
                  type="button"
                  onClick={() =>
                    setShowMore(
                      (value) =>
                        !value,
                    )
                  }
                  className="flex w-full items-center justify-between p-4"
                >

                  <div className="flex items-center gap-3">

                    <MoreVertical className="h-5 w-5 text-gray-500" />

                    <span className="text-sm font-bold text-[#0F172A]">
                      More Actions
                    </span>

                  </div>

                  <ChevronRight
                    className={`h-4 w-4 text-gray-400 transition ${
                      showMore
                        ? "rotate-90"
                        : ""
                    }`}
                  />

                </button>

                {showMore && (
                  <div className="border-t border-gray-100 p-3">

                    <button
                      type="button"
                      disabled={saving}
                      onClick={
                        handleDeleteAdmin
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-600 hover:bg-red-50"
                    >

                      <Trash2 className="h-4 w-4" />

                      <div>

                        <p className="text-xs font-bold">
                          Delete Admin
                        </p>

                        <p className="mt-0.5 text-[10px] opacity-70">
                          Permanently remove this account
                        </p>

                      </div>

                    </button>

                  </div>
                )}

              </div>

            </div>

          </aside>

        </div>
      )}

    </div>
  );
}