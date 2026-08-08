export type AdminRole =
  | "super_admin"
  | "admin";

export type AdminModule =
  | "dashboard"
  | "workers"
  | "orders"
  | "shops"
  | "bookings"
  | "admins";

export type AdminSubRole =
  | "worker_admin"
  | "order_admin"
  | "shop_admin"
  | "booking_admin";

export const ROLE_MODULES: Record<
  AdminSubRole,
  AdminModule[]
> = {
  worker_admin: [
    "dashboard",
    "workers",
  ],

  order_admin: [
    "dashboard",
    "orders",
  ],

  shop_admin: [
    "dashboard",
    "shops",
  ],

  booking_admin: [
    "dashboard",
    "bookings",
  ],
};

export function canAccessModule(
  profileRole: AdminRole,
  assignedRoles: AdminSubRole[],
  module: AdminModule,
) {
  // Super Admin → everything
  if (profileRole === "super_admin") {
    return true;
  }

  // Normal admin → check assigned role
  return assignedRoles.some((role) =>
    ROLE_MODULES[role]?.includes(module),
  );
}