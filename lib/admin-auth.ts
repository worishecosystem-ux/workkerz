import { supabase } from "@/lib/supabase";


// ============================================================
// TYPES
// ============================================================

export type AdminRole =
  | "super_admin"
  | "admin";

export type AdminProfile = {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};


// ============================================================
// GET CURRENT ADMIN
// ============================================================

export async function getCurrentAdmin(): Promise<AdminProfile | null> {
  try {
    // Get currently logged-in Supabase user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Get admin profile
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Admin profile error:",
        profileError,
      );

      return null;
    }

    if (!profile) {
      return null;
    }

    // Check whether admin is active
    if (!profile.is_active) {
      return null;
    }

    return profile as AdminProfile;
  } catch (error) {
    console.error(
      "getCurrentAdmin error:",
      error,
    );

    return null;
  }
}


// ============================================================
// CHECK ADMIN LOGIN
// ============================================================

export async function isAdminLoggedIn(): Promise<boolean> {
  const admin = await getCurrentAdmin();

  return admin !== null;
}


// ============================================================
// CHECK SUPER ADMIN
// ============================================================

export async function isSuperAdmin(): Promise<boolean> {
  const admin = await getCurrentAdmin();

  return admin?.role === "super_admin";
}


// ============================================================
// CHECK ADMIN ROLE
// ============================================================

export async function hasAdminRole(
  role: AdminRole,
): Promise<boolean> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return false;
  }

  return admin.role === role;
}


// ============================================================
// SIGN OUT
// ============================================================

export async function adminLogout(): Promise<void> {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    console.error(
      "Admin logout error:",
      error,
    );

    throw error;
  }
}