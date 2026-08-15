export type AdminRole =
  | "super_admin"
  | "admin";

export type AdminModule =
  | "dashboard"
  | "workers"
  | "worker_requests"
  | "orders"
  | "shops"
  | "bookings"
  | "marketing"
  | "admins";

export type AdminSubRole =
  | "worker_admin"
  | "worker_request_admin"
  | "order_admin"
  | "shop_admin"
  | "booking_admin"
  | "marketing_admin";

export const ROLE_MODULES: Record<
  AdminSubRole,
  AdminModule[]
> = {
  worker_admin: [
    "dashboard",
    "workers",
  ],

  worker_request_admin: [
    "dashboard",
    "worker_requests",
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

  marketing_admin: [
    "dashboard",
    "marketing",
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

  // Normal Admin → assigned modules only
  return assignedRoles.some((role) =>
    ROLE_MODULES[role]?.includes(module),
  );
}