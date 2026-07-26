"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Pencil,
  Loader2,
  Trash2,
  LogOut,
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [editing, setEditing] = useState(false);
  const updateProfile = (field: "full_name" | "phone", value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  async function saveProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("customer_profiles").upsert(
      {
        customer_email: user.email,
        customer_name: profile.full_name,
        customer_phone: profile.phone,
      },
      {
        onConflict: "customer_email",
      },
    );

    setLoading(false);

    if (error) {
      setDialog({
        open: true,
        title: "Update Failed",
        message: error.message,
        type: "error",
      });
      return;
    }

    setEditing(false);

    setDialog({
      open: true,
      title: "Profile Updated",
      message: "Your profile has been updated successfully.",
      type: "success",
    });
  }
  async function handleDeleteAccount() {
    const ok = window.confirm(
      "Are you sure? This will permanently delete your Workkerz account.",
    );

    if (!ok) return;

    setDeleting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unable to delete account.");
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();

      window.location.href = "/";
    } catch {
      alert("Something went wrong.");
    }

    setDeleting(false);
  }
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    created_at: "",
    avatar_url: "",
  });
  useEffect(() => {
    setImageError(false);
  }, [profile.avatar_url]);
  useEffect(() => {
    loadProfile();
  }, []);
  type DialogState = {
    open: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
    onConfirm?: () => void;
  };

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    title: "",
    message: "",
    type: "success",
  });
  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Customer Profile
    // Customer Profile
    const { data: customerProfile } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("customer_email", user.email)
      .maybeSingle();

    // Last booking fallback
    const { data: lastBooking } = await supabase
      .from("bookings")
      .select("customer_phone")
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setProfile({
      full_name:
        customerProfile?.customer_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "",

      email: customerProfile?.customer_email || user.email || "",

      phone:
        customerProfile?.customer_phone ||
        lastBooking?.customer_phone ||
        user.phone ||
        "",

      created_at: user.created_at || "",

      avatar_url:
        user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
      </div>
    );
  }
  const hasAvatar =
    profile.avatar_url &&
    profile.avatar_url.trim() !== "" &&
    profile.avatar_url !== "null" &&
    profile.avatar_url !== "undefined" &&
    !imageError;
  return (
    <main className="min-h-screen bg-slate-50 pb-4">
      {dialog.open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setDialog((d) => ({ ...d, open: false }))}
          />

          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                dialog.type === "success"
                  ? "bg-emerald-100"
                  : dialog.type === "error"
                    ? "bg-red-100"
                    : "bg-amber-100"
              }`}
            >
              {dialog.type === "success" && (
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
              )}

              {dialog.type === "error" && (
                <Trash2 className="h-7 w-7 text-red-600" />
              )}

              {dialog.type === "warning" && (
                <Trash2 className="h-7 w-7 text-amber-600" />
              )}
            </div>

            <h3 className="text-center text-lg font-bold text-slate-900">
              {dialog.title}
            </h3>

            <p className="mt-2 text-center text-sm text-slate-500">
              {dialog.message}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDialog((d) => ({ ...d, open: false }))}
                className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold"
              >
                Close
              </button>

              {dialog.onConfirm && (
                <button
                  onClick={dialog.onConfirm}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </>
      )}
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-green-600 px-5 pt-12 pb-8 rounded-b-3xl text-white">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-white/30 bg-white/20 p-1">
              {hasAvatar ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Profile"}
                  className="h-full w-full rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white/20">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
          </div>
          <h1 className="mt-4 text-xl font-bold">
            {profile.full_name || "User"}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Personal */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <SectionTitle title="Personal Information" />

          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <User className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="flex-1">
              <p className="text-[11px] text-slate-500">Full Name</p>

              {editing ? (
                <input
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      full_name: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {profile.full_name || "Not Added"}
                </p>
              )}
            </div>
          </div>
          <InfoRow
            icon={<Mail className="h-5 w-5 text-blue-600" />}
            title="Email"
            value={profile.email}
          />

          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Phone className="h-4 w-4 text-orange-500" />
            </div>

            <div className="flex-1">
              <p className="text-[11px] text-slate-500">Phone</p>

              {editing ? (
                <input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {profile.phone || "Not Added"}
                </p>
              )}
            </div>
          </div>

          <InfoRow
            icon={<Calendar className="h-5 w-5 text-purple-600" />}
            title="Joined"
            value={
              profile.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "-"
            }
          />
        </div>

        {/* Account */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <SectionTitle title="Account" />

          <InfoRow
            icon={<ShieldCheck className="h-5 w-5 text-green-600" />}
            title="Account Status"
            value="Verified"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Edit */}
          <button
            onClick={() => {
              if (editing) {
                saveProfile();
              } else {
                setEditing(true);
              }
            }}
            className="h-12 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading && editing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}

            {editing ? "Save" : "Edit"}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="h-12 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Delete Account */}
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="mt-3 w-full h-12 rounded-xl border border-red-300 bg-red-50 text-red-600 font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}

          {deleting ? "Deleting..." : "Delete Account"}
        </button>

        <p className="text-xs text-center text-slate-500">
          Deleting your account permanently removes your Workkerz account and
          cannot be undone.
        </p>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="px-4 py-4 border-b bg-slate-50">
      <h2 className="text-xs font-semibold text-slate-700">{title}</h2>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-500">{title}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
