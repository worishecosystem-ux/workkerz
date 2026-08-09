"use client";

import {
  CalendarDays,
  Check,
  Copy,
  IndianRupee,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export interface OrderItem {
  id: string;
  order_id?: string;

  product_id?: string;
  product_name?: string;
  product_image?: string;

  price?: number;
  qty?: number;
  quantity?: number;
  unit?: string;
}

export interface Order {
  id: string;

  /* Actual database order number */
  order_number?: string;

  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;

  /* Actual database status */
  status?: string;

  total_amount?: number;
  grand_total?: number;
  total?: number;
  subtotal?: number;
  delivery?: number;
  tax?: number;

  product_name?: string;
  product_image?: string;

  address?: string;
  full_address?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
  landmark?: string;

  delivery_option?: string;
  delivery_slot?: string;

  payment_method?: string;
  payment_status?: string;

  rejection_reason?: string;

  created_at: string;
  updated_at?: string;

  items?: OrderItem[];
}

interface OrderDetailsProps {
  order: Order;
  items: OrderItem[];
  loadingItems?: boolean;
  onClose: () => void;
}

/* =========================================================
   CONSTANTS
========================================================= */

const DELIVERY_DAYS = 3;

/* =========================================================
   HELPERS
========================================================= */

function getOrderNumber(order: Order) {
  return (
    order.order_number ||
    "Order ID unavailable"
  );
}

function getStatus(order: Order) {
  return (
    order.status ||
    "pending"
  )
    .toLowerCase()
    .trim();
}

function getAmount(order: Order) {
  return (
    order.grand_total ??
    order.total_amount ??
    order.total ??
    0
  );
}

function isCancelled(status: string) {
  return (
    status === "cancelled" ||
    status === "rejected"
  );
}

/* =========================================================
   STATUS
========================================================= */

function getStatusInfo(status: string) {
  switch (status) {
    case "accepted":
    case "confirmed":
      return {
        label: "Confirmed",
        description:
          "Your order has been confirmed",
        color:
          "text-blue-700",
        bg:
          "bg-blue-50",
        border:
          "border-blue-100",
        dot:
          "bg-blue-500",
      };

    case "preparing":
    case "processing":
      return {
        label: "Preparing",
        description:
          "Your order is being prepared",
        color:
          "text-amber-700",
        bg:
          "bg-amber-50",
        border:
          "border-amber-100",
        dot:
          "bg-amber-500",
      };

    case "ready":
      return {
        label: "Ready to Ship",
        description:
          "Your order is ready for dispatch",
        color:
          "text-violet-700",
        bg:
          "bg-violet-50",
        border:
          "border-violet-100",
        dot:
          "bg-violet-500",
      };

    case "shipped":
      return {
        label: "Shipped",
        description:
          "Your order is on the way",
        color:
          "text-indigo-700",
        bg:
          "bg-indigo-50",
        border:
          "border-indigo-100",
        dot:
          "bg-indigo-500",
      };

    case "out_for_delivery":
      return {
        label: "Out for Delivery",
        description:
          "Your order is arriving today",
        color:
          "text-orange-700",
        bg:
          "bg-orange-50",
        border:
          "border-orange-100",
        dot:
          "bg-orange-500",
      };

    case "delivered":
    case "completed":
      return {
        label: "Delivered",
        description:
          "Your order has been delivered",
        color:
          "text-emerald-700",
        bg:
          "bg-emerald-50",
        border:
          "border-emerald-100",
        dot:
          "bg-emerald-500",
      };

    case "rejected":
      return {
        label: "Rejected",
        description:
          "This order was rejected",
        color:
          "text-red-700",
        bg:
          "bg-red-50",
        border:
          "border-red-100",
        dot:
          "bg-red-500",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        description:
          "This order has been cancelled",
        color:
          "text-red-700",
        bg:
          "bg-red-50",
        border:
          "border-red-100",
        dot:
          "bg-red-500",
      };

    default:
      return {
        label: "Order Placed",
        description:
          "We have received your order",
        color:
          "text-slate-700",
        bg:
          "bg-slate-50",
        border:
          "border-slate-100",
        dot:
          "bg-slate-500",
      };
  }
}

/* =========================================================
   EXPECTED DELIVERY
========================================================= */

function getExpectedDelivery(
  order: Order
) {
  const status =
    getStatus(order);

  if (isCancelled(status)) {
    return null;
  }

  if (
    status === "delivered" ||
    status === "completed"
  ) {
    return order.updated_at
      ? new Date(order.updated_at)
      : new Date(order.created_at);
  }

  const date = new Date(
    order.created_at
  );

  date.setDate(
    date.getDate() +
      DELIVERY_DAYS
  );

  return date;
}

function formatDeliveryDate(
  date: Date | null
) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "short",
    }
  );
}

function getDeliveryText(
  order: Order
) {
  const status =
    getStatus(order);

  if (
    status === "delivered" ||
    status === "completed"
  ) {
    const date =
      getExpectedDelivery(order);

    return date
      ? `Delivered on ${formatDeliveryDate(date)}`
      : "Order delivered";
  }

  if (
    status === "out_for_delivery"
  ) {
    return "Arriving today";
  }

  const date =
    getExpectedDelivery(order);

  if (date) {
    return `Arriving by ${formatDeliveryDate(date)}`;
  }

  return "Delivery date will be updated soon";
}

/* =========================================================
   ADDRESS
========================================================= */

function getAddress(
  order: Order
) {
  return (
    order.full_address ||
    order.address ||
    ""
  );
}

function getLocation(
  order: Order
) {
  return [
    order.city,
    order.district,
    order.state,
    order.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OrderDetails({
  order,
  items,
  loadingItems = false,
  onClose,
}: OrderDetailsProps) {
  const status =
    getStatus(order);

  const statusInfo =
    getStatusInfo(status);

  const orderNumber =
    getOrderNumber(order);

  const amount =
    getAmount(order);

  const deliveryDate =
    getExpectedDelivery(order);

  const cancelled =
    isCancelled(status);

  const address =
    getAddress(order);

  const location =
    getLocation(order);

  async function copyOrderId() {
    try {
      await navigator.clipboard.writeText(
        orderNumber
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[24px] bg-[#f7f8fa] shadow-2xl sm:max-w-lg sm:rounded-[24px]"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0 border-b border-slate-200 bg-white">

          <div className="flex items-center justify-between px-4 py-3">

            <div className="flex min-w-0 items-center gap-2.5">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
              </div>

              <div className="min-w-0">

                <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Order Details
                </p>

                <p className="mt-0.5 truncate text-[12px] font-bold text-slate-900">
                  #{orderNumber}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>

          </div>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto">

          <div className="space-y-2.5 p-3">

            {/* =================================================
                DELIVERY / STATUS HERO
            ================================================= */}

            <div
              className={`overflow-hidden rounded-2xl border ${statusInfo.border} ${statusInfo.bg}`}
            >

              {/* STATUS */}

              <div className="flex items-center gap-3 px-3.5 py-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

                  {status ===
                    "delivered" ||
                  status ===
                    "completed" ? (
                    <Check className="h-5 w-5 text-emerald-600" />
                  ) : status ===
                    "out_for_delivery" ||
                    status ===
                      "shipped" ? (
                    <Truck className="h-5 w-5 text-indigo-600" />
                  ) : cancelled ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Package className="h-5 w-5 text-emerald-600" />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-1.5">

                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
                    />

                    <p
                      className={`text-[9px] font-bold uppercase tracking-wide ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </p>

                  </div>

                  <p className="mt-0.5 text-[11px] font-semibold text-slate-900">
                    {statusInfo.description}
                  </p>

                </div>

              </div>

              {/* EXPECTED DELIVERY */}

              {!cancelled && (
                <div className="border-t border-black/5 bg-white/70 px-3.5 py-3">

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                      <Truck className="h-4 w-4 text-emerald-700" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {status ===
                            "delivered" ||
                          status ===
                            "completed"
                          ? "Delivery completed"
                          : "Expected delivery"}
                      </p>

                      <p className="mt-0.5 text-[12px] font-extrabold text-slate-900">
                        {getDeliveryText(
                          order
                        )}
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                CANCELLED / REJECTED
            ================================================= */}

            {cancelled && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">

                <div className="flex items-center gap-2">

                  <XCircle className="h-4 w-4 shrink-0 text-red-600" />

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold text-red-700">
                      {status ===
                      "rejected"
                        ? "Order Rejected"
                        : "Order Cancelled"}
                    </p>

                    {order.rejection_reason && (
                      <p className="mt-0.5 text-[8px] leading-4 text-red-500">
                        {
                          order.rejection_reason
                        }
                      </p>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                ORDER INFORMATION
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">

                <div>

                  <p className="text-[10px] font-bold text-slate-900">
                    Order Information
                  </p>

                  <p className="text-[8px] text-slate-400">
                    Order number and purchase date
                  </p>

                </div>

                <Package className="h-4 w-4 text-emerald-600" />

              </div>

              <div className="grid grid-cols-2">

                {/* ORDER NUMBER */}

                <div className="border-r border-slate-100 p-3">

                  <p className="text-[7px] font-semibold uppercase tracking-wider text-slate-400">
                    Order ID
                  </p>

                  <div className="mt-1 flex items-center gap-1">

                    <p className="min-w-0 truncate text-[10px] font-bold text-slate-800">
                      #{orderNumber}
                    </p>

                    <button
                      type="button"
                      onClick={
                        copyOrderId
                      }
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                      title="Copy Order ID"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </button>

                  </div>

                </div>

                {/* DATE */}

                <div className="p-3">

                  <p className="text-[7px] font-semibold uppercase tracking-wider text-slate-400">
                    Order Date
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">

                    <CalendarDays className="h-3 w-3 text-emerald-600" />

                    <p className="text-[10px] font-semibold text-slate-800">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ITEMS
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">

                <div>

                  <p className="text-[10px] font-bold text-slate-900">
                    Order Items
                  </p>

                  <p className="text-[8px] text-slate-400">
                    {items.length} item
                    {items.length !==
                    1
                      ? "s"
                      : ""}
                  </p>

                </div>

                <ShoppingBag className="h-4 w-4 text-emerald-600" />

              </div>

              <div className="p-2.5">

                {loadingItems ? (
                  <div className="space-y-2">

                    {Array.from({
                      length: 2,
                    }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="flex animate-pulse items-center gap-2 rounded-lg bg-slate-50 p-2"
                        >

                          <div className="h-11 w-11 rounded-lg bg-slate-200" />

                          <div className="flex-1">

                            <div className="h-3 w-32 rounded bg-slate-200" />

                            <div className="mt-1.5 h-2 w-16 rounded bg-slate-200" />

                          </div>

                          <div className="h-3 w-12 rounded bg-slate-200" />

                        </div>
                      )
                    )}

                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-1.5">

                    {items.map(
                      (
                        item,
                        index
                      ) => {

                        const quantity =
                          item.qty ??
                          item.quantity ??
                          1;

                        const price =
                          Number(
                            item.price ??
                              0
                          );

                        const itemTotal =
                          price *
                          Number(
                            quantity
                          );

                        return (
                          <div
                            key={
                              item.id ||
                              `${item.product_name}-${index}`
                            }
                            className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/80 p-2"
                          >

                            {/* IMAGE */}

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">

                              {item.product_image ? (
                                <img
                                  src={
                                    item.product_image
                                  }
                                  alt={
                                    item.product_name ||
                                    "Product"
                                  }
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-slate-300" />
                              )}

                            </div>

                            {/* NAME */}

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-[10px] font-semibold text-slate-800">
                                {item.product_name ||
                                  "Material"}
                              </p>

                              <p className="mt-0.5 text-[8px] text-slate-500">
                                Qty:{" "}
                                {quantity}

                                {item.unit &&
                                  ` • ${item.unit}`}
                              </p>

                              <p className="mt-0.5 text-[7px] text-slate-400">
                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                / unit
                              </p>

                            </div>

                            {/* PRICE */}

                            <div className="shrink-0 text-right">

                              <p className="text-[10px] font-bold text-slate-800">
                                ₹
                                {itemTotal.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 px-3 py-5 text-center">

                    <Package className="mx-auto h-5 w-5 text-slate-300" />

                    <p className="mt-1 text-[9px] text-slate-500">
                      Item details unavailable
                    </p>

                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            {(
              address ||
              location ||
              order.landmark
            ) && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                <div className="flex items-center gap-2.5 border-b border-slate-100 px-3 py-2.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold text-slate-900">
                      Delivery Address
                    </p>

                    <p className="text-[8px] text-slate-400">
                      Your order will be delivered here
                    </p>

                  </div>

                </div>

                <div className="px-3 py-2.5">

                  {address && (
                    <p className="text-[10px] font-semibold leading-5 text-slate-700">
                      {address}
                    </p>
                  )}

                  {location && (
                    <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                      {location}
                    </p>
                  )}

                  {order.landmark && (
                    <p className="mt-0.5 text-[8px] text-slate-400">
                      Landmark:{" "}
                      {order.landmark}
                    </p>
                  )}

                </div>

              </div>
            )}

            {/* =================================================
                PAYMENT + TOTAL
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="border-b border-slate-100 px-3 py-2.5">

                <p className="text-[10px] font-bold text-slate-900">
                  Payment Summary
                </p>

              </div>

              <div className="space-y-2 px-3 py-3">

                {order.subtotal != null && (
                  <div className="flex items-center justify-between">

                    <span className="text-[9px] text-slate-500">
                      Subtotal
                    </span>

                    <span className="text-[9px] font-semibold text-slate-700">
                      ₹
                      {Number(
                        order.subtotal
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>
                )}

                {order.delivery != null && (
                  <div className="flex items-center justify-between">

                    <span className="text-[9px] text-slate-500">
                      Delivery
                    </span>

                    <span className="text-[9px] font-semibold text-slate-700">
                      {Number(
                        order.delivery
                      ) === 0
                        ? "FREE"
                        : `₹${Number(
                            order.delivery
                          ).toLocaleString(
                            "en-IN"
                          )}`}
                    </span>

                  </div>
                )}

                {order.tax != null && (
                  <div className="flex items-center justify-between">

                    <span className="text-[9px] text-slate-500">
                      Tax
                    </span>

                    <span className="text-[9px] font-semibold text-slate-700">
                      ₹
                      {Number(
                        order.tax
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>
                )}

                <div className="border-t border-slate-100 pt-2">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-bold text-slate-900">
                        Order Total
                      </p>

                      {order.payment_method && (
                        <p className="mt-0.5 text-[7px] text-slate-400">
                          Payment:{" "}
                          {
                            order.payment_method
                          }
                        </p>
                      )}

                    </div>

                    <div className="flex items-center">

                      <IndianRupee className="h-3.5 w-3.5 text-emerald-700" />

                      <span className="text-[16px] font-extrabold text-emerald-700">
                        {Number(
                          amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                CLOSE
            ================================================= */}

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 text-[10px] font-bold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.98]"
            >
              Close Details
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}