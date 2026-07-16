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
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    created_at: "",
    avatar_url: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setProfile({
      full_name:
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      email: user.email || "",
      phone: user.phone || "",
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-green-600 px-5 pt-12 pb-8 rounded-b-3xl text-white">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-white/30 bg-white/20 p-1">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Profile"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white/20">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
          </div>

          <h1 className="mt-4 text-xl font-bold">
            {profile.full_name || "User"}
          </h1>

          <p className="text-sm text-white/80">{profile.email}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Personal */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <SectionTitle title="Personal Information" />

          <InfoRow
            icon={<User className="h-5 w-5 text-emerald-600" />}
            title="Full Name"
            value={profile.full_name || "Not Added"}
          />

          <InfoRow
            icon={<Mail className="h-5 w-5 text-blue-600" />}
            title="Email"
            value={profile.email}
          />

          <InfoRow
            icon={<Phone className="h-5 w-5 text-orange-500" />}
            title="Phone"
            value={profile.phone || "Not Added"}
          />

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

        {/* Edit Button */}
        <button className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98]">
          <Pencil className="h-4 w-4" />
          Edit Profile
        </button>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="px-4 py-3 border-b bg-slate-50">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
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
    <div className="flex items-center gap-3 px-4 py-4 border-b last:border-0">
      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-xs text-slate-500">{title}</p>
        <p className="font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}
